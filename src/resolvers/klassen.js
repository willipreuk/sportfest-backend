import { UserInputError } from 'apollo-server';

export default {
  Query: {
    allklassen: async (obj, { stufe }, { db, permission }) => {
      permission.check({ rolle: permission.LEITER });

      if (stufe) {
        const [rows] = await db.query('SELECT idklassen as id, stufe, name FROM klassen WHERE stufe = ?', [stufe]);
        return rows;
      }
      const [rows] = await db.query('SELECT idklassen as id, stufe, name FROM klassen');
      return rows;
    },
    klasse: async (obj, { id }, { db, permission }) => {
      permission.check({ rolle: permission.LEITER });

      const [rows] = await db.query('SELECT idklassen as id, stufe, name FROM klassen WHERE id = ?', [id]);
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

      const [res] = await db.query('DELETE FROM klassen WHERE idklassen = ?', [id]);
      if (res.affectedRows > 0) {
        return { id };
      }
      throw new UserInputError('NOT_FOUND');
    },
    updateKlasse: async (obj, args, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const user = { ...args };
      delete user.id;

      const [res] = await db.query('UPDATE klassen SET ? WHERE idklassen = ?', [user, args.id]);
      if (res.affectedRows < 1) {
        throw new UserInputError('NOT_FOUND');
      }

      const [rows] = await db.query('SELECT stufe, name, idklassen as id  FROM klassen WHERE idklassen = ? ', [args.id]);
      return rows[0];
    },
  },
};
