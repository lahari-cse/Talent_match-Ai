const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  phone: { type: String },
  skills: [{ type: String }],
  hobbies: [{ type: String }],
  education: [{
    degree: String,
    institution: String,
    year: String
  }],
  experience: [{
    title: String,
    company: String,
    duration: String,
    description: String
  }],
  links: {
    github: String,
    linkedin: String,
    portfolio: String
  },
  aiSummary: { type: String },
  resumeUrl: { type: String }, // Path to saved resume
  resumeData: {
    data: Buffer,
    contentType: String
  },
  profileImage: { type: String } // Path to saved profile image
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
