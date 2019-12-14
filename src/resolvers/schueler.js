import { UserInputError } from 'apollo-server';
import csvparser from 'csv-parse';

const parseCSV = (stream) => new Promise(((resolve, reject) => {
  const parser = csvparser({ delimiter: ';' }, (err, data) => {
    if (err) reject(err);
    if (data) resolve(data);
    parser.end();
  });
  stream.pipe(parser);
}));

export default {
  Ergebnis: {
    schueler: async (obj, args, { db, permission }) => {
      permission.check({ rolle: permission.SCHREIBER });

      const [rows] = await db.query('SELECT * FROM schueler WHERE id = ?', [obj.idschueler]);
      return rows[0];
    },
  },
  Query: {
    allSchueler: async (obj, { idklasse }, { db, permission }) => {
      permission.check({ rolle: permission.SCHREIBER });

      if (idklasse) {
        const [rows] = await db.query(
          'SELECT * FROM schueler WHERE idklasse = ?',
          [idklasse],
        );
        return rows;
      }
      const [rows] = await db.query('SELECT * FROM schueler');
      return rows;
    },
    schueler: async (obj, { id }, { db, permission }) => {
      permission.check({ rolle: permission.SCHREIBER });

      const [rows] = await db.query('SELECT * FROM schueler WHERE id = ?', [id]);
      return rows[0];
    },
  },
  Mutation: {
    addSchueler: async (obj, args, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      try {
        const [res] = await db.query('INSERT INTO schueler SET ?', args);
        return { ...args, id: res.insertId };
      } catch (e) {
        if (e.errno === 1452) {
          throw new UserInputError('KLASSE_DOES_NOT_EXIST');
        }
      }
      return null;
    },
    deleteSchueler: async (obj, { id }, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const [res] = await db.query('DELETE FROM schueler WHERE id = ?', [id]);

      if (res.affectedRows > 0) {
        return { id };
      }
      throw new UserInputError('NOT_FOUND');
    },
    updateSchueler: async (obj, args, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const schueler = { ...args };
      delete schueler.id;

      const [res] = await db.query('UPDATE schueler SET ? WHERE id = ?', [schueler, args.id]);

      if (res.affectedRows > 0) {
        const [rows] = await db.query('SELECT + FROM schueler WHERE id = ? ', [args.id]);
        return rows[0];
      }
      throw new UserInputError('NOT_FOUND');
    },
    uploadSchueler: async (obj, { file }, { db, permission }) => {
      permission.check({ rolle: permission.ADMIN });

      const { createReadStream, mimetype } = await file;

      if (mimetype !== 'text/csv') throw new UserInputError('MIMETYPE_NOT_SUPPORTED');

      const stream = createReadStream();

      const data = await parseCSV(stream);
    },
  },
};
