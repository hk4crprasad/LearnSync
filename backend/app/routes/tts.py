from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from gtts import gTTS
import io
import re

router = APIRouter(prefix="/api/tts", tags=["Text-to-Speech"])

class TTSRequest(BaseModel):
    text: str
    language: str = "en"

@router.post("/speak")
async def text_to_speech(request: TTSRequest):
    """
    Convert text to speech using Google TTS with proper Indian language support
    Supports: en, hi, bn, ta, te, or (Odia), and more
    """
    try:
        # Clean text - remove markdown
        clean_text = request.text
        clean_text = re.sub(r'[#*`_~[\]()]', '', clean_text)
        clean_text = re.sub(r'\n+', '. ', clean_text)
        clean_text = clean_text.strip()
        
        if not clean_text:
            raise HTTPException(status_code=400, detail="Text cannot be empty")
        
        # Map language codes
        lang_map = {
            'en': 'en',
            'en-US': 'en',
            'hi': 'hi',
            'hi-IN': 'hi',
            'or': 'or',  # Odia
            'or-IN': 'or',
            'bn': 'bn',  # Bengali
            'bn-IN': 'bn',
            'ta': 'ta',  # Tamil
            'ta-IN': 'ta',
            'te': 'te',  # Telugu
            'te-IN': 'te',
        }
        
        lang_code = lang_map.get(request.language, 'en')
        
        # Generate speech using gTTS
        # slow=False for normal speed, slow=True for slower (better for learning)
        # For Odia and Hindi, use slower speed for better pronunciation
        use_slow = lang_code in ['or', 'hi', 'bn']
        
        tts = gTTS(text=clean_text, lang=lang_code, slow=use_slow)
        
        # Save to BytesIO buffer
        audio_buffer = io.BytesIO()
        tts.write_to_fp(audio_buffer)
        audio_buffer.seek(0)
        
        # Return audio stream
        return StreamingResponse(
            audio_buffer,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"attachment; filename=speech_{lang_code}.mp3",
                "Cache-Control": "no-cache",
            }
        )
        
    except Exception as e:
        print(f"TTS Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate speech: {str(e)}")

@router.get("/languages")
async def get_supported_languages():
    """Get list of supported languages for TTS"""
    return {
        "languages": [
            {"code": "en", "name": "English", "region": "US"},
            {"code": "hi", "name": "Hindi", "region": "India"},
            {"code": "or", "name": "Odia", "region": "India"},
            {"code": "bn", "name": "Bengali", "region": "India"},
            {"code": "ta", "name": "Tamil", "region": "India"},
            {"code": "te", "name": "Telugu", "region": "India"},
        ]
    }
