const express = require('express');
const router = express.Router();
const {
    setDb,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

router.use((req, res, next) => {
    const collection = req.app.locals.db.collection('products');
    setDb(collection);
    next();
  });

router.get('/',authMiddleware, getAllProducts);

router.post('/',authMiddleware, createProduct);

router.put('/:id',authMiddleware, updateProduct);

router.delete('/:id',authMiddleware, deleteProduct);

module.exports = router;
