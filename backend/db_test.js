require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("SUCCESS");
    process.exit(0);
  } catch (e) {
    console.error("FAIL", e.message);
    process.exit(1);
  }
}
test();
