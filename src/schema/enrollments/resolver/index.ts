import { GraphQLError } from "graphql";
import EnrollmentModel from "../../../models/Enrollments";
import PaymentsModel from "../../../models/Payments";

const resolver = {
  Query: {
    getFreeSpaces: async (_: any, { input }: any, ctx: any) => {
      if (!ctx?.authScope) throw new Error('Usuario no autenticado');
      const freeSpaces = await EnrollmentModel.aggregate([
        { $match: { period: input.period, active: true } },
        { $unwind: "$courses" },
        {
          $group: {
            _id: {
              name: "$courses.name",
              time: "$courses.time",
              profesor: "$courses.profesor",
              days: "$courses.days"
            },
            totalStudents: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            course: {
              name: "$_id.name",
              profesor: "$_id.profesor",
              time: "$_id.time",
              days: "$_id.days"
            },
            totalStudents: 1
          }
        }
      ])
      return freeSpaces
    }
  },
  Mutation: {
    enrollStudent: async (_: any, { input }: any, ctx: any) => {
      if (!ctx?.authScope) throw new Error('Usuario no autenticado');

      const promisesArray = input.courses.map((course: { time: any; profesor: any; name: any; days: any; }) => {
        return EnrollmentModel.find({
          period: input.period,
          "courses.time": course.time,
          "courses.profesor": course.profesor,
          "courses.name": course.name,
          "courses.days": course.days
        });
      });
      const studentsEnrolled = await Promise.all(promisesArray);
      studentsEnrolled.forEach(enrolls => {
        if (enrolls.length >= 5) {
          const [course] = input.courses;
          throw new GraphQLError(`Clase de ${course.name} llena, selecciona otra opcion/hora`);
        }
      });

      
      const newEnrollment = new EnrollmentModel(input);
      const enrollment = await newEnrollment.save();
      if (input.amount) {
        const enrollmentDate = new Date();
        const enrollmentPayment = new PaymentsModel({
          enrollmentId: enrollment._id,
          amount: input.amount,
          type: input.amount < 350 ? 'inscripcion / parcialidad' : 'inscripcion',
          paymentDate: enrollmentDate.toLocaleDateString(),
        });
        const payment = await enrollmentPayment.save();
        if (payment) {
          enrollment.payed = input.amount < 350 ? false : true;
          await enrollment.save();
        }
      }
      if (input.firstMonthlyPayment) {
        const firstMonthlyPaymentDate = new Date();
        const firstMonthlyPayment = new PaymentsModel({
          enrollmentId: enrollment._id,
          amount: input.firstMonthlyPayment,
          type: 'primer mensualidad',
          paymentDate: firstMonthlyPaymentDate.toLocaleDateString(),
        });
        await firstMonthlyPayment.save();
      }

      return {
        code: 200,
        success: true,
        message: 'Alumno inscrito correctamente',
        enrollment
      }
    }
  }
};

export default resolver;
