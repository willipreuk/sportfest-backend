import { UserInputError } from 'apollo-server';

export default {
  Query: {
    allMassstab: async (obj, { iddisziplin, klassenStufe }, { db, permission }) => {
      permission.check({ rolle: permission.LEITER });

      if (iddisziplin && klassenStufe) {
        const [rows] = await db.query(
          'SELECT * FROM massstaebe WHERE klassenStufe = ? AND iddisziplin = ?',
          [klassenStufe, iddisziplin],
        );
        return rows;
      } if (iddisziplin) {
        const [rows] = await db.query('SELECT * FROM massstaebe WHERE iddisziplinen = ?', [iddisziplin]);
        return rows;
      } if (klassenStufe) {
        const [rows] = await db.query('SELECT * FROM massstaebe WHERE klassenStufe = ?', [klassenStufe]);
        return rows;
      }
      const [rows] = await db.query('SELECT * FROM massstaebe');
      return rows;
    },
    massstab: async (obj, { geschlecht, iddisziplinen, klassenStufe }, { db, permission }) => {
      permission.check({ rolle: permission.LEITER });

      const [rows] = await db.query(
        'SELECT * FROM massstaebe WHERE geschlecht = ? AND iddisziplin = ? AND klassenStufe = ?',
        [geschlecht, iddisziplinen, klassenStufe],
      );
      return rows;
    },
  },
  Mutation: {
    addMassstab: async (obj, args, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const massstab = { ...args };

      const [res] = await db.query('INSERT INTO massstaebe SET ?', massstab);

      return { ...args, id: res.insertId };
    },
    deleteMassstab: async (obj, { id }, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const [res] = await db.query('DELETE FROM massstaebe WHERE id = ?', [id]);

      if (res.affectedRows > 0) {
        return { id };
      }
      throw new UserInputError('NOT_FOUND');
    },
    updateMassstab: async (obj, args, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const massstab = { ...args };
      delete massstab.id;

      const [res] = await db.query('UPDATE massstaebe SET ? WHERE id = ?', [massstab, args.id]);
      if (res.affectedRows < 1) {
        throw new UserInputError('NOT_FOUND');
      }

      const [row] = await db.query('SELECT * FROM massstaebe WHERE id = ?', [args.id]);
      return row[0];
    },
  },
};
