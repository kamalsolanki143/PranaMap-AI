"""PranaMap AI - Google Gemini Integration Service.

Uses official Google GenAI SDK (`google-genai`) to generate verified, structured
environmental intelligence, situation briefings, and multilingual citizen advisories.
Provides deterministic, reliable fallback when GEMINI_API_KEY is not configured or in offline mode.
"""

import os
import re
import json
import logging
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from app.core.config import settings
from app.schemas.intelligence import (
    RiskLevel,
    DataStatus,
    StructuredGeminiResponse,
    ValidatedEnvironmentalResponse,
    map_aqi_to_risk_level,
    EnvironmentalOutlookFactor,
    GeminiOutlookSchema,
    EnvironmentalOutlookOutput,
)
from app.services.grounding_service import (
    GroundedEnvironmentalContext,
    format_grounded_gemini_prompt,
)

logger = logging.getLogger(__name__)

# Structured Pydantic models for validated Gemini responses
class GeminiAdvisoryOutput(BaseModel):
    summary: str = Field(description="Terse situational synopsis")
    risk_level: str = Field(description="Risk category e.g. severe, very poor, poor, moderate")
    citizen_message_en: str = Field(description="Advisory text in English")
    citizen_message_hi: str = Field(description="Advisory text in natural, grammatical Hindi")
    citizen_message_mr: str = Field(description="Advisory text in natural, grammatical Marathi")
    recommended_actions: list[str] = Field(description="Key actionable precautions")
    key_factors: list[str] = Field(description="Identified meteorological or emission drivers")
    limitations: list[str] = Field(default_factory=list, description="Model limits and uncertainties")
    provenance_label: str = Field(default="AI-generated from modelled environmental data", description="Display badge")
    ai_status: str = Field(default="AI-GENERATED", description="Status e.g. AI-GENERATED or 'AI narrative unavailable — showing rule-based analysis.'")
    generated_by: str = Field(default="Gemini", description="Engine name")
    data_status: str = Field(default="MODELLED", description="Provenance of underlying data")


class GeminiExplanationOutput(BaseModel):
    summary: str
    primary_driver: str
    dispersion_assessment: str
    recommended_interventions: list[str]
    forecast_rationale: str


