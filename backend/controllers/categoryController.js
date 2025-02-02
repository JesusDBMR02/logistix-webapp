const { MongoClient } = require('mongodb');
const Category = require('../models/Category');
const { ObjectId } = require('mongodb');
let db;

const setDb = (database) => {
    db = database;
};

const getAllCategories = async (req, res) => {
    try {
        const categories = await db.find({ userId: req.user.uid }).toArray();
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las categorías.', error });
    }
};
const getCategoryById = async (req, res) => {
    try {
        const id = req.params.id;
        const category = await db.findOne({ _id: new ObjectId(id), userId: req.user.uid  })
        res.status(200).json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener la categoría', error });
    }
};
const createCategory = async (req, res) => {
    const { name, description } = req.body;   
    try {
        const category = new Category(name, description);
        const result = await db.insertOne({
            userId: req.user.uid, name, description},
            );
        if (!result.insertedId) {
            return res.status(500).json({ message: 'Error al insertar la categoría' });
        }
        res.status(201).json({
            message: 'Categoría insertada correctamente.',
            category: { _id: result.insertedId, ...category }
        });
    } catch (error) {
        console.error('Error al insertar la categoría:', error);
        res.status(500).json({ message: 'Error al insertar la categoría', error: error.message });
    }
};

const updateCategory = async (req, res) => {
    
    try {
        const id = req.params.id; 
        const data = req.body; 

        const result = await db.updateOne(
            { _id: new ObjectId(id), userId: req.user.uid  }, 
            { $set: data } 
        )
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Categoría no encontrada" });
        }

        const updatedCategory = await db.findOne({ _id: new ObjectId(id), userId: req.user.uid  });
        res.json(updatedCategory);
    } catch (error) {
        console.error("Error al actualizar la categoría:", error);
        res.status(500).json({ message: "Error al actualizar la categoría", error });
    } 
};

const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const result = await db.deleteOne({ _id: new ObjectId(categoryId), userId: req.user.uid  });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Categoría no encontrada" });
        }
        res.json({ message: "Categoría eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar la categoría:", error);
        res.status(500).json({ message: "Error al eliminar la categoría" });
    }
};

module.exports = { setDb, getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };

