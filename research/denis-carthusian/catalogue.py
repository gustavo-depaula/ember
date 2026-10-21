"""Every work of the Opera Omnia, and the running heads that mark its pages.

    .venv/bin/python catalogue.py            # write works/<slug>.json for each work
    .venv/bin/python catalogue.py --report   # show each work's leaves, and the heads no rule claimed

A work is found by its running head, not by leaf numbers typed by hand: each
leaf's head is reduced to a key (`head_key`), and the first rule of the volume
whose pattern matches the key claims the leaf. A leaf with no head, or with a
preface's head (Præfatio, Proœmium, Epistola nuncupatoria), belongs to the work
that follows it, since an edition prints the preface and the title page before
the text. Indexes are dropped. A leaf whose head matches nothing sits between two
leaves of one work as noise (a misread head), and goes to that work.

Genesis is not here: works/genesis.json was written by hand for the pilot and
has been proofread.
"""

import argparse
import json
import re
import sys
from pathlib import Path

from run_volumes import data

here = Path(__file__).parent

author = {"la": "Dionysius Cartusianus", "en-US": "Denis the Carthusian", "pt-BR": "Dionísio, o Cartuxo"}

# (slug, group, Latin title, English title, Portuguese title, [(tomus, head pattern), …])
# Patterns match the key of a running head (see head_key): upper case, Œ read as Æ,
# the chapter, article and book numbers removed.
scripture = [
    ("enarratio-in-exodum", "Enarratio in Exodum", "Commentary on Exodus", "Comentário ao Êxodo", [(1, "EXOD"), (2, "EXOD")]),
    ("enarratio-in-leviticum", "Enarratio in Leviticum", "Commentary on Leviticus", "Comentário ao Levítico", [(2, "LEVITIC")]),
    ("enarratio-in-numeros", "Enarratio in librum Numerorum", "Commentary on Numbers", "Comentário aos Números", [(2, "NUMER")]),
    ("enarratio-in-deuteronomium", "Enarratio in Deuteronomium", "Commentary on Deuteronomy", "Comentário ao Deuteronômio", [(2, "DEUTERONOM")]),
    ("epilogatio-in-pentateuchum", "Epilogatio in Pentateuchum", "Epilogue to the Pentateuch", "Epílogo ao Pentateuco", [(2, "EPILOGATIO")]),
    ("enarratio-in-josue", "Enarratio in librum Josue", "Commentary on Joshua", "Comentário a Josué", [(3, "JOSU")]),
    ("enarratio-in-judices", "Enarratio in librum Judicum", "Commentary on Judges", "Comentário aos Juízes", [(3, "JUDICUM")]),
    ("enarratio-in-ruth", "Enarratio in librum Ruth", "Commentary on Ruth", "Comentário a Rute", [(3, "RUTH")]),
    ("enarratio-in-i-regum", "Enarratio in librum primum Regum", "Commentary on 1 Samuel (1 Kings)", "Comentário a 1 Samuel (1 Reis)", [(3, "PRIMI REGUM")]),
    ("enarratio-in-ii-regum", "Enarratio in librum secundum Regum", "Commentary on 2 Samuel (2 Kings)", "Comentário a 2 Samuel (2 Reis)", [(3, "SECUNDI REGUM")]),
    ("enarratio-in-iii-regum", "Enarratio in librum tertium Regum", "Commentary on 1 Kings (3 Kings)", "Comentário a 1 Reis (3 Reis)", [(3, "TERT\\w* REGUM")]),
    ("enarratio-in-iv-regum", "Enarratio in librum quartum Regum", "Commentary on 2 Kings (4 Kings)", "Comentário a 2 Reis (4 Reis)", [(4, "QUARTI REGUM")]),
    ("enarratio-in-i-paralipomenon", "Enarratio in librum primum Paralipomenon", "Commentary on 1 Chronicles", "Comentário a 1 Crônicas", [(4, "PRIMI PARAL")]),
    ("enarratio-in-ii-paralipomenon", "Enarratio in librum secundum Paralipomenon, cum expositione orationis Manassæ", "Commentary on 2 Chronicles, with the Prayer of Manasseh", "Comentário a 2 Crônicas, com a Oração de Manassés", [(4, "SECUNDI PARAL|SEQUIN|PARALOMP|MANASS")]),
    ("enarratio-in-job", "Enarratio in librum Job", "Commentary on Job", "Comentário a Jó", [(4, "JOB"), (5, "JOB")]),
    ("de-causa-diversitatis-eventuum-humanorum", "De causa diversitatis eventuum humanorum", "On Why Human Fortunes Differ", "Sobre a causa da diversidade dos acontecimentos humanos", [(5, "DIVERSITATIS")]),
    ("enarratio-in-tobiam", "Enarratio in librum Tobiæ", "Commentary on Tobit", "Comentário a Tobias", [(5, "TOB")]),
    ("enarratio-in-judith", "Enarratio in librum Judith", "Commentary on Judith", "Comentário a Judite", [(5, "JUDITH")]),
    ("enarratio-in-esther", "Enarratio in librum Esther", "Commentary on Esther", "Comentário a Ester", [(5, "ESTHER")]),
    ("enarratio-in-i-esdrae", "Enarratio in librum primum Esdræ", "Commentary on Ezra", "Comentário a Esdras", [(5, "PRIMI ESD")]),
    ("enarratio-in-ii-esdrae", "Enarratio in librum secundum Esdræ", "Commentary on Nehemiah (2 Ezra)", "Comentário a Neemias (2 Esdras)", [(5, "SECUNDI ES")]),
    ("enarratio-in-i-machabaeorum", "Enarratio in librum primum Machabæorum", "Commentary on 1 Maccabees", "Comentário a 1 Macabeus", [(5, "PRIMI MACH")]),
    ("enarratio-in-ii-machabaeorum", "Enarratio in librum secundum Machabæorum", "Commentary on 2 Maccabees", "Comentário a 2 Macabeus", [(5, "SECUNDI MACH")]),
    ("commentaria-in-psalmos", "Commentaria in Psalmos Davidicos", "Commentary on the Psalms", "Comentário aos Salmos", [(5, "PSALM"), (6, "PSALM")]),
    ("de-modo-devote-psallendi", "De modo devote psallendi", "On Saying the Psalms Devoutly", "Sobre o modo de salmodiar com devoção", [(6, "PSALLENDI")]),
    ("enarratio-in-proverbia", "Enarratio in librum Proverbiorum", "Commentary on Proverbs", "Comentário aos Provérbios", [(7, "PROVERB")]),
    ("enarratio-in-ecclesiasten", "Enarratio in librum Ecclesiastæ", "Commentary on Ecclesiastes", "Comentário ao Eclesiastes", [(7, "ECCLESIAST[ÆE]")]),
    ("enarratio-in-canticum-canticorum", "Enarratio in Canticum Canticorum", "Commentary on the Song of Songs", "Comentário ao Cântico dos Cânticos", [(7, "CANTIC")]),
    ("enarratio-in-sapientiam", "Enarratio in librum Sapientiæ", "Commentary on Wisdom", "Comentário à Sabedoria", [(7, "SAPIENT")]),
    ("enarratio-in-ecclesiasticum", "Enarratio in librum Ecclesiastici", "Commentary on Sirach", "Comentário ao Eclesiástico", [(8, "ECC\\w*SIASTICI")]),
    ("enarratio-in-isaiam", "Enarratio in Isaiam", "Commentary on Isaiah", "Comentário a Isaías", [(8, "IS[AI]|ILE")]),
    ("enarratio-in-jeremiam", "Enarratio in Jeremiam", "Commentary on Jeremiah", "Comentário a Jeremias", [(9, "JEREM")]),
    ("enarratio-in-threnos", "Enarratio in Threnos", "Commentary on Lamentations", "Comentário às Lamentações", [(9, "THREN")]),
    ("enarratio-in-baruch", "Enarratio in librum Baruch", "Commentary on Baruch", "Comentário a Baruc", [(9, "BARUCH")]),
    ("enarratio-in-ezechielem", "Enarratio in Ezechielem", "Commentary on Ezekiel", "Comentário a Ezequiel", [(9, "EZECH")]),
    ("enarratio-in-danielem", "Enarratio in Danielem", "Commentary on Daniel", "Comentário a Daniel", [(10, "DANIEL")]),
    ("enarratio-in-osee", "Enarratio in Osee", "Commentary on Hosea", "Comentário a Oseias", [(10, "OSEE|INSTRUMENTO")]),
    ("enarratio-in-joelem", "Enarratio in Joelem", "Commentary on Joel", "Comentário a Joel", [(10, "J[ÆO]E?L")]),
    ("enarratio-in-amos", "Enarratio in Amos", "Commentary on Amos", "Comentário a Amós", [(10, "AMOS")]),
    ("enarratio-in-abdiam", "Enarratio in Abdiam", "Commentary on Obadiah", "Comentário a Abdias", [(10, "ABDI")]),
    ("enarratio-in-jonam", "Enarratio in Jonam", "Commentary on Jonah", "Comentário a Jonas", [(10, "JON|JUNE")]),
    ("enarratio-in-michaeam", "Enarratio in Michæam", "Commentary on Micah", "Comentário a Miqueias", [(10, "MICH")]),
    ("enarratio-in-nahum", "Enarratio in Nahum", "Commentary on Nahum", "Comentário a Naum", [(10, "NAHUM")]),
    ("enarratio-in-habacuc", "Enarratio in Habacuc", "Commentary on Habakkuk", "Comentário a Habacuc", [(10, "HABAC")]),
    ("enarratio-in-sophoniam", "Enarratio in Sophoniam", "Commentary on Zephaniah", "Comentário a Sofonias", [(10, "SOPHON")]),
    ("enarratio-in-aggaeum", "Enarratio in Aggæum", "Commentary on Haggai", "Comentário a Ageu", [(10, "AGG")]),
    ("enarratio-in-zachariam", "Enarratio in Zachariam", "Commentary on Zechariah", "Comentário a Zacarias", [(10, "ZACHAR")]),
    ("enarratio-in-malachiam", "Enarratio in Malachiam", "Commentary on Malachi", "Comentário a Malaquias", [(10, "MALACH")]),
    ("enarratio-in-matthaeum", "Enarratio in Evangelium secundum Matthæum", "Commentary on Matthew", "Comentário a Mateus", [(11, "MATTH|MATRIS")]),
    ("enarratio-in-marcum", "Enarratio in Evangelium secundum Marcum", "Commentary on Mark", "Comentário a Marcos", [(11, "MARC")]),
    ("enarratio-in-lucam", "Enarratio in Evangelium secundum Lucam", "Commentary on Luke", "Comentário a Lucas", [(11, "LUC"), (12, "LUC")]),
    ("enarratio-in-joannem", "Enarratio in Evangelium secundum Joannem", "Commentary on John", "Comentário a João", [(12, "JOANN")]),
    ("enarratio-in-romanos", "Enarratio in Epistolam ad Romanos", "Commentary on Romans", "Comentário aos Romanos", [(13, "ROMAN|TALENTS")]),
    ("enarratio-in-i-corinthios", "Enarratio in Epistolam I ad Corinthios", "Commentary on 1 Corinthians", "Comentário a 1 Coríntios", [(13, "\\bI\\.? B\\. PAULI AD CORINTH")]),
    ("enarratio-in-ii-corinthios", "Enarratio in Epistolam II ad Corinthios", "Commentary on 2 Corinthians", "Comentário a 2 Coríntios", [(13, "II B\\. PAULI AD CORINTH")]),
    ("enarratio-in-galatas", "Enarratio in Epistolam ad Galatas", "Commentary on Galatians", "Comentário aos Gálatas", [(13, "GALAT")]),
    ("enarratio-in-ephesios", "Enarratio in Epistolam ad Ephesios", "Commentary on Ephesians", "Comentário aos Efésios", [(13, "EPHES")]),
    ("enarratio-in-philippenses", "Enarratio in Epistolam ad Philippenses", "Commentary on Philippians", "Comentário aos Filipenses", [(13, "PHILIPP")]),
    ("enarratio-in-colossenses", "Enarratio in Epistolam ad Colossenses", "Commentary on Colossians", "Comentário aos Colossenses", [(13, "COLOSS")]),
    ("enarratio-in-i-thessalonicenses", "Enarratio in Epistolam I ad Thessalonicenses", "Commentary on 1 Thessalonians", "Comentário a 1 Tessalonicenses", [(13, "\\bI\\.? B\\. PAULI AD THESS")]),
    ("enarratio-in-ii-thessalonicenses", "Enarratio in Epistolam II ad Thessalonicenses", "Commentary on 2 Thessalonians", "Comentário a 2 Tessalonicenses", [(13, "II B\\. PAULI AD THESS|GAT\\.")]),
    ("enarratio-in-i-timotheum", "Enarratio in Epistolam I ad Timotheum", "Commentary on 1 Timothy", "Comentário a 1 Timóteo", [(13, "\\bI\\.? B\\. PAULI AD TIM")]),
    ("enarratio-in-ii-timotheum", "Enarratio in Epistolam II ad Timotheum", "Commentary on 2 Timothy", "Comentário a 2 Timóteo", [(13, "II B\\. PAULI AD TIM")]),
    ("enarratio-in-titum-et-philemonem", "Enarratio in Epistolas ad Titum et ad Philemonem", "Commentary on Titus and Philemon", "Comentário a Tito e a Filêmon", [(13, "TITUM|PHILEM")]),
    ("enarratio-in-hebraeos", "Enarratio in Epistolam ad Hebræos", "Commentary on Hebrews", "Comentário aos Hebreus", [(13, "HEBR")]),
    ("enarratio-in-jacobum", "Enarratio in Epistolam B. Jacobi", "Commentary on James", "Comentário a Tiago", [(13, "JACOBI")]),
    ("enarratio-in-i-petri", "Enarratio in Epistolam I B. Petri", "Commentary on 1 Peter", "Comentário a 1 Pedro", [(13, "\\bI\\.? B\\. PETRI")]),
    ("enarratio-in-ii-petri", "Enarratio in Epistolam II B. Petri", "Commentary on 2 Peter", "Comentário a 2 Pedro", [(13, "II B\\. PETRI")]),
    ("enarratio-in-epistolas-joannis", "Enarratio in Epistolas B. Joannis", "Commentary on the Letters of John", "Comentário às Cartas de João", [(14, "B\\. JOANNIS")]),
    ("enarratio-in-judam", "Enarratio in Epistolam B. Judæ", "Commentary on Jude", "Comentário a Judas", [(14, "JUD[ÆE]")]),
    ("enarratio-in-actus-apostolorum", "Enarratio in Actus Apostolorum", "Commentary on the Acts of the Apostles", "Comentário aos Atos dos Apóstolos", [(14, "ACTU")]),
    ("enarratio-in-apocalypsim", "Enarratio in Apocalypsim", "Commentary on the Apocalypse", "Comentário ao Apocalipse", [(14, "APOCAL|PAR[ÆE]NESIS")]),
    ("enarratio-in-psalmum-poenitentialem", "Enarratio in Psalmos pœnitentiales", "Commentary on the Penitential Psalms", "Comentário aos Salmos penitenciais", [(14, "P[ÆO]+NITENTIAL")]),
    ("monopanton", "Monopanton, seu redactio omnium epistolarum Pauli in unum", "Monopanton: All of Paul's Letters Gathered into One", "Monopanton: todas as cartas de Paulo reunidas numa só", [(14, "MONOPANTON")]),
    ("epitome-sacrae-scripturae", "Epitome Sacræ Scripturæ", "Summary of Holy Scripture", "Epítome da Sagrada Escritura", [(14, "EPITOME")]),
]

