const { MongoClient } = require('mongodb');
const Sale = require('../models/Sale');
const { ObjectId } = require('mongodb');
let db;

const setDb = (database) => {
    db = database;
};

const getAllSales = async (req, res) => {
    try {
        const sales = await db.find({userId: req.user.uid}).toArray();
        res.status(200).json(sales);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las ventas.', error });
    }
};
const getSaleById = async (req, res) => {
    try {
        const id = req.params.id;
        const sale = await db.findOne({ _id: new ObjectId(id),userId: req.user.uid })
        res.status(200).json(sale);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener la venta', error });
    }
};
const createSale = async (req, res) => {
    const {products, paymentMethod, saleDate, notes } = req.body;   
    try {
        const salesCount = await db.countDocuments(); 
        const saleNumber = salesCount + 1;

        const datePart = new Date().toISOString().split('T')[0];
        const name = `Sale_${saleNumber}_${datePart}`;
        let totalAmount = 0;
        for (const product of products) {
            if (product.total ) {
                totalAmount += product.total * product.quantity;
            } else {
                return res.status(400).json({ message: 'Todos los productos deben tener precio y cantidad' });
            }
        }
        const status = "PENDING";
        const sale = new Sale(name, products, totalAmount ,status, paymentMethod, saleDate, notes);
        const result = await db.insertOne({
            userId: req.user.uid,
            name,
            products,
            totalAmount,
            paymentMethod,
            saleDate,
            status,
            notes
        });
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
        let data = req.body; 
        let totalAmount = 0;
        if(data.products !== undefined){
            for (const product of data.products) {
                if (product.total ) {
                    totalAmount += product.total * product.quantity;
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
            return res.status(404).json({ message: "Venta no encontrada" });
        }

        const updatedSale = await db.findOne({ _id: new ObjectId(id),userId: req.user.uid });
        res.json(updatedSale);
    } catch (error) {
        console.error("Error al actualizar la venta:", error);
        res.status(500).json({ message: "Error al actualizar la venta", error });
    } 
};

const deleteSale = async (req, res) => {
    try {
        const saleId = req.params.id;
        const result = await db.deleteOne({ _id: new ObjectId(saleId),userId: req.user.uid });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Venta no encontrada" });
        }
        res.json({ message: "Venta eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar la venta:", error);
        res.status(500).json({ message: "Error al eliminar la venta" });
    }
};

module.exports = { setDb, getAllSales,getSaleById, createSale, updateSale, deleteSale };