const { MongoClient } = require('mongodb');
const User = require('../models/user');
const bcrypt = require('bcrypt');

let db;

const setDb = (database) => {
  db = database;
};

const signUp = async (req, res) => {
  const { email, password, name, lastName, company, role, address, phone } = req.body;

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = new User(email, hashedPassword, name, lastName, company, role, address, phone);

    await db.insertOne(user);
    res.status(201).json({ message: 'Usuario registrado exitosamente.' });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ message: 'Error al registrar el usuario.', error });
  }
};

const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      res.status(200).json({ message: 'Inicio de sesión exitoso.' });
    } else {
      res.status(401).json({ message: 'Contraseña incorrecta.' });
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión.', error });
  }
};

module.exports = { setDb, signUp, signIn };

