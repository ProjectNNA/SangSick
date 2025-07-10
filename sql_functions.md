# SQL Functions for Supabase

## Atomic Question Stats Update Function

Run this SQL function in your Supabase SQL Editor to create the atomic update function:

```sql
CREATE OR REPLACE FUNCTION increment_question_stats(
  question_id bigint,
  answer_index integer
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  current_counts jsonb;
  new_count integer;
BEGIN
  -- Atomic update with proper null handling
  UPDATE questions 
  SET 
    totalCount = COALESCE(totalCount, 0) + 1,
    answerCounts = CASE 
      WHEN answerCounts IS NULL THEN 
        -- Initialize with zeros and set the appropriate index
        jsonb_build_array(
          CASE WHEN answer_index = 0 THEN 1 ELSE 0 END,
          CASE WHEN answer_index = 1 THEN 1 ELSE 0 END,
          CASE WHEN answer_index = 2 THEN 1 ELSE 0 END,
          CASE WHEN answer_index = 3 THEN 1 ELSE 0 END,
          CASE WHEN answer_index = 4 THEN 1 ELSE 0 END
        )
      ELSE
        -- Increment the specific answer index
        jsonb_set(
          answerCounts,
          ARRAY[answer_index::text],
          (COALESCE((answerCounts->>answer_index)::integer, 0) + 1)::text::jsonb
        )
    END
  WHERE id = question_id;
  
  -- Ensure the update affected exactly one row
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Question with id % not found', question_id;
  END IF;
END;
$$;
```

This function:
1. **Prevents race conditions** by using atomic SQL operations
2. **Handles null values** properly (initializes arrays if needed)
3. **Validates** that the question exists
4. **Ensures data integrity** with proper error handling 