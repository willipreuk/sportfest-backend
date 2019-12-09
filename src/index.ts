import { ApolloServer } from 'apollo-server';
import { initDB } from './database';
import user from './typeDefs/user';
import klasse from './typeDefs/klasse';
import schueler from './typeDefs/schueler';

initDB();

const server = new ApolloServer({ typeDefs: [user, klasse, schueler] });

// eslint-disable-next-line no-console
server.listen().then(({ url }) => console.log(`🚀  Server ready at ${url}`));
