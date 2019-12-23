import { UserInputError } from 'apollo-server';
import csvParser from 'csv-parse';
import { groupBy, pullAt, mapValues } from 'lodash';

const parseCSV = (stream) => new Promise(((resolve, reject) => {
  const parser = csvParser({ delimiter: ';', from: 2 }, (err, data) => {
    if (err) reject(err);
    if (data) resolve(data);
    parser.end();
  });
  stream.pipe(parser);
}));

const schuelerRootQuery = async (obj, args, { db, permission }) => {
  permission.check({ rolle: permission.SCHREIBER });

  const [rows] = await db.query('SELECT * FROM schueler WHERE id = ?', [obj.idschueler]);
  return rows[0];
};

export default {
  Ergebnis: {
    schueler: schuelerRootQuery,
  },
  AuswertungSchueler: {
    schueler: schuelerRootQuery,
  },
  Query: {
    allSchueler: async (
      obj,
      { idklasse, offset = 0, limit = Number.MAX_SAFE_INTEGER },
      { db, permission }) => {
      permission.check({ rolle: permission.SCHREIBER });

      if (idklasse) {
        const [rows] = await db.query(
          'SELECT * FROM schueler WHERE idklasse = ? LIMIT ?, ?',
          [idklasse, offset, limit],
        );
        const [total] = await db.query('SELECT COUNT(id) FROM schueler WHERE idklasse = ?', [idklasse]);

        return { schueler: rows, total: total[0]['COUNT(id)'] };
      }
      const [rows] = await db.query('SELECT * FROM schueler LIMIT ?, ?', [offset, limit]);
      const [total] = await db.query('SELECT COUNT(id) FROM schueler', [idklasse]);

      return { schueler: rows, total: total[0]['COUNT(id)'] };
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

      const groupedByKlasse = mapValues(
        groupBy(data, '0'),
        (klasse) => klasse.map(
          (k) => { pullAt(k, 0); return k; },
        ),
      );

      let counter = 0;
      const connection = await db.getConnection();

      try {
        await connection.beginTransaction();

        await connection.query('DELETE FROM schueler');

        const promises = Object.keys(groupedByKlasse).map(async (klasse) => {
          const args = klasse.split('|');
          const [rows] = await connection.query('SELECT id FROM klassen WHERE stufe = ? AND name = ?',
            args);

          const klassenPromises = groupedByKlasse[klasse].map(async (k) => {
            k.push(rows[0].id);
            await connection.query('INSERT INTO schueler (vorname, nachname, geschlecht, idklasse) VALUES (?,?,?,?)',
              k);

            counter += 1;
          });
          await Promise.all(klassenPromises);
        });

        await Promise.all(promises);
        await connection.commit();
      } catch (e) {
        await connection.rollback();
        throw e;
      } finally {
        connection.release();
      }
      return { schuelerCount: counter };
    },
  },
};
