const Profile = require('../models/Profile');

const getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      profile = await Profile.create({ user: req.user.id });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new Profile({ user: req.user.id });
    }
    
    // Update fields
    const { phone, skills, education, experience, links, aiSummary, resumeUrl } = req.body;
    if (phone) profile.phone = phone;
    if (skills) profile.skills = skills;
    if (education) profile.education = education;
    if (experience) profile.experience = experience;
    if (links) profile.links = links;
    if (aiSummary) profile.aiSummary = aiSummary;
    if (resumeUrl !== undefined) profile.resumeUrl = resumeUrl;

    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllProfiles = async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ message: 'Only recruiters can discover talent' });

  try {
    const profiles = await Profile.find().populate('user', 'name email');
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new Profile({ user: req.user.id });
    }
    
    // Construct the URL to access the uploaded file
    profile.profileImage = `http://localhost:5000/uploads/${req.file.filename}`;
    await profile.save();
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new Profile({ user: req.user.id });
    }
    
    // Construct the URL to access the uploaded file
    // Ideally use process.env.API_URL for production
    profile.resumeUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    await profile.save();
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const downloadResume = async (req, res) => {
  try {
    const Profile = require('../models/Profile');
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile || !profile.resumeUrl) {
      return res.status(404).json({ message: 'No resume found' });
    }
    
    const fileUrl = profile.resumeUrl;
    const filename = fileUrl.split('/').pop();
    const filePath = require('path').join(__dirname, '..', 'uploads', filename);

    const fs = require('fs');
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      res.status(404).json({ message: 'File not found on server' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile, getAllProfiles, uploadProfileImage, uploadResume, downloadResume };
