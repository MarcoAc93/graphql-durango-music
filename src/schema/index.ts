import userTypeDefs from './users/schema'
import userResolvers from './users/resolver';

const typeDefs = `
${userTypeDefs}
`;

const resolvers = {
  Query: { ...userResolvers.Query },
  Mutation: { ...userResolvers.Mutation },
};

export { typeDefs, resolvers };
