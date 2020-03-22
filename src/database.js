import mysql from 'mysql2';

export default () => {
  let connection = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  connection = connection.promise();

  // eslint-disable-next-line no-console
  console.log('🚀  MYSQL Pool ready');
  return connection;
};
