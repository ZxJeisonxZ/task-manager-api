# Task Manager API

API RESTful para gestión de tareas con Django REST Framework.

## Características
- CRUD completo de tareas
- PostgreSQL como base de datos
- Autenticación por token
- Frontend básico integrado

## Requisitos
- Python 3.8+
- PostgreSQL 12+
- pip

## Instalación
1. Clonar repositorio
2. Crear entorno virtual: `python -m venv venv`
3. Activar: `source venv/bin/activate`
4. Instalar dependencias: `pip install -r requirements.txt`
5. Configurar base de datos PostgreSQL
6. Ejecutar migraciones: `python manage.py migrate`
7. Iniciar servidor: `python manage.py runserver`
