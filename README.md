# PranaMap AI

AI-powered air quality management and forecasting platform with source attribution, enforcement prioritization, and multilingual health advisories.

## Features

- Real-time AQI monitoring and visualization
- 72-hour air quality forecasting using ML models
- Pollutant source attribution with explainable AI
- Priority-ranked enforcement recommendations
- Multilingual health advisories in English, Hindi, and Marathi
- Geospatial analysis with PostGIS integration

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, MapLibre GL
- **Backend**: FastAPI, Python, SQLAlchemy, PostGIS
- **ML**: XGBoost, LightGBM, SHAP, Scikit-learn
- **Agents**: LangGraph (multi-agent orchestration)
- **Database**: PostgreSQL with PostGIS
- **Deployment**: Docker, Vercel, Render

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/PranaMap-AI.git
cd PranaMap-AI

# Copy environment variables
cp .env.example .env

# Start with Docker Compose
docker-compose up -d

# Or run manually
cd backend && pip install -r requirements.txt && uvicorn app.main:app
cd frontend && npm install && npm run dev
```

## Documentation

- [Architecture](docs/Architecture.md)
- [API Documentation](docs/API_Documentation.md)
- [Database Schema](docs/Database_Schema.md)
- [ML Pipeline](docs/ML_Pipeline.md)
- [Agent Flow](docs/Agent_Flow.md)
- [Deployment Guide](docs/Deployment.md)

## License

MIT
