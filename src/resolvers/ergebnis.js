import { UserInputError } from 'apollo-server';

export default {
  Query: {
    allErgebnis: async (obj, { idschueler, iddisziplinen }, { db, permission }) => {
      permission.check({ rolle: permission.SCHREIBER });

      if (idschueler) {
        const [rows] = await db.query('SELECT idergebnisse as id, wert, idschueler, iddisziplinen FROM ergebnisse WHERE idschueler = ?', [idschueler]);
        return rows;
      }
      if (iddisziplinen) {
        const [rows] = await db.query('SELECT idergebnisse as id, wert, idschueler, iddisziplinen FROM ergebnisse WHERE iddisziplinen = ?', [iddisziplinen]);
        return rows;
      }
      const [rows] = await db.query('SELECT idergebnisse as id, wert, idschueler, iddisziplinen FROM ergebnisse');
      return rows;
    },
    ergebnis: async (obj, { id }, { db, permission }) => {
      permission.check({ rolle: permission.SCHREIBER });

      const [rows] = await db.query('SELECT idergebnisse as id, wert, idschueler, iddisziplinen FROM ergebnisse WHERE idergebnisse = ?', [id]);

      if (rows.length > 0) {
        return rows[0];
      }
      throw new UserInputError('NOT_FOUND');
    },
  },
  Mutation: {
    updateErgebnis: async (obj, args, { db, permission }) => {
      permission.check({ rolle: permission.SCHREIBER });

      const [res] = await db.query('REPLACE INTO ergebnisse SET ?', args);
      return { ...args, id: res.insertId };
    },
    deleteErgebnis: async (obj, { id }, { db, permission }) => {
      permission.check({ rolle: permission.SCHREIBER });

      const [res] = await db.query('DELETE FROM ergebnisse WHERE idergebnisse = ?', [id]);

      if (res.affectedRows > 0) {
        return { id };
      }
      throw new UserInputError('NOT_FOUND');
    },
  },
};