areopagite = [
    ("in-coelestem-hierarchiam", "In librum De cœlesti hierarchia", "On the Celestial Hierarchy", "Sobre a Hierarquia Celeste", [(15, "C\\w*ESTI HIERARCH|FRAGMENTUM|ANASTASII")]),
    ("in-ecclesiasticam-hierarchiam", "In librum De ecclesiastica hierarchia", "On the Ecclesiastical Hierarchy", "Sobre a Hierarquia Eclesiástica", [(15, "ECCLESIASTICA HIERARCH")]),
    ("in-divina-nomina", "In librum De divinis nominibus", "On the Divine Names", "Sobre os Nomes Divinos", [(16, "DIVINIS NOMIN")]),
    ("in-mysticam-theologiam", "In librum De mystica theologia, cum difficultatum absolutionibus", "On the Mystical Theology", "Sobre a Teologia Mística", [(16, "MYSTICA|DIFFICULTAT")]),
    ("in-epistolas-dionysii", "In Epistolas S. Dionysii", "On the Letters of Dionysius", "Sobre as Cartas de Dionísio", [(16, "EPISTO|TRANSLATIO")]),
]

theology = [
    ("summa-fidei-orthodoxae", "Summa fidei orthodoxæ", "Summa of the Orthodox Faith", "Suma da fé ortodoxa", [(17, "SUMM"), (18, "SUMM")]),
    ("dialogion-de-fide-catholica", "Dialogion de fide catholica", "Dialogue on the Catholic Faith", "Diálogo sobre a fé católica", [(18, "DIALOG")]),
    ("in-i-sententiarum", "In librum I Sententiarum", "On the First Book of the Sentences", "Sobre o primeiro livro das Sentenças", [(19, "."), (20, ".")]),
    ("in-ii-sententiarum", "In librum II Sententiarum", "On the Second Book of the Sentences", "Sobre o segundo livro das Sentenças", [(21, "."), (22, ".")]),
    ("in-iii-sententiarum", "In librum III Sententiarum", "On the Third Book of the Sentences", "Sobre o terceiro livro das Sentenças", [(23, ".")]),
    ("in-iv-sententiarum", "In librum IV Sententiarum", "On the Fourth Book of the Sentences", "Sobre o quarto livro das Sentenças", [(24, "."), (25, ".")]),
]

