FROM python:3.11-slim

# Install ffmpeg for audio processing
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install dependencies (Using CPU-only PyTorch to save space and avoid CUDA bloat)
RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.txt

# Copy application code
COPY . .

# Ensure data directories exist (with appropriate permissions)
RUN mkdir -p data/audio data/transcripts data/chroma_db

# Port will be provided by Render via $PORT environment variable
EXPOSE 10000

# Start command
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000}"]
