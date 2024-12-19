import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import bcrypt from 'bcrypt';

export const SECRET_KEY = 'secret';
export const REFRESH_SECRET_KEY = 'secret';

// Generación de tokens
const generateTokens = (user) => {
  const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' }); // Token que expira en 1 hora
  const refreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET_KEY, { expiresIn: '7d' }); // Refresh token que expira en 7 días
  return { token, refreshToken };
};

// Registro de usuario
export const register = async (req, res) => {
  const { name, email, password, role, university, phone, position } = req.body;

  try {
    // Verificación de que no exista un usuario con el mismo correo
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe." });
    }

    // Cifrado de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creación del nuevo usuario
    const newUser = new User({
      name,
      email,
      password: hashedPassword, // Guardamos la contraseña cifrada
      role,
      university,
      phone,
      position
    });

    // Guardamos el nuevo usuario en la base de datos
    await newUser.save();
    res.status(201).json({ message: "Usuario registrado exitosamente", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar el usuario", error });
  }
};

// Login de usuario
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario existe
    const foundUser = await User.findOne({ email: email });
    if (!foundUser) return res.status(401).json({ message: "Email o contraseña incorrectos" });

    // Comparar la contraseña
    const coincidence = await bcrypt.compare(password, foundUser.password);
    if (!coincidence) return res.status(401).json({ message: "Email o contraseña incorrectos" });

    // Generar los tokens
    const { token, refreshToken } = generateTokens(foundUser);

    // Configurar las cookies
    res.cookie('token', token, {
      httpOnly: true, // No accesible desde JS
      secure: process.env.NODE_ENV === 'production', // Solo en producción
      sameSite: 'None', // Necesario para peticiones entre dominios
      maxAge: 3600000,  // 1 hora
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true, // No accesible desde JS
      secure: process.env.NODE_ENV === 'production', // Solo en producción
      sameSite: 'None', // Necesario para peticiones entre dominios
      maxAge: 604800000,  // 7 días
    });

    res.status(200).json({ message: "Login exitoso", foundUser });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Error al iniciar sesión", error: error.message });
  }
};

// Logout de usuario
export const logout = (req, res) => {
  try {
    res.cookie('token', '', { expires: new Date(0) });
    res.cookie('refreshToken', '', { expires: new Date(0) });
    res.status(200).json({ message: "Logout exitoso" });
  } catch (error) {
    res.status(500).json({ message: "Error al cerrar sesión", error: error.message });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(403).json({ message: 'No se proporcionó un refresh token' });

  try {
    // Verificar y decodificar el refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
    const foundUser = await User.findById(decoded.id);

    if (!foundUser) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Generar nuevos tokens
    const { token, newRefreshToken } = generateTokens(foundUser);

    res.cookie('token', token, {
      httpOnly: true, // No accesible desde JS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 3600000,  // 1 hora
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'None',
      maxAge: 604800000,  // 7 días
    });

    res.status(200).json({ message: 'Token actualizado exitosamente' });
  } catch (error) {
    res.status(403).json({ message: 'Refresh token inválido', error: error.message });
  }
};

// Verificar token
export const verifyToken = async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(403).json({ message: "No se proporcionó token" });

  try {
    // Decodificar el token y obtener el ID del usuario
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({ message: "Token válido", user });
  } catch (error) {
    res.status(403).json({ message: "Token inválido", error: error.message });
  }
};

// Actualizar información de usuario
export const updateUser = async (req, res) => {
  const { userId, name, email, phone, university, position, role } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.university = university || user.university;
    user.position = position || user.position;
    user.role = role || user.role;

    await user.save();

    res.status(200).json({ message: 'Usuario actualizado con éxito', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
  }
};

// Obtener información del usuario autenticado
export const getUserInfo = async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(403).json({ message: "No se proporcionó token" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.status(200).json({ user });
  } catch (error) {
    res.status(403).json({ message: "Token inválido", error: error.message });
  }
};
