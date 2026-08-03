import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || "mongodb://mongodb:27017/orders";

try {
  // Connect the client to the server
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
} catch(err) {
  console.error(err);
}