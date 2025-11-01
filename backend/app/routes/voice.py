import os
import json
import base64
import asyncio
import websockets
from fastapi import WebSocket, Request, APIRouter
from fastapi.responses import HTMLResponse
from fastapi.websockets import WebSocketDisconnect
from twilio.twiml.voice_response import VoiceResponse, Connect, Hangup
from config import settings

router = APIRouter(prefix="/api/voice", tags=["Voice Assistant"])

# Configuration
TEMPERATURE = 0.8
SYSTEM_MESSAGE = """
You are an AI tutor and learning assistant for LearnSync, an educational platform.
You help students with their studies, answer academic questions, explain concepts,
and provide educational guidance. You are patient, encouraging, and adapt your
explanations to the student's level. You can help with:
- Math, Science, and other subjects
- Homework help and concept explanations
- Study tips and learning strategies
- Exam preparation guidance

Always be supportive and make learning engaging and fun!

IMPORTANT: If the user says they want to end the call (phrases like "cut the call", "end call", 
"hang up", "goodbye", "bye bye", "disconnect", "end this", "stop the call", etc.), 
respond with EXACTLY this phrase: "CALL_END_REQUESTED" and then say a brief goodbye. 
This will trigger the call to disconnect.
"""
VOICE = 'alloy'
# Keywords that indicate user wants to end the call
CALL_END_KEYWORDS = [
    'cut the call', 'cut call', 'end call', 'end the call', 'hang up', 
    'disconnect', 'bye', 'goodbye', 'bye bye', 'stop call', 'stop the call',
    'off call', 'end this call', 'finish call', 'terminate call'
]
LOG_EVENT_TYPES = [
    'error', 'response.content.done', 'rate_limits.updated',
    'response.done', 'input_audio_buffer.committed',
    'input_audio_buffer.speech_stopped', 'input_audio_buffer.speech_started',
    'session.created', 'session.updated'
]
SHOW_TIMING_MATH = False


@router.get("/")
async def voice_status():
    """Voice assistant status endpoint"""
    return {
        "message": "LearnSync Voice Assistant is running!",
        "status": "active",
        "features": ["Twilio Integration", "OpenAI Realtime API", "Educational Tutoring"],
        "endpoints": {
            "status": "/api/voice/",
            "incoming_call": "/api/voice/incoming-call",
            "media_stream": "/api/voice/media-stream (WebSocket)",
            "realtime": "/api/voice/realtime (WebSocket)"
        }
    }


@router.get("/test-realtime")
async def test_realtime():
    """Test endpoint to verify realtime route is accessible"""
    return {
        "message": "Realtime WebSocket endpoint is available",
        "websocket_url": "wss://bput-api.tecosys.ai/api/voice/realtime",
        "note": "Connect using WebSocket protocol, not HTTP"
    }


@router.api_route("/incoming-call", methods=["GET", "POST"])
async def handle_incoming_call(request: Request):
    """Handle incoming call and return TwiML response to connect to Media Stream."""
    response = VoiceResponse()
    
    # Welcome message
    response.say(
        "Welcome to LearnSync, your AI learning assistant. "
        "Please wait while we connect you to your personal AI tutor.",
        voice="Google.en-US-Chirp3-HD-Aoede"
    )
    response.pause(length=1)
    response.say(
        "You can now ask me any question about your studies. "
        "Press the star or hash key at any time to end the call. "
        "How can I help you learn today?",
        voice="Google.en-US-Chirp3-HD-Aoede"
    )
    
    # Get the host from request
    host = request.url.hostname
    
    # Connect to WebSocket for media streaming
    connect = Connect()
    connect.stream(url=f'wss://{host}/api/voice/media-stream')
    response.append(connect)
    
    return HTMLResponse(content=str(response), media_type="application/xml")


