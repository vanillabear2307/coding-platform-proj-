"""
FastAPI application entrypoint.

Serves:
  - WebSocket /ws/execute  — real-time code execution via Docker
  - REST     /execute      — one-shot code execution (returns full output)
  - REST     /ai/*         — AI/ML endpoints (hint, similar)
  - GET      /docs         — auto-generated OpenAPI documentation

Run with:
  uvicorn main:app --port 8001 --reload
"""

import asyncio
import json
import os
import time
from collections import defaultdict

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Literal

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from executor import execute_code
from ai import router as ai_router

# Load .env from the fastapi-service directory
load_dotenv()

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(
    title="Coding Platform — FastAPI Service",
    description="Code execution engine and AI features for the coding platform.",
    version="1.0.0",
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Simple WebSocket rate limiter: max 20 executions per minute per client IP
ws_rates = defaultdict(list)

def check_ws_rate_limit(client_ip: str) -> bool:
    current_time = time.time()
    # Filter timestamps in the last 60 seconds
    ws_rates[client_ip] = [t for t in ws_rates[client_ip] if current_time - t < 60]
    if len(ws_rates[client_ip]) >= 20:
        return False
    ws_rates[client_ip].append(current_time)
    return True

# CORS — allow the Vite dev server and production origins
origins = [
    os.getenv("CORS_ORIGIN", "http://localhost:3000"),
    "http://localhost:5000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount AI router
app.include_router(ai_router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    return {"status": "ok", "service": "fastapi-executor"}


# ---------------------------------------------------------------------------
# REST endpoint — POST /execute (one-shot, returns full output)
# ---------------------------------------------------------------------------

class ExecuteRequest(BaseModel):
    language: Literal["c", "cpp", "java", "python", "python3"]
    code: str = Field(..., max_length=65536)  # limit code to 64 KB
    stdin: Optional[str] = None


class ExecuteResponse(BaseModel):
    exit_code: int
    stdout: str
    stderr: Optional[str] = None


@app.post("/execute", response_model=ExecuteResponse)
@limiter.limit("20/minute")
async def execute_rest(req: ExecuteRequest, request: Request):
    """Run code and return the full output when finished."""
    chunks: list[str] = []
    result_holder: dict = {}
    done_event = asyncio.Event()

    def on_output(text: str):
        chunks.append(text)

    def on_done(result: dict):
        result_holder.update(result)
        done_event.set()

    await execute_code(req.language, req.code, req.stdin, on_output, on_done)
    await done_event.wait()

    full_output = "".join(chunks)
    is_error = result_holder.get("status") == "error"

    return ExecuteResponse(
        exit_code=1 if is_error else 0,
        stdout=full_output if not is_error else "",
        stderr=result_holder.get("message") if is_error else None,
    )


# ---------------------------------------------------------------------------
# WebSocket endpoint — /ws/execute (real-time streaming)
# ---------------------------------------------------------------------------

@app.websocket("/ws/execute")
async def execute_ws(websocket: WebSocket):
    """
    WebSocket protocol:
      Client sends: {"language": "...", "code": "...", "stdin": "..."}
      Server sends: {"type": "output", "data": "..."} per chunk
      Server sends: {"type": "done", "result": {...}} when finished
    """
    await websocket.accept()

    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)

            language = data.get("language", "")
            code = data.get("code", "")
            stdin = data.get("stdin")

            # Validate input data
            if language not in ["c", "cpp", "java", "python", "python3"]:
                await websocket.send_json({"type": "done", "result": {"status": "error", "message": f"Unsupported language: {language}"}})
                continue
            if not code or len(code) > 65536:
                await websocket.send_json({"type": "done", "result": {"status": "error", "message": "Code cannot be empty and must be under 64KB"}})
                continue

            # Check rate limit
            client_ip = websocket.client.host if websocket.client else "unknown"
            if not check_ws_rate_limit(client_ip):
                await websocket.send_json({"type": "done", "result": {"status": "error", "message": "Rate limit exceeded (max 20 submissions/min). Please wait a moment."}})
                continue

            async def on_output(text: str):
                try:
                    await websocket.send_json({"type": "output", "data": text})
                except Exception:
                    pass

            done_event = asyncio.Event()
            result_holder: dict = {}

            async def on_done(result: dict):
                result_holder.update(result)
                done_event.set()

            # The executor uses sync callbacks, so we need wrappers
            loop = asyncio.get_event_loop()
            output_queue: asyncio.Queue = asyncio.Queue()
            _done = asyncio.Event()

            def _sync_on_output(text: str):
                loop.call_soon_threadsafe(output_queue.put_nowait, text)

            def _sync_on_done(result: dict):
                result_holder.update(result)
                loop.call_soon_threadsafe(_done.set)

            # Start execution
            exec_task = asyncio.create_task(
                execute_code(language, code, stdin, _sync_on_output, _sync_on_done)
            )

            # Forward output chunks to the WebSocket
            async def _forward():
                while not _done.is_set() or not output_queue.empty():
                    try:
                        text = await asyncio.wait_for(output_queue.get(), timeout=0.1)
                        await websocket.send_json({"type": "output", "data": text})
                    except asyncio.TimeoutError:
                        continue
                    except Exception:
                        break

            await asyncio.gather(exec_task, _forward())

            # Drain any remaining items
            while not output_queue.empty():
                text = output_queue.get_nowait()
                await websocket.send_json({"type": "output", "data": text})

            await websocket.send_json({"type": "done", "result": result_holder})

    except WebSocketDisconnect:
        pass
    except Exception:
        try:
            await websocket.close()
        except Exception:
            pass
