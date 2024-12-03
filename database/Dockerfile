FROM python:3.9-slim

WORKDIR /app

RUN pip install numpy qdrant-client tensorflow tensorflow-hub

COPY load_data.py .

CMD ["python", "load_data.py"]