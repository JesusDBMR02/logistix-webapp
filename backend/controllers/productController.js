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
        const products = await db.find({ userId: req.user.uid }).toArray();
        

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las productos.', error });
    }

};

const getProductById = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await db.findOne({ _id: new ObjectId(id), userId: req.user.uid  })
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el producto', error });
    }
};

const createProduct = async (req, res) => {
    const { name, description, categoryId, brandId, supplierId, purchasePrice, salePrice, discount,tax, stock, measuring, status , img, attributes } = req.body;   
    try {
        const price = salePrice - (salePrice * (discount / 100));
        const total = price + (price * (tax / 100));
        const category = await dbCategories.findOne({ _id: new ObjectId(categoryId), userId: req.user.uid  });
        const brand = await dbBrands.findOne({ _id: new ObjectId(brandId), userId: req.user.uid  });
        const supplier = await dbSuppliers.findOne({ _id: new ObjectId(supplierId), userId: req.user.uid  });

        const product = new Product(name, description, category, brand, supplier, purchasePrice, salePrice, discount,tax, stock, measuring, status , img, attributes, total);
        const result = await db.insertOne({
            userId: req.user.uid ,
            name,
            description,
            category,
            brand,
            supplier,
            purchasePrice,
            salePrice,
            discount,
            tax,
            stock,
            measuring,
            status,
            img,
            attributes,
            total});
        if (!result.insertedId) {
            return res.status(500).json({ message: 'Error al insertar el producto' });
        }
        updateSuppliedProducts(supplierId,result.insertedId, req ); 

        res.status(201).json({
            message: 'Producto insertado correctamente.',
            product: { _id: result.insertedId, ...product }
        });
    } catch (error) {
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
            const category = await dbCategories.findOne({ _id: new ObjectId(data.categoryId), userId: req.user.uid  });
            const brand = await dbBrands.findOne({ _id: new ObjectId(data.brandId), userId: req.user.uid  });
            const supplier = await dbSuppliers.findOne({ _id: new ObjectId(data.supplierId), userId: req.user.uid  });
            data = {...data, total, category, supplier, brand };
            updateSuppliedProducts(supplierId,id,req ); 
            
        }
        const result = await db.updateOne(
            { _id: new ObjectId(id), userId: req.user.uid  }, 
            { $set: data } 
        )
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        const updatedProduct = await db.findOne({ _id: new ObjectId(id),userId: req.user.uid });
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el producto", error });
    } 
};

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const result = await db.deleteOne({ _id: new ObjectId(productId),userId: req.user.uid });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }
        res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el producto" });
    }
};

const updateSuppliedProducts=async (id, productId, req)=>{
    try {
        const product = await db.findOne({ _id: new ObjectId(productId),userId: req.user.uid });
        data = {suppliedProducts: product}
        const supplier = await dbSuppliers.findOne({ _id: new ObjectId(id),userId: req.user.uid });
        if (!supplier) {
            throw new Error("Proveedor no encontrado");
        }

        if (!Array.isArray(supplier.suppliedProducts)) {
            await dbSuppliers.updateOne(
                { _id: new ObjectId(id),userId: req.user.uid },
                { $set: { suppliedProducts: [] } }
            );
        }
        const result = await dbSuppliers.updateOne(
            { _id: new ObjectId(id),userId: req.user.uid },
            { $push: data }
        );
        if (result.matchedCount === 0) {
            return false;
        }
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = { setDb, getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };

