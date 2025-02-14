const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 
const { connectToMongoDB } = require('./config/db.js');
const userRoutes = require('./routes/userRoutes.js');
const categoryRoutes = require('./routes/categoryRoutes.js'); 
const brandRoutes = require('./routes/brandRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const supplierRoutes = require('./routes/supplierRoutes.js');
const purchaseRoutes = require('./routes/purchaseRoutes.js');
const saleRoutes = require('./routes/saleRoutes.js');

if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: '.env.test' });
} else {
  require('dotenv').config();
}
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

connectToMongoDB()
  .then((db) => {
    app.locals.db = db; 

    // Rutas
    app.get('/', (req, res) => res.send("Welcome to LogistiX API!"));
    app.use('/api/users', userRoutes);
    app.use('/api/categories', categoryRoutes);
    app.use('/api/brands', brandRoutes);
    app.use('/api/products',productRoutes);
    app.use('/api/suppliers', supplierRoutes);
    app.use('/api/purchases', purchaseRoutes);
    app.use('/api/sales', saleRoutes);


    // Iniciar el servidor
    if (process.env.NODE_ENV !== 'test') {
      // Solo inicias el servidor cuando no estás en un entorno de prueba
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    }
  })
  .catch(error => {
    console.error('Error al conectar a MongoDB:', error);
  });
module.exports = app;