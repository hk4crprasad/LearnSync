// Question bank with multiple variations for dynamic gameplay

export interface QuestionTemplate {
  scenario: string;
  options: {
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
}

export const questionBanks: Record<string, Record<string, QuestionTemplate[]>> = {
  "Story Adventure": {
    Easy: [
      // Set 1
      {
        scenario: "🐔 Your WiFi Chicken is hungry and tweeting memes! What should you feed it?",
        options: [
          { text: "🌽 Magic corn with sprinkles", isCorrect: true, feedback: "Yes! The chickens LOVE sparkly corn!" },
          { text: "🎮 Video game controllers", isCorrect: false, feedback: "Chickens can't play games silly!" },
          { text: "🍕 Cold pizza", isCorrect: false, feedback: "Chickens don't like pizza!" }
        ]
      },
      {
        scenario: "🦸 The talking tree needs help! How can you save the forest?",
        options: [
          { text: "🌳 Plant magic seeds everywhere!", isCorrect: true, feedback: "Yes! Magic seeds grow super fast!" },
          { text: "🍔 Feed it hamburgers", isCorrect: false, feedback: "Trees don't eat burgers!" },
          { text: "📺 Show it cartoons", isCorrect: false, feedback: "Trees prefer sunshine!" }
        ]
      },
      {
        scenario: "🎨 The robot artist wants to paint! What colors should it mix?",
        options: [
          { text: "🌈 All the rainbow colors!", isCorrect: true, feedback: "Beautiful rainbow art!" },
          { text: "⚫ Only black", isCorrect: false, feedback: "Too dark and boring!" },
          { text: "🤍 Only white", isCorrect: false, feedback: "Too plain!" }
        ]
      },
      {
        scenario: "🏰 Building a castle! What should go inside?",
        options: [
          { text: "🎪 Fun play areas for everyone!", isCorrect: true, feedback: "Everyone can play there!" },
          { text: "👑 Only rooms for kings", isCorrect: false, feedback: "But what about the friends?" },
          { text: "🔒 Secret locked doors", isCorrect: false, feedback: "No fun if locked!" }
        ]
      },
      {
        scenario: "🍋 Your lemonade stand is popular! How do you serve more customers?",
        options: [
          { text: "👥 Get friends to help!", isCorrect: true, feedback: "Teamwork makes it faster!" },
          { text: "😴 Take a nap instead", isCorrect: false, feedback: "Customers are waiting!" },
          { text: "🏃 Run really fast", isCorrect: false, feedback: "You'll get tired!" }
        ]
      },
      // Set 2 - New variations
      {
        scenario: "🐶 A puppy found a treasure map! Where should you start looking?",
        options: [
          { text: "🗺️ Follow the map carefully!", isCorrect: true, feedback: "Smart thinking! Maps show the way!" },
          { text: "🕳️ Dig random holes everywhere", isCorrect: false, feedback: "That's too messy!" },
          { text: "🛋️ Stay on the couch", isCorrect: false, feedback: "No treasure on the couch!" }
        ]
      },
      {
        scenario: "🦋 Butterflies are having a party! What should you bring?",
        options: [
          { text: "🌺 Beautiful flowers!", isCorrect: true, feedback: "Butterflies love flowers!" },
          { text: "🔊 Loud music speakers", isCorrect: false, feedback: "Too noisy for butterflies!" },
          { text: "🌧️ Rain clouds", isCorrect: false, feedback: "Butterflies don't like rain!" }
        ]
      },
      {
        scenario: "🚀 Building a rocket ship! What's most important?",
        options: [
          { text: "🔧 Strong and safe parts!", isCorrect: true, feedback: "Safety first in space!" },
          { text: "🎨 Pretty stickers only", isCorrect: false, feedback: "Need more than looks!" },
          { text: "🍬 Candy fuel", isCorrect: false, feedback: "Candy doesn't power rockets!" }
        ]
      },
      {
        scenario: "🎪 The circus needs a new act! What's your idea?",
        options: [
          { text: "🤹 Amazing juggling show!", isCorrect: true, feedback: "People love juggling!" },
          { text: "😴 Sleeping contest", isCorrect: false, feedback: "Too boring for circus!" },
          { text: "📱 Phone scrolling", isCorrect: false, feedback: "Not exciting at all!" }
        ]
      },
      {
        scenario: "🎂 Baking a magic cake! What's the secret ingredient?",
        options: [
          { text: "💝 Love and care!", isCorrect: true, feedback: "The best ingredient ever!" },
          { text: "🧦 Old socks", isCorrect: false, feedback: "Gross! Not for eating!" },
          { text: "📦 Cardboard boxes", isCorrect: false, feedback: "Can't eat cardboard!" }
        ]
      }
    ],
    Medium: [
      // Set 1
      {
        scenario: "🌾 A farmer needs help choosing smart technology. What do you recommend?",
        options: [
          { text: "📱 Smartphone for daily tasks", isCorrect: true, feedback: "Perfect! Smartphones help farmers stay connected." },
          { text: "💻 Laptop for data analysis", isCorrect: false, feedback: "Too complex for basic farm tasks." },
          { text: "📺 Television for entertainment", isCorrect: false, feedback: "Not useful for farming work." }
        ]
      },
      {
        scenario: "🌍 Your community needs an eco-project. What's your first step?",
        options: [
          { text: "📊 Survey community needs", isCorrect: true, feedback: "Great planning! Understanding needs comes first." },
          { text: "💰 Ask for donations immediately", isCorrect: false, feedback: "Need a plan before fundraising." },
          { text: "🏗️ Start building right away", isCorrect: false, feedback: "Planning prevents mistakes." }
        ]
      },
      {
        scenario: "🎭 Your interactive art needs feedback. Who do you ask first?",
        options: [
          { text: "🎨 Art community members", isCorrect: true, feedback: "Artists give valuable insights!" },
          { text: "👨‍💼 Business investors", isCorrect: false, feedback: "Artists understand art better than investors." },
          { text: "🤖 AI algorithms only", isCorrect: false, feedback: "Human creativity matters more." }
        ]
      },
      {
        scenario: "🏗️ Designing a community space. What's most important?",
        options: [
          { text: "♿ Accessibility for all", isCorrect: true, feedback: "Inclusive design is essential!" },
          { text: "🏛️ Fancy decorations only", isCorrect: false, feedback: "Function over form!" },
          { text: "🚗 Parking spaces only", isCorrect: false, feedback: "People need gathering spaces!" }
        ]
      },
      {
        scenario: "📈 Your startup is growing fast. What's your next move?",
        options: [
          { text: "📊 Hire the right team", isCorrect: true, feedback: "Great teams build great companies!" },
          { text: "💸 Spend all profits on ads", isCorrect: false, feedback: "Balance is important in business." },
          { text: "🎰 Gamble on trends", isCorrect: false, feedback: "Strategy beats luck." }
        ]
      },
      // Set 2 - New variations
      {
        scenario: "🌱 Starting a school garden. What's your priority?",
        options: [
          { text: "📚 Educational value for students", isCorrect: true, feedback: "Learning comes first!" },
          { text: "💰 Selling all the vegetables", isCorrect: false, feedback: "Education is more important than profit." },
          { text: "🎨 Making it look pretty only", isCorrect: false, feedback: "Function matters too!" }
        ]
      },
      {
        scenario: "🎮 Creating an educational game. What makes it effective?",
        options: [
          { text: "🎯 Clear learning objectives", isCorrect: true, feedback: "Goals guide the design!" },
          { text: "🎨 Cool graphics only", isCorrect: false, feedback: "Content matters more than looks." },
          { text: "🔊 Loud sound effects", isCorrect: false, feedback: "Learning needs focus, not noise." }
        ]
      },
      {
        scenario: "🏘️ Revitalizing a neighborhood. Where do you start?",
        options: [
          { text: "👥 Listen to residents' needs", isCorrect: true, feedback: "Community input is essential!" },
          { text: "💼 Bring in big businesses", isCorrect: false, feedback: "Residents' needs come first." },
          { text: "🏢 Build luxury condos", isCorrect: false, feedback: "Affordability matters!" }
        ]
      },
      {
        scenario: "📱 Developing a social app for teens. What's crucial?",
        options: [
          { text: "🛡️ Privacy and safety features", isCorrect: true, feedback: "Safety is paramount!" },
          { text: "📊 Collecting maximum data", isCorrect: false, feedback: "Privacy matters more than data." },
          { text: "💰 Showing lots of ads", isCorrect: false, feedback: "User experience is more important." }
        ]
      },
      {
        scenario: "🎨 Organizing an art exhibition. What's your approach?",
        options: [
          { text: "🌈 Showcase diverse artists", isCorrect: true, feedback: "Diversity enriches art!" },
          { text: "👑 Only famous artists", isCorrect: false, feedback: "Give new artists opportunities!" },
          { text: "💵 Highest bidders only", isCorrect: false, feedback: "Art isn't just about money." }
        ]
      }
    ],
    Hard: [
      // Set 1
      {
        scenario: "🤖 Implementing AI in agriculture. What's the ethical consideration?",
        options: [
          { text: "🌾 Impact on farm workers' livelihoods", isCorrect: true, feedback: "Social impact matters in automation!" },
          { text: "💰 Maximum profit only", isCorrect: false, feedback: "Ethics go beyond profit." },
          { text: "🚀 Fastest implementation", isCorrect: false, feedback: "Speed shouldn't compromise ethics." }
        ]
      },
      {
        scenario: "🌍 Scaling a climate solution globally. What's critical?",
        options: [
          { text: "🤝 Local adaptation and partnerships", isCorrect: true, feedback: "Context matters in global solutions!" },
          { text: "📋 One-size-fits-all approach", isCorrect: false, feedback: "Different regions have different needs." },
          { text: "💼 Corporate control only", isCorrect: false, feedback: "Community involvement is essential." }
        ]
      },
      {
        scenario: "🎭 Funding creative tech projects. What's your strategy?",
        options: [
          { text: "🎯 Balance innovation with sustainability", isCorrect: true, feedback: "Long-term thinking wins!" },
          { text: "💸 Quick returns only", isCorrect: false, feedback: "Innovation takes time." },
          { text: "🎲 Follow trends blindly", isCorrect: false, feedback: "Vision matters more than trends." }
        ]
      },
      {
        scenario: "🏛️ Redesigning urban infrastructure. What's paramount?",
        options: [
          { text: "🌱 Environmental sustainability", isCorrect: true, feedback: "Future-proof design is essential!" },
          { text: "🚗 More car lanes", isCorrect: false, feedback: "Cars aren't the future of cities." },
          { text: "💰 Cheapest option", isCorrect: false, feedback: "Quality infrastructure is an investment." }
        ]
      },
      {
        scenario: "💼 Managing a diverse global team. What's key?",
        options: [
          { text: "🌍 Cultural sensitivity and inclusion", isCorrect: true, feedback: "Respect differences to build unity!" },
          { text: "⏰ Everyone works same hours", isCorrect: false, feedback: "Time zones and cultures differ." },
          { text: "🗣️ One dominant language only", isCorrect: false, feedback: "Multilingualism is strength." }
        ]
      },
      // Set 2 - New variations
      {
        scenario: "🔬 Researching new technology. What ethical question comes first?",
        options: [
          { text: "⚖️ Who benefits and who might be harmed?", isCorrect: true, feedback: "Ethics must guide innovation!" },
          { text: "💰 How much money can we make?", isCorrect: false, feedback: "Profit shouldn't be the only factor." },
          { text: "🏆 Can we be first to market?", isCorrect: false, feedback: "Speed shouldn't compromise ethics." }
        ]
      },
      {
        scenario: "🏢 Building a sustainable startup. What's your foundation?",
        options: [
          { text: "🎯 Clear mission and values", isCorrect: true, feedback: "Purpose drives long-term success!" },
          { text: "💸 Venture capital funding", isCorrect: false, feedback: "Mission matters more than money." },
          { text: "📈 Growth at any cost", isCorrect: false, feedback: "Sustainable growth is better." }
        ]
      },
      {
        scenario: "🌐 Connecting rural and urban economies. What's essential?",
        options: [
          { text: "🤝 Mutual respect and fair trade", isCorrect: true, feedback: "Equity creates lasting partnerships!" },
          { text: "🏙️ Urban dominance", isCorrect: false, feedback: "Partnership, not domination." },
          { text: "💰 Extracting rural resources", isCorrect: false, feedback: "Exploitation isn't sustainable." }
        ]
      },
      {
        scenario: "🎓 Reforming education systems. Where do you focus?",
        options: [
          { text: "👥 Student agency and engagement", isCorrect: true, feedback: "Learners should drive their education!" },
          { text: "📊 Test scores only", isCorrect: false, feedback: "Learning is more than scores." },
          { text: "💼 Job training only", isCorrect: false, feedback: "Education develops whole persons." }
        ]
      },
      {
        scenario: "♻️ Circular economy implementation. What's the challenge?",
        options: [
          { text: "🔄 Changing consumer behavior", isCorrect: true, feedback: "Culture change is key to sustainability!" },
          { text: "🏭 Just recycling more", isCorrect: false, feedback: "Need systemic change, not just recycling." },
          { text: "💰 Making it profitable only", isCorrect: false, feedback: "Environmental impact matters most." }
        ]
      }
    ]
  },
  "Building/Design Simulation": {
    Easy: [
      {
        scenario: "🏡 Building a playground! What's the first thing to add?",
        options: [
          { text: "🛝 Safe, fun slides!", isCorrect: true, feedback: "Safety first! Kids love slides!" },
          { text: "⚡ Lightning bolts", isCorrect: false, feedback: "Too dangerous for kids!" },
          { text: "🦖 Real dinosaurs", isCorrect: false, feedback: "Dinosaurs are too scary!" }
        ]
      },
      {
        scenario: "🌳 Your garden needs help! What should you plant?",
        options: [
          { text: "🌻 Colorful flowers!", isCorrect: true, feedback: "Beautiful and bees love them!" },
          { text: "🔥 Fire plants", isCorrect: false, feedback: "Too hot and dangerous!" },
          { text: "❄️ Ice cubes", isCorrect: false, feedback: "They'll melt quickly!" }
        ]
      },
      {
        scenario: "🎨 Decorating your room! What makes it special?",
        options: [
          { text: "⭐ Your favorite things!", isCorrect: true, feedback: "It's YOUR special space!" },
          { text: "👻 Scary monsters", isCorrect: false, feedback: "You'll have nightmares!" },
          { text: "💩 Trash everywhere", isCorrect: false, feedback: "Keep it clean!" }
        ]
      },
      {
        scenario: "🚂 Building a train track! Which path is best?",
        options: [
          { text: "🌈 The fun rainbow path!", isCorrect: true, feedback: "Colorful and exciting!" },
          { text: "🌋 Through a volcano!", isCorrect: false, feedback: "Too hot and scary!" },
          { text: "🌊 Under the ocean floor", isCorrect: false, feedback: "Fish will be confused!" }
        ]
      },
      {
        scenario: "🏠 Your dream house needs one special room! What is it?",
        options: [
          { text: "📚 A cozy reading nook!", isCorrect: true, feedback: "Reading sparks imagination!" },
          { text: "🚀 A rocket launcher", isCorrect: false, feedback: "Too dangerous inside!" },
          { text: "🐉 A dragon's lair", isCorrect: false, feedback: "Dragons are too wild!" }
        ]
      },
      // Additional variations
      {
        scenario: "🏖️ Making a sandcastle! What's the best tool?",
        options: [
          { text: "🪣 Bucket and shovel!", isCorrect: true, feedback: "Perfect castle-building tools!" },
          { text: "🔨 Hammer and nails", isCorrect: false, feedback: "Can't hammer sand!" },
          { text: "✂️ Scissors", isCorrect: false, feedback: "Can't cut sand!" }
        ]
      },
      {
        scenario: "🎪 Designing a fun treehouse! What should it have?",
        options: [
          { text: "🪜 Strong ladder to climb!", isCorrect: true, feedback: "Safety is important!" },
          { text: "🌊 Swimming pool inside", isCorrect: false, feedback: "Too heavy for a tree!" },
          { text: "🔥 Fireplace", isCorrect: false, feedback: "Fire and trees don't mix!" }
        ]
      },
      {
        scenario: "🌸 Creating a butterfly garden! What do they need?",
        options: [
          { text: "🌺 Lots of colorful flowers!", isCorrect: true, feedback: "Butterflies love nectar!" },
          { text: "📺 TV screens", isCorrect: false, feedback: "Butterflies don't watch TV!" },
          { text: "🎮 Video games", isCorrect: false, feedback: "They prefer flowers!" }
        ]
      },
      {
        scenario: "🎡 Building a mini carnival! What's the main attraction?",
        options: [
          { text: "🎠 Colorful carousel!", isCorrect: true, feedback: "Everyone loves carousels!" },
          { text: "📱 Phone charging station", isCorrect: false, feedback: "Not very exciting!" },
          { text: "🗑️ Trash cans only", isCorrect: false, feedback: "Need fun activities!" }
        ]
      },
      {
        scenario: "🏰 Your LEGO castle needs defenders! What do you build?",
        options: [
          { text: "🛡️ Brave knights!", isCorrect: true, feedback: "Knights protect castles!" },
          { text: "🐌 Tiny snails", isCorrect: false, feedback: "Too slow to defend!" },
          { text: "🍕 Pizza slices", isCorrect: false, feedback: "Pizza can't fight!" }
        ]
      }
    ],
    Medium: [
      {
        scenario: "🏙️ Planning a smart city district. Where do you start?",
        options: [
          { text: "🚇 Public transportation hub", isCorrect: true, feedback: "Transit is the foundation of smart cities!" },
          { text: "🏢 Luxury apartments only", isCorrect: false, feedback: "Mixed-use is better for communities." },
          { text: "🎰 Casinos everywhere", isCorrect: false, feedback: "Not family-friendly or sustainable." }
        ]
      },
      {
        scenario: "🌱 Designing a sustainable farm. What's your priority?",
        options: [
          { text: "💧 Water conservation system", isCorrect: true, feedback: "Water efficiency is crucial!" },
          { text: "🏭 Chemical fertilizers", isCorrect: false, feedback: "Sustainable means natural methods." },
          { text: "⛽ Gas generators", isCorrect: false, feedback: "Not eco-friendly!" }
        ]
      },
      {
        scenario: "🏛️ Creating a community center. What's essential?",
        options: [
          { text: "📚 Multi-purpose spaces", isCorrect: true, feedback: "Flexible spaces serve more people!" },
          { text: "🚫 Single-use rooms only", isCorrect: false, feedback: "Wastes space and resources." },
          { text: "🔒 Private-only areas", isCorrect: false, feedback: "Community means sharing!" }
        ]
      },
      {
        scenario: "🛤️ Planning transportation routes. What matters most?",
        options: [
          { text: "📍 Connecting key locations", isCorrect: true, feedback: "Connectivity is key!" },
          { text: "💰 The cheapest path only", isCorrect: false, feedback: "Safety and access matter more." },
          { text: "⛰️ Over steep mountains", isCorrect: false, feedback: "Too expensive and impractical." }
        ]
      },
      {
        scenario: "🏘️ Your neighborhood needs a feature. What do you add?",
        options: [
          { text: "🌳 Green community park", isCorrect: true, feedback: "Green spaces improve quality of life!" },
          { text: "🏪 Another shopping mall", isCorrect: false, feedback: "Communities need more than commerce." },
          { text: "🅿️ More parking lots", isCorrect: false, feedback: "Cars shouldn't dominate neighborhoods." }
        ]
      },
      // Additional variations
      {
        scenario: "🏫 Redesigning a school campus. What's your focus?",
        options: [
          { text: "🌞 Natural light and open spaces", isCorrect: true, feedback: "Healthy environments boost learning!" },
          { text: "🔒 High security fences", isCorrect: false, feedback: "Welcoming beats fortress mentality." },
          { text: "🅿️ Huge parking lot", isCorrect: false, feedback: "Students need green space!" }
        ]
      },
      {
        scenario: "🏥 Planning a health clinic. What's crucial?",
        options: [
          { text: "♿ Accessibility for all abilities", isCorrect: true, feedback: "Healthcare should be accessible!" },
          { text: "💰 Expensive private rooms", isCorrect: false, feedback: "Everyone deserves good care." },
          { text: "🚗 VIP parking only", isCorrect: false, feedback: "Focus on patients, not cars." }
        ]
      },
      {
        scenario: "🎭 Designing a community theater. What's important?",
        options: [
          { text: "🎵 Good acoustics for everyone", isCorrect: true, feedback: "Sound quality matters!" },
          { text: "👑 Luxury boxes for VIPs", isCorrect: false, feedback: "Art is for everyone!" },
          { text: "📱 Lots of phone charging", isCorrect: false, feedback: "Focus on the performance!" }
        ]
      },
      {
        scenario: "🌉 Building a pedestrian bridge. What's key?",
        options: [
          { text: "♿ Ramps and wide paths", isCorrect: true, feedback: "Everyone should cross safely!" },
          { text: "⚡ Extreme height for views", isCorrect: false, feedback: "Accessibility over aesthetics." },
          { text: "🚫 No handrails", isCorrect: false, feedback: "Safety is essential!" }
        ]
      },
      {
        scenario: "📚 Creating a public library space. What matters?",
        options: [
          { text: "🤫 Quiet zones and collaborative areas", isCorrect: true, feedback: "Different needs require different spaces!" },
          { text: "☕ Only a coffee shop", isCorrect: false, feedback: "Libraries are about books!" },
          { text: "💰 Membership fees", isCorrect: false, feedback: "Public means free access!" }
        ]
      }
    ],
    Hard: [
      {
        scenario: "🏙️ Urban regeneration project. What's your principle?",
        options: [
          { text: "🏘️ Prevent displacement of residents", isCorrect: true, feedback: "Inclusive development protects communities!" },
          { text: "💰 Maximum return on investment", isCorrect: false, feedback: "People over profit." },
          { text: "🏢 Luxury development only", isCorrect: false, feedback: "Gentrification harms communities." }
        ]
      },
      {
        scenario: "🌱 Designing resilient infrastructure. What's critical?",
        options: [
          { text: "🌊 Climate adaptation strategies", isCorrect: true, feedback: "Future-proofing is essential!" },
          { text: "💵 Lowest construction cost", isCorrect: false, feedback: "Resilience requires investment." },
          { text: "📏 Traditional methods only", isCorrect: false, feedback: "Innovation addresses new challenges." }
        ]
      },
      {
        scenario: "🏛️ Heritage site renovation. What's paramount?",
        options: [
          { text: "🎨 Preserving cultural integrity", isCorrect: true, feedback: "Heritage belongs to communities!" },
          { text: "🏨 Converting to luxury hotel", isCorrect: false, feedback: "Respect cultural significance." },
          { text: "🚀 Complete modernization", isCorrect: false, feedback: "Balance old and new." }
        ]
      },
      {
        scenario: "🌐 Smart city implementation. What's the concern?",
        options: [
          { text: "🔒 Data privacy and security", isCorrect: true, feedback: "Technology must respect rights!" },
          { text: "📊 Collecting maximum data", isCorrect: false, feedback: "Privacy matters." },
          { text: "💰 Corporate partnerships only", isCorrect: false, feedback: "Public interest comes first." }
        ]
      },
      {
        scenario: "🏗️ Mixed-use development. What ensures success?",
        options: [
          { text: "🤝 Community engagement throughout", isCorrect: true, feedback: "Residents know their needs best!" },
          { text: "📋 Top-down planning only", isCorrect: false, feedback: "Include stakeholders." },
          { text: "💼 Developer decides everything", isCorrect: false, feedback: "Community input is essential." }
        ]
      },
      // Additional variations
      {
        scenario: "🌍 Sustainable city planning. What's your framework?",
        options: [
          { text: "⚖️ Balance environment, economy, equity", isCorrect: true, feedback: "Triple bottom line thinking!" },
          { text: "💰 Economic growth only", isCorrect: false, feedback: "Sustainability needs holistic approach." },
          { text: "🏭 Industrial development first", isCorrect: false, feedback: "Environment can't wait." }
        ]
      },
      {
        scenario: "🏘️ Affordable housing design. What's the challenge?",
        options: [
          { text: "🏠 Quality without stigmatization", isCorrect: true, feedback: "Dignity in design matters!" },
          { text: "💵 Cheapest materials only", isCorrect: false, feedback: "Quality affects lives." },
          { text: "🏢 Isolating from wealthy areas", isCorrect: false, feedback: "Integration, not segregation." }
        ]
      },
      {
        scenario: "🚇 Transit-oriented development. What's key?",
        options: [
          { text: "🚶 Walkability and density balance", isCorrect: true, feedback: "Design for people, not just transit!" },
          { text: "🅿️ Massive parking structures", isCorrect: false, feedback: "Defeats the purpose of transit." },
          { text: "🏢 High-rises only", isCorrect: false, feedback: "Mixed scale creates community." }
        ]
      },
      {
        scenario: "🌳 Urban forest planning. What's your priority?",
        options: [
          { text: "🌍 Native species and biodiversity", isCorrect: true, feedback: "Ecological balance matters!" },
          { text: "🎨 Decorative trees only", isCorrect: false, feedback: "Function over aesthetics." },
          { text: "💰 Cheapest maintenance", isCorrect: false, feedback: "Investment pays off long-term." }
        ]
      },
      {
        scenario: "♻️ Circular construction. What's the innovation?",
        options: [
          { text: "🔄 Design for disassembly and reuse", isCorrect: true, feedback: "Thinking beyond building lifecycle!" },
          { text: "🗑️ Use and demolish approach", isCorrect: false, feedback: "Wasteful and outdated." },
          { text: "💰 Lowest upfront cost", isCorrect: false, feedback: "Lifecycle cost matters more." }
        ]
      }
    ]
  },
  // Continue with Trading/Teamwork and Exploration/Discovery categories...
  "Trading/Teamwork": {
    Easy: [
      {
        scenario: "🎈 Your team needs balloons for the party! How do you share?",
        options: [
          { text: "🎨 Everyone gets their favorite color!", isCorrect: true, feedback: "Everyone's happy!" },
          { text: "👑 Only the leader gets all", isCorrect: false, feedback: "That's not fair to friends!" },
          { text: "🗑️ Throw them away", isCorrect: false, feedback: "What a waste!" }
        ]
      },
      {
        scenario: "🍪 You have cookies to share! What's fair?",
        options: [
          { text: "🤗 Everyone gets equal cookies!", isCorrect: true, feedback: "Sharing is caring!" },
          { text: "😋 I eat them all!", isCorrect: false, feedback: "Friends won't like that!" },
          { text: "🐕 Give them to the dog", isCorrect: false, feedback: "But your friends want some!" }
        ]
      },
      {
        scenario: "🎮 Two friends want the same toy! How do you help?",
        options: [
          { text: "⏰ Take turns playing!", isCorrect: true, feedback: "Taking turns is fair!" },
          { text: "💥 Fight for it!", isCorrect: false, feedback: "Fighting hurts feelings!" },
          { text: "😭 Cry loudly", isCorrect: false, feedback: "That doesn't solve it!" }
        ]
      },
      {
        scenario: "🏃 Your team is racing! Someone falls. What do you do?",
        options: [
          { text: "🤝 Help them up!", isCorrect: true, feedback: "You're a good friend!" },
          { text: "🏃 Keep running alone", isCorrect: false, feedback: "Friends help each other!" },
          { text: "😂 Laugh at them", isCorrect: false, feedback: "That's mean!" }
        ]
      },
      {
        scenario: "🎨 Group art project! How do you work together?",
        options: [
          { text: "👂 Listen to everyone's ideas!", isCorrect: true, feedback: "All ideas matter!" },
          { text: "🗣️ Talk over everyone", isCorrect: false, feedback: "Let others share!" },
          { text: "😴 Do nothing", isCorrect: false, feedback: "Team needs you!" }
        ]
      }
    ],
    Medium: [
      {
        scenario: "🤝 Your team has limited resources. How do you allocate?",
        options: [
          { text: "📊 Based on project needs", isCorrect: true, feedback: "Strategic allocation works best!" },
          { text: "💰 Highest bidder wins", isCorrect: false, feedback: "Collaboration over competition." },
          { text: "🎲 Random luck", isCorrect: false, feedback: "Strategy beats randomness." }
        ]
      },
      {
        scenario: "💼 Distributing project credit. What's ethical?",
        options: [
          { text: "📝 Credit based on contribution", isCorrect: true, feedback: "Fairness builds trust!" },
          { text: "🏆 Leader takes all credit", isCorrect: false, feedback: "Teams succeed together." },
          { text: "🤫 Don't acknowledge anyone", isCorrect: false, feedback: "Recognition matters." }
        ]
      },
      {
        scenario: "⚔️ Team conflict arises. How do you resolve it?",
        options: [
          { text: "💬 Facilitate open discussion", isCorrect: true, feedback: "Communication resolves conflicts!" },
          { text: "🎯 Pick a side", isCorrect: false, feedback: "Bias makes it worse." },
          { text: "🙈 Ignore the problem", isCorrect: false, feedback: "Problems need addressing." }
        ]
      },
      {
        scenario: "🚀 A team member struggles. How do you respond?",
        options: [
          { text: "💪 Offer support and help", isCorrect: true, feedback: "Strong teams support each other!" },
          { text: "🎯 Focus on winning only", isCorrect: false, feedback: "Success means everyone succeeds." },
          { text: "📉 Report their failure", isCorrect: false, feedback: "Support, don't criticize." }
        ]
      },
      {
        scenario: "📋 Complex team project. What's your approach?",
        options: [
          { text: "🗓️ Plan roles and milestones", isCorrect: true, feedback: "Organization leads to success!" },
          { text: "🏃 Rush without planning", isCorrect: false, feedback: "Haste makes waste." },
          { text: "🦸 Do everything alone", isCorrect: false, feedback: "Collaboration multiplies results." }
        ]
      }
    ],
    Hard: [
      {
        scenario: "🌐 Managing distributed team across time zones. What's key?",
        options: [
          { text: "⏰ Flexible schedules and async work", isCorrect: true, feedback: "Respect work-life balance!" },
          { text: "🌙 Everyone works at night", isCorrect: false, feedback: "Unsustainable and unfair." },
          { text: "📞 Constant meetings", isCorrect: false, feedback: "Meeting fatigue is real." }
        ]
      },
      {
        scenario: "💼 Resource scarcity in project. What's your principle?",
        options: [
          { text: "⚖️ Transparent prioritization process", isCorrect: true, feedback: "Fairness through transparency!" },
          { text: "🤫 Secret allocation", isCorrect: false, feedback: "Transparency builds trust." },
          { text: "👑 Leader decides alone", isCorrect: false, feedback: "Collaborative decision-making is better." }
        ]
      },
      {
        scenario: "🤝 Merging two team cultures. What's essential?",
        options: [
          { text: "👂 Listen and integrate both perspectives", isCorrect: true, feedback: "Inclusion creates strong culture!" },
          { text: "🏆 One culture dominates", isCorrect: false, feedback: "Respect both cultures." },
          { text: "🗑️ Start completely fresh", isCorrect: false, feedback: "Honor existing strengths." }
        ]
      },
      {
        scenario: "⚖️ Addressing power imbalance in team. What do you do?",
        options: [
          { text: "📢 Create psychological safety", isCorrect: true, feedback: "Everyone's voice matters!" },
          { text: "👑 Reinforce hierarchy", isCorrect: false, feedback: "Flat structures foster innovation." },
          { text: "🙈 Ignore the dynamics", isCorrect: false, feedback: "Address power issues openly." }
        ]
      },
      {
        scenario: "🌍 Building trust in multicultural team. What's crucial?",
        options: [
          { text: "🤲 Cultural humility and curiosity", isCorrect: true, feedback: "Understanding builds bridges!" },
          { text: "🗣️ One language dominates", isCorrect: false, feedback: "Linguistic diversity is strength." },
          { text: "📋 Ignore cultural differences", isCorrect: false, feedback: "Celebrate differences!" }
        ]
      }
    ]
  },
  "Exploration/Discovery": {
    Easy: [
      {
        scenario: "🔍 You found a mysterious box! What do you do first?",
        options: [
          { text: "👀 Look carefully and safely!", isCorrect: true, feedback: "Smart explorer!" },
          { text: "💥 Smash it open!", isCorrect: false, feedback: "Too risky!" },
          { text: "😱 Run away screaming", isCorrect: false, feedback: "Don't be scared, explore!" }
        ]
      },
      {
        scenario: "🌟 You see a new star! What should you do?",
        options: [
          { text: "📝 Draw it and take notes!", isCorrect: true, feedback: "Scientists always record!" },
          { text: "🙈 Ignore it", isCorrect: false, feedback: "You might miss something cool!" },
          { text: "💤 Go to sleep", isCorrect: false, feedback: "But it's exciting!" }
        ]
      },
      {
        scenario: "🦋 A pretty butterfly lands near you! How do you learn about it?",
        options: [
          { text: "📷 Take photos gently!", isCorrect: true, feedback: "Gentle and curious!" },
          { text: "🏃 Chase it around!", isCorrect: false, feedback: "That will scare it!" },
          { text: "🕸️ Try to catch it", isCorrect: false, feedback: "Let it be free!" }
        ]
      },
      {
        scenario: "🗺️ Found a new path in the forest! What do you do?",
        options: [
          { text: "🧭 Mark the way carefully!", isCorrect: true, feedback: "Smart adventurer!" },
          { text: "🏃 Run in randomly!", isCorrect: false, feedback: "You might get lost!" },
          { text: "😴 Sit and wait", isCorrect: false, feedback: "Adventure awaits!" }
        ]
      },
      {
        scenario: "🧪 Mixing colors makes something new! What do you do?",
        options: [
          { text: "🎨 Test it on paper!", isCorrect: true, feedback: "Creative scientist!" },
          { text: "👅 Taste it!", isCorrect: false, feedback: "Never taste science stuff!" },
          { text: "🗑️ Pour it out", isCorrect: false, feedback: "You made a discovery!" }
        ]
      }
    ],
    Medium: [
      {
        scenario: "🧪 Unexpected result in experiment. Your response?",
        options: [
          { text: "🔄 Repeat to verify results", isCorrect: true, feedback: "Replication confirms findings!" },
          { text: "📱 Post immediately", isCorrect: false, feedback: "Verify before publishing." },
          { text: "🗑️ Discard the data", isCorrect: false, feedback: "All data has value." }
        ]
      },
      {
        scenario: "🌿 New species found. How do you study it?",
        options: [
          { text: "📊 Systematic observation", isCorrect: true, feedback: "Methodology ensures quality data!" },
          { text: "⚡ Quick assumptions", isCorrect: false, feedback: "Assumptions can mislead." },
          { text: "🔬 Invasive testing only", isCorrect: false, feedback: "Ethical research matters." }
        ]
      },
      {
        scenario: "🧭 Uncharted territory ahead. Your strategy?",
        options: [
          { text: "📋 Map and assess risks", isCorrect: true, feedback: "Preparation prevents problems!" },
          { text: "⚡ Rush in unprepared", isCorrect: false, feedback: "Recklessness is dangerous." },
          { text: "🚫 Turn back immediately", isCorrect: false, feedback: "Calculated risks lead to discovery." }
        ]
      },
      {
        scenario: "⚗️ Chemical reaction produces new compound. Next step?",
        options: [
          { text: "🔬 Analyze composition", isCorrect: true, feedback: "Analysis reveals properties!" },
          { text: "💾 Delete the record", isCorrect: false, feedback: "Preserve all findings." },
          { text: "🎲 Mix more randomly", isCorrect: false, feedback: "Random action isn't scientific." }
        ]
      },
      {
        scenario: "🔭 Telescope shows unusual pattern. What do you do?",
        options: [
          { text: "📸 Document and share with peers", isCorrect: true, feedback: "Collaboration advances science!" },
          { text: "🤫 Keep it secret", isCorrect: false, feedback: "Science thrives on sharing." },
          { text: "🗑️ Assume it's an error", isCorrect: false, feedback: "Investigate unexpected findings!" }
        ]
      }
    ],
    Hard: [
      {
        scenario: "🔬 Groundbreaking discovery with ethical implications. What's first?",
        options: [
          { text: "⚖️ Consult ethics review board", isCorrect: true, feedback: "Ethics must guide research!" },
          { text: "💰 Patent immediately", isCorrect: false, feedback: "Consider implications first." },
          { text: "📢 Announce to media", isCorrect: false, feedback: "Peer review comes first." }
        ]
      },
      {
        scenario: "🌍 Field research in indigenous lands. What's paramount?",
        options: [
          { text: "🤝 Free prior informed consent", isCorrect: true, feedback: "Respect sovereignty!" },
          { text: "🏃 Extract data quickly", isCorrect: false, feedback: "Extractive research harms." },
          { text: "🚫 Ignore local knowledge", isCorrect: false, feedback: "Indigenous knowledge is valuable!" }
        ]
      },
      {
        scenario: "🧬 Controversial research area. What's your approach?",
        options: [
          { text: "💬 Transparent communication", isCorrect: true, feedback: "Public engagement builds trust!" },
          { text: "🤫 Work in secret", isCorrect: false, feedback: "Secrecy breeds mistrust." },
          { text: "📊 Data only, no context", isCorrect: false, feedback: "Context matters in science." }
        ]
      },
      {
        scenario: "🌊 Rare ecosystem study. What's the balance?",
        options: [
          { text: "🔬 Minimally invasive methods", isCorrect: true, feedback: "Preserve while studying!" },
          { text: "📊 Collect maximum samples", isCorrect: false, feedback: "Excessive sampling harms ecosystems." },
          { text: "💰 Economic value assessment", isCorrect: false, feedback: "Intrinsic value matters most." }
        ]
      },
      {
        scenario: "🎓 Publishing negative results. What do you do?",
        options: [
          { text: "📚 Publish to prevent duplication", isCorrect: true, feedback: "Negative results advance knowledge!" },
          { text: "🗑️ Hide the failure", isCorrect: false, feedback: "Failures teach lessons." },
          { text: "📝 Only publish successes", isCorrect: false, feedback: "Publication bias harms science." }
        ]
      }
    ]
  }
};

/**
 * Get a random subset of questions for dynamic gameplay
 */
export const getRandomQuestions = (
  gameType: string,
  difficulty: string,
  count: number = 5
): QuestionTemplate[] => {
  const bank = questionBanks[gameType]?.[difficulty] || [];
  
  if (bank.length === 0) return [];
  
  // Shuffle and select random questions
  const shuffled = [...bank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};
