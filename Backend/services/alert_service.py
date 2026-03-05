from typing import Dict, Any

class AlertService:
    """
    Evaluates raw metrics against predefined thresholds and generates simple actionable advice.
    """
    
    THRESHOLDS = {
        'moisture': {'min': 30, 'max': 80}, # %
        'ph': {'min': 6.0, 'max': 7.5},
        'nitrogen': {'min': 70, 'max': 200} # kg/ha
    }
    
    def evaluate_field(self, field_data: Dict[str, Any]) -> str:
        """
        Returns simple, human-readable advice based on sensor values.
        """
        moisture = field_data.get('moisture')
        ph = field_data.get('ph')
        nitrogen = field_data.get('nitrogen')
        
        advice = []
        
        if moisture is not None:
            if moisture < self.THRESHOLDS['moisture']['min']:
                advice.append(f"Very low moisture ({moisture}%). Irrigate immediately.")
            elif moisture > self.THRESHOLDS['moisture']['max']:
                advice.append(f"High moisture ({moisture}%). Ensure proper drainage.")
                
        if ph is not None:
            if ph < self.THRESHOLDS['ph']['min']:
                advice.append(f"Soil is acidic (pH {ph}). Apply lime.")
            elif ph > self.THRESHOLDS['ph']['max']:
                advice.append(f"Soil is alkaline (pH {ph}). Apply sulfur or organic matter.")
                
        if nitrogen is not None:
            if nitrogen < self.THRESHOLDS['nitrogen']['min']:
                advice.append(f"Low nitrogen ({nitrogen} kg/ha). Apply urea fertilzer soon.")
                
        if not advice:
            return "Crop looks healthy. No action needed this week."
            
        return " ".join(advice)
        
alert_service = AlertService()
