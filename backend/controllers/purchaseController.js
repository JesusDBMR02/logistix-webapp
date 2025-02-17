const { MongoClient } = require('mongodb');
const Purchase = require('../models/Purchase');
const { ObjectId } = require('mongodb');
let db;

const setDb = (database) => {
    db = database;
};

const getAllPurchases = async (req, res) => {
    try {
        const purchases = await db.find({userId: req.user.uid}).toArray();
        res.status(200).json(purchases);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las compras.', error });
    }
};
const getPurchaseById = async (req, res) => {
    try {
        const id = req.params.id;
        const purchase = await db.findOne({ _id: new ObjectId(id),userId: req.user.uid })
        res.status(200).json(purchase);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la compra', error });
    }
};
const createPurchase = async (req, res) => {
    const {supplier, products, purchaseDate, paymentMethod, notes } = req.body;   
    try {
        const purchaseCount = await db.countDocuments(); 
        const purchaseNumber = purchaseCount + 1;

        const datePart = new Date().toISOString().split('T')[0];
        const name = `Purchase_${purchaseNumber}_${datePart}`;
        let totalAmount = 0;
        for (const product of products) {
            if (product.purchasePrice ) {
                totalAmount += product.purchasePrice * product.quantity;
            } else {
                return res.status(400).json({ message: 'Todos los productos deben tener precio y cantidad' });
            }
        }
        const status = "PENDING";
        const purchase = new Purchase(name, supplier, products, totalAmount, paymentMethod, purchaseDate, status, notes);
        const result = await db.insertOne({
            userId: req.user.uid,
            name,
            purchaseDate,
            paymentMethod,
            notes,
            totalAmount,
            status,
            products,
            supplier
    });
        if (!result.insertedId) {
            return res.status(500).json({ message: 'Error al insertar la compra' });
        }
        res.status(201).json({
            message: 'Compra insertada correctamente.',
            purchase: { _id: result.insertedId, ...purchase }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al insertar la compra', error: error.message });
    }
};

const updatePurchase = async (req, res) => {
    
    try {
        const id = req.params.id; 
        let data = req.body; 
        let totalAmount = 0;
        if(data.products !== undefined){
            for (const product of data.products) {
                if (product.purchasePrice ) {
                    totalAmount += product.purchasePrice * product.quantity;
                } else {
                    return res.status(400).json({ message: 'Todos los productos deben tener precio y cantidad' });
                }
            } 
            data = {...data, totalAmount: totalAmount};
        }
        const result = await db.updateOne(
            { _id: new ObjectId(id),userId: req.user.uid }, 
            { $set: data } 
        )
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Compra no encontrada" });
        }

        const updatedPurchase = await db.findOne({ _id: new ObjectId(id),userId: req.user.uid });
        res.json(updatedPurchase);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la compra", error });
    } 
};

/*const deletePurchase = async (req, res) => {
    try {
        const purchaseId = req.params.id;
        const result = await db.deleteOne({ _id: new ObjectId(purchaseId),userId: req.user.uid });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Compra no encontrada" });
        }
        res.json({ message: "Compra eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar la compra" });
    }
};*/

module.exports = { setDb, getAllPurchases, getPurchaseById, createPurchase, updatePurchase };