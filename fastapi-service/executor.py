"""
Docker-based code executor — Python port of server/executor/executor.js

Runs user-submitted code in an isolated Docker container with:
  - 128 MB RAM limit
  - 0.5 CPU core
  - No network access
  - Read-only root filesystem
  - 10-second timeout
  - 64 KB output cap
"""

import asyncio
import os
import shutil
import tempfile
import uuid
from pathlib import Path
from typing import Callable, Optional

import docker
from docker.errors import APIError, NotFound

# Reuse a single Docker client (thread-safe for reads)
_docker_client = docker.from_env()

TEMP_ROOT = Path(__file__).parent / "temp"
TEMP_ROOT.mkdir(exist_ok=True)

MAX_OUTPUT_BYTES = 64 * 1024  # 64 KB
TIMEOUT_SECONDS = 10
CONTAINER_IMAGE = "code-sandbox"


# ---------------------------------------------------------------------------
# Helpers — mirrors getFileName / getRunCommand from executor.js
# ---------------------------------------------------------------------------

def _get_file_name(language: str) -> str:
    return {
        "c": "main.c",
        "cpp": "main.cpp",
        "java": "Main.java",
        "python": "main.py",
        "python3": "main.py",
    }.get(language, "main.txt")


def _get_run_command(language: str, file_name: str) -> str:
    return {
        "c": f"gcc {file_name} -o main && ./main",
        "cpp": f"g++ {file_name} -o main && ./main",
        "java": f"javac {file_name} && java Main",
        "python": f"python3 {file_name}",
        "python3": f"python3 {file_name}",
    }.get(language, f"cat {file_name}")


# ---------------------------------------------------------------------------
# Core execution
# ---------------------------------------------------------------------------

async def execute_code(
    language: str,
    code: str,
    stdin: Optional[str],
    on_output: Callable[[str], None],
    on_done: Callable[[dict], None],
) -> None:
    """
    Run *code* in a Docker container and stream output via callbacks.

    Parameters
    ----------
    language : str
        One of c, cpp, java, python, python3.
    code : str
        Source code to compile/run.
    stdin : str | None
        Optional stdin content piped into the program.
    on_output : callable(str)
        Called with each chunk of stdout/stderr text.
    on_done : callable(dict)
        Called once when execution finishes.
        ``{"status": "success"}`` or ``{"status": "error", "message": "..."}``
    """
    job_id = str(uuid.uuid4())
    temp_dir = TEMP_ROOT / job_id
    temp_dir.mkdir(parents=True, exist_ok=True)

    file_name = _get_file_name(language)
    (temp_dir / file_name).write_text(code, encoding="utf-8")

    if stdin:
        (temp_dir / "input.txt").write_text(stdin, encoding="utf-8")

    command = _get_run_command(language, file_name)
    if stdin:
        command += " < input.txt"

    container = None
    try:
        container = _docker_client.containers.create(
            image=CONTAINER_IMAGE,
            command=["sh", "-c", command],
            user="sandbox",
            mem_limit="128m",
            nano_cpus=500_000_000,       # 0.5 CPU
            network_mode="none",
            pids_limit=50,
            read_only=True,
            volumes={
                str(temp_dir.resolve()): {
                    "bind": "/home/sandbox/code",
                    "mode": "rw",
                }
            },
            working_dir="/home/sandbox/code",
        )

        container.start()

        # Stream logs in a background thread so we don't block the event loop
        output_size = 0
        killed = False

        def _stream_logs():
            nonlocal output_size, killed
            try:
                for chunk in container.logs(stream=True, follow=True):
                    if killed:
                        break
                    text = chunk.decode("utf-8", errors="replace")
                    output_size += len(chunk)
                    if output_size > MAX_OUTPUT_BYTES:
                        on_output("\n[Error: Output exceeded 64KB limit. Terminating...]")
                        try:
                            container.kill()
                        except Exception:
                            pass
                        killed = True
                        break
                    on_output(text)
            except Exception:
                pass  # container may already be gone

        log_task = asyncio.get_event_loop().run_in_executor(None, _stream_logs)

        # Timeout watchdog
        async def _watchdog():
            nonlocal killed
            await asyncio.sleep(TIMEOUT_SECONDS)
            if not killed:
                try:
                    container.reload()
                    if container.status == "running":
                        container.kill()
                        on_output("\n[Execution Timeout: 10 seconds exceeded]")
                        killed = True
                except Exception:
                    pass

        watchdog_task = asyncio.create_task(_watchdog())

        # Wait for log streaming to finish
        await log_task
        watchdog_task.cancel()

        on_done({"status": "success"})

    except Exception as exc:
        on_done({"status": "error", "message": str(exc)})

    finally:
        # Cleanup container + temp files
        if container:
            try:
                container.remove(force=True)
            except Exception:
                pass
        try:
            shutil.rmtree(temp_dir, ignore_errors=True)
        except Exception:
            pass
