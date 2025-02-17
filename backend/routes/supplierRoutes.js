const express = require('express');
const router = express.Router();
const {
    setDb,
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
} = require('../controllers/supplierController');
const authMiddleware = require('../middleware/authMiddleware');

router.use((req, res, next) => {
    const collection = req.app.locals.db.collection('suppliers');
    setDb(collection);
    next();
  });

router.get('/',authMiddleware, getAllSuppliers);

router.post('/',authMiddleware, createSupplier);

router.put('/:id',authMiddleware, updateSupplier);

router.get('/:id',authMiddleware, getSupplierById);

//router.delete('/:id',authMiddleware, deleteSupplier);

module.exports = router;
