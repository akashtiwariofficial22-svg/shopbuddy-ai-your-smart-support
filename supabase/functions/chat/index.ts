import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Default store data (fallback)
const defaultStoreData = {
  name: "Starbucks JP Nagar",
  hours: "Open until 9PM",
  address: "JP Nagar 6th Phase, Bangalore",
  inventory: [
    { name: "Hot Cocoa", inStock: true, quantity: 10, price: 250 },
    { name: "Cappuccino", inStock: true, quantity: 15, price: 300 },
    { name: "Latte", inStock: true, quantity: 12, price: 320 },
    { name: "Iced Mocha", inStock: true, quantity: 8, price: 350 },
  ],
};

// Mask PII function
function maskPII(text: string): string {
  let masked = text.replace(/(\+91[-\s]?)?[6-9]\d{9}/g, "+91-XXXXXXXXXX");
  masked = masked.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, 
    (_, local) => `${local.charAt(0)}***@***.com`);
  return masked;
}

// Build context from store data (RAG simulation)
function buildStoreContext(storeContext: any): string {
  const store = storeContext?.store || defaultStoreData;
  const distance = storeContext?.distance || "nearby";
  const userLocation = storeContext?.userLocation;

  const inventory = (store.inventory || defaultStoreData.inventory)
    .map((item: any) => `- ${item.name}: ${item.inStock ? `In Stock (${item.quantity} available)` : 'Out of Stock'}, ₹${item.price}`)
    .join('\n');

  const locationInfo = userLocation 
    ? `User's exact coordinates: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`
    : "User location: approximate";

  return `
STORE INFORMATION:
- Name: ${store.name}
- Status: Open (${store.hours})
- Distance from user: ${distance}
- Address: ${store.address || "Address available in app"}
- ${locationInfo}

CURRENT INVENTORY AT ${store.name.toUpperCase()}:
${inventory}

ACTIVE OFFERS:
- Hot drinks: 10% off with code WARM10
- Any coffee: 15% off with code COFFEE15
- First-time customers: Free cookie with any drink
`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, storeContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service not configured");
    }

    // Mask PII in user messages
    const maskedMessages = messages.map((msg: { role: string; content: string }) => ({
      ...msg,
      content: maskPII(msg.content)
    }));

    const storeName = storeContext?.store?.name || defaultStoreData.name;
    console.log(`Processing chat request for store: ${storeName}, messages: ${maskedMessages.length}`);

    // Build system prompt with dynamic RAG context
    const systemPrompt = `You are ShopBuddy AI, a friendly and helpful customer support assistant for retail stores. You have access to real-time store data and inventory information based on the user's ACTUAL detected location.

${buildStoreContext(storeContext)}

IMPORTANT GUIDELINES:
1. Be warm, friendly, and helpful - like a knowledgeable friend who works at the store
2. Use the store data provided to give accurate, specific answers about THIS specific store
3. When users ask about products, check the inventory for THIS store and provide availability info
4. Always mention the correct store name (${storeName}) and actual distance from user
5. If users seem cold or mention weather, suggest warm drinks from THIS store's inventory
6. Keep responses concise but informative (2-3 sentences max for simple questions)
7. Use emojis sparingly (1-2 per message max) to keep a friendly tone
8. If a product is not in this store's inventory, say so honestly and suggest alternatives they DO have
9. Privacy is important - never ask for or expose personal information
10. The distance shown is calculated from the user's actual GPS location

RESPONSE FORMAT:
- For store questions: Include store name, status, and the actual calculated distance
- For product questions: Include availability, quantity if in stock, and any active offers
- For recommendations: Consider the specific inventory at this location`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...maskedMessages,
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded. Please try again in a moment.",
          code: "RATE_LIMITED"
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Service credits depleted. Please try again later.",
          code: "CREDITS_DEPLETED"
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request. Please try again.";

    console.log("AI response generated successfully for", storeName);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      storeData: {
        name: storeName,
        status: "Open",
        hours: storeContext?.store?.hours || defaultStoreData.hours,
        distance: storeContext?.distance || "nearby"
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      code: "INTERNAL_ERROR"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
