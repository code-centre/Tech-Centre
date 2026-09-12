-- One CompleteRegistration CAPI send per user. Insert claims the event;
-- a unique violation means another request already won.
CREATE UNIQUE INDEX IF NOT EXISTS marketing_events_complete_registration_user_uidx
  ON public.marketing_events (user_id)
  WHERE event_name = 'CompleteRegistration' AND user_id IS NOT NULL;
