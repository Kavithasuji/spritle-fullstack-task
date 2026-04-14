const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 
    });

    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("DB Connection Error ");
    console.error(err.message); 
    process.exit(1); 
  }
};

module.exports = connectDB;