# 🦕 Dino Library

<div align="center">

![Dino Library Banner](./src/assets/backgrounds/JurassicBackground.jpg)

**An immersive learning experience about dinosaurs through archaeological discoveries, interactive maps and scientific education.**

[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

[Live Demo](https://dino-library.vercel.app) • [Report Bug](https://github.com/ensinho/dino-library/issues) • [Request Feature](https://github.com/ensinho/dino-library/issues)

</div>

---

## 🌟 Key Features

### 🔍 **Interactive Species Catalog**
- **Complete database** with over 500 dinosaur species
- **Advanced filters** by geological period, diet and location
- **Smart search system** with real-time search via Firestore
- **Optimized pagination** for efficient navigation
- **Informative cards** with complete scientific details
- **Intelligent caching** for better performance

### 🗺️ **Interactive Archaeological Maps**
- **Geographic visualization** of fossil discovery sites
- **Leaflet integration** for dynamic and responsive maps
- **Custom markers** for each archaeological site
- **Detailed information** about each discovery

### ⏰ **Evolutionary Timeline**
- **Interactive timeline** of paleontological discoveries
- **Chronological visualization** of geological periods
- **Historical milestones** of world paleontology

### 🎓 **Educational Center**
- **Interactive quizzes** to test knowledge
- **Educational content** about paleontology
- **Gamified learning experiences**

### 👤 **Authentication and Profile System**
- **Secure login/signup** via Firebase Auth
- **Personalized profiles** with activity history
- **Learning progress** saved in the cloud

## 🚀 Technologies Used

### **Frontend**
- **React 18.3.1** - Main framework for UI
- **TypeScript 5.8.3** - Static typing for greater robustness
- **Vite 5.4.19** - Ultra-fast build tool
- **React Router DOM 6.30.1** - SPA routing
- **TanStack Query 5.83.0** - State management and caching

### **UI/UX & Styling**
- **Tailwind CSS 3.4.17** - Utility CSS framework
- **Radix UI** - Accessible and customizable components
- **Lucide React** - Modern icon library
- **Class Variance Authority** - Typed component variants
- **Framer Motion** (via Tailwind Animate) - Smooth animations

### **Maps & Visualization**
- **Leaflet 1.9.4** - Interactive maps
- **React Leaflet 4.2.1** - React + Leaflet integration
- **Turf.js 7.2.0** - Geospatial analysis
- **Recharts 2.15.4** - Charts and data visualizations

### **Backend & Database**
- **Firebase Auth** - Authentication (Email/Password)
- **Cloud Firestore** - Document database

### **Internationalization**
- **i18next 25.5.2** - Translation system
- **Support for 3 languages**: Portuguese, English and Spanish
- **Automatic detection** of browser language

### **Development Tools**
- **ESLint 9.32.0** - Code linting
- **PostCSS 8.5.6** - CSS processing
- **Autoprefixer** - Cross-browser CSS compatibility

## 🏗️ System Architecture

```mermaid
graph TB
    A[Frontend React] --> B[Firebase SDK]
    B --> C[Cloud Firestore]
    B --> D[Firebase Auth]
    
    F[Leaflet Maps] --> A
    G[TanStack Query] --> A
    H[i18next] --> A
    
    subgraph "Firebase Backend"
        C --> I[Dinosaur Data]
        D --> J[User Authentication]
    end
    
    subgraph "Frontend Stack"
        A --> L[React Router]
        A --> M[Radix UI]
        A --> N[Tailwind CSS]
    end
```

## 📦 Installation and Setup

### **Prerequisites**
- Node.js 18+
- Git
- Firebase project (Auth + Firestore enabled)

### **1. Clone the repository**
```bash
git clone https://github.com/ensinho/dino-library.git
cd dino-library
```

### **2. Install dependencies**
```bash
# With npm
npm install


```

### **3. Configure environment variables**
```bash
# Copy the example file
cp .env.example .env

# Configure your variables in the .env file
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_ENABLE_ANALYTICS=true
```

### **5. Start the development server**
```bash
npm run dev
# or
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run vercel-build # Optimized build for Vercel
```

## 📊 Project Structure

```
dino-library/
├── 📁 src/
│   ├── 📁 components/         # React components
│   │   ├── 📁 ui/            # Base UI components
│   │   └── 📁 layout/        # Layout components
│   ├── 📁 pages/             # Application pages
│   ├── 📁 services/          # Services and APIs
│   ├── 📁 hooks/             # Custom React Hooks
│   ├── 📁 lib/               # Utilities and configurations
│   └── 📁 integrations/      # External integrations
├── 📁 public/
│   └── 📁 locales/           # Translation files

```

## 🌐 Deployment

### **Vercel (Recommended)**
1. Connect your repository to Vercel
2. Configure environment variables
3. Automatic deployment on every push

### **Other providers**
```bash
# Build for production
npm run build

# The 'dist' folder contains files for deployment
```

## 🤝 Contributing

Contributions are always welcome! To contribute:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📈 Roadmap

- [ ] **Favorites system** for dinosaurs
- [ ] **Augmented reality** for 3D visualization
- [ ] **Public API** for developers
- [ ] **Gamified achievement system**
- [ ] **Offline mode** with PWA
- [ ] **Partner museum integration**

## 📄 License

This project is under the MIT license. See the [LICENSE](LICENSE) file for more details.

## 👨‍💻 Author

**Enzo Esmeraldo**

- GitHub: [@ensinho](https://github.com/ensinho)
- LinkedIn: [Enzo Esmeraldo](https://www.linkedin.com/in/enzoesmeraldo)
- Email: enzopo625@gmail.com

---

<div align="center">

**Made with ❤️ by [Enzo Esmeraldo](https://github.com/ensinho)**

⭐ **If this project helped you, consider giving it a star!**

</div>