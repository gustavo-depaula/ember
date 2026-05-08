"""End-to-end importer tests against the synthetic ThML fixture."""

from __future__ import annotations

import json
import shutil
import tempfile
import unittest
from pathlib import Path

from ccel import markdown as md
from ccel import metadata as meta
from ccel import thml
from ccel.cli import _build_chapters


FIXTURE = Path(__file__).parent / "fixtures" / "sample.xml"


class TestMetadata(unittest.TestCase):
    def test_extracts_dc_fields(self):
        tree = thml.parse(FIXTURE.read_bytes())
        m = meta.extract(tree)
        self.assertEqual(m.title, "A Sample Devotional Treatise")
        self.assertEqual(m.author, "Anonymous")
        self.assertEqual(m.composed, 1418)
        self.assertEqual(m.language, "en-US")
        self.assertEqual(m.source_url, "https://ccel.org/ccel/anon/sample/sample.xml")

    def test_parses_composed_variants(self):
        self.assertEqual(meta._parse_composed("1418"), 1418)
        self.assertEqual(meta._parse_composed("c. 1418"), "c. 1418")
        self.assertEqual(meta._parse_composed("circa 354"), "c. 354")
        self.assertEqual(meta._parse_composed("354-430"), "354–430")
        self.assertEqual(meta._parse_composed("13th century"), "13th century")
        self.assertEqual(meta._parse_composed("13c"), "13th century")
        self.assertIsNone(meta._parse_composed(""))


class TestChapterLevel(unittest.TestCase):
    def test_explicit_level(self):
        tree = thml.parse(FIXTURE.read_bytes())
        roots = thml.walk(thml.find_body(tree))
        self.assertEqual(thml.pick_chapter_level(roots, "div2"), 2)
        self.assertEqual(thml.pick_chapter_level(roots, "div1"), 1)


class TestImporterEnd2End(unittest.TestCase):
    def setUp(self):
        self.tree = thml.parse(FIXTURE.read_bytes())
        body = thml.find_body(self.tree)
        roots = thml.walk(body)
        self.chapters = thml.flatten_chapters(roots, chapter_level=2)
        self.toc, self.files, self.stats = _build_chapters(self.chapters, language="en-US")

    def test_chapter_count(self):
        self.assertEqual(len(self.files), 4)

    def test_ids_are_ancestor_qualified(self):
        ids = {leaf for leaf, _ in self.files}
        self.assertEqual(
            ids,
            {"book-1-chapter-1", "book-1-chapter-2", "book-2-chapter-1", "book-2-chapter-2"},
        )

    def test_toc_structure(self):
        self.assertEqual(len(self.toc), 2)  # two books
        self.assertEqual(self.toc[0]["id"], "book-1")
        self.assertEqual(len(self.toc[0]["children"]), 2)
        self.assertEqual(self.toc[1]["children"][0]["id"], "book-2-chapter-1")

    def test_chapter_starts_with_h1(self):
        body = dict(self.files)["book-1-chapter-1"]
        self.assertTrue(body.startswith("# Of the Imitation of Christ"))

    def test_footnotes_converted(self):
        body = dict(self.files)["book-1-chapter-1"]
        # marker in body
        self.assertIn("[^1]", body)
        self.assertIn("[^2]", body)
        # definitions appended
        self.assertIn("[^1]: The opening sentence", body)
        self.assertIn("[^2]: Cf. Augustine", body)

    def test_scripref_inner_text_preserved(self):
        body = dict(self.files)["book-1-chapter-1"]
        self.assertIn("saith the Lord", body)
        # The passage attribute itself must not leak into output
        self.assertNotIn("John 8:12", body)
        self.assertNotIn("passage=", body)

    def test_lg_renders_as_blockquote(self):
        body = dict(self.files)["book-1-chapter-1"]
        self.assertIn("> O most sweet and loving Jesus,  ", body)
        self.assertIn("> and let no creature satisfy me without thee.", body)

    def test_list_renders_as_markdown(self):
        body = dict(self.files)["book-1-chapter-1"]
        self.assertIn("- To **fear God** and to *keep his commandments*.", body)

    def test_q_uses_curly_quotes(self):
        body = dict(self.files)["book-1-chapter-1"]
        self.assertIn("“vanity of vanities", body)
        self.assertIn("vanity”", body)

    def test_dropped_links_counted(self):
        # The <a href="ccel:augustine/confessions"> should be dropped.
        self.assertEqual(self.stats.dropped_links, 1)
        body = dict(self.files)["book-1-chapter-1"]
        self.assertIn("Augustine writes thus", body)
        self.assertNotIn("ccel:augustine", body)

    def test_pb_does_not_leak_blank_lines(self):
        body = dict(self.files)["book-1-chapter-1"]
        # No paragraph should be a lone two-space "hard break" leftover
        for line in body.splitlines():
            self.assertNotEqual(line.strip(), "", msg=line) if line == "  " else None
        self.assertNotIn("\n  \n", body)


class TestLibraryWrite(unittest.TestCase):
    def test_writes_book_json_and_chapters(self):
        from ccel.cli import CliArgs, _run

        with tempfile.TemporaryDirectory() as d:
            root = Path(d)
            args = CliArgs(
                input_path=FIXTURE,
                library="ccel-classics",
                book_id="sample-treatise",
                language="",
                chapter_level="div2",
                composed_override=None,
                author_override=None,
                title_override=None,
                library_root=root,
                dry_run=False,
            )
            self.assertEqual(_run(args), 0)
            book_dir = root / "ccel-classics" / "books" / "sample-treatise"
            self.assertTrue((book_dir / "book.json").is_file())
            manifest = json.loads((book_dir / "book.json").read_text())
            self.assertEqual(manifest["id"], "sample-treatise")
            self.assertEqual(manifest["composed"], 1418)
            files = sorted(p.name for p in (book_dir / "en-US").iterdir())
            self.assertEqual(
                files,
                [
                    "book-1-chapter-1.md",
                    "book-1-chapter-2.md",
                    "book-2-chapter-1.md",
                    "book-2-chapter-2.md",
                ],
            )


if __name__ == "__main__":
    unittest.main()
