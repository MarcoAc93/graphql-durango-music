import mongoose from "mongoose";
const Types = mongoose.Schema.Types;

const Attendance = new mongoose.Schema({
  studentId: {
    type: Types.ObjectId,
    require: true,
  },
  enrollmentId: {
    type: Types.ObjectId,
    required: true,
  },
  date: {
    type: Types.String,
    required: true,
  },
  course: {
    type: Types.String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: new Date().toLocaleDateString(),
  },
});

const AttendanceModel = mongoose.model('attendance', Attendance);

export default AttendanceModel;
