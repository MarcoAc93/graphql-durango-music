import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_MONGO ?? '');
    console.log('DB Connected');
  } catch (error) {
    console.error('Error connecting to database');
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
