"""Priority queue management for enforcement actions."""

from __future__ import annotations

import heapq
import logging
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)


@dataclass(order=True)
class PriorityItem:
    """Comparable item for the priority queue.

    Attributes:
        priority: Lower value = higher priority.
        station_id: Station identifier.
        data: Associated enforcement data.
    """
    priority: float
    station_id: str = field(compare=False)
    data: dict[str, Any] = field(compare=False, default_factory=dict)


class PriorityQueue:
    """Priority queue for managing enforcement actions.

    Supports enqueue, dequeue, peek, filtering, and bulk loading.

    Attributes:
        queue: Internal heap list.
    """

    def __init__(self) -> None:
        self.queue: list[PriorityItem] = []

    def enqueue(self, item: PriorityItem) -> None:
        """Add an item to the priority queue.

        Args:
            item: PriorityItem to enqueue.
        """
        heapq.heappush(self.queue, item)
        logger.debug("Enqueued station=%s with priority=%.4f", item.station_id, item.priority)

    def dequeue(self) -> PriorityItem | None:
        """Remove and return the highest-priority item.

        Returns:
            PriorityItem or None if queue is empty.
        """
        if not self.queue:
            return None
        item = heapq.heappop(self.queue)
        logger.debug("Dequeued station=%s", item.station_id)
        return item

    def peek(self) -> PriorityItem | None:
        """View the highest-priority item without removing it.

        Returns:
            PriorityItem or None.
        """
        return self.queue[0] if self.queue else None

    def size(self) -> int:
        """Return the number of items in the queue.

        Returns:
            Queue size.
        """
        return len(self.queue)

    def is_empty(self) -> bool:
        """Check if the queue is empty.

        Returns:
            True if empty.
        """
        return len(self.queue) == 0

    def filter_by_source(self, source: str) -> list[PriorityItem]:
        """Filter queue items by dominant source type.

        Args:
            source: Source type to filter on.

        Returns:
            List of matching PriorityItems.
        """
        return [
            item for item in self.queue
            if item.data.get("dominant_source") == source
        ]

    def load_from_attributions(self, attributions: list[dict[str, Any]]) -> None:
        """Bulk-load attributions into the priority queue.

        Args:
            attributions: Ranked attribution results.
        """
        for attr in attributions:
            score = attr.get("priority_score", 0)
            item = PriorityItem(
                priority=1 - score,
                station_id=attr.get("station_id", "unknown"),
                data=attr,
            )
            self.enqueue(item)

        logger.info("Loaded %d items into priority queue.", len(attributions))

    def to_list(self) -> list[dict[str, Any]]:
        """Export queue contents as a sorted list.

        Returns:
            List of item data dicts, ordered by priority.
        """
        sorted_items = sorted(self.queue, key=lambda x: x.priority)
        return [
            {"station_id": item.station_id, "priority_score": 1 - item.priority, **item.data}
            for item in sorted_items
        ]
