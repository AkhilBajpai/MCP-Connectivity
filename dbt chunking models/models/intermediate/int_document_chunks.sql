{{ config(materialized='table') }}

/*
  Recursive character splitting: 1000-char chunks with 200-char overlap.
  SPLIT_TEXT_RECURSIVE_CHARACTER preserves word boundaries and sentence
  structure where possible, producing higher-quality chunks than naive
  fixed-width splitting.
*/

WITH source_docs AS (
    SELECT
        doc_id,
        file_name,
        page_number,
        structured_text,
        ingested_at
    FROM {{ ref('stg_parsed_documents') }}
),

chunked AS (
    SELECT
        doc_id,
        file_name,
        page_number,
        c.value::STRING                     AS chunk_text,
        c.index                             AS chunk_index,
        LENGTH(c.value::STRING)             AS chunk_length,
        ingested_at
    FROM source_docs,
    LATERAL FLATTEN(
        input => SPLIT_TEXT_RECURSIVE_CHARACTER(
            structured_text,
            'markdown',
            1000,
            200
        )
    ) AS c
)

SELECT
    UUID_STRING()                           AS chunk_id,
    doc_id,
    file_name,
    page_number,
    chunk_index,
    chunk_text,
    chunk_length,
    file_name || '#page=' || page_number    AS source_url,
    ingested_at,
    CURRENT_TIMESTAMP()                     AS chunked_at
FROM chunked