@router.websocket("/media-stream")
async def handle_media_stream(websocket: WebSocket):
    """Handle WebSocket connections between Twilio and Azure OpenAI."""
    print("📞 Voice call connected")
    await websocket.accept()

    # Azure OpenAI Realtime API endpoint (use configured endpoint to avoid redirects)
    # settings.AZURE_OPENAI_ENDPOINT should be the host (e.g. "your-resource-name.cognitiveservices.azure.com")
    azure_ws_url = f"wss://tecoss.openai.azure.com/openai/v1/realtime?model=gpt-realtime&temperature={TEMPERATURE}"

    async with websockets.connect(
        azure_ws_url,
        additional_headers={
            # Azure OpenAI requires the api-key header for most realtime websocket connections
            "api-key": settings.AZURE_OPENAI_API_KEY
        }
    ) as openai_ws:
        await initialize_session(openai_ws)

        # Connection specific state
        stream_sid = None
        latest_media_timestamp = 0
        last_assistant_item = None
        mark_queue = []
        response_start_timestamp_twilio = None
        call_should_end = False
        hangup_initiated = False

        def log_hangup_twiml() -> None:
            """Log the TwiML response used to terminate a call."""
            hangup_response = VoiceResponse()
            hangup_response.append(Hangup())
            print(hangup_response)

        def text_contains_call_end_keyword(text: str) -> bool:
            """Check whether the provided text includes any call-end keyword."""
            normalized_text = (text or "").lower()
            return any(keyword in normalized_text for keyword in CALL_END_KEYWORDS)

        def initiate_call_termination(reason: str) -> None:
            nonlocal call_should_end, hangup_initiated
            call_should_end = True
            if not hangup_initiated:
                print(f"📴 {reason}")
                log_hangup_twiml()
                hangup_initiated = True
        
        async def receive_from_twilio():
            """Receive audio data from Twilio and send it to Azure OpenAI."""
            nonlocal stream_sid, latest_media_timestamp, call_should_end
            try:
                async for message in websocket.iter_text():
                    data = json.loads(message)
                    
                    if data['event'] == 'media' and openai_ws.state.name == 'OPEN':
                        latest_media_timestamp = int(data['media']['timestamp'])
                        audio_append = {
                            "type": "input_audio_buffer.append",
                            "audio": data['media']['payload']
                        }
                        await openai_ws.send(json.dumps(audio_append))
                        
                    elif data['event'] == 'start':
                        stream_sid = data['start']['streamSid']
                        print(f"📞 Voice stream started: {stream_sid}")
                        response_start_timestamp_twilio = None
                        latest_media_timestamp = 0
                        last_assistant_item = None
                    
                    elif data['event'] == 'dtmf':
                        # User pressed a key on their phone keypad
                        digit = data.get('dtmf', {}).get('digit', '') or data.get('digit', '')
                        print(f"🔢 DTMF received: {digit}")
                        print(f"🔍 Full DTMF data: {data}")
                        if digit == '*' or digit == '#' or digit == '1':
                            print(f"📞 User pressed {digit} to end call")
                            call_should_end = True
                            # Close immediately
                            await websocket.close()
                            return
                        
                    elif data['event'] == 'mark':
                        if mark_queue:
                            mark_queue.pop(0)
                            
            except WebSocketDisconnect:
                print("📞 Voice call disconnected")
                if openai_ws.state.name == 'OPEN':
                    await openai_ws.close()

        async def send_to_twilio():
            """Receive events from Azure OpenAI, send audio back to Twilio."""
            nonlocal stream_sid, last_assistant_item, response_start_timestamp_twilio, call_should_end
            try:
                async for openai_message in openai_ws:
                    response = json.loads(openai_message)
                    
                    if response['type'] in LOG_EVENT_TYPES:
                        print(f"🤖 AI Event: {response['type']}")
                        
                        # Log error details
                        if response['type'] == 'error':
                            print(f"❌ OpenAI Error: {response.get('error', {})}")

                    # Check for conversation items (transcripts/messages). We need to watch user speech for hangup keywords.
                    if response.get('type') == 'conversation.item.created':
                        item = response.get('item', {})
                        if item.get('type') == 'message':
                            role = item.get('role')
                            content = item.get('content', [])
                            # If the user spoke and the transcript is available, inspect it for hangup keywords
                            if role == 'user':
                                for c in content:
                                    # transcripts may appear under types like 'input_transcript' or 'text'
                                    if c.get('type') in ('input_transcript', 'transcript', 'text'):
                                        candidate = c.get('text', '')
                                        if candidate:
                                            print(f"🗣️ User transcript: {candidate}")
                                            if text_contains_call_end_keyword(candidate):
                                                initiate_call_termination("User requested hangup via speech transcript")
                                                # close the websocket and exit
                                                await websocket.close()
                                                return
                            elif role == 'assistant':
                                # Keep existing assistant detection (if assistant says goodbye)
                                for c in content:
                                    if c.get('type') == 'text':
                                        text = c.get('text', '')
                                        normalized_text = text.lower()
                                        print(f"🤖 AI Response Text: {normalized_text}")
                                        if text_contains_call_end_keyword(text) or any(keyword in normalized_text for keyword in ['goodbye', 'bye', 'call_end_requested', 'end the call']):
                                            initiate_call_termination("Assistant message included hangup keyword")
                    
                    # Check response text deltas
                    if response.get('type') == 'response.text.delta':
                        delta_text = response.get('delta', '').lower()
                        if delta_text and any(keyword in delta_text for keyword in ['goodbye', 'bye', 'call_end_requested']):
                            print(f"📞 Detected goodbye in text delta: {delta_text}")
                            call_should_end = True
                    
                    # Check completed text responses
                    if response.get('type') == 'response.text.done':
                        text = response.get('text', '').lower()
                        if text:
                            print(f"🤖 AI Complete Text: {text}")
                            if any(keyword in text for keyword in ['goodbye', 'bye', 'call_end_requested']):
                                print("📞 Detected goodbye - will end call")
                                call_should_end = True
                    
                    # After response is done and call should end, terminate
                    if response.get('type') == 'response.done' and call_should_end:
                        print("📞 AI finished speaking, terminating call...")
                        await asyncio.sleep(2)  # Wait for audio to finish playing
                        await websocket.close()
                        return

                    # Send audio back to Twilio
                    if response.get('type') == 'response.output_audio.delta' and 'delta' in response:
                        audio_payload = base64.b64encode(
                            base64.b64decode(response['delta'])
                        ).decode('utf-8')
                        
                        audio_delta = {
                            "event": "media",
                            "streamSid": stream_sid,
                            "media": {"payload": audio_payload}
                        }
                        await websocket.send_json(audio_delta)

                        if response.get("item_id") and response["item_id"] != last_assistant_item:
                            response_start_timestamp_twilio = latest_media_timestamp
                            last_assistant_item = response["item_id"]
                            if SHOW_TIMING_MATH:
                                print(f"⏱️ Start timestamp: {response_start_timestamp_twilio}ms")

                        await send_mark(websocket, stream_sid)

                    # Handle interruption when user starts speaking
                    if response.get('type') == 'input_audio_buffer.speech_started':
                        print("🎤 User started speaking")
                        if last_assistant_item:
                            print(f"⏸️ Interrupting AI response: {last_assistant_item}")
                            await handle_speech_started_event()
                            
            except Exception as e:
                print(f"❌ Error in voice stream: {e}")

        async def handle_speech_started_event():
            """Handle interruption when the caller's speech starts."""
            nonlocal response_start_timestamp_twilio, last_assistant_item
            
            if mark_queue and response_start_timestamp_twilio is not None:
                elapsed_time = latest_media_timestamp - response_start_timestamp_twilio
                
                if SHOW_TIMING_MATH:
                    print(f"⏱️ Elapsed time: {elapsed_time}ms")

                if last_assistant_item:
                    truncate_event = {
                        "type": "conversation.item.truncate",
                        "item_id": last_assistant_item,
                        "content_index": 0,
                        "audio_end_ms": elapsed_time
                    }
                    await openai_ws.send(json.dumps(truncate_event))

                # Clear Twilio audio buffer
                await websocket.send_json({
                    "event": "clear",
                    "streamSid": stream_sid
                })

                mark_queue.clear()
                last_assistant_item = None
                response_start_timestamp_twilio = None

        async def send_mark(connection, stream_sid):
            """Send mark event to track response parts."""
            if stream_sid:
                mark_event = {
                    "event": "mark",
                    "streamSid": stream_sid,
                    "mark": {"name": "responsePart"}
                }
                await connection.send_json(mark_event)
                mark_queue.append('responsePart')

        # Run both tasks concurrently
        await asyncio.gather(receive_from_twilio(), send_to_twilio())


