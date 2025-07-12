const User = require('../models/User');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Only return safe fields
    res.json({
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || '',
      preferences: user.preferences || {}
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { email, username, phone, password, avatar } = req.body;
    const update = { username, phone };
    if (avatar) update.avatar = avatar;
    if (password) update.password = password; // hash in model pre-save
    const user = await User.findOneAndUpdate({ email }, update, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || '',
      preferences: user.preferences || {}
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Update preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { email, preferences } = req.body;
    const user = await User.findOneAndUpdate(
      { email },
      { preferences },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      name: user.name || user.username,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || '',
      preferences: user.preferences || {}
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const { email } = req.body;
    await User.findOneAndDelete({ email });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
}; 