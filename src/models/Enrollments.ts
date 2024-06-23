import mongoose from "mongoose";
const Types = mongoose.Schema.Types;

const EnrollmentSchema = new mongoose.Schema({
  studentId: {
    type: Types.ObjectId,
    require: true,
  },
  period: {
    type: String,
    required: true,
    trim: true,
  },
  payed: {
    type: Boolean,
    trim: true,
  },
  amount: {
    type: Number,
    trim: true,
  },
  scholarship: {
    type: Number,
    trim: true,
  },
  courses: {
    type: Types.Mixed,
    required: true,
  },
  active: {
    type: Types.Boolean,
    default: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const EnrollmentModel = mongoose.model('enrollments', EnrollmentSchema);

export default EnrollmentModel;
