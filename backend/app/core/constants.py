AQI_BREAKPOINTS = {
    "pm25": [
        (0.0, 12.0, 0, 50),
        (12.1, 35.4, 51, 100),
        (35.5, 55.4, 101, 150),
        (55.5, 150.4, 151, 200),
        (150.5, 250.4, 201, 300),
        (250.5, 500.4, 301, 500),
    ],
    "pm10": [
        (0, 54, 0, 50),
        (55, 154, 51, 100),
        (155, 254, 101, 150),
        (255, 354, 151, 200),
        (355, 424, 201, 300),
        (425, 604, 301, 500),
    ],
}

AQI_CATEGORIES = {
    (0, 50): {"label": "Good", "color": "#00e400", "health_implication": "Air quality is satisfactory."},
    (51, 100): {"label": "Moderate", "color": "#ffff00", "health_implication": "Acceptable air quality."},
    (101, 150): {"label": "Unhealthy for Sensitive Groups", "color": "#ff7e00", "health_implication": "Sensitive groups may experience health effects."},
    (151, 200): {"label": "Unhealthy", "color": "#ff0000", "health_implication": "Everyone may begin to experience health effects."},
    (201, 300): {"label": "Very Unhealthy", "color": "#8f3f97", "health_implication": "Health alert: everyone may experience serious effects."},
    (301, 500): {"label": "Hazardous", "color": "#7e0023", "health_implication": "Health warning of emergency conditions."},
}

POLLUTANT_NAMES = {
    "pm25": "PM2.5",
    "pm10": "PM10",
    "no2": "NO₂",
    "so2": "SO₂",
    "co": "CO",
    "o3": "O₃",
}

POLLUTANT_UNITS = {
    "pm25": "µg/m³",
    "pm10": "µg/m³",
    "no2": "ppb",
    "so2": "ppb",
    "co": "ppm",
    "o3": "ppb",
}
