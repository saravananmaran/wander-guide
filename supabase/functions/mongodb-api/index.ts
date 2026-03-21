import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// MongoDB Data API base URL - we'll use the Atlas Data API
const MONGODB_DATA_API = "https://data.mongodb-api.com/app/data-fediy/endpoint/data/v1";

async function getMongoClient() {
  const connectionString = Deno.env.get("MONGODB_CONNECTION_STRING");
  if (!connectionString) {
    throw new Error("MONGODB_CONNECTION_STRING not configured");
  }
  return connectionString;
}

// Use MongoDB Atlas Data API for serverless access
async function mongoRequest(action: string, body: Record<string, unknown>) {
  const connectionString = await getMongoClient();
  
  // Parse connection string to extract cluster info
  const match = connectionString.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)/);
  if (!match) {
    throw new Error("Invalid MongoDB connection string format");
  }

  const [, username, password, cluster] = match;
  
  // Use the Atlas Data API endpoint
  const dataApiUrl = `https://${cluster.replace('.mongodb.net', '')}.data.mongodb-api.com/app/data-fediy/endpoint/data/v1/action/${action}`;

  const response = await fetch(dataApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": password, // Atlas Data API key
    },
    body: JSON.stringify({
      dataSource: "Cluster0",
      database: "nearbyplaces",
      collection: body._collection || "places",
      ...Object.fromEntries(Object.entries(body).filter(([k]) => k !== '_collection')),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("MongoDB API error:", errorText);
    throw new Error(`MongoDB API error: ${response.status}`);
  }

  return response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // For now, return mock data and provide seed endpoint
    // This allows the app to work immediately while MongoDB is being set up
    
    if (req.method === "GET") {
      // Return places from MongoDB or fallback to empty
      try {
        const result = await mongoRequest("find", { filter: {} });
        return new Response(JSON.stringify({ 
          success: true, 
          places: result.documents || [] 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("MongoDB fetch failed, returning empty:", err);
        return new Response(JSON.stringify({ 
          success: true, 
          places: [],
          note: "MongoDB connection not yet configured. Use POST /seed to populate data."
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { action } = body;

      if (action === "seed") {
        // Seed default places into MongoDB
        const defaultPlaces = [
          {
            name: 'Grand Marina Hotel', category: 'hotels', rating: 4.8,
            reviewCount: 2341, distance: 0.3, address: '123 Ocean Boulevard',
            image: '/lovable-uploads/b79d4a84-c67f-4817-b26f-8879f4ba142d.webp',
            priceLevel: 4, isOpen: true, description: 'Luxury beachfront hotel with stunning ocean views',
            tags: ['Luxury', 'Beachfront', 'Pool', 'Spa'],
          },
          {
            name: 'Sunset Bistro', category: 'restaurants', rating: 4.6,
            reviewCount: 892, distance: 0.5, address: '45 Harbor Street',
            image: 'https://vveidmngonixyqjicndq.supabase.co/storage/v1/object/public/uploads/32a07ba9-a33b-4bbc-af6c-c37630d78df0.webp',
            priceLevel: 3, isOpen: true, openingHours: '11:00 AM - 10:00 PM',
            description: 'Fine dining with breathtaking sunset views',
            tags: ['Fine Dining', 'Seafood', 'Romantic'],
          },
          {
            name: 'City Central Hospital', category: 'hospitals', rating: 4.4,
            reviewCount: 456, distance: 1.2, address: '789 Medical Center Drive',
            image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=300&fit=crop',
            isOpen: true, openingHours: '24 Hours',
            description: 'Full-service hospital with emergency care',
            tags: ['Emergency', '24/7', 'Specialist Care'],
          },
          {
            name: 'Artisan Market', category: 'shops', rating: 4.5,
            reviewCount: 678, distance: 0.8, address: '56 Creative Lane',
            image: '/lovable-uploads/df850093-0ad1-46e5-a205-78f32e53bcc4.webp',
            priceLevel: 2, isOpen: true, openingHours: '9:00 AM - 8:00 PM',
            description: 'Unique handcrafted goods and local souvenirs',
            tags: ['Souvenirs', 'Handmade', 'Local'],
          },
          {
            name: 'Royal Theatre', category: 'theatres', rating: 4.7,
            reviewCount: 1234, distance: 1.5, address: '100 Arts Avenue',
            image: '/lovable-uploads/652d6815-f601-408a-8f88-d6d8ef338462.webp',
            priceLevel: 3, isOpen: false, openingHours: 'Shows at 7:00 PM & 9:00 PM',
            description: 'Historic theatre featuring world-class performances',
            tags: ['Shows', 'Historic', 'Entertainment'],
          },
          {
            name: 'Botanical Gardens', category: 'parks', rating: 4.9,
            reviewCount: 3456, distance: 2.0, address: '200 Nature Walk',
            image: '/76d260b2-1c5e-4432-b0a7-1bf2258f7752.webp',
            isOpen: true, openingHours: '6:00 AM - 8:00 PM',
            description: 'Beautiful gardens with rare plant species',
            tags: ['Nature', 'Walking', 'Photography'],
          },
          {
            name: 'Metro Shopping Mall', category: 'malls', rating: 4.3,
            reviewCount: 2100, distance: 0.9, address: '500 Commerce Street',
            image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=400&h=300&fit=crop',
            priceLevel: 2, isOpen: true, openingHours: '10:00 AM - 10:00 PM',
            description: 'Modern mall with 200+ stores and dining options',
            tags: ['Shopping', 'Food Court', 'Cinema'],
          },
          {
            name: 'Local Expert Tours', category: 'guides', rating: 4.9,
            reviewCount: 567, distance: 0.2, address: 'Tourist Information Center',
            image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=400&h=300&fit=crop',
            priceLevel: 2, isOpen: true, openingHours: '8:00 AM - 6:00 PM',
            description: 'Professional guided tours with local experts',
            tags: ['Tours', 'Local Knowledge', 'Groups'],
          },
          {
            name: 'The Cozy Inn', category: 'hotels', rating: 4.4,
            reviewCount: 890, distance: 0.7, address: '34 Comfort Street',
            image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop',
            priceLevel: 2, isOpen: true,
            description: 'Charming boutique hotel in the heart of the city',
            tags: ['Boutique', 'Central', 'Breakfast Included'],
          },
          {
            name: 'Ocean View Café', category: 'restaurants', rating: 4.5,
            reviewCount: 1456, distance: 0.4, address: '78 Coastal Road',
            image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
            priceLevel: 2, isOpen: true, openingHours: '7:00 AM - 9:00 PM',
            description: 'Casual dining with fresh local ingredients',
            tags: ['Casual', 'Breakfast', 'Coffee'],
          },
          {
            name: 'Riverside Park', category: 'parks', rating: 4.6,
            reviewCount: 2890, distance: 1.1, address: 'River Walk Path',
            image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&h=300&fit=crop',
            isOpen: true, openingHours: 'Always Open',
            description: 'Scenic riverside trail with picnic areas',
            tags: ['Running', 'Cycling', 'Picnic'],
          },
          {
            name: 'Heritage Walking Tours', category: 'guides', rating: 4.8,
            reviewCount: 345, distance: 0.3, address: 'Historic District Office',
            image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
            priceLevel: 1, isOpen: true, openingHours: '9:00 AM - 5:00 PM',
            description: 'Discover the rich history of our beautiful city',
            tags: ['History', 'Walking', 'Educational'],
          },
        ];

        try {
          const result = await mongoRequest("insertMany", { documents: defaultPlaces });
          return new Response(JSON.stringify({ 
            success: true, 
            message: `Seeded ${defaultPlaces.length} places`,
            result 
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (err) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: `Failed to seed: ${err.message}` 
          }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      if (action === "find") {
        const result = await mongoRequest("find", { filter: body.filter || {}, _collection: body.collection || "places" });
        return new Response(JSON.stringify({ success: true, places: result.documents || [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "saveUser") {
        const { email, authId, loginAt } = body;
        if (!email || !authId) {
          return new Response(JSON.stringify({ error: "email and authId required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        // Upsert user in the "users" collection
        try {
          const result = await mongoRequest("updateOne", {
            _collection: "users",
            filter: { authId },
            update: {
              $set: { email, authId, lastLoginAt: loginAt || new Date().toISOString() },
              $setOnInsert: { createdAt: new Date().toISOString() },
            },
            upsert: true,
          });
          return new Response(JSON.stringify({ success: true, result }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (err) {
          console.error("Failed to save user:", err);
          return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      if (action === "insertOne") {
        const result = await mongoRequest("insertOne", { document: body.document });
        return new Response(JSON.stringify({ success: true, result }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "updateOne") {
        const result = await mongoRequest("updateOne", { 
          filter: body.filter, 
          update: body.update 
        });
        return new Response(JSON.stringify({ success: true, result }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "deleteOne") {
        const result = await mongoRequest("deleteOne", { filter: body.filter });
        return new Response(JSON.stringify({ success: true, result }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
