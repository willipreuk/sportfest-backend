import { UserInputError } from 'apollo-server';

const disziplinRootQuery = async (obj, args, { db, permission }) => {
  permission.check({ rolle: permission.SCHREIBER });

  const [rows] = await db.query('SELECT iddisziplinen as id, name FROM disziplinen WHERE iddisziplinen = ?', [obj.iddisziplinen]);
  return rows[0];
};

export default {
  Ergebnis: {
    disziplin: disziplinRootQuery,
  },
  Massstab: {
    disziplin: disziplinRootQuery,
  },
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
  Mutation: {
    addDisziplin: async (obj, args, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const [res] = await db.query('INSERT INTO disziplinen SET ?', [args]);
      return { ...args, id: res.insertId };
    },
    deleteDisziplin: async (obj, { id }, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const [res] = await db.query('DELETE FROM disziplinen WHERE iddisziplinen = ?', [id]);

      if (res.affectedRows > 0) {
        return { id };
      }
      throw new UserInputError('NOT_FOUND');
    },
    updateDisziplin: async (obj, args, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const disziplin = { ...args };
      delete disziplin.id;

      const [res] = await db.query('UPDATE disziplinen SET ? WHERE iddisziplinen = ?', [disziplin, args.id]);

      if (res.affectedRows < 1) {
        throw new UserInputError('NOT_FOUND');
      }

      const [rows] = await db.query('SELECT iddisziplinen as id, name FROM disziplinen WHERE iddisziplinen = ? ', [args.id]);
      return rows[0];
    },
  },
};
