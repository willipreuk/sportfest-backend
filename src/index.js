import { ApolloServer } from 'apollo-server';
import dotenv from 'dotenv';
import initDB from './database';
import user from './typeDefs/user';
import klasse from './typeDefs/klasse';
import schueler from './typeDefs/schueler';
import massstaebe from './typeDefs/massstaebe';
import disziplin from './typeDefs/disziplin';
import ergebnis from './typeDefs/ergebnis';
import userResolver from './resolvers/user';

dotenv.config();

const db = initDB();

const server = new ApolloServer(
  {
    context: { db },
    typeDefs: [user, klasse, schueler, massstaebe, disziplin, ergebnis],
    resolvers: userResolver,
  },
);

// eslint-disable-next-line no-console
server.listen().then(({ url }) => console.log(`🚀  Server ready at ${url}`));