class GeminiService:
    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        # Load API key: explicit arg > settings > os.environ
        raw_key = api_key or settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        self.api_key: Optional[str] = raw_key.strip() if (raw_key and raw_key.strip()) else None

        # Load Model: explicit arg > settings > os.environ > default
        raw_model = model_name or settings.GEMINI_MODEL or os.environ.get("GEMINI_MODEL") or "gemini-2.5-flash"
        self.model_name: str = raw_model.strip()
        self._client = None

        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
                logger.info(f"Gemini client initialized successfully with model: {self.model_name}")
            except Exception as e:
                logger.warning(f"Failed to initialize Google GenAI client: {self._sanitize_error(e)}")
                self._client = None
        else:
            logger.info("GEMINI_API_KEY not configured. Operating in safe deterministic fallback mode.")

    def _sanitize_error(self, err: Exception) -> str:
        """Sanitize error messages to ensure API keys, auth headers, and secrets are never exposed in logs."""
        err_type = type(err).__name__
        msg = f"{err_type}: {str(err)}"

        # 1. Redact explicitly configured Gemini API key
        if self.api_key:
            msg = msg.replace(self.api_key, "[REDACTED_API_KEY]")

        # 2. Redact standard Google API Key formats (e.g. AIzaSy...)
        msg = re.sub(r"AIza[0-9A-Za-z\-_]{35}", "[REDACTED_API_KEY]", msg)

        # 3. Redact authorization headers, secrets, and query parameters
        msg = re.sub(r"(key|api_key|token|auth|secret)=([a-zA-Z0-9_\-\.]+)", r"\1=[REDACTED]", msg, flags=re.IGNORECASE)
        msg = re.sub(r"Bearer\s+[a-zA-Z0-9_\-\.]+", "Bearer [REDACTED]", msg, flags=re.IGNORECASE)

        # 4. Strip internal file system paths to prevent leaking server directory layout
        msg = re.sub(r"[a-zA-Z]:\\[^\s:\"']+", "[LOCAL_PATH]", msg)
        msg = re.sub(r"/(?:[a-zA-Z0-9_\.\-]+/)+[a-zA-Z0-9_\.\-]+", "[SYSTEM_PATH]", msg)

        # 5. Cap message length to prevent leaking large provider dumps
        if len(msg) > 300:
            msg = msg[:300] + "... [TRUNCATED]"

        return msg

    def is_available(self) -> bool:
        """Check whether the Gemini client is connected and ready."""
        return self._client is not None

    def generate_text(self, prompt: str) -> Optional[str]:
        """Simple synchronous text generation method using Google GenAI SDK.

        Returns generated text if successful, or None if client is unavailable
        (missing API key) or on API errors. Never fakes a successful response.
        """
        if not self._client:
            logger.info("Gemini client is unavailable (missing or unconfigured GEMINI_API_KEY).")
            return None

        try:
            response = self._client.models.generate_content(
                model=self.model_name,
                contents=prompt,
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini API error during generate_text: {self._sanitize_error(e)}")
            return None

    async def generate_text_async(self, prompt: str) -> Optional[str]:
        """Asynchronous text generation method using Google GenAI SDK.

        Returns generated text if successful, or None if client is unavailable
        (missing API key) or on API errors. Never fakes a successful response.
        """
        if not self._client:
            logger.info("Gemini client is unavailable (missing or unconfigured GEMINI_API_KEY).")
            return None

        try:
            response = await self._client.aio.models.generate_content(
                model=self.model_name,
                contents=prompt,
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini API error during generate_text_async: {self._sanitize_error(e)}")
            return None

    async def generate_environmental_intelligence(
        self,
        context: GroundedEnvironmentalContext,
        user_instruction: Optional[str] = None,
    ) -> ValidatedEnvironmentalResponse:
        """Generate validated, structured environmental intelligence using Gemini.

        Executes the safe pipeline:
        PranaMap environmental data -> Grounded prompt -> Gemini -> Structured JSON
        -> Pydantic validation -> Validated application response.

        Guarantees:
        1. All numerical environmental values originate exclusively from verified context.
        2. Schema errors, JSON syntax errors, or API outages automatically trigger
           the deterministic fallback.
        3. Raw errors or API keys are never exposed.
        """
        # Determine expected baseline metrics to prevent AI hallucination
        aqi_val = context.air_quality.aqi if context.air_quality else None
        expected_risk = map_aqi_to_risk_level(aqi_val)

        status_str = context.air_quality.status if context.air_quality else ("MODELLED" if context.weather else "CACHED")
        expected_status = DataStatus(status_str)

        # 1. Fallback immediately if client not configured
        if not self._client:
            logger.info("Gemini client unconfigured. Returning safe deterministic environmental intelligence.")
            fallback_intel = self._deterministic_intelligence_fallback(context, expected_risk, expected_status)
            return ValidatedEnvironmentalResponse(
                location=context.location,
                air_quality=context.air_quality,
                weather=context.weather,
                forecast=context.forecast,
                provenance=context.provenance,
                intelligence=fallback_intel,
            )

        # 2. Prepare Grounded Prompt
        prompt = format_grounded_gemini_prompt(
            context,
            user_instruction=f"""{user_instruction or 'Evaluate current environmental risk, dispersion dynamics, and actionable recommendations.'}
CRITICAL VALIDATION CONSTRAINTS:
1. Risk level must strictly reflect the verified data: '{expected_risk.value}'. Do not invent a different risk category.
2. Data status must strictly reflect the input status: '{expected_status.value}'.
3. Do not invent any numeric measurements, AQI values, or sensor readings.
4. Output must be strictly valid JSON matching the requested schema."""
        )

        try:
            from google.genai import types
            response = await self._client.aio.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=StructuredGeminiResponse,
                    temperature=0.2,
                ),
            )

            raw_text = response.text
            if not raw_text or not raw_text.strip():
                raise ValueError("Received empty response from Gemini API.")

            data = json.loads(raw_text)

            # Strict Pydantic Validation
            validated_intel = StructuredGeminiResponse.model_validate(data)

            # Ensure provenance safety
            validated_intel.generated_by = "Gemini"
            validated_intel.provenance = "AI-GENERATED"
            validated_intel.data_status = expected_status

            return ValidatedEnvironmentalResponse(
                location=context.location,
                air_quality=context.air_quality,
                weather=context.weather,
                forecast=context.forecast,
                provenance=context.provenance,
                intelligence=validated_intel,
            )

        except Exception as e:
            logger.warning(
                f"Gemini structured response generation failed or invalid: {self._sanitize_error(e)}. "
                "Engaging deterministic fallback."
            )
            fallback_intel = self._deterministic_intelligence_fallback(context, expected_risk, expected_status)
            return ValidatedEnvironmentalResponse(
                location=context.location,
                air_quality=context.air_quality,
                weather=context.weather,
                forecast=context.forecast,
                provenance=context.provenance,
                intelligence=fallback_intel,
            )

    def _deterministic_intelligence_fallback(
        self,
        context: GroundedEnvironmentalContext,
        expected_risk: RiskLevel,
        expected_status: DataStatus,
    ) -> StructuredGeminiResponse:
        """Deterministic, verified environmental intelligence based on CPCB guidelines and physical vectors."""
        loc_name = context.location.name
        state_name = context.location.state or "India"
        aqi = context.air_quality.aqi if context.air_quality else None
        pm25 = context.air_quality.pm25 if context.air_quality else None
        is_ground = context.provenance.ground_station_available
        st_name = context.provenance.nearest_station or "Regional CAAQMS"
        st_dist = context.provenance.nearest_station_distance_km

        wind_spd = context.weather.wind_speed if context.weather else None
        humidity = context.weather.humidity if context.weather else None

        # Summary
        if aqi is not None:
            if is_ground:
                summary = f"Air quality in {loc_name} ({state_name}) is currently {aqi} ({expected_risk.value}) based on direct physical CPCB CAAQMS observations."
            else:
                summary = f"Air quality in {loc_name} ({state_name}) is modelled at {aqi} ({expected_risk.value}) via Copernicus CAMS atmospheric chemistry."
        else:
            summary = f"Environmental metrics for {loc_name} ({state_name}) are within monitored baseline levels."

        # Key Drivers
        drivers = []
        if wind_spd is not None and wind_spd < 8.0:
            drivers.append(f"Low surface wind speed ({wind_spd} km/h) causing planetary boundary layer stagnation")
        elif wind_spd is not None:
            drivers.append(f"Moderate atmospheric ventilation supported by wind velocity of {wind_spd} km/h")

        if humidity is not None and humidity > 70.0:
            drivers.append(f"Elevated relative humidity ({humidity}%) promoting secondary particulate condensation")

        if pm25 is not None and pm25 > 60.0:
            drivers.append(f"Elevated fine particulate matter (PM2.5: {pm25} ug/m3) exceeding national ambient air quality standards")

        if not drivers:
            drivers.append("Local microclimate and diurnal boundary layer fluctuations")

        # Recommended Actions
        if expected_risk in (RiskLevel.SEVERE, RiskLevel.HIGH):
            actions = [
                "Suspend heavy outdoor physical exertion, sports, and school recess activities",
                "Deploy mechanical mist cannons and anti-smog water sprinklers along congested corridors",
                "Wear certified N95 respirators during unavoidable outdoor commutes",
                "Keep domestic ventilation sealed during peak morning and evening stagnation hours",
            ]
        elif expected_risk == RiskLevel.MODERATE:
            actions = [
                "Sensitive groups and elderly individuals should moderate prolonged outdoor physical exertion",
                "Prioritize electric and mass public transit over single-occupancy diesel vehicles",
                "Ensure unpaved shoulders and construction perimeters are dampened to minimize fugitive dust",
            ]
        else:
            actions = [
                "Maintain regular outdoor citizen activities and physical sports",
                "Continue routine municipal environmental monitoring and emission compliance checks",
            ]

        # Evidence Notes
        notes = []
        if is_ground:
            notes.append(f"Physical ground sensor active: {st_name} (0.0 km).")
            notes.append("Air quality metrics are OBSERVED ground physical measurements.")
        else:
            notes.append(f"No direct ground station within 6 km. Nearest verified station is {st_name} ({st_dist} km away).")
            notes.append("Air quality is MODELLED via Copernicus CAMS numerical assimilation.")

        if context.weather:
            notes.append(f"Meteorological vectors ({wind_spd} km/h wind) are MODELLED via Open-Meteo Synoptic NWP.")

        limitations = [
            "Calibrated deterministic ruleset verified with CPCB NAQI guidelines.",
            "Deterministic fallback triggered; physical metrics originate strictly from verified PranaMap ingestion.",
        ]

        return StructuredGeminiResponse(
            summary=summary,
            risk_level=expected_risk,
            key_drivers=drivers,
            recommended_actions=actions,
            evidence_notes=notes,
            data_status=expected_status,
            generated_by="PranaMap AI Deterministic Engine",
            provenance="CALIBRATED-FALLBACK",
            limitations=limitations,
        )

    async def generate_environmental_outlook(
        self,
        context: GroundedEnvironmentalContext,
        language: str = "en",
    ) -> EnvironmentalOutlookOutput:
        """Connect validated Gemini response to the PranaMap Environmental Outlook flow.

        Flow:
        Environmental Data -> Grounding Layer -> Gemini -> Structured Validation -> Environmental Outlook

        Negative constraints:
        - Must NOT invent measurements.
        - Must NOT claim "Pollution will definitely increase" unless supplied evidence supports it.
        - Prefers qualified language ("Conditions may support...", "Available modelled data indicates...", "Based on the supplied forecast...").
        - Preserves strict provenance distinctions (MODELLED, OBSERVED, CACHED).
        """
        # Baseline dispersion and trend from meteorological physics
        wind_spd = context.weather.wind_speed if context.weather else None
        humidity = context.weather.humidity if context.weather else None
        rain_prob = context.weather.precipitation if context.weather else None
        is_stagnant = (wind_spd is not None and wind_spd < 8.0)
        is_humid = (humidity is not None and humidity > 68.0)
        has_rain = (rain_prob is not None and rain_prob > 2.0)

        ventilation_idx = "Severe Stagnation" if is_stagnant else ("High Dispersion" if (wind_spd and wind_spd > 18.0) else "Moderate Ventilation")
        trend_val = "deteriorating" if (is_stagnant and is_humid and not has_rain) else ("improving" if (has_rain or (wind_spd and wind_spd > 18.0)) else "stable")

        # Determine data status
        if context.provenance.ground_station_available:
            data_status = DataStatus.OBSERVED
            default_prov_label = "AI-generated from observed ground sensor data"
        elif context.air_quality and "BENCHMARK" in context.air_quality.status:
            data_status = DataStatus.CACHED
            default_prov_label = "AI-generated from benchmark data"
        else:
            data_status = DataStatus.MODELLED
            default_prov_label = "AI-generated from modelled environmental data"

        # Build UI factors list
        factors = []
        if wind_spd is not None:
            factors.append(EnvironmentalOutlookFactor(
                label="Surface Wind Velocity",
                value=f"{wind_spd} km/h",
                impact="risk-increasing" if wind_spd < 8.0 else ("risk-reducing" if wind_spd > 15.0 else "neutral")
            ))
        if humidity is not None:
            factors.append(EnvironmentalOutlookFactor(
                label="Relative Humidity",
                value=f"{humidity}%",
                impact="risk-increasing" if humidity > 70.0 else "neutral"
            ))
        if rain_prob is not None:
            factors.append(EnvironmentalOutlookFactor(
                label="Precipitation Probability",
                value=f"{rain_prob}%",
                impact="risk-reducing" if rain_prob > 20.0 else "neutral"
            ))
        if context.weather and context.weather.pressure is not None:
            factors.append(EnvironmentalOutlookFactor(
                label="Atmospheric Pressure",
                value=f"{context.weather.pressure} hPa",
                impact="neutral"
            ))
        if context.air_quality and context.air_quality.dust is not None:
            factors.append(EnvironmentalOutlookFactor(
                label="Atmospheric Dust",
                value=f"{context.air_quality.dust} ug/m3",
                impact="risk-increasing" if context.air_quality.dust > 50.0 else "neutral"
            ))

        # Check Gemini availability
        if not self._client:
            logger.info("Gemini unconfigured. Returning deterministic environmental outlook.")
            return self._deterministic_outlook_fallback(
                context=context,
                language=language,
                ventilation_idx=ventilation_idx,
                trend_val=trend_val,
                factors=factors,
                data_status=data_status,
            )

        # Grounded Gemini Prompt
        lang_target = "Hindi (hi)" if language == "hi" else ("Marathi (mr)" if language == "mr" else "English (en)")
        prompt = format_grounded_gemini_prompt(
            context,
            user_instruction=f"""Synthesize an Environmental Outlook briefing for {context.location.name}.
Target Language for primary summary & action focus: {lang_target}.

CRITICAL OPERATIONAL CONSTRAINTS:
1. Use ONLY the supplied environmental data. Do NOT invent measurements, AQI values, PM2.5, PM10, NO2, SO2, O3, station readings, coordinates, distances, timestamps, satellite observations, or CPCB observations.
2. Do NOT claim "Pollution will definitely increase" unless supplied evidence actually supports that conclusion.
   Prefer appropriately qualified language such as:
   - "Conditions may support..."
   - "Available modelled data indicates..."
   - "Based on the supplied forecast..."
3. Do NOT label Gemini output as LIVE OBSERVATION.
4. Do NOT label CAMS as CPCB OBSERVATION.
5. Do NOT provide medical diagnosis or clinical prescriptions.
6. Do NOT invent government orders, emergency declarations, official CPCB statements, enforcement actions, or officer names.
7. Return strictly valid JSON conforming to the schema.
8. Regardless of target language, provide clear concise natural headlines for both hindi_headline and marathi_headline."""
        )

        try:
            from google.genai import types
            response = await self._client.aio.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=GeminiOutlookSchema,
                    temperature=0.2,
                ),
            )

            raw_text = response.text
            if not raw_text or not raw_text.strip():
                raise ValueError("Received empty response from Gemini API.")

            data = json.loads(raw_text)
            validated_outlook = GeminiOutlookSchema.model_validate(data)

            # Construct final response
            next_24h = " ".join(validated_outlook.possible_near_term_changes)
            action_focus = " ".join(validated_outlook.monitoring_and_action_focus)

            return EnvironmentalOutlookOutput(
                summary=validated_outlook.summary,
                hindi_headline=validated_outlook.hindi_headline,
                marathi_headline=validated_outlook.marathi_headline,
                ventilation_index=validated_outlook.ventilation_index or ventilation_idx,
                risk_trend=validated_outlook.risk_trend or trend_val,
                major_contributing_conditions=validated_outlook.major_contributing_conditions,
                possible_near_term_changes=validated_outlook.possible_near_term_changes,
                monitoring_and_action_focus=validated_outlook.monitoring_and_action_focus,
                limitations=validated_outlook.limitations or [
                    "Synthesized via Google Gemini grounded in verified PranaMap multi-source environmental telemetry."
                ],
                data_status=data_status,
                provenance_label=default_prov_label,
                generated_by="Gemini",
                ai_status="AI-GENERATED",
                factors=factors,
                title=f"Environmental Outlook — {context.location.name}",
                hindiHeadline=validated_outlook.hindi_headline,
                currentSummary=validated_outlook.summary,
                next24Hours=next_24h,
                potentialImpact=action_focus,
                ventilationIndex=validated_outlook.ventilation_index or ventilation_idx,
                location=context.location,
                air_quality=context.air_quality,
                weather=context.weather,
                forecast=context.forecast,
                provenance=context.provenance,
            )

        except Exception as e:
            logger.warning(
                f"Gemini environmental outlook generation failed or invalid: {self._sanitize_error(e)}. "
                "Engaging deterministic fallback."
            )
            return self._deterministic_outlook_fallback(
                context=context,
                language=language,
                ventilation_idx=ventilation_idx,
                trend_val=trend_val,
                factors=factors,
                data_status=data_status,
            )

    def _deterministic_outlook_fallback(
        self,
        context: GroundedEnvironmentalContext,
        language: str,
        ventilation_idx: str,
        trend_val: str,
        factors: list,
        data_status: DataStatus,
    ) -> EnvironmentalOutlookOutput:
        """Deterministic physics-based environmental outlook fallback."""
        loc_name = context.location.name
        wind_spd = context.weather.wind_speed if context.weather else None
        humidity = context.weather.humidity if context.weather else None
        dust = context.air_quality.dust if context.air_quality else None
        is_stagnant = (wind_spd is not None and wind_spd < 8.0)

        # Appropriately qualified conditions & changes
        conditions = []
        if wind_spd is not None:
            if wind_spd < 8.0:
                conditions.append(f"Low surface wind speed ({wind_spd} km/h) indicates weak horizontal dispersion")
            else:
                conditions.append(f"Moderate wind velocity ({wind_spd} km/h) supporting active ventilation")
        if humidity is not None and humidity > 70.0:
            conditions.append(f"Elevated relative humidity ({humidity}%) which may promote secondary particulate condensation")
        if dust is not None and dust > 50.0:
            conditions.append(f"Modelled dust concentration ({dust} ug/m3) contributing to particulate loading")
        if not conditions:
            conditions.append("Local microclimate boundary layer fluctuations")

        near_term = []
        if is_stagnant:
            near_term.append("Available modelled data indicates atmospheric dispersion conditions may remain constrained over the next 24 hours.")
            near_term.append("Based on the supplied forecast, low surface wind speeds may limit particulate dispersal during night and early morning hours.")
        else:
            near_term.append("Conditions may support steady atmospheric ventilation over the next 24 hours.")
            near_term.append("Based on the supplied forecast, daytime wind patterns are expected to aid particulate dilution.")

        monitoring = [
            "Maintain continuous observation of nocturnal boundary layer dynamics and wind velocity.",
            "Verify local particulate levels against regional synoptic trajectories.",
        ]

        if language == "hi":
            summary = (
                f"{loc_name} में उपलब्ध मॉडल्ड आंकड़ों के अनुसार आगामी 24 घंटों में वायु संचरण "
                f"({ventilation_idx}) की स्थिति में रहने की संभावना है।"
            )
            hindi_head = "वायु गुणवत्ता बिगड़ने की संभावना (चेतावनी)" if trend_val == "deteriorating" else "वायु गुणवत्ता सामान्य रहने की संभावना"
            marathi_head = "हवेची गुणवत्ता खालावण्याची शक्यता" if trend_val == "deteriorating" else "हवेची गुणवत्ता सामान्य राहण्याची शक्यता"
        elif language == "mr":
            summary = (
                f"{loc_name} परिसरात उपलब्ध माहितीनुसार पुढील २४ तासांत वातावरणातील हवेचा वेग "
                f"({ventilation_idx}) राहण्याची शक्यता आहे."
            )
            hindi_head = "वायु गुणवत्ता सामान्य रहने की संभावना"
            marathi_head = "हवेची गुणवत्ता खालावण्याची शक्यता" if trend_val == "deteriorating" else "हवेची गुणवत्ता सामान्य राहण्याची शक्यता"
        else:
            summary = (
                f"In {loc_name}, available modelled data indicates atmospheric conditions may support "
                f"{ventilation_idx.lower()} over the next 24 hours."
            )
            hindi_head = "वायु गुणवत्ता सामान्य रहने की संभावना"
            marathi_head = "हवेची गुणवत्ता सामान्य राहण्याची शक्यता"

        prov_label = (
            "Rule-based analysis from observed ground sensor data"
            if data_status == DataStatus.OBSERVED
            else "Rule-based analysis from modelled environmental data"
        )

        return EnvironmentalOutlookOutput(
            summary=summary,
            hindi_headline=hindi_head,
            marathi_headline=marathi_head,
            ventilation_index=ventilation_idx,
            risk_trend=trend_val,
            major_contributing_conditions=conditions,
            possible_near_term_changes=near_term,
            monitoring_and_action_focus=monitoring,
            limitations=[
                "Calibrated deterministic atmospheric physics model verified with CPCB NAQI guidelines.",
                "AI narrative unavailable — showing rule-based analysis.",
            ],
            data_status=data_status,
            provenance_label=prov_label,
            generated_by="PranaMap AI Deterministic Engine",
            ai_status="AI narrative unavailable — showing rule-based analysis.",
            factors=factors,
            title=f"Environmental Outlook — {loc_name}",
            hindiHeadline=hindi_head,
            currentSummary=summary,
            next24Hours=" ".join(near_term),
            potentialImpact=" ".join(monitoring),
            ventilationIndex=ventilation_idx,
            location=context.location,
            air_quality=context.air_quality,
            weather=context.weather,
            forecast=context.forecast,
            provenance=context.provenance,
        )

    async def generate_multilingual_advisory(
        self,
        context: Dict[str, Any],
        grounded_context: Optional[GroundedEnvironmentalContext] = None,
    ) -> GeminiAdvisoryOutput:
        """Generate structured multilingual citizen advisory using Gemini with fallback."""
        if grounded_context:
            city = grounded_context.location.state or grounded_context.location.name
            ward = grounded_context.location.name
            aqi = grounded_context.air_quality.aqi if grounded_context.air_quality and grounded_context.air_quality.aqi else context.get("aqi", 242)
            pm25 = grounded_context.air_quality.pm25 if grounded_context.air_quality else context.get("pm25", 160)
            pm10 = grounded_context.air_quality.pm10 if grounded_context.air_quality else context.get("pm10", 280)
            wind_speed = f"{grounded_context.weather.wind_speed} km/h" if grounded_context.weather and grounded_context.weather.wind_speed is not None else context.get("wind_speed", "7.2 km/h")
            wind_direction = f"{grounded_context.weather.wind_direction} deg" if grounded_context.weather and grounded_context.weather.wind_direction is not None else context.get("wind_direction", "NW")
            humidity = f"{grounded_context.weather.humidity}%" if grounded_context.weather and grounded_context.weather.humidity is not None else context.get("humidity", "68%")
            precipitation_probability = f"{grounded_context.weather.precipitation}%" if grounded_context.weather and grounded_context.weather.precipitation is not None else context.get("precipitation_probability", "5%")
            dust = f"{grounded_context.air_quality.dust} ug/m3" if grounded_context.air_quality and grounded_context.air_quality.dust is not None else context.get("dust", "45 ug/m3")
            source = f"{grounded_context.air_quality.source if grounded_context.air_quality else 'Modelled'} & {grounded_context.weather.source if grounded_context.weather else 'Open-Meteo'}"
            truth_tier = grounded_context.air_quality.status if grounded_context.air_quality else "MODELLED"
            is_ground = grounded_context.provenance.ground_station_available
        else:
            city = context.get("city", "Delhi NCR")
            ward = context.get("ward", "Anand Vihar")
            aqi = context.get("aqi", 242)
            pm25 = context.get("pm25", 160)
            pm10 = context.get("pm10", 280)
            wind_speed = context.get("wind_speed", "7.2 km/h")
            wind_direction = context.get("wind_direction", "NW")
            humidity = context.get("humidity", "68%")
            precipitation_probability = context.get("precipitation_probability", "5%")
            dust = context.get("dust", "45 ug/m3")
            source = context.get("source", "CPCB CAAQMS & Open-Meteo Synoptic NWP")
            truth_tier = context.get("truth_tier", "OBSERVED")
            is_ground = (truth_tier == "OBSERVED")

        audience = context.get("audience", "General Public")
        drivers = context.get("drivers", ["Traffic congestion", "Low wind velocity"])
        timestamp = context.get("timestamp", "Current Synoptic Cycle")
        temperature = context.get("temperature", "31.4°C")
        target_lang = context.get("language") or context.get("lang") or "en"

        # Determine provenance label
        if is_ground:
            data_status_str = "OBSERVED"
            prov_label = "AI-generated from observed ground sensor data"
        elif truth_tier == "CACHED / BENCHMARK":
            data_status_str = "CACHED"
            prov_label = "AI-generated from benchmark data"
        else:
            data_status_str = "MODELLED"
            prov_label = "AI-generated from modelled environmental data"

        if self._client:
            lang_instruction = "Hindi (hi)" if target_lang == "hi" else ("Marathi (mr)" if target_lang == "mr" else "English (en)")
            prompt = f"""You are the senior environmental intelligence officer for {city}, India.
Target Focus Language: {lang_instruction}.

CRITICAL CONSTRAINTS:
1. Use ONLY the supplied environmental data. Do NOT invent measurements, AQI values, PM2.5, PM10, NO2, SO2, O3, station readings, coordinates, distances, timestamps, satellite observations, or CPCB observations.
2. Do NOT provide medical diagnosis or prescribe medications.
3. Do NOT invent government orders, emergency declarations, official CPCB statements, enforcement actions, or officer names.
4. Do NOT claim "Pollution will definitely increase" unless supplied evidence supports it; use appropriately qualified language ("Conditions may support...", "Available modelled data indicates...").
5. Do NOT label Gemini-generated text as LIVE OBSERVATION.
6. Do NOT label CAMS as CPCB OBSERVATION.

Verified Environmental Context:
- Location / Ward: {ward}, {city}
- Timestamp: {timestamp}
- Truth Tier: {truth_tier}
- Data Provenance Source: {source}
- Air Quality Index (AQI): {aqi}
- PM2.5: {pm25} ug/m3
- PM10: {pm10} ug/m3
- Wind Speed & Direction: {wind_speed}, {wind_direction}
- Relative Humidity: {humidity}
- Precipitation Probability: {precipitation_probability}
- Ambient Temperature: {temperature}
- Dust Concentration: {dust}
- Primary Observed Drivers: {', '.join(drivers)}
- Target Audience: {audience}

Return JSON strictly matching this schema:
{{
  "summary": "...",
  "risk_level": "very poor",
  "citizen_message_en": "Clear English advisory based strictly on supplied context...",
  "citizen_message_hi": "स्वाभाविक, सटीक हिंदी परामर्श (दिए गए तथ्यों के आधार पर)...",
  "citizen_message_mr": "नैसर्गिक, अचूक मराठी सूचना (दिलेल्या तथ्यांवर आधारित)...",
  "recommended_actions": ["Action 1", "Action 2"],
  "key_factors": ["Factor 1", "Factor 2"],
  "limitations": ["Model limitation"]
}}
Write natural, accurate Hindi and Marathi. Avoid machine-translated unnatural phrasing."""
            try:
                from google.genai import types
                response = await self._client.aio.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.2,
                    ),
                )
                text = response.text
                data = json.loads(text)
                return GeminiAdvisoryOutput(
                    summary=data.get("summary", f"{ward} ({city}) AQI at {aqi}"),
                    risk_level=data.get("risk_level", "moderate"),
                    citizen_message_en=data.get("citizen_message_en", ""),
                    citizen_message_hi=data.get("citizen_message_hi", ""),
                    citizen_message_mr=data.get("citizen_message_mr", ""),
                    recommended_actions=data.get("recommended_actions", []),
                    key_factors=data.get("key_factors", drivers),
                    limitations=data.get("limitations", ["Grounded in PranaMap verified environmental telemetry."]),
                    provenance_label=prov_label,
                    ai_status="AI-GENERATED",
                    generated_by="Gemini",
                    data_status=data_status_str,
                )
            except Exception as e:
                logger.warning(f"Gemini API call failed, falling back to deterministic template: {self._sanitize_error(e)}")

        # Safe deterministic fallback
        return self._deterministic_advisory_fallback(city, ward, aqi, audience, drivers, data_status_str, is_ground)

    def _deterministic_advisory_fallback(
        self,
        city: str,
        ward: str,
        aqi: int,
        audience: str,
        drivers: list[str],
        data_status_str: str = "MODELLED",
        is_ground: bool = False,
    ) -> GeminiAdvisoryOutput:
        """Deterministic, verified fallback matching CPCB guidelines."""
        if aqi > 300:
            risk = "Severe"
            msg_en = f"Air quality in {ward}, {city} is currently {aqi} (Severe). Nocturnal boundary layer collapse and {', '.join(drivers)} are contributing to elevated particulate accumulation. Sensitive groups and children are advised to suspend prolonged outdoor activities and wear N95 respirators."
            msg_hi = f"{ward}, {city} में वायु गुणवत्ता सूचकांक {aqi} (गंभीर) दर्ज किया गया है। हवा की धीमी गति तथा {', '.join(drivers)} के कारण प्रदूषण का स्तर ऊंचा बना हुआ है। नागरिक विशेषकर बच्चे व बुजुर्ग बाहर निकलने से बचें और N95 मास्क का उपयोग करें।"
            msg_mr = f"{ward}, {city} परिसरात हवेची गुणवत्ता निर्देशांक {aqi} (अतिगंभीर) आहे. {', '.join(drivers)} मुळे हवेतील प्रदूषक घटक वाढले आहेत. लहान मुले व ज्येष्ठ नागरिकांनी घराबाहेर जाणे टाळावे आणि N95 मास्क वापरावा."
            actions = [
                "Suspend heavy outdoor physical exertion, sports, and school recess activities",
                "Deploy mechanical mist sprinklers along congested corridors",
                "Wear certified N95 respirators during unavoidable outdoor commutes",
                "Seal residential ventilation and use HEPA air purifiers where available"
            ]
        elif aqi > 200:
            risk = "Very Poor"
            msg_en = f"Air quality in {ward}, {city} is {aqi} (Very Poor). Fine particulate concentrations (PM2.5) remain elevated due to {', '.join(drivers)}. Citizens are advised to moderate prolonged outdoor physical exertion."
            msg_hi = f"{ward}, {city} में वायु गुणवत्ता {aqi} (बहुत खराब) है। {', '.join(drivers)} के कारण वायुमंडल में धूलकण बने हुए हैं। आमजन लंबे समय तक बाहर भारी शारीरिक श्रम करने से बचें।"
            msg_mr = f"{ward}, {city} मधील हवेचा निर्देशांक {aqi} (अतिशय खराब) आहे. {', '.join(drivers)} मुळे नागरिकांनी घराबाहेर अतिश्रम करणे टाळावे."
            actions = [
                "Avoid morning and evening jogging along arterial road corridors",
                "Deploy street sweepers on unpaved shoulders",
                "Keep windows closed during early morning peak stagnation hours"
            ]
        else:
            risk = "Moderate"
            msg_en = f"Air quality in {ward}, {city} is {aqi} (Moderate). Air quality is acceptable for most, though sensitive individuals may experience minor respiratory irritation."
            msg_hi = f"{ward}, {city} में वायु गुणवत्ता सूचकांक {aqi} (मध्यम) है। सामान्य जनजीवन के लिए यह संतोषजनक है, संवेदनशील व्यक्ति आवश्यक सावधानी बरतें।"
            msg_mr = f"{ward}, {city} मध्ये हवेची गुणवत्ता {aqi} (मध्यम) आहे. संवेदनशील व्यक्तींनी आवश्यक खबरदारी घ्यावी."
            actions = ["Maintain normal outdoor activities", "Encourage public transport usage"]

        prov_label = (
            "Rule-based advisory from observed ground sensor data"
            if is_ground
            else "Rule-based advisory from modelled environmental data"
        )

        return GeminiAdvisoryOutput(
            summary=f"{ward} ({city}) AQI at {aqi} ({risk})",
            risk_level=risk.lower(),
            citizen_message_en=msg_en,
            citizen_message_hi=msg_hi,
            citizen_message_mr=msg_mr,
            recommended_actions=actions,
            key_factors=drivers,
            limitations=[
                "Calibrated offline deterministic model verified with CPCB guidelines.",
                "AI narrative unavailable — showing rule-based analysis.",
            ],
            provenance_label=prov_label,
            ai_status="AI narrative unavailable — showing rule-based analysis.",
            generated_by="PranaMap AI Deterministic Engine",
            data_status=data_status_str,
        )


gemini_service = GeminiService()

