"""A few ElevenLabs calls, standard library only. The key is ELEVENLABS_API_KEY in the gitignored .env beside this folder.

    design(description, text, ...) -> [(generated_voice_id, mp3 bytes), ...]   three candidate voices
    keep(generated_voice_id, name, description) -> voice_id                    saves one to the account
    speak(voice_id, text, ...) -> mp3 bytes
    used() -> credits spent this period
"""

import base64
import json
import urllib.error
import urllib.request
from pathlib import Path

base = "https://api.elevenlabs.io/v1"
env = Path(__file__).resolve().parents[1] / ".env"
key = dict(line.split("=", 1) for line in env.read_text().splitlines() if "=" in line)["ELEVENLABS_API_KEY"].strip()


def call(path: str, body: dict | None = None, raw: bool = False):
    request = urllib.request.Request(
        base + path,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"xi-api-key": key, "Content-Type": "application/json"},
        method="POST" if body is not None else "GET",
    )
    try:
        with urllib.request.urlopen(request, timeout=300) as response:
            data = response.read()
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"{path}: {error.code} {error.read().decode()[:400]}") from None
    return data if raw else json.loads(data)


def used() -> int:
    return call("/user/subscription")["character_count"]


def design(description: str, text: str, model: str = "eleven_ttv_v3", **options) -> list[tuple[str, bytes]]:
    reply = call("/text-to-voice/design", {"voice_description": description, "text": text, "model_id": model, **options})
    return [(p["generated_voice_id"], base64.b64decode(p["audio_base_64"])) for p in reply["previews"]]


def keep(generated: str, name: str, description: str) -> str:
    return call("/text-to-voice", {"voice_name": name, "voice_description": description, "generated_voice_id": generated})["voice_id"]


def speak(voice: str, text: str, model: str = "eleven_v4", **options) -> bytes:
    return call(f"/text-to-speech/{voice}?output_format=mp3_44100_128", {"text": text, "model_id": model, **options}, raw=True)
