import { UserInputError } from 'apollo-server';

export default {
  Query: {
    allMassstaebe: async (obj, {
      iddisziplin, klassenStufe, offset = 0, limit = Number.MAX_SAFE_INTEGER,
    }, { db, permission }) => {
      permission.check({ rolle: permission.LEITER });

      if (iddisziplin && klassenStufe) {
        const [rows] = await db.query(
          'SELECT * FROM massstaebe WHERE klassenStufe = ? AND iddisziplin = ? LIMIT ?, ?',
          [klassenStufe, iddisziplin, offset, limit],
        );
        const [total] = await db.query('SELECT COUNT(id) FROM massstaebe WHERE klassenStufe = ? AND iddisziplin = ?', [klassenStufe, iddisziplin]);
        return { massstaebe: rows, total: total[0]['COUNT(id)'] };
      } if (iddisziplin) {
        const [rows] = await db.query('SELECT * FROM massstaebe WHERE iddisziplin = ? LIMIT ?, ?', [iddisziplin, offset, limit]);
        const [total] = await db.query('SELECT COUNT(id) FROM massstaebe WHERE iddisziplin = ?', [iddisziplin]);
        return { massstaebe: rows, total: total[0]['COUNT(id)'] };
      } if (klassenStufe) {
        const [rows] = await db.query('SELECT * FROM massstaebe WHERE klassenStufe = ? LIMIT ?, ?', [klassenStufe, offset, limit]);
        const [total] = await db.query('SELECT COUNT(id) FROM massstaebe WHERE klassenStufe = ?', [klassenStufe]);
        return { massstaebe: rows, total: total[0]['COUNT(id)'] };
      }
      const [rows] = await db.query('SELECT * FROM massstaebe LIMIT ?, ?', [offset, limit]);
      const [total] = await db.query('SELECT COUNT(id) FROM massstaebe');
      return { massstaebe: rows, total: total[0]['COUNT(id)'] };
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

      if (res.affectedRows > 0) {
        const [row] = await db.query('SELECT * FROM massstaebe WHERE id = ?', [args.id]);
        return row[0];
      }
      throw new UserInputError('NOT_FOUND');
    },
  },
};
