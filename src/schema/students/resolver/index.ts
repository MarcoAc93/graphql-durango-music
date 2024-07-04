import EnrollmentModel from '../../../models/Enrollments';
import StudentModel from '../../../models/Students';
import mongoose from 'mongoose';

const resolver = {
  Query: {
    getStudent: async (_: any, { studentId }: any, ctx: any) => {
      if (!ctx?.authScope) throw new Error('Usuario no autenticado');
      try {
        const [student] = await StudentModel.aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(studentId) } },
          {
            $lookup: {
              from: 'enrollments',
              localField: '_id',
              foreignField: 'studentId',
              as: 'enrollments'
            }
          }
        ]);

        const [lastEnroll] = student.enrollments
        return { ...student, id: student._id, enrollment: lastEnroll };
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    getStudents: async (_: any, {}, ctx: any) => {
      if (!ctx?.authScope) throw new Error('Usuario no autenticado');
      try {
        const students = await StudentModel.aggregate([
          {
            $lookup: {
              from: 'enrollments',
              localField: '_id',
              foreignField: 'studentId',
              as: 'enrollments'
            }
          }
        ]);
        return {
          code: 200,
          message: 'Lista de alumnos',
          success: true,
          students: students.map(student => ({ id: student._id, ...student }))
        }
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    getStudentsByClass: async (_: any, { className, profesor, days }: any, ctx: any) => {
      if (!ctx?.authScope) throw new Error('Usuario no autenticado');
      const profesorMatch = { 'courses.profesor': profesor };
      const daysMatch = { 'courses.days': days };

      const classes = await EnrollmentModel.aggregate([
        { $lookup: { from: 'students', localField: 'studentId', foreignField: '_id', as: 'studentInfo' } },
        { $unwind: { path: '$studentInfo' } },
        { $unwind: { path: '$courses' } },
        {
          $match: {
            'studentInfo.active': true,
            'courses.name': className,
            ...(profesor && profesorMatch),
            ...(days && daysMatch)
          },
        },
        { $addFields: { 'studentInfo.id': '$studentId' } },
        {
          $group: {
            _id: {
              course: '$courses.name', 
              hour: '$courses.time',
              profesor: '$courses.profesor'
            },
            students: {
              $push: {
                id: '$studentInfo._id',
                name: '$studentInfo.name',
                lastName: '$studentInfo.lastName',
                email: '$studentInfo.email',
                cellphone: '$studentInfo.cellphone',
                age: '$studentInfo.age',
                tutor: '$studentInfo.tutor',
                deregister: '$studentInfo.deregister',
                active: '$studentInfo.active'
              }
            }
          }
        },
        { $project: { _id: 0, course: '$_id.course', hour: '$_id.hour', profesor: '$_id.profesor', students: 1 } },
        { $sort: { course: 1, hour: 1 } }
      ])
      return {
        code: 200,
        success: true,
        message: 'Lista de clases',
        classes
      };
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
    editStudent: async (_: any, { studentId, input }: any, ctx: any) => {
      if (!ctx?.authScope) throw new Error('Usuario no autenticado');
      try {
        const student = await StudentModel.findById(studentId);
        if (!student) throw new Error('No se encontro al alumno');

        await StudentModel.findByIdAndUpdate({ _id: studentId }, input, { new: true });
        return 'Alumno actualizado';
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    deleteStudent: async (_: any, { studentId, reason }: any, ctx: any) => {
      if (!ctx?.authScope) throw new Error('Usuario no autenticado');
      try {
        const student = await StudentModel.findById(studentId);
        if (!student) throw new Error('No se encontro al alumno');

        await StudentModel.findByIdAndUpdate(studentId,
          {
            deregister: {
              reason,
              date: new Date().toISOString(),
            },
            active: false,
          },
          { new: true }
        );
        return 'Alumno desactivado';
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  }
};

export default resolver;
