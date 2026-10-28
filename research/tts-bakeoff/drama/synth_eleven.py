"""Voice chosen chapters with ElevenLabs itself.

The cast must already be on the account (voice ids in voices/<cast>.ids.json).
Clips go to the edition's clips folder under VOICESET, so stitch.py with the
same VOICESET assembles them. Chapters are voiced in order and existing clips
are kept, so a run that stops when the credits run out leaves whole chapters
and resumes where it stopped.

    BOOK=job EDITION=en CHAPTERS=20,21 VOICESET=el-job ELEVEN_CAST=el-job python3 drama/synth_eleven.py
"""

import json
import os
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

here = Path(__file__).parent
sys.path.insert(0, str(here))
import eleven  # noqa: E402
from edition import chosen, clips, lang, root, voiceSet  # noqa: E402

# ELEVEN_MODEL lets a cast trial keep its own VOICESET name.
model = os.environ.get("ELEVEN_MODEL") or voiceSet.replace("eleven-", "eleven_").replace("-", "_")
ids = json.loads((here / "voices" / f"{os.environ['ELEVEN_CAST']}.ids.json").read_text())
utterances = chosen(json.loads((root / "utterances.json").read_text(encoding="utf-8")))
clips.mkdir(parents=True, exist_ok=True)


def voice(line: dict) -> None:
    target = clips / f"{line['clip']}.wav"
    for attempt in range(4):
        try:
            mp3 = eleven.speak(ids[line["voice"]], line["text"], model=model, language_code=lang)
            break
        except RuntimeError as error:
            # Out of credits is final; anything else (rate limit, a server hiccup) is worth another try.
            if "quota" in str(error) or attempt == 3:
                raise
            time.sleep(5 * (attempt + 1))
    target.with_suffix(".mp3").write_bytes(mp3)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(target.with_suffix(".mp3")), "-ar", "24000", "-ac", "1", str(target)], check=True)


made = characters = 0
# The Starter plan allows three requests at once.
with ThreadPoolExecutor(3) as pool:
    for chapter, lines in utterances.items():
        todo = list({line["clip"]: line for line in lines if not (clips / f"{line['clip']}.wav").exists()}.values())
        list(pool.map(voice, todo))
        made += len(todo)
        characters += sum(len(line["text"]) for line in todo)
        print(f"chapter {chapter}: {len(todo)} clips", flush=True)
print(f"{model}: {made} clips, {characters} characters")
