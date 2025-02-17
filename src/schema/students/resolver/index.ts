import mongoose from 'mongoose';
import StudentModel from '../../../models/Students';
import moment from 'moment';
moment.locale('es', { week: { dow: 1 } });

const generateDaysOfWeek = () => {
  const startOfWeek = moment().startOf('week');
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = startOfWeek.clone().add(i, 'days');
    const formattedDate = date.format('DD/MM/YYYY');
    days.push(formattedDate);
  }
  return days;
};

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
          { $lookup: { from: 'enrollments', localField: '_id', foreignField: 'studentId', as: 'enrollments' } },
          {
            $lookup: {
              from: "attendances",
              localField: "enrollments._id",
              foreignField: "enrollmentId",
              as: "attendances"
            }
          },
          {
            $addFields: {
              id: '$_id',
              "enrollments": { $map: { input: "$enrollments", as: "enrollment", in: { $mergeObjects: ["$$enrollment", { id: "$$enrollment._id"}] } } }
            }
          }
        ]);
        students.forEach(student => {
          const startDate = moment(generateDaysOfWeek()[0], 'DD/MM/YYYY');
          const endDay = moment(generateDaysOfWeek()[6], 'DD/MM/YYYY');
          const attendances = student.attendances.filter((el: any) => {
            const date = moment(el.date, 'DD/MM/YYYY');
            if (date.isSameOrAfter(startDate) && date.isSameOrBefore(endDay)) return el;
          })
          student.attendances = attendances;
          return student;
        });
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
    getStudentsByProfesor: async (_: any, { profesor }: any, ctx: any) => {
      if (!ctx?.authScope) throw new Error('Usuario no autenticado');
      const students = await StudentModel.aggregate([
        { $lookup: { from: "enrollments", localField: "_id", foreignField: "studentId", as: "enrollments" } },
        {
          $lookup: {
            from: "attendances",
            localField: "enrollments._id",
            foreignField: "enrollmentId",
            pipeline: [
            { $match: { $expr: { $and: [ { $gte: ["$date", generateDaysOfWeek()[0]] }, { $lte: ["$date", generateDaysOfWeek()[6]] } ] } } }
          ],
            as: "attendances"
          }
        },
        {
          $addFields: {
            id: '$_id',
            "enrollments": { $map: { input: "$enrollments", as: "enrollment", in: { $mergeObjects: ["$$enrollment", { id: "$$enrollment._id"}] } } }
          }
        },
        { $match: { "enrollments.courses.profesor": profesor } }
      ])
      // console.log(students)
      return {
        code: 200,
        success: true,
        message: 'Lista de alumnos por profesor',
        students
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
    },
  }
};

export default resolver;
