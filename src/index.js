import { ApolloServer, AuthenticationError } from 'apollo-server';
import dotenv from 'dotenv';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import initDB from './database';
import typeDefs from './typeDefs';
import resolvers from './resolvers';

dotenv.config();

const db = initDB();

const checkPermission = (userCtx) => (checks) => {
  const rollen = {
    admin: ['admin'],
    leiter: ['schreiber', 'leiter'],
    schreiber: ['schreiber', 'leiter', 'admin'],
  };

  if (!userCtx) throw new AuthenticationError('NOT_LOGGED_IN');

  if (userCtx.rolle === 'admin') return;

  if (checks.username) {
    if (checks.username !== userCtx.username) throw new AuthenticationError('NO_PERMISSION');
    return;
  }
  if (checks.id) {
    if (checks.id !== userCtx.id) throw new AuthenticationError('NO_PERMISSION');
    return;
  }
  if (checks.rolle) {
    if (!rollen[checks.rolle].includes(userCtx.rolle)) throw new AuthenticationError('NO_PERMISSION');
  }
};

const server = new ApolloServer(
  {
    context: async ({ req }) => {
      const token = req.headers.authorization || '';

      try {
        const data = jwt.verify(token, process.env.SECURITY_PRIVATE_KEY);
        const [rows] = await db.query('SELECT rolle, iduser as id, username FROM user WHERE iduser = ?', [data.id]);
        const userObj = { ...rows[0] };
        return {
          db,
          permission: {
            check: checkPermission(userObj), ADMIN: 'admin', SCHREIBER: 'schreiber', LEITER: 'leiter',
          },
          user: userObj,
        };
      } catch (e) {
        if (e instanceof JsonWebTokenError) {
          return {
            db,
            permission: {
              check: checkPermission(null), ADMIN: 'admin', SCHREIBER: 'schreiber', LEITER: 'leiter',
            },
            user: null,
          };
        }
        throw e;
      }
    },
    typeDefs,
    resolvers,
  },
);

// eslint-disable-next-line no-console
server.listen().then(({ url }) => console.log(`🚀  GraphQL Server ready at ${url}`));
