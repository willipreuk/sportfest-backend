import { UserInputError } from 'apollo-server';

export default {
  Query: {
    allErgebnis: async (obj, { idschueler, iddisziplin }, { db, permission }) => {
      permission.check({ rolle: permission.SCHREIBER });
      // TODO: allwerte
      if (idschueler) {
        const [rows] = await db.query('SELECT * FROM ergebnisse WHERE idschueler = ?', [idschueler]);
        return rows;
      }
      if (iddisziplin) {
        const [rows] = await db.query('SELECT * FROM ergebnisse WHERE id = ?', [iddisziplin]);
        return rows;
      }
      const [rows] = await db.query('SELECT * FROM ergebnisse');
      return rows;
    },
    allErgebnisByKlasse: async (obj, { idklasse, iddisziplin }, { db, permission }) => {
      permission.check({ rolle: permission.SCHREIBER });

      const [schueler] = await db.query('SELECT * FROM schueler WHERE idklasse = ?', [idklasse]);

      const tmp = await Promise.all(schueler.map(async (s) => {
        const [ergebnisse] = await db.query('SELECT * FROM ergebnisse WHERE idschueler = ? AND iddisziplin = ?', [s.id, iddisziplin]);
        if (ergebnisse.length === 0) {
          return null;
        }
        const ergebnis = ergebnisse[0];
        ergebnis.allWerte = JSON.parse(ergebnisse[0].allWerte);
        return ergebnis;
      }));
      return tmp.filter((t) => t);
    },
    ergebnis: async (obj, { id }, { db, permission }) => {
      permission.check({ rolle: permission.SCHREIBER });

      const [rows] = await db.query('SELECT * FROM ergebnisse WHERE id = ?', [id]);
      const ergebnis = rows[0];
      ergebnis.allWerte = JSON.parse(rows[0].allWerte);
      return ergebnis;
    },
  },
  Mutation: {
    updateErgebnis: async (obj, args, { db, permission }) => {
      permission.check({ rolle: permission.SCHREIBER });
      const ergebnis = { ...args };
      ergebnis.allWerte = JSON.stringify(args.allWerte);

      const [res] = await db.query('REPLACE INTO ergebnisse SET ?', args);
      return { ...args, id: res.insertId };
    },
    deleteErgebnis: async (obj, { id }, { db, permission }) => {
      permission.check({ rolle: permission.SCHREIBER });

      const [res] = await db.query('DELETE FROM ergebnisse WHERE id = ?', [id]);

      if (res.affectedRows > 0) {
        return { id };
      }
      throw new UserInputError('NOT_FOUND');
    },
  },
};