masters = [
    ("in-boetium-de-consolatione", "Enarrationes in V libros Boetii De consolatione philosophiæ", "On Boethius's Consolation of Philosophy", "Sobre a Consolação da Filosofia de Boécio", [(26, ".")]),
    ("in-cassiani-instituta", "In De institutis cœnobiorum Cassiani", "On Cassian's Institutes", "Sobre as Instituições de Cassiano", [(27, "INSTITUT")]),
    ("in-cassiani-collationes", "In Collationes SS. Patrum Cassiani", "On Cassian's Conferences", "Sobre as Conferências de Cassiano", [(27, "COLLATION")]),
    ("in-scalam-paradisi", "In Scalam Paradisi S. Joannis Climaci", "On the Ladder of Paradise of St John Climacus", "Sobre a Escada do Paraíso de São João Clímaco", [(28, ".")]),
]

sermons = [
    ("sermones-de-tempore-i", "Sermones de tempore, pars prima", "Sermons for the Sundays, Part One (Advent to Easter)", "Sermões dominicais, primeira parte (do Advento à Páscoa)", [(29, ".")]),
    ("sermones-de-tempore-ii", "Sermones de tempore, pars secunda", "Sermons for the Sundays, Part Two (Easter to the Last Sunday after Trinity)", "Sermões dominicais, segunda parte (da Páscoa ao último domingo depois da Trindade)", [(30, ".")]),
    ("sermones-de-sanctis-i", "Sermones de sanctis et festis, pars prima", "Sermons for the Saints and Feasts, Part One (St Andrew to Holy Thursday)", "Sermões dos santos e festas, primeira parte (de Santo André à Quinta-feira Santa)", [(31, "^(IN |AD |EPISTOLA)(?!.*PASSIO)")]),
    ("passio-juxta-quatuor-evangelistas", "Passio D. N. Jesu Christi juxta IV Evangelistas", "The Passion of Our Lord according to the Four Evangelists", "A Paixão de Nosso Senhor segundo os quatro Evangelistas", [(31, "PASSIO")]),
    ("sermones-de-sanctis-ii", "Sermones de sanctis et festis, pars secunda", "Sermons for the Saints and Feasts, Part Two (Easter Week to the Dedication of a Church)", "Sermões dos santos e festas, segunda parte (da Semana Santa à Dedicação da Igreja)", [(31, "^FERIA"), (32, ".")]),
]

