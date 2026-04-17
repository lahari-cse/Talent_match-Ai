const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Job = require('./models/Job');

dotenv.config();

const seedJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Find or create a dummy recruiter
    let recruiter = await User.findOne({ email: 'recruiter@talentmatch.ai' });
    if (!recruiter) {
      recruiter = await User.create({
        name: 'Tech Corp Recruiter',
        email: 'recruiter@talentmatch.ai',
        password: 'password123', // In real life this would be hashed, but it's just a dummy for seed
        role: 'recruiter'
      });
      console.log('Created dummy recruiter.');
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);

    const jobs = [
      {
        recruiter: recruiter._id,
        title: 'Senior Frontend Developer',
        company: 'InnovateTech',
        location: 'Remote',
        description: 'Looking for an experienced Frontend Developer to lead our React applications.',
        requiredSkills: ['React', 'JavaScript', 'Tailwind', 'Node.js'],
        salaryRange: '$120k - $150k',
        deadline: tomorrow
      },
      {
        recruiter: recruiter._id,
        title: 'Data Scientist',
        company: 'DataMinds Inc.',
        location: 'New York, NY',
        description: 'Seeking a Data Scientist to build predictive models and analyze large datasets.',
        requiredSkills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
        salaryRange: '$130k - $160k',
        deadline: tomorrow
      },
      {
        recruiter: recruiter._id,
        title: 'UX/UI Designer',
        company: 'Creative Solutions',
        location: 'San Francisco, CA',
        description: 'Design beautiful, intuitive interfaces for our upcoming mobile and web applications.',
        requiredSkills: ['Figma', 'UI Design', 'User Research', 'CSS'],
        salaryRange: '$100k - $130k',
        deadline: new Date(new Date().setDate(new Date().getDate() + 10))
      },
      {
        recruiter: recruiter._id,
        title: 'Backend Engineer',
        company: 'ServerCloud',
        location: 'Austin, TX',
        description: 'Build scalable and robust API services using Node.js and MongoDB.',
        requiredSkills: ['Node.js', 'Express', 'MongoDB', 'API Design'],
        salaryRange: '$110k - $140k',
        deadline: new Date(new Date().setDate(new Date().getDate() + 5))
      }
    ];

    await Job.insertMany(jobs);
    console.log('Successfully seeded 4 sample jobs!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedJobs();
