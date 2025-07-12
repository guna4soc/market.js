const Feedback = require('../models/Feedback');

// Get all feedback (optionally filter by user)
exports.getFeedback = async (req, res) => {
  try {
    const { user } = req.query;
    const filter = user ? { user } : {};
    const feedback = await Feedback.find(filter).sort({ date: -1 });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

// Submit new feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { user, feedback, rating } = req.body;
    if (!user || !feedback || !rating) return res.status(400).json({ error: 'Missing fields' });
    const fb = new Feedback({ user, feedback, rating });
    await fb.save();
    res.status(201).json(fb);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

// Update feedback (status, starred, etc.)
exports.updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const fb = await Feedback.findByIdAndUpdate(id, update, { new: true });
    if (!fb) return res.status(404).json({ error: 'Feedback not found' });
    res.json(fb);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update feedback' });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const fb = await Feedback.findByIdAndDelete(id);
    if (!fb) return res.status(404).json({ error: 'Feedback not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
}; 