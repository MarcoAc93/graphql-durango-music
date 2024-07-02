import { GraphQLError } from "graphql";
import EnrollmentModel from "../../../models/Enrollments";
import PaymentsModel from "../../../models/Payments";

const resolver = {
  Query: {},
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
          type: 'inscripcion',
          paymentDate: enrollmentDate.toLocaleDateString(),
        });
        const payment = await enrollmentPayment.save();
        if (payment) {
          enrollment.payed = true;
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
