const express = require('express');
const { signUp, setDb } = require('../controllers/userController');
const router = express.Router();

router.use((req, res, next) => {
  const collection = req.app.locals.db.collection('users');
  setDb(collection);
  next();
});

router.post('/signUp', signUp);

module.exports = router;
