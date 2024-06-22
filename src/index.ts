import dotEnv from 'dotenv';
import jwt from 'jsonwebtoken';
dotEnv.config({ path: '.env' });

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import connectDB from './db';
import { typeDefs, resolvers } from './schema';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    const token = req.headers.authorization;
    if (token) {
      const user = jwt.verify(token, process.env.SECRET_KEY ?? '');
      return { authScope: user };
    }
    return { authScope: undefined };
  }
}).then(result => {
  console.log(`🚀  Server ready at: ${result.url}`);
  connectDB();
});
