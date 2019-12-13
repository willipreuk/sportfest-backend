export default {
  Query: {
    allSchueler: async (obj, { idklasse }, { db, permission }) => {
      permission.check({ rolle: permission.SCHREIBER });

      if (idklasse) {
        const [rows] = await db.query(
          'SELECT idschueler as id, name, nachname, geschlecht, idklasse FROM schueler s LEFT JOIN klassen k on s.idklasse = k.idklassen WHERE idklasse = ?',
          [idklasse],
        );
        return rows;
      }
      const [rows] = await db.query('SELECT s.idschueler as id, s.nachname, s.vorname, s.geschlecht, s.idklasse FROM schueler s');
      return rows;
    },
    schueler: async (obj, { id }, { db, permission }) => {
      permission.check({ rolle: permission.SCHREIBER });

      const [rows] = await db.query('SELECT s.idschueler as id, s.nachname, s.vorname, s.geschlecht, s.idklasse FROM schueler s WHERE idschueler = ?', [id]);
      return rows[0];
    },
  },
};
