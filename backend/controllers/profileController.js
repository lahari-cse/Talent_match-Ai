const Profile = require('../models/Profile');

const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $setOnInsert: { user: req.user.id } },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { phone, skills, education, experience, links, aiSummary, resumeUrl } = req.body;
    const updateData = {};
    if (phone !== undefined) updateData.phone = phone;
    if (skills !== undefined) updateData.skills = skills;
    if (education !== undefined) updateData.education = education;
    if (experience !== undefined) updateData.experience = experience;
    if (links !== undefined) updateData.links = links;
    if (aiSummary !== undefined) updateData.aiSummary = aiSummary;
    if (resumeUrl !== undefined) updateData.resumeUrl = resumeUrl;

    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: updateData },
      { new: true, upsert: true }
    );

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
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const profileImage = `${baseUrl}/uploads/${req.file.filename}`;
    
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: { profileImage } },
      { new: true, upsert: true }
    );
    
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
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const resumeUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: { resumeUrl } },
      { new: true, upsert: true }
    );
    
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
