const express = require('express');
const router = express.Router();
const {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  createUnit,
  updateUnit,
  deleteUnit
} = require('../controllers/subjectController');
const { protect } = require('../middleware/auth');

// Subject list routes
router.get('/', protect, getAllSubjects);
router.post('/', protect, createSubject);

// Unit routes - MORE SPECIFIC paths first
router.get('/:id/units', protect, async (req, res, next) => {
  try {
    const Unit = require('mongoose').model('Unit');
    const units = await Unit.find({ subject: req.params.id, isActive: true }).sort({ unitNumber: 1 });
    res.json({ success: true, data: units });
  } catch (error) {
    next(error);
  }
});
router.post('/:id/units', protect, createUnit);
router.put('/:subjectId/units/:unitId', protect, updateUnit);
router.delete('/units/:unitId', protect, deleteUnit);

// Subject detail routes - LESS SPECIFIC paths last
router.get('/:id', protect, getSubjectById);
router.put('/:id', protect, updateSubject);
router.delete('/:id', protect, deleteSubject);

module.exports = router;
