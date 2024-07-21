import userTypeDefs from './users/schema'
import studentsTypeDefs from './students/schema';
import enrollmentsTypeDefs from './enrollments/schema';
import attendanceTypeDefs from './attendance/schema';

import userResolvers from './users/resolver';
import studentsResolvers from './students/resolver';
import enrollmentsResolver from './enrollments/resolver';
import attendanceResolver from './attendance/resolver';

const typeDefs = `
${userTypeDefs}
${studentsTypeDefs}
${enrollmentsTypeDefs}
${attendanceTypeDefs}
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
    ...enrollmentsResolver.Mutation,
    ...attendanceResolver.Mutation,
  },
};

export { typeDefs, resolvers };
