# GrupLomi - Sistema de Gestión de Gastos 💰

Sistema completo de gestión de gastos empresariales con control de roles, permisos y flujos de aprobación.

## 🚀 Características

- **Gestión de Gastos**: Registro, aprobación y seguimiento de gastos empresariales
- **Sistema de Roles y Permisos**: Control granular de acceso a funcionalidades
- **Categorías Personalizables**: Organización de gastos por categorías con límites
- **Notificaciones por Email**: Sistema SMTP configurable para alertas
- **Multi-idioma**: Soporte para ES, EN, CA, DE, IT, PT
- **Dashboard Interactivo**: Visualización de estadísticas y métricas
- **Modo Oscuro**: Interfaz adaptable con múltiples temas

## 📋 Requisitos Previos

- Node.js 16.0 o superior
- npm o yarn
- Git

## 🛠️ Instalación Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/gruplomi-expense-system.git
cd gruplomi-expense-system
```

2. **Instalar dependencias**
```bash
npm install
# o
yarn install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Edita `.env.local` con tu configuración:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=30000
```

4. **Iniciar el servidor de desarrollo**
```bash
npm start
# o
yarn start
```

El proyecto estará disponible en `http://localhost:3000`

## 🚀 Despliegue en Vercel

### Opción 1: Deploy con Vercel CLI

1. **Instalar Vercel CLI**
```bash
npm i -g vercel
```

2. **Login en Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

### Opción 2: Deploy desde GitHub

1. **Push a GitHub**
```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tu-usuario/gruplomi-expense-system.git
git push -u origin main
```

2. **Conectar con Vercel**
- Ve a [vercel.com](https://vercel.com)
- Click en "New Project"
- Importa tu repositorio de GitHub
- Configura las variables de entorno:
  - `REACT_APP_API_URL`: URL de tu API backend
  - `REACT_APP_ENVIRONMENT`: production

3. **Deploy automático**
- Vercel desplegará automáticamente con cada push a main
- Preview deployments para cada PR

## 🔧 Configuración de Variables de Entorno en Vercel

En el dashboard de Vercel, ve a Settings → Environment Variables y añade:

```
REACT_APP_API_URL=https://api.tu-dominio.com
REACT_APP_ENVIRONMENT=production
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_DEFAULT_LANGUAGE=es
```

## 📁 Estructura del Proyecto

```
gruplomi-expense-system/
├── public/              # Archivos públicos
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── CategoriesManager.js
│   │   ├── SMTPConfig.js
│   │   └── Navbar.js
│   ├── context/        # Context API
│   │   ├── AuthContext.js
│   │   └── ConfigContext.js
│   ├── pages/          # Páginas de la aplicación
│   │   ├── Dashboard.js
│   │   ├── GastosPage.js
│   │   ├── ConfigPage.js
│   │   ├── RolesPage.js
│   │   └── UsersPage.js
│   ├── services/       # Servicios y APIs
│   │   └── api.js
│   └── App.js         # Componente principal
├── .env.example       # Variables de entorno ejemplo
├── vercel.json        # Configuración de Vercel
└── package.json       # Dependencias y scripts
```

## 🔑 Roles y Permisos

### Roles predefinidos:
- **Administrador**: Acceso total al sistema
- **Supervisor**: Gestión de gastos y aprobaciones
- **Empleado**: Registro de gastos propios
- **Auditor**: Solo lectura para auditorías

### Permisos disponibles:
- Gestión de tickets
- Gestión de gastos
- Administración de usuarios
- Configuración del sistema
- Generación de informes
- Gestión de notificaciones

## 📊 Scripts Disponibles

```bash
npm start          # Inicia servidor de desarrollo
npm run build      # Construye para producción
npm test           # Ejecuta tests
npm run eject      # Eyecta de Create React App (no recomendado)
```

## 🐛 Debugging

Para debuggear en desarrollo:

1. Abre Chrome DevTools
2. Ve a Sources → Webpack → src
3. Añade breakpoints en tu código
4. Usa console.log para debugging rápido

## 📝 Commits y Versionado

Usa commits semánticos:
```bash
feat: nueva funcionalidad
fix: corrección de bugs
docs: cambios en documentación
style: cambios de formato
refactor: refactorización de código
test: añadir tests
chore: tareas de mantenimiento
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Distribuido bajo licencia MIT. Ver `LICENSE` para más información.

## 📞 Contacto

GrupLomi - [info@gruplomi.com](mailto:info@gruplomi.com)

Link del Proyecto: [https://github.com/tu-usuario/gruplomi-expense-system](https://github.com/tu-usuario/gruplomi-expense-system)

## 🙏 Agradecimientos

- [React](https://reactjs.org/)
- [Vercel](https://vercel.com/)
- [Lucide Icons](https://lucide.dev/)
- [Create React App](https://create-react-app.dev/)

---

⭐ Si este proyecto te ha sido útil, considera darle una estrella en GitHub!