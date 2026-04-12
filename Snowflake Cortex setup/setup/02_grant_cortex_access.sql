-- Cortex LLM function access requires the SNOWFLAKE.CORTEX_USER database role

USE ROLE ACCOUNTADMIN;

GRANT DATABASE ROLE SNOWFLAKE.CORTEX_USER TO ROLE AI_ENGINEER_ROLE;

-- Verify access by running a test completion
USE ROLE AI_ENGINEER_ROLE;
USE WAREHOUSE AI_WH;
USE SCHEMA AI_DATA_ENG.DOC_PROCESSING;

SELECT SNOWFLAKE.CORTEX.COMPLETE(
  'mistral-large2',
  'Respond with OK if you can read this.'
) AS cortex_test;
