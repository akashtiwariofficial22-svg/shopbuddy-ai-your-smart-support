import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mock store data for RAG
const storeData = {
  name: "Starbucks JP Nagar",
  status: "Open",
  hours: "Open until 9PM",
  distance: "50m",
  address: "123 JP Nagar Main Road, Bangalore",
  inventory: [
    { name: "Hot Cocoa", inStock: true, quantity: 10, price: 250, category: "hot drinks" },
    { name: "Cappuccino", inStock: true, quantity: 15, price: 300, category: "coffee" },
    { name: "Latte", inStock: true, quantity: 12, price: 320, category: "coffee" },
    { name: "Espresso", inStock: true, quantity: 20, price: 200, category: "coffee" },
    { name: "Iced Mocha", inStock: true, quantity: 8, price: 350, category: "cold drinks" },
    { name: "Croissant", inStock: true, quantity: 5, price: 180, category: "food" },
    { name: "Blueberry Muffin", inStock: false, quantity: 0, price: 150, category: "food" },
  ],
  offers: [
    { product: "Hot Cocoa", discount: "10%", code: "WARM10" },
    { product: "Cappuccino", discount: "15%", code: "COFFEE15" },
  ]
};

// Mask PII function
function maskPII(text: string): string {
  // Mask phone numbers
  let masked = text.replace(/(\+91[-\s]?)?[6-9]\d{9}/g, "+91-XXXXXXXXXX");
  // Mask emails
  masked = masked.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, 
    (_, local) => `${local.charAt(0)}***@***.com`);
  return masked;
}

// Build context from store data (RAG simulation)
function buildStoreContext(): string {
  const inventory = storeData.inventory
    .map(item => `- ${item.name}: ${item.inStock ? `In Stock (${item.quantity} available)` : 'Out of Stock'}, ₹${item.price}`)
    .join('\n');
  
  const offers = storeData.offers
    .map(offer => `- ${offer.product}: ${offer.discount} off with code ${offer.code}`)
    .join('\n');

  return `
STORE INFORMATION:
- Name: ${storeData.name}
- Status: ${storeData.status} (${storeData.hours})
- Distance from user: ${storeData.distance}
- Address: ${storeData.address}

CURRENT INVENTORY:
${inventory}

ACTIVE OFFERS:
${offers}
`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
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

    console.log("Processing chat request with", maskedMessages.length, "messages");

    // Build system prompt with RAG context
    const systemPrompt = `You are ShopBuddy AI, a friendly and helpful customer support assistant for retail stores. You have access to real-time store data and inventory information.

${buildStoreContext()}

IMPORTANT GUIDELINES:
1. Be warm, friendly, and helpful - like a knowledgeable friend who works at the store
2. Use the store data provided to give accurate, specific answers
3. When users ask about products, check the inventory and provide availability info
4. Proactively suggest relevant offers when appropriate
5. If users seem cold or mention weather, suggest warm drinks like Hot Cocoa
6. Keep responses concise but informative (2-3 sentences max for simple questions)
7. Use emojis sparingly to keep the tone friendly (1-2 per message max)
8. Always mention the store name and distance when relevant
9. If a product is out of stock, suggest alternatives
10. Privacy is important - never ask for or expose personal information

RESPONSE FORMAT:
- For store questions: Include store name, status, and distance
- For product questions: Include availability, quantity if in stock, and any active offers
- For recommendations: Consider context clues (weather, time, previous questions)`;

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

    console.log("AI response generated successfully");

    return new Response(JSON.stringify({ 
      response: aiResponse,
      storeData: {
        name: storeData.name,
        status: storeData.status,
        hours: storeData.hours,
        distance: storeData.distance
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
