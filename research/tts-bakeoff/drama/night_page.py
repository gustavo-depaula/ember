"""Lay the accent, engine and delivery trials side by side on one page: out/_listen/opcoes/.

    python3 drama/night_page.py
"""

import html
import json
import shutil
import subprocess
from pathlib import Path

here = Path(__file__).parent
out = here.parent / "out"
page = out / "_listen" / "opcoes"
page.mkdir(parents=True, exist_ok=True)


def player(src: str, label: str, note: str = "") -> str:
    small = f"<br><small>{html.escape(note)}</small>" if note else ""
    return f"<p><b>{html.escape(label)}</b>{small}<br><audio controls preload='none' src='{src}'></audio></p>"


def m4a(source: Path, name: str) -> str:
    target = page / f"{name}.m4a"
    if not target.exists() or target.stat().st_mtime < source.stat().st_mtime:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(source), "-c:a", "aac", "-b:a", "96k", str(target)], check=True)
    return target.name


parts = []

parts.append("<h2>1. Marcos 1 (Ave Maria): onze versões</h2><p>O mesmo capítulo, mudando só as vozes ou o motor. Ouça o sotaque.</p>")
versions = [
    ("mark-pt-am-chatterbox-ptbr", "I. Novo: Chatterbox (ajuste pt-BR) clonando as vozes ElevenLabs", "Tudo local, licença MIT. Mesmas vozes de referência da versão A. 2,9%."),
    ("mark-pt-am-chatterbox-v3", "J. Novo: Chatterbox multilíngue clonando as vozes ElevenLabs", "Tudo local, licença MIT. Mesmas vozes de referência da versão A. 1,4%."),
    ("mark-pt-am-kokoro", "K. Novo: Kokoro direto, elenco feito de misturas das três vozes brasileiras", "Tudo local, roda sem placa de vídeo. 0,5%."),
    ("mark-pt-am-pt-el1", "A. Vozes ElevenLabs (candidato 1), clonadas pelo Qwen", "Vozes desenhadas no ElevenLabs como brasileiras; áudio gerado de graça nesta máquina. 1,5% de palavras mal ouvidas."),
    ("mark-pt-am-pt-el2", "B. Vozes ElevenLabs (candidato 2), clonadas pelo Qwen", "Mesma descrição, segundo candidato de cada voz. 2,9%."),
    ("mark-pt-am-pt-el3", "C. Vozes ElevenLabs (candidato 3), clonadas pelo Qwen", "Terceiro candidato. 0,9%."),
    ("mark-pt-am-eleven-v4", "D. ElevenLabs v4 direto", "Elenco do candidato 1, falado pelo próprio ElevenLabs. A referência de qualidade paga. 0,6%."),
    ("mark-pt-am-eleven-v4-turbo", "E. ElevenLabs v4 Turbo direto", "Metade do preço do v4. 0,4%."),
    ("mark-pt-am-pt-sp", "F. Qwen, vozes redesenhadas pedindo sotaque paulistano", "Tudo local, sem ElevenLabs. 1,6%."),
    ("mark-pt-am-pt-kokoro", "G. Qwen clonando as vozes brasileiras do Kokoro", "Tudo local; só três vozes de referência, elenco pouco variado. 2,0%."),
    ("mark-pt-am", "H. Versão de ontem", "A que soou portuguesa com um pouco de carioca. 1,9% no livro todo."),
]
for folder, label, note in versions:
    if (out / "_listen" / folder / "mark-01.m4a").exists():
        parts.append(player(f"../{folder}/mark-01.m4a", label, note))

parts.append("<h2>2. Mark 1 em inglês: Qwen e ElevenLabs v4</h2><p>O mesmo elenco que você aprovou, nos dois motores.</p>")
parts.append(player("../mark-en/mark-01.m4a", "Qwen (local, grátis)", "1,1% de palavras mal ouvidas."))
parts.append(player("../mark-en-eleven-v4/mark-01.m4a", "ElevenLabs v4, com as mesmas vozes copiadas para lá", "0,4%."))

