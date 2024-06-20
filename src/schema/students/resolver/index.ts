import StudentModel from '../../../models/Students';

const resolver = {
  Query: {},
  Mutation: {
    createStudent: async (_: any, { input }: any) => {
      try {
        const newStudent = new StudentModel(input);
        await newStudent.save();
        return {
          code: 200,
          message: 'Alumno agregado',
          success: true,
          student: newStudent,
        };
      } catch (error) {
        console.log(error);
        throw error
      }
    },
  }
};

export default resolver;
