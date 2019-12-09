import mysql from 'mysql';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'sportfest-DEV',
  password: 'password',
  database: 'sportfestDEV',
});
connection.connect();

export { connection };
