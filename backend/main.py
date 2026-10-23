from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
from datetime import datetime

app = FastAPI(title="EcoClima API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = "data.json"

class SensorData(BaseModel):
    room: str
    temperature: float
    humidity: float
    co2: int

class EmergencyData(BaseModel):
    room: str
    active: bool

def read_data():
    if not os.path.exists(DATA_FILE):
        return {}
    with open(DATA_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}

@app.post("/api/sensors")
async def receive_sensor_data(payload: SensorData):
    data = read_data()
    emergency_status = data.get(payload.room, {}).get("emergency", False)
    
    data[payload.room] = {
        "temperature": payload.temperature,
        "humidity": payload.humidity,
        "co2": payload.co2,
        "last_updated": datetime.now().strftime("%H:%M:%S"),
        "emergency": emergency_status
    }
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)
    return {"status": "success", "message": f"Datos guardados para {payload.room}"}

@app.post("/api/emergency")
async def trigger_emergency(payload: EmergencyData):
    data = read_data()
    if payload.room in data:
        data[payload.room]["emergency"] = payload.active
        with open(DATA_FILE, "w") as f:
            json.dump(data, f, indent=4)
        return {"status": "success", "emergency": payload.active}
    raise HTTPException(status_code=404, detail="Salón no encontrado")

@app.delete("/api/sensors/{room_name}")
async def delete_room(room_name: str):
    data = read_data()
    if room_name in data:
        del data[room_name]
        with open(DATA_FILE, "w") as f:
            json.dump(data, f, indent=4)
        return {"status": "success", "message": f"Salón {room_name} eliminado"}
    raise HTTPException(status_code=404, detail="Salón no encontrado")

@app.get("/api/sensors")
async def get_sensor_data():
    return read_data()