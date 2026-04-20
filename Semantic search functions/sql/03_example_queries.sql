USE ROLE AI_ENGINEER_ROLE;
USE WAREHOUSE AI_WH;
USE SCHEMA AI_DATA_ENG.DOC_PROCESSING;

-- Basic semantic search
SELECT * FROM TABLE(SEMANTIC_SEARCH('How does the authentication module work?', 5, 0.4));

-- Filtered: only negative-sentiment chunks about security
SELECT * FROM TABLE(FILTERED_SEMANTIC_SEARCH(
    'security vulnerabilities',
    'negative',
    'security',
    10
));

-- Performance benchmark: execution time for 1000 chunks
SELECT
    query_id,
    execution_time / 1000.0 AS seconds
FROM TABLE(INFORMATION_SCHEMA.QUERY_HISTORY())
WHERE query_text ILIKE '%SEMANTIC_SEARCH%'
ORDER BY start_time DESC
LIMIT 5;
