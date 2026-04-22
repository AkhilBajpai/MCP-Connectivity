import weaviate
import weaviate.classes.config as wc


def create_client(url: str = "http://localhost:8080") -> weaviate.WeaviateClient:
    return weaviate.connect_to_local(host=url.replace("http://", "").split(":")[0])


def setup_schema(client: weaviate.WeaviateClient) -> None:
    collection_name = "TechnicalDocumentation"

    if client.collections.exists(collection_name):
        print(f"Collection '{collection_name}' already exists — skipping.")
        return

    client.collections.create(
        name=collection_name,
        vectorizer_config=wc.Configure.Vectorizer.text2vec_huggingface(
            model="sentence-transformers/all-MiniLM-L6-v2",
        ),
        properties=[
            wc.Property(name="content", data_type=wc.DataType.TEXT),
            wc.Property(name="source_file", data_type=wc.DataType.TEXT),
            wc.Property(name="page_number", data_type=wc.DataType.INT),
            wc.Property(name="category", data_type=wc.DataType.TEXT),
            wc.Property(name="sentiment", data_type=wc.DataType.TEXT),
            wc.Property(name="chunk_index", data_type=wc.DataType.INT),
        ],
    )
    print(f"Collection '{collection_name}' created.")


if __name__ == "__main__":
    client = create_client()
    try:
        setup_schema(client)
    finally:
        client.close()
