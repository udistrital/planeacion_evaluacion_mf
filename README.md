# planeacion_evaluacion_mf

Microfrontend de evaluación. Contiene las características, funcionalidades y vistas iniciales del componente de evaluación del Cliente del Sistema de Planeación.

## Especificaciones Técnicas

### Tecnologías Implementadas y Versiones

- [Angular 16.1.0](https://angular.io/)
- [Node 16.14.0](https://nodejs.org/en)

### Variables de Entorno

```shell
# En Pipeline
SLACK_AND_WEBHOOK: WEBHOOK ..
AWS_ACCESS_KEY_ID: llave de acceso ID Usuario AWS
AWS_SECRET_ACCESS_KEY: Secreto de Usuario AWS
```

### Ejecución del Proyecto

Clonar el proyecto del repositorio de git

```bash
# clone the project
git clone https://github.com/udistrital/planeacion_evaluacion_mf.git


# enter the project directory
cd planeacion_evaluacion_mf
```

Iniciar el servidor en local

```bash
# install dependency
npx npm install
or
npm install
# start server
npx ng serve
# Whenever you want to change the port just run
npx ng dev --port = 9528
```

Linter

```bash
# Angular linter
npm run lint
# run linter and auto fix
npm run lint:fix
# run linter on styles
npm run lint:styles
# run lint UI
npm run lint:ci
```

### Ejecución Dockerfile

```bash
# Does not apply
```

### Ejecución docker-compose

```bash
# Does not apply
```

### Ejecución Pruebas

Pruebas unitarias powered by Jest

```bash
# run unit test
npm run test
# Runt linter + unit test
npm run test:ui
```

## Estado CI

```bash
# Developing
```

## Modelo de Datos

```bash
# Developing
```

## Licencia

planeacion_evaluacion_mf is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (atSara Sampaio your option) any later version.

planeacion_evaluacion_mf is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with planeacion_evaluacion_mf. If not, see https://www.gnu.org/licenses/.
