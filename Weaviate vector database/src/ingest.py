import json
from pathlib import Path

import weaviate

from schema import create_client


def ingest_chunks(client: weaviate.WeaviateClient, chunks_file: str) -> int:
    collection = client.collections.get("TechnicalDocumentation")
    data = json.loads(Path(chunks_file).read_text())

    with collection.batch.dynamic() as batch:
        for item in data:
            batch.add_object(properties={
                "content": item["content"],
                "source_file": item.get("source_file", "unknown"),
                "page_number": item.get("page_number", 0),
                "category": item.get("category", "general"),
                "sentiment": item.get("sentiment", "neutral"),
                "chunk_index": item.get("chunk_index", 0),
            })

    return len(data)


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python ingest.py <chunks.json>")
        raise SystemExit(1)

    client = create_client()
    try:
        count = ingest_chunks(client, sys.argv[1])
        print(f"Ingested {count} chunks.")
    finally:
        client.close()
