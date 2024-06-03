import StudentModel from '../../../models/Students';
import EnrollmentModel from '../../../models/Enrollments';

const resolver = {
  Query: {
    getStudents: async () => {
      try {
        const students = await StudentModel.find({});
        return {
          code: 200,
          success: true,
          message: 'Lista de alumnos',
          students
        };
      } catch (error) {
        
      }
    }
  },
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
    enrollStudent: async (_: any, { studentId, input }: any) => {
      try {
        const student = await StudentModel.findById(studentId);
        if (!student) throw new Error('El alumno no existe');

        // Create enrollment document
        const enrollment = new EnrollmentModel(input);
        enrollment.studentId = studentId;
        await enrollment.save();
        return {
          code: 200,
          message: 'Alumno inscrito',
          success: true,
          enrollment
        }
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  }
};

export default resolver;
