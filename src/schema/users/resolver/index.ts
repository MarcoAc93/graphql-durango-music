import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../../../models/Users';

const generateToken = (user: any, secretKey: string, options?: jwt.SignOptions) => {
  const { id, email, name, lastName } = user;
  return jwt.sign({ id, email, name, lastName }, secretKey, options);
};

const resolvers = {
  Query: {
    getUser: async (_: any, {}, ctx: any) => {
      if (!ctx?.authScope) throw new Error('Usuario no autenticado');
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
    },
    authorization: async (_: any, { token }: { token: string }) => {
      const user = jwt.verify(token, process.env.SECRET_KEY ?? '');
      return user;
    }
  },
  Mutation: {
    createUser: async (_: any, { input }: any, ctx: any) => {
      if (!ctx?.authScope) throw new Error('Usuario no autenticado');
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
