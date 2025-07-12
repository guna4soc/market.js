const HelpRequest = require('../models/HelpRequest');

// Submit a new help request
exports.submitHelp = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'All fields required' });
    const help = new HelpRequest({ name, email, message });
    await help.save();
    res.status(201).json(help);
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit help request' });
  }
};

// (Optional) Get all help requests (for admin/support)
exports.getHelpRequests = async (req, res) => {
  try {
    const requests = await HelpRequest.find().sort({ date: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch help requests' });
  }
}; 