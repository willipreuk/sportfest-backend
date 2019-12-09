import mysql from 'mysql';

// eslint-disable-next-line
let connection: mysql.Connection | undefined;

export const initDB = () => {
  connection = mysql.createConnection({
    host: 'localhost',
    user: 'sportfest-DEV',
    password: 'password',
    database: 'sportfestDEV',
  });
  connection.connect();
};

export default connection;
