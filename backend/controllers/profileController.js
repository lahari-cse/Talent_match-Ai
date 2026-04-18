const Profile = require('../models/Profile');

const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $setOnInsert: { user: req.user.id } },
      { new: true, upsert: true }
    ).select('-resumeData');
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
    ).select('-resumeData');

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllProfiles = async (req, res) => {
  if (req.user.role !== 'recruiter') return res.status(403).json({ message: 'Only recruiters can discover talent' });

  try {
    const profiles = await Profile.find().select('-resumeData').populate('user', 'name email');
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
    ).select('-resumeData');
    
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
    
    const fs = require('fs');
    const resumeBuffer = fs.readFileSync(req.file.path);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const resumeUrl = `${baseUrl}/api/profiles/${req.user.id}/resume`;
    
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { 
        $set: { 
          resumeUrl,
          resumeData: {
            data: resumeBuffer,
            contentType: req.file.mimetype
          }
        } 
      },
      { new: true, upsert: true }
    ).select('-resumeData');
    
    // Clean up local file since it's now in DB
    fs.unlinkSync(req.file.path);
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const viewResume = async (req, res) => {
  try {
    const Profile = require('../models/Profile');
    const profile = await Profile.findOne({ user: req.params.userId });
    
    if (!profile || !profile.resumeData || !profile.resumeData.data) {
      return res.status(404).send('Resume not found on server. The file might have been uploaded before the persistence patch.');
    }
    
    res.set('Content-Type', profile.resumeData.contentType);
    res.send(profile.resumeData.data);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

module.exports = { getProfile, updateProfile, getAllProfiles, uploadProfileImage, uploadResume, viewResume };
