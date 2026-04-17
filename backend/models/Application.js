const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidate: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  aiMatchScore: { type: Number }, // 0 to 100
  aiGapAnalysis: { type: String }, // Optional feedback on what skills are missing
  coverLetter: { type: String }, // User generated cover letter
  status: { type: String, enum: ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'], default: 'Applied' }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
