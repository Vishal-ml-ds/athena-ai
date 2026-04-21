-- 007_streak_rpc.sql
-- Safely increments current streak and updates best streak for a habit.
-- SECURITY DEFINER ensures RLS is bypassed only for this specific update,
-- and user_id_param acts as the authorization check.

CREATE OR REPLACE FUNCTION increment_streak(
    habit_id_param UUID,
    user_id_param UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE habits
    SET
        streak_current = streak_current + 1,
        streak_best = GREATEST(streak_best, streak_current + 1)
    WHERE
        id = habit_id_param
        AND user_id = user_id_param;
END;
$$;
