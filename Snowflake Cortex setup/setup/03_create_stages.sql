-- Internal stages for document ingestion

USE ROLE AI_ENGINEER_ROLE;
USE WAREHOUSE AI_WH;
USE SCHEMA AI_DATA_ENG.DOC_PROCESSING;

CREATE STAGE IF NOT EXISTS RAW_DOCUMENTS
  ENCRYPTION = (TYPE = 'SNOWFLAKE_SSE')
  COMMENT = 'Landing zone for PDF and text documents';

CREATE STAGE IF NOT EXISTS PROCESSED_OUTPUT
  ENCRYPTION = (TYPE = 'SNOWFLAKE_SSE')
  COMMENT = 'Parsed and chunked document output';

-- Upload test: PUT file://./sample_data/test.pdf @RAW_DOCUMENTS;
