import { UserInputError } from 'apollo-server';

const select = 'SELECT idmassstaebe as id, iddisziplinen, geschlecht, punkte, werte as wert, klassen_stufe as klassenStufe FROM massstaebe';

export default {
  Query: {
    allMassstab: async (obj, { iddisziplinen, klassenStufe }, { db, permission }) => {
      permission.check({ rolle: permission.LEITER });

      if (iddisziplinen && klassenStufe) {
        const [rows] = await db.query(
          `${select} WHERE klassen_stufe = ? AND iddisziplinen = ? AND geschlecht = ?`,
          [klassenStufe, iddisziplinen],
        );
        return rows;
      } if (iddisziplinen) {
        const [rows] = await db.query(`${select} WHERE iddisziplinen = ?`, [iddisziplinen]);
        return rows;
      } if (klassenStufe) {
        const [rows] = await db.query(`${select} WHERE klassen_stufe = ?`, [klassenStufe]);
        return rows;
      }
      const [rows] = await db.query(select);
      return rows;
    },
    massstab: async (obj, { geschlecht, iddisziplinen, klassenStufe }, { db, permission }) => {
      permission.check({ rolle: permission.LEITER });

      const [rows] = await db.query(
        `${select} WHERE geschlecht = ? AND iddisziplinen = ? AND klassen_stufe = ?`,
        [geschlecht, iddisziplinen, klassenStufe],
      );

      if (rows.length > 0) {
        return rows[0];
      }
      throw new UserInputError('NOT_FOUND');
    },
  },
};
