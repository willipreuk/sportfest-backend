import { UserInputError } from 'apollo-server';

export default {
  Query: {
    allKlassenErgebnis: async (obj, args, { db, permission }) => {
      permission.check({ role: permission.ADMIN });

      const [rows] = await db.query('SELECT * FROM klassenErgebnisse');
      return rows;
    },
    klassenErgebnis: async (obj, { id }, { db, permission }) => {
      permission.check({ role: permission.ADMIN });
      const [rows] = await db.query('SELECT * FROM klassenErgebnisse WHERE id = ?', [id]);
      return rows[0];
    },
  },
  Mutation: {
    deleteKlassenErgebnis: async (obj, { id }, { db, permission }) => {
      permission.check({ role: permission.ADMIN });

      const [res] = await db.query('DELETE FROM klassenErgebnisse WHERE id = ?', [id]);

      if (res.affectedRows > 0) {
        return { id };
      }
      throw new UserInputError('NOT_FOUND');
    },
    updateKlassenErgebnis: async (obj, args, { db, permission }) => {
      permission.check({ role: permission.ADMIN });
      const [res] = await db.query('REPLACE INTO klassenErgebnisse SET ?', args);
      return { ...args, id: res.insertId };
    },
  },
};
