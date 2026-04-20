USE ROLE AI_ENGINEER_ROLE;
USE WAREHOUSE AI_WH;
USE SCHEMA AI_DATA_ENG.DOC_PROCESSING;

CREATE OR REPLACE FUNCTION SEMANTIC_SEARCH(
    query_text VARCHAR,
    top_k INT DEFAULT 5,
    min_score FLOAT DEFAULT 0.3
)
RETURNS TABLE (
    chunk_id VARCHAR,
    file_name VARCHAR,
    page_number INT,
    chunk_text VARCHAR,
    sentiment VARCHAR,
    primary_topic VARCHAR,
    similarity_score FLOAT
)
LANGUAGE SQL
AS
$$
    WITH query_embedding AS (
        SELECT SNOWFLAKE.CORTEX.EMBED_TEXT_768(
            'snowflake-arctic-embed-m',
            query_text
        )::VECTOR(FLOAT, 768) AS q_vec
    )
    SELECT
        d.chunk_id,
        d.file_name,
        d.page_number,
        d.chunk_text,
        d.sentiment,
        d.primary_topic,
        VECTOR_COSINE_SIMILARITY(d.chunk_embedding, q.q_vec) AS similarity_score
    FROM MART_DOCUMENT_EMBEDDINGS d
    CROSS JOIN query_embedding q
    WHERE VECTOR_COSINE_SIMILARITY(d.chunk_embedding, q.q_vec) >= min_score
    ORDER BY similarity_score DESC
    LIMIT top_k
$$;
