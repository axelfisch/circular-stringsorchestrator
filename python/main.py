from fastapi import FastAPI
from app.routers import analyze_mscz

app = FastAPI(title="AiXEL API 2025 v2", version="2.0")
app.include_router(analyze_mscz.router)

@app.get("/")
async def root():
    return {"message": "Bienvenue dans AiXEL API 2025 v2", "status": "running"}
