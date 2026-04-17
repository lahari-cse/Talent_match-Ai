const Job = require('../models/Job');
const Application = require('../models/Application');
const Profile = require('../models/Profile');

const createJob = async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ message: 'Only recruiters can post jobs' });

  try {
    const job = await Job.create({ ...req.body, recruiter: req.user.id });

    // SIMULATED SMS NOTIFICATION SYSTEM
    try {
      if (req.body.requiredSkills && req.body.requiredSkills.length > 0) {
        const matchingProfiles = await Profile.find({
          skills: { $in: req.body.requiredSkills.map(s => new RegExp(s, 'i')) }
        }).populate('user', 'name');

        if (matchingProfiles.length > 0) {
          console.log(`\n======================================================`);
          console.log(`📱 SIMULATED SMS SENT TO ${matchingProfiles.length} CANDIDATES`);
          console.log(`Job: ${job.title} at ${job.company}`);
          matchingProfiles.forEach(p => {
            console.log(`To: ${p.user?.name} | "Hi ${p.user?.name?.split(' ')[0]}, a new ${job.title} role just opened up that matches your skills! Log in to apply."`);
          });
          console.log(`======================================================\n`);
        }
      }
    } catch (smsError) {
      console.error("Failed to simulate SMS:", smsError);
    }

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('recruiter', 'name email');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiter', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const applyToJob = async (req, res) => {
  if (req.user.role !== 'candidate') return res.status(403).json({ message: 'Only candidates can apply' });

  try {
    const isSaving = req.body.status === 'Saved';
    let existingApplication = await Application.findOne({ job: req.params.id, candidate: req.user.id });

    if (existingApplication) {
      if (!isSaving && existingApplication.status === 'Saved') {
        existingApplication.status = 'Applied';
        existingApplication.aiMatchScore = req.body.aiMatchScore || existingApplication.aiMatchScore;
        existingApplication.coverLetter = req.body.coverLetter || existingApplication.coverLetter;
        await existingApplication.save();
        return res.status(200).json(existingApplication);
      }
      return res.status(400).json({ message: isSaving ? 'Job already saved' : 'You have already applied for this job' });
    }

    const application = await Application.create({
      job: req.params.id,
      candidate: req.user.id,
      aiMatchScore: req.body.aiMatchScore || 0,
      aiGapAnalysis: req.body.aiGapAnalysis || '',
      coverLetter: req.body.coverLetter || '',
      status: isSaving ? 'Saved' : 'Applied'
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeSavedJob = async (req, res) => {
  if (req.user.role !== 'candidate') return res.status(403).json({ message: 'Only candidates can save jobs' });

  try {
    const existingApplication = await Application.findOne({ job: req.params.id, candidate: req.user.id });
    if (!existingApplication) return res.status(404).json({ message: 'Job is not saved' });

    if (existingApplication.status === 'Saved') {
      await Application.findByIdAndDelete(existingApplication._id);
      return res.status(200).json({ message: 'Removed from wishlist' });
    } else {
      return res.status(400).json({ message: 'Cannot remove a job you have already applied to' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getJobApplicants = async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ message: 'Only recruiters can view applicants' });

  try {
    const job = await Job.findById(req.params.id);
    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only view applicants for your own jobs' });
    }

    const applications = await Application.find({ job: req.params.id })
      .populate('candidate', 'name email')
      .sort({ aiMatchScore: -1 });

    const candidateIds = applications.map(app => app.candidate._id);
    const profiles = await Profile.find({ user: { $in: candidateIds } });

    const appsWithProfiles = applications.map(app => {
      const appObj = app.toObject();
      appObj.profile = profiles.find(p => p.user.toString() === app.candidate._id.toString()) || null;
      return appObj;
    });

    res.json(appsWithProfiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyApplications = async (req, res) => {
  if (req.user.role !== 'candidate') return res.status(403).json({ message: 'Only candidates have applications' });

  try {
    const applications = await Application.find({ candidate: req.user.id }).populate('job');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createJob, getJobs, getJobById, applyToJob, getJobApplicants, getMyApplications, updateApplicationStatus, removeSavedJob };
