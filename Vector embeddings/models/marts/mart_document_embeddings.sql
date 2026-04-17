{{ config(materialized='table') }}

/*
  Generates 768-dimensional vector embeddings for each classified chunk
  using Snowflake's Arctic embedding model. The VECTOR type enables
  native cosine similarity search without external vector databases.
*/

SELECT
    chunk_id,
    doc_id,
    file_name,
    page_number,
    chunk_index,
    chunk_text,
    chunk_length,
    source_url,
    sentiment,
    primary_topic,
    SNOWFLAKE.CORTEX.EMBED_TEXT_768(
        'snowflake-arctic-embed-m',
        chunk_text
    )::VECTOR(FLOAT, 768)                   AS chunk_embedding,
    classified_at,
    CURRENT_TIMESTAMP()                     AS embedded_at
FROM {{ ref('int_classified_chunks') }}
WHERE chunk_text IS NOT NULL
  AND chunk_length >= 50
