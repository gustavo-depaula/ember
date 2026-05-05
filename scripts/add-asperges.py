#!/usr/bin/env python3
"""Append the Sprinkling Rite (Aspersão) option to the Penitential Act picker."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FLOW = ROOT / "content/libraries/base/practices/mass/flow.json"

ASPERGES_OPTION = {
    "id": "of-asperges",
    "label": {
        "en-US": "Sprinkling Rite (Sundays)",
        "pt-BR": "Aspersão da Água (Domingos)",
    },
    "sections": [
        {
            "type": "rubric",
            "text": {
                "en-US": (
                    "On Sundays, especially during Easter time, the blessing and "
                    "sprinkling of water in memory of Baptism may replace the "
                    "Penitential Act."
                ),
                "pt-BR": (
                    "Aos domingos, sobretudo no Tempo Pascal, pode-se fazer a "
                    "bênção e a aspersão da água em memória do Batismo, em vez "
                    "do Ato Penitencial."
                ),
            },
        },
        {
            "type": "prayer",
            "speaker": "priest",
            "inline": {
                "pt-BR": (
                    "Meus irmãos e minhas irmãs, invoquemos o Senhor nosso "
                    "Deus, para que abençoe esta água que vai ser aspergida "
                    "sobre nós, recordando o nosso Batismo. Que ele se digne "
                    "ajudar-nos, para permanecermos fiéis ao Espírito que "
                    "recebemos."
                ),
            },
        },
        {
            "type": "rubric",
            "text": {
                "pt-BR": (
                    "Após um momento de silêncio, prossegue de mãos unidas:"
                ),
            },
        },
        {
            "type": "prayer",
            "speaker": "priest",
            "inline": {
                "pt-BR": (
                    "Deus eterno e todo-poderoso, pela água, fonte de vida e "
                    "princípio de purificação, quisestes lavar-nos do pecado e "
                    "dar-nos o prêmio da vida eterna. Neste dia que vos é "
                    "consagrado, nós vos pedimos que vos digneis abençoar ✠ "
                    "esta água, para que ela seja sinal da vossa proteção. "
                    "Renovai em nós a fonte viva da vossa graça, e libertai-nos "
                    "por ela de todo mal do espírito e do corpo, para que "
                    "possamos nos aproximar de vós com o coração puro e "
                    "receber dignamente a vossa salvação. Por Cristo, nosso "
                    "Senhor."
                ),
            },
        },
        {
            "type": "prayer",
            "speaker": "people",
            "inline": {"pt-BR": "℟. Amém."},
        },
        {
            "type": "rubric",
            "text": {
                "pt-BR": (
                    "Tomando então o aspersório, o sacerdote asperge a si "
                    "mesmo, os ministros, em seguida o clero e o povo, "
                    "percorrendo a igreja, se for oportuno. Enquanto isso, "
                    "entoa-se um dos cantos seguintes."
                ),
            },
        },
        {
            "type": "subheading",
            "text": {"pt-BR": "Antífona da Aspersão"},
        },
        {
            "type": "select",
            "on": "celebration.primary.season",
            "default": "default",
            "options": [
                {
                    "id": "easter",
                    "label": {"pt-BR": "Tempo Pascal"},
                    "sections": [
                        {
                            "type": "rubric",
                            "text": {"pt-BR": "Cf. Ez 47, 1-2.9 (Vidi aquam)"},
                        },
                        {
                            "type": "prayer",
                            "speaker": "all",
                            "inline": {
                                "pt-BR": (
                                    "Vi a água saindo do lado direito do "
                                    "templo, aleluia! E todos a quem chega "
                                    "esta água recebem a salvação e "
                                    "proclamam: aleluia, aleluia!"
                                ),
                            },
                        },
                    ],
                },
                {
                    "id": "default",
                    "label": {"pt-BR": "Padrão"},
                    "sections": [
                        {
                            "type": "rubric",
                            "text": {"pt-BR": "Cf. Sl 50, 9 (Asperges me)"},
                        },
                        {
                            "type": "prayer",
                            "speaker": "all",
                            "inline": {
                                "pt-BR": (
                                    "Aspergi-me e serei puro do pecado, e "
                                    "mais branco do que a neve ficarei."
                                ),
                            },
                        },
                    ],
                },
            ],
        },
        {
            "type": "rubric",
            "text": {
                "pt-BR": (
                    "Retornando à cadeira e terminado o canto, o sacerdote, "
                    "de pé, voltado para o povo, diz, de mãos unidas:"
                ),
            },
        },
        {
            "type": "prayer",
            "speaker": "priest",
            "inline": {
                "pt-BR": (
                    "Deus todo-poderoso nos purifique dos nossos pecados e, "
                    "pela celebração desta Eucaristia, nos torne dignos da "
                    "mesa do seu reino."
                ),
            },
        },
        {
            "type": "prayer",
            "speaker": "people",
            "inline": {"pt-BR": "℟. Amém."},
        },
        {
            "type": "rubric",
            "text": {
                "pt-BR": (
                    "Quando se realiza a aspersão da água, omite-se o Ato "
                    "Penitencial e o Senhor, tende piedade. Segue-se o Glória "
                    "(quando deve ser dito) e a Oração do dia."
                ),
            },
        },
    ],
}


def main() -> int:
    flow = json.loads(FLOW.read_text())

    inserted = [False]

    def walk(node):
        if isinstance(node, dict):
            if (
                node.get("type") == "options"
                and isinstance(node.get("label"), dict)
                and node["label"].get("pt-BR") == "Ato Penitencial"
                and isinstance(node.get("options"), list)
            ):
                # Idempotent: skip if already present.
                if any(o.get("id") == "of-asperges" for o in node["options"]):
                    return
                node["options"].append(ASPERGES_OPTION)
                inserted[0] = True
                return
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for item in node:
                walk(item)

    walk(flow)
    if not inserted[0]:
        print("ERROR: Penitential Act options widget not found", file=sys.stderr)
        return 1

    FLOW.write_text(json.dumps(flow, ensure_ascii=False, indent=2) + "\n")
    print("appended Asperges option to Penitential Act", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
