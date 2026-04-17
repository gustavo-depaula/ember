#!/usr/bin/env python3
"""
Build the liturgical map for Intimità Divina by mapping meditations
to EF calendar keys. Uses the book's own liturgical references as
anchors to align Sundays correctly, then fills weekdays sequentially.

Key structure: season/week/day where day 0=Sunday, 1=Monday, ..., 6=Saturday.

EF calendar key semantics (from ef-position.ts):
- Pentecost Sunday → easter/8/0 (specialDay: 'pentecost')
- Mon-Sat after Pentecost → easter/8/1 through easter/8/6
- Trinity Sunday → post-pentecost/1/0 (specialDay: 'trinity-sunday')
- "I Domenica dopo Pentecoste" = Trinity Sunday = PP/1/0
- "N Domenica dopo Pentecoste" = PP/N/0 (NO +1 offset)
"""

import json
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent

# Load the liguori liturgical map to get the canonical key structure
liguori_path = BASE / "content/libraries/alphonsus-liguori/practices/meditacoes-ligorio/data/liturgical-map.json"
liguori = json.loads(liguori_path.read_text())

IT_DIR = BASE / "content/libraries/carmelite/books/intimita-divina/it"


def meditation_id(n):
    return f"giorno-{n:03d}"


def get_season_keys(temporal, prefix):
    """Get sorted keys for a season prefix."""
    keys = [k for k in temporal if k.startswith(prefix + "/")]
    def sort_key(k):
        parts = k.split("/")
        try:
            week = int(parts[1])
        except ValueError:
            week = 99
        try:
            day = int(parts[2])
        except (ValueError, IndexError):
            day = 0
        return (week, day)
    return sorted(keys, key=sort_key)


def parse_liturgical_refs():
    """Read liturgical references from line 2 of each meditation file."""
    refs = {}
    for n in range(1, 368):
        md_file = IT_DIR / f"giorno-{n:03d}.md"
        if md_file.exists():
            lines = md_file.read_text().split("\n")
            if len(lines) >= 2:
                ref = lines[1].strip().strip("*").strip()
                if ref:
                    refs[n] = ref
    return refs


def map_sequential(keys, start_med, end_med):
    """Simple sequential mapping of meditations to keys."""
    result = {}
    med_idx = start_med
    for key in keys:
        if med_idx <= end_med:
            result[key] = {"primary": meditation_id(med_idx)}
            med_idx += 1
    return result


def map_with_anchors(keys, anchors, start_med, end_med):
    """
    Map meditations to keys using Sunday anchors.

    anchors: list of (meditation_num, week_num) tuples where the meditation
             is a Sunday that should map to season/week_num/0.
    keys: sorted list of all available keys for this season.

    Between anchors, fill weekdays sequentially (day 1, 2, 3...).
    If more weekday meditations than slots, extras are returned as overflow.
    """
    result = {}
    overflow = []

    # Build a dict of week -> list of keys
    week_keys = {}
    for key in keys:
        parts = key.split("/")
        week = int(parts[1])
        day = int(parts[2])
        if week not in week_keys:
            week_keys[week] = {}
        week_keys[week][day] = key

    # Sort anchors by meditation number
    anchors_sorted = sorted(anchors, key=lambda x: x[0])

    # For each anchor, assign the Sunday and fill weekdays
    for anchor_idx, (med_num, week_num) in enumerate(anchors_sorted):
        # Assign Sunday
        if week_num in week_keys and 0 in week_keys[week_num]:
            result[week_keys[week_num][0]] = {"primary": meditation_id(med_num)}

        # Determine weekday meditations (everything after Sunday until next anchor)
        if anchor_idx + 1 < len(anchors_sorted):
            next_anchor_med = anchors_sorted[anchor_idx + 1][0]
        else:
            next_anchor_med = end_med + 1

        weekday_meds = list(range(med_num + 1, min(next_anchor_med, end_med + 1)))

        # Assign to weekday keys (day 1-6)
        for day_offset, wm in enumerate(weekday_meds):
            day_num = day_offset + 1  # 1=Mon, 2=Tue, ..., 6=Sat
            if day_num <= 6 and week_num in week_keys and day_num in week_keys[week_num]:
                result[week_keys[week_num][day_num]] = {"primary": meditation_id(wm)}
            elif day_num > 6:
                overflow.append(wm)

    # Handle meditations before the first anchor
    if anchors_sorted:
        first_anchor_med = anchors_sorted[0][0]
        first_anchor_week = anchors_sorted[0][1]
        pre_meds = list(range(start_med, first_anchor_med))
        if pre_meds:
            # These meditations come before the first Sunday anchor
            # Try to assign to the week before the first anchor
            prev_week = first_anchor_week - 1
            if prev_week >= 1 and prev_week in week_keys:
                for day_offset, pm in enumerate(pre_meds):
                    day_num = day_offset
                    if day_num in week_keys[prev_week]:
                        result[week_keys[prev_week][day_num]] = {"primary": meditation_id(pm)}
                    else:
                        overflow.append(pm)
            else:
                overflow.extend(pre_meds)

    return result, overflow


def build_map():
    temporal = liguori["temporal"]
    refs = parse_liturgical_refs()

    liturgical_map = {
        "temporal": {},
        "fixedDates": {},
        "feasts": {},
        "novenas": {},
        "weekdaysOfMonths": {},
        "reserves": []
    }

    overflow = []

    # ==========================================
    # ADVENT: 3 weeks, sequential (7 per week)
    # 001=I dom, 008=II dom, 015=III dom
    # ==========================================
    advent_keys = get_season_keys(temporal, "advent")
    advent_map = map_sequential(advent_keys, 1, 19)
    liturgical_map["temporal"].update(advent_map)

    # ==========================================
    # CHRISTMAS FIXED DATES: meditations 20-41
    # 022=IV dom Avvento, 026=Dec 22, ..., 041=Jan 6
    # ==========================================
    christmas_dates = {
        "12-20": 20, "12-21": 21, "12-22": 22, "12-23": 23, "12-24": 24,
        "12-25": 25,  # Natività
        "12-26": 26, "12-27": 27, "12-28": 28, "12-29": 29,
        "12-30": 30, "12-31": 31,
        "01-01": 32,  # Circoncisione
        "01-02": 33, "01-03": 34, "01-04": 35, "01-05": 36,
        "01-06": 37,  # Epifania
        "01-07": 38, "01-08": 39, "01-09": 40, "01-10": 41,
    }
    for date, med in christmas_dates.items():
        liturgical_map["fixedDates"][date] = {"primary": meditation_id(med)}

    # Christmas special temporal keys
    christmas_keys = get_season_keys(temporal, "christmas")
    if len(christmas_keys) >= 1:
        liturgical_map["temporal"][christmas_keys[0]] = {"primary": meditation_id(33)}
    if len(christmas_keys) >= 2:
        liturgical_map["temporal"][christmas_keys[1]] = {"primary": meditation_id(37)}

    # ==========================================
    # EPIPHANY: 5 weeks, sequential (7 per week)
    # 042=I dom, 049=II dom, 056=III dom, 063=IV dom, 070=V dom
    # ==========================================
    epiphany_keys = get_season_keys(temporal, "epiphany")
    # Only use first 35 keys (5 weeks)
    epiphany_keys_5w = [k for k in epiphany_keys
                        if int(k.split("/")[1]) <= 5]
    epiphany_map = map_sequential(epiphany_keys_5w, 42, 76)
    liturgical_map["temporal"].update(epiphany_map)

    # Epiphany-leftover (mirrors epiphany weeks 3-5 for short PP years)
    epiphany_leftover_keys = get_season_keys(temporal, "epiphany-leftover")
    for key in epiphany_leftover_keys:
        parts = key.split("/")
        week = int(parts[1])
        day = int(parts[2])
        if week <= 5:
            equiv_key = f"epiphany/{week}/{day}"
            if equiv_key in liturgical_map["temporal"]:
                liturgical_map["temporal"][key] = liturgical_map["temporal"][equiv_key]

    # ==========================================
    # SEPTUAGESIMA: 3 weeks, sequential (7 per week)
    # 077=Settuagesima, 084=Sessagesima, 091=Quinquagesima
    # ==========================================
    septuag_keys = get_season_keys(temporal, "septuagesima")
    septuag_map = map_sequential(septuag_keys, 77, 97)
    liturgical_map["temporal"].update(septuag_map)

    # ==========================================
    # LENT: 5 weeks, anchor-based
    # Sundays: 098=I dom, 103=II dom, 110=III dom, 117=IV dom, 124=Passione
    # ==========================================
    lent_keys = get_season_keys(temporal, "lent")
    lent_anchors = [
        (98, 1),   # I domenica di Quaresima
        (103, 2),  # II domenica
        (110, 3),  # III domenica
        (117, 4),  # IV domenica
        (124, 5),  # Domenica di Passione
    ]
    lent_map, lent_overflow = map_with_anchors(lent_keys, lent_anchors, 98, 130)
    liturgical_map["temporal"].update(lent_map)
    overflow.extend(lent_overflow)

    # ==========================================
    # HOLY WEEK: explicitly labeled, sequential
    # 131=Palm Sunday, 132=Mon, ..., 137=Holy Saturday
    # ==========================================
    hw_keys = get_season_keys(temporal, "holy-week")
    hw_map = map_sequential(hw_keys, 131, 137)
    liturgical_map["temporal"].update(hw_map)

    # ==========================================
    # FIXED FEASTS (between Holy Week and Easter)
    # 138=Purification (Feb 2), 139=S. Giuseppe (Mar 19),
    # 140=Vita di fede S. Giuseppe, 141=Annunciazione (Mar 25)
    # ==========================================
    liturgical_map["fixedDates"]["02-02"] = {"primary": meditation_id(138)}
    liturgical_map["fixedDates"]["03-19"] = {"primary": meditation_id(139)}
    liturgical_map["fixedDates"]["03-20"] = {"primary": meditation_id(140)}
    liturgical_map["fixedDates"]["03-25"] = {"primary": meditation_id(141)}

    # ==========================================
    # EASTER: anchor-based (weeks 1-7)
    # 142=Pasqua, 148=in Albis, 152=II dom, 157=III dom,
    # 163=IV dom, 169=V dom
    # Ascension (Easter+39) is in week 6 or 7
    # ==========================================
    # Generate full Easter key space weeks 1-7 (week 8 = Pentecost handled separately)
    # Don't rely on liguori which ends at easter/6/4
    easter_keys_pre_pentecost = []
    for w in range(1, 8):
        for d in range(7):
            easter_keys_pre_pentecost.append(f"easter/{w}/{d}")
    easter_anchors = [
        (142, 1),  # Domenica di Risurrezione
        (148, 2),  # Domenica in Albis
        (152, 3),  # II Domenica dopo Pasqua
        (157, 4),  # III Domenica dopo Pasqua
        (163, 5),  # IV Domenica dopo Pasqua
        (169, 6),  # V Domenica dopo Pasqua (Ascension = Thu of this week)
        (176, 7),  # VI Domenica dopo Pasqua (Sunday after Ascension)
    ]
    # Easter meditations: 142-181 (before Pentecost at 182)
    easter_map, easter_overflow = map_with_anchors(easter_keys_pre_pentecost, easter_anchors, 142, 181)
    liturgical_map["temporal"].update(easter_map)
    overflow.extend(easter_overflow)

    # ==========================================
    # PENTECOST WEEK: easter/8/0 through easter/8/6
    # Code: Pentecost Sunday = easter/8/0, Mon-Sat = easter/8/1-6
    # 182=Pentecost Sunday, 183-188=weekdays
    # ==========================================
    for day in range(7):
        key = f"easter/8/{day}"
        liturgical_map["temporal"][key] = {"primary": meditation_id(182 + day)}

    # ==========================================
    # POST-PENTECOST: anchor-based
    # PP/1/0 = Trinity Sunday = "I Domenica dopo Pentecoste"
    # PP/N/0 = "N Domenica dopo Pentecoste" (NO offset)
    # ==========================================
    # Generate full PP key space (don't rely on liguori which has gaps)
    pp_keys = []
    for w in range(1, 26):
        for d in range(7):
            pp_keys.append(f"post-pentecost/{w}/{d}")

    # Build anchors from liturgical references
    sunday_map = {}

    # Parse post-pentecost Sunday references
    for med_num, ref in refs.items():
        if med_num < 189 or med_num > 361:
            continue
        ref_lower = ref.lower()

        # "I Domenica dopo Pentecoste" = Trinity = PP/1/0
        if re.match(r'^i\s+domenica\s+d[ou]po\s+pentecoste', ref_lower):
            sunday_map[med_num] = 1
            continue

        # Match "N Domenica dopo Pentecoste" patterns
        m = re.match(r'(\w+)\s+domenica\s+d[ou]po\s+pentecoste', ref_lower)
        if m:
            roman = m.group(1).upper()
            roman_map = {
                'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6,
                'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12,
                'XIII': 13, 'XIV': 14, 'XV': 15, 'XVI': 16, 'XVII': 17,
                'XVIII': 18, 'XIX': 19, 'XX': 20, 'XXI': 21, 'XXII': 22,
                'XXIII': 23, 'XXIV': 24, 'XXV': 25,
                # OCR variants
                'IT': 2, 'IM': 3, 'TV': 4, 'VL': 6, 'VIL': 7, 'VIIL': 8,
            }
            week = roman_map.get(roman)
            if week:
                # Direct mapping: "N Domenica dopo Pentecoste" → PP/N/0
                sunday_map[med_num] = week
                continue

        # "ultima domenica dopo Pentecoste" → last PP week (25)
        if 'ultima' in ref_lower and 'domenica' in ref_lower and 'pentecoste' in ref_lower:
            max_week = max(int(k.split("/")[1]) for k in pp_keys)
            sunday_map[med_num] = max_week
            continue

        # "Domenica fra l'ottava del Corpus Domini" = II Dom. d. P. = PP/2/0
        if 'ottava' in ref_lower and 'corpus' in ref_lower and 'domenica' in ref_lower:
            sunday_map[med_num] = 2
            continue

        # "Domenica fra l'ottava del S. Cuore" = III Dom. d. P. = PP/3/0
        if 'ottava' in ref_lower and 'cuore' in ref_lower and 'domenica' in ref_lower:
            sunday_map[med_num] = 3
            continue

    # Fix OCR error: giorno-270 says "XII" but is XIII (between XII=263 and XIV=276)
    if 270 in sunday_map and sunday_map[270] == 12:
        sunday_map[270] = 13

    pp_anchors = [(med, week) for med, week in sunday_map.items()]
    pp_anchors.sort()

    # PP meditations start at 189 (Trinity) and go through 361
    pp_map, pp_overflow = map_with_anchors(pp_keys, pp_anchors, 189, 361)
    liturgical_map["temporal"].update(pp_map)
    overflow.extend(pp_overflow)

    # ==========================================
    # FIXED FEASTS at end of book
    # ==========================================
    feast_dates = {
        "10-07": 362,  # Madonna del Rosario
        "10-11": 363,  # Maternità di Maria
        "11-01": 365,  # I Santi
        "11-02": 366,  # Commemorazione dei defunti
        "11-21": 367,  # Presentazione di Maria al tempio
    }
    for date, med in feast_dates.items():
        liturgical_map["fixedDates"][date] = {"primary": meditation_id(med)}

    # Cristo Re (last Sunday of October — movable, no resolver handler yet)
    # Put in reserves since the resolver can't look up "christ-the-king"
    # It will surface via the reserve fallback mechanism.

    # ==========================================
    # RESERVES: unassigned meditations
    # ==========================================
    assigned = set()
    for section in [liturgical_map["temporal"], liturgical_map["fixedDates"], liturgical_map["feasts"]]:
        for entry in section.values():
            if isinstance(entry, dict) and "primary" in entry:
                assigned.add(entry["primary"])

    for i in range(1, 368):
        mid = meditation_id(i)
        if mid not in assigned:
            liturgical_map["reserves"].append(mid)

    # Also add overflow meditations to reserves if not already there
    for med_num in overflow:
        mid = meditation_id(med_num)
        if mid not in assigned and mid not in liturgical_map["reserves"]:
            liturgical_map["reserves"].append(mid)

    # Report
    temporal_count = len(liturgical_map["temporal"])
    fixed_count = len(liturgical_map["fixedDates"])
    feast_count = len(liturgical_map["feasts"])
    reserve_count = len(liturgical_map["reserves"])
    total_assigned = len(assigned)

    print(f"Temporal: {temporal_count} keys")
    print(f"Fixed dates: {fixed_count}")
    print(f"Feasts: {feast_count}")
    print(f"Reserves: {reserve_count}")
    print(f"Total assigned: {total_assigned}")
    print(f"Overflow (to reserves): {len(overflow)}")
    print(f"Total meditations: 367")

    # Verify all 367 are accounted for
    all_mapped = set()
    for section in [liturgical_map["temporal"], liturgical_map["fixedDates"], liturgical_map["feasts"]]:
        for entry in section.values():
            if isinstance(entry, dict) and "primary" in entry:
                all_mapped.add(entry["primary"])
    for r in liturgical_map["reserves"]:
        all_mapped.add(r)

    missing = set(meditation_id(i) for i in range(1, 368)) - all_mapped
    if missing:
        print(f"\nWARNING: {len(missing)} meditations not mapped: {sorted(missing)}")
    else:
        print(f"\nAll 367 meditations accounted for ✓")

    # Spot-check anchors
    print("\n--- Anchor verification ---")
    checks = {
        "advent/1/0": 1, "advent/2/0": 8, "advent/3/0": 15,
        "septuagesima/1/0": 77, "septuagesima/2/0": 84, "septuagesima/3/0": 91,
        "lent/1/0": 98, "lent/2/0": 103, "lent/5/0": 124,
        "holy-week/1/0": 131, "holy-week/1/4": 135, "holy-week/1/5": 136,
        "easter/1/0": 142, "easter/2/0": 148,
        # Pentecost week (easter/8)
        "easter/8/0": 182,  # Pentecost Sunday
        "easter/8/6": 188,  # Saturday after Pentecost
        # Post-Pentecost
        "post-pentecost/1/0": 189,  # Trinity Sunday (I Dom. dopo Pentecoste)
        "post-pentecost/2/0": 197,  # Dom. fra l'ottava del Corpus Domini
        "post-pentecost/3/0": 204,  # Dom. fra l'ottava del S. Cuore
        "post-pentecost/4/0": 211,  # IV Dom. dopo Pentecoste
        "post-pentecost/12/0": 263, # XII Dom. dopo Pentecoste
        "post-pentecost/13/0": 270, # XIII (mislabeled XII in OCR)
        "post-pentecost/25/0": 355, # Ultima Dom. dopo Pentecoste
    }
    for key, expected_med in checks.items():
        actual = liturgical_map["temporal"].get(key, {}).get("primary", "MISSING")
        expected = meditation_id(expected_med)
        status = "✓" if actual == expected else "✗"
        print(f"  {status} {key}: expected={expected}, actual={actual}")

    # Print PP anchor summary
    print("\n--- PP Sunday anchors found ---")
    for med, week in sorted(sunday_map.items()):
        ref = refs.get(med, "(no ref)")
        print(f"  giorno-{med:03d} → PP/{week}/0  [{ref}]")

    # Write
    out_path = BASE / "content/libraries/carmelite/practices/intimita-divina/data/liturgical-map.json"
    out_path.write_text(json.dumps(liturgical_map, ensure_ascii=False, indent=2))
    print(f"\nWrote {out_path}")


if __name__ == "__main__":
    build_map()
