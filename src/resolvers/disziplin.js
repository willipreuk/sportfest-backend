import { UserInputError } from 'apollo-server';

export default {
  Query: {
    allDisziplin: async (obj, { name }, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      if (name) {
        const [rows] = await db.query('SELECT name, iddisziplinen as id FROM disziplinen WHERE name = ?', [name]);
        return rows;
      }
      const [rows] = await db.query('SELECT name, iddisziplinen as id FROM disziplinen');
      return rows;
    },
    disziplin: async (obj, { id }, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const [rows] = await db.query('SELECT iddisziplinen as id, name FROM disziplinen WHERE iddisziplinen = ?', [id]);
      if (rows.length === 0) {
        throw new UserInputError('NOT_FOUND');
      }
      return rows[0];
    },
  },
};
