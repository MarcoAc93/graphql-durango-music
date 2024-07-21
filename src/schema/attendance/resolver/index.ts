import AttendanceModel from "../../../models/Attendance";

const resolver = {
  Query: {},
  Mutation: {
    createAttendance: async (_: any, { studentId, enrollmentId, date }: any, ctx: any) => {
      if (!ctx?.authScope) throw new Error('Usuario no autenticado');
      try {
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
