const { MongoClient } = require('mongodb');
const Product = require('../models/Product');
const { ObjectId } = require('mongodb');
const categoryController = require('./categoryController');
let db;
let dbBrands;
let dbCategories;
let dbSuppliers;

const setDb = (database, databaseCategories, databaseBrands, databaseSuppliers) => {
    db = database;
    dbBrands = databaseBrands;
    dbCategories = databaseCategories;
    dbSuppliers = databaseSuppliers;
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

const getProductById = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await db.findOne({ _id: new ObjectId(id) })
        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el producto', error });
    }
};

const createProduct = async (req, res) => {
    const { name, description, categoryId, brandId, supplierId, purchasePrice, salePrice, discount,tax, stock, measuring, status , img, attributes } = req.body;   
    try {
        const price = salePrice - (salePrice * (discount / 100));
        const total = price + (price * (tax / 100));
        const category = await dbCategories.findOne({ _id: new ObjectId(categoryId) });
        const brand = await dbBrands.findOne({ _id: new ObjectId(brandId) });
        const supplier = await dbSuppliers.findOne({ _id: new ObjectId(supplierId) });

        const product = new Product(name, description, category, brand, supplier, purchasePrice, salePrice, discount,tax, stock, measuring, status , img, attributes, total);
        const result = await db.insertOne(product);
        if (!result.insertedId) {
            return res.status(500).json({ message: 'Error al insertar el producto' });
        }
        updateSuppliedProducts(supplierId,result.insertedId ); 

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
        let data = req.body; 
        const supplierId = data.supplierId; 
        const isOnlyStock = Object.keys(data).length === 1 && data.hasOwnProperty('stock');
        if (isOnlyStock) {
            if (data.stock <= 5) {
                data = { stock: data.stock, status: 'OUTSTOCK' };
            } else if (data.stock <= 20) {
                data = { stock: data.stock, status: 'LOWSTOCK' };
            } else {
                data = { stock: data.stock, status: 'INSTOCK' };
            }
        }else{
            const price = data.salePrice - (data.salePrice * (data.discount / 100));
            const total = price + (price * (data.tax / 100));
            const category = await dbCategories.findOne({ _id: new ObjectId(data.categoryId) });
            const brand = await dbBrands.findOne({ _id: new ObjectId(data.brandId) });
            const supplier = await dbSuppliers.findOne({ _id: new ObjectId(data.supplierId) });
            data = {...data, total, category, supplier, brand };
            updateSuppliedProducts(supplierId,id ); 
            
        }
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

const updateSuppliedProducts=async (id, productId)=>{
    try {
        const product = await db.findOne({ _id: new ObjectId(productId) });
        data = {suppliedProducts: product}
        const supplier = await dbSuppliers.findOne({ _id: new ObjectId(id) });
        if (!supplier) {
            throw new Error("Proveedor no encontrado");
        }

        if (!Array.isArray(supplier.suppliedProducts)) {
            await dbSuppliers.updateOne(
                { _id: new ObjectId(id) },
                { $set: { suppliedProducts: [] } }
            );
        }
        const result = await dbSuppliers.updateOne(
            { _id: new ObjectId(id) },
            { $push: data }
        );
        if (result.matchedCount === 0) {
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error al actualizar el proovedor proporcionado:", error);
        return false;
    }
}

module.exports = { setDb, getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };

