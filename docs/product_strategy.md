# PranaMap AI — Product Strategy & GovTech Vision

---

## 1. Executive Summary

PranaMap AI is an AI-powered Environmental Intelligence and Decision Support Platform tailored for municipal administrations, state pollution control boards, and citizens across Indian cities.

Positioned at the intersection of **GovTech** and **ClimateTech**, PranaMap addresses the Clean Air & Climate Resilience track of the Google Cloud / Google AI Hackathon.

---

## 2. The Four Fundamental Questions

Every municipal environmental authority requires clear, data-driven answers to four core operational questions:

1. **WHERE is air quality deteriorating?**
   - *Answered by*: Geocoded MapLibre visualization, ward-level CAAQMS aggregation, and automated critical zone ranking (e.g. Anand Vihar, Dwarka).
2. **WHY is it deteriorating?**
   - *Answered by*: Multi-modal source attribution breaking down Traffic, Construction, Biomass, and Industrial contributions coupled with physical evidence (wind corridors, traffic congestion levels, satellite AOD).
3. **WHAT is likely to happen next?**
   - *Answered by*: 72-hour calibrated forecasting models, diurnal decomposition, and peak hazard window calculation.
4. **WHAT action should authorities and citizens take?**
   - *Answered by*: Prioritized municipal interventions assigned to operational field teams, scenario impact simulation, and Google Gemini-powered multilingual citizen advisories in English, Hindi, and Marathi.

---

## 3. Product Positioning & Market Need

| Attribute | Generic Air Quality Dashboards | PranaMap AI Platform |
| :--- | :--- | :--- |
| **Primary Focus** | Passive historical reporting | Proactive decision support & intervention management |
| **Actionability** | Informative only; no enforcement links | Specific operational interventions linked to field teams |
| **Explainability** | Black-box single number or fake "94% AI" | Transparent feature contribution & physical evidence |
| **Citizen Reach** | Monolingual English alerts | High-fidelity multilingual communication (English, Hindi, Marathi) via Google Gemini |
| **Scalability** | Single-city hardcoded demo | Multi-city registry natively supporting 9 major Indian urban clusters |

---

## 4. Google Technology Ecosystem Value

PranaMap AI meaningfully incorporates the Google Cloud and Google AI technology ecosystem:

- **Google Gemini (Gemini 2.5 Flash)**: Powers verified situational briefings and natural, culturally nuanced vernacular advisories (Hindi and Marathi) with zero frontend credential exposure.
- **Google Cloud Firestore**: Serves as the real-time operational data store managing dynamic intervention states, cached telemetry, and multi-city metadata.
- **Google Cloud Run**: Serverless containerized deployment platform hosting the high-throughput FastAPI application services.
- **Google Maps / Earth Engine Compatibility**: Geospatial vector tiles and atmospheric satellite data alignments.
