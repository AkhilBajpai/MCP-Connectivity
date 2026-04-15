{{ config(materialized='view') }}

SELECT
    doc_id,
    file_name,
    page_number,
    structured_text,
    parse_mode,
    ingested_at,
    LENGTH(structured_text) AS char_count
FROM {{ source('doc_processing', 'parsed_documents') }}
WHERE structured_text IS NOT NULL
  AND LENGTH(structured_text) > 50
