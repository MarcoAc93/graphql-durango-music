import mongoose from 'mongoose';
import moment from 'moment';
import StudentModel from '../../../models/Students';
import AttendanceModel from '../../../models/Attendance';

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
    getStudentsByProfesor: async (_: any, { profesor }: any, ctx: any) => {
      if (!ctx?.authScope) throw new Error('Usuario no autenticado');
      const students = await StudentModel.aggregate([
        {
          $lookup: {
            from: "enrollments",
            localField: "_id",
            foreignField: "studentId",
            as: "enrollments"
          }
        },
        {
          $match: {
            "enrollments.courses.profesor": profesor
          }
        },
        {
          $addFields: {
            "id": "$_id",
            enrollments: {
              $map: {
                input: "$enrollments",
                as: "enrollment",
                in: {
                  id: "$$enrollment._id",
                  studentId: "$$enrollment.studentId",
                  period: "$$enrollment.period",
                  payed: "$$enrollment.payed",
                  scholarship: "$$enrollment.scholarship",
                  courses: "$$enrollment.courses",
                  active: "$$enrollment.active",
                  createdAt: "$$enrollment.createdAt"
                }
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            id: 1,
            name: 1,
            lastName: 1,
            cellphone: 1,
            enrollments: 1
          }
        }
      ]);
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
    createAttendance: async (_: any, { studentId, enrollmentId }: any, ctx: any) => {
      if (!ctx?.authScope) throw new Error('Usuario no autenticado');
      try {
        const date = moment().format('DD/MM/YYYY');
        const alreadyHasAttendance = await AttendanceModel.findOne({ studentId, enrollmentId, date });
        if (alreadyHasAttendance) {
          await alreadyHasAttendance.deleteOne();
          return 'Se elimino la asistencia';
        }
        const attendance = new AttendanceModel({ studentId, enrollmentId, date });
        await attendance.save();
        return 'Asistencia registrada';
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  }
};

export default resolver;
