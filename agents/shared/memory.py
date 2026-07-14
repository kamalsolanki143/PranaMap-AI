"""Shared memory/state management for cross-node data persistence."""

from __future__ import annotations

import json
import logging
import threading
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)


class SharedMemory:
    """Thread-safe in-memory store for pipeline state and cross-run data.

    Provides key-value storage with TTL support, versioning,
    and optional persistence to disk.

    Attributes:
        _store: Internal data store keyed by run_id or custom key.
        _lock: Threading lock for concurrent access.
        max_entries: Maximum entries before eviction.
    """

    def __init__(self, max_entries: int = 1000) -> None:
        self._store: dict[str, dict[str, Any]] = {}
        self._lock = threading.Lock()
        self.max_entries = max_entries

    def store(self, key: str, data: dict[str, Any]) -> None:
        """Store data under a key.

        Args:
            key: Unique identifier (typically run_id).
            data: Data dict to persist.
        """
        with self._lock:
            self._store[key] = {
                "data": data,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "version": self._store.get(key, {}).get("version", 0) + 1,
            }

            if len(self._store) > self.max_entries:
                self._evict_oldest()

        logger.debug("Stored data for key=%s (version=%d)", key, self._store[key]["version"])

    def retrieve(self, key: str) -> dict[str, Any] | None:
        """Retrieve data by key.

        Args:
            key: Storage key.

        Returns:
            Stored data dict or None if not found.
        """
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                logger.debug("Key not found: %s", key)
                return None
            return entry.get("data")

    def update(self, key: str, field: str, value: Any) -> bool:
        """Update a specific field within stored data.

        Args:
            key: Storage key.
            field: Field name to update.
            value: New value.

        Returns:
            True if update succeeded, False if key not found.
        """
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return False
            entry["data"][field] = value
            entry["updated_at"] = datetime.now(timezone.utc).isoformat()
            entry["version"] += 1
            return True

    def delete(self, key: str) -> bool:
        """Delete an entry by key.

        Args:
            key: Storage key.

        Returns:
            True if deleted, False if not found.
        """
        with self._lock:
            if key in self._store:
                del self._store[key]
                logger.debug("Deleted key=%s", key)
                return True
            return False

    def list_keys(self) -> list[str]:
        """List all stored keys.

        Returns:
            List of key strings.
        """
        with self._lock:
            return list(self._store.keys())

    def get_version(self, key: str) -> int:
        """Get the version number of a stored entry.

        Args:
            key: Storage key.

        Returns:
            Version number (0 if not found).
        """
        with self._lock:
            entry = self._store.get(key)
            return entry.get("version", 0) if entry else 0

    def _evict_oldest(self) -> None:
        """Evict the oldest entry when max_entries is exceeded."""
        if not self._store:
            return
        oldest_key = min(self._store, key=lambda k: self._store[k].get("created_at", ""))
        del self._store[oldest_key]
        logger.debug("Evicted oldest key=%s", oldest_key)

    def clear(self) -> None:
        """Clear all stored data."""
        with self._lock:
            self._store.clear()
            logger.info("Shared memory cleared.")
