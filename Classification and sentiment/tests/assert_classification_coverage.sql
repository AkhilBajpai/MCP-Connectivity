-- At least 90% of chunks should have a valid classification.
-- Cortex may fail on very short or garbled text, so we allow a small margin.

WITH stats AS (
    SELECT
        COUNT(*) AS total,
        COUNT(sentiment) AS classified
    FROM {{ ref('int_classified_chunks') }}
)
SELECT *
FROM stats
WHERE classified < total * 0.9
