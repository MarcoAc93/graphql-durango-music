const resolver = {
  Query: {

  },
  Mutation: {
    createStudent: async (_: any, { input }: any) => {
      console.log(input);
      return 'Create Student!'
    }
  }
};

export default resolver;