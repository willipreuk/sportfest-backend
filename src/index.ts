import { ApolloServer } from 'apollo-server';
// eslint-disable-next-line import/no-unresolved
import { initDB } from './database';

initDB();

const server = new ApolloServer({});

// eslint-disable-next-line no-console
server.listen().then(({ url }) => console.log(`🚀  Server ready at ${url}`));
