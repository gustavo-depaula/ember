#!/usr/bin/env python3
"""One-time migration: apply per-session slicing of Aquinas + Trent chapters.

Reads sessions.json, applies the slicing plan documented in journal D-16, writes
back. After this runs, the build can produce 90 sessions where each has unique
commentary content (or no commentary, where the source genuinely has nothing).
"""

import json
from pathlib import Path

BOOK_DIR = Path(__file__).resolve().parent.parent
SESSIONS = BOOK_DIR / "sessions.json"

# Plan: per-session overrides for aquinas and trent fields.
# - Value None means "drop this source for this session" (set field to [] or null).
# - Value {"chapter": ..., "sections": [...]} means slice by H2 anchors.
# - Sessions not listed keep their existing values.
#
# Only sessions inside multi-session clusters are listed.
PLAN = {
    # creed-intro cluster (s003 keeps full; s004 drops)
    "session-004": {"trent": None},

    # creed-01 cluster (s005, s008-012) — 8 sections, distribute
    "session-005": {"trent": {"chapter": "creed-01", "sections": ["Meaning Of This Article", "I Believe", "In God"]}},
    "session-008": {"trent": {"chapter": "creed-01", "sections": ["The Father", "Almighty", "Creator", "Of Heaven and Earth"]}},
    "session-009": {"aquinas": [], "trent": {"chapter": "creed-01", "sections": ["Of all Things Visible and Invisible"]}},
    "session-010": {"aquinas": [], "trent": None},
    "session-011": {"aquinas": [], "trent": None},
    "session-012": {"aquinas": [], "trent": None},

    # creed-08 cluster (s006, s007)
    "session-006": {
        "aquinas": [{"chapter": "creed-08-holy-ghost", "sections": ["@opening", "Teaching of the Nicene Creed"]}],
        "trent": {"chapter": "creed-08", "sections": ["@opening", "Importance Of This Article", "Holy Ghost", "I Believe in the Holy Ghost"]},
    },
    "session-007": {
        "aquinas": [{"chapter": "creed-08-holy-ghost", "sections": ["Benefits from the Holy Ghost"]}],
        "trent": {"chapter": "creed-08", "sections": ["Certain Divine Works are Appropriated to the Holy Ghost"]},
    },

    # creed-02 cluster (s013, s014)
    "session-013": {
        "aquinas": [{"chapter": "creed-02-jesus-christ", "sections": ["@opening", "Errors Relating to the Second Article"]}],
        "trent": {"chapter": "creed-02", "sections": ["@opening", "Advantages Of Faith In This Article", "Necessity Of Faith In This Article", "Jesus", "Christ"]},
    },
    "session-014": {
        "aquinas": [{"chapter": "creed-02-jesus-christ", "sections": ["The Divine Generation"]}],
        "trent": {"chapter": "creed-02", "sections": ["His Only Son", "Our Lord", "Duties Owed To Christ Our Lord"]},
    },

    # creed-04 cluster (s016, s017): s016 drops trent (no fit), s017 keeps full
    "session-016": {"trent": None},

    # creed-05 cluster (s018, s022)
    "session-018": {"trent": {"chapter": "creed-05", "sections": ["@opening", "Importance Of This Article", "Second Part of this Article", "Three Useful Considerations"]}},
    "session-022": {"trent": {"chapter": "creed-05", "sections": ["First Part of this Article"]}},

    # creed-07 cluster (s020, s021)
    "session-020": {
        "aquinas": [{"chapter": "creed-07-shall-come-to-judge", "sections": ["@opening", "The Form of the Judgement", "Who Are to Be Judged?"]}],
        "trent": {"chapter": "creed-07", "sections": ["@opening", "Meaning Of This Article", "From Thence He Shall Come", "To Judge the Living and the Dead"]},
    },
    "session-021": {
        "aquinas": [{"chapter": "creed-07-shall-come-to-judge", "sections": ["The Fear of the Judgment", "Our Preparation for the Judgment"]}],
        "trent": {"chapter": "creed-07", "sections": ["Circumstances of the Judgment", "Importance of Instruction on this Article"]},
    },

    # creed-12 cluster (s023, s034)
    "session-023": {
        "aquinas": [{"chapter": "creed-12-life-everlasting", "sections": ["What Is Everlasting Life?", "What Is Everlasting Death?"]}],
        "trent": {"chapter": "creed-12", "sections": ["Negative and Positive Elements of Eternal Life", "Essential Happiness", "Accessory Happiness"]},
    },
    "session-034": {
        "aquinas": [{"chapter": "creed-12-life-everlasting", "sections": ["@opening", "The Fullness of Desires"]}],
        "trent": {"chapter": "creed-12", "sections": ["@opening", "Importance Of This Article", "Life Everlasting", "How to Arrive at the Enjoyment"]},
    },

    # creed-09 cluster (s024-s029)
    "session-024": {
        "aquinas": [{"chapter": "creed-09-holy-catholic-church", "sections": ["@opening"]}],
        "trent": {"chapter": "creed-09", "sections": ["@opening", "The Importance Of This Article"]},
    },
    "session-025": {
        "aquinas": [{"chapter": "creed-09-holy-catholic-church", "sections": ["The Unity of the Church", "The Holiness of the Church", "The Catholicity or Universality of the Church", "The Apostolicity of the Church"]}],
        "trent": {"chapter": "creed-09", "sections": ["First Part Of This Article"]},
    },
    "session-026": {"trent": None},
    "session-027": {
        "aquinas": [{"chapter": "creed-10-communion-of-saints", "sections": ["@opening", "The Seven Sacraments: a Review"]}],
        "trent": {"chapter": "creed-09", "sections": ["Second Part of this Article"]},
    },
    "session-028": {
        "aquinas": [{"chapter": "creed-10-communion-of-saints", "sections": ["The Communion of Saints"]}],
        "trent": None,
    },
    "session-029": {"trent": None},

    # creed-10 cluster (s030, s031, s032)
    "session-030": {
        "aquinas": [{"chapter": "creed-10-communion-of-saints", "sections": ["The Forgiveness of Sins"]}],
        "trent": {"chapter": "creed-10", "sections": ["@opening", "Importance Of This Article", "The Church Has the Power of Forgiving Sins"]},
    },
    "session-031": {"trent": {"chapter": "creed-10", "sections": ["Extent of this Power", "Limitation of this Power", "Greatness of this Power"]}},
    "session-032": {"trent": {"chapter": "creed-10", "sections": ["Exhortation"]}},

    # decalogue-intro cluster (s035, s036)
    "session-035": {"trent": {"chapter": "decalogue-intro", "sections": ["@opening", "Importance Of Instruction On The Commandments", "The Promulgation of the Law"]}},
    "session-036": {"aquinas": [], "trent": {"chapter": "decalogue-intro", "sections": ["Motives for Observing the Commandments"]}},

    # commandment-01 cluster (s037, s038, s039)
    "session-037": {"trent": {"chapter": "commandment-01", "sections": ["I am the Lord thy God", "Who Brought Thee Out of the Land of Egypt", "Thou Shalt Not Have Strange Gods Before Me"]}},
    "session-038": {"aquinas": [], "trent": {"chapter": "commandment-01", "sections": ["I Am the Lord Thy God, Mighty, Jealous"]}},
    "session-039": {"aquinas": [], "trent": {"chapter": "commandment-01", "sections": ["Thou shalt not make to thyself a graven thing"]}},

    # commandment-02 cluster (s040, s041)
    "session-040": {
        "aquinas": [{"chapter": "commandments-02-name-of-the-lord", "sections": ["@opening", "The Meaning of in Vain", "Conditions of a Lawful Oath"]}],
        "trent": {"chapter": "commandment-02", "sections": ["Importance Of Instruction On This Commandment", "Various Ways Of Honouring God's Name", "Various Ways In Which God's Name Is Dishonoured"]},
    },
    "session-041": {
        "aquinas": [{"chapter": "commandments-02-name-of-the-lord", "sections": ["Taking God's Name Justly"]}],
        "trent": {"chapter": "commandment-02", "sections": ["@opening", "Why This Commandment Is Distinct From The First"]},
    },

    # commandment-03 cluster (s042, s043)
    "session-042": {
        "aquinas": [{"chapter": "commandments-03-sabbath", "sections": ["@opening", "Reasons for This Commandment", "With What the Sabbath and Feasts Should Be Occupied"]}],
        "trent": {"chapter": "commandment-03", "sections": ["@opening", "Reasons For This Commandment", "Importance Of Instruction On This Commandment", "How The Third Differs From The Other Commandments", "How The Third Is Like The Other Commandments", "The Jewish Sabbath Changed To Sunday By The Apostles"]},
    },
    "session-043": {
        "aquinas": [{"chapter": "commandments-03-sabbath", "sections": ["From What We Should Abstain on the Sabbath", "With What the Sabbath and Feasts", "The Spiritual Sabbath", "The Heavenly Sabbath"]}],
        "trent": {"chapter": "commandment-03", "sections": ["Four Parts Of This Commandment", "The Observance Of This Commandment Brings Many Blessings", "Neglect Of This Commandment A Great Crime"]},
    },

    # commandment-05 cluster (s045, s046, s047)
    "session-045": {
        "aquinas": [{"chapter": "commandments-05-not-kill", "sections": ["@opening", "The Sin of Killing"]}],
        "trent": {"chapter": "commandment-05", "sections": ["@opening", "Importance Of Instruction On This Commandment", "Two Parts Of This Commandment"]},
    },
    "session-046": {"aquinas": [], "trent": None},
    "session-047": {
        "aquinas": [{"chapter": "commandments-05-not-kill", "sections": ["The Sin of Anger"]}],
        "trent": {"chapter": "commandment-05", "sections": ["Love Of Neighbour Inculcated", "How to Persuade Men to Forgive Injuries", "Remedies Against Hatred"]},
    },

    # commandment-09-10 cluster (s051, s052)
    "session-051": {"trent": {"chapter": "commandment-09-10", "sections": ["@opening", "Importance Of Instruction On These Two Commandments", "Why These Two Commandments Are Explained Here Together", "Necessity Of Promulgating These Two Commandments", "These Two Commandments Teach God's Love For Us And Our Need Of Him"]}},
    "session-052": {"trent": {"chapter": "commandment-09-10", "sections": ["Two Parts Of These Commandments", "Negative Part"]}},

    # sacraments-intro cluster (s059, s060, s061)
    "session-059": {"trent": {"chapter": "sacraments-intro", "sections": ["@opening", "Importance Of Instruction On The Sacraments", "The Word", "Definition of a Sacrament", "Constituent Parts of the Sacraments"]}},
    "session-060": {"trent": {"chapter": "sacraments-intro", "sections": ["Why the Sacraments were Instituted", "The Number Of The Sacraments", "Comparisons among the Sacraments", "Effects of the Sacraments"]}},
    "session-061": {"trent": {"chapter": "sacraments-intro", "sections": ["Other Sacred Things Signified By The Sacraments", "Ceremonies Used in the Administration of the Sacraments", "The Author of the Sacraments", "The Ministers of the Sacraments", "How to Make Instruction on the Sacraments Profitable"]}},

    # sacrament-baptism cluster (s062, s063)
    "session-062": {"trent": {"chapter": "sacrament-baptism", "sections": ["@opening", "Importance Of Instruction On Baptism", "Names of this Sacrament", "Definition Of Baptism", "Constituent Elements Of Baptism", "Matter of Baptism", "Form of Baptism", "Institution Of Baptism", "Necessity of Baptism", "Effects of Baptism"]}},
    "session-063": {"trent": {"chapter": "sacrament-baptism", "sections": ["Administration of Baptism", "The Ministers of Baptism", "The Sponsors at Baptism", "Dispositions for Baptism", "Ceremonies of Baptism", "Recapitulation"]}},

    # sacrament-confirmation cluster (s064, s065)
    "session-064": {"trent": {"chapter": "sacrament-confirmation", "sections": ["@opening", "Importance Of Instruction On Confirmation", "Name of this Sacrament", "Confirmation is a Sacrament", "Confirmation is Distinct from Baptism", "Institution of Confirmation", "Component Parts of Confirmation", "The Effects of Confirmation"]}},
    "session-065": {"trent": {"chapter": "sacrament-confirmation", "sections": ["Minister of Confirmation", "Sponsors at Confirmation", "The Subject of Confirmation", "Ceremonies Of Confirmation", "Admonition"]}},

    # sacrament-eucharist cluster (s066-s071) — the headline win
    "session-066": {"trent": {"chapter": "sacrament-eucharist", "sections": ["@opening", "Importance Of Instruction On The Eucharist", "The Eucharist Is a Sacrament Properly So Called", "Three Mysteries Of The Eucharist"]}},
    "session-067": {"trent": {"chapter": "sacrament-eucharist", "sections": ["Institution of the Eucharist", "Meaning of the Word", "Other Names Of This Sacrament", "Constituent Parts of the Eucharist"]}},
    "session-068": {"trent": {"chapter": "sacrament-eucharist", "sections": ["Threefold Manner Of Communicating", "Necessity Of Previous Preparation For Communion"]}},
    "session-069": {"trent": {"chapter": "sacrament-eucharist", "sections": ["The Obligation of Communion"]}},
    "session-070": {"trent": {"chapter": "sacrament-eucharist", "sections": ["The Effects of the Eucharist", "The Rite of Administering Communion", "The Minister of the Eucharist"]}},
    "session-071": {"trent": {"chapter": "sacrament-eucharist", "sections": ["The Eucharist as a Sacrifice"]}},

    # sacrament-penance cluster (s072-s076)
    "session-072": {"trent": {"chapter": "sacrament-penance", "sections": ["@opening", "Importance Of Instruction On This Sacrament", "The Virtue of Penance", "Why Christ Instituted This Sacrament", "Penance Is a Sacrament", "This Sacrament May Be Repeated"]}},
    "session-073": {"trent": {"chapter": "sacrament-penance", "sections": ["The Constituent Parts of Penance", "The Rites Observed", "The Second Part of Penance"]}},
    "session-074": {"trent": {"chapter": "sacrament-penance", "sections": ["The First Part of Penance"]}},
    "session-075": {"trent": {"chapter": "sacrament-penance", "sections": ["The Three Integral Parts of Penance"]}},
    "session-076": {"trent": {"chapter": "sacrament-penance", "sections": ["The Third Part of Penance", "Admonition"]}},

    # sacrament-matrimony cluster (s079, s080)
    "session-079": {"trent": {"chapter": "sacrament-matrimony", "sections": ["@opening", "Importance Of Instruction On This Sacrament", "Nature and Meaning of Marriage", "Twofold Consideration of Marriage", "Marriage before Christ", "Christ Restored to Marriage its Primitive Qualities", "The Three Blessings of Marriage", "The Recipient of Matrimony"]}},
    "session-080": {"trent": {"chapter": "sacrament-matrimony", "sections": ["The Duties of Married People", "The Rite To Be Observed", "The Impediments Of Marriage", "The Use Of Marriage"]}},

    # prayer-intro cluster (s081, s082)
    "session-081": {"trent": {"chapter": "prayer-intro", "sections": ["@opening", "Importance Of Instruction On Prayer", "Necessity of Prayer", "The Fruits of Prayer", "The Parts Of Prayer", "What We Should Pray For"]}},
    "session-082": {
        "aquinas": [],
        "trent": {"chapter": "prayer-intro", "sections": ["For Whom We Ought to Pray", "To Whom We Should Pray", "Preparation for Prayer", "How to Pray Well"]},
    },

    # creed-00-what-is-faith cluster (s001, s002, s003) — Aquinas chapter has no H2.
    # Keep s001 with full chapter; drop from s002 + s003.
    "session-002": {"aquinas": []},
    "session-003": {"aquinas": []},
}


def main():
    data = json.loads(SESSIONS.read_text(encoding="utf-8"))
    sessions = data["sessions"]

    edited = 0
    for s in sessions:
        sid = s["id"]
        if sid in PLAN:
            override = PLAN[sid]
            for key, value in override.items():
                if value is None:
                    s[key] = None if key == "trent" else []
                else:
                    s[key] = value
            edited += 1

    SESSIONS.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Updated {edited} sessions in sessions.json")


if __name__ == "__main__":
    main()
