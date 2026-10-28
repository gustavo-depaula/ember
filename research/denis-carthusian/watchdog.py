"""Watch the OCR run and raise an alert when it stops making progress.

    .venv/bin/python watchdog.py          # run by denis-watchdog.timer every 10 minutes

The run once sat in a restart loop for twelve hours while the service looked
"active". So this does not trust the service state alone: it alerts when no new
page has been drafted for 30 minutes, when the service has failed, or when it
has restarted more than 3 times since the last check. Each check is appended to
heartbeat.log; each alert also goes to alerts.log and the desktop.
"""

import json
import os
import subprocess
import time
from pathlib import Path

data = Path(os.environ.get("DENIS_DATA", Path.home() / "ember-data" / "denis-carthusian"))
state_path = data / "watchdog.json"
stall_minutes = 30


def service(prop: str) -> str:
    out = subprocess.run(["systemctl", "--user", "show", "denis-ocr.service", "-p", prop, "--value"],
                         capture_output=True, text=True)
    return out.stdout.strip()


def main() -> None:
    now = time.time()
    drafted = sum(1 for _ in data.glob("dots/*/*.md"))
    failed_pages = sum(1 for _ in data.glob("dots/*/*.err"))
    state = json.loads(state_path.read_text()) if state_path.exists() else {}
    restarts = int(service("NRestarts") or 0)
    active = service("ActiveState")
    log_tail = (data / "progress.log").read_text().splitlines()[-1:] if (data / "progress.log").exists() else []
    finished = bool(log_tail) and "all volumes done" in log_tail[0]

    if drafted != state.get("drafted"):
        state["drafted"], state["progress_at"] = drafted, now
    stalled_for = (now - state.get("progress_at", now)) / 60

    problems = []
    if not finished:
        if active == "failed":
            problems.append("service has FAILED")
        if stalled_for >= stall_minutes:
            problems.append(f"no new page for {stalled_for:.0f} min (stuck at {drafted})")
        if restarts - state.get("restarts", restarts) > 3:
            problems.append(f"{restarts - state['restarts']} restarts in the last check interval")
    state["restarts"] = restarts
    state_path.write_text(json.dumps(state))

    line = (f"{time.strftime('%Y-%m-%d %H:%M')} drafted={drafted} failed_pages={failed_pages} "
            f"service={active} restarts={restarts} {'FINISHED' if finished else ''}"
            f"{' ALERT: ' + '; '.join(problems) if problems else ''}")
    with open(data / "heartbeat.log", "a") as f:
        f.write(line + "\n")
    if problems:
        with open(data / "alerts.log", "a") as f:
            f.write(line + "\n")
        subprocess.run(["notify-send", "-u", "critical", "Denis OCR needs attention", "; ".join(problems)])


if __name__ == "__main__":
    main()
