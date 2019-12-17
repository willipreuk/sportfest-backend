const auswertungSchueler = async (id, db) => {
  const [rows] = await db.query(
    'SELECT s.id, s.vorname, s.nachname, s.geschlecht, k.stufe, k.name FROM schueler s LEFT JOIN klassen k ON k.id = s.idklasse WHERE s.id = ?',
    [id],
  );
  const schueler = rows[0];

  const [ergebnisse] = await db.query('SELECT * FROM ergebnisse WHERE idschueler = ?', [id]);

  const promises = ergebnisse.map(async (e) => {
    const [massstaebe] = await db.query(
      'SELECT werte, punkte FROM massstaebe WHERE iddisziplin = ? AND klassenStufe = ? AND geschlecht = ?',
      [e.iddisziplin, schueler.stufe, schueler.geschlecht],
    );
    const [disziplin] = await db.query('SELECT best FROM disziplinen WHERE id = ?', [e.iddisziplin]);

    for (let i = 0; i < massstaebe.length; i += 1) {
      if (disziplin.best === 'high') {
        if (e.wert > massstaebe[i].werte) {
          return { wert: e.wert, punkte: massstaebe[i - 1].punkte, iddisziplin: e.iddisziplin };
        }
      } else if (e.wert < massstaebe[i].werte) {
        return { wert: e.wert, punkte: massstaebe[i - 1].punkte, iddisziplin: e.iddisziplin };
      }
    }

    throw new Error('ERROR_CALC_POINTS');
  });


  const res = await Promise.all(promises);
  const summePunkte = res.reduce(
    (a, b) => ({ punkte: a.punkte + b.punkte }), { punkte: 0 },
  ).punkte;

  return {
    idschueler: schueler.id,
    note: 1,
    punkte: summePunkte,
    ergebnisse: res,
  };
};

const auswertungStufe = async (klassen, geschlecht, db) => {
  const res = [];
  await Promise.all(klassen.map(async (k) => {
    const [schuelerM] = await db.query('SELECT id FROM schueler WHERE idklasse = ? AND geschlecht = ?', [k.id, geschlecht]);
    return Promise.all(schuelerM.map(async (s) => {
      res.push(await auswertungSchueler(s.id, db));
    }));
  }));
  return res;
};

export default {
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
      return schueler.map((s) => auswertungSchueler(s.id, db));
    },
    auswertungStufe: async (obj, { stufe }, { db, permission }) => {
      permission.check({ rolle: permission.LEITER });

      const [klassen] = await db.query('SELECT * FROM klassen WHERE stufe = ?', [stufe]);

      const m = auswertungStufe(klassen, 'm', db);
      const w = auswertungStufe(klassen, 'w', db);
      const tmp = await Promise.all([m, w]);

      const res = tmp.map((g) => g.sort((a, b) => b.punkte - a.punkte));
      return {
        stufe,
        bestM: res[0],
        bestW: res[1],
      };
    },
  },
};