minora = [
    ("elementatio-philosophica", "Elementatio philosophica", "Elements of Philosophy", "Elementos de filosofia", [(33, "ELEMENTATIO PHILOS")]),
    ("elementatio-theologica", "Elementatio theologica", "Elements of Theology", "Elementos de teologia", [(33, "ELEMENTATIO THEOL")]),
    ("de-lumine-christianae-theoriae", "De lumine christianæ theoriæ", "On the Light of Christian Wisdom", "Sobre a luz da sabedoria cristã", [(33, "LUMINE")]),
    ("de-natura-aeterni-et-veri-dei", "De natura æterni et veri Dei", "On the Nature of the Eternal and True God", "Sobre a natureza do Deus eterno e verdadeiro", [(34, "NATURA")]),
    ("creaturarum-consideratio-theologica", "Creaturarum in ordine ad Deum consideratio theologica", "The Creatures Considered in Their Order to God", "As criaturas consideradas em sua ordem para Deus", [(34, "CREATURARUM")]),
    ("de-venustate-mundi", "De venustate mundi et pulchritudine Dei", "On the Beauty of the World and of God", "Sobre a formosura do mundo e a beleza de Deus", [(34, "VENUSTATE")]),
    ("de-distantia-perfectionis", "De distantia perfectionis divinæ et humanæ", "On How Far Divine Perfection Exceeds Human", "Sobre a distância entre a perfeição divina e a humana", [(34, "DISTANTIA")]),
    ("de-munificentia-dei", "De munificentia et beneficiis Dei", "On the Bounty and Benefits of God", "Sobre a munificência e os benefícios de Deus", [(34, "MUNIFICENTIA")]),
    ("de-laudibus-dei", "De laudibus Dei", "On the Praises of God", "Sobre os louvores de Deus", [(34, "^DE LAUDIBUS DEI")]),
    ("de-laudibus-superlaudabilis-dei", "De laudibus superlaudabilis Dei", "On the Praises of God beyond All Praise", "Sobre os louvores do Deus acima de todo louvor", [(34, "SUPERLAUDABILIS")]),
    ("expositio-hymnorum", "Expositio hymnorum", "Commentary on the Hymns", "Comentário aos hinos", [(35, "HYMNI")]),
    ("de-laudibus-trinitatis", "De laudibus sanctissimæ et individuæ Trinitatis, per modum horarum", "Hours in Praise of the Most Holy Trinity", "Horas em louvor da Santíssima Trindade", [(35, "TRINITATIS")]),
    ("de-donis-spiritus-sancti", "De donis Spiritus Sancti", "On the Gifts of the Holy Spirit", "Sobre os dons do Espírito Santo", [(35, "DONIS")]),
    ("de-passione-domini-dialogus", "De passione Domini Salvatoris dialogus", "Dialogue on the Passion of the Lord", "Diálogo sobre a Paixão do Senhor", [(35, "PASSIONE DOMINI SALV")]),
    ("horae-de-passione", "Horæ de passione Domini", "Hours of the Passion", "Horas da Paixão", [(35, "HOR")]),
    ("expositio-missae", "Expositio Missæ", "Commentary on the Mass", "Comentário à Missa", [(35, "EXPOSITIO MISS")]),
    ("de-sacramento-altaris", "De sacramento altaris et missæ celebratione dialogus", "Dialogue on the Sacrament of the Altar and the Celebration of Mass", "Diálogo sobre o Sacramento do Altar e a celebração da Missa", [(35, "ALTARIS")]),
    ("de-sacra-communione-frequentanda", "De sacra communione frequentanda", "On Frequent Holy Communion", "Sobre a comunhão frequente", [(35, "COMMUNIONE")]),
    ("de-sacramento-eucharistiae-sermones", "De sacramento Eucharistiæ sermones sex", "Six Sermons on the Sacrament of the Eucharist", "Seis sermões sobre o Sacramento da Eucaristia", [(35, "EUCHARISTI")]),
    ("de-praeconio-et-dignitate-mariae", "De præconio et dignitate Mariæ", "On the Praise and Dignity of Mary", "Sobre o louvor e a dignidade de Maria", [(35, "PR[ÆE]CONIO")]),
    ("de-dignitate-et-laudibus-mariae", "De dignitate et laudibus B. V. Mariæ", "On the Dignity and Praises of the Blessed Virgin Mary", "Sobre a dignidade e os louvores da Bem-aventurada Virgem Maria", [(36, "DIGNITATE ET LAUDIBUS")]),
    ("de-mutua-cognitione-beatorum", "De mutua cognitione beatorum in patria", "On the Blessed Knowing One Another in Heaven", "Sobre o conhecimento mútuo dos bem-aventurados na pátria", [(36, "MUTUA")]),
    ("de-modo-agendi-processiones", "De modo agendi processiones, sanctorumque veneratione", "On Holding Processions and Venerating the Saints", "Sobre o modo de fazer procissões e venerar os santos", [(36, "PROCESSION")]),
    ("contra-vitia-superstitionum", "Contra vitia superstitionum", "Against the Vices of Superstition", "Contra os vícios das superstições", [(36, "SUPERSTITION")]),
    ("contra-perfidiam-mahometi", "Contra perfidiam Mahometi", "Against the Errors of Muhammad", "Contra a perfídia de Maomé", [(36, "MAHOMET")]),
    ("dialogus-inter-christianum-et-sarracenum", "Dialogus disputationis inter Christianum et Sarracenum", "Disputation between a Christian and a Saracen", "Disputa entre um cristão e um sarraceno", [(36, "SARRACEN")]),
    ("epistola-ad-principes-catholicos", "Epistola ad principes catholicos", "Letter to the Catholic Princes", "Carta aos príncipes católicos", [(36, "PRINCIPES")]),
    ("de-auctoritate-summi-pontificis", "De auctoritate Summi Pontificis et generalis Concilii", "On the Authority of the Pope and of a General Council", "Sobre a autoridade do Sumo Pontífice e do concílio geral", [(36, "AUCTORITATE")]),
    ("de-regimine-politiae", "De regimine politiæ", "On Government", "Sobre o governo", [(38, "REGIMINE")]),
    ("de-vita-conjugatorum", "De laudabili vita conjugatorum", "On the Praiseworthy Life of the Married", "Sobre a vida louvável dos casados", [(38, "CONJUGAT")]),
    ("de-vita-viduarum", "De laudabili vita viduarum, cum epistola contra avaritiam", "On the Praiseworthy Life of Widows", "Sobre a vida louvável das viúvas", [(38, "VIDUA")]),
    ("de-vita-virginum", "De laudabili vita virginum", "On the Praiseworthy Life of Virgins", "Sobre a vida louvável das virgens", [(38, "VIRGINUM")]),
    ("inter-jesum-et-senem-et-puerum-dialogi", "Inter Jesum et senem, et inter Jesum et puerum dialogi", "Dialogues of Jesus with an Old Man and with a Boy", "Diálogos de Jesus com um ancião e com um menino", [(38, "INTER JESUM")]),
    ("de-reformatione-claustralium", "De reformatione claustralium", "On the Reform of Religious", "Sobre a reforma dos religiosos", [(38, "REFORMATIONE [A-Z]*STRALIUM")]),
    ("de-reformatione-monialium", "De reformatione monialium dialogus", "Dialogue on the Reform of Nuns", "Diálogo sobre a reforma das monjas", [(38, "MONIALIUM")]),
    ("de-vita-et-fine-solitarii", "De vita et fine solitarii", "On the Life and End of the Solitary", "Sobre a vida e o fim do solitário", [(38, "FINE SOLITARII")]),
    ("de-laude-vitae-solitariae", "De laude et commendatione vitæ solitariæ", "In Praise of the Solitary Life", "Em louvor da vida solitária", [(38, "VIT[ÆE] SOLITARI")]),
    ("de-vita-inclusarum", "De vita inclusarum", "On the Life of Anchoresses", "Sobre a vida das reclusas", [(38, "INCLUSARUM")]),
    ("de-praeconio-ordinis-cartusiensis", "De præconio sive laude Ordinis Cartusiensis", "In Praise of the Carthusian Order", "Em louvor da Ordem Cartuxa", [(38, "CARTUSIENS")]),
    ("in-regulam-s-francisci", "Enarratio in tertiam regulam S. Francisci", "Commentary on the Third Rule of St Francis", "Comentário à terceira regra de São Francisco", [(38, "FRANCISCI")]),
    ("de-obedientia-superioribus-praestanda", "De obedientia superioribus præstanda", "On the Obedience Owed to Superiors", "Sobre a obediência devida aos superiores", [(38, "OBEDIENTIA")]),
    ("exhortatorium-noviciorum", "Exhortatorium noviciorum", "Exhortation to Novices", "Exortação aos noviços", [(38, "NOVICIOR")]),
    ("de-professione-monastica", "De professione monastica", "On Monastic Profession", "Sobre a profissão monástica", [(38, "PROFESSIONE")]),
    ("summa-de-vitiis-et-virtutibus", "Summa de vitiis et virtutibus", "Summa of the Vices and Virtues", "Suma dos vícios e das virtudes", [(39, "VITIIS ET VIRTUT")]),
    ("contra-pluralitatem-beneficiorum", "Contra pluralitatem beneficiorum", "Against Holding Several Benefices", "Contra a pluralidade de benefícios", [(39, "PLURALITATEM")]),
    ("contra-simoniam", "Contra simoniam", "Against Simony", "Contra a simonia", [(39, "SIMONIAM")]),
    ("contra-ambitionem", "Contra ambitionem", "Against Ambition", "Contra a ambição", [(39, "AMBITIONEM")]),
    ("de-gravitate-peccati", "De gravitate et enormitate peccati", "On the Gravity and Enormity of Sin", "Sobre a gravidade e a enormidade do pecado", [(39, "GRAVITATE")]),
    ("de-conversione-peccatorum", "Speculum sive dialogus de conversione peccatorum", "Mirror, or Dialogue on the Conversion of Sinners", "Espelho, ou diálogo sobre a conversão dos pecadores", [(39, "CONVERSIONE")]),
    ("de-arcta-via-salutis", "De arcta via salutis ac mundi contemptu", "On the Narrow Way of Salvation and Contempt of the World", "Sobre o caminho estreito da salvação e o desprezo do mundo", [(39, "ARCTA")]),
    ("speculum-amatorum-mundi", "Speculum amatorum mundi", "Mirror for Lovers of the World", "Espelho dos amantes do mundo", [(39, "AMATORUM")]),
    ("de-doctrina-et-regulis-vitae-christianorum", "De doctrina et regulis vitæ christianorum", "On the Teaching and Rules of the Christian Life", "Sobre a doutrina e as regras da vida cristã", [(39, "DOCTRINA")]),
    ("de-exemplis-et-documentis", "De exemplis et documentis authenticis", "On Authentic Examples and Teachings", "Sobre exemplos e ensinamentos autênticos", [(39, "EXEMPLIS")]),
    ("de-oratione", "De oratione", "On Prayer", "Sobre a oração", [(41, "^DE ORATIONE")]),
    ("de-meditatione", "De meditatione", "On Meditation", "Sobre a meditação", [(41, "MEDITATIONE")]),
    ("de-fonte-lucis", "De fonte lucis ac semitis vitæ", "On the Fount of Light and the Paths of Life", "Sobre a fonte da luz e as veredas da vida", [(41, "FONTE LUCIS")]),
    ("de-contemplatione", "De contemplatione", "On Contemplation", "Sobre a contemplação", [(41, "CONTEMPLATIONE")]),
    ("sonus-epulantis", "Sonus epulantis", "The Sound of One Feasting", "O som de quem se banqueteia", [(41, "SONUS")]),
    ("inflammatorium-divini-amoris", "Inflammatorium divini amoris, dialogus", "The Kindling of Divine Love: a Dialogue", "Inflamatório do amor divino: diálogo", [(41, "INFLAMMATORIUM")]),
    ("de-perfectione-caritatis", "De perfectione caritatis dialogus", "Dialogue on the Perfection of Charity", "Diálogo sobre a perfeição da caridade", [(41, "CARITATIS")]),
    ("de-particulari-judicio", "De particulari judicio in obitu singulorum dialogus", "Dialogue on the Particular Judgment at Each One's Death", "Diálogo sobre o juízo particular na morte de cada um", [(41, "JUDICIO IN OBITU")]),
    ("de-quatuor-hominis-novissimis", "De quatuor hominis novissimis", "On the Four Last Things", "Sobre os quatro novíssimos do homem", [(41, "NOVISSIMIS")]),
    ("sermones-et-epistolae-varia", "Sermones et epistolæ varia", "Assorted Sermons and Letters", "Sermões e cartas diversos", [(41, "SERMO|EPISTOLA|JUDICIO MORTIS|PROTESTATIO")]),
]

