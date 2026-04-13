const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // fail fast
    });

    console.log("MongoDB Connected ✅");
  } catch (err) {
    console.error("DB Connection Error ❌");
    console.error(err.message); 
    process.exit(1); 
  }
};

module.exports = connectDB;