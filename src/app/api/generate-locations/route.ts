import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Location {
  name: string;
  country: string;
  emoji: string;
  description: string;
  rarity: number;
  latitude: number;
  longitude: number;
}

function validateLocation(loc: any, index: number): Location {
  const errors: string[] = [];

  if (!loc.name) errors.push('name is required');
  if (!loc.country) errors.push('country is required');
  if (!loc.emoji) errors.push('emoji is required');
  if (!loc.description) errors.push('description is required');
  
  // Convert rarity to number if it's a string
  if (typeof loc.rarity === 'string') {
    loc.rarity = parseFloat(loc.rarity);
  }
  if (typeof loc.rarity !== 'number' || isNaN(loc.rarity)) {
    errors.push('rarity must be a number');
  }

  // Convert coordinates to numbers if they're strings
  if (typeof loc.latitude === 'string') {
    loc.latitude = parseFloat(loc.latitude);
  }
  if (typeof loc.longitude === 'string') {
    loc.longitude = parseFloat(loc.longitude);
  }
  
  if (typeof loc.latitude !== 'number' || isNaN(loc.latitude)) {
    errors.push('latitude must be a number');
  }
  if (typeof loc.longitude !== 'number' || isNaN(loc.longitude)) {
    errors.push('longitude must be a number');
  }

  if (errors.length > 0) {
    throw new Error(`Location ${index + 1} validation failed: ${errors.join(', ')}`);
  }

  return loc as Location;
}

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    console.log('Received query:', query);

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a knowledgeable travel expert with deep understanding of global destinations, local cultures, and hidden gems.
          Your task is to suggest specific, real-world locations that match the user's interests while prioritizing:

          1. AUTHENTICITY
          - Focus on real, accessible locations
          - Prefer places with cultural or natural significance
          - Include both well-known and hidden gems
          
          2. DIVERSITY
          - Mix popular and off-the-beaten-path locations
          - Vary the types of experiences (nature, culture, activities)
          - Consider different accessibility levels
          
          3. ACCURACY
          - Use precise, verified coordinates
          - Include specific location names
          - Focus on factual, verifiable information
          
          4. RELEVANCE
          - Ensure all suggestions directly relate to the query
          - Consider seasonal factors if relevant
          - Account for the type of experience sought

          For each query, return exactly 4 locations in this JSON format:
          {
            "locations": [
              {
                "name": "Specific location name",
                "country": "Country name",
                "emoji": "Most relevant single emoji",
                "description": "Engaging, factual description (max 100 chars)",
                "rarity": "Rarity score (1-100, see guidelines)",
                "latitude": "Precise coordinate",
                "longitude": "Precise coordinate"
              }
            ]
          }

          Rarity Score Guidelines:
          90-100: True hidden gems, barely known even locally
          70-89: Known to locals, rare for tourists
          50-69: Popular locally, less known internationally
          30-49: Known tourist spot but not overcrowded
          1-29: Major tourist destination

          Remember:
          - Verify coordinates are accurate
          - Keep descriptions concise and factual
          - Use appropriate, specific emojis
          - Balance between accessibility and uniqueness
          - Consider safety and practicality`
        },
        {
          role: "user",
          content: `Find 4 fascinating locations for: ${query}`
        }
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    console.log('OpenAI response:', response);

    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const parsedResponse = JSON.parse(response);
    
    // Validate response structure
    if (!parsedResponse.locations || !Array.isArray(parsedResponse.locations)) {
      throw new Error('Invalid response format: missing locations array');
    }

    if (parsedResponse.locations.length !== 4) {
      throw new Error('Invalid response format: exactly 4 locations required');
    }

    // Validate and clean each location
    const validatedLocations = parsedResponse.locations.map(validateLocation);
    
    return NextResponse.json({ locations: validatedLocations });
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate locations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 