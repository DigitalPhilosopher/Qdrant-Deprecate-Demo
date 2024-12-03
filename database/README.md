# Database Setup and Data Loading

This directory contains the database initialization and data loading scripts for the vector search application.

## Overview

The data loader is a Python script that initializes a Qdrant vector database collection and populates it with test data. It's designed to run as a Docker container and automatically loads sample data when the application starts.

## Configuration

The data loader uses the following configuration:
- Collection Name: `test_collection`
- Vector Size: 128 dimensions
- Distance Metric: Cosine similarity
- Sample Size: 5 points

## Data Structure

Each point in the collection contains:
- A 128-dimensional vector
- Payload with the following fields:
  - `deprecated`: Boolean flag for deprecated items
  - `deprecated_at`: Timestamp when item was deprecated
  - `text`: Sample text content
  - `category`: Category label (A, B, or C)
  - `value`: Random integer value (1-100)

## Setup

The data loader is automatically started through Docker Compose. It depends on the Qdrant service being healthy before starting.

### Prerequisites
- Python 3.9+
- Required Python packages:
  - numpy
  - qdrant-client

### Docker Setup

The data loader is containerized using Docker. The Dockerfile includes:
- Python 3.9-slim base image
- Installation of required packages
- Automatic execution of the data loading script

## Usage

The data loader will automatically:
1. Connect to the Qdrant instance
2. Create/recreate the test collection
3. Generate and upload test data points
4. Verify the upload by checking collection info

No manual intervention is required as this process is automated through Docker Compose.

## Integration

This database setup integrates with:
- Frontend search interface (React)
- Qdrant vector database
- Docker Compose orchestration

For local development, the services can be started using:

```bash
docker-compose up --build -d
```

## Related Files

- `load_data.py`: Main data loading script
- `Dockerfile`: Container configuration
- Docker Compose configuration in root directory

## Environment

The database service is configured to run in a Docker container and connects to:
- Host: qdrant
- Port: 6333

## Health Checks

The Qdrant service includes health checks to ensure the database is ready before the data loader begins operation.
