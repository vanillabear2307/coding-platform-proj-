"""
AI / ML endpoints — Phase 2 of FastAPI integration.

Provides:
  POST /ai/testcases  — Generates test cases for a coding problem (calls Gemini API)
"""

import os
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["AI"])

# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

class TestcasesRequest(BaseModel):
    title: str
    description: str

class TestcasesResponse(BaseModel):
    testcases: str

# ---------------------------------------------------------------------------
# POST /ai/testcases — Gemini-powered test case generator
# ---------------------------------------------------------------------------

@router.post("/testcases", response_model=TestcasesResponse)
async def generate_testcases(req: TestcasesRequest):
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY not configured. Add it to fastapi-service/.env",
        )

    prompt = (
        "You are an expert technical interviewer and competitive programming test case generator. "
        "A user is solving the following problem. Generate 2 to 3 tricky edge cases or standard test cases "
        "formatted PRECISELY as standard input plain text. Do not provide any explanations, markdown formatting, "
        "or backticks. Just output the raw input that can be fed directly to the standard input of a program.\n\n"
        f"**Problem Title:** {req.title}\n\n"
        f"**Problem Description:**\n{req.description}\n\n"
        "Provide only the raw standard input:"
    )

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-2.0-flash:generateContent?key={api_key}"
    )

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(
            url,
            json={
                "contents": [{"parts": [{"text": prompt}]}],
            },
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API returned {resp.status_code}: {resp.text[:300]}",
        )

    data = resp.json()
    try:
        testcases_text = data["candidates"][0]["content"]["parts"][0]["text"]
        # Strip markdown code blocks if the AI accidentally adds them
        if testcases_text.startswith("```"):
            lines = testcases_text.splitlines()
            if lines:
                # Remove first and last line
                if lines[-1].strip() == "```":
                    testcases_text = "\n".join(lines[1:-1])
                else:
                    testcases_text = "\n".join(lines[1:])
        
        testcases_text = testcases_text.strip()
    except (KeyError, IndexError):
        raise HTTPException(status_code=502, detail="Unexpected Gemini response format")

    return TestcasesResponse(testcases=testcases_text)
