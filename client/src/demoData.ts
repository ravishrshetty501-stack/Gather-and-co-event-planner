import type { EventDetails, EventPlan } from './types';

export const DEMO_EVENT_DETAILS: EventDetails = {
  eventType: 'Birthday Party',
  eventName: 'Aarav\'s 25th Birthday Bash',
  date: '2026-12-15',
  time: '18:00',
  city: 'Bangalore',
  guestCount: 80,
  budget: 150000,
  theme: 'Bollywood Retro Night',
  foodPreferences: 'Mixed (Veg & Non-Veg)',
  dietaryRequirements: 'Some guests are vegetarian, one guest has nut allergy',
  accessibilityRequirements: 'Ground floor venue preferred',
  additionalInstructions: 'Include a surprise cake cutting moment and karaoke setup',
};

export const DEMO_PLAN: EventPlan = {
  concept: {
    title: 'Event Concept & Theme',
    content: `## Bollywood Retro Night — Aarav's 25th Birthday Bash 🎬🎉

**Mood & Aesthetic:** A vibrant, nostalgic journey through iconic Bollywood eras — from the golden age of the 70s to the glamorous 90s. Think dazzling disco balls, retro Bollywood posters, neon accents against rich jewel tones, and an atmosphere that makes every guest feel like a star walking the red carpet.

**Color Palette:**
- **Primary:** Deep Royal Purple & Midnight Black
- **Accent:** Shimmering Gold, Electric Pink & Neon Orange
- **Neutral:** Cream White for table settings

**Theme Integration:**
- 🎭 Welcome arch styled like a classic Bollywood film set entrance
- 🎵 Retro Bollywood playlist spanning 70s-90s hits
- 📸 Bollywood photo props — wigs, oversized sunglasses, film clapboards
- 🍿 Movie-poster-style invitation and signage featuring Aarav as the "Birthday Star"
- 🪩 Central dance floor with disco ball and colored spotlights
- 🎤 Karaoke corner with curated Bollywood classics playlist

This concept ties together food, decor, entertainment, and ambiance into a cohesive celebration that's personal, fun, and unforgettable.`,
    icon: 'Sparkles',
  },
  schedule: {
    title: 'Event Schedule',
    content: `## Event Day Timeline

**5:00 PM** — Venue setup complete, final walkthrough with decorator and caterer

**6:00 PM** — Doors open! Red carpet welcome with retro Bollywood music playing. Welcome drink station active.

**6:00 – 6:45 PM** — Guest arrival & mingling. Photo booth opens. Welcome mocktails and starters served.

**6:45 – 7:00 PM** — Host welcome speech. Fun slideshow of Aarav's life highlights on the projector.

**7:00 – 7:30 PM** — Bollywood trivia game & fun competition rounds. Small prizes for winners.

**7:30 – 8:00 PM** — 🎂 **Surprise Cake Cutting Ceremony** — Lights dim, Bollywood entry song plays, confetti shower as Aarav cuts the cake.

**8:00 – 8:45 PM** — Dinner service begins (buffet style). Background music continues.

**8:45 – 9:30 PM** — 🎤 **Karaoke Session** — Guests take turns singing Bollywood classics. Best performance wins a fun trophy.

**9:30 – 10:15 PM** — Open dance floor! DJ plays a curated mix of retro and modern Bollywood bangers.

**10:15 – 10:30 PM** — Thank-you speech by Aarav. Return gift distribution at the exit.

**10:30 PM** — Event winds down. Cleanup begins.`,
    icon: 'Clock',
  },
  budget: {
    title: 'Budget Breakdown',
    content: `## Detailed Budget Breakdown (All Prices are Estimates)

| Category | Estimated Cost (₹) | Notes |
|---|---|---|
| **Venue Rental** | ₹25,000 | Banquet hall / party space in Bangalore (4-5 hours) |
| **Catering & Beverages** | ₹56,000 | ₹700 per guest × 80 guests (buffet style) |
| **Decorations & Flowers** | ₹18,000 | Bollywood theme decor, disco ball, LED lights, balloons |
| **Birthday Cake** | ₹4,500 | Custom 3-tier Bollywood-themed cake |
| **DJ / Sound & Karaoke Setup** | ₹12,000 | DJ + karaoke machine rental with microphones |
| **Photography** | ₹10,000 | 4-hour coverage with candid shots |
| **Photo Booth & Props** | ₹5,000 | Props, backdrop, instant prints |
| **Games & Prizes** | ₹3,000 | Trivia prizes, karaoke trophy |
| **Invitations & Stationery** | ₹2,000 | Digital invitations + printed welcome signage |
| **Return Gifts** | ₹6,000 | ₹75 per guest — small personalized keepsakes |
| **Miscellaneous & Contingency** | ₹8,500 | Transport, tips, last-minute needs (~6%) |
| **──────────** | **──────────** | |
| **Total Estimated Cost** | **₹1,50,000** | **Within the stated budget of ₹1,50,000** |

### Budget Assessment
✅ **The plan fits within the ₹1,50,000 budget.** The per-guest spend is approximately ₹1,875, which is reasonable for a themed birthday party in Bangalore.

> ⚠️ **Disclaimer:** All prices are estimates based on typical market rates in Bangalore. Actual costs may vary based on venue, season, and specific vendor pricing. We recommend getting at least 2-3 quotes for each category.`,
    icon: 'IndianRupee',
  },
  menu: {
    title: 'Food & Menu',
    content: `## Complete Menu Plan

### 🍹 Welcome Drinks (6:00 – 6:45 PM)
- **Virgin Mojito** (Mint & Lime)
- **Mango Lassi Shots**
- **Masala Nimbu Pani** (Spiced Lemonade)
- **Rooh Afza Sherbet** (the retro Bollywood touch!)

### 🥗 Starters (Served with Welcome Drinks)
**Vegetarian:**
- Paneer Tikka Skewers
- Corn & Cheese Balls
- Mini Dahi Puri Shots
- Crispy Veg Spring Rolls

**Non-Vegetarian:**
- Chicken Malai Tikka
- Fish Amritsari Bites
- Mutton Seekh Kebab Mini

> ⚠️ **Nut-free section clearly labeled** for the guest with nut allergy. Kitchen to be informed.

### 🍛 Main Course (Buffet — 8:00 PM)
**Vegetarian:**
- Dal Makhani
- Paneer Butter Masala
- Seasonal Veg Biryani (Nut-free)
- Mixed Veg Kolhapuri
- Naan & Lachha Paratha

**Non-Vegetarian:**
- Butter Chicken
- Mutton Rogan Josh
- Chicken Biryani (Hyderabadi Style)

**Accompaniments:**
- Raita (Boondi & Cucumber)
- Green Salad & Pickles
- Steamed Jeera Rice

### 🍰 Desserts
- Custom 3-tier Birthday Cake (Chocolate & Vanilla)
- Gulab Jamun Live Counter
- Ras Malai
- Assorted Pastries & Brownies (nut-free options available)
- Ice Cream (Kulfi Variety)

### ☕ Beverages (Throughout)
- Tea & Coffee Station
- Soft Drinks & Packaged Water
- Fresh Fruit Juice`,
    icon: 'UtensilsCrossed',
  },
  decorations: {
    title: 'Decorations & Setup',
    content: `## Bollywood Retro Night Decor Plan

### 🚪 Entrance & Welcome Area
- **Red Carpet** runway from entrance to main hall
- **Bollywood Film Set Arch** — wooden frame styled like a director's clapboard with "Aarav's 25th — Take 1" written on it
- **Welcome Signage** — retro Bollywood movie poster style featuring Aarav's photo
- **Golden balloon pillars** flanking the entrance

### 🎪 Main Event Area
- **Color Scheme:** Purple, gold, black with neon pink accents
- **Ceiling:** Draped purple and gold fabric with fairy light cascading
- **Walls:** Large retro Bollywood movie posters (printed on flex banners)
- **Tables:** Black tablecloths with gold sequin runners, small potted marigolds as centerpieces
- **Chair covers:** Black with purple satin sashes

### 🎭 Stage / Focal Point
- **Backdrop:** "Aarav's 25th Birthday Bash" in large golden letters on a purple sequin backdrop
- **Disco Ball** suspended above the stage area
- **LED spotlights** in purple and gold cycling patterns
- **Karaoke setup** with two wireless microphones and a display screen

### 💡 Lighting
- **Main Lights:** Dimmed warm white for ambiance
- **Accent Lights:** Purple and gold LED uplighters along walls
- **Dance Floor:** Color-changing LED floor lights + disco ball reflections
- **Table Candles:** LED tea lights in golden holders (safe for indoor use)

### 📸 Photo Booth Corner
- **Backdrop:** Gold shimmer curtain with large "25" foil balloons
- **Props:** Bollywood wigs, oversized sunglasses, movie clapboards, dialogue boards with famous Bollywood quotes
- **Instant Print Station:** Guests can take photos and get instant prints as keepsakes

### 🌸 Flowers & Accents
- Marigold garlands along the entrance arch
- Mixed flower arrangements (roses, chrysanthemums) in gold vases on buffet table
- Petal scatter on the cake table`,
    icon: 'Palette',
  },
  checklist: {
    title: 'Preparation Checklist',
    content: `## Prioritized Preparation Checklist

### 📋 Planning Phase (6–8 Weeks Before — by Nov 1)
- [ ] Finalize guest list and collect dietary requirements
- [ ] Shortlist 3 venue options and visit them
- [ ] Set final budget allocation per category
- [ ] Create event schedule and share with close family/friends helping out
- [ ] Start designing the Bollywood theme concept — color palette, mood boards

### 📞 Booking Phase (4–6 Weeks Before — by Nov 15)
- [ ] **Book venue** — confirm date, time, advance payment
- [ ] **Book caterer** — finalize menu, discuss nut-allergy protocols, do a tasting if possible
- [ ] **Book DJ / Karaoke provider** — share Bollywood playlist preferences
- [ ] **Book photographer** — discuss candid style, group photo schedule
- [ ] **Order the custom cake** — share Bollywood theme reference images
- [ ] **Book decorator** — share mood board and specific requirements

### 🎨 Preparation Phase (2–4 Weeks Before — by Dec 1)
- [ ] Send out digital invitations (WhatsApp + Instagram story)
- [ ] Track RSVPs — follow up with non-responders
- [ ] Order return gifts and personalize them
- [ ] Buy/order photo booth props and Bollywood accessories
- [ ] Prepare slideshow of Aarav's life highlights
- [ ] Curate the karaoke song list
- [ ] Plan games & trivia questions, buy small prizes

### 📦 Final Week (Dec 8–14)
- [ ] Confirm all vendors — venue, caterer, DJ, photographer, decorator
- [ ] Prepare welcome speech notes
- [ ] Finalize seating arrangement if needed
- [ ] Pack return gifts
- [ ] Charge all devices, test slideshow on the projector
- [ ] Prepare an emergency kit (safety pins, tape, markers, phone chargers)
- [ ] Assign roles to friends/family helping on the day

### 🎉 Event Day (Dec 15)
- [ ] Arrive at venue by 3:00 PM for setup supervision
- [ ] Decorator setup: 3:00 – 5:00 PM
- [ ] Sound check DJ & karaoke: 4:30 PM
- [ ] Caterer setup: 4:30 – 5:30 PM
- [ ] Final walkthrough: 5:00 – 5:30 PM
- [ ] Photo booth ready: 5:30 PM
- [ ] Doors open: 6:00 PM 🚀`,
    icon: 'CheckSquare',
  },
  invitation: {
    title: 'Invitation Message',
    content: `## WhatsApp / Digital Invitation

---

🎬✨ **Lights, Camera, BIRTHDAY!** ✨🎬

**You're invited to the biggest blockbuster of the year!**

🌟 *Aarav's 25th Birthday Bash* 🌟
**Theme: Bollywood Retro Night** 🪩

📅 **Date:** Saturday, December 15, 2026
⏰ **Time:** 6:00 PM onwards
📍 **Venue:** Bangalore (exact address to follow)

🎭 **Dress Code:** Channel your favorite Bollywood star! Retro, glamorous, or just fabulous — come as you are!

🍽️ **Dinner, Music, Karaoke & Dancing** — it's going to be one for the ages!

💫 Come celebrate this milestone with good food, great music, and even greater company. Let's make Aarav's 25th unforgettable!

**RSVP by December 8th:**
📱 Call/WhatsApp: [Your Number]
💌 Reply to this message with 👍

*Please let us know about any dietary requirements when you RSVP.*

See you on the red carpet! 🎉🥳

---

*Feel free to customize the venue address, contact number, and any other details before sending.*`,
    icon: 'Mail',
  },
  risks: {
    title: 'Risks & Backup Plans',
    content: `## Potential Risks & Mitigation Strategies

### 🌧️ Weather Contingencies
- **Risk:** Rain on event day affecting outdoor elements or guest travel
- **Mitigation:** Book an indoor venue (banquet hall). Keep umbrellas at the entrance. Have a WhatsApp group to update guests about any weather-related changes.

### 🚫 Vendor No-Shows
- **Risk:** Caterer, DJ, or decorator doesn't show up or cancels last minute
- **Mitigation:**
  - Get written confirmations from all vendors 1 week before
  - Have backup contacts for each vendor category
  - Keep a ₹5,000 emergency fund for last-minute replacements
  - For DJ backup: prepare a Spotify/YouTube Music playlist on a Bluetooth speaker

### 💰 Budget Overruns
- **Risk:** Costs exceed the ₹1,50,000 budget
- **Mitigation:**
  - Track all expenses in a spreadsheet from day one
  - Negotiate fixed-price packages (not per-item billing) with caterer and decorator
  - The contingency fund (₹8,500) covers ~6% overrun
  - If needed, reduce return gift cost or simplify decorations

### 👥 Guest Count Changes
- **Risk:** More or fewer guests than expected (±15-20)
- **Mitigation:**
  - Confirm RSVP by Dec 8, follow up with non-responders
  - Inform caterer of final count by Dec 12 (most allow ±10% adjustment)
  - Extra 5 plates buffer in catering order

### ⚡ Technical Failures
- **Risk:** Sound system, projector, or lights malfunction
- **Mitigation:**
  - Do a full sound check at 4:30 PM
  - Keep a portable Bluetooth speaker as backup
  - Have the slideshow on a USB drive AND a phone
  - Keep extra extension cords, batteries, and a power bank

### 🍽️ Food-Related Issues
- **Risk:** Allergic reactions (especially nut allergy), food running out, or quality issues
- **Mitigation:**
  - Brief the caterer about the nut allergy in writing — separate preparation area
  - Label all dishes clearly (Veg/Non-Veg/Contains Nuts)
  - Order for 85 guests (5 extra) to avoid shortage
  - Do a tasting session 2 weeks before to verify quality

### 🎂 Cake Issues
- **Risk:** Cake damaged during transport or design doesn't match expectations
- **Mitigation:**
  - Use a reputed baker with delivery service
  - Have the cake delivered by 4:00 PM (2 hours before event)
  - Keep a backup simple cake from a nearby bakery as insurance
  - Share a clear reference image with the baker and get a preview photo`,
    icon: 'Shield',
  },
};
