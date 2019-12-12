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
};
