import bcrypt from 'bcryptjs';

import UserModel from "../../../models/Users";

const resolvers = {
  Query: {
    getUser: async () => {
      const user = await UserModel.find({});
      return user;
    }
  },
  Mutation: {
    createUser: async (_: any, { input }: any) => {
      try {
        const saltValue = await bcrypt.genSalt(10);
        input.password = await bcrypt.hash(input.password, saltValue);
        const newUser = new UserModel(input);
        await newUser.save();
        return newUser;
      } catch (error) {
        console.log(error);
        throw new Error('Something went wrong creating the user');
      }
    }
  }
};

export default resolvers;
