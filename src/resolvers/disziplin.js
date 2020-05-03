import { UserInputError } from 'apollo-server';

const disziplinRootQuery = async (obj, args, { db, permission }) => {
  permission.check({ rolle: permission.SCHREIBER });

  const [rows] = await db.query('SELECT * FROM disziplinen WHERE id = ?', [obj.iddisziplin]);
  return rows[0];
};

export default {
  Ergebnis: {
    disziplin: disziplinRootQuery,
  },
  Massstab: {
    disziplin: disziplinRootQuery,
  },
  Auswertung: {
    disziplin: disziplinRootQuery,
  },
  KlassenErgebnis: {
    disziplin: disziplinRootQuery,
  },
  Query: {
    allDisziplin: async (
      obj,
      { name, offset = 0, limit = Number.MAX_SAFE_INTEGER },
      { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      if (name) {
        const [rows] = await db.query('SELECT * FROM disziplinen WHERE name = ? LIMIT ?, ?', [name, offset, limit]);
        const [total] = await db.query('SELECT COUNT(id) FROM disziplinen WHERE name = ?', [name]);

        return { total: total[0]['COUNT(id)'], disziplinen: rows };
      }
      const [rows] = await db.query('SELECT * FROM disziplinen LIMIT ?, ?', [offset, limit]);
      const [total] = await db.query('SELECT COUNT(id) FROM disziplinen');

      return { total: total[0]['COUNT(id)'], disziplinen: rows };
    },
    disziplin: async (obj, { id }, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const [rows] = await db.query('SELECT * FROM disziplinen WHERE id = ?', [id]);
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

      const [res] = await db.query('DELETE FROM disziplinen WHERE id = ?', [id]);

      if (res.affectedRows > 0) {
        return { id };
      }
      throw new UserInputError('NOT_FOUND');
    },
    updateDisziplin: async (obj, args, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const disziplin = { ...args };
      delete disziplin.id;

      const [res] = await db.query('UPDATE disziplinen SET ? WHERE id = ?', [disziplin, args.id]);

      if (res.affectedRows > 0) {
        const [rows] = await db.query('SELECT * FROM disziplinen WHERE id = ? ', [args.id]);
        return rows[0];
      }
      throw new UserInputError('NOT_FOUND');
    },
  },
};