# Genesis has its own, proofread work file (works/genesis.json); its leaves are claimed here only to keep them out of its neighbours.
skip = [(1, "GENES|ENARETIO|EX SANCTORUM")]

front = [
    ("vita-et-opera", "Vita V. P. Dionysii Cartusiani et elenchus operum", "The Life of Denis the Carthusian, and the List of His Works", "A vida de Dionísio, o Cartuxo, e o catálogo das suas obras", [(1, "VITA|ELENCHUS|PROTESTATIO|HOUGHTON|RELIQUI|^PR[ÆE]FATIO$|^[IVXLC]+$")]),
]

groups = [
    ("commentaries", scripture, "Denis the Carthusian's commentary, literal and then mystical, from the Montreuil edition."),
    ("areopagite", areopagite, "Denis the Carthusian's commentary on the Areopagite, printed beside the Latin versions of Eriugena, Sarracenus, Traversari and Ficino and the paraphrase of Thomas Gallus."),
    ("theology", theology, "A theological work of Denis the Carthusian."),
    ("masters", masters, "Denis the Carthusian's commentary, article by article."),
    ("sermons", sermons, "Sermons of Denis the Carthusian for the Church's year."),
    ("opera-minora", minora, "One of Denis the Carthusian's minor works."),
    ("vita", front, "The edition's preface, the life of Denis by his confrère Dietrich Loer, and the editors' catalogue of his works."),
]
descriptions_pt = {
    "commentaries": "O comentário de Dionísio, o Cartuxo, literal e depois místico, da edição de Montreuil.",
    "areopagite": "O comentário de Dionísio, o Cartuxo, ao Areopagita, impresso ao lado das versões latinas de Erígena, Sarraceno, Traversari e Ficino e da paráfrase de Tomás Galo.",
    "theology": "Uma obra teológica de Dionísio, o Cartuxo.",
    "masters": "O comentário de Dionísio, o Cartuxo, artigo por artigo.",
    "sermons": "Sermões de Dionísio, o Cartuxo, para o ano litúrgico.",
    "opera-minora": "Uma das obras menores de Dionísio, o Cartuxo.",
    "vita": "O prefácio da edição, a vida de Dionísio escrita pelo seu confrade Teodorico Loer e o catálogo das suas obras feito pelos editores.",
}

