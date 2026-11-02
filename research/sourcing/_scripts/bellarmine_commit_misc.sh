#!/bin/bash
cd /Users/gustavo/Documents/prayer
S=research/sourcing/_scripts; B=content/books/bellarmine-opera-omnia
c() { $S/commit.sh "Import Bellarmine's $1

Vivès Opera omnia (1870-74), archive.org OCR cleaned by script (tier A). $2" "${@:3}" 2>&1 | tail -1; }
c "De officio principis christiani (la)" "t. 8. Latin only." $B/de-officio-principis
c "Italian writings of the Venetian Interdict (it)" "t. 8. Italian only; OCR slips in apostrophes and accents remain." $B/polemica/risposte-interdetto
c "Appendix de cultu imaginum (la)" "t. 7. Latin only." $B/polemica/appendix-de-cultu-imaginum
c "De indulgentiis (la)" "t. 7. Latin only." $B/polemica/de-indulgentiis
c "Judicium de libro Concordiae (la)" "t. 7. Latin only." $B/polemica/judicium-de-libro-concordiae
c "Tractatus de potestate Summi Pontificis against Barclay (la)" "t. 12. Latin only." $B/polemica/de-potestate-summi-pontificis
c "Apologia, the reply to King James I (la)" "t. 12. Latin only." $B/polemica/apologia-ad-librum-jacobi
c "Responsio ad Triplici nodo (la)" "t. 12. Latin only." $B/polemica/responsio-ad-triplici-nodo $S/bellarmine_misc.py $S/bellarmine_commit_misc.sh
c "De scriptoribus ecclesiasticis (la)" "t. 12. Latin only; the book is split into parts by length because the OCR gives no chapter headings." $B/de-scriptoribus-ecclesiasticis
