import dotEnv from 'dotenv'
dotEnv.config({ path: '.env' });

import { ApolloServer,  } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import connectDB from './db';
import { typeDefs, resolvers } from './schema';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, { listen: { port: 4000 } }).then(result => {
  console.log(`🚀  Server ready at: ${result.url}`);
  connectDB();
});
