const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportData {
  type: string;
  stats: {
    max: number;
    average: number;
    dangerZoneCount: number;
    habitationDistance: number;
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, stats }: ReportData = await req.json();
    
    console.log('Generating PDF report for:', type);

    // Generate simple PDF content as HTML (can be converted to PDF on frontend)
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #1e40af; }
    .stat { margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 8px; }
    .stat-label { font-weight: bold; color: #374151; }
    .stat-value { font-size: 24px; color: #1e40af; margin-top: 5px; }
    .danger { color: #dc2626; }
    .warning { color: #f59e0b; }
    .safe { color: #10b981; }
    footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; }
  </style>
</head>
<body>
  <h1>Mine Safety Analysis Report</h1>
  <h2>Parameter: ${type.toUpperCase()}</h2>
  
  <div class="stat">
    <div class="stat-label">Maximum Value Detected</div>
    <div class="stat-value danger">${stats.max.toFixed(2)}</div>
  </div>
  
  <div class="stat">
    <div class="stat-label">Average Value</div>
    <div class="stat-value warning">${stats.average.toFixed(2)}</div>
  </div>
  
  <div class="stat">
    <div class="stat-label">Danger Zone Count</div>
    <div class="stat-value danger">${stats.dangerZoneCount} zones</div>
  </div>
  
  <div class="stat">
    <div class="stat-label">Recommended Habitation Distance</div>
    <div class="stat-value safe">${stats.habitationDistance.toFixed(2)} km</div>
  </div>
  
  <footer>
    <p>Generated on ${new Date().toLocaleString()}</p>
    <p>Mine Safety HeatMap Analyzer - Hackathon 2025</p>
  </footer>
</body>
</html>
    `;

    console.log('Report generated successfully');

    return new Response(JSON.stringify({ 
      success: true,
      htmlContent,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
