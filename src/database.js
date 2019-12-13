import mysql from 'mysql2';

export default () => {
  let connection = mysql.createPool({
    host: 'localhost',
    user: 'sportfest-DEV',
    password: 'password',
    database: 'sportfestDEV',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  connection = connection.promise();

  // eslint-disable-next-line no-console
  console.log('🚀  MYSQL Pool ready');
  return connection;
};
