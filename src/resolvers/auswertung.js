import {
  flatten, groupBy, meanBy, round,
} from 'lodash';

const auswertungKlassenDisziplin = (ergebnisse, massstaebeDisziplinen) => {
  let punkte = 0;
  ergebnisse.forEach((ergebniss) => {
    const massstaebe = massstaebeDisziplinen[ergebniss.iddisziplin];
    for (let i = 0; i < massstaebe.length; i += 1) {
      if (ergebniss.wert > massstaebe[i].werte) {
        punkte += massstaebe[i - 1].punkte;
        break;
      }
    }
  });
  return punkte;
};

const calcNote = (punkte, notenMassstaebe) => {
  for (let i = 0; i < notenMassstaebe.length; i += 1) {
    if (punkte > notenMassstaebe[i].durchschnitt) {
      return notenMassstaebe[i].note;
    }
  }
  return 6;
};

const auswertungSchueler = (ergebnisse, massstaebe, notenMassstaebe) => {
  const res = ergebnisse.map((ergebniss) => {
    // Schüler verletzt und nicht mitgemacht an Station
    if (ergebniss.wert !== null) {
      const massstaebeDisziplin = massstaebe[ergebniss.iddisziplin];
      for (let i = 0; i < massstaebeDisziplin.length; i += 1) {
        if (ergebniss.wert > massstaebeDisziplin[i].werte) {
          return {
            wert: ergebniss.wert,
            punkte: massstaebeDisziplin[i - 1].punkte,
            iddisziplin: ergebniss.iddisziplin,
          };
        }
      }
    }

    return { wert: ergebniss.wert, punkte: 0, iddisziplin: ergebniss.iddisziplin };
  });

  const averagePunkte = meanBy(res, ((r) => r.punkte));
  const note = calcNote(averagePunkte, notenMassstaebe);

  return {
    idschueler: ergebnisse[0].idschueler,
    note,
    punkte: averagePunkte,
    ergebnisse: res,
  };
};

const auswertungStufe = async (stufe, geschlecht, db) => {
  const [ergebnisse] = await db.query('SELECT wert, idschueler, best, s.status, iddisziplin, allWerte, e.id FROM ergebnisse e INNER JOIN schueler s on e.idschueler = s.id INNER JOIN klassen k on s.idklasse = k.id INNER JOIN disziplinen d on e.iddisziplin = d.id WHERE k.stufe = ? AND s.geschlecht = ? ORDER BY idschueler', [stufe, geschlecht]);
  const [massstaebe] = await db.query('SELECT * FROM massstaebe WHERE klassenStufe = ? AND geschlecht = ? ORDER BY werte DESC', [stufe, geschlecht]);
  const [notenMassstaebe] = await db.query('SELECT * FROM noten_massstaebe ORDER BY durchschnitt DESC');

  const schueler = groupBy(ergebnisse, (ergebiss) => ergebiss.idschueler);
  const massstaebeGrouped = groupBy(massstaebe, (massstab) => massstab.iddisziplin);
  return Object.values(schueler).map(
    (s) => auswertungSchueler(s, massstaebeGrouped, notenMassstaebe),
  );
};

const auswertungKlasse = async (id, db) => {
  let klassenDisziplinPunkte = 0;
  const [ergebnissKlassenDisziplin] = await db.query('SELECT * FROM klassenErgebnisse e INNER JOIN klassen k on e.idklasse = k.id WHERE k.id = ?', [id]);
  if (ergebnissKlassenDisziplin.length > 0) {
    const [klassenDisziplinMassstaebe] = await db.query('SELECT * FROM massstaebe m INNER JOIN disziplinen d on m.iddisziplin = d.id WHERE m.klassenStufe = ? AND d.klasse = true ORDER BY m.werte DESC', [ergebnissKlassenDisziplin[0].stufe]);
    const massstaebeGrouped = groupBy(
      klassenDisziplinMassstaebe, (massstab) => massstab.iddisziplin,
    );
    klassenDisziplinPunkte = auswertungKlassenDisziplin(
      ergebnissKlassenDisziplin, massstaebeGrouped,
    );
  }

  const [ergebnisse] = await db.query('SELECT * FROM ergebnisse INNER JOIN schueler s on ergebnisse.idschueler = s.id INNER JOIN klassen k on s.idklasse = k.id WHERE k.id = ?', [id]);
  if (ergebnisse.length !== 0) {
    const [massstaebe] = await db.query('SELECT * FROM massstaebe WHERE klassenStufe = ? ORDER BY werte DESC', [ergebnisse[0].stufe]);
    const [notenMassstaebe] = await db.query('SELECT * FROM noten_massstaebe ORDER BY durchschnitt DESC');

    const schueler = groupBy(ergebnisse, (ergebnis) => ergebnis.idschueler);
    const grouped = groupBy(massstaebe, (m) => m.geschlecht);
    const groupedMassstaebe = {
      m: groupBy(grouped.m, (m) => m.iddisziplin),
      w: groupBy(grouped.w, (m) => m.iddisziplin),
    };

    const schuelerErgebnisse = Object.values(schueler).map(
      (s) => auswertungSchueler(s, groupedMassstaebe[s[0].geschlecht], notenMassstaebe),
    );

    return {
      schuelerAuswertung: schuelerErgebnisse,
      durchschnitt: round(
        meanBy(schuelerErgebnisse, (schuelerErgebniss) => schuelerErgebniss.punkte), 2,
      ) + klassenDisziplinPunkte,
    };
  }
};

export default {
  AuswertungStufen: {
    besteKlassen: async ({ von, bis }, args, { db, permission }) => {
      permission.check({ role: permission.LEITER });

      const allNumbers = [];
      for (let i = von; i <= bis; i += 1) {
        allNumbers.push(i);
      }

      const [klassen] = await db.query('SELECT * FROM klassen WHERE stufe IN (?)', [allNumbers]);

      const klassenAuswertung = (await Promise.all(
        klassen.map(async (klasse) => {
          const res = await auswertungKlasse(klasse.id, db);
          return { ...res, idklasse: klasse.id };
        }),
      )).filter((auswertung) => auswertung !== undefined);

      return klassenAuswertung.sort((a, b) => b.durchschnitt - a.durchschnitt);
    },
  },
  AuswertungStufe: {
    bestM: async ({ stufe }, args, { db, permission }) => {
      permission.check({ rolle: permission.LEITER });

      const best = await auswertungStufe(stufe, 'm', db);
      return best.sort((a, b) => b.punkte - a.punkte);
    },
    bestW: async ({ stufe }, args, { db, permission }) => {
      permission.check({ rolle: permission.LEITER });

      const best = await auswertungStufe(stufe, 'w', db);
      return best.sort((a, b) => b.punkte - a.punkte);
    },
  },
  Query: {
    auswertungSchueler: async (obj, { id }, { db, permission }) => {
      permission.check({ rolle: permission.LEITER });

      const [ergebnisse] = await db.query('SELECT * FROM ergebnisse LEFT JOIN schueler s on ergebnisse.idschueler = s.id LEFT JOIN klassen k on s.idklasse = k.id WHERE idschueler = ?', [id]);
      const [massstaebe] = await db.query('SELECT * FROM massstaebe WHERE klassenStufe = ? AND geschlecht = ? ORDER BY werte DESC', [ergebnisse[0].stufe, ergebnisse[0].geschlecht]);
      const [notenMassstaebe] = await db.query('SELECT * FROM noten_massstaebe ORDER BY durchschnitt DESC');

      const massstaebeGrouped = groupBy(massstaebe, (massstab) => massstab.iddisziplin);

      return auswertungSchueler(ergebnisse, massstaebeGrouped, notenMassstaebe);
    },
    auswertungKlasse: async (obj, { id }, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });
      return auswertungKlasse(id, db);
    },
    auswertungStufe: async (obj, { stufe }) => ({
      stufe,
    }),
    auswertungStufen: async (obj, { von, bis }, { db, permission }) => {
      permission.check({ rolle: permission.LEITER });

      const m = [];
      const w = [];
      for (let i = von; i <= bis; i += 1) {
        m.push(auswertungStufe(i, 'm', db));
        w.push(auswertungStufe(i, 'w', db));
      }
      const bestM = flatten(await Promise.all(m)).sort((a, b) => b.punkte - a.punkte);
      const bestW = flatten(await Promise.all(w)).sort((a, b) => b.punkte - a.punkte);
      return {
        bestM,
        bestW,
        von,
        bis,
      };
    },
  },
};
