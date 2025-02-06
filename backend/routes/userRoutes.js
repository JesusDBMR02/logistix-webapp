const express = require('express');
const { signUp, 
  setDb,
  updateUser, 
  getUserByEmail} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use((req, res, next) => {
  const collection = req.app.locals.db.collection('users');
  setDb(collection);
  next();
});

router.post('/signUp', signUp);

//router.get('/', authMiddleware, getUsers );

router.get('/:email', authMiddleware, getUserByEmail );

router.put('/:id', authMiddleware, updateUser );


module.exports = router;
