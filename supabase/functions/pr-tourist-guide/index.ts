// Puerto Rico Tourist Guide - Powered by Google Gemini with Maps Grounding
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID")!;
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN")!;
const GOOGLE_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface TouristUser {
  id: string;
  phone_number: string;
  subscription_tier: string;
  questions_count: number;
  questions_limit: number;
  subscription_expires_at: string | null;
  current_location_lat: number | null;
  current_location_lng: number | null;
  current_location_name: string | null;
  preferences: Record<string, any>;
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const formData = await req.formData();
    const from = formData.get("From") as string; // whatsapp:+17871234567
    const to = formData.get("To") as string;
    const body = formData.get("Body") as string;
    const latitude = formData.get("Latitude") as string | null;
    const longitude = formData.get("Longitude") as string | null;
    const address = formData.get("Address") as string | null;
    const label = formData.get("Label") as string | null;

    const phoneNumber = from.replace("whatsapp:", "");
    const twilioNumber = to.replace("whatsapp:", "");

    console.log(`Received message from ${phoneNumber}: ${body}`);
    console.log(`Location: ${latitude}, ${longitude}`);
    if (latitude && longitude) {
      console.log(`Location details: ${address || 'N/A'}, ${label || 'N/A'}`);
    }

    // Get or create user
    const user = await getOrCreateUser(phoneNumber);
    console.log(`User: ${user.id}, tier: ${user.subscription_tier}, questions: ${user.questions_count}/${user.questions_limit}`);

    // Check usage limits (freemium model)
    if (user.subscription_tier === "free" && user.questions_count >= user.questions_limit) {
      console.log(`User ${phoneNumber} hit free tier limit`);
      await sendWhatsAppMessage(
        phoneNumber,
        twilioNumber,
        `🎟️ Has alcanzado tu límite de ${user.questions_limit} preguntas gratuitas.\n\n` +
        `Desbloquea acceso ilimitado por solo $9.99 para tu estadía completa.\n\n` +
        `Responde "PREMIUM" para actualizar o visita: blokpr.co/tourist`
      );
      return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
        headers: { 'Content-Type': 'application/xml' }
      });
    }

    // Parse location from message or coordinates
    const location = await parseLocation(body, latitude, longitude, address, label, user);
    console.log(`Parsed location: ${JSON.stringify(location)}`);

    // Update user location if provided
    if (location.lat && location.lng) {
      console.log(`Updating user location to: ${location.lat}, ${location.lng}`);
      await updateUserLocation(user.id, location.lat, location.lng, location.name);
    }

    // Fetch conversation history for context
    console.log(`Fetching conversation history...`);
    const conversationHistory = await getConversationHistory(user.id);
    console.log(`Found ${conversationHistory.length} previous messages`);

    // Generate response using Gemini with Maps grounding
    console.log(`Calling Gemini API...`);
    const startTime = Date.now();
    const geminiResponse = await queryGeminiWithMaps(body, location, user, conversationHistory);
    const responseTime = Date.now() - startTime;
    console.log(`Gemini response time: ${responseTime}ms`);
    console.log(`Gemini response: ${geminiResponse.text.substring(0, 200)}...`);

    // Send response via WhatsApp
    console.log(`Sending WhatsApp response to ${phoneNumber}...`);
    await sendWhatsAppMessage(phoneNumber, twilioNumber, geminiResponse.text);
    console.log(`WhatsApp message sent successfully`);

    // Track conversation
    console.log(`Tracking conversation in database...`);
    await trackConversation(
      user.id,
      phoneNumber,
      body,
      geminiResponse.text,
      location,
      geminiResponse.raw,
      responseTime
    );

    // Increment usage count
    await incrementUsageCount(user.id);
    console.log(`Usage count incremented. Total processing time: ${Date.now() - startTime}ms`);

    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'application/xml' }
    });
  } catch (error) {
    console.error("ERROR processing message:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');

    // Don't try to send error message - just log it
    // (req.formData() body is already consumed)

    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      headers: { 'Content-Type': 'application/xml' }
    });
  }
});

async function getOrCreateUser(phoneNumber: string): Promise<TouristUser> {
  console.log(`Looking up user: ${phoneNumber}`);

  // Try to get existing user
  let { data: user, error } = await supabase
    .from("tourist_bot_users")
    .select("*")
    .eq("phone_number", phoneNumber)
    .single();

  if (error || !user) {
    console.log(`User not found, creating new user for ${phoneNumber}`);
    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from("tourist_bot_users")
      .insert({
        phone_number: phoneNumber,
        whatsapp_number: phoneNumber,
        subscription_tier: "free",
        questions_count: 0,
        questions_limit: 10,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating user:", createError);
      throw createError;
    }
    console.log(`New user created: ${newUser.id}`);
    user = newUser;
  } else {
    console.log(`Existing user found: ${user.id}`);
  }

  return user as TouristUser;
}

async function parseLocation(
  message: string,
  lat: string | null,
  lng: string | null,
  address: string | null,
  label: string | null,
  user: TouristUser
) {
  // If coordinates provided directly from WhatsApp location share
  if (lat && lng) {
    const locationName = label || address || "Current location";
    return {
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      name: locationName,
      source: "whatsapp_share",
    };
  }

  // Check for location mentions in text
  const locationKeywords = [
    "near me",
    "cerca de mí",
    "aquí",
    "here",
    "my location",
    "donde estoy",
  ];

  const hasLocationKeyword = locationKeywords.some((kw) =>
    message.toLowerCase().includes(kw)
  );

  if (hasLocationKeyword && user.current_location_lat && user.current_location_lng) {
    return {
      lat: user.current_location_lat,
      lng: user.current_location_lng,
      name: user.current_location_name || "Your last location",
      source: "user_profile",
    };
  }

  // Check for specific place mentions (Old San Juan, Condado, etc.)
  const placePatterns = [
    { regex: /old san juan|viejo san juan/i, lat: 18.4663, lng: -66.1057, name: "Old San Juan" },
    { regex: /condado/i, lat: 18.4655, lng: -66.0767, name: "Condado" },
    { regex: /isla verde/i, lat: 18.4373, lng: -66.0162, name: "Isla Verde" },
    { regex: /el yunque/i, lat: 18.3167, lng: -65.7861, name: "El Yunque National Forest" },
    { regex: /rinc[óo]n/i, lat: 18.3404, lng: -67.2493, name: "Rincón" },
  ];

  for (const place of placePatterns) {
    if (place.regex.test(message)) {
      return {
        lat: place.lat,
        lng: place.lng,
        name: place.name,
        source: "text_extraction",
      };
    }
  }

  // Fallback: Use last saved location if available
  if (user.current_location_lat && user.current_location_lng) {
    console.log(`Using saved location: ${user.current_location_name || 'Unknown'}`);
    return {
      lat: user.current_location_lat,
      lng: user.current_location_lng,
      name: user.current_location_name || "Your last location",
      source: "saved",
    };
  }

  // No location available
  return {
    lat: null,
    lng: null,
    name: null,
    source: "none",
  };
}

async function queryGeminiWithMaps(
  message: string,
  location: any,
  user: TouristUser,
  conversationHistory: any[]
) {
  const systemPrompt = `You are a knowledgeable Puerto Rico tourist guide assistant. You help tourists find restaurants, activities, beaches, and navigate Puerto Rico.

Key guidelines:
- You understand BOTH Spanish and English perfectly
- Always respond in the SAME language the user writes in (match their language)
- If user mixes languages (Spanglish), respond in the dominant language used
- Be conversational, friendly, and helpful with good detail
- Provide enough info to be useful (5-8 sentences) but stay under 1200 characters
- For lists of recommendations, limit to 3-4 options with key details each
- Prioritize safety (beach conditions, power outages, weather)
- Include practical details: price range, hours, reservations needed
- Consider dietary restrictions and accessibility when mentioned
- Highlight local favorites, not just tourist traps
- Warn about current conditions (power outages, road closures, etc.)
- Do NOT use markdown formatting (no asterisks for bold/italic)
- Use plain text with emojis for emphasis
- IMPORTANT: Use MILES and FEET for distances (not kilometers/meters) - Puerto Rico uses US imperial units
- Use Fahrenheit for temperature (not Celsius)
- Use dollars ($) for prices

User preferences: ${JSON.stringify(user.preferences)}
${location.lat ? `Current location: ${location.name} (${location.lat}, ${location.lng})` : "Location unknown"}

Context about Puerto Rico:
- Hurricane season: June-November
- Power grid can be unstable - generators are valuable
- Beach safety: check for flags, jellyfish warnings
- Local cuisine: mofongo, alcapurrias, quesitos, lechón
- Popular areas: Old San Juan, Condado, Isla Verde, El Yunque, Rincón, Culebra, Vieques
- Currency: US Dollar ($)
- Driving: Right side, speed limits in MPH`;

  // Build conversation history for context
  const contents: any[] = [];

  // Add conversation history if available
  if (conversationHistory.length > 0) {
    conversationHistory.forEach((msg) => {
      // User message
      contents.push({
        role: "user",
        parts: [{ text: msg.user_message }],
      });
      // Bot response
      contents.push({
        role: "model",
        parts: [{ text: msg.bot_response }],
      });
    });
  }

  // Build the current prompt
  let currentPrompt = `${systemPrompt}\n\nUser question: ${message}`;

  // Add location context if available
  if (location.lat && location.lng) {
    currentPrompt += `\n\nIMPORTANT: User is currently at coordinates ${location.lat}, ${location.lng} in Puerto Rico. Use Google Maps data to find nearby places and provide accurate recommendations.`;
  }

  // Add current user message
  contents.push({
    role: "user",
    parts: [{ text: currentPrompt }],
  });

  // Build request body for Gemini API
  const requestBody: any = {
    contents: contents,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 800, // Balanced - detailed but under 1600 char WhatsApp limit
    },
  };

  // Add Google Maps grounding if location available
  if (location.lat && location.lng) {
    requestBody.tools = [
      {
        googleMaps: {
          enableWidget: false, // Don't need visual widget in WhatsApp
        },
      },
    ];
    requestBody.toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: location.lat,
          longitude: location.lng,
        },
      },
    };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GOOGLE_API_KEY}`;

  console.log(`Making Gemini API request with ${location.lat ? 'grounding' : 'no grounding'}`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`Gemini API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error response:", errorText);
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log(`Gemini API response received, candidates: ${data.candidates?.length || 0}`);

    // Extract text from response
    let text = "";
    if (data.candidates && data.candidates[0]?.content?.parts) {
      text = data.candidates[0].content.parts
        .map((part: any) => part.text)
        .join("\n");
    }

    // Strip markdown formatting (WhatsApp doesn't render it properly)
    text = stripMarkdown(text);

    // Truncate if exceeds WhatsApp limit (1600 chars)
    const MAX_WHATSAPP_LENGTH = 1500; // Leave buffer for safety
    if (text.length > MAX_WHATSAPP_LENGTH) {
      console.log(`⚠️ Response too long (${text.length} chars), truncating...`);
      text = text.substring(0, MAX_WHATSAPP_LENGTH) + "...";
    }

    // Get grounding metadata if available
    const groundingMetadata = data.candidates?.[0]?.groundingMetadata || null;

    return {
      text: text || "Lo siento, no pude procesar tu pregunta. ¿Puedes intentar de nuevo?",
      raw: data,
      groundingMetadata,
    };
  } catch (error) {
    console.error("Gemini API error:", error);

    // Return a friendly error message
    return {
      text: "Lo siento, hubo un error al procesar tu pregunta. Por favor intenta de nuevo en un momento.",
      raw: { error: String(error) },
      groundingMetadata: null,
    };
  }
}

