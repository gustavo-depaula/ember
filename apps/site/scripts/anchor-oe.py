#!/usr/bin/env python3
"""Gives œ and Œ the accent anchors the typeface forgot: anchor-oe.py in.ttf out.ttf

Liturgical Latin stresses œ (fœ́deris), which Unicode can only spell as œ plus
a combining acute. EB Garamond anchors marks on æ but not on œ, so the acute
lands on the letter's right edge. This copies æ's anchors to œ, scaled to its
width. A font that already anchors œ, or has no æ to copy, passes through.
"""
import copy
import sys

from fontTools.ttLib import TTFont

source, target = sys.argv[1:3]
font = TTFont(source)
order = font.getReverseGlyphMap()
widths = font["hmtx"].metrics

for lookup in font["GPOS"].table.LookupList.Lookup if "GPOS" in font else []:
    for subtable in lookup.SubTable:
        subtable = getattr(subtable, "ExtSubTable", subtable)
        if type(subtable).__name__ != "MarkBasePos":
            continue
        bases = subtable.BaseCoverage.glyphs
        records = subtable.BaseArray.BaseRecord
        for model, glyph in (("ae", "oe"), ("AE", "OE")):
            if model not in bases or glyph in bases or glyph not in order:
                continue
            record = copy.deepcopy(records[bases.index(model)])
            scale = widths[glyph][0] / widths[model][0]
            for anchor in record.BaseAnchor:
                if anchor:
                    anchor.XCoordinate = round(anchor.XCoordinate * scale)
            # The coverage table is ordered by glyph id, and the records follow it.
            at = sum(order[base] < order[glyph] for base in bases)
            bases.insert(at, glyph)
            records.insert(at, record)
        subtable.BaseArray.BaseCount = len(records)

font.save(target)
