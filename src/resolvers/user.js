import bcrypt from 'bcrypt';

export default {
  Query: {
    allUser: async (obj, args, { db }) => {
      const [rows] = await db.query('SELECT * FROM user');
      return rows;
    },
    user: async (obj, { username }, { db }) => {
      const [rows] = await db.execute('SELECT * FROM user WHERE username = ? LIMIT 1', [username]);
      return rows[0];
    },
  },
};
