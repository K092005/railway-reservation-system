import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from datetime import datetime, timedelta
import random


class FarePredictor:

    def __init__(self):
        self.model = GradientBoostingRegressor(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.1,
            random_state=42
        )
        self._train_model()

    def _generate_training_data(self, n_samples=2000):
        np.random.seed(42)

        distances = np.random.uniform(100, 2500, n_samples)
        class_map = {'SL': 0, '3A': 1, '2A': 2, '1A': 3, 'CC': 4, '2S': 5}
        classes = np.random.choice(list(class_map.values()), n_samples)
        months = np.random.randint(1, 13, n_samples)
        days_to_travel = np.random.randint(1, 90, n_samples)
        is_weekend = np.random.choice([0, 1], n_samples, p=[0.7, 0.3])
        is_holiday = np.random.choice([0, 1], n_samples, p=[0.85, 0.15])

        base_rates = {0: 1.00, 1: 1.80, 2: 2.50, 3: 4.00, 4: 2.00, 5: 0.60}

        fares = []
        for i in range(n_samples):
            base = distances[i] * base_rates[classes[i]]
            season_mult = 1.0
            if months[i] in [4, 5, 6, 10, 11, 12]:
                season_mult = 1.15 + np.random.uniform(0, 0.1)
            if is_holiday[i]:
                season_mult *= 1.25
            if is_weekend[i]:
                season_mult *= 1.08
            urgency_mult = 1.0
            if days_to_travel[i] < 3:
                urgency_mult = 1.3
            elif days_to_travel[i] < 7:
                urgency_mult = 1.15
            elif days_to_travel[i] > 60:
                urgency_mult = 0.95
            fare = base * season_mult * urgency_mult + np.random.normal(0, base * 0.05)
            fares.append(max(fare, distances[i] * 0.3))

        X = np.column_stack([distances, classes, months, days_to_travel, is_weekend, is_holiday])
        y = np.array(fares)
        return X, y

    def _train_model(self):
        X, y = self._generate_training_data()
        self.model.fit(X, y)

    def predict_fare(self, distance_km, class_type, travel_date):
        class_map = {'SL': 0, '3A': 1, '2A': 2, '1A': 3, 'CC': 4, '2S': 5, 'GN': 5}
        class_val = class_map.get(class_type, 0)

        if isinstance(travel_date, str):
            travel_date = datetime.strptime(travel_date, '%Y-%m-%d')

        month = travel_date.month
        days_to_travel = max((travel_date - datetime.now()).days, 1)
        is_weekend = 1 if travel_date.weekday() >= 5 else 0
        is_holiday = 1 if month in [1, 8, 10, 11, 12] and random.random() > 0.7 else 0

        X = np.array([[distance_km, class_val, month, days_to_travel, is_weekend, is_holiday]])
        fare = self.model.predict(X)[0]
        return round(max(fare, distance_km * 0.3), 2)
