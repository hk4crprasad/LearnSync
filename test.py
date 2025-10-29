import os
import json
import base64
import asyncio
import websockets
from fastapi import FastAPI, WebSocket, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.websockets import WebSocketDisconnect
from twilio.twiml.voice_response import VoiceResponse, Connect, Say, Stream
from dotenv import load_dotenv

load_dotenv()

# Configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyD4v0s6N2_R2QOAntBZFz1qMnqE8nxoJAU')
PORT = int(os.getenv('PORT', 5050))
SYSTEM_MESSAGE = (
    "You are a helpful and bubbly AI assistant who loves to chat about "
    "anything the user is interested in and is prepared to offer them facts. "
    "You have a penchant for dad jokes, owl jokes, and rickrolling – subtly. "
    "Always stay positive, but work in a joke when appropriate."
)
# Available voices: Puck, Charon, Kore, Fenrir, Aoede (30+ HD voices in 24 languages)
VOICE = 'Puck'
LOG_EVENT_TYPES = [
    'setupComplete', 'interrupted', 'toolCall', 'toolCallCancellation',
    'serverContent', 'turnComplete'
]
SHOW_TIMING_MATH = False

app = FastAPI()

if not GEMINI_API_KEY:
    raise ValueError('Missing the Gemini API key. Please set it in the .env file.')

@app.get("/", response_class=JSONResponse)
async def index_page():
    return {"message": "Twilio Media Stream Server with Gemini 2.5 Flash Native Audio is running!"}

@app.api_route("/incoming-call", methods=["GET", "POST"])
async def handle_incoming_call(request: Request):
    """Handle incoming call and return TwiML response to connect to Media Stream."""
    response = VoiceResponse()
    response.say(
        "Please wait while we connect your call to the A. I. voice assistant, powered by Twilio and Google Gemini 2.5",
        voice="Google.en-US-Chirp3-HD-Aoede"
    )
    response.pause(length=1)
    response.say(   
        "O.K. you can start talking!",
        voice="Google.en-US-Chirp3-HD-Aoede"
    )
    host = request.url.hostname
    connect = Connect()
    connect.stream(url=f'wss://{host}/media-stream')
    response.append(connect)
    return HTMLResponse(content=str(response), media_type="application/xml")

