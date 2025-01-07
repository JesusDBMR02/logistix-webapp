const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware')
const {
    setDb,
    getAllBrands,
    createBrand,
    updateBrand,
    deleteBrand
} = require('../controllers/brandController');

router.use((req, res, next) => {
    const collection = req.app.locals.db.collection('brands');
    setDb(collection);
    next();
  });

router.get('/',authMiddleware, getAllBrands);

router.post('/',authMiddleware, createBrand);

router.put('/:id',authMiddleware, updateBrand);

router.delete('/:id',authMiddleware, deleteBrand);

module.exports = router;
