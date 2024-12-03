const express = require('express');
const router = express.Router();
const {
    setDb,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

router.use((req, res, next) => {
    const collection = req.app.locals.db.collection('categories');
    setDb(collection);
    next();
  });

router.get('/',authMiddleware, getAllCategories);

router.post('/',authMiddleware, createCategory);

router.put('/:id',authMiddleware, updateCategory);

router.delete('/:id',authMiddleware, deleteCategory);

module.exports = router;
