import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../controllers/auth.controller';

export const authenticate = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(403).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token', error: error.message });
  }
};
