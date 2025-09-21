export default async function handler(request: Request) {
  console.log('🦕 Dinosaur API called:', request.method, request.url);
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    console.log('🦕 Handling CORS preflight');
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Mock dinosaur data
  const mockData = [
    {
      row_index: "1",
      common_name: "Tyrannosaurus Rex",
      scientific_name: "Tyrannosaurus rex",
      geological_period: "Cretaceous",
      diet: "Carnivore",
      length_m: 12.3,
      height_m: 3.6,
      weight_kg: 8000,
      lived_in: "North America",
      first_discovered: "1905",
      meaning: "Tyrant lizard king",
      behavior_notes: "Apex predator of the Late Cretaceous period",
      notable_features: "Massive skull and powerful jaws",
      fossil_location: "Montana, USA"
    }
  ];

  try {
    console.log('🦕 Processing request method:', request.method);
    
    // Handle POST request for search
    if (request.method === 'POST') {
      console.log('🦕 Handling POST request');
      const body = await request.json().catch(() => ({}));
      console.log('🦕 Request body:', body);
      
      const response = {
        data: mockData,
        total: mockData.length,
        page: 1,
        totalPages: 1
      };
      
      console.log('🦕 Sending response:', response);
      
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Default response
    return new Response(JSON.stringify({ 
      message: 'Dinosaur API is working',
      available: ['POST /api/dinosaurs']
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('❌ Dinosaur API Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}
