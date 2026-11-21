# admin-access-project-frontend

## Proyecto de Programación Web – Frontend

Aplicación frontend desarrollada con **Angular y TypeScript**, orientada a la gestión de usuarios y proyectos. El proyecto implementa una estructura modular que facilita la organización, mantenimiento y evolución de la aplicación.

## Tecnologías utilizadas

- Angular
- TypeScript
- Node.js
- npm

## Requisitos

Para ejecutar el proyecto localmente, es necesario tener instalado:

- **Node.js:** versión 18 o superior.
- **npm:** versión 10 o superior.

Se recomienda verificar las versiones instaladas antes de iniciar:

```bash
node -v
npm -v
```

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/jgomez04/project-programacionWeb-Frontend.git
```

2. Ingresar al directorio del proyecto:

```bash
cd admin-access-project-frontend
```

3. Instalar las dependencias:

```bash
npm install
```

## Ejecución en ambiente local

Para iniciar la aplicación en ambiente de desarrollo, ejecutar:

```bash
ng serve
```
Si el proyecto está configurado con Angular CLI, la aplicación estará disponible por defecto en:

[http://localhost:4200](http://localhost:4200)

## Ambientes de configuración

El proyecto dispone de configuraciones para diferentes ambientes de ejecución:

- **Local:** desarrollo y pruebas desde el entorno del desarrollador.
- **QA:** pruebas y validación de funcionalidades.
- **Producción:** ambiente destinado al despliegue de la aplicación.

Las configuraciones de los ambientes se encuentran en la carpeta `src/environments` y se seleccionan mediante las configuraciones definidas en `angular.json`.

## Construcción de la aplicación

### Producción

```bash
ng build
```

### QA

```bash
ng build --configuration qa
```
Los archivos generados durante el proceso de construcción se almacenan en el directorio de salida configurado en Angular.

## Funcionalidades

- Navegación mediante rutas de Angular.
- Menú lateral dinámico.
- Visualización de opciones según roles de usuario.
- Gestión de usuarios.
- Gestión de proyectos.
- Comunicación con servicios backend mediante peticiones HTTP.
- Configuración por ambientes.

## Backend

La aplicación frontend se comunica con un backend mediante servicios HTTP.

La URL base de los servicios se configura a través de los archivos de ambiente, permitiendo ajustar la conexión según el ambiente de ejecución.

## Autoría y desarrollo

Proyecto desarrollado en el marco de Programación Web.

