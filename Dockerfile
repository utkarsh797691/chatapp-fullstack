# Stage 1: Build React
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

COPY chatapp-react-ui/package*.json ./

RUN npm ci

COPY chatapp-react-ui/ ./

RUN npm run build


# Stage 2: Django Backend
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app/backend

COPY chatapp-backend/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY chatapp-backend/ ./

# Copy React production build
COPY --from=frontend-builder \
    /app/frontend/dist \
    /app/backend/frontend_dist

# Start Django
CMD ["sh", "-c", "python manage.py collectstatic --noinput && python manage.py migrate --noinput && exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-10000} --workers 1 --threads 2 --timeout 120"]