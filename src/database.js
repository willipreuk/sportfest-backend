import mysql from 'mysql2';

export default () => {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'sportfest-DEV',
    password: 'password',
    database: 'sportfestDEV',
  });
  connection.connect();
  return connection;
};
