const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected to ${connect.connection.host}`);
  } catch (error) {
    console.log("DB Not Connected", error.message);
    process.exit();
  }
};

module.exports = connectDB;
