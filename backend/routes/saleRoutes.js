const express = require('express');
const router = express.Router();
const {
    setDb,
    getAllSales,
    createSale,
    updateSale,
    deleteSale
} = require('../controllers/saleController');
const authMiddleware = require('../middleware/authMiddleware');

router.use((req, res, next) => {
    const collection = req.app.locals.db.collection('sales');
    setDb(collection);
    next();
  });

router.get('/',authMiddleware, getAllSales);

router.post('/',authMiddleware, createSale);

router.put('/:id',authMiddleware, updateSale);

router.delete('/:id',authMiddleware, deleteSale);

module.exports = router;