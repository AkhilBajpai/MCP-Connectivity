USE ROLE AI_ENGINEER_ROLE;
USE WAREHOUSE AI_WH;
USE SCHEMA AI_DATA_ENG.DOC_PROCESSING;

-- Row counts per document
SELECT
    file_name,
    COUNT(*)          AS pages_parsed,
    MIN(ingested_at)  AS first_ingested,
    MAX(ingested_at)  AS last_ingested
FROM PARSED_DOCUMENTS
GROUP BY file_name
ORDER BY last_ingested DESC;

-- Sample content from the first document
SELECT
    file_name,
    page_number,
    LEFT(structured_text, 500) AS preview
FROM PARSED_DOCUMENTS
WHERE file_name = (SELECT MIN(file_name) FROM PARSED_DOCUMENTS)
ORDER BY page_number
LIMIT 5;
