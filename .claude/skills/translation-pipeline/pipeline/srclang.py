"""The language a book is translated from: its Latin when it has `la/`, else
the original vernacular it was written in (`es-ES/` for Teresa, `it/` for Divine Intimacy, `fr-FR/` for
Francis de Sales), else `en-US/`. A book keeps `en-US/` beside its original
as a reference translation."""
import os, re


def sourceLang(book):
    if os.path.isdir(book + "/la"):
        return "la"
    originals = sorted(d for d in os.listdir(book) if re.fullmatch(r"[a-z]{2}(-[A-Z]{2})?", d) and d[:2] not in ("en", "pt") and os.path.isdir(book + "/" + d))
    return originals[0] if originals else "en-US"


if __name__ == "__main__":
    import sys
    print(sourceLang(sys.argv[1].rstrip("/")))
