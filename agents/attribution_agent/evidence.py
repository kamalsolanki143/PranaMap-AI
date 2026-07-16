"""Evidence collection and audit trail for attributions."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)


class EvidenceCollector:
    """Collect, store, and retrieve evidence for pollution attributions.

    Maintains an audit trail linking each attribution to its source
    data points, model outputs, and rule triggers.

    Attributes:
        evidence_store: In-memory evidence buffer.
    """

    def __init__(self) -> None:
        self.evidence_store: list[dict[str, Any]] = []

    def collect(
        self,
        station_id: str,
        attribution: dict[str, Any],
        source_data: dict[str, Any],
        model_output: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Collect evidence for a single attribution result.

        Args:
            station_id: Station identifier.
            attribution: Classification result.
            source_data: Raw data used for classification.
            model_output: Optional model prediction details.

        Returns:
            Evidence record with metadata.
        """
        evidence_record = {
            "station_id": station_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "dominant_source": attribution.get("dominant_source", "unknown"),
            "source_breakdown": attribution.get("source_breakdown", {}),
            "confidence": attribution.get("confidence", 0),
            "evidence_statements": attribution.get("evidence", []),
            "source_data_snapshot": self._snapshot_source_data(source_data),
            "model_output": model_output,
            "verification_status": "pending",
        }

        self.evidence_store.append(evidence_record)
        logger.info(
            "Evidence collected for station=%s source=%s",
            station_id,
            evidence_record["dominant_source"],
        )
        return evidence_record

    def verify(self, station_id: str, is_verified: bool, notes: str = "") -> None:
        """Update verification status of evidence for a station.

        Args:
            station_id: Station to verify.
            is_verified: Whether evidence is verified.
            notes: Optional verification notes.
        """
        for record in self.evidence_store:
            if record["station_id"] == station_id:
                record["verification_status"] = "verified" if is_verified else "rejected"
                record["verification_notes"] = notes
                record["verified_at"] = datetime.now(timezone.utc).isoformat()
                logger.info("Evidence for station=%s marked %s", station_id, record["verification_status"])

    def get_evidence(self, station_id: str) -> list[dict[str, Any]]:
        """Retrieve all evidence records for a station.

        Args:
            station_id: Station identifier.

        Returns:
            List of evidence records.
        """
        return [r for r in self.evidence_store if r["station_id"] == station_id]

    def export_audit_trail(self, run_id: str | None = None) -> str:
        """Export evidence store as JSON audit trail.

        Args:
            run_id: Optional filter by run ID.

        Returns:
            JSON string of evidence records.
        """
        records = self.evidence_store
        if run_id:
            records = [r for r in records if r.get("run_id") == run_id]
        return json.dumps(records, indent=2, default=str)

    @staticmethod
    def _snapshot_source_data(source_data: dict[str, Any]) -> dict[str, Any]:
        """Create a safe snapshot of source data for audit.

        Args:
            source_data: Raw data dict.

        Returns:
            Sanitized snapshot dict.
        """
        snapshot: dict[str, Any] = {}
        for key, value in source_data.items():
            if isinstance(value, (int, float, str, bool)):
                snapshot[key] = value
            elif isinstance(value, list) and len(value) < 50:
                snapshot[key] = value
            elif isinstance(value, dict):
                snapshot[key] = {k: v for k, v in value.items() if isinstance(v, (int, float, str, bool))}
            else:
                snapshot[key] = f"<omitted: {type(value).__name__}>"
        return snapshot
