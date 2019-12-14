import { UserInputError } from 'apollo-server';

export default {
  Query: {
    allErgebnis: async (obj, { idschueler, iddisziplin }, { db, permission }) => {
      permission.check({ rolle: permission.SCHREIBER });

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
    ergebnis: async (obj, { id }, { db, permission }) => {
      permission.check({ rolle: permission.SCHREIBER });

      const [rows] = await db.query('SELECT * FROM ergebnisse WHERE id = ?', [id]);

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

      const [res] = await db.query('DELETE FROM ergebnisse WHERE id = ?', [id]);

      if (res.affectedRows > 0) {
        return { id };
      }
      throw new UserInputError('NOT_FOUND');
    },
  },
};