async def initialize_session(openai_ws):
    """Initialize session with Azure OpenAI Realtime API."""
    session_update = {
        "type": "session.update",
        "session": {
            "type": "realtime",
            "model": "gpt-realtime",
            "output_modalities": ["audio"],
            "audio": {
                "input": {
                    "format": {"type": "audio/pcmu"},
                    "turn_detection": {"type": "server_vad"}
                },
                "output": {
                    "format": {"type": "audio/pcmu"},
                    "voice": VOICE
                }
            },
            "instructions": SYSTEM_MESSAGE,
        }
    }
    
    print('🔧 Initializing AI voice session')
    await openai_ws.send(json.dumps(session_update))


@router.websocket("/realtime")
async def handle_realtime_voice(websocket: WebSocket):
    """
    WebSocket endpoint for browser-based realtime voice chat.
    Used for accessibility features (screen readers, voice navigation).
    """
    print("🎤 Browser voice chat connection attempt")
    print(f"   Headers: {websocket.headers}")
    print(f"   Query params: {websocket.query_params}")
    
    try:
        await websocket.accept()
        print("✅ WebSocket connection accepted")
    except Exception as e:
        print(f"❌ Failed to accept WebSocket: {e}")
        raise

    # Azure OpenAI Realtime API endpoint
    azure_ws_url = f"wss://tecoss.openai.azure.com/openai/v1/realtime?model=gpt-realtime&temperature={TEMPERATURE}"

    try:
        async with websockets.connect(
            azure_ws_url,
            additional_headers={
                "api-key": settings.AZURE_OPENAI_API_KEY
            }
        ) as openai_ws:
            # Initialize session with PCM16 for browser compatibility
            session_update = {
                "type": "session.update",
                "session": {
                    "model": "gpt-realtime",
                    "modalities": ["text", "audio"],
                    "voice": VOICE,
                    "input_audio_format": "pcm16",
                    "output_audio_format": "pcm16",
                    "input_audio_transcription": {
                        "model": "whisper-1"
                    },
                    "turn_detection": {
                        "type": "server_vad",
                        "threshold": 0.5,
                        "prefix_padding_ms": 300,
                        "silence_duration_ms": 500
                    },
                    "instructions": SYSTEM_MESSAGE,
                    "temperature": TEMPERATURE,
                }
            }
            
            print('🔧 Initializing browser voice session')
            await openai_ws.send(json.dumps(session_update))

            async def receive_from_browser():
                """Receive audio from browser and forward to OpenAI"""
                try:
                    async for message in websocket.iter_text():
                        data = json.loads(message)
                        
                        if data['type'] == 'input_audio':
                            # Forward audio to OpenAI
                            audio_append = {
                                "type": "input_audio_buffer.append",
                                "audio": data['audio']
                            }
                            await openai_ws.send(json.dumps(audio_append))
                        
                        elif data['type'] == 'commit_audio':
                            # Commit the audio buffer
                            await openai_ws.send(json.dumps({
                                "type": "input_audio_buffer.commit"
                            }))
                        
                        elif data['type'] == 'cancel':
                            # Cancel current response
                            await openai_ws.send(json.dumps({
                                "type": "response.cancel"
                            }))
                            
                except WebSocketDisconnect:
                    print("🎤 Browser disconnected")
                except Exception as e:
                    print(f"❌ Error receiving from browser: {e}")

            async def send_to_browser():
                """Receive events from OpenAI and forward to browser"""
                try:
                    async for openai_message in openai_ws:
                        response = json.loads(openai_message)
                        
                        # Forward all events to browser
                        await websocket.send_text(json.dumps(response))
                        
                        if response['type'] in LOG_EVENT_TYPES:
                            print(f"🤖 AI Event: {response['type']}")
                            
                except Exception as e:
                    print(f"❌ Error sending to browser: {e}")

            # Run both tasks concurrently
            await asyncio.gather(receive_from_browser(), send_to_browser())
            
    except websockets.exceptions.WebSocketException as e:
        print(f"❌ WebSocket error: {e}")
        await websocket.close(code=1011, reason="OpenAI connection failed")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        await websocket.close(code=1011, reason="Internal server error")
