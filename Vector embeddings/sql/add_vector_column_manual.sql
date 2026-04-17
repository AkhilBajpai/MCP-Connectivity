-- Alternative manual approach if not using dbt for the embedding step.
-- Adds a VECTOR column to an existing table and backfills embeddings.

USE ROLE AI_ENGINEER_ROLE;
USE WAREHOUSE AI_WH;
USE SCHEMA AI_DATA_ENG.DOC_PROCESSING;

ALTER TABLE DOCUMENT_CHUNKS
  ADD COLUMN IF NOT EXISTS chunk_embedding VECTOR(FLOAT, 768);

UPDATE DOCUMENT_CHUNKS
SET chunk_embedding = SNOWFLAKE.CORTEX.EMBED_TEXT_768(
    'snowflake-arctic-embed-m',
    chunk_text
)::VECTOR(FLOAT, 768)
WHERE chunk_embedding IS NULL
  AND chunk_text IS NOT NULL;

-- Verify embedding coverage
SELECT
    COUNT(*) AS total_chunks,
    COUNT(chunk_embedding) AS embedded_chunks,
    ROUND(COUNT(chunk_embedding) * 100.0 / COUNT(*), 1) AS coverage_pct
FROM DOCUMENT_CHUNKS;
