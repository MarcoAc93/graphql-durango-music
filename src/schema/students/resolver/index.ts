import StudentModel from '../../../models/Students';

const resolver = {
  Query: {
    getStudents: async (_: any, {}, ctx: any) => {
      if (!ctx?.authScope) throw new Error('Usuario no autenticado');
      try {
        const students = await StudentModel.find({});
        return {
          code: 200,
          message: 'Lista de alumnos',
          success: true,
          students
        }
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  },
  Mutation: {
    createStudent: async (_: any, { input }: any, ctx: any) => {
      if (!ctx?.authScope) throw new Error('Usuario no autenticado');
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
