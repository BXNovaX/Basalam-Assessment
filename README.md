# Kubernetes App Manager

A simple web application for managing Kubernetes application deployments with a modern UI.

## Tech Stack

### Backend
- **Django 5.2.6** - Python web framework
- **Django REST Framework** - RESTful API
- **SQLite** - Database (default)
- **django-cors-headers** - CORS support

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **SWR** - Data fetching and caching
- **React Router** - Client-side routing

## Prerequisites

- Python 3.12+
- Node.js 18+
- pnpm

## Installation & Setup

### Backend Setup

```bash
cd backend
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
./venv/bin/python manage.py migrate
```

### Frontend Setup

```bash
cd frontend
pnpm install
```

## Running the Project

### Start Backend Server

```bash
cd backend
./venv/bin/python manage.py runserver
```

The API will be available at `http://localhost:8000`

### Start Frontend Development Server

```bash
cd frontend
pnpm run dev
```

The frontend will be available at `http://localhost:5173`

## Database Seeder

To populate the database with sample data:

```bash
cd backend
./venv/bin/python manage.py seed_apps
```

This will create 5 sample applications with random configurations.
