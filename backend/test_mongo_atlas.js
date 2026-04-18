const mongoose = require('mongoose');
const uri = "mongodb+srv://kothulalahari25_db_user:WpMrJ2jJM07kVQdW@cluster0.pqzaaji.mongodb.net/talent_match?retryWrites=true&w=majority&appName=Cluster0";

console.log('Testing new Atlas connection...');
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('✅ SUCCESS: Connected to MongoDB Atlas! The password and IP settings are perfect.');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ ERROR:', err.message);
    process.exit(1);
  });
