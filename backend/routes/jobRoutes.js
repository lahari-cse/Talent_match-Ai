const express = require('express');
const { createJob, getJobs, getJobById, applyToJob, getJobApplicants, getMyApplications, updateApplicationStatus, removeSavedJob } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getJobs)
  .post(protect, createJob);

router.route('/my-applications')
  .get(protect, getMyApplications);

router.route('/:id')
  .get(getJobById);

router.route('/:id/apply')
  .post(protect, applyToJob);

router.route('/:id/save')
  .delete(protect, removeSavedJob);

router.route('/:id/applicants')
  .get(protect, getJobApplicants);

router.route('/applications/:id/status')
  .put(protect, updateApplicationStatus);

module.exports = router;
