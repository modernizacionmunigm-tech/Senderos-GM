# 🥾 Senderos Guardia Mitre - Proyecto Monte Mitre

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue?logo=github)](https://modernizacionmunigm-tech.github.io/Senderos-GM/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)](https://vitejs.dev/)

Aplicación web interactiva para el registro y seguimiento de senderos turísticos en **Guardia Mitre, Río Negro, Argentina**. Desarrollada para promover el turismo de naturaleza, la actividad física y la educación ambiental.

🔗 **Demo en vivo**: https://modernizacionmunigm-tech.github.io/Senderos-GM/

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Escalabilidad](#-escalabilidad)
- [Créditos](#-créditos)
- [Licencia](#-licencia)

---

## ✨ Características

### 🗺️ **Mapas Interactivos GPS**
- Visualización de senderos con Leaflet.js
- Dos niveles de dificultad: **Baja** (1.58 km) y **Alta** (2.65 km)
- Tracking GPS en tiempo real
- Modo simple (cronómetro optimizado) y modo completo (mapa + cronómetro)
- Checkpoints numerados con nombres descriptivos
- Cálculo automático de distancia y tiempo

### 🌿 **Guía de Biodiversidad**
- Catálogo de flora y fauna local con imágenes de Wikimedia Commons
- Integración con **PlantNet** para identificación de plantas
- Conexión con **iNaturalist** para ciencia ciudadana
- Filtros por categorías: árboles, aves, insectos, hongos
- Búsqueda por nombre común y científico

### ⏱️ **Registro de Tiempos**
- Formulario integrado con Google Forms
- Sincronización automática con Google Sheets
- Tabla de clasificación en tiempo real
- Filtros por sendero, categoría y corredor
- Medallas para top 3 (🏆🥈)

### 📱 **Progressive Web App (PWA)**
- Instalable en dispositivos móviles
- Funcionamiento offline parcial
- Notificaciones push configurables
- Diseño 100% responsive

###  **Seguridad**
- Botón de emergencia 911 flotante
- Información de contacto visible en todo momento

---

## 🛠️ Tecnologías

| Categoría | Tecnología |
|-----------|------------|
| **Frontend** | React 18 + TypeScript |
| **Build Tool** | Vite 5 |
| **Estilos** | Tailwind CSS |
| **Mapas** | Leaflet + React-Leaflet |
| **Iconos** | Lucide React |
| **Backend** | Google Forms + Google Sheets |
| **Imágenes** | Wikimedia Commons API |
| **Deploy** | GitHub Pages |

---

## 📦 Instalación

### Requisitos previos
- Node.js 18+ 
- npm o yarn
- Git

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/TU_USUARIO/Senderos-GM.git
cd Senderos-GM