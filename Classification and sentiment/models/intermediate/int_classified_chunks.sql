{{ config(materialized='table') }}

/*
  Enriches each chunk with sentiment polarity and primary topic
  using Snowflake Cortex LLM completion. The classification prompt
  is kept minimal to reduce per-row token cost.
*/

WITH base AS (
    SELECT
        chunk_id,
        doc_id,
        file_name,
        page_number,
        chunk_index,
        chunk_text,
        chunk_length,
        source_url,
        chunked_at
    FROM {{ ref('int_document_chunks') }}
),

classified AS (
    SELECT
        *,
        SNOWFLAKE.CORTEX.COMPLETE(
            'mistral-large2',
            CONCAT(
                'Classify this text. Return ONLY a JSON object with two keys: ',
                '"sentiment" (one of: positive, neutral, negative) and ',
                '"topic" (the primary subject in 1-3 words). Text: ',
                LEFT(chunk_text, 800)
            )
        ) AS classification_raw
    FROM base
)

SELECT
    chunk_id,
    doc_id,
    file_name,
    page_number,
    chunk_index,
    chunk_text,
    chunk_length,
    source_url,
    TRY_PARSE_JSON(classification_raw):"sentiment"::STRING   AS sentiment,
    TRY_PARSE_JSON(classification_raw):"topic"::STRING       AS primary_topic,
    classification_raw,
    chunked_at,
    CURRENT_TIMESTAMP() AS classified_at
FROM classified
