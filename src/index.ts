import mysql from 'mysql';
import { ApolloServer } from 'apollo-server';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'sportfest-DEV',
  password: 'password',
  database: 'sportfestDEV',
});
connection.connect();

const server = new ApolloServer({});

server.listen().then(({ url }) => console.log(`🚀  Server ready at ${url}`));


export { connection };
