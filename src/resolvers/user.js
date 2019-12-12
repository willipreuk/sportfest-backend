import bcrypt from 'bcrypt';
import { UserInputError, AuthenticationError } from 'apollo-server';
import jwt from 'jsonwebtoken';

export default {
  Query: {
    allUser: async (obj, args, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const [rows] = await db.query('SELECT iduser AS id, username, rolle FROM user');
      return rows;
    },
    user: async (obj, { username, id }, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN, username, id });

      const [rows] = await db.execute('SELECT iduser AS id, username, rolle FROM user WHERE username = ?', [username]);
      return rows[0];
    },
    login: async (obj, { username, password }, { db }) => {
      const [rows] = await db.query('SELECT password, iduser as id, rolle  FROM user WHERE username = ?', [username]);
      if (rows.length < 1) {
        throw new AuthenticationError('NOT_FOUND');
      }

      if (await bcrypt.compare(password, rows[0].password)) {
        const token = jwt.sign(
          { id: rows[0].id, rolle: rows[0].rolle },
          process.env.SECURITY_PRIVATE_KEY,
        );
        return { jwt: token };
      }
      throw new AuthenticationError('WRONG_PASSWORD');
    },
  },
  Mutation: {
    addUser: async (obj, args, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      try {
        const user = args;
        user.password = await bcrypt.hash(
          args.password,
          parseInt(process.env.SECURITY_SALT_ROUNDS, 10),
        );
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
    deleteUser: async (obj, { id }, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const [rows] = await db.query('DELETE FROM user WHERE iduser = ?', [id]);
      if (rows.affectedRows > 0) {
        return { id };
      }
      throw new UserInputError('NOT_FOUND');
    },
    updateUser: async (obj, args, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN, id: args.id, username: args.username });

      const newUser = { ...args };
      delete newUser.id;

      const { password } = newUser;
      if (password) {
        newUser.password = await bcrypt.hash(
          password,
          parseInt(process.env.SECURITY_SALT_ROUNDS, 10),
        );
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
