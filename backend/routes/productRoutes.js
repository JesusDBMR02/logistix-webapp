const express = require('express');
const router = express.Router();
const {
    setDb,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

router.use((req, res, next) => {
    const collectionProducts = req.app.locals.db.collection('products');
    const collectionCategories = req.app.locals.db.collection('categories');
    const collectionBrands = req.app.locals.db.collection('brands');
    const collectionSuppliers = req.app.locals.db.collection('suppliers');

    setDb(collectionProducts,collectionCategories,collectionBrands,collectionSuppliers);
    next();
  });

router.get('/',authMiddleware, getAllProducts);

router.get('/:id',authMiddleware, getProductById);

router.post('/',authMiddleware, createProduct);

router.put('/:id',authMiddleware, updateProduct);

router.delete('/:id',authMiddleware, deleteProduct);

module.exports = router;
