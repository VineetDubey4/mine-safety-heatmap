import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MiningDataPoint {
  latitude: number;
  longitude: number;
  value: number;
  type: string;
}

interface ClassifiedZone {
  severity: 'severe' | 'moderate' | 'safe';
  count: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { data: rawData, type } = await req.json();
    
    console.log('Processing mining data:', { dataPoints: rawData?.length, type });

    // Parse and validate data
    const parsedData: MiningDataPoint[] = [];
    
    for (const point of rawData) {
      const lat = parseFloat(point.latitude);
      const lng = parseFloat(point.longitude);
      const val = parseFloat(point.value);
      
      if (isNaN(lat) || isNaN(lng) || isNaN(val)) {
        console.warn('Invalid data point:', point);
        continue;
      }
      
      parsedData.push({
        latitude: lat,
        longitude: lng,
        value: val,
        type: type || point.type || 'gas',
      });
    }

    // Insert into database
    const { error: insertError } = await supabase
      .from('mining_data')
      .insert(parsedData);

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    // Calculate statistics
    const values = parsedData.map(p => p.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const average = values.reduce((a, b) => a + b, 0) / values.length;

    // Classify zones
    const classified: ClassifiedZone[] = [
      { severity: 'severe', count: values.filter(v => v > 80).length },
      { severity: 'moderate', count: values.filter(v => v >= 40 && v <= 80).length },
      { severity: 'safe', count: values.filter(v => v < 40).length },
    ];

    // Calculate recommended habitation distance (formula-based)
    const habitationDistance = Math.round((max / 10) * 100) / 100;

    const response = {
      success: true,
      data: parsedData,
      stats: {
        max,
        min,
        average: Math.round(average * 100) / 100,
        dangerZoneCount: classified[0].count + classified[1].count,
        habitationDistance,
        classified,
      },
    };

    console.log('Processing complete:', response.stats);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error processing mining data:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
