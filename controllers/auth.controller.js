import jwt from 'jsonwebtoken'
import User from '../models/user.model.js';
import bcrypt from 'bcrypt';


export const SECRET_KEY = 'secret';  
export const REFRESH_SECRET_KEY = 'secret';


const generateTokens = (user) => {
  const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' }); // Token que expira en 1 hora
  const refreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET_KEY, { expiresIn: '7d' }); // Refresh token que expira en 7 días
  return { token, refreshToken };
};

export const register = async (req, res) => {
  const { name, email, password, role, university, phone, position } = req.body;
  
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe." });
    }

    const newUser = new User({
      name,
      email,
      password, // La contraseña se cifrará automáticamente antes de guardarse
      role,
      university,
      phone,
      position
    });

    await newUser.save();
    res.status(201).json({ message: "Usuario registrado exitosamente", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar el usuario", error });
  }
};

// Ruta para login
export const login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const foundUser = await User.findOne({ email: email });
    if (!foundUser) return res.status(401).json({ message: "Email or password incorrect" });

    const coincidence = await bcrypt.compare(password, foundUser.password);
    if (!coincidence) return res.status(401).json({ message: "Email or password incorrect" });

    const { token, refreshToken } = generateTokens(foundUser);
    console.log(token, refreshToken);
    res.cookie('token', token);
    res.cookie('refreshToken', refreshToken);

    res.status(200).json({ message: "Login successful", foundUser });
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Ruta para logout
export const logout = (req, res) => {
  try {
    res.cookie('token', '', { expires: new Date(0) });
    res.cookie('refreshToken', '', { expires: new Date(0) });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(403).json({ message: 'No refresh token provided' });

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET_KEY); // Verifica el refresh token
    const foundUser = await User.findById(decoded.id);

    if (!foundUser) return res.status(404).json({ message: 'User not found' });

    // Generar un nuevo token
    const { token, refreshToken: newRefreshToken } = generateTokens(foundUser);

    res.cookie('token', token); // 1 hora
    res.cookie('refreshToken', newRefreshToken); // 7 días

    res.status(200).json({ message: 'Token refreshed successfully' });
  } catch (error) {
    res.status(403).json({ message: 'Invalid refresh token', error: error.message });
  }
};

export const verifyToken = async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(403).json({ message: "No token provided" });

  try {
    // Decodifica el token para obtener el ID del usuario
    const decoded = jwt.verify(token, SECRET_KEY);
    const userId = decoded.id; // Ajusta si el campo es diferente en tu token

    // Busca al usuario en la base de datos
    const user = await User.findById(userId); // Cambia por la consulta adecuada para tu DB
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Retorna el mensaje y los datos del usuario
    res.status(200).json({ message: "Token is valid", user });
  } catch (error) {
    res.status(403).json({ message: "Invalid token", error: error.message });
  }
};

export const verifyPassword = async (req, res) => {
    const { email, password } = req.body; 

    try {
        const foundUser = await User.findOne({ email: email });

        if (!foundUser) return res.status(401).json({ message: "User not found" });

        const match = await bcrypt.compare(password, foundUser.password);

        if (!match) return res.status(401).json({ message: "Incorrect password" });

        res.json({ message: "Authentication successful", user: foundUser });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Función para actualizar la información del usuario, incluyendo el rol
export const updateUser = async (req, res) => {
  const { userId, name, email, phone, university, position, role } = req.body;

  try {
    // Buscar al usuario en la base de datos
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar los datos del usuario
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.university = university || user.university;
    user.position = position || user.position;
    user.role = role || user.role;  // Actualizar el rol

    // Guardar los cambios
    await user.save();

    res.status(200).json({ message: 'Usuario actualizado con éxito', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
};
