const { MongoClient } = require('mongodb');
const Brand = require('../models/Brand');
const { ObjectId } = require('mongodb');

let db;

const setDb = (database) => {
    db = database;
};

const getAllBrands = async (req, res) => {
    try {
        const brands = await db.find().toArray();
        res.status(200).json(brands);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las marcas.', error });
    }
};

const createBrand = async (req, res) => {
    const { name, description, logo } = req.body;
    try {

        const brand = new Brand(name, description, logo );
        const result = await db.insertOne(brand);
        if (!result.insertedId) {
            return res.status(500).json({ message: 'Error al insertar la categoría' });
        }
        res.status(201).json({
            message: 'Marca insertada correctamente.',
            brand: { _id: result.insertedId, ...brand }
        });
    } catch (error) {
        console.error('Error al insertar la marca:', error);
        res.status(500).json({ message: 'Error al insertar la marca', error });
    }
}

const updateBrand = async (req, res) => {
    
    try {
        const id = req.params.id; 
        const data = req.body; 

        const result = await db.updateOne(
            { _id: new ObjectId(id) }, 
            { $set: data } 
        )
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Marca no encontrada" });
        }

        const updatedBrand = await db.findOne({ _id: new ObjectId(id) });
        res.json(updatedBrand);
    } catch (error) {
        console.error("Error al actualizar la marca:", error);
        res.status(500).json({ message: "Error al actualizar la marca", error });
    } 
};

const deleteBrand = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Marca no encontrada" });
        }
        res.json({ message: "Marca eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar la Marca:", error);
        res.status(500).json({ message: "Error al eliminar la Marca" });
    }
};

module.exports = { setDb, getAllBrands, createBrand, updateBrand, deleteBrand };
