# Fix Liguori Liturgical Map — Pentecost/PP Misalignment

## Problem

The `meditacoes-ligorio` liturgical map has two bugs around the Pentecost–Trinity transition that cause ~25 days/year to show the wrong meditation or fall back to reserves.

### Bug 1: Missing Easter weeks 7–8 (16 days)

The EF position engine (`ef-position.ts`) maps dates as follows:

| Date | Key generated | What happens in liguori map |
|------|--------------|----------------------------|
| Ascension Friday (Easter+40) | `easter/6/5` | **No entry** → reserve fallback |
| Ascension Saturday (Easter+41) | `easter/6/6` | **No entry** → reserve fallback |
| Pre-Pentecost week (Easter+42–48) | `easter/7/0` – `easter/7/6` | **No entry** → reserve fallback |
| Pentecost Sunday (Easter+49) | `easter/8/0` | **No entry** → reserve fallback |
| Pentecost Mon–Sat (Easter+50–55) | `easter/8/1` – `easter/8/6` | **No entry** → reserve fallback |

The liguori map's Easter section ends at `easter/6/4`. The Pentecost meditation was placed at `post-pentecost/1/0` instead of `easter/8/0`, which leads to Bug 2.

### Bug 2: PP week numbering off by 1 (every PP Sunday wrong)

The code computes post-pentecost weeks from Trinity Sunday as the origin:

```
Trinity Sunday (Easter+56) → post-pentecost/1/0
2nd Sunday after Pentecost (Easter+63) → post-pentecost/2/0
```

But the liguori map has:

| Key | Liguori content | Code resolves on |
|-----|----------------|-----------------|
| `post-pentecost/1/0` | `amor-deus-com-homens-missao-espirito-santo` (Pentecost theme) | **Trinity Sunday** |
| `post-pentecost/2/0` | `festa-santissima-trindade` (Trinity theme) | **2nd Sunday after Pentecost** |
| `post-pentecost/3/0` | *missing* | 3rd Sunday after Pentecost |

Every PP Sunday meditation displays one week late. The Pentecost meditation shows on Trinity Sunday, the Trinity meditation shows the week after Trinity, etc.

### Bug 3: PP week 2–3 gap (9 days)

`post-pentecost/2/3` through `post-pentecost/3/4` are missing (9 keys). These days fall back to reserves. This is likely because the Corpus Christi and Sacred Heart octave meditations weren't mapped to the correct week/day slots.

## Impact

- **25 days/year** either show reserve-pool meditations or a thematically mismatched meditation
- All 25 PP Sundays show their meditation one week late (Pentecost on Trinity, Trinity on PP/2, etc.)
- The Pentecost Sunday meditation never surfaces on Pentecost — it shows on Trinity Sunday instead

## Root Cause

The map was likely built assuming `post-pentecost/1/0` = Pentecost Sunday, when in fact `ef-position.ts` maps:
- Pentecost Sunday → `easter/8/0` (still in Easter season, `specialDay: 'pentecost'`)
- Trinity Sunday → `post-pentecost/1/0` (PP season starts at Trinity, `specialDay: 'trinity-sunday'`)

The Pentecost–Trinity gap (Mon–Sat after Pentecost, `easter/8/1`–`easter/8/6`) is handled by the Easter season block, not the PP block.

## Fix

1. Add `easter/6/5` through `easter/8/6` entries to the temporal section (16 new keys)
2. Shift all PP entries down by 1 week: current PP/1 content → PP/1 stays (but now represents Trinity, not Pentecost), etc. — actually, the content needs to be re-examined against the book's own liturgical references to determine correct placement
3. Fill the PP/2/3–PP/3/4 gap (9 new keys)
4. Move the Pentecost meditation from `post-pentecost/1/0` to `easter/8/0`

This requires re-examining the original Liguori text to understand which meditations correspond to which liturgical days, similar to the anchor-based approach used for the Divine Intimacy map (`scripts/build-liturgical-map-id.py`).

## Discovery Context

Found while building the Divine Intimacy liturgical map. The build script initially used the liguori map as a template for valid key space, inheriting its gaps. Fixed by generating keys from first principles (all week/day combos the engine can produce).
