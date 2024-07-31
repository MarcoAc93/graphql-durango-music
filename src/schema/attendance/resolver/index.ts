import AttendanceModel from "../../../models/Attendance";

const resolver = {
  Query: {
    getAttendances: async (_: any, {}, ctx: any) => {
      if (!ctx?.authScope) throw new Error('Usuario no autenticado');

      try {
        const attendances = await AttendanceModel.aggregate([
          { $lookup: { from: 'students', localField: 'studentId', foreignField: '_id', as: 'student' } },
          { $unwind: { path: '$student' } },
          {
            $group: {
              _id: { studentId: '$studentId', course: '$course' },
              name: { $first: '$student.name' },
              lastName: { $first: '$student.lastName' },
              attendanceDates: { $push: '$date' },
              count: { $sum: 1 }
            }
          },
          { $unwind: "$attendanceDates" },
          { $sort: { "attendanceDates": 1 } },
          {
            $group: {
              _id: { _id: '$_id', studentId: '$_id.studentId', course: '$_id.course' },
              name: { $first: '$name' },
              lastName: { $first: '$lastName' },
              attendanceDates: { $push: '$attendanceDates' },
              count: { $first: '$count' }
            }
          },
          { $project: { _id: '$_id._id', studentId: '$_id.studentId', name: 1, lastName: 1, course: '$_id.course', attendanceDates: 1, count: 1 } }
        ]);
        return {
          code: 200,
          success: true,
          message: 'Lista de asistencias',
          attendances: attendances.map((el: any) => ({ studentName: `${el.name} ${el.lastName}`, dates: el.attendanceDates, course: el.course, count: el.count }))
        }
      } catch (error) {
        
      }
    }
  },
  Mutation: {
    createAttendance: async (_: any, { input: { studentId, enrollmentId, date, course } }: any, ctx: any) => {
      if (!ctx?.authScope) throw new Error('Usuario no autenticado');
      try {
        const alreadyHasAttendance = await AttendanceModel.findOne({ studentId, enrollmentId, date, course });
        if (alreadyHasAttendance) {
          await alreadyHasAttendance.deleteOne();
          return 'Se elimino la asistencia';
        }
        const attendance = new AttendanceModel({ studentId, enrollmentId, date, course });
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
