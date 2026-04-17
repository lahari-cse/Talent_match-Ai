const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  description: { type: String, required: true },
  requiredSkills: [{ type: String }],
  salaryRange: { type: String },
  deadline: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
