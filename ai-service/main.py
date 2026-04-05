from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.fare_predictor import FarePredictor
from models.demand_analyzer import DemandAnalyzer
from utils.db import execute_query
import os

app = FastAPI(
    title="Railway Reservation AI/ML Service",
    description="Fare prediction and demand analysis using Machine Learning",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

fare_predictor = FarePredictor()
demand_analyzer = DemandAnalyzer()


@app.get("/api/ml/health")
async def health():
    return {"status": "ok", "service": "Railway AI/ML Service"}


@app.get("/api/ml/fare-predict")
async def predict_fare(
    source: str = Query(..., description="Source station code"),
    destination: str = Query(..., description="Destination station code"),
    class_type: str = Query("SL", description="Travel class"),
    date: str = Query(..., description="Travel date YYYY-MM-DD")
):
    try:
        rows = execute_query("""
            SELECT
                (dest_r.distance_km - src_r.distance_km) AS distance_km
            FROM train_routes src_r
            INNER JOIN stations src_s ON src_r.station_id = src_s.id
            INNER JOIN train_routes dest_r ON src_r.train_id = dest_r.train_id
            INNER JOIN stations dest_s ON dest_r.station_id = dest_s.id
            WHERE src_s.code = %s AND dest_s.code = %s
              AND src_r.stop_order < dest_r.stop_order
            LIMIT 1
        """, (source.upper(), destination.upper()))

        if not rows:
            raise HTTPException(status_code=404, detail="Route not found between given stations")

        distance = rows[0]['distance_km']
        predicted_fare = fare_predictor.predict_fare(distance, class_type, date)

        base_rate = {'SL': 1.0, '3A': 1.8, '2A': 2.5, '1A': 4.0, 'CC': 2.0, '2S': 0.6, 'GN': 0.4}
        base_fare = round(distance * base_rate.get(class_type, 1.0), 2)

        return {
            "source": source.upper(),
            "destination": destination.upper(),
            "class_type": class_type,
            "date": date,
            "distance_km": distance,
            "base_fare": base_fare,
            "predicted_fare": predicted_fare,
            "fare_difference": round(predicted_fare - base_fare, 2),
            "model": "GradientBoostingRegressor"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/ml/demand")
async def predict_demand(
    date: str = Query(..., description="Travel date YYYY-MM-DD"),
    route_popularity: float = Query(0.6, description="Route popularity 0-1"),
    train_type: int = Query(0, description="0=Express,1=Superfast,2=Rajdhani,3=Shatabdi")
):
    try:
        result = demand_analyzer.predict_demand(date, route_popularity, train_type)
        return {
            "date": date,
            "prediction": result,
            "model": "RandomForestClassifier"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/ml/recommend")
async def recommend_routes(
    user_id: int = Query(..., description="User ID")
):
    try:
        bookings = execute_query("""
            SELECT
                src.code AS source, dest.code AS destination,
                t.train_type, b.class_type, COUNT(*) AS trip_count
            FROM bookings b
            INNER JOIN schedules s ON b.schedule_id = s.id
            INNER JOIN trains t ON s.train_id = t.id
            INNER JOIN stations src ON b.source_station_id = src.id
            INNER JOIN stations dest ON b.dest_station_id = dest.id
            WHERE b.user_id = %s AND b.status = 'Confirmed'
            GROUP BY src.code, dest.code, t.train_type, b.class_type
            ORDER BY trip_count DESC
            LIMIT 5
        """, (user_id,))

        popular_routes = execute_query("""
            SELECT
                src.code AS source, src.name AS source_name,
                dest.code AS destination, dest.name AS dest_name,
                COUNT(*) AS popularity
            FROM bookings b
            INNER JOIN stations src ON b.source_station_id = src.id
            INNER JOIN stations dest ON b.dest_station_id = dest.id
            WHERE b.status = 'Confirmed'
            GROUP BY src.code, src.name, dest.code, dest.name
            ORDER BY popularity DESC
            LIMIT 5
        """)

        return {
            "user_id": user_id,
            "past_routes": bookings,
            "recommended_routes": popular_routes,
            "model": "Collaborative Filtering (Popularity-Based)"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
