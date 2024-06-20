import EnrollmentModel from "../../../models/Enrollments";

const resolver = {
  Query: {},
  Mutation: {
    enrollStudent: async (_: any, { input }: any) => {
      try {
        const newEnrollment = new EnrollmentModel(input);
        await newEnrollment.save();
        return {
          code: 200,
          message: 'Estudiante inscrito',
          success: true,
          enrollment: newEnrollment,
        }
      } catch (error) {
        console.log(error);
        throw error
      }
    }
  }
};

export default resolver;