parts.append("<h2>3. Sussurro e grito</h2><p>Cinco falas de Marcos 1, cada uma de quatro maneiras.</p>")
plan = json.loads((out / "eleven" / "style" / "plan.json").read_text())
lines = {x["clip"]: x for x in json.loads((here / "mark" / "consult" / "pt-am" / "utterances.json").read_text())["1"]}
for clip, trial in plan.items():
    parts.append(f"<h3>{html.escape(trial['voice'])} {html.escape(trial['tag'])}</h3><p><small>{html.escape(lines[clip]['text'][:90])}…</small></p>")
    for source, label in (
        (out / "drama" / "mark" / "pt-am" / "pt-el1" / f"{clip}.wav", "Qwen, voz normal"),
        (out / "drama" / "mark" / "pt-am" / "eleven-v4" / f"{clip}.wav", "ElevenLabs v4, sem marcação"),
        (out / "eleven" / "style" / f"{clip}-tagged.wav", f"ElevenLabs v4 com a marcação {trial['tag']}"),
        (out / "eleven" / "style" / f"{clip}-qwen-styled.wav", "Qwen clonando uma referência já falada nesse tom"),
    ):
        # The trials voiced by local models were deleted to free the disk.
        if source.exists():
            parts.append(player(m4a(source, f"estilo-{clip}-{label.split()[0].lower()}-{len(label)}"), label))

parts.append("<h2>4. Candidatos de cada voz</h2><p>Três candidatos por personagem. Diga quais prefere e eu monto o elenco final.</p>")
log = json.loads((here / "voices" / "pt-el.json").read_text())
for role, entry in log.items():
    parts.append(f"<h3>{html.escape(role)}</h3><p><small>{html.escape(entry['description'])}</small></p>")
    for n in (1, 2, 3):
        shutil.copy(here / "voices" / f"pt-el{n}" / f"{role}.mp3", page / f"voz-{role}-{n}.mp3")
        parts.append(player(f"voz-{role}-{n}.mp3", f"candidato {n}"))

parts.append("<h2>5. Outros narradores</h2><p>Alternativas para a voz que lê mais da metade do texto.</p>")
alts = json.loads((here / "voices" / "pt-el-narrators" / "log.json").read_text())
for name, entry in alts.items():
    parts.append(f"<h3>{html.escape(name)}</h3><p><small>{html.escape(entry['description'])}</small></p>")
    for n in (1, 2, 3):
        shutil.copy(here / "voices" / "pt-el-narrators" / f"{name}-{n}.mp3", page / f"{name}-{n}.mp3")
        parts.append(player(f"{name}-{n}.mp3", f"candidato {n}"))

parts.append("<h2>6. Terço com ElevenLabs v4</h2><p>Na página do terço, procure as linhas <b>eleven-v4 / priest</b> em português, inglês e latim: <a href='../index.html'>comparação do terço</a>.</p>")
for variant, label in (("pt-BR", "Português"), ("en-US", "English"), ("la-ital", "Latim (voz italiana, texto reescrito)")):
    parts.append(player(f"../{variant}/eleven-v4__priest.sampler.m4a", label))

parts.append("<h2>7. Livros inteiros</h2><p><a href='../job-en/index.html'>Job (inglês)</a> · <a href='../mark-en/index.html'>Mark (inglês)</a> · <a href='../mark-pt-ms/index.html'>Marcos, Matos Soares</a> · <a href='../mark-pt-am/index.html'>Marcos, Ave Maria</a></p>")

(page / "index.html").write_text(f"""<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Opções</title>
<style>body{{font:17px/1.45 Georgia,serif;max-width:680px;margin:1rem auto;padding:0 1rem}}audio{{width:100%}}small{{color:#666}}
h2{{margin-top:2.2rem;border-top:1px solid #ccc;padding-top:1rem}}h3{{margin:1.2rem 0 .2rem}}p{{margin:.6rem 0}}</style>
<h1>Opções para ouvir</h1>
{''.join(parts)}""", encoding="utf-8")
print(page / "index.html")
