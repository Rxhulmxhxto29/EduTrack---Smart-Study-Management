const express = require('express');
const router = express.Router();
const {
  getAllAssignments,
  getPendingAssignments,
  getAssignmentById,
  createAssignment,
  submitAssignment,
  gradeSubmission,
  updateAssignment,
  deleteAssignment
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/auth');
const { validateMultipleFiles } = require('../middleware/fileUpload');

// Get pending assignments for student
router.get('/pending', protect, getPendingAssignments);

// Assignment CRUD - Students can manage their own assignments
router.route('/')
  .get(protect, getAllAssignments)
  .post(protect, createAssignment);

router.route('/:id')
  .get(protect, getAssignmentById)
  .put(protect, updateAssignment)
  .delete(protect, deleteAssignment);

// Submit assignment
router.post('/:id/submit', protect, submitAssignment);

// Grade submission (self-grading for student)
router.put('/:id/submissions/:submissionId/grade', protect, gradeSubmission);

module.exports = router;
