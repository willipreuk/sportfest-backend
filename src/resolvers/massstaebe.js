import { UserInputError } from 'apollo-server';
import { set } from 'lodash';

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

      return rows;
    },
  },
  Mutation: {
    addMassstab: async (obj, args, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const massstab = { ...args };
      set(massstab, 'klassen_stufe', massstab.klassenStufe);
      delete massstab.klassenStufe;

      const [res] = await db.query('INSERT INTO massstaebe SET ?', massstab);

      return { ...args, id: res.insertId };
    },
    deleteMassstab: async (obj, { id }, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const [res] = await db.query('DELETE FROM massstaebe WHERE idmassstaebe = ?', [id]);

      if (res.affectedRows > 0) {
        return { id };
      }
      throw new UserInputError('NOT_FOUND');
    },
    updateMassstab: async (obj, args, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const massstab = { ...args };
      set(massstab, 'klassen_stufe', massstab.klassenStufe);
      delete massstab.id;
      delete massstab.klassenStufe;

      const [res] = await db.query('UPDATE massstaebe SET ? WHERE idmassstaebe = ?', [massstab, args.id]);
      if (res.affectedRows < 1) {
        throw new UserInputError('NOT_FOUND');
      }

      const [row] = await db.query(`${select} WHERE idmassstaebe = ?`, [args.id]);
      return row[0];
    },
  },
};
