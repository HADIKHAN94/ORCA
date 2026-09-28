from fastapi import APIRouter, Depends, HTTPException, Request
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel
from google import genai as google_genai
import os
import db
import json
from sqlalchemy.orm import Session
import asyncio
from dotenv import load_dotenv

_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
load_dotenv(dotenv_path=_env_path, override=True)

router = APIRouter(prefix="/api/chat", tags=["chat"])

MODELS = [
    "gemma-4-26b-a4b-it",
    "gemma-4-31b-it",
    "gemini-3.8-flash",
    "gemini-3.7-flash",
]
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")


class ChatRequest(BaseModel):
    message: str
    lat: float
    lon: float
    context: str = ""
    lang: str = "en"
    user_id: int = None


def build_system_prompt(req: ChatRequest) -> str:
    lang_names = {
        "en": "English",
        "hi": "Hindi",
        "mr": "Marathi",
        "te": "Telugu",
        "ta": "Tamil",
    }
    lang_name = lang_names.get(req.lang, "English")

    return f"""You are ORCA - an expert AI Marine Intelligence Assistant for Indian fishermen.
Answer the user's question accurately based ONLY on the provided context.
Speak in a helpful, conversational, and professional tone similar to ChatGPT.
Format your response cleanly using bullet points, bold text for emphasis, and short paragraphs. Avoid overly dense tables unless absolutely necessary.
Always give a clear conclusion or recommendation at the end.
Respond entirely in {lang_name}.

If the user asks about a specific location, route, or fishing zone, you MUST append a map configuration at the VERY END of your response in this exact JSON format:
<map_config>{{"center": [lat, lon], "markers": [{{"lat": lat, "lon": lon, "label": "name"}}]}}</map_config>

CONTEXT:
{req.context}
"""


@router.post("")
async def chat_endpoint(
    req: ChatRequest, request: Request, session: Session = Depends(db.get_db)
):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured")

    prompt = f"<start_of_turn>user\n{build_system_prompt(req)}\n\nQuestion: {req.message}<end_of_turn>\n<start_of_turn>model\n"

    chat_log = None
    if req.user_id:
        chat_log = db.ChatHistory(
            user_id=req.user_id, message=req.message, lat=req.lat, lon=req.lon
        )
        session.add(chat_log)
        session.commit()

    async def event_generator():
        client = google_genai.Client(api_key=GEMINI_API_KEY)
        last_error = ""

        for model_name in MODELS:
            try:

                def do_stream(m=model_name):
                    return client.models.generate_content_stream(
                        model=m, contents=prompt
                    )

                stream = await asyncio.to_thread(do_stream)
                full_response = ""

                for chunk in stream:
                    if await request.is_disconnected():
                        return
                    text = chunk.text or ""
                    if text:
                        full_response += text
                        yield {"data": json.dumps(text)}

                if chat_log and full_response:
                    chat_log.response = full_response
                    session.commit()
                return

            except Exception as e:
                last_error = str(e)
                if full_response:
                    yield {
                        "data": json.dumps(
                            f"\n\n⚠️ **[Connection interrupted: {last_error[:60]}]**"
                        )
                    }
                    return
                continue

        err_msg = f"⚠️ **ORCA AI Error:** Google API Overload. Try again later. ({last_error[:80]})"
        yield {"data": json.dumps(err_msg)}

    return EventSourceResponse(event_generator())
