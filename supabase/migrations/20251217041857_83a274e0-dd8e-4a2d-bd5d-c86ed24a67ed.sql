-- Create notifications table for auction permission requests
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  action_taken BOOLEAN DEFAULT false,
  action_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read, take action)
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- System can insert notifications (via trigger)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Function to auto-expire auctions after 14 days
CREATE OR REPLACE FUNCTION public.expire_old_auctions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Mark auctions as expired if auction_end_date has passed
  UPDATE public.listings
  SET status = 'expired'
  WHERE is_auction = true
    AND status = 'active'
    AND auction_end_date IS NOT NULL
    AND auction_end_date < now();
END;
$$;

-- Function to check for unsold items older than 30 days and create notifications
CREATE OR REPLACE FUNCTION public.check_unsold_items_for_auction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create notifications for product listings (not services) that are:
  -- 1. Still active
  -- 2. Not already an auction
  -- 3. Older than 30 days
  -- 4. Don't already have an auction permission notification pending
  INSERT INTO public.notifications (user_id, listing_id, type, message)
  SELECT 
    l.user_id,
    l.id,
    'auction_permission',
    'Your listing "' || l.title || '" has been unsold for 30 days. Would you like to move it to the auction section?'
  FROM public.listings l
  WHERE l.status = 'active'
    AND l.listing_type = 'product'
    AND (l.is_auction IS NULL OR l.is_auction = false)
    AND l.created_at < now() - INTERVAL '30 days'
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n
      WHERE n.listing_id = l.id
        AND n.type = 'auction_permission'
        AND n.action_taken = false
    );
END;
$$;

-- Function to approve auction move
CREATE OR REPLACE FUNCTION public.approve_auction_move(notification_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_listing_id UUID;
  v_user_id UUID;
BEGIN
  -- Get the notification
  SELECT listing_id, user_id INTO v_listing_id, v_user_id
  FROM public.notifications
  WHERE id = notification_id AND type = 'auction_permission';
  
  -- Verify the user owns this notification
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Update the listing to be an auction
  UPDATE public.listings
  SET 
    is_auction = true,
    auction_end_date = now() + INTERVAL '14 days',
    price = price * 0.5 -- Start at 50% of original price
  WHERE id = v_listing_id AND user_id = auth.uid();
  
  -- Mark notification as actioned
  UPDATE public.notifications
  SET action_taken = true, action_type = 'approved'
  WHERE id = notification_id;
END;
$$;

-- Function to decline auction move
CREATE OR REPLACE FUNCTION public.decline_auction_move(notification_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get the notification user
  SELECT user_id INTO v_user_id
  FROM public.notifications
  WHERE id = notification_id AND type = 'auction_permission';
  
  -- Verify the user owns this notification
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Mark notification as actioned (declined)
  UPDATE public.notifications
  SET action_taken = true, action_type = 'declined'
  WHERE id = notification_id;
END;
$$;