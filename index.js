const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: false
};

// Función para crear conexión a DB
async function createConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
    throw error;
  }
}

// Función helper para enviar respuestas
function sendResponse(res, success, data = null, error = null, statusCode = 200) {
  res.status(statusCode).json({
    success,
    data,
    error,
    timestamp: new Date().toISOString()
  });
}

// Validar email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Ruta de prueba
app.get('/', (req, res) => {
  sendResponse(res, true, { message: 'FluxIO API funcionando correctamente' });
});

// Ruta para verificar conexión a DB
app.get('/test-db', async (req, res) => {
  try {
    const connection = await createConnection();
    await connection.execute('SELECT 1');
    await connection.end();
    sendResponse(res, true, { message: 'Conexión a MySQL exitosa' });
  } catch (error) {
    sendResponse(res, false, null, 'Error de conexión a la base de datos', 500);
  }
});

// Registro de usuario
app.post('/register', async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, phone } = req.body;

    // Validaciones
    if (!username || !email || !password || !first_name || !last_name) {
      return sendResponse(res, false, null, 'Todos los campos requeridos deben estar presentes', 400);
    }

    if (!isValidEmail(email)) {
      return sendResponse(res, false, null, 'Email no válido', 400);
    }

    if (password.length < 6) {
      return sendResponse(res, false, null, 'La contraseña debe tener al menos 6 caracteres', 400);
    }

    const connection = await createConnection();

    // Verificar si el email ya existe
    const [emailCheck] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (emailCheck.length > 0) {
      await connection.end();
      return sendResponse(res, false, null, 'El email ya está registrado', 409);
    }

    // Verificar si el username ya existe
    const [usernameCheck] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (usernameCheck.length > 0) {
      await connection.end();
      return sendResponse(res, false, null, 'El nombre de usuario ya está en uso', 409);
    }

    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Insertar nuevo usuario
    const [result] = await connection.execute(`
      INSERT INTO users (
        username, email, password_hash, first_name, last_name, 
        phone, preferred_currency, language_preference, timezone,
        biometric_enabled, notifications_enabled, is_active, 
        email_verified, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      username, email, passwordHash, first_name, last_name,
      phone || null, 'USD', 'es', 'America/Mexico_City',
      false, true, true, false
    ]);

    // Obtener el usuario creado
    const [userData] = await connection.execute(`
      SELECT id, username, email, first_name, last_name, phone, 
             preferred_currency, language_preference, timezone,
             biometric_enabled, notifications_enabled, is_active,
             email_verified, created_at, updated_at
      FROM users WHERE id = ?
    `, [result.insertId]);

    await connection.end();

    sendResponse(res, true, userData[0], null, 201);

  } catch (error) {
    console.error('Error en registro:', error);
    sendResponse(res, false, null, 'Error interno del servidor', 500);
  }
});

// Login de usuario
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, false, null, 'Email y contraseña son requeridos', 400);
    }

    if (!isValidEmail(email)) {
      return sendResponse(res, false, null, 'Email no válido', 400);
    }

    const connection = await createConnection();

    // Buscar usuario por email
    const [users] = await connection.execute(`
      SELECT id, username, email, password_hash, first_name, last_name,
             phone, preferred_currency, language_preference, timezone,
             biometric_enabled, notifications_enabled, is_active,
             email_verified, created_at, updated_at, last_login_at
      FROM users WHERE email = ? AND is_active = 1
    `, [email]);

    if (users.length === 0) {
      await connection.end();
      return sendResponse(res, false, null, 'Credenciales incorrectas', 401);
    }

    const user = users[0];

    // Verificar contraseña
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      await connection.end();
      return sendResponse(res, false, null, 'Credenciales incorrectas', 401);
    }

    // Actualizar último login
    await connection.execute(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    );

    await connection.end();

    // Remover password_hash de la respuesta
    delete user.password_hash;
    user.last_login_at = new Date().toISOString();

    sendResponse(res, true, user);

  } catch (error) {
    console.error('Error en login:', error);
    sendResponse(res, false, null, 'Error interno del servidor', 500);
  }
});

// Verificar si email existe
app.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendResponse(res, false, null, 'Email es requerido', 400);
    }

    if (!isValidEmail(email)) {
      return sendResponse(res, false, null, 'Email no válido', 400);
    }

    const connection = await createConnection();

    const [result] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    await connection.end();

    const exists = result.length > 0;
    sendResponse(res, true, { exists });

  } catch (error) {
    console.error('Error verificando email:', error);
    sendResponse(res, false, null, 'Error interno del servidor', 500);
  }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  sendResponse(res, false, null, 'Error interno del servidor', 500);
});

// Ruta no encontrada
app.use('*', (req, res) => {
  sendResponse(res, false, null, 'Ruta no encontrada', 404);
});

app.listen(PORT, () => {
  console.log(`🚀 FluxIO API ejecutándose en puerto ${PORT}`);
});

module.exports = app;
