# 🚀 FluxIO API Backend

API Backend para la aplicación FluxIO desarrollada con Node.js y Express.

## 🔧 Configuración para GitHub + Vercel

### **Paso 1: Crear repositorio en GitHub**

1. Ve a [github.com](https://github.com) y crea un **nuevo repositorio**
2. Nómbralo: `fluxio-api`
3. Hazlo **público** (para usar Vercel gratis)
4. **NO** inicialices con README

### **Paso 2: Subir código**

```bash
# En tu terminal, navega a la carpeta vercel_api
cd vercel_api

# Inicializar git
git init

# Agregar archivos
git add .

# Hacer commit
git commit -m "Initial commit - FluxIO API"

# Conectar con tu repositorio (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/fluxio-api.git

# Subir código
git push -u origin main
```

### **Paso 3: Configurar Vercel**

1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en **"Sign up with GitHub"**
3. Autoriza a Vercel acceso a tu GitHub
4. Haz clic en **"Import Project"**
5. Selecciona tu repositorio `fluxio-api`
6. Haz clic en **"Deploy"**

### **Paso 4: Configurar variables de entorno en Vercel**

1. En el dashboard de Vercel, ve a tu proyecto
2. Ve a **Settings → Environment Variables**
3. Agrega estas variables:

```
DB_HOST = db5018088017.hosting-data.io
DB_USER = dbu5688485
DB_PASSWORD = 100703Shooterheder_27!
DB_NAME = dbs14363589
DB_PORT = 3306
```

4. Haz clic en **"Save"**
5. Ve a **Deployments** y haz clic en **"Redeploy"**

### **Paso 5: Probar tu API**

Tu API estará disponible en: `https://tu-proyecto.vercel.app`

Prueba estas rutas:
- `GET /` - Verificar que funciona
- `GET /test-db` - Probar conexión a MySQL
- `POST /register` - Registrar usuario
- `POST /login` - Login de usuario

### **Paso 6: Actualizar Flutter**

En `lib/core/services/api_service.dart`, cambia:

```dart
static const String baseUrl = 'https://tu-proyecto.vercel.app';
```

## 🧪 Endpoints de la API

### `POST /register`
```json
{
  "username": "testuser",
  "email": "test@example.com", 
  "password": "123456",
  "first_name": "Test",
  "last_name": "User",
  "phone": "+1234567890"
}
```

### `POST /login`
```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

### `POST /check-email`
```json
{
  "email": "test@example.com"
}
```

## ✅ **¡Listo!**

Una vez configurado:
- ✅ Tu API estará en la nube (gratis)
- ✅ Se conectará a tu MySQL de IONOS
- ✅ Flutter podrá hacer registro/login real
- ✅ Escalable y seguro

¿Necesitas ayuda con algún paso?
