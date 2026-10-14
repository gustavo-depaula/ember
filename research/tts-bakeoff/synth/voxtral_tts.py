"""Voxtral TTS (mistralai/Voxtral-4B-TTS-2603) through a local vllm-omni server.

Starts `vllm serve --omni`, synthesizes every missing clip over HTTP, stops the
server. Run the whole thing under the shared GPU lock:

    flock /tmp/ember-tts-gpu.lock envs/voxtral-tts/.venv/bin/python synth/voxtral_tts.py

The open weights ship preset voice embeddings only (no codec encoder), so there
is no cloned voice. Presets are per language; Latin is read by the Italian one.
"""

import io
import os
import signal
import subprocess
import sys
import threading
import time
from pathlib import Path

import httpx
import soundfile as sf

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import allVariants, base, run  # noqa: E402

modelId = "mistralai/Voxtral-4B-TTS-2603"
port = int(os.environ.get("VOXTRAL_PORT", "8791"))
url = f"http://127.0.0.1:{port}"
env = base / "envs" / "voxtral-tts"

# English has no `en_*` preset; `neutral_*` is the calmest-described of its five.
presets = {
    "male": {"en-US": "neutral_male", "pt-BR": "pt_male", "it": "it_male"},
    "female": {"en-US": "neutral_female", "pt-BR": "pt_female", "it": "it_female"},
}


def start_server(deploy: str) -> subprocess.Popen:
    log = (env / f"server.{deploy}.log").open("w")
    server = subprocess.Popen(
        [
            str(env / ".venv" / "bin" / "vllm"), "serve", modelId, "--omni",
            "--port", str(port), "--host", "127.0.0.1",
            "--deploy-config", str(env / f"{deploy}.yaml"),
        ],
        # FlashInfer's sampler JIT-compiles with nvcc, and there is no CUDA toolkit here.
        env={**os.environ, "VLLM_USE_FLASHINFER_SAMPLER": "0"},
        stdout=log,
        stderr=subprocess.STDOUT,
        start_new_session=True,
    )
    deadline = time.time() + 900
    while time.time() < deadline:
        if server.poll() is not None:
            raise RuntimeError(f"vllm exited with {server.returncode}; see {log.name}")
        try:
            if httpx.get(f"{url}/health", timeout=2).status_code == 200:
                return server
        except httpx.HTTPError:
            pass
        time.sleep(3)
    stop_server(server)
    raise RuntimeError("vllm did not become healthy in 15 minutes")


def stop_server(server: subprocess.Popen) -> None:
    if server.poll() is not None:
        return
    os.killpg(server.pid, signal.SIGTERM)
    try:
        server.wait(timeout=60)
    except subprocess.TimeoutExpired:
        os.killpg(server.pid, signal.SIGKILL)


def watch_vram(peak: list[int], done: threading.Event) -> None:
    while not done.wait(2):
        used = subprocess.run(
            ["nvidia-smi", "--query-gpu=memory.used", "--format=csv,noheader,nounits"],
            capture_output=True, text=True,
        ).stdout.strip()
        if used.isdigit():
            peak[0] = max(peak[0], int(used))


def make_speak(voices: dict[str, str]):
    def speak(text: str, script: dict):
        voice = voices[script.get("speakAs") or script["lang"]]
        response = httpx.post(
            f"{url}/v1/audio/speech",
            json={"input": text, "model": modelId, "response_format": "wav", "voice": voice},
            timeout=600,
        )
        if response.status_code != 200:
            raise RuntimeError(f"{voice}: {response.status_code} {response.text[:500]}")
        samples, rate = sf.read(io.BytesIO(response.content), dtype="float32")
        return (samples.mean(axis=1) if samples.ndim > 1 else samples), rate

    return speak


def main() -> None:
    variants = sys.argv[1:] or allVariants
    only = os.environ.get("VOXTRAL_ONLY")
    peak, done = [0], threading.Event()
    # The eager config drops the acoustic transformer's CUDA graphs: slower, but
    # it is the fallback when the default one runs out of memory at startup.
    try:
        server = start_server("deploy-12gb")
    except RuntimeError as error:
        print(f"{error}; retrying eager", flush=True)
        server = start_server("deploy-12gb-eager")
    threading.Thread(target=watch_vram, args=(peak, done), daemon=True).start()
    try:
        for voice, voices in presets.items():
            run("voxtral-tts", voice, variants, make_speak(voices), only.split(",") if only else None)
    finally:
        done.set()
        stop_server(server)
        print(f"peak GPU memory used (whole card): {peak[0]} MiB", flush=True)


main()
