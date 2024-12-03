const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No se proporcionó un token válido' });
    }
  
    const token = authHeader.split(' ')[1]; 
  
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken; 
      next();
    } catch (error) {
      console.error("Error verificando el token:", error);
      res.status(401).json({ message: 'Token inválido o expirado' });
    }
  };
module.exports = authMiddleware;
