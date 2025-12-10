# Task Manager API

API de gestión de tareas construida con Django y Django REST Framework. Provee endpoints para crear, listar, actualizar y eliminar tareas.

## Para qué sirve

Permite la gestión de tareas (CRUD) a través de una API REST.

## Tecnologías

- Python (versión compatible especificada en `requirements.txt`).
- Django.
- Django REST Framework.
- Docker y Docker Compose.
- PostgreSQL.

## Requisitos

- Python 3.9+ (según `requirements.txt`).
- pip.
- PostgreSQL 12+ (o usar Docker con la imagen de postgres).
- (Opcional) Docker y Docker Compose para ejecutar en contenedores.

## Variables de entorno recomendadas (.env)

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Configuración de PostgreSQL
DATABASE_URL=postgres://taskuser:admin123@localhost:5432/taskdb

# Django secret key
SECRET_KEY=B1rsb8FjzwoFjbWC9P2U1qmrhnXzs9tQH7R1SLydqH7z_z6a_XN_TDwrqPrXl0f3Y28

# Modo DEBUG
DEBUG=True
```

## Instalación y ejecución (local, usando PostgreSQL)

1. Clonar el repositorio y entrar en la carpeta del proyecto:

```bash
git clone git@github.com:ZxJeisonxZ/task-manager-api.git
cd task-manager-api
```

2. Crear y activar un entorno virtual:

```bash
python -m venv venv
source venv/bin/activate  # macOS / Linux
venv\Scripts\activate     # Windows
```

3. Instalar dependencias:

```bash
pip install -r task-manager-api/requirements.txt
```

4. Configurar variables de entorno (crear `.env` con los valores anteriores).
5. Aplicar migraciones:

```bash
python manage.py migrate
```

6. Crear superusuario (opcional):

```bash
python manage.py createsuperuser
```

7. Ejecutar el servidor de desarrollo:

```bash
python manage.py runserver
```

## Ejecución con Docker

Debes realizar lo siguiente:

```bash
# 1. Construir y ejecutar
docker-compose up -d --build

# 2. Ejecutar migraciones
docker-compose exec web python manage.py migrate

# 3. Crear superusuario
docker-compose exec web python manage.py createsuperuser --username admin --email admin@example.com

# 4. Iniciar el servidor
docker-compose exec web python manage.py runserver 0.0.0.0:8000
```

## Endpoints

Los endpoints dependen de la implementación. Ejemplos comunes:

- `GET /api/tasks/` - listar tareas
- `POST /api/tasks/` - crear tarea
- `GET /api/tasks/<id>/` - ver detalle
- `PUT/PATCH /api/tasks/<id>/` - actualizar tarea
- `DELETE /api/tasks/<id>/` - eliminar tarea

Para mas informacion acerca de los endpoints, revisa `urls.py` dentro de la app tasks.

## Comandos útiles

- `python manage.py showmigrations` - ver migraciones
- `python manage.py makemigrations` - generar migraciones
- `python manage.py migrate` - migrar
