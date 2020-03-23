import mysql from 'mysql2';
import fs from 'fs';
import path from 'path';

const readDefaultSQL = async () => new Promise(((resolve, reject) => fs.readFile(path.join(__dirname, 'defaults.sql'), (err, data) => {
  if (err) reject(err);
  resolve(data.toString());
})));

export default async () => {
  let connection = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
  });
  connection = connection.promise();

  try {
    const tables = await connection.query('SELECT COUNT(TABLE_NAME) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME IN (\'klassen\', \'user\', \'schueler\', \'disziplinen\', \'massstaebe\', \'ergebnisse\');');
    if (tables[0][0]['COUNT(TABLE_NAME)'] === 0) {
      console.log('creating tables');
      const defaultSQL = await readDefaultSQL();
      await connection.query(defaultSQL);
      console.log('done creating tables');
    } else if (tables[0][0]['COUNT(TABLE_NAME)'] > 0 && tables[0][0]['COUNT(TABLE_NAME)'] < 6) {
      console.error('only some databases exist - existing to prevent overwrite');
      process.exit(1);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log('🚀  MYSQL Pool ready');
  return connection;
};
