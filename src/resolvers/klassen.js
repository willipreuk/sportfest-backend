import { UserInputError } from 'apollo-server';

export default {
  Schueler: {
    klasse: async (obj, args, { db, permission }) => {
      permission.check({ rolle: permission.SCHREIBER });

      const [rows] = await db.query('SELECT * FROM klassen WHERE id = ?', [obj.idklasse]);
      return rows[0];
    },
  },
  Query: {
    allKlassen: async (obj, { stufe, offset = 0, limit = 1000 }, { db, permission }) => {
      permission.check({ rolle: permission.LEITER });

      if (stufe) {
        const [rows] = await db.query('SELECT * FROM klassen WHERE stufe = ? LIMIT ?, ?', [stufe, offset, limit]);
        const [total] = await db.query('SELECT COUNT(id) FROM klassen WHERE stufe = ?', [stufe]);

        return { klassen: rows, total: total[0]['COUNT(id)'] };
      }
      const [rows] = await db.query('SELECT * FROM klassen LIMIT ?, ?', [offset, limit]);
      const [total] = await db.query('SELECT COUNT(id) FROM klassen');

      return { klassen: rows, total: total[0]['COUNT(id)'] };
    },
    klasse: async (obj, { id }, { db, permission }) => {
      permission.check({ rolle: permission.LEITER });

      const [rows] = await db.query('SELECT * FROM klassen WHERE id = ?', [id]);
      return rows[0];
    },
  },
  Mutation: {
    addKlasse: async (obj, args, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const [res] = await db.query('INSERT INTO klassen SET ?', args);
      return { ...args, id: res.insertId };
    },
    deleteKlasse: async (obj, { id }, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const [res] = await db.query('DELETE FROM klassen WHERE id = ?', [id]);

      if (res.affectedRows > 0) {
        return { id };
      }
      throw new UserInputError('NOT_FOUND');
    },
    updateKlasse: async (obj, args, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const user = { ...args };
      delete user.id;

      const [res] = await db.query('UPDATE klassen SET ? WHERE id = ?', [user, args.id]);

      if (res.affectedRows > 0) {
        const [rows] = await db.query('SELECT *  FROM klassen WHERE id = ? ', [args.id]);
        return rows[0];
      }
      throw new UserInputError('NOT_FOUND');
    },
  },
};
