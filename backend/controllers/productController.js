const { MongoClient } = require('mongodb');
const Product = require('../models/Product');
const { ObjectId } = require('mongodb');
let db;

const setDb = (database) => {
    db = database;
};

const getAllProducts = async (req, res) => {
    try {
        const products = await db.find().toArray();
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener las productos.', error });
    }
};

const createProduct = async (req, res) => {
    const { name, description, categoryId, brandId, supplierId, purchasePrice, salePrice, discount,tax, stock, measuring, status , img, atributes } = req.body;   
    try {
        const product = new Product(name, description, categoryId, brandId, supplierId, purchasePrice, salePrice, discount,tax, stock, measuring, status , img, atributes);
        const result = await db.insertOne(product);
        if (!result.insertedId) {
            return res.status(500).json({ message: 'Error al insertar el producto' });
        }
        res.status(201).json({
            message: 'Producto insertado correctamente.',
            product: { _id: result.insertedId, ...product }
        });
    } catch (error) {
        console.error('Error al insertar el producto:', error);
        res.status(500).json({ message: 'Error al insertar el producto', error: error.message });
    }
};

const updateProduct = async (req, res) => {
    
    try {
        const id = req.params.id; 
        const data = req.body; 

        const result = await db.updateOne(
            { _id: new ObjectId(id) }, 
            { $set: data } 
        )
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        const updatedProduct = await db.findOne({ _id: new ObjectId(id) });
        res.json(updatedProduct);
    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        res.status(500).json({ message: "Error al actualizar el producto", error });
    } 
};

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const result = await db.deleteOne({ _id: new ObjectId(productId) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar la producto:", error);
        res.status(500).json({ message: "Error al eliminar el producto" });
    }
};

module.exports = { setDb, getAllProducts, createProduct, updateProduct, deleteProduct };

