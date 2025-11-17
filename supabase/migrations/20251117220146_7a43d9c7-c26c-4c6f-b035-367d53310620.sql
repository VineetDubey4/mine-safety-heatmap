-- Create table for mining safety data
CREATE TABLE IF NOT EXISTS public.mining_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('gas', 'radiation', 'vibration')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_mining_data_type ON public.mining_data(type);
CREATE INDEX idx_mining_data_timestamp ON public.mining_data(timestamp);

-- Enable RLS
ALTER TABLE public.mining_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for demo purposes)
CREATE POLICY "Allow public read access" 
ON public.mining_data 
FOR SELECT 
USING (true);

-- Create policy to allow public insert (for file uploads)
CREATE POLICY "Allow public insert" 
ON public.mining_data 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow public delete (for clearing data)
CREATE POLICY "Allow public delete" 
ON public.mining_data 
FOR DELETE 
USING (true);