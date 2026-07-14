"""LangGraph graph definition for PranaMap-AI pipeline."""

from __future__ import annotations

from typing import Annotated, Literal
from langgraph.graph import StateGraph, START, END

from agents.langgraph.state import PipelineState
from agents.langgraph.nodes import (
    ingestion_node,
    forecast_node,
    attribution_node,
    enforcement_node,
    advisory_node,
)
from agents.langgraph.router import route_after_ingestion, route_after_forecast


def build_graph() -> StateGraph:
    """Build and return the PranaMap-AI processing graph.

    Graph topology:
        START -> ingestion -> [forecast | END]
                         forecast -> [attribution | advisory]
                               attribution -> enforcement -> advisory -> END

    Returns:
        Compiled StateGraph ready for execution.
    """
    graph = StateGraph(PipelineState)

    graph.add_node("ingestion", ingestion_node)
    graph.add_node("forecast", forecast_node)
    graph.add_node("attribution", attribution_node)
    graph.add_node("enforcement", enforcement_node)
    graph.add_node("advisory", advisory_node)

    graph.add_edge(START, "ingestion")

    graph.add_conditional_edges(
        "ingestion",
        route_after_ingestion,
        {
            "forecast": "forecast",
            "end": END,
        },
    )

    graph.add_conditional_edges(
        "forecast",
        route_after_forecast,
        {
            "attribution": "attribution",
            "advisory": "advisory",
        },
    )

    graph.add_edge("attribution", "enforcement")
    graph.add_edge("enforcement", "advisory")
    graph.add_edge("advisory", END)

    return graph


compiled_graph = build_graph().compile()
