const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating sample mining safety data');

    // Generate sample data points for demonstration
    const sampleData = [];
    
    // Center coordinates (simulating a mining region)
    const centerLat = 40.7128;
    const centerLng = -74.0060;
    
    // Generate 50 random points around the center
    for (let i = 0; i < 50; i++) {
      const latOffset = (Math.random() - 0.5) * 0.1;
      const lngOffset = (Math.random() - 0.5) * 0.1;
      
      sampleData.push({
        latitude: centerLat + latOffset,
        longitude: centerLng + lngOffset,
        value: Math.random() * 100,
        type: ['gas', 'radiation', 'vibration'][i % 3],
      });
    }

    console.log('Sample data generated:', sampleData.length, 'points');

    return new Response(JSON.stringify({
      success: true,
      data: sampleData,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error generating sample data:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
