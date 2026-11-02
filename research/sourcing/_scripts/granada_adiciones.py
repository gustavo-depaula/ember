import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from cuervo import *
L = vol(4)
KW = ("ADICIONES", "AMOR DE DIOS", "MEMORIAL", "OBRAS", "CONSIDERACIONES", "VIDA DE", "TRABAJOS", "NASCIMIENTO", "ADORACI", "HUÍDA", "HUIDA", "LAVATORIO", "HISTORIA DE LA", "ESPÍRITU", "PASIÓN")
front = [("prologo", "Prólogo", 589, 814)]
tail = [("c22-preambulo", "Capítulo XXII. Preámbulo para las consideraciones siguientes", 6439, 6477)]
cons = [(6477, "Consideración primera, del beneficio de la creación"), (6667, "Consideración segunda, del beneficio de la conservación y gobernación"), (6939, "Consideración tercera, del beneficio de la encarnación y nacimiento de Cristo"),
        (7097, "Consideración cuarta, del beneficio de la redención"), (7389, "Consideración quinta, del beneficio del bautismo y de los otros sacramentos"), (7709, "Consideración sexta, del beneficio del llamamiento y la justificación"),
        (7901, "Consideración séptima, del beneficio de la conservación en el ser espiritual de la gracia"), (8038, "Consideraciones de las perfecciones divinas: primera"), (9118, "Consideración segunda, de la hermosura de Dios"),
        (9435, "Consideración tercera, del amor que Dios nos tiene"), (9806, "Consideración cuarta, de otra causa de amar a Dios: el parentesco"), (10359, "Consideración sexta, de la semejanza que nuestra ánima tiene con Dios"),
        (10579, "Por cuántos títulos el Salvador es todo para nosotros"), (10766, "Del Cántico de los Cantares")]
for k, (st, lab) in enumerate(cons):
    tail.append(("c22-%02d" % (k + 1), lab, st, None))
meds = [(11470, "Meditaciones muy devotas: de cuánto fruto sea la consideración de la vida de Cristo"), ]
tail += [("m-c1", "Meditaciones, capítulo I", 11473, 11858), ("m-c2", "Meditaciones, capítulo II", 11858, 12264), ("m-c3", "Meditaciones, capítulo III", 12264, 14053),
         ("m-nacimiento", "Del nacimiento de Nuestro Salvador", 14053, 14502), ("m-magos", "De la adoración de los Magos", 14502, 15327), ("m-huida", "De la huida a Egipto", 15327, 17129),
         ("m-trabajos", "De los trabajos y vida de Nuestro Salvador", 17129, 18021), ("m-lavatorio", "Del lavatorio de los pies de los discípulos", 18021, 19374),
         ("m-bernardo", "Consideración de san Bernardo", 19374, 19552), ("m-pasion", "La historia de la sagrada pasión", 19552, 20751), ("m-med1", "Meditación primera", 20751, 21263),
         ("m-med2", "Meditación segunda", 21263, 22982), ("m-espiritu", "La venida del Espíritu Santo", 22982, 23594)]
secs, subs, log = assemble(L, front, 828, 6437, tail, KW)
if __name__ == "__main__":
    report(secs); print(log[:20])
