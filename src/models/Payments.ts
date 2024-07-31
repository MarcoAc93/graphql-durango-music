import mongoose from "mongoose";
const Types = mongoose.Schema.Types;

const PaymentsSchema = new mongoose.Schema({
  enrollmentId: {
    type: Types.ObjectId,
    require: true,
  },
  amount: {
    type: Types.Number,
    require: true,
  },
  type: {
    type: Types.String,
    require: true,
  },
  paymentDate: {
    type: Date,
    default: new Date().toLocaleDateString(),
  },
  paymentMethod: {
    type: String,
    require: true,
    default: 'efectivo'
  },
  active: {
    type: Types.Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: new Date().toLocaleDateString(),
  },
});

const PaymentsModel = mongoose.model('payments', PaymentsSchema);

export default PaymentsModel;
