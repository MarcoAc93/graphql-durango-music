import userTypeDefs from './users/schema'
import studentsTypeDefs from './students/schema';
import enrollmentsTypeDefs from './enrollments/schema';

import userResolvers from './users/resolver';
import studentsResolvers from './students/resolver';
import enrollmentsResolver from './enrollments/resolver';

const typeDefs = `
${userTypeDefs}
${studentsTypeDefs}
${enrollmentsTypeDefs}
`;

const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...studentsResolvers.Query,
    ...enrollmentsResolver.Query
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...studentsResolvers.Mutation,
    ...enrollmentsResolver.Mutation
  },
};

export { typeDefs, resolvers };
