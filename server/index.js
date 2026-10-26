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
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Root informational endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'Gather & Co. API',
    description: 'AI-Powered Celebration & Event Planner Backend',
    status: 'operational',
    health: '/api/health',
    version: '1.0.0',
  });
});

// Health check
app.get('/api/health', (_req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
  res.json({ status: 'ok', geminiConfigured: hasKey });
});

// Utility to sanitize, trim, and length-limit user string inputs
function sanitizeString(str, maxLength = 200) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLength);
}

// Timeout wrapper for external AI API calls to guarantee response SLA
const DEFAULT_GEMINI_TIMEOUT_MS = 15000;
function callWithTimeout(promise, timeoutMs = DEFAULT_GEMINI_TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

// Generate event plan
app.post('/api/generate-plan', async (req, res) => {
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
  } = req.body || {};

  const cleanEventType = sanitizeString(eventType, 60);
  const cleanEventName = sanitizeString(eventName, 120);

  // Validate required fields
  if (!cleanEventType || !cleanEventName || guestCount === undefined || budget === undefined) {
    return res.status(400).json({
      error: 'Missing required fields: eventType, eventName, guestCount, and budget are required.',
    });
  }

  const numGuests = Number(guestCount);
  const numBudget = Number(budget);

  if (isNaN(numGuests) || numGuests < 1 || numGuests > 10000) {
    return res.status(400).json({ error: 'Guest count must be a number between 1 and 10,000.' });
  }

  if (isNaN(numBudget) || numBudget < 1000) {
    return res.status(400).json({ error: 'Budget must be at least ₹1,000.' });
  }

  if (numBudget > 1000000000) {
    return res.status(400).json({ error: 'Budget cannot exceed ₹100,00,00,000 (100 Crore).' });
  }

  const details = {
    eventType: cleanEventType,
    eventName: cleanEventName,
    date: sanitizeString(date, 50),
    time: sanitizeString(time, 50),
    city: sanitizeString(city, 100),
    guestCount: numGuests,
    budget: numBudget,
    theme: sanitizeString(theme, 120),
    foodPreferences: sanitizeString(foodPreferences, 100),
    dietaryRequirements: sanitizeString(dietaryRequirements, 200),
    accessibilityRequirements: sanitizeString(accessibilityRequirements, 200),
    additionalInstructions: sanitizeString(additionalInstructions, 500),
  };

  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyConfigured = apiKey && apiKey !== 'your_gemini_api_key_here';

  if (isKeyConfigured) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = buildPrompt(details);
      const result = await callWithTimeout(model.generateContent(prompt), 15000);
      const text = result.response.text();
      const plan = parseGeneratedPlan(text);

      return res.json({ plan, rawText: text, source: 'gemini' });
    } catch (err) {
      console.warn('Gemini API call failed, activating smart local plan generator:', err.message);
      // Gracefully fall back to smart local generator so the app is always functional
    }
  }

  // Smart fallback plan tailored to details
  const fallbackPlan = generateSmartFallbackPlan(details);
  return res.json({ plan: fallbackPlan, source: 'fallback' });
});

