const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
const dbURl = process.env.DBURL;

const mongooseConnect = async (e) => {
  try {
    const mongooseConnection = await mongoose.connect(dbURl);
    console.log("MongoDB connected Successfully");
  } catch (error) {
    console.log(`Error in connecting MongoDB`);
  }
};

module.exports = mongooseConnect;
