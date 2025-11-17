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

    // Generate sample data points for specific Indian mines
    const sampleData: Array<{
      latitude: number;
      longitude: number;
      value: number;
      type: string;
      mine_name: string;
    }> = [];
    
    // Define actual mining locations in Jharkhand, India
    const miningLocations = [
      { name: 'Jadugora Uranium Mines', lat: 22.65, lng: 86.35, types: ['radiation', 'gas'] },
      { name: 'Dhanbad Coal Mines', lat: 23.80, lng: 86.43, types: ['gas', 'vibration'] },
      { name: 'HCL Mines East Singhbhum', lat: 22.56, lng: 86.18, types: ['vibration', 'radiation'] }
    ];
    
    // Generate data points for each mine (15-20 points per mine)
    miningLocations.forEach(mine => {
      const pointsPerMine = 15 + Math.floor(Math.random() * 6); // 15-20 points
      
      for (let i = 0; i < pointsPerMine; i++) {
        const latOffset = (Math.random() - 0.5) * 0.05; // Smaller radius for specific mines
        const lngOffset = (Math.random() - 0.5) * 0.05;
        
        // Select type based on mine's primary hazards
        const type = mine.types[Math.floor(Math.random() * mine.types.length)];
        
        sampleData.push({
          latitude: mine.lat + latOffset,
          longitude: mine.lng + lngOffset,
          value: Math.random() * 100,
          type: type,
          mine_name: mine.name,
        });
      }
    });

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
