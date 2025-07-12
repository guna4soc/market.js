const Category = require('../models/Category');
const Product = require('../models/Product');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    // For each category, sum the stock of all products in that category
    const products = await Product.find();
    const categoriesWithStock = categories.map(cat => {
      const stock = products
        .filter(p => (p.category || '').toLowerCase() === (cat.label || '').toLowerCase())
        .reduce((sum, p) => sum + (p.stock || 0), 0);
      return {
        ...cat.toObject(),
        name: cat.label, // for frontend compatibility
        stock
      };
    });
    res.json(categoriesWithStock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 