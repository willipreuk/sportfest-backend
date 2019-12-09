import { ApolloServer } from 'apollo-server';
import { initDB } from './database';
import user from './typeDefs/user';


initDB();

const server = new ApolloServer({ typeDefs: [user] });

// eslint-disable-next-line no-console
server.listen().then(({ url }) => console.log(`🚀  Server ready at ${url}`));
