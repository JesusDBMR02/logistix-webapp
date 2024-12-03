const { MongoClient } = require('mongodb');
const Purchase = require('../models/Purchase');
const { ObjectId } = require('mongodb');
let db;

const setDb = (database) => {
    db = database;
};

const getAllPurchases = async (req, res) => {
    try {
        const purchases = await db.find().toArray();
        res.status(200).json(purchases);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las compras.', error });
    }
};

const createPurchase = async (req, res) => {
    const {supplierId, products, totalAmount, purchaseDate, status, notes } = req.body;   
    try {
        const purchase = new Purchase(supplierId, products, totalAmount, purchaseDate, status, notes);
        const result = await db.insertOne(purchase);
        if (!result.insertedId) {
            return res.status(500).json({ message: 'Error al insertar la compra' });
        }
        res.status(201).json({
            message: 'Compra insertada correctamente.',
            purchase: { _id: result.insertedId, ...purchase }
        });
    } catch (error) {
        console.error('Error al insertar la compra:', error);
        res.status(500).json({ message: 'Error al insertar la compra', error: error.message });
    }
};

const updatePurchase = async (req, res) => {
    
    try {
        const id = req.params.id; 
        const data = req.body; 

        const result = await db.updateOne(
            { _id: new ObjectId(id) }, 
            { $set: data } 
        )
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Compra no encontrada" });
        }

        const updatedPurchase = await db.findOne({ _id: new ObjectId(id) });
        res.json(updatedPurchase);
    } catch (error) {
        console.error("Error al actualizar la compra:", error);
        res.status(500).json({ message: "Error al actualizar la compra", error });
    } 
};

const deletePurchase = async (req, res) => {
    try {
        const purchaseId = req.params.id;
        const result = await db.deleteOne({ _id: new ObjectId(purchaseId) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Compra no encontrada" });
        }
        res.json({ message: "Compra eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar la compra:", error);
        res.status(500).json({ message: "Error al eliminar la compra" });
    }
};

module.exports = { setDb, getAllPurchases, createPurchase, updatePurchase, deletePurchase };