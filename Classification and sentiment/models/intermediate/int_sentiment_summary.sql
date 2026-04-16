{{ config(materialized='table') }}

SELECT
    file_name,
    sentiment,
    COUNT(*)                                    AS chunk_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY file_name), 1) AS pct,
    CURRENT_TIMESTAMP()                         AS computed_at
FROM {{ ref('int_classified_chunks') }}
WHERE sentiment IS NOT NULL
GROUP BY file_name, sentiment
ORDER BY file_name, chunk_count DESC
