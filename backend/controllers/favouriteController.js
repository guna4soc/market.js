const Favourite = require('../models/Favourite');

exports.getFavourites = async (req, res) => {
  try {
    const { user } = req.query;
    const favourites = await Favourite.find(user ? { user } : {});
    res.json(favourites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addFavourite = async (req, res) => {
  try {
    const { user, name, type, description } = req.body;
    const fav = new Favourite({ user, name, type, description });
    await fav.save();
    res.status(201).json(fav);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 