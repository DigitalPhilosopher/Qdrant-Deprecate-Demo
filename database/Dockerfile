FROM python:3.9-slim

WORKDIR /app

RUN pip install numpy qdrant-client pandas

COPY load_data.py .
COPY fake_sentences.csv .

CMD ["python", "load_data.py"]