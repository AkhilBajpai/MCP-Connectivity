-- Embedding distribution diagnostics

USE ROLE AI_ENGINEER_ROLE;
USE WAREHOUSE AI_WH;

SELECT
    file_name,
    COUNT(*) AS chunk_count,
    COUNT(chunk_embedding) AS embedded,
    AVG(chunk_length) AS avg_chunk_chars
FROM AI_DATA_ENG.DOC_PROCESSING.MART_DOCUMENT_EMBEDDINGS
GROUP BY file_name
ORDER BY chunk_count DESC;
