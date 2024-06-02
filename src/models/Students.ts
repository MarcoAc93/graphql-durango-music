import mongoose from "mongoose";
const Types = mongoose.Schema.Types;

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  cellphone: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: String,
    required: true,
    trim: true,
  },
  course: {
    type: Types.Mixed,
    required: true,
    trim: true,
  },
  tutor: {
    type: Types.Mixed,
    required: true,
    trim: true,
  },
  inscription: {
    type: Types.Array,
    required: true,
    trim: true,
  },
  deregister: {
    type: Types.Mixed,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const StudentModel = mongoose.model('students', StudentSchema);

export default StudentModel;
