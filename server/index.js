const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
  res.json({ status: 'ok', geminiConfigured: hasKey });
});

// Generate event plan
app.post('/api/generate-plan', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.status(400).json({
        error: 'Gemini API key not configured. Please set GEMINI_API_KEY in the .env file.',
      });
    }

    const {
      eventType,
      eventName,
      date,
      time,
      city,
      guestCount,
      budget,
      theme,
      foodPreferences,
      dietaryRequirements,
      accessibilityRequirements,
      additionalInstructions,
    } = req.body;

    // Validate required fields
    if (!eventType || !eventName || !guestCount || !budget) {
      return res.status(400).json({
        error: 'Missing required fields: eventType, eventName, guestCount, and budget are required.',
      });
    }

    if (typeof guestCount !== 'number' || guestCount < 1 || guestCount > 10000) {
      return res.status(400).json({ error: 'Guest count must be between 1 and 10,000.' });
    }

    if (typeof budget !== 'number' || budget < 1000) {
      return res.status(400).json({ error: 'Budget must be at least ₹1,000.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = buildPrompt({
      eventType, eventName, date, time, city, guestCount, budget,
      theme, foodPreferences, dietaryRequirements, accessibilityRequirements,
      additionalInstructions,
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the structured response
    const plan = parseGeneratedPlan(text);

    res.json({ plan, rawText: text });
  } catch (err) {
    console.error('Error generating plan:', err);

    if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('API key')) {
      return res.status(401).json({ error: 'Invalid Gemini API key. Please check your .env file.' });
    }
    if (err.message?.includes('QUOTA') || err.message?.includes('quota')) {
      return res.status(429).json({ error: 'API quota exceeded. Please try again later.' });
    }

    res.status(500).json({ error: 'Failed to generate event plan. Please try again.' });
  }
});

// Regenerate a single section
app.post('/api/regenerate-section', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.status(400).json({
        error: 'Gemini API key not configured.',
      });
    }

    const { sectionKey, sectionTitle, eventDetails, currentContent } = req.body;

    if (!sectionKey || !sectionTitle || !eventDetails) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `You are an expert event planner in India. Regenerate ONLY the "${sectionTitle}" section for the following event.

Event Details:
- Type: ${eventDetails.eventType}
- Name: ${eventDetails.eventName}
- Date: ${eventDetails.date || 'Not specified'}
- Time: ${eventDetails.time || 'Not specified'}
- City/Venue: ${eventDetails.city || 'Not specified'}
- Guests: ${eventDetails.guestCount}
- Budget: ₹${eventDetails.budget?.toLocaleString('en-IN')}
- Theme: ${eventDetails.theme || 'Not specified'}
- Food Preferences: ${eventDetails.foodPreferences || 'Not specified'}
- Dietary Requirements: ${eventDetails.dietaryRequirements || 'None'}
- Accessibility: ${eventDetails.accessibilityRequirements || 'None'}
- Additional Instructions: ${eventDetails.additionalInstructions || 'None'}

Current content to improve upon:
${currentContent || 'None'}

Please provide a fresh, creative, and detailed version of this section. Use Indian Rupees (₹) for all prices. All prices are estimates only. Do not invent real vendor names or claim verified availability. Keep it practical and within the budget.

Return ONLY the content for this section, formatted with markdown headings, bullet points, and clear structure. Do not include the section title itself as a heading.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ content: text });
  } catch (err) {
    console.error('Error regenerating section:', err);
    res.status(500).json({ error: 'Failed to regenerate section. Please try again.' });
  }
});

function buildPrompt(details) {
  return `You are an expert event planner based in India with deep knowledge of Indian celebrations, venues, caterers, decorators, and cultural traditions. Generate a comprehensive, practical event plan based on the following details.

EVENT DETAILS:
- Event Type: ${details.eventType}
- Event Name: ${details.eventName}
- Date: ${details.date || 'To be decided'}
- Time: ${details.time || 'To be decided'}
- City/Venue: ${details.city || 'Not specified'}
- Number of Guests: ${details.guestCount}
- Total Budget: ₹${details.budget.toLocaleString('en-IN')}
- Theme/Atmosphere: ${details.theme || 'Elegant and tasteful'}
- Food Preferences: ${details.foodPreferences || 'Mixed (veg and non-veg)'}
- Dietary Requirements: ${details.dietaryRequirements || 'None specified'}
- Accessibility Requirements: ${details.accessibilityRequirements || 'None specified'}
- Additional Instructions: ${details.additionalInstructions || 'None'}

