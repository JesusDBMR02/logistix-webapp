const { MongoClient } = require('mongodb');
const Sale = require('../models/Sale');
const { ObjectId } = require('mongodb');
let db;

const setDb = (database) => {
    db = database;
};

const getAllSales = async (req, res) => {
    try {
        const sales = await db.find().toArray();
        res.status(200).json(sales);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las ventas.', error });
    }
};

const createSale = async (req, res) => {
    const {products, totalAmount, paymentMethod, saleDate, notes } = req.body;   
    try {
        const sale = new Sale(products, totalAmount, paymentMethod, saleDate, notes);
        const result = await db.insertOne(sale);
        if (!result.insertedId) {
            return res.status(500).json({ message: 'Error al insertar la venta' });
        }
        res.status(201).json({
            message: 'Venta insertada correctamente.',
            sale: { _id: result.insertedId, ...sale }
        });
    } catch (error) {
        console.error('Error al insertar la venta:', error);
        res.status(500).json({ message: 'Error al insertar la venta', error: error.message });
    }
};

const updateSale = async (req, res) => {
    
    try {
        const id = req.params.id; 
        const data = req.body; 

        const result = await db.updateOne(
            { _id: new ObjectId(id) }, 
            { $set: data } 
        )
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }

        const updatedSale = await db.findOne({ _id: new ObjectId(id) });
        res.json(updatedSale);
    } catch (error) {
        console.error("Error al actualizar la venta:", error);
        res.status(500).json({ message: "Error al actualizar la venta", error });
    } 
};

const deleteSale = async (req, res) => {
    try {
        const saleId = req.params.id;
        const result = await db.deleteOne({ _id: new ObjectId(saleId) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }
        res.json({ message: "Venta eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar la venta:", error);
        res.status(500).json({ message: "Error al eliminar la venta" });
    }
};

module.exports = { setDb, getAllSales, createSale, updateSale, deleteSale };