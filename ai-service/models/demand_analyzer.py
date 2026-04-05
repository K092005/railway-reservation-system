import numpy as np
from sklearn.ensemble import RandomForestClassifier
from datetime import datetime


class DemandAnalyzer:

    def __init__(self):
        self.model = RandomForestClassifier(
            n_estimators=80,
            max_depth=6,
            random_state=42
        )
        self._train_model()

    def _generate_training_data(self, n_samples=1500):
        np.random.seed(123)

        months = np.random.randint(1, 13, n_samples)
        day_of_week = np.random.randint(0, 7, n_samples)
        is_holiday = np.random.choice([0, 1], n_samples, p=[0.85, 0.15])
        days_before = np.random.randint(1, 90, n_samples)
        route_popularity = np.random.uniform(0.2, 1.0, n_samples)
        train_type = np.random.choice([0, 1, 2, 3], n_samples)

        labels = []
        for i in range(n_samples):
            score = 0
            if months[i] in [4, 5, 6, 10, 11, 12]:
                score += 2
            if day_of_week[i] >= 5:
                score += 1
            if is_holiday[i]:
                score += 3
            if days_before[i] < 5:
                score += 2
            elif days_before[i] < 15:
                score += 1
            score += route_popularity[i] * 3
            if train_type[i] in [2, 3]:
                score += 1

            score += np.random.normal(0, 0.8)
            if score >= 7:
                labels.append(2)
            elif score >= 4:
                labels.append(1)
            else:
                labels.append(0)

        X = np.column_stack([months, day_of_week, is_holiday, days_before, route_popularity, train_type])
        y = np.array(labels)
        return X, y

    def _train_model(self):
        X, y = self._generate_training_data()
        self.model.fit(X, y)

    def predict_demand(self, travel_date, route_popularity=0.6, train_type_code=0):
        if isinstance(travel_date, str):
            travel_date = datetime.strptime(travel_date, '%Y-%m-%d')

        month = travel_date.month
        day_of_week = travel_date.weekday()
        is_holiday = 1 if month in [1, 8, 10, 11, 12] and day_of_week >= 5 else 0
        days_before = max((travel_date - datetime.now()).days, 1)

        X = np.array([[month, day_of_week, is_holiday, days_before, route_popularity, train_type_code]])
        prediction = self.model.predict(X)[0]
        probabilities = self.model.predict_proba(X)[0]

        demand_labels = ['Low', 'Medium', 'High']
        return {
            'demand': demand_labels[prediction],
            'confidence': round(float(max(probabilities)) * 100, 1),
            'probabilities': {
                'low': round(float(probabilities[0]) * 100, 1),
                'medium': round(float(probabilities[1]) * 100, 1),
                'high': round(float(probabilities[2]) * 100, 1)
            }
        }
