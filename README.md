# Nexo Proyectos

Frontend de Programación Web basado en la plantilla de la profesora Juliana Gómez.
Usa Angular, Angular Material y Bootstrap.

## Ejecutar

Con nvm instalado, usa la versión de Node indicada en el proyecto.

```sh
nvm install
nvm use
npm ci
npm start
```

Abre http://localhost:4200. Antes de iniciar sesión, ejecuta el backend de la carpeta
`../src` siguiendo su README, con PostgreSQL y los datos de demostración cargados.

La URL del backend está en `src/environments/environment.local.ts`.
Para desarrollo se usa `http://127.0.0.1:3000`. Las peticiones llevan el prefijo `/api`.
El backend define las cuentas de prueba y su contraseña mediante `DEMO_PASSWORD`.

## Funciones

- Inicio y cierre de sesión con el token y el usuario devueltos por la API.
- Gestión de usuarios propios para el administrador.
- Crear, consultar, editar y eliminar proyectos del administrador.
- Asignar y retirar usuarios propios desde el detalle del proyecto.
- Consulta de proyectos asignados para usuarios regulares.

El backend asigna automáticamente el rol y el administrador al crear usuarios.
Los proyectos tienen nombre, descripción opcional y fecha de creación.
Los permisos de escritura se validan también en el servidor.

Para mostrar las asignaciones se consulta la lista de usuarios y los proyectos
de cada uno, usando los endpoints existentes. Si crece mucho la cantidad de
usuarios, conviene agregar una consulta de participantes por proyecto al backend.

## Ejecutar en local

Usa Node 24.15.0, que cumple los requisitos de las dependencias de la plantilla.

```sh
nvm install
nvm use
npm ci
npm start
```

El frontend abre en http://localhost:4200. El backend de la carpeta ../src debe
estar iniciado con PostgreSQL y npm run dev. La API se configura en
src/environments/environment.local.ts y apunta a http://127.0.0.1:3000.
Las cuentas de demostración usan la contraseña DEMO_PASSWORD del backend.

Los componentes usan detección de cambios Eager y Zone.js para actualizar la
pantalla después de las suscripciones HTTP, siguiendo el estilo de la plantilla.

## Verificación

```sh
npm run build
npm test -- --watch=false --browsers=ChromeHeadless --include=src/app/core/service/auth.service.spec.ts
```

Las pruebas de sesión revisan el login con nuestro contrato, expiración, cierre
de sesión, encabezado Bearer, listados y respuestas vacías del servidor.
