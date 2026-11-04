FROM python:3.12-slim

WORKDIR /app

# Instala dependencias primero para aprovechar la caché de capas.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia el código de la aplicación.
COPY app ./app

# Usuario sin privilegios: el proceso no corre como root.
RUN useradd --system --no-create-home appuser
USER appuser

EXPOSE 8000

# Arranca la API con Uvicorn.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
