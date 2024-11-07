const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 
const { connectToMongoDB } = require('./config/db.js');
const userRoutes = require('./routes/userRoutes.js');

dotenv.config();
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

    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Error al conectar a MongoDB:', error);
  });
