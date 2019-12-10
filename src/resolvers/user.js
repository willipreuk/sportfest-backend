import bcrypt from 'bcrypt';
import { UserInputError } from 'apollo-server';

export default {
  Query: {
    allUser: async (obj, args, { db }) => {
      const [rows] = await db.query('SELECT iduser AS id, username, rolle FROM user');
      return rows;
    },
    user: async (obj, { id, username }, { db }) => {
      if (username) {
        const [rows] = await db.execute('SELECT iduser AS id, username, rolle FROM user WHERE username = ?', [username]);
        return rows[0];
      }
      const [rows] = await db.execute('SELECT iduser AS id, username, rolle FROM user WHERE iduser = ?', [id]);
      return rows[0];
    },
  },
  Mutation: {
    addUser: async (obj, args, { db }) => {
      try {
        const user = args;
        user.password = await bcrypt.hash(args.password, 12);
        const [res] = await db.query('INSERT INTO user SET ?', args);
        delete user.password;
        return { ...user, id: res.insertId };
      } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') {
          throw new UserInputError(e.code);
        } else {
          throw e;
        }
      }
    },
    deleteUser: async (obj, { id }, { db }) => {
      const [rows] = await db.query('DELETE FROM user WHERE iduser = ?', [id]);
      if (rows.affectedRows > 0) {
        return { id };
      }
      throw new UserInputError('NOT_FOUND');
    },
    updateUser: async (obj, args, { db }) => {
      const newUser = { ...args };
      delete newUser.id;

      const { password } = newUser;
      if (password) {
        newUser.password = await bcrypt.hash(password, 12);
      }

      const [rows] = await db.query('UPDATE user SET ? WHERE iduser = ?', [newUser, args.id]);
      if (rows.affectedRows < 1) {
        throw new UserInputError('NOT_FOUND');
      }

      const [res] = await db.query('SELECT iduser, username, rolle, iduser AS id  FROM user WHERE iduser = ? ', [args.id]);
      return res[0];
    },
  },
};
