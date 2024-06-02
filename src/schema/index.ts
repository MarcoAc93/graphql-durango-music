import userTypeDefs from './users/schema'
import userResolvers from './users/resolver';

import studentsTypeDefs from './students/schema';
import studentsResolvers from './students/resolver';

const typeDefs = `
${userTypeDefs}
${studentsTypeDefs}
`;

const resolvers = {
  Query: { ...userResolvers.Query, ...studentsResolvers.Query },
  Mutation: { ...userResolvers.Mutation, ...studentsResolvers.Mutation },
};

export { typeDefs, resolvers };
