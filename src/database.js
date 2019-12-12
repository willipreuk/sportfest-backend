import mysql from 'mysql2';

export default () => {
  let connection = mysql.createConnection({
    host: 'localhost',
    user: 'sportfest-DEV',
    password: 'password',
    database: 'sportfestDEV',
  });
  connection.connect();
  connection = connection.promise();
  return connection;
};