@app.websocket("/media-stream")
async def handle_media_stream(websocket: WebSocket):
    """Handle WebSocket connections between Twilio and Gemini Live API."""
    print("Client connected")
    await websocket.accept()

    # Gemini Live API WebSocket URL with the native audio model
    gemini_url = f"wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key={GEMINI_API_KEY}"

    async with websockets.connect(gemini_url) as gemini_ws:
        await initialize_session(gemini_ws)

        # Connection specific state
        stream_sid = None
        latest_media_timestamp = 0
        response_start_timestamp_twilio = None
        mark_queue = []
        
        async def receive_from_twilio():
            """Receive audio data from Twilio and send it to Gemini Live API."""
            nonlocal stream_sid, latest_media_timestamp
            try:
                async for message in websocket.iter_text():
                    data = json.loads(message)
                    
                    if data['event'] == 'media':
                        latest_media_timestamp = int(data['media']['timestamp'])
                        
                        # Twilio sends mulaw audio at 8kHz, we need to send it to Gemini
                        # Gemini expects PCM16 at 16kHz
                        audio_payload = data['media']['payload']
                        
                        # Send audio to Gemini as realtimeInput
                        audio_message = {
                            "realtimeInput": {
                                "mediaChunks": [{
                                    "mimeType": "audio/pcm;rate=8000",
                                    "data": audio_payload
                                }]
                            }
                        }
                        await gemini_ws.send(json.dumps(audio_message))
                        
                    elif data['event'] == 'start':
                        stream_sid = data['start']['streamSid']
                        print(f"Incoming stream has started {stream_sid}")
                        response_start_timestamp_twilio = None
                        latest_media_timestamp = 0
                        
                    elif data['event'] == 'mark':
                        if mark_queue:
                            mark_queue.pop(0)
                            
            except WebSocketDisconnect:
                print("Client disconnected.")
                if not gemini_ws.closed:
                    await gemini_ws.close()

        async def send_to_twilio():
            """Receive events from Gemini Live API, send audio back to Twilio."""
            nonlocal stream_sid, response_start_timestamp_twilio
            try:
                async for gemini_message in gemini_ws:
                    response = json.loads(gemini_message)
                    
                    # Log specific event types
                    if any(event_type in str(response) for event_type in LOG_EVENT_TYPES):
                        print(f"Received event: {json.dumps(response, indent=2)}")

                    # Handle setup completion
                    if 'setupComplete' in response:
                        print("Gemini session setup complete")
                        continue

                    # Handle server content (audio output from Gemini)
                    if 'serverContent' in response:
                        server_content = response['serverContent']
                        
                        # Check for audio data in model turn
                        if 'modelTurn' in server_content:
                            model_turn = server_content['modelTurn']
                            
                            if 'parts' in model_turn:
                                for part in model_turn['parts']:
                                    # Handle inline audio data
                                    if 'inlineData' in part:
                                        inline_data = part['inlineData']
                                        if 'data' in inline_data:
                                            # Gemini sends PCM16 at 24kHz
                                            # We need to send it to Twilio (which expects mulaw at 8kHz)
                                            audio_data = inline_data['data']
                                            
                                            audio_delta = {
                                                "event": "media",
                                                "streamSid": stream_sid,
                                                "media": {
                                                    "payload": audio_data
                                                }
                                            }
                                            await websocket.send_json(audio_delta)

                                            if response_start_timestamp_twilio is None:
                                                response_start_timestamp_twilio = latest_media_timestamp
                                                if SHOW_TIMING_MATH:
                                                    print(f"Setting start timestamp: {response_start_timestamp_twilio}ms")

                                            await send_mark(websocket, stream_sid)
                        
                        # Check for turn complete
                        if server_content.get('turnComplete'):
                            print("Turn complete")
                            response_start_timestamp_twilio = None

                    # Handle interruption
                    if 'interrupted' in response:
                        print("Speech interrupted")
                        await handle_interruption()
                        
            except Exception as e:
                print(f"Error in send_to_twilio: {e}")

        async def handle_interruption():
            """Handle interruption when caller speaks."""
            nonlocal response_start_timestamp_twilio
            print("Handling interruption")
            
            # Clear Twilio's audio buffer
            await websocket.send_json({
                "event": "clear",
                "streamSid": stream_sid
            })

            mark_queue.clear()
            response_start_timestamp_twilio = None

        async def send_mark(connection, stream_sid):
            """Send mark event to track audio playback."""
            if stream_sid:
                mark_event = {
                    "event": "mark",
                    "streamSid": stream_sid,
                    "mark": {"name": "responsePart"}
                }
                await connection.send_json(mark_event)
                mark_queue.append('responsePart')

        await asyncio.gather(receive_from_twilio(), send_to_twilio())

async def send_initial_conversation(gemini_ws):
    """Send initial conversation to have AI speak first."""
    initial_message = {
        "clientContent": {
            "turns": [{
                "role": "user",
                "parts": [{
                    "text": "Greet the user with 'Hello there! I am an AI voice assistant powered by Twilio and Google Gemini 2.5. You can ask me for facts, jokes, or anything you can imagine. How can I help you?'"
                }]
            }],
            "turnComplete": True
        }
    }
    await gemini_ws.send(json.dumps(initial_message))

async def initialize_session(gemini_ws):
    """Initialize session with Gemini Live API using native audio model."""
    
    # Setup message for gemini-2.5-flash-native-audio-preview-09-2025
    setup_message = {
        "setup": {
            "model": "models/gemini-2.5-flash-native-audio-preview-09-2025",
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {
                    "voiceConfig": {
                        "prebuiltVoiceConfig": {
                            "voiceName": VOICE
                        }
                    }
                }
            },
            "systemInstruction": {
                "parts": [{
                    "text": SYSTEM_MESSAGE
                }]
            },
            # Enable transcription for debugging (optional)
            # "inputAudioTranscription": {},
            # "outputAudioTranscription": {}
        }
    }
    
    print('Sending setup message to Gemini:', json.dumps(setup_message, indent=2))
    await gemini_ws.send(json.dumps(setup_message))
    
    # Wait for setup completion
    setup_response = await gemini_ws.recv()
    print(f"Received setup response: {setup_response}")
    
    # Uncomment to have AI speak first
    # await send_initial_conversation(gemini_ws)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)