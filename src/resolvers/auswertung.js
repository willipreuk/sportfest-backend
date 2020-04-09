import {
  flatten, groupBy, meanBy, round,
} from 'lodash';

const calcNote = (punkte, notenMassstaebe) => {
  for (let i = 0; i < notenMassstaebe.length; i += 1) {
    if (punkte > notenMassstaebe[i].durchschnitt) {
      return notenMassstaebe[i].note;
    }
  }
  return 6;
};

const auswertungSchueler = async (ergebnisse, massstaebe, notenMassstaebe) => {
  const promises = ergebnisse.map(async (ergebniss) => {
    // Schüler verletzt und nicht mitgemacht an Station
    if (ergebniss.wert !== null) {
      const massstaebeDisziplin = massstaebe[ergebniss.iddisziplin];

      for (let i = 0; i < massstaebeDisziplin.length; i += 1) {
        if (ergebniss.best === 'high') {
          if (ergebniss.wert > massstaebeDisziplin[i].werte) {
            return {
              wert: ergebniss.wert,
              punkte: massstaebeDisziplin[i - 1].punkte,
              iddisziplin: ergebniss.iddisziplin,
            };
          }
        } else if (ergebniss.wert < massstaebeDisziplin[i].werte) {
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


  const res = await Promise.all(promises);
  const summePunkte = res.reduce(
    (a, b) => ({ punkte: a.punkte + b.punkte }), { punkte: 0 },
  ).punkte;

  const note = await calcNote(summePunkte, notenMassstaebe);

  return {
    idschueler: ergebnisse[0].id,
    note,
    punkte: summePunkte,
    ergebnisse: res,
  };
};

const auswertungStufe = async (stufe, geschlecht, db) => {
  const [ergebnisse] = await db.query('SELECT wert, idschueler, best, s.status, iddisziplin, allWerte, e.id FROM ergebnisse e INNER JOIN schueler s on e.idschueler = s.id INNER JOIN klassen k on s.idklasse = k.id INNER JOIN disziplinen d on e.iddisziplin = d.id WHERE k.stufe = ? AND s.geschlecht = ? ORDER BY idschueler', [stufe, 'm']);
  const [massstaebe] = await db.query('SELECT * FROM massstaebe WHERE klassenStufe = ? AND geschlecht = ?', [stufe, 'm']);
  const [notenMassstaebe] = await db.query('SELECT * FROM noten_massstaebe');

  const schueler = groupBy(ergebnisse, (ergebiss) => ergebiss.idschueler);
  const massstaebeGrouped = groupBy(massstaebe, (massstab) => massstab.iddisziplin);
  return Promise.all(
    Object.values(schueler)
      .map(
        async (s) => auswertungSchueler(s, massstaebeGrouped, notenMassstaebe),
      ),
  );
};

export default {
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
      return auswertungSchueler(id, db);
    },
    auswertungKlasse: async (obj, { id }, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const [rows] = await db.query('SELECT * FROM klassen WHERE id = ?', [id]);
      const klasse = rows[0];

      const [schueler] = await db.query('SELECT id FROM schueler WHERE idklasse = ?', [klasse.id]);

      const schuelerErgebnisse = await Promise.all(
        schueler.map((s) => auswertungSchueler(s.id, db)),
      );

      return {
        schueler: schuelerErgebnisse,
        durchschnitt: round(
          meanBy(schuelerErgebnisse, (schuelerErgebniss) => schuelerErgebniss.punkte), 2,
        ),
      };
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
      };
    },
  },
};
