const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json'); // Archivo JSON descargado de Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});