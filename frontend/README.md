# Vector Search Frontend

A React-based frontend application for vector similarity search using Qdrant.

## Overview

This application provides a user interface for performing vector similarity searches against a Qdrant database. It includes features like:
- Real-time search functionality
- Result downvoting/deprecation

## Tech Stack

- React 18
- Tailwind CSS
- Radix UI Components
- Qdrant JS Client

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Installation

Start the development server:

```bash
docker-compose up --build
```

## Environment Variables

The application uses the following environment variables:

- `REACT_APP_QDRANT_URL`: Qdrant server URL (default: http://localhost)
- `REACT_APP_QDRANT_PORT`: Qdrant server port (default: 6333)

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/          # Reusable UI components
│   │   └── SearchInterface.jsx
│   ├── lib/
│   │   └── utils.js     # Utility functions
│   ├── App.js
│   └── index.js
├── public/
└── package.json
```

## Features

### Search Interface
- Real-time vector similarity search
- Deprecation of search results
- Confirmation dialogs

## Related Services

This frontend works in conjunction with:
- Qdrant vector database
- Data loader service

For more information about the database setup, see the [database README](../database/README.md).
