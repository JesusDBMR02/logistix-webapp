const express = require('express');
const router = express.Router();
const {
    setDb,
    getAllPurchases,
    createPurchase,
    updatePurchase,
    deletePurchase,
    getPurchaseById
} = require('../controllers/purchaseController');
const authMiddleware = require('../middleware/authMiddleware');

router.use((req, res, next) => {
    const collection = req.app.locals.db.collection('purchases');
    setDb(collection);
    next();
  });

router.get('/',authMiddleware, getAllPurchases);

router.get('/:id',authMiddleware, getPurchaseById);

router.post('/',authMiddleware, createPurchase);

router.put('/:id',authMiddleware, updatePurchase);

router.delete('/:id',authMiddleware, deletePurchase);

module.exports = router;