IMPORTANT RULES:
1. All prices MUST be in Indian Rupees (₹) and clearly marked as ESTIMATES.
2. Do NOT invent real vendor names, real business names, or claim verified availability.
3. If the budget seems insufficient for the requested scale, clearly flag this and suggest adjustments.
4. Keep suggestions practical and culturally appropriate for India.
5. Per-guest budget is approximately ₹${Math.round(details.budget / details.guestCount).toLocaleString('en-IN')}.

Generate the plan in the following EXACT format with these section markers. Each section must start with the exact marker shown:

===CONCEPT===
Provide a compelling event concept and theme description. Include mood, aesthetic direction, color palette suggestions, and how the theme ties together all elements. Be creative and specific.

===SCHEDULE===
Create a detailed event-day timeline with specific time slots. Include:
- Setup and preparation times
- Guest arrival and welcome
- Key ceremony/activity moments
- Food service timing
- Entertainment segments
- Closing and cleanup
Format each entry as: **[Time]** - Activity description

===BUDGET===
Provide a detailed budget breakdown. Include:
- Venue rental (estimated)
- Catering and beverages
- Decorations and flowers
- Entertainment/DJ/music
- Photography/videography
- Invitations and stationery
- Miscellaneous and contingency (10-15%)
- Total estimated cost
Flag if total exceeds the given budget. Show each item with ₹ amount.

===MENU===
Suggest a complete menu appropriate for the event type, guest count, and food preferences. Include:
- Welcome drinks and starters
- Main course options
- Desserts and sweets
- Beverages
Consider dietary requirements mentioned. Suggest both premium and budget-friendly options.

===DECORATIONS===
Describe decoration and setup ideas. Include:
- Entrance and welcome area
- Main event area
- Stage/focal point design
- Table settings
- Lighting suggestions
- Photo booth/corner ideas
- Flower and color scheme details

===CHECKLIST===
Create a prioritized preparation checklist with deadlines relative to the event date. Format as:
- **[X weeks/days before]**: Task description
Group into: Planning phase, Booking phase, Preparation phase, Final week, Event day

===INVITATION===
Write a warm, culturally appropriate invitation message that can be sent via WhatsApp or printed. Include:
- Greeting
- Event details (name, date, time, venue)
- RSVP information
- Any dress code or theme hints
Make it personal and festive.

===RISKS===
Identify potential risks and provide backup plans:
- Weather contingencies
- Vendor no-shows
- Budget overruns
- Guest count changes
- Technical failures
- Food-related issues
For each risk, provide a practical mitigation strategy.

Remember: All prices are ESTIMATES only. Do not claim any prices are verified or guaranteed.`;
}

function parseGeneratedPlan(text) {
  const sections = {
    concept: { title: 'Event Concept & Theme', content: '', icon: 'Sparkles' },
    schedule: { title: 'Event Schedule', content: '', icon: 'Clock' },
    budget: { title: 'Budget Breakdown', content: '', icon: 'IndianRupee' },
    menu: { title: 'Food & Menu', content: '', icon: 'UtensilsCrossed' },
    decorations: { title: 'Decorations & Setup', content: '', icon: 'Palette' },
    checklist: { title: 'Preparation Checklist', content: '', icon: 'CheckSquare' },
    invitation: { title: 'Invitation Message', content: '', icon: 'Mail' },
    risks: { title: 'Risks & Backup Plans', content: '', icon: 'Shield' },
  };

  const markers = {
    '===CONCEPT===': 'concept',
    '===SCHEDULE===': 'schedule',
    '===BUDGET===': 'budget',
    '===MENU===': 'menu',
    '===DECORATIONS===': 'decorations',
    '===CHECKLIST===': 'checklist',
    '===INVITATION===': 'invitation',
    '===RISKS===': 'risks',
  };

  const markerOrder = Object.keys(markers);

  for (let i = 0; i < markerOrder.length; i++) {
    const currentMarker = markerOrder[i];
    const nextMarker = markerOrder[i + 1];
    const sectionKey = markers[currentMarker];

    const startIdx = text.indexOf(currentMarker);
    if (startIdx === -1) continue;

    const contentStart = startIdx + currentMarker.length;
    let contentEnd = text.length;

    if (nextMarker) {
      const nextIdx = text.indexOf(nextMarker);
      if (nextIdx !== -1) {
        contentEnd = nextIdx;
      }
    }

    sections[sectionKey].content = text.slice(contentStart, contentEnd).trim();
  }

  // If parsing failed entirely, put everything in concept
  const hasAnyContent = Object.values(sections).some(s => s.content.length > 0);
  if (!hasAnyContent) {
    sections.concept.content = text;
  }

  return sections;
}

app.listen(PORT, () => {
  console.log(`✨ Celebration & Event Planner API running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
  if (!hasKey) {
    console.log('   ⚠️  GEMINI_API_KEY not configured. Create a .env file in the project root.');
  }
});
