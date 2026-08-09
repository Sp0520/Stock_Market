const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.log('ℹ️  MONGO_URI environment variable not provided. Using high-performance in-memory data store.');
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`⚠️  MongoDB connection warning: ${err.message}. Operating with in-memory market store.`);
  }
};

module.exports = connectDB;
