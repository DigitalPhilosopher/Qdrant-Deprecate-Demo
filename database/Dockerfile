FROM python:3.9-slim

WORKDIR /app

RUN pip install numpy qdrant-client

COPY load_data.py .

CMD ["python", "load_data.py"]