#!/usr/bin/env python3
"""Insert a Sequence dispatch (Victimae Paschali on Easter Sunday, Veni
Sancte Spiritus on Pentecost) right after the Second Reading slot.

ember-extra doesn't ship a `sequentia` field, so the text is authored
inline here (Brazilian Roman Missal). The dispatch is via `select on
celebration.id`, default `none` (renders nothing) — only Easter Sunday
and Pentecost trigger the sequence.

Idempotent: searches for an existing sequence dispatch and replaces it.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FLOW = ROOT / "content/libraries/base/practices/mass/flow.json"

SEQUENCE_DISPATCH = {
    "type": "select",
    "on": "celebration.id",
    "default": "none",
    "options": [
        {
            "id": "tempore.easter.week-1.sunday",
            "label": {"pt-BR": "Sequência (Vítima Pascal)", "en-US": "Sequence (Victimae Paschali)"},
            "sections": [
                {
                    "type": "subheading",
                    "text": {"pt-BR": "Sequência", "en-US": "Sequence"},
                },
                {
                    "type": "rubric",
                    "text": {
                        "pt-BR": "A Sequência é cantada ou recitada antes do Evangelho.",
                        "en-US": "The Sequence is sung or recited before the Gospel.",
                    },
                },
                {
                    "type": "prayer",
                    "speaker": "all",
                    "inline": {
                        "pt-BR": "À Vítima pascal cantemos louvores, ó cristãos!\nO Cordeiro redimiu as ovelhas: Cristo, que é sem pecado, reconciliou os pecadores com o Pai.\nA vida e a morte se confrontaram em prodigioso duelo: morto, o Senhor da vida agora reina vivo.\nDize-nos, ó Maria: que viste no caminho?\nVi o sepulcro do Cristo vivente e a glória do ressuscitado, vi as testemunhas angélicas, o sudário e as vestes.\nRessuscitou Cristo, minha esperança! Precederá os seus na Galileia.\nSabemos que Cristo verdadeiramente ressuscitou dos mortos. Vós, ó Rei vencedor, tende piedade de nós. Amém. Aleluia.",
                        "la": "Víctimæ pascháli laudes ímmolent christiáni.\nAgnus redémit oves: Christus ínnocens Patri reconciliávit peccatóres.\nMors et vita duéllo conflixére mirándo: dux vitæ mórtuus, regnat vivus.\nDic nobis, María, quid vidísti in via?\nSepúlcrum Christi vivéntis et glóriam vidi resurgéntis, angélicos testes, sudárium et vestes.\nSurréxit Christus spes mea: præcédet vos in Galilǽam.\nScimus Christum surrexísse a mórtuis vere: tu nobis, victor Rex, miserére. Amen. Allelúia.",
                    },
                },
            ],
        },
        {
            "id": "tempore.easter.week-8.sunday",
            "label": {"pt-BR": "Sequência (Veni Sancte Spiritus)", "en-US": "Sequence (Veni Sancte Spiritus)"},
            "sections": [
                {
                    "type": "subheading",
                    "text": {"pt-BR": "Sequência", "en-US": "Sequence"},
                },
                {
                    "type": "rubric",
                    "text": {
                        "pt-BR": "A Sequência é cantada ou recitada antes do Evangelho.",
                        "en-US": "The Sequence is sung or recited before the Gospel.",
                    },
                },
                {
                    "type": "prayer",
                    "speaker": "all",
                    "inline": {
                        "pt-BR": "Vinde, ó Santo Espírito, e enviai do céu um raio de vossa luz!\nVinde, ó Pai dos pobres, vinde, dador dos dons, vinde, luz dos corações!\nConsolador supremo, doce hóspede da alma, doce alívio nosso!\nNo trabalho, sois descanso, no calor temperamento, no pranto sois consolo!\nÓ luz beatíssima, enchei os corações de vossos fiéis até o íntimo!\nSem o vosso poder, nada há no homem, nada há que seja inocente.\nLavai o que está manchado, regai o que está ressequido, curai o que está enfermo!\nDobrai o que está endurecido, aquecei o que está frio, dirigi o que está desviado!\nDai aos vossos fiéis, que só de vós se fiam, vossos sete dons sagrados!\nDai virtudes recompensa, dai o porto da salvação, dai a alegria sem fim. Amém. Aleluia.",
                        "la": "Veni, Sancte Spíritus, et emítte cǽlitus lucis tuæ rádium.\nVeni, pater páuperum, veni, dator múnerum, veni, lumen córdium.\nConsolátor óptime, dulcis hospes ánimæ, dulce refrigérium.\nIn labóre réquies, in æstu tempéries, in fletu solátium.\nO lux beatíssima, reple cordis íntima tuórum fidélium.\nSine tuo númine, nihil est in hómine, nihil est innóxium.\nLava quod est sórdidum, riga quod est áridum, sana quod est sáucium.\nFlecte quod est rígidum, fove quod est frígidum, rege quod est dévium.\nDa tuis fidélibus, in te confidéntibus, sacrum septenárium.\nDa virtútis méritum, da salútis éxitum, da perénne gáudium. Amen. Allelúia.",
                    },
                },
            ],
        },
        {
            "id": "none",
            "label": {"pt-BR": "—", "en-US": "—"},
            "sections": [],
        },
    ],
}


def main() -> int:
    flow = json.loads(FLOW.read_text())

    # Replace any prior dispatch (idempotent re-run) before locating the
    # secondReading anchor, so we don't see a fresh one.
    spliced = False

    def is_existing_dispatch(node, i):
        n = node[i]
        return (
            isinstance(n, dict)
            and n.get("type") == "select"
            and n.get("on") == "celebration.id"
            and isinstance(n.get("options"), list)
            and any(
                isinstance(o, dict)
                and o.get("id") == "tempore.easter.week-1.sunday"
                and any(
                    s.get("type") == "subheading"
                    and isinstance(s.get("text"), dict)
                    and s["text"].get("pt-BR") == "Sequência"
                    for s in o.get("sections", [])
                )
                for o in n["options"]
            )
        )

    def is_second_reading_choice(node, i):
        n = node[i]
        return (
            isinstance(n, dict)
            and n.get("type") == "choice-rich-text"
            and n.get("slot") == "readings.default.secondReading"
        )

    def walk(node):
        nonlocal spliced
        if isinstance(node, list):
            i = 0
            while i < len(node):
                if is_existing_dispatch(node, i):
                    node[i : i + 1] = [SEQUENCE_DISPATCH]
                    spliced = True
                    return
                if is_second_reading_choice(node, i):
                    # Insert the sequence dispatch right after the second
                    # reading. If the next item is already a dispatch (re-run
                    # case missed by the idempotency check above), replace
                    # rather than insert a duplicate.
                    if i + 1 < len(node) and is_existing_dispatch(node, i + 1):
                        node[i + 1 : i + 2] = [SEQUENCE_DISPATCH]
                    else:
                        node[i + 1 : i + 1] = [SEQUENCE_DISPATCH]
                    spliced = True
                    return
                walk(node[i])
                i += 1
        elif isinstance(node, dict):
            for v in node.values():
                walk(v)

    walk(flow)
    if not spliced:
        print("ERROR: could not locate secondReading anchor", file=sys.stderr)
        return 1

    FLOW.write_text(json.dumps(flow, ensure_ascii=False, indent=2) + "\n")
    print("inserted sequence dispatch after secondReading", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