preface = re.compile(r"^(PR[ÆE]FATI|PRO[ÆEOC]*MIUM|PROLOGUS|EPISTOLA (NUNCUPATORIA|DEDICATORIA)|D\. DIONYSII PR|TITULI|EPITOM[ÆE] DISTINCT|QU[ÆE]STION|QU[ÆE]STIUNCUL)")
index = re.compile(r"^(INDEX|LOCA|LOGA|NOMENCLATURE|AD [A-Z]* QUI ROMANO)|TEXTU MAGISTR")


def head_key(title: str) -> str:
    t = title.upper().replace("Œ", "Æ").replace("OE", "Æ").replace("LÆ", "IÆ").replace("ISALE", "ISAIÆ")
    t = re.split(r"\s[—–]\s|;|\. —|, —", t)[0]
    t = re.sub(r",?\s*(LIBER|TRACTATUS)\s+[IVXLCH]+\.?$", "", t)
    t = re.sub(r"\b(IN )?(CAP|CAPITULUM|CAPUT|C|AP|CP|CA)\.?\s*[IVXLCUH]+\.?", "", t)
    t = re.sub(r"\bET [IVXLC]+\b|\d+", "", t)
    return re.sub(r"\s+", " ", t).strip(" .,;:—-")


def leaf_heads(volume: str) -> list[tuple[str, str]]:
    out = []
    for raw in sorted((data / "dots" / volume).glob("*.raw.txt")):
        try:
            cells = json.loads(raw.read_text())
        except json.JSONDecodeError:
            cells = []
        heads = [c.get("text", "") for c in cells if c.get("category") == "Page-header"]
        title = next((h for h in heads if not re.fullmatch(r"[\d\s]+", h.strip()) and len(h) > 5), "")
        out.append((raw.name[:4], head_key(title) if title else ""))
    return out