// Regenerate a single section
app.post('/api/regenerate-section', async (req, res) => {
  const { sectionKey, sectionTitle, eventDetails, currentContent } = req.body || {};

  const cleanSectionKey = sanitizeString(sectionKey, 50);
  const cleanSectionTitle = sanitizeString(sectionTitle, 80);

  if (!cleanSectionKey || !cleanSectionTitle || !eventDetails || typeof eventDetails !== 'object') {
    return res.status(400).json({ error: 'Missing required fields: sectionKey, sectionTitle, and eventDetails.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyConfigured = apiKey && apiKey !== 'your_gemini_api_key_here';

  if (isKeyConfigured) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `You are an expert event planner in India. Regenerate ONLY the "${cleanSectionTitle}" section for the following event.

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

      const result = await callWithTimeout(model.generateContent(prompt), 14000);
      const text = result.response.text();

      return res.json({ content: text });
    } catch (err) {
      console.warn('Gemini regenerate failed, using smart local regeneration:', err.message);
    }
  }

  const freshContent = regenerateSmartSection(cleanSectionKey, eventDetails);
  return res.json({ content: freshContent });
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

  const hasAnyContent = Object.values(sections).some(s => s.content.length > 0);
  if (!hasAnyContent) {
    sections.concept.content = text;
  }

  return sections;
}

function generateSmartFallbackPlan(details) {
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
  } = details;

  const loc = city || 'your chosen venue';
  const eventTheme = theme || 'Modern Elegance with Festive Accents';
  const formattedBudget = `₹${budget.toLocaleString('en-IN')}`;
  const perGuest = Math.round(budget / guestCount);
  const formattedPerGuest = `₹${perGuest.toLocaleString('en-IN')}`;
  const eventDateStr = date
    ? new Date(date).toLocaleDateString('en-IN', { dateStyle: 'full' })
    : 'Upcoming Celebration Date';
  const startTime = time || '6:30 PM';

  // Budget allocations
  const venueCost = Math.round(budget * 0.22);
  const cateringCost = Math.round(budget * 0.42);
  const decorCost = Math.round(budget * 0.16);
  const entertainmentCost = Math.round(budget * 0.08);
  const photoCost = Math.round(budget * 0.07);
  const contingencyCost = budget - (venueCost + cateringCost + decorCost + entertainmentCost + photoCost);

  return {
    concept: {
      title: 'Event Concept & Theme',
      icon: 'Sparkles',
      content: `## ${eventName} — Concept & Atmosphere ✨

**Theme Direction:** ${eventTheme}
**Setting:** ${loc}
**Atmosphere:** A warm, immersive, and joyful celebration curated for ${guestCount} guests. Designed to strike the perfect harmony between gracious hospitality and modern celebration aesthetics.

### Visual & Sensory Palette:
- **Primary Hues:** Royal Emerald, Rich Cream, and Warm Terracotta
- **Accents:** Lustrous Brass, Soft Amber Fairy Lighting, and Fresh Botanical Greenery
- **Aesthetic Mood:** Refined yet welcoming, celebrating connection with personalized touches throughout.

### Signature Highlights:
- 🌸 **Welcome Pathway:** A beautifully adorned arrival zone featuring floral urns and personalized welcome signage for ${eventName}.
- 🎶 **Curated Soundscape:** Ambient acoustic melodies transitioning to celebratory upbeat favorites as the evening unfolds.
- 📸 **Feature Memory Corner:** A bespoke photo wall with theme-tailored props celebrating this special milestone.
${additionalInstructions ? `\n> **Custom Note:** *${additionalInstructions}*` : ''}`,
    },
    schedule: {
      title: 'Event Schedule',
      icon: 'Clock',
      content: `## Event Day Run of Show ⏱️

**Date:** ${eventDateStr} | **Start Time:** ${startTime}

- **${startTime} – Door Opening & Welcome:** Guests arrive to soft background music, welcome drinks, and hand-passed hors d'oeuvres.
- **+45 Mins – Welcome Address & Toast:** Host welcome, introduction of the guest(s) of honor, and opening toast.
- **+1 Hr 15 Mins – Main Ceremony & Highlights:** The central celebratory moment for ${eventName}, including commemorative photos.
- **+1 Hr 45 Mins – Culinary Feast:** Full buffet service opens with live counters tailored for ${foodPreferences || 'our guests'}.
- **+2 Hrs 45 Mins – Interactive Entertainment:** Music, dancing, open floor, and celebration activities.
- **+3 Hrs 30 Mins – Sweet Farewell:** Dessert table, final thank-you speech, and personalized return gifts distribution.
- **Closing – Fond Memories:** Warm wrap-up and memorable departure.`,
    },
    budget: {
      title: 'Budget Breakdown',
      icon: 'IndianRupee',
      content: `## Itemized Budget Allocation 💰

**Total Budget:** ${formattedBudget} | **Guest Count:** ${guestCount} guests | **Per Guest:** ${formattedPerGuest}

| Category | Estimated Cost (₹) | Share | Details |
|---|---|---|---|
| **Catering & Beverages** | ₹${cateringCost.toLocaleString('en-IN')} | 42% | Multi-course buffet + welcome drinks for ${guestCount} guests |
| **Venue Rental & Setup** | ₹${venueCost.toLocaleString('en-IN')} | 22% | Prime event space rental with lighting & seating in ${loc} |
| **Decorations & Florals** | ₹${decorCost.toLocaleString('en-IN')} | 16% | Theme styling (${eventTheme}), stage setup & centerpieces |
| **Entertainment & Sound** | ₹${entertainmentCost.toLocaleString('en-IN')} | 8% | Sound system, microphone, curated DJ/music playlist |
| **Photography & Memories** | ₹${photoCost.toLocaleString('en-IN')} | 7% | Professional event coverage and candid moments |
| **Contingency & Incidentals** | ₹${contingencyCost.toLocaleString('en-IN')} | 5% | Buffer for emergency needs and vendor gratuities |
| **──────────────** | **──────────────** | **100%** | |
| **Total Estimated Spend** | **${formattedBudget}** | **100%** | **Matches your designated budget** |

> ℹ️ *Note: All figures are AI-generated market estimates for planning purposes. Always compare actual vendor quotes.*`,
    },
    menu: {
      title: 'Food & Menu',
      icon: 'UtensilsCrossed',
      content: `## Curated Celebration Menu 🍽️

**Food Style:** ${foodPreferences || 'Mixed (Veg & Non-Veg)'}
${dietaryRequirements ? `**Dietary Care:** ${dietaryRequirements}\n` : ''}
### 🍹 Welcome Drinks & Coolers
- **Refreshing Kokum & Mint Cooler**
- **Saffron Almond Thandai Shots**
- **Fresh Lime & Basil Sparkler**

### 🍢 Starters & Canapés
- **Paneer Tikka Angaar** with mint chutney
- **Crispy Corn & Water Chestnut Tartlets**
- **Dahi Ke Kebab** with pomegranate reduction
${foodPreferences?.includes('Non') ? '- **Murgh Malai Tikka** infused with cardamom & green chili\n- **Amritsari Fish Bites** with tarter twist' : ''}

### 🍛 Main Courses
- **Paneer Butter Masala** in velvety tomato gravy
- **Dal Makhani Slow-Simmered** overnight
- **Seasonal Vegetable Biryani** with burani raita
${foodPreferences?.includes('Non') ? '- **Dum Gosht Biryani** / **Butter Chicken Classic**\n' : ''}
- **Assorted Tandoori Breads** (Butter Naan, Laccha Paratha, Garlic Roti)

### 🍨 Decadent Desserts
- **Hot Gulab Jamun with Rabri Duo**
- **Kesar Pista Kulfi Falooda**
- **Fresh Cut Exotic Fruit Platter**`,
    },
    decorations: {
      title: 'Decorations & Setup',
      icon: 'Palette',
      content: `## Decor & Visual Design 🎨

**Theme:** ${eventTheme}

### 1. Entrance & Welcome Arch
- Elegant grand entry arch draped with ivory organza, eucalyptus greenery, and brass hanging bells.
- Calligraphy mirror welcome board displaying: *"Welcome to ${eventName}"*.

### 2. Main Stage & Focal Backdrop
- Geometric brass frames interwoven with marigolds, roses, and baby's breath.
- Soft back-lit warm halo illumination with cozy lounge seating.

### 3. Dining & Seating Design
- Tables styled with linen runners, scented floating candle bowls, and botanical place cards.
- Fairy-lit tree wraps and canopy string lighting to create an enchanting ambient glow.

### 4. Interactive Photo Corner
- Custom neon sign with theme motifs and instant print camera station for cherished guest souvenirs.`,
    },
    checklist: {
      title: 'Preparation Checklist',
      icon: 'CheckSquare',
      content: `## Step-by-Step Planning Checklist 📋

- **[4 Weeks Before]**: Confirm venue booking in ${loc} and finalize caterer agreement.
- **[3 Weeks Before]**: Send out digital invitations and track initial RSVPs.
- **[2 Weeks Before]**: Finalize menu selections and special dietary requirements.
- **[1 Week Before]**: Final headcount lock with caterer (${guestCount} guests) and venue walkthrough.
- **[3 Days Before]**: Reconfirm photographer, sound equipment, and decor team arrival times.
- **[1 Day Before]**: Prepare payment envelopes, emergency kit, and coordinate key family/host roles.
- **[Event Day]**: 3-hour pre-event venue inspection and setup sign-off!`,
    },
    invitation: {
      title: 'Invitation Message',
      icon: 'Mail',
      content: `## WhatsApp & Digital Invitation 💌

✨ *Together is our favorite place to be!* ✨

You are cordially invited to celebrate with us:

🎉 **${eventName}** 🎉

📅 **Date:** ${eventDateStr}
⏰ **Time:** ${startTime}
📍 **Venue:** ${loc}
🎨 **Theme & Dress Code:** ${eventTheme}

Your presence and blessings will make our celebration complete!

Kindly RSVP by sending a quick message to the host.
We cannot wait to celebrate together! 🥂💐`,
    },
    risks: {
      title: 'Risks & Backup Plans',
      icon: 'Shield',
      content: `## Risk Mitigation & Contingency Protocols 🛡️

- **Weather Fluctuations:** If any outdoor elements are planned, ensure venue has sheltered verandas or quick-deploy canopies.
- **Guest Count Variance (+/- 15%):** Caterer requested to keep a 10% buffer food supply over ${guestCount} guests.
- **Power & Audio Glitches:** Venue verified for backup generator (DG set) and auxiliary microphones.
- **Dietary Safety:** Clear allergy tags placed on the buffet line${dietaryRequirements ? ` for (${dietaryRequirements})` : ''}.
- **Emergency Reserve:** 5% of total budget held in reserve (₹${contingencyCost.toLocaleString('en-IN')}) for last-minute adjustments.`,
    },
  };
}

function regenerateSmartSection(sectionKey, eventDetails) {
  const { eventName, city, guestCount, budget, theme, foodPreferences } = eventDetails;
  const loc = city || 'the celebration venue';

  switch (sectionKey) {
    case 'concept':
      return `## Re-imagined Concept & Theme: ${eventName} ✨\n\n**Fresh Aesthetic Direction:** A contemporary celebration blending understated luxury with festive warmth.\n\n### Core Design Pillars:\n- **Lighting:** Cascading micro-fairy lights and brass Moroccan lanterns.\n- **Colors:** Warm champagne gold, forest emerald, and soft blush rose.\n- **Signature Moment:** A memorable collective cheer and commemorative toast customized for ${eventName}.\n- **Guest Engagement:** Live acoustic melodies and an interactive memory box where guests leave handwritten notes.`;

    case 'schedule':
      return `## Refined Event Schedule ⏱️\n\n- **6:00 PM** — Guest arrival, signature mocktails, and live jazz/flute melodies\n- **6:45 PM** — Welcome address & commemorative milestone video tribute\n- **7:15 PM** — Special ceremony & focal celebration moment for ${eventName}\n- **7:45 PM** — Grand culinary buffet opens with live chef stations\n- **8:45 PM** — Dance floor kicks off with curated party favorites\n- **10:00 PM** — Warm dessert finale and departure favors for ${guestCount} guests`;

    case 'budget':
      return `## Optimized Budget Rebalance (₹${budget?.toLocaleString('en-IN')}) 💰\n\n- **Food & Catering (40%):** ₹${Math.round(budget * 0.4).toLocaleString('en-IN')} (High-grade buffet with appetizers)\n- **Venue & Lighting (25%):** ₹${Math.round(budget * 0.25).toLocaleString('en-IN')} (Spacious space in ${loc})\n- **Floral Decor & Ambience (18%):** ₹${Math.round(budget * 0.18).toLocaleString('en-IN')} (Fresh seasonal flowers and lanterns)\n- **Photography & Sound (12%):** ₹${Math.round(budget * 0.12).toLocaleString('en-IN')} (Pro shots and crystal sound)\n- **Buffer & Gratuities (5%):** ₹${Math.round(budget * 0.05).toLocaleString('en-IN')} (Last minute incidentals)`;

    case 'menu':
      return `## Gourmet Re-designed Menu 🍲\n\n**Style:** ${foodPreferences || 'Chef Special Selection'}\n\n### Beverages & Starters\n- Lychee Lemongrass Sparkler & Spiced Guava Punch\n- Truffle Mushroom Galouti with saffron sheermal\n- Paneer Tikka with basil and roasted garlic\n- Amritsari Crispy Bites with mint coriander emulsion\n\n### Main Entrees\n- Paneer Lababdar in slow-cooked cashew gravy\n- Dal Bukhara cooked on charcoal fire\n- Fragrant Awadhi Dum Biryani with pomegranate raita\n- Assorted freshly baked tandoori breads\n\n### Grand Finale\n- Warm Shahi Tukda with pistachio crumbles\n- Belgian Chocolate Kulfi Sticks`;

    case 'decorations':
      return `## Updated Decor Styling 🌺\n\n- **Entry:** Mirrored welcome easel framed with fresh tuberoses and baby's breath.\n- **Focal Stage:** Arch of circular brass rings filled with white lilies, marigolds, and warm backlighting.\n- **Tables:** Rustic wood chargers, velvet forest green napkins, and miniature brass vases with fresh blooms.\n- **Photobooth:** Cozy Bohemian floral bench with customized glowing neon sign celebrating ${eventName}.`;

    case 'invitation':
      return `## Premium WhatsApp Invitation 💌\n\n✨ *Celebrations are best shared with the people we cherish most!* ✨\n\nWe warmly invite you to join us for:\n\n🌟 **${eventName}** 🌟\n\n📍 **Location:** ${loc}\n👥 **Honored Guests:** ${guestCount}\n👗 **Dress Inspiration:** Festive Chic\n\nYour presence will make this celebration truly extraordinary!\nKindly confirm your presence by RSVPing to this message. See you there! 🥂`;

    default:
      return `## Enhanced ${sectionKey.toUpperCase()} for ${eventName}\n\nCustomized specifically for your celebration in ${loc} with ${guestCount} guests and budget of ₹${budget?.toLocaleString('en-IN')}.`;
  }
}

// 404 handler for unmatched API routes
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Centralized error handler to prevent internal trace leakage
app.use((err, _req, res, _next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error. Please try again later.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✨ Celebration & Event Planner API running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
    if (!hasKey) {
      console.log('   ⚠️  GEMINI_API_KEY not configured. Smart plan generator is active.');
    }
  });
}

module.exports = {
  app,
  sanitizeString,
  callWithTimeout,
  buildPrompt,
  parseGeneratedPlan,
  generateSmartFallbackPlan,
  regenerateSmartSection,
};

