"""
Download the original French works of St. Louis-Marie Grignion de Montfort
from livres-mystiques.com (public domain editions).

Uses requests + BeautifulSoup to extract the raw text faithfully.
Outputs into content/books/montfort-spirituality/sources/french-originals/
"""

import os
import re

import requests
from bs4 import BeautifulSoup

BASE = 'https://livres-mystiques.com/partieTEXTES/Montfort'
OUTPUT_DIR = os.path.join(
    os.path.dirname(__file__), '..', 'content', 'books',
    'montfort-spirituality', 'sources', 'french-originals',
)

WORKS = [
    {
        'slug': '01-traite-vraie-devotion',
        'title': 'Traité de la vraie dévotion à la Sainte Vierge',
        'urls': [
            f'{BASE}/Devotion/preface.html',
            f'{BASE}/Devotion/introd.html',
            f'{BASE}/Devotion/artic1a1.html',
            f'{BASE}/Devotion/artic1a2.htm',
            f'{BASE}/Devotion/fausse2.html',
            f'{BASE}/Devotion/vrai2.html',
            f'{BASE}/Devotion/prelimi2.html',
            f'{BASE}/Devotion/artic2a1.html',
            f'{BASE}/Devotion/artic2a2.html',
            f'{BASE}/Devotion/artic2a3.html',
            f'{BASE}/Devotion/artic2a4.html',
            f'{BASE}/Devotion/artic2a5.html',
            f'{BASE}/Devotion/artic2a6.html',
            f'{BASE}/Devotion/appendice.html',
        ],
    },
    {
        'slug': '02-amour-sagesse-eternelle',
        'title': "L'Amour de la Sagesse Éternelle",
        'urls': [
            f'{BASE}/Sagesse/sagesse.html',
            f'{BASE}/Sagesse/sagesse2.html',
            f'{BASE}/Sagesse/sagesse3.html',
        ],
    },
    {
        'slug': '03-secret-admirable-rosaire',
        'title': 'Le Secret admirable du très saint Rosaire',
        'urls': [f'{BASE}/rosaire.html'],
    },
    {
        'slug': '04-secret-de-marie',
        'title': 'Le Secret de Marie',
        'urls': [f'{BASE}/secret.html'],
    },
    {
        'slug': '05-lettre-amis-de-la-croix',
        'title': 'Lettre circulaire aux Amis de la Croix',
        'urls': [f'{BASE}/lettreci.html'],
    },
    {
        'slug': '06-priere-embrasee',
        'title': 'La Prière Embrasée',
        'urls': [f'{BASE}/priereem.html'],
    },
    {
        'slug': '07-regle-pretres-missionnaires',
        'title': 'Règle des Prêtres Missionnaires de la Compagnie de Marie',
        'urls': [f'{BASE}/reglemis.html'],
    },
]


def fetch_text(url: str) -> str:
    """Fetch a page and return the body text with paragraph breaks preserved."""
    resp = requests.get(url)
    resp.encoding = resp.apparent_encoding
    soup = BeautifulSoup(resp.text, 'html.parser')

    body = soup.find('body')
    if not body:
        return ''

    # Get text with double newlines as paragraph separators
    text = body.get_text(separator='\n\n')

    # Collapse runs of 3+ newlines into 2
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    for work in WORKS:
        print(f"\n{'=' * 60}")
        print(f"Downloading: {work['title']}")
        print(f"{'=' * 60}")

        parts = []
        for url in work['urls']:
            print(f"  {url}")
            text = fetch_text(url)
            if text:
                parts.append(text)
                print(f"    {len(text.split()):,} words")

        content = '\n\n---\n\n'.join(parts)
        word_count = len(content.split())

        filepath = os.path.join(OUTPUT_DIR, f"{work['slug']}.txt")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
            f.write('\n')

        print(f"  -> {filepath}")
        print(f"     {word_count:,} words total")

    print(f"\n{'=' * 60}")
    print(f"Done! Files in {OUTPUT_DIR}")
    print(f"{'=' * 60}")


if __name__ == '__main__':
    main()