def text_length(volume: str, leaf: str) -> int:
    path = data / "dots" / volume / f"{leaf}.md"
    return len(path.read_text()) if path.exists() else 0


def segment() -> tuple[dict, list]:
    """Assign each leaf of each volume to a work: {slug: [(volume, [leaves])]}, plus the unclaimed heads."""
    volumes = {int(t): v for v, _, t in (l.split() for l in (here / "volumes.txt").read_text().splitlines() if not l.startswith("#"))}
    rules = {}
    for tomus, pattern in skip:
        rules.setdefault(tomus, []).append(("-skip", re.compile(pattern)))
    for group, works, _ in groups:
        for slug, *_, heads in works:
            for tomus, pattern in heads:
                rules.setdefault(tomus, []).append((slug, re.compile(pattern)))
    found, unclaimed = {}, []
    for tomus, volume in sorted(volumes.items()):
        if tomus not in rules:
            continue
        leaves = leaf_heads(volume)
        owner = []
        for leaf, key in leaves:
            if index.search(key):
                owner.append("-")
            elif not key or preface.match(key):
                owner.append(None)
            else:
                slug = next((s for s, p in rules[tomus] if p.search(key)), "?")
                if slug == "?":
                    unclaimed.append((tomus, leaf, key))
                owner.append(slug)
        # A misread head between two leaves of one work belongs to it; next to an index, to the index.
        for i, o in enumerate(owner):
            if o == "?":
                before = next((x for x in reversed(owner[:i]) if x not in (None, "?")), None)
                after = next((x for x in owner[i + 1:] if x not in (None, "?")), None)
                owner[i] = before if before == after else "-" if "-" in (before, after) else (after or before)
        # Prefaces and title pages go with the work that follows, but not the volume's
        # own front matter (before the first preface or work). A leaf with no head but
        # a full page of text is the previous work's, its head lost to the OCR.
        first = next(i for i, o in enumerate(owner) if o not in (None, "-"))
        start = first
        # The work's first page often has no running head: keep the text pages
        # right before it, but not the volume's title leaves.
        # A preface's headed pages may sit a few blank leaves further back.
        while True:
            if start > 0 and owner[start - 1] is None and text_length(volume, leaves[start - 1][0]) > 1500:
                start -= 1
                continue
            back = [j for j in range(start - 1, max(-1, start - 7), -1)]
            back = back[:next((i for i, j in enumerate(back) if owner[j] is not None), len(back))]
            headed = [j for j in back if leaves[j][1]]
            if not headed:
                break
            start = min(headed)
        following = None
        for i in range(len(owner) - 1, -1, -1):
            if owner[i] is None:
                owner[i] = following if i >= start else None
            else:
                following = None if owner[i] == "-" else owner[i]
        for i in range(1, len(owner)):
            if not leaves[i][1] and owner[i] != owner[i - 1] and owner[i - 1] not in (None, "-") and text_length(volume, leaves[i][0]) > 1500:
                owner[i] = owner[i - 1]
        for (leaf, _), o in zip(leaves, owner):
            if o and o not in ("-", "-skip"):
                parts = found.setdefault(o, [])
                if not parts or parts[-1][0] != volume:
                    parts.append((volume, []))
                parts[-1][1].append(leaf)
    return found, unclaimed


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--report", action="store_true")
    args = parser.parse_args()
    found, unclaimed = segment()
    if args.report:
        for group, works, _ in groups:
            for slug, *_ in works:
                parts = found.get(slug, [])
                spans = "; ".join(f"{v} {ls[0]}–{ls[-1]} ({len(ls)}, {int(ls[-1]) - int(ls[0]) + 1 - len(ls)} out of order)" for v, ls in parts)
                print(f"{group:13} {slug:45} {spans or 'NOT FOUND'}")
        for tomus, leaf, key in unclaimed:
            print(f"unclaimed: t{tomus} {leaf} {key}", file=sys.stderr)
        return
    (here / "works").mkdir(exist_ok=True)
    for group, works, description in groups:
        for slug, la, en, pt, heads in works:
            parts = found.get(slug)
            if not parts:
                raise SystemExit(f"{slug}: no leaves found")
            tomi = sorted({t for t, _ in heads})
            tomi_text = ", ".join(roman(t) for t in tomi)
            work = {
                "parts": [{"volume": v, "leaves": ls} for v, ls in parts],
                "path": f"denis-opera-omnia/{group}/{slug}",
                "slug": slug,
                "draft": True,
                "meta": {
                    "id": f"denis-{slug}",
                    "cover": "label",
                    "name": {"la": la, "en-US": en, "pt-BR": pt},
                    "author": author,
                    "description": {
                        "la": la + ".",
                        "en-US": f"{description} Uncorrected OCR text: not yet proofread against the scans.",
                        "pt-BR": f"{descriptions_pt[group]} Texto do OCR ainda não revisto contra as digitalizações.",
                    },
                    "sources": [{
                        "language": "la",
                        "url": f"https://archive.org/details/{parts[0][0]}",
                        "description": f"Doctoris Ecstatici D. Dionysii Cartusiani Opera Omnia, tom. {tomi_text} (Monstrolii–Tornaci, 1896–1913). Text read from the scans with dots.mocr and not yet proofread (research/denis-carthusian).",
                    }],
                },
            }
            if group == "commentaries":
                work["toc_group"] = (
                    {"pattern": r"PSALM\w*\.?\s+([IVXLCUH]+)", "label": {"la": "Psalmus {n}", "en-US": "Psalm {n}", "pt-BR": "Salmo {n}"}}
                    if "psalm" in slug else
                    {"pattern": r"CAP\.?\s*([IVXLCUH]+)\b", "label": {"la": "Caput {n}", "en-US": "Chapter {n}", "pt-BR": "Capítulo {n}"}}
                )
            (here / "works" / f"{slug}.json").write_text(json.dumps(work, ensure_ascii=False, indent=2) + "\n")


def roman(n: int) -> str:
    out = ""
    for value, letters in ((40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")):
        while n >= value:
            out, n = out + letters, n - value
    return out


if __name__ == "__main__":
    main()