async function sendWhatsAppMessage(to: string, from: string, message: string) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

  console.log(`Sending WhatsApp FROM ${from} TO ${to}, message length: ${message.length} chars`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
    },
    body: new URLSearchParams({
      From: `whatsapp:${from}`,
      To: `whatsapp:${to}`,
      Body: message,
    }),
  });

  console.log(`Twilio response status: ${response.status}`);

  if (!response.ok) {
    const error = await response.text();
    console.error("Twilio error response:", error);
    throw new Error(`Twilio error: ${error}`);
  }

  const result = await response.json();
  console.log(`Twilio message SID: ${result.sid}, status: ${result.status}`);
  return result;
}

async function updateUserLocation(
  userId: string,
  lat: number,
  lng: number,
  name: string | null
) {
  await supabase
    .from("tourist_bot_users")
    .update({
      current_location_lat: lat,
      current_location_lng: lng,
      current_location_name: name,
    })
    .eq("id", userId);
}

async function trackConversation(
  userId: string,
  phoneNumber: string,
  userMessage: string,
  botResponse: string,
  location: any,
  geminiRaw: any,
  responseTime: number
) {
  await supabase.from("tourist_bot_conversations").insert({
    user_id: userId,
    phone_number: phoneNumber,
    user_message: userMessage,
    bot_response: botResponse,
    user_location_lat: location.lat,
    user_location_lng: location.lng,
    user_location_name: location.name,
    gemini_response_raw: geminiRaw,
    grounding_metadata: geminiRaw.candidates?.[0]?.groundingMetadata || null,
    response_time_ms: responseTime,
  });
}

async function incrementUsageCount(userId: string) {
  await supabase.rpc("increment_tourist_questions", { user_id: userId });
}

async function getConversationHistory(userId: string, limit: number = 5) {
  const { data, error } = await supabase
    .from("tourist_bot_conversations")
    .select("user_message, bot_response, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching conversation history:", error);
    return [];
  }

  // Return in chronological order (oldest first)
  return (data || []).reverse();
}

function stripMarkdown(text: string): string {
  // Remove bold/italic asterisks
  let cleaned = text.replace(/\*\*([^*]+)\*\*/g, "$1"); // **bold** -> bold
  cleaned = cleaned.replace(/\*([^*]+)\*/g, "$1"); // *italic* -> italic

  // Remove underscores for emphasis
  cleaned = cleaned.replace(/__([^_]+)__/g, "$1");
  cleaned = cleaned.replace(/_([^_]+)_/g, "$1");

  // Remove code backticks but keep content
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1");
  cleaned = cleaned.replace(/```[^`]*```/g, "");

  return cleaned;
}
