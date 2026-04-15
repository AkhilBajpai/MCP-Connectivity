-- Chunks should be between 100 and 1200 characters.
-- Small padding above 1000 accounts for the recursive splitter
-- not breaking mid-word.

SELECT chunk_id, chunk_length
FROM {{ ref('int_document_chunks') }}
WHERE chunk_length < 100 OR chunk_length > 1200
