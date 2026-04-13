-- Parse all PDFs from the RAW_DOCUMENTS stage using LAYOUT mode.
-- LAYOUT mode preserves spatial structure: tables, headers, paragraphs
-- are maintained in the output rather than being flattened to a single stream.

USE ROLE AI_ENGINEER_ROLE;
USE WAREHOUSE AI_WH;
USE SCHEMA AI_DATA_ENG.DOC_PROCESSING;

INSERT INTO PARSED_DOCUMENTS (file_name, page_number, raw_content, structured_text, parse_mode)
SELECT
    metadata$filename                                   AS file_name,
    f.value:"page"::INT                                 AS page_number,
    f.value                                             AS raw_content,
    f.value:"content"::STRING                           AS structured_text,
    'LAYOUT'                                            AS parse_mode
FROM
    @RAW_DOCUMENTS (FILE_FORMAT => 'JSON_FORMAT') AS s,
    LATERAL FLATTEN(
        input => AI_PARSE_DOCUMENT(
            s.$1,
            {'mode': 'LAYOUT'}
        ):"pages"
    ) AS f;
