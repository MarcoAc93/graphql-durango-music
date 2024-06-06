import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../../../models/Users';

const generateToken = (user: any, secretKey: string, options?: jwt.SignOptions) => {
  const { id, email, name, lastName } = user;
  return jwt.sign({ id, email, name, lastName }, secretKey, options);
};

const resolvers = {
  Query: {
    getUser: async () => {
      const user = await UserModel.find({});
      return user;
    },
    authUser: async (_: any, { input }: { input: any }) => {
      const { email, password } = input;
      const userExists = await UserModel.findOne({ email });
      if (!userExists) throw new Error('El usuario no existe'); 

      const correctPassword = await bcrypt.compare(password, userExists.password);
      if (!correctPassword) throw new Error('Credenciales incorrectas');
      const token = generateToken(userExists, process.env.SECRET_KEY ?? '', { expiresIn: '24h' })
      return { token };
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
