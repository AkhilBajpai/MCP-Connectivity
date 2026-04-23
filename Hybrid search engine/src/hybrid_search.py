from dataclasses import dataclass
from typing import Optional

import weaviate
import weaviate.classes.query as wq


@dataclass
class SearchResult:
    content: str
    source_file: str
    page_number: int
    score: float


def hybrid_search(
    client: weaviate.WeaviateClient,
    query: str,
    alpha: float = 0.5,
    limit: int = 10,
    category_filter: Optional[str] = None,
) -> list[SearchResult]:
    """
    Hybrid search combining BM25 keyword matching with vector similarity.

    alpha controls the balance:
        0.0 = pure BM25 (keyword only)
        0.5 = equal weight
        1.0 = pure vector (semantic only)

    For exact-match queries (product codes, error IDs), lower alpha.
    For natural language questions, raise alpha toward 0.7-0.8.
    """
    collection = client.collections.get("TechnicalDocumentation")

    filters = None
    if category_filter:
        filters = wq.Filter.by_property("category").equal(category_filter)

    response = collection.query.hybrid(
        query=query,
        alpha=alpha,
        limit=limit,
        filters=filters,
        return_metadata=wq.MetadataQuery(score=True),
    )

    results: list[SearchResult] = []
    for obj in response.objects:
        results.append(SearchResult(
            content=obj.properties.get("content", ""),
            source_file=obj.properties.get("source_file", ""),
            page_number=obj.properties.get("page_number", 0),
            score=obj.metadata.score if obj.metadata.score else 0.0,
        ))
    return results


def alpha_sweep(
    client: weaviate.WeaviateClient,
    query: str,
    steps: int = 5,
    limit: int = 5,
) -> dict[float, list[SearchResult]]:
    """Run the same query at multiple alpha values to compare retrieval behavior."""
    sweep: dict[float, list[SearchResult]] = {}
    for i in range(steps + 1):
        alpha = round(i / steps, 2)
        sweep[alpha] = hybrid_search(client, query, alpha=alpha, limit=limit)
    return sweep


if __name__ == "__main__":
    client = weaviate.connect_to_local()
    try:
        results = hybrid_search(client, "OAuth2 authentication flow", alpha=0.6, limit=5)
        for r in results:
            print(f"[{r.score:.3f}] {r.source_file}:{r.page_number} — {r.content[:100]}")

        print("\n--- Alpha Sweep ---")
        sweep = alpha_sweep(client, "rate limiting API")
        for alpha, hits in sweep.items():
            top = hits[0].content[:60] if hits else "no results"
            print(f"  alpha={alpha:.2f} -> {top}")
    finally:
        client.close()
