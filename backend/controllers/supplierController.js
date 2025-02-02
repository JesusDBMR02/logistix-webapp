const { MongoClient } = require('mongodb');
const Supplier = require('../models/Supplier');
const { ObjectId } = require('mongodb');
let db;

const setDb = (database) => {
    db = database;
};

const getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await db.find({userId: req.user.uid}).toArray();
        res.status(200).json(suppliers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las proveedores.', error });
    }
};
const getSupplierById = async (req, res) => {
    try {
        const id = req.params.id;
        const supplier = await db.findOne({ _id: new ObjectId(id),userId: req.user.uid })
        res.status(200).json(supplier);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el proovedor', error });
    }
};
const createSupplier = async (req, res) => {
    const {name, contact, phone, email, address, supplierType, status, notes } = req.body;   
    try {
        const supplier = new Supplier(name, contact, phone, email, address, supplierType,status, notes);
        const result = await db.insertOne({
            userId: req.user.uid,
            name:name,
            contact: contact,
            phone: phone,
            email: email,
            address: address,
            supplierType: supplierType,
            status: status,
            notes: notes});
        if (!result.insertedId) {
            return res.status(500).json({ message: 'Error al insertar el proveedor' });
        }
        res.status(201).json({
            message: 'Proveedor insertado correctamente.',
            supplier: { _id: result.insertedId, ...supplier }
        });
    } catch (error) {
        console.error('Error al insertar el proveedor:', error);
        res.status(500).json({ message: 'Error al insertar el proveedor', error: error.message });
    }
};

const updateSupplier = async (req, res) => {
    
    try {
        const id = req.params.id; 
        const data = req.body; 

        const result = await db.updateOne(
            { _id: new ObjectId(id),userId: req.user.uid }, 
            { $set: data } 
        )
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Proveedor no encontrado" });
        }

        const updatedSupplier = await db.findOne({ _id: new ObjectId(id),userId: req.user.uid });
        res.json(updatedSupplier);
    } catch (error) {
        console.error("Error al actualizar el proveedor:", error);
        res.status(500).json({ message: "Error al actualizar el proveedor", error });
    } 
};

const deleteSupplier = async (req, res) => {
    try {
        const supplierId = req.params.id;
        const result = await db.deleteOne({ _id: new ObjectId(supplierId),userId: req.user.uid });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Proveedor no encontrado" });
        }
        res.json({ message: "Proveedor eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar el proveedor:", error);
        res.status(500).json({ message: "Error al eliminar el proveedor" });
    }
};

module.exports = { setDb, getAllSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier };
