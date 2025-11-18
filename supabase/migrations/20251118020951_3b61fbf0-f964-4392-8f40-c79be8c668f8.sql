-- Add mine_name column to mining_data table
ALTER TABLE public.mining_data 
ADD COLUMN IF NOT EXISTS mine_name TEXT;