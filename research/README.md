# Research

Long-running investigations whose output is a method plus a text or dataset, not app code. When a result is ready to be prayed or read in Ember it graduates into `content/`; the trail that justifies it stays here.

| Project | Question |
| --- | --- |
| [`psalterium/`](psalterium/README.md) | Can frontier LLMs plus human philological sign-off produce a publication-quality pt-BR Gallican Psalter for the 1961/62 Breviary? |

A project is a folder with a `README.md` (what is being asked, where things stand) and a design doc. Everything else is up to the project — add structure when the work asks for it, not before.

Two constraints apply to all of them:

- **Nothing in `apps/` or `packages/` depends on `research/`.** Research may read from `content/`, never write to it.
- **The repo is public and public domain.** Commit only public-domain or compatibly licensed material. Copyrighted texts consulted along the way go in a `consult/` directory, which is gitignored — cite, never copy.
