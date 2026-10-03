"""Builds earn.html: three directions for showing, on a card's page, what wins it.

The ways are the holy-card engine's doors (packages/holy-cards/src/rules.ts):
Mass on the feast, the Office for a saint off the user's calendar, a novena
naming the card, a season's Sundays or weekdays, a card drawn at Mass, the
starters. The dates are as seen on Friday 2 October 2026, so the examples
cover a novena under way, one about to begin, one just missed, and a feast in
two days.

Run from the repo root with a Python that has Pillow:
  python research/saint-page-prototype/build-earn.py
"""

import base64, io, json, os

from PIL import Image

here = os.path.dirname(os.path.abspath(__file__))
cards_dir = "content/practices/saint-of-the-day/data/holy-cards/"


def jpeg(path, width):
    img = Image.open(path).convert("RGB")
    img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=78)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


def card(cid):
    c = json.load(open(cards_dir + cid + ".json"))
    return {
        "id": cid,
        "name": c["name"]["en-US"],
        "patron": (c.get("patronOf") or {}).get("en-US"),
        "art": jpeg(f"content/saints/{cid}.png", 420),
    }


frame = jpeg("apps/app/assets/textures/card_back_frame.webp", 420)

# Each way: glyph, what to do, when, its state, a progress strip, the action it offers.
#   state: soon | running | upcoming | missed | chance | done
subjects = [
    {
        **card("our_lady_rosary"),
        "feast": "October 7",
        "note": "A novena under way (day 5 of 9) and the feast in five days.",
        "ways": [
            {"glyph": "beads", "title": "Finish the Novena to Our Lady of the Rosary", "state": "running",
             "when": "Day 5 of 9 · ends Tuesday 6 October", "progress": [9, 5, "day"],
             "action": "Pray day 6", "detail": "The card waits a week to be opened."},
            {"glyph": "chalice", "title": "Go to Mass on her feast", "state": "upcoming",
             "when": "Wednesday 7 October · in 5 days", "action": "Remind me",
             "detail": "Mark the Mass as prayed; the card waits until the next day."},
            {"glyph": "beads", "title": "Or pray the 54-day Rosary Novena", "state": "upcoming",
             "when": "Any 54 days in a row", "action": "Add to my plan"},
        ],
        "almanac": {"from": "2026-09-28", "days": 14, "today": "2026-10-02",
                    "spans": [["2026-09-28", "2026-10-06", "Novena", 5]], "marks": [["2026-10-07", "Feast"]]},
        "next": "Yours when you finish the novena, Tuesday",
    },
    {
        **card("francis_assisi"),
        "feast": "October 4",
        "note": "The feast in two days, on a Sunday; the novena ended yesterday.",
        "ways": [
            {"glyph": "chalice", "title": "Go to Mass on his feast", "state": "soon",
             "when": "Sunday 4 October · in 2 days", "action": "Remind me",
             "detail": "The Sunday takes the day, but its Mass still gives his card."},
            {"glyph": "beads", "title": "Pray the Novena to St. Francis", "state": "missed",
             "when": "Ended yesterday · next from 25 September", "action": "Begin it anyway",
             "detail": "A novena begun today ends 10 October, and still gives his card."},
        ],
        "almanac": {"from": "2026-09-25", "days": 14, "today": "2026-10-02",
                    "spans": [["2026-09-25", "2026-10-03", "Novena", 0]], "marks": [["2026-10-04", "Feast"]]},
        "next": "Yours at Mass on Sunday · in 2 days",
    },
    {
        **card("teresa"),
        "feast": "October 15",
        "note": "A novena about to begin: the time to act is before the feast.",
        "ways": [
            {"glyph": "beads", "title": "Pray the Novena to St. Teresa of Ávila", "state": "upcoming",
             "when": "Begins Tuesday 6 October · in 4 days", "progress": [9, 0, "day"],
             "action": "Add to my plan", "detail": "Nine days, ending the eve of her feast."},
            {"glyph": "chalice", "title": "Go to Mass on her feast", "state": "upcoming",
             "when": "Thursday 15 October · in 13 days", "action": "Remind me"},
        ],
        "almanac": {"from": "2026-10-02", "days": 14, "today": "2026-10-02",
                    "spans": [["2026-10-06", "2026-10-14", "Novena", 0]], "marks": [["2026-10-15", "Feast"]]},
        "next": "The novena begins Tuesday",
    },
    {
        **card("philip_benizi"),
        "feast": "August 23",
        "note": "Off the calendar: no Mass of his, so the Office on his day gives him.",
        "ways": [
            {"glyph": "book", "title": "Pray the Office on his day", "state": "upcoming",
             "when": "Monday 23 August 2027 · in 325 days", "action": "Remind me",
             "detail": "His feast isn't kept at Mass on your calendar, so the Hours keep it."},
        ],
        "almanac": None,
        "next": "Given by the Office on 23 August",
    },
    {
        **card("advent_sunday"),
        "feast": None,
        "note": "A season's card: Mass on all four Sundays, given with the last.",
        "ways": [
            {"glyph": "candles", "title": "Go to Mass every Sunday of Advent", "state": "upcoming",
             "when": "From Sunday 29 November · in 58 days", "progress": [4, 0, "Sunday"],
             "action": "Remind me", "detail": "Given with the fourth Sunday's Mass, 20 December."},
        ],
        "almanac": {"from": "2026-11-29", "days": 28, "today": "2026-10-02",
                    "spans": [], "marks": [["2026-11-29", "I"], ["2026-12-06", "II"], ["2026-12-13", "III"], ["2026-12-20", "IV"]]},
        "next": "Four Sundays from 29 November",
    },
    {
        **card("chalice"),
        "feast": None,
        "note": "A Mass card: drawn by chance, so there is no date to name.",
        "ways": [
            {"glyph": "chalice", "title": "Go to Mass on a day with no saint's card", "state": "chance",
             "when": "Drawn at random from the 73 Mass and altar cards",
             "detail": "On a day whose saints have no card, the Mass draws one of these instead."},
        ],
        "almanac": None,
        "next": "Drawn at a Mass without a saint",
    },
    {
        **card("thomas_aquinas"),
        "feast": "January 28",
        "held": {"door": "Received at Mass", "date": "28 January 2026"},
        "note": "Held: the page says how it came, and how to receive it again.",
        "ways": [
            {"glyph": "chalice", "title": "Go to Mass on his feast", "state": "upcoming",
             "when": "Thursday 28 January · in 118 days", "action": "Remind me"},
            {"glyph": "beads", "title": "Pray the Novena to St. Thomas Aquinas", "state": "upcoming",
             "when": "From Tuesday 19 January", "action": "Add to my plan"},
        ],
        "almanac": None,
        "next": None,
    },
]

data = "const frame = " + json.dumps(frame) + "\nconst subjects = " + json.dumps(subjects, ensure_ascii=False)
out = open(os.path.join(here, "template-earn.html")).read().replace("/*DATA*/", data)
open(os.path.join(here, "earn.html"), "w").write(out)
print("earn.html", len(out) // 1024, "KB")
