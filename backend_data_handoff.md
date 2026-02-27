# Altuvera Backend Data Handoff

Generated from current frontend source data.

## Snapshot

- Countries: 10
- Destinations: 19
- Tips: 8
- Posts: 6
- Services: 8
- Testimonials: 6

## Production Fetch Plan

| Entity | Source | Recommended Endpoint | Used By | Notes |
|---|---|---|---|---|
| countries | src/data/countries.js | GET /api/countries, GET /api/countries/:id | Home, Destinations, CountryPage, cards, map views | Core country metadata, hero images, map coordinates, highlights, travel/culture details |
| destinations | src/data/destinations.js | GET /api/destinations, GET /api/destinations/:id, GET /api/countries/:id/destinations | Home featured destinations, country destination lists, destination details | Destination-level copy, coordinates, hero + gallery images, pricing/duration/type/rating |
| tips | src/data/tips.js | GET /api/tips | Tips page | Category-filtered advisory content |
| posts | src/data/posts.js | GET /api/posts, GET /api/posts/:id | Home blog preview, Blog pages | Editorial/article previews and metadata |
| services | src/data/services.js | GET /api/services | Home services and service detail pages | Service descriptions and promotional cards |
| testimonials | src/data/testimonials.js | GET /api/testimonials | Home testimonials | Social proof carousel content |

## Inline Frontend Content To Move To Backend/CMS

### src/pages/Home.jsx

- Content blocks: adventureTypes, features, partners, quickStats
- Why: Marketing copy and conversion UI content likely to change frequently

### src/pages/About.jsx

- Content blocks: team, values, stats, videos, galleryImages, quotes/timeline blocks
- Why: Brand/story media and organization info should be editable outside code

### src/pages/PaymentTerms.jsx

- Content blocks: terms, processSteps, paymentMethods, faqs, trustBadges, ADMIN contact metadata
- Why: Operational/legal content and admin contact settings require secure backend control

## Country Records (Full Static Objects)

### Kenya

```json
{
  "id": "kenya",
  "name": "Kenya",
  "capital": "Nairobi",
  "flag": "🇰🇪",
  "tagline": "Magical Kenya",
  "motto": "Harambee (Let us all pull together)",
  "independence": "December 12, 1963",
  "description": "Kenya is a country of dramatic extremes and classic contrasts. From the snow-capped peaks of Mount Kenya to the sun-drenched beaches of the Indian Ocean, Kenya offers an incredible diversity of landscapes, wildlife, and cultural experiences that define the essence of East African adventure.",
  "fullDescription": "Kenya, the jewel of East Africa, stands as one of the world's premier safari destinations and a beacon of African tourism. This remarkable country offers an unparalleled combination of wildlife spectacles, diverse landscapes, rich cultural heritage, and warm hospitality that has captivated travelers, researchers, and adventurers for generations.\n\nThe Great Migration, widely regarded as one of nature's most spectacular events, sees approximately two million wildebeest, accompanied by hundreds of thousands of zebras and gazelles, cross from Tanzania's Serengeti into Kenya's Maasai Mara between July and October. The dramatic Mara River crossings, where crocodiles await and thousands of animals surge through dangerous waters, represent wildlife viewing at its most raw and powerful. This annual phenomenon has earned the Maasai Mara its reputation as one of the world's most iconic wildlife destinations.\n\nBeyond the Mara, Kenya's network of over 50 national parks and reserves protects an extraordinary diversity of ecosystems and wildlife. Amboseli National Park offers the quintessential African postcard view – large elephant herds moving across golden savannas with the snow-capped summit of Mount Kilimanjaro dominating the horizon. Tsavo, divided into East and West sections, forms one of the world's largest protected areas and is famous for its red elephants, who dust themselves with the region's distinctive red soil.\n\nThe Great Rift Valley, that massive geological feature stretching from the Middle East to Mozambique, cuts dramatically through Kenya, creating a landscape of escarpments, volcanoes, and lakes. Lake Nakuru, within this valley, hosts one of the world's greatest ornithological spectacles – at times, millions of flamingos paint the alkaline waters pink. Lake Naivasha offers hippo-filled waters and excellent birdwatching, while Lake Turkana, the world's largest desert lake, lies in Kenya's remote northwest, an jade-colored sea in an otherwise harsh landscape.\n\nMount Kenya, Africa's second-highest peak at 5,199 meters, presents a different kind of African adventure. Its multiple peaks, glaciers, and distinct vegetation zones offer challenging climbs and stunning scenery. The mountain is sacred to the Kikuyu people, who believe it to be the home of their god, Ngai.\n\nKenya's coastline stretches for approximately 480 kilometers along the Indian Ocean, featuring some of East Africa's finest beaches. Diani Beach consistently ranks among the world's best, with its powder-white sand and swaying palm trees. The Lamu Archipelago, a UNESCO World Heritage Site, preserves centuries of Swahili culture in its car-free streets, ancient mosques, and traditional dhow sailboats. Mombasa, Kenya's second city, blends African, Arab, Indian, and European influences in its Old Town and Fort Jesus, a 16th-century Portuguese fortification.\n\nKenya's cultural tapestry is woven from over 44 ethnic groups, each contributing unique traditions, languages, art forms, and customs to the national identity. The Maasai, perhaps Africa's most recognized tribe, maintain their semi-nomadic pastoral lifestyle, distinctive red shukas (cloth wraps), intricate beadwork, and traditional ceremonies despite the pressures of modernization. Their warriors, known for their lion-hunting traditions (now ceremonial), jumping dances, and cattle-centered economy, have become global symbols of East African culture.\n\nThe Samburu people of northern Kenya share linguistic and cultural connections with the Maasai but have developed distinct traditions suited to their harsher environment. The Turkana, living around the lake bearing their name, are renowned for their elaborate beaded jewelry and resilience in one of Africa's most challenging environments. Coastal communities, including the Swahili, Mijikenda, and Bajun peoples, have for centuries blended African, Arab, Persian, and Indian Ocean influences into unique coastal cultures.\n\nNairobi, Kenya's dynamic capital, defies the stereotype of African cities. This cosmopolitan metropolis of over 4 million people offers world-class restaurants, vibrant nightlife, innovative tech hubs (earning the nickname \"Silicon Savannah\"), and cultural institutions including the National Museum and Karen Blixen Museum. Remarkably, Nairobi National Park lies just 7 kilometers from the city center, where lions, rhinos, and giraffes roam against a backdrop of skyscrapers – the only national park in the world within a capital city.\n\nConservation in Kenya represents both triumph and ongoing challenge. The country has been at the forefront of anti-poaching efforts, including dramatic ivory burns that have made global headlines. Community conservancies, particularly in the north, have pioneered models of wildlife conservation that benefit local communities while protecting endangered species. Organizations like the David Sheldrick Wildlife Trust rescue orphaned elephants, while the Ol Pejeta Conservancy protects the world's last two northern white rhinos.\n\nKenya's position as an economic and diplomatic hub of East Africa adds another dimension to its appeal. The country hosts the United Nations Environment Programme headquarters and serves as a gateway for business and development throughout the region. This infrastructure translates to excellent tourism facilities, from world-renowned luxury lodges to comfortable mid-range options and budget-friendly alternatives.",
  "additionalInfo": "The Kenyan tourism industry employs over 1.5 million people directly and indirectly, making it one of the country's largest economic sectors. The famous \"Big Five\" – lion, leopard, elephant, buffalo, and rhino – can all be seen in Kenya's parks, though rhino sightings have become rarer due to poaching pressures.\n\nKenya's agricultural sector is equally significant, with the country being the world's third-largest tea exporter and a major producer of coffee, flowers, and fresh vegetables. The famous Kenyan coffee, particularly from regions like Nyeri and Kirinyaga, is prized for its bright acidity and fruity notes.\n\nThe country has produced numerous world-champion long-distance runners, with the high-altitude training grounds of Iten and Eldoret producing Olympic and world record holders. Running tourism has become a niche but growing sector.",
  "population": "54 million",
  "area": "580,367 km²",
  "languages": [
    "English",
    "Swahili"
  ],
  "officialLanguages": [
    "English",
    "Swahili"
  ],
  "ethnicGroups": [
    "Kikuyu (17%)",
    "Luhya (14%)",
    "Kalenjin (13%)",
    "Luo (11%)",
    "Kamba (10%)",
    "Maasai (2%)",
    "Others"
  ],
  "religions": [
    "Christianity (85%)",
    "Islam (11%)",
    "Traditional beliefs (2%)",
    "Others (2%)"
  ],
  "currency": "Kenyan Shilling (KES)",
  "currencySymbol": "KSh",
  "timezone": "East Africa Time (UTC+3)",
  "callingCode": "+254",
  "drivingSide": "Left",
  "climate": "Tropical along coast, arid in interior, temperate in highlands",
  "seasons": {
    "dry": [
      "January-February",
      "July-October"
    ],
    "wet": [
      "March-May (long rains)",
      "November-December (short rains)"
    ],
    "best": "July to October for the Great Migration; January to February for general wildlife viewing"
  },
  "bestTime": "July to October (Great Migration), January to February (dry season)",
  "visaInfo": "Most visitors require a visa, available online (eVisa) or on arrival. East Africa Tourist Visa allows entry to Kenya, Uganda, and Rwanda.",
  "healthInfo": "Yellow fever vaccination required if arriving from endemic areas. Malaria prophylaxis recommended for most areas. Nairobi and highlands are lower risk.",
  "highlights": [
    "Maasai Mara National Reserve",
    "Mount Kenya National Park",
    "Amboseli National Park",
    "Diani Beach",
    "Lake Nakuru National Park",
    "Tsavo National Parks (East & West)",
    "Lamu Island & Archipelago",
    "Hell's Gate National Park",
    "Samburu National Reserve",
    "Lake Naivasha",
    "Ol Pejeta Conservancy",
    "Aberdare National Park",
    "Meru National Park",
    "Nairobi National Park",
    "Fort Jesus, Mombasa",
    "Lake Turkana"
  ],
  "experiences": [
    "Witness the Great Wildebeest Migration river crossings",
    "Summit Point Lenana on Mount Kenya",
    "Safari in Amboseli with Kilimanjaro views",
    "Relax on the pristine beaches of Diani",
    "Visit a traditional Maasai village and learn warrior traditions",
    "Explore Nairobi National Park – the only urban wildlife reserve",
    "Discover Swahili culture in the ancient streets of Lamu",
    "Hot air balloon safari over the Maasai Mara",
    "Visit the David Sheldrick Elephant Orphanage",
    "Cycle and climb at Hell's Gate National Park",
    "Spot the Big Five in Tsavo",
    "Meet the last northern white rhinos at Ol Pejeta",
    "Birdwatching at Lake Nakuru and Lake Naivasha",
    "Deep sea fishing off the Kenyan coast",
    "Experience a traditional Kenyan coffee ceremony",
    "Night game drives in private conservancies",
    "Walking safaris with Samburu guides"
  ],
  "wildlife": {
    "mammals": [
      "Lion",
      "Elephant",
      "Leopard",
      "Cheetah",
      "Rhino (Black & White)",
      "Buffalo",
      "Wildebeest",
      "Zebra",
      "Giraffe (Maasai, Reticulated, Rothschild)",
      "Hippo",
      "Crocodile",
      "Hyena",
      "Wild Dog",
      "Various Antelope Species"
    ],
    "birds": [
      "Flamingo",
      "African Fish Eagle",
      "Lilac-breasted Roller",
      "Superb Starling",
      "Secretary Bird",
      "Crowned Crane",
      "Ostrich",
      "Various Vulture Species"
    ],
    "marine": [
      "Dolphins",
      "Whale Sharks",
      "Sea Turtles",
      "Tropical Reef Fish",
      "Humpback Whales (seasonal)"
    ]
  },
  "cuisine": {
    "staples": [
      "Ugali (maize meal)",
      "Sukuma Wiki (collard greens)",
      "Nyama Choma (grilled meat)",
      "Chapati",
      "Pilau (spiced rice)"
    ],
    "specialties": [
      "Kenyan Mandazi (fried dough)",
      "Githeri (beans and maize)",
      "Mutura (Kenyan sausage)",
      "Irio (mashed peas and potatoes)",
      "Coastal Swahili dishes"
    ],
    "beverages": [
      "Kenyan tea (chai)",
      "Kenyan coffee",
      "Tusker beer",
      "Fresh fruit juices",
      "Madafu (coconut water)"
    ]
  },
  "festivals": [
    {
      "name": "Maasai Mara Wildebeest Migration",
      "period": "July-October"
    },
    {
      "name": "Lamu Cultural Festival",
      "period": "November"
    },
    {
      "name": "Turkana Festival",
      "period": "June"
    },
    {
      "name": "Maralal International Camel Derby",
      "period": "August"
    },
    {
      "name": "Rusinga Festival",
      "period": "December"
    },
    {
      "name": "Jamhuri Day (Independence Day)",
      "period": "December 12"
    }
  ],
  "unescoSites": [
    "Lamu Old Town",
    "Sacred Mijikenda Kaya Forests",
    "Fort Jesus, Mombasa",
    "Lake Turkana National Parks",
    "Mount Kenya National Park/Natural Forest"
  ],
  "travelTips": [
    "Book Maasai Mara lodges well in advance during migration season (July-October)",
    "Carry US dollars in good condition; bills older than 2006 may be rejected",
    "Dress modestly when visiting coastal areas and religious sites",
    "Bargaining is expected in markets but not in established shops",
    "Safari vehicles should be booked through registered operators",
    "Mobile money (M-Pesa) is widely used and very convenient",
    "Respect wildlife; never leave vehicles during safari except at designated areas",
    "Pack layers for highland areas; temperatures drop significantly at night",
    "Learn a few Swahili phrases – locals appreciate the effort"
  ],
  "airports": [
    {
      "name": "Jomo Kenyatta International Airport (NBO)",
      "location": "Nairobi",
      "type": "International Hub"
    },
    {
      "name": "Moi International Airport (MBA)",
      "location": "Mombasa",
      "type": "International"
    },
    {
      "name": "Wilson Airport",
      "location": "Nairobi",
      "type": "Domestic/Charter"
    },
    {
      "name": "Eldoret International Airport",
      "location": "Eldoret",
      "type": "International"
    },
    {
      "name": "Kisumu International Airport",
      "location": "Kisumu",
      "type": "International"
    },
    {
      "name": "Mara Serena Airstrip",
      "location": "Maasai Mara",
      "type": "Safari"
    }
  ],
  "images": [
    "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800",
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
    "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800",
    "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800",
    "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800"
  ],
  "heroImage": "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=1920",
  "mapPosition": {
    "lat": -1.286389,
    "lng": 36.817223
  },
  "neighboringCountries": [
    "Tanzania",
    "Uganda",
    "South Sudan",
    "Ethiopia",
    "Somalia"
  ],
  "economicInfo": {
    "gdp": "$110.3 billion (2022)",
    "gdpPerCapita": "$2,080",
    "mainIndustries": [
      "Agriculture",
      "Tourism",
      "Manufacturing",
      "Services",
      "Technology"
    ],
    "exports": [
      "Tea",
      "Coffee",
      "Cut Flowers",
      "Vegetables",
      "Cement"
    ]
  }
}
```

### Tanzania

```json
{
  "id": "tanzania",
  "name": "Tanzania",
  "capital": "Dodoma",
  "commercialCapital": "Dar es Salaam",
  "flag": "🇹🇿",
  "tagline": "The Soul of Africa",
  "motto": "Uhuru na Umoja (Freedom and Unity)",
  "independence": "December 9, 1961 (Tanganyika), December 10, 1963 (Zanzibar), April 26, 1964 (Union)",
  "description": "Tanzania is home to Africa's highest peak, Mount Kilimanjaro, and the world-famous Serengeti National Park. This land of superlatives offers unmatched wildlife viewing, pristine beaches, ancient cultures, and breathtaking landscapes that embody the African dream.",
  "fullDescription": "Tanzania embodies the quintessential African experience, a vast and magnificently varied nation that contains some of the continent's most iconic destinations. From the eternal snows of Kilimanjaro to the endless golden plains of the Serengeti, from the pristine beaches of Zanzibar to the prehistoric wonder of Ngorongoro Crater, Tanzania offers experiences that have come to define the African dream for travelers worldwide.\n\nThe Serengeti National Park, whose name derives from the Maasai word \"siringet\" meaning \"endless plains,\" hosts the greatest wildlife spectacle on Earth. The annual Great Migration sees over two million wildebeest, accompanied by hundreds of thousands of zebras, gazelles, and eland, undertake a circular journey of approximately 1,000 kilometers in search of fresh grazing and water. This UNESCO World Heritage Site covers 14,763 square kilometers of grassland, savanna, riverine forest, and woodlands, supporting one of the most complex and diverse ecosystems on the planet. Beyond the migration, the Serengeti hosts one of Africa's highest densities of predators, with abundant lion prides, leopards, cheetahs, hyenas, and wild dogs providing constant drama.\n\nThe Ngorongoro Conservation Area, another UNESCO World Heritage Site, centers on the Ngorongoro Crater – the world's largest intact, unflooded volcanic caldera. Often called \"Africa's Garden of Eden\" or the \"Eighth Wonder of the World,\" this 260-square-kilometer crater floor supports an estimated 25,000 large animals, including one of Africa's densest lion populations and the critically endangered black rhinoceros. The crater's walls, rising 600 meters above the floor, create a natural amphitheater of breathtaking beauty. The broader conservation area allows Maasai pastoralists to coexist with wildlife, creating a living example of human-wildlife harmony.\n\nMount Kilimanjaro, the \"Roof of Africa,\" rises to 5,895 meters as the continent's highest peak and the world's tallest free-standing mountain. Its three volcanic cones – Kibo, Mawenzi, and Shira – create an unmistakable profile that has captivated mountaineers and adventurers since Hans Meyer first reached the summit in 1889. Unlike many high-altitude peaks, Kilimanjaro requires no technical climbing equipment, making it accessible to determined trekkers of various experience levels. The journey from tropical forest through heath, moorland, alpine desert, and finally arctic summit zone offers a remarkable condensation of Earth's ecological diversity into a single climb. The mountain's glaciers, though shrinking due to climate change, still cap the summit, creating scenes of surreal beauty.\n\nTanzania's northern circuit, including the Serengeti, Ngorongoro, Lake Manyara, and Tarangire National Parks, represents the country's most visited region, but the southern circuit offers equally compelling experiences with fewer crowds. The Selous Game Reserve (now Nyerere National Park), Africa's largest protected area at over 50,000 square kilometers, harbors significant populations of elephants, wild dogs, and hippos across a wilderness of rivers, lakes, and miombo woodlands. Ruaha National Park, Tanzania's largest, provides excellent wildlife viewing in dramatic baobab-studded landscapes.\n\nThe western circuit offers unique primate experiences. Gombe Stream National Park, made famous by Jane Goodall's groundbreaking chimpanzee research beginning in 1960, allows visitors to trek through montane forest along Lake Tanganyika's shores to observe our closest genetic relatives. Mahale Mountains National Park offers similar experiences in even more remote and spectacular settings, with forest-covered peaks rising directly from the lake's crystal-clear waters.\n\nZanzibar, the semi-autonomous archipelago off Tanzania's coast, provides the perfect complement to safari adventures. Stone Town, the archipelago's historic heart and a UNESCO World Heritage Site, displays centuries of cultural confluence – African, Arab, Indian, and European influences mingle in its narrow alleys, ornate carved doorways, and bustling markets. The beaches of Zanzibar's north and east coasts consistently rank among the world's finest, with powder-white sand, swaying palms, and turquoise waters. Beyond beaches, Zanzibar offers spice plantation tours (the islands were once the world's largest clove producer), traditional dhow sailing, and excellent diving and snorkeling on coral reefs.\n\nPemba Island, north of Zanzibar, offers even more pristine diving conditions, while Mafia Island to the south hosts whale sharks between October and March. The Tanzanian coast and islands together form one of Africa's most comprehensive beach destinations.\n\nTanzania's cultural heritage extends far beyond the better-known Maasai. Over 120 ethnic groups call Tanzania home, speaking over 100 languages, though Swahili serves as the national lingua franca and English facilitates international communication. The Hadza people, one of the last hunter-gatherer societies in Africa, maintain ancient traditions in the Lake Eyasi region. The Datoga, skilled blacksmiths and pastoralists, live near the Hadza. The Sukuma, Tanzania's largest ethnic group, dominate the areas south of Lake Victoria. Coastal Swahili culture, with its unique blend of African, Arabic, and Indian Ocean influences, has produced distinctive architecture, cuisine, music, and literature, including some of Africa's finest poetry.\n\nTanzania's commitment to conservation is exceptional – approximately 38% of the country's land area is protected in various forms, from national parks and game reserves to forest reserves and marine parks. This commitment, combined with the country's political stability (Tanzania has never experienced a coup or civil war), has made it one of Africa's most successful wildlife tourism destinations.\n\nThe Tanzanian safari industry has pioneered various tourism innovations, from luxury mobile tented camps that follow the migration to community-owned conservancies that ensure local people benefit directly from wildlife. Walking safaris, night drives, and hot air balloon flights over the Serengeti add variety to traditional vehicle-based game viewing.",
  "additionalInfo": "Tanzania contains three of Africa's Great Lakes – Victoria (shared with Kenya and Uganda), Tanganyika (the world's second-deepest lake), and Nyasa (Lake Malawi, shared with Malawi and Mozambique). Lake Tanganyika is also the world's longest freshwater lake and contains an estimated 18% of the world's available fresh water.\n\nThe country has been at the forefront of paleontological discoveries. Olduvai Gorge in the Ngorongoro Conservation Area has yielded some of humanity's most important fossil discoveries, including remains of Homo habilis. Laetoli nearby preserves 3.6-million-year-old hominin footprints, demonstrating that our ancestors walked upright far earlier than previously believed.\n\nTanzania's agricultural sector produces world-renowned Tanzanian coffee (particularly from the Kilimanjaro and Mbeya regions), tea, cashews, and the world's only source of tanzanite, a rare blue-violet gemstone found only in the Mererani Hills near Mount Kilimanjaro.",
  "population": "63 million",
  "area": "947,303 km²",
  "languages": [
    "Swahili",
    "English"
  ],
  "officialLanguages": [
    "Swahili",
    "English"
  ],
  "ethnicGroups": [
    "Sukuma (16%)",
    "Chagga (6%)",
    "Haya (5%)",
    "Nyamwezi (4%)",
    "Maasai (2%)",
    "Over 120 other groups"
  ],
  "religions": [
    "Christianity (63%)",
    "Islam (34%)",
    "Traditional beliefs (2%)",
    "Others (1%)"
  ],
  "currency": "Tanzanian Shilling (TZS)",
  "currencySymbol": "TSh",
  "timezone": "East Africa Time (UTC+3)",
  "callingCode": "+255",
  "drivingSide": "Left",
  "climate": "Varies from tropical along coast to temperate in highlands",
  "seasons": {
    "dry": [
      "June-October (long dry)",
      "January-February (short dry)"
    ],
    "wet": [
      "March-May (long rains)",
      "November-December (short rains)"
    ],
    "best": "June to October for general wildlife and climbing; January-February for Serengeti calving season"
  },
  "bestTime": "June to October (dry season), January to February (calving season)",
  "visaInfo": "Visa required for most nationalities, available online (eVisa) or on arrival. Single entry visa valid for 90 days.",
  "healthInfo": "Yellow fever vaccination required when arriving from endemic countries. Malaria prophylaxis strongly recommended for all areas except Zanzibar urban areas.",
  "highlights": [
    "Serengeti National Park",
    "Mount Kilimanjaro",
    "Ngorongoro Crater",
    "Zanzibar Island & Stone Town",
    "Nyerere (Selous) Game Reserve",
    "Lake Manyara National Park",
    "Tarangire National Park",
    "Ruaha National Park",
    "Gombe Stream National Park",
    "Mahale Mountains National Park",
    "Pemba Island",
    "Mafia Island",
    "Olduvai Gorge",
    "Lake Tanganyika",
    "Mikumi National Park",
    "Katavi National Park",
    "Arusha National Park"
  ],
  "experiences": [
    "Summit Mount Kilimanjaro – the Roof of Africa",
    "Witness the Great Migration in the Serengeti",
    "Descend into the Ngorongoro Crater",
    "Explore Stone Town's winding alleys and history",
    "Dive with whale sharks off Mafia Island",
    "Track chimpanzees in Gombe or Mahale",
    "Relax on Zanzibar's pristine beaches",
    "Hot air balloon safari over the Serengeti",
    "Visit Hadza hunter-gatherers at Lake Eyasi",
    "Walk with Maasai warriors in the bush",
    "See tree-climbing lions at Lake Manyara",
    "Explore spice plantations on Zanzibar",
    "Dive pristine coral reefs at Pemba Island",
    "Canoe safari on the Rufiji River in Selous",
    "Visit Olduvai Gorge – the Cradle of Mankind",
    "Experience a traditional Swahili cooking class",
    "Witness the wildebeest calving season (January-February)",
    "Night safari in Serengeti or Ruaha"
  ],
  "wildlife": {
    "mammals": [
      "Lion",
      "Elephant",
      "Leopard",
      "Cheetah",
      "Rhino (Black)",
      "Buffalo",
      "Wildebeest",
      "Zebra",
      "Giraffe",
      "Hippo",
      "Crocodile",
      "Wild Dog",
      "Chimpanzee",
      "Tree-climbing Lions",
      "Various Antelope Species"
    ],
    "birds": [
      "Flamingo",
      "African Fish Eagle",
      "Secretary Bird",
      "Crowned Crane",
      "Kori Bustard",
      "Various Hornbills",
      "Lilac-breasted Roller"
    ],
    "marine": [
      "Whale Sharks",
      "Sea Turtles",
      "Dolphins",
      "Dugongs",
      "Tropical Reef Fish",
      "Humpback Whales (seasonal)"
    ]
  },
  "cuisine": {
    "staples": [
      "Ugali",
      "Wali (rice)",
      "Ndizi (plantains)",
      "Mishkaki (kebabs)",
      "Pilau"
    ],
    "specialties": [
      "Zanzibar Pizza",
      "Zanzibari Biryani",
      "Octopus curry",
      "Urojo (Zanzibar mix)",
      "Chips Mayai (fries omelet)"
    ],
    "beverages": [
      "Spiced Zanzibar tea",
      "Safari Lager",
      "Fresh sugarcane juice",
      "Coconut water",
      "Tanzanian coffee"
    ]
  },
  "festivals": [
    {
      "name": "Zanzibar International Film Festival (ZIFF)",
      "period": "July"
    },
    {
      "name": "Sauti za Busara Music Festival",
      "period": "February"
    },
    {
      "name": "Mwaka Kogwa (Zanzibar New Year)",
      "period": "July"
    },
    {
      "name": "Kilimanjaro Marathon",
      "period": "February"
    },
    {
      "name": "Union Day",
      "period": "April 26"
    },
    {
      "name": "Serengeti Wildebeest Calving",
      "period": "January-February"
    }
  ],
  "unescoSites": [
    "Serengeti National Park",
    "Ngorongoro Conservation Area",
    "Selous Game Reserve (Nyerere National Park)",
    "Kilimanjaro National Park",
    "Stone Town of Zanzibar",
    "Kondoa Rock-Art Sites",
    "Ruins of Kilwa Kisiwani and Songo Mnara"
  ],
  "travelTips": [
    "The northern circuit (Serengeti, Ngorongoro) is most visited; consider southern parks for fewer crowds",
    "Kilimanjaro climbs require good fitness; acclimatization is crucial for summit success",
    "Zanzibar adds perfect beach time to any safari itinerary",
    "Book well in advance for peak season (July-October) and Serengeti calving season (January-February)",
    "Tipping is expected; guides and camp staff rely on gratuities",
    "Dress modestly in Zanzibar and other Muslim areas",
    "US dollars are widely accepted; small bills are useful for tips",
    "Safari vehicles vary in quality; specify pop-up roof for photography",
    "Consider flying between destinations to maximize wildlife time",
    "Learn basic Swahili greetings – locals appreciate the effort"
  ],
  "airports": [
    {
      "name": "Julius Nyerere International Airport (DAR)",
      "location": "Dar es Salaam",
      "type": "International Hub"
    },
    {
      "name": "Kilimanjaro International Airport (JRO)",
      "location": "Arusha/Kilimanjaro",
      "type": "International"
    },
    {
      "name": "Abeid Amani Karume Airport (ZNZ)",
      "location": "Zanzibar",
      "type": "International"
    },
    {
      "name": "Arusha Airport (ARK)",
      "location": "Arusha",
      "type": "Regional"
    },
    {
      "name": "Seronera Airstrip",
      "location": "Serengeti",
      "type": "Safari"
    },
    {
      "name": "Lake Manyara Airstrip",
      "location": "Lake Manyara",
      "type": "Safari"
    }
  ],
  "images": [
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
    "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800",
    "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800",
    "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800",
    "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800"
  ],
  "heroImage": "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920",
  "mapPosition": {
    "lat": -6.369028,
    "lng": 34.888822
  },
  "neighboringCountries": [
    "Kenya",
    "Uganda",
    "Rwanda",
    "",
    "Democratic Republic of Congo",
    "Zambia",
    "Malawi",
    "Mozambique"
  ],
  "economicInfo": {
    "gdp": "$67.8 billion (2022)",
    "gdpPerCapita": "$1,136",
    "mainIndustries": [
      "Agriculture",
      "Mining",
      "Tourism",
      "Manufacturing"
    ],
    "exports": [
      "Gold",
      "Coffee",
      "Cashews",
      "Tea",
      "Tobacco",
      "Tanzanite"
    ]
  }
}
```

### Uganda

```json
{
  "id": "uganda",
  "name": "Uganda",
  "capital": "Kampala",
  "flag": "🇺🇬",
  "tagline": "Pearl of Africa",
  "motto": "For God and My Country",
  "independence": "October 9, 1962",
  "description": "Uganda, the Pearl of Africa, is blessed with extraordinary biodiversity, from endangered mountain gorillas to tree-climbing lions, set against a backdrop of verdant landscapes, the source of the Nile, and some of Africa's most welcoming people.",
  "fullDescription": "Uganda, affectionately known as the \"Pearl of Africa\" – a name bestowed by Sir Winston Churchill after his 1907 visit – is a land of extraordinary natural beauty, remarkable biodiversity, and warm hospitality. This compact yet incredibly diverse nation, straddling the equator in the heart of East Africa, offers experiences that range from life-changing encounters with mountain gorillas to adrenaline-pumping adventures at the source of the Nile.\n\nThe country's greatest treasure lies in the mist-shrouded forests of southwestern Uganda, where approximately half of the world's remaining endangered mountain gorillas make their home. Bwindi Impenetrable National Park, a UNESCO World Heritage Site, protects around 459 of these magnificent creatures in one of Africa's oldest and most biologically diverse forests. Trekking through the dense vegetation to encounter a gorilla family – observing their remarkably human behaviors, making eye contact with a silverback, watching mothers nurse their young – ranks among the world's most profound wildlife experiences. The park's name, \"Bwindi,\" means \"impenetrable\" in the local language, aptly describing the dense forest that provides sanctuary for these gentle giants.\n\nMgahinga Gorilla National Park, though smaller, offers the unique possibility of combining gorilla trekking with golden monkey tracking and the opportunity to summit one of the Virunga Volcanoes. The park's position at the intersection of Uganda, Rwanda, and the Democratic Republic of Congo places it in one of Africa's most geologically active and scenically dramatic regions.\n\nUganda's primate riches extend far beyond gorillas. Kibale Forest National Park, often called the \"Primate Capital of the World,\" harbors 13 primate species, including the highest density of chimpanzees in Africa – approximately 1,500 individuals. Chimpanzee tracking here offers an experience second only to gorilla trekking, with the added possibility of encountering red colobus, L'Hoest's monkeys, grey-cheeked mangabeys, and countless other species. The forest's network of trails also provides excellent birdwatching, with over 375 species recorded.\n\nQueen Elizabeth National Park, Uganda's most visited safari destination, spans the equator and offers diverse ecosystems from savanna and wetlands to forests and lakes. The park is famous for its tree-climbing lions in the Ishasha sector – these unusual felines spend their days lounging in the branches of fig trees, a behavior seen in few other places worldwide. Game drives reveal elephants, buffalo, leopards, hyenas, and various antelope species. Boat cruises on the Kazinga Channel, connecting Lakes Edward and George, provide close encounters with one of Africa's densest hippo populations, along with crocodiles, elephants, and abundant birdlife.\n\nMurchison Falls National Park, Uganda's largest protected area, showcases the world's most powerful waterfall. Here, the Victoria Nile forces through a gap just 7 meters wide before plunging 43 meters with tremendous force, creating a permanent rainbow and thunderous roar. The park's northern and southern banks harbor classic savanna wildlife, including giraffes, elephants, lions, and the rare Rothschild's giraffe. Boat cruises to the base of the falls combine wildlife viewing with the approach to this magnificent natural phenomenon. Hiking to the top of the falls offers breathtaking perspectives.\n\nThe source of the River Nile at Jinja has transformed this lakeside town into East Africa's adventure capital. Where the world's longest river begins its 6,650-kilometer journey to the Mediterranean, visitors can experience some of Africa's most exhilarating activities. White-water rafting through Grade 5 rapids, bungee jumping over the river, kayaking, jet boating, and quad biking draw adventure seekers from around the globe. For those seeking calmer experiences, sunset cruises and fishing trips offer more relaxed ways to appreciate this historic location.\n\nLake Bunyonyi, the \"Place of Many Little Birds,\" presents a dramatically different Uganda – a high-altitude lake of stunning beauty nestled in steep terraced hillsides. Often called the \"Switzerland of Africa,\" this area offers peaceful canoeing, swimming (the lake is bilharzia-free), and hiking among traditional villages. With 29 islands dotting its waters and surrounding hills rising to over 2,200 meters, Lake Bunyonyi provides a welcome respite from intensive wildlife activities.\n\nThe Rwenzori Mountains, also known as the \"Mountains of the Moon,\" rise along Uganda's western border to heights of 5,109 meters at Margherita Peak. These dramatic peaks, permanently snow-capped despite straddling the equator, support unique Afro-alpine vegetation including giant lobelias, groundsels, and heathers. Multi-day treks through successive vegetation zones culminate in glacial landscapes and challenging summit attempts. The Rwenzori range is believed to be the source of the Nile mentioned by ancient Greek geographers.\n\nUganda's cultural landscape is equally rich, with over 50 ethnic groups contributing to a vibrant national tapestry. The kingdom of Buganda, the largest traditional kingdom, maintains its cultural traditions, royal institutions, and the impressive Kasubi Tombs – a UNESCO World Heritage Site and burial place of Buganda kings. The Batwa, former forest-dwelling pygmies, share their cultural heritage through village experiences and forest walks. In the northeast, the Karamojong maintain warrior traditions and pastoral lifestyles similar to the Maasai. Traditional performances, craft markets, and community visits offer insights into Uganda's diverse cultural heritage.\n\nUganda's birdwatching credentials are exceptional – over 1,060 species have been recorded, representing about 11% of the world's bird species in just 0.02% of the Earth's surface. Bwindi, Kibale, Queen Elizabeth, Murchison Falls, and the wetlands of Lake Victoria create a birding circuit that draws enthusiasts from worldwide. Iconic species include the prehistoric-looking shoebill, great blue turaco, African green broadbill, and hundreds of other regional specialties.",
  "additionalInfo": "Uganda sits at the confluence of several biogeographic zones, explaining its remarkable biodiversity. The Western Rift Valley, forming the country's western border, creates habitat diversity from lowland forests to alpine environments. Lake Victoria, the world's second-largest freshwater lake by surface area, forms the southeastern border.\n\nThe country has made remarkable conservation strides, with populations of many species recovering strongly. Community conservation programs have transformed former poachers into rangers and guides, while revenue-sharing programs ensure local communities benefit directly from tourism.\n\nUgandan cuisine reflects the country's agricultural abundance, with matoke (cooking bananas), groundnuts, beans, and freshwater fish featuring prominently. The country's coffee industry is growing rapidly, with Ugandan Arabica from the Mount Elgon region gaining international recognition.\n\nUganda hosts one of Africa's largest refugee populations, primarily from South Sudan and the Democratic Republic of Congo, yet maintains political stability and welcomes tourists warmly.",
  "population": "47 million",
  "area": "241,038 km²",
  "languages": [
    "English",
    "Swahili",
    "Luganda"
  ],
  "officialLanguages": [
    "English",
    "Swahili"
  ],
  "ethnicGroups": [
    "Baganda (17%)",
    "Banyankole (10%)",
    "Basoga (8%)",
    "Bakiga (7%)",
    "Iteso (6%)",
    "Langi (6%)",
    "Over 50 other groups"
  ],
  "religions": [
    "Christianity (84%)",
    "Islam (14%)",
    "Traditional beliefs (1%)",
    "Others (1%)"
  ],
  "currency": "Ugandan Shilling (UGX)",
  "currencySymbol": "USh",
  "timezone": "East Africa Time (UTC+3)",
  "callingCode": "+256",
  "drivingSide": "Left",
  "climate": "Tropical; generally rainy with two dry seasons",
  "seasons": {
    "dry": [
      "December-February",
      "June-August"
    ],
    "wet": [
      "March-May",
      "September-November"
    ],
    "best": "June to August and December to February for gorilla trekking; year-round for general wildlife"
  },
  "bestTime": "June to August, December to February (dry seasons)",
  "visaInfo": "Visa required for most nationalities, available online (eVisa) before arrival. East Africa Tourist Visa allows entry to Uganda, Kenya, and Rwanda.",
  "healthInfo": "Yellow fever vaccination required for entry. Malaria prophylaxis strongly recommended throughout the country.",
  "highlights": [
    "Bwindi Impenetrable National Park",
    "Murchison Falls National Park",
    "Queen Elizabeth National Park",
    "Source of the Nile at Jinja",
    "Lake Bunyonyi",
    "Kibale Forest National Park",
    "Rwenzori Mountains",
    "Mgahinga Gorilla National Park",
    "Ssese Islands",
    "Kidepo Valley National Park",
    "Lake Mburo National Park",
    "Ziwa Rhino Sanctuary",
    "Kasubi Tombs",
    "Entebbe Botanical Gardens",
    "Ngamba Island Chimpanzee Sanctuary",
    "Sipi Falls"
  ],
  "experiences": [
    "Trek to encounter mountain gorillas in Bwindi",
    "Raft the Class 5 rapids of the Nile at Jinja",
    "Spot tree-climbing lions in Ishasha",
    "Track chimpanzees in Kibale Forest",
    "Cruise to the base of Murchison Falls",
    "Explore traditional Buganda kingdom sites",
    "Summit the Mountains of the Moon (Rwenzori)",
    "Search for shoebill storks in Mabamba Swamp",
    "Experience the source of the Nile",
    "Relax on the shores of Lake Bunyonyi",
    "Visit Ziwa Rhino Sanctuary",
    "Track golden monkeys in Mgahinga",
    "Bungee jump over the Nile",
    "Explore remote Kidepo Valley National Park",
    "Learn about Batwa pygmy culture",
    "Birdwatching for over 1,000 species",
    "Boat safari on Kazinga Channel",
    "Night forest walks for nocturnal wildlife"
  ],
  "wildlife": {
    "mammals": [
      "Mountain Gorilla",
      "Chimpanzee",
      "Lion",
      "Elephant",
      "Leopard",
      "Buffalo",
      "Hippo",
      "Rothschild's Giraffe",
      "Tree-climbing Lions",
      "Golden Monkey",
      "Various Colobus Monkeys",
      "White Rhino (reintroduced)",
      "Uganda Kob"
    ],
    "birds": [
      "Shoebill Stork",
      "Great Blue Turaco",
      "African Green Broadbill",
      "Grey Crowned Crane (national bird)",
      "African Fish Eagle",
      "Papyrus Gonolek",
      "Various Hornbills"
    ],
    "primates": [
      "Mountain Gorilla",
      "Chimpanzee",
      "Golden Monkey",
      "Red Colobus",
      "Black-and-white Colobus",
      "Grey-cheeked Mangabey",
      "L'Hoest's Monkey",
      "Olive Baboon",
      "Vervet Monkey",
      "Blue Monkey",
      "Potto",
      "Bushbaby"
    ]
  },
  "cuisine": {
    "staples": [
      "Matoke (cooking bananas)",
      "Posho (maize meal)",
      "Groundnut sauce",
      "Beans",
      "Chapati"
    ],
    "specialties": [
      "Rolex (chapati egg roll)",
      "Luwombo (steamed meat in banana leaves)",
      "Kikomando (chapati with beans)",
      "Muchomo (roasted meat)",
      "Nile perch dishes"
    ],
    "beverages": [
      "Ugandan tea",
      "Ugandan coffee",
      "Bell Lager",
      "Fresh fruit juices",
      "Waragi (local gin)"
    ]
  },
  "festivals": [
    {
      "name": "Nyege Nyege Festival",
      "period": "September"
    },
    {
      "name": "Bayimba International Festival",
      "period": "September"
    },
    {
      "name": "Uganda International Marathon",
      "period": "June"
    },
    {
      "name": "Kampala City Festival",
      "period": "October"
    },
    {
      "name": "Independence Day",
      "period": "October 9"
    },
    {
      "name": "Rolex Festival",
      "period": "August"
    }
  ],
  "unescoSites": [
    "Bwindi Impenetrable National Park",
    "Rwenzori Mountains National Park",
    "Tombs of Buganda Kings at Kasubi"
  ],
  "travelTips": [
    "Book gorilla permits well in advance (6+ months recommended); only 8 permits per gorilla family per day",
    "Gorilla permits cost $700 and are strictly regulated",
    "Fitness is important for gorilla trekking – treks can last 1-8 hours",
    "Pack waterproof gear and sturdy hiking boots for forest treks",
    "Chimpanzee tracking offers excellent value compared to gorilla trekking",
    "Combine multiple parks into a circuit for best value",
    "The East Africa Tourist Visa allows travel to Uganda, Kenya, and Rwanda",
    "Yellow fever certificate is mandatory for entry",
    "Respect local customs; ask before photographing people",
    "Mobile money (MTN and Airtel) is widely used"
  ],
  "airports": [
    {
      "name": "Entebbe International Airport (EBB)",
      "location": "Entebbe",
      "type": "International Hub"
    },
    {
      "name": "Kajjansi Airfield",
      "location": "Kampala",
      "type": "Domestic/Charter"
    },
    {
      "name": "Kasese Airfield",
      "location": "Kasese (Queen Elizabeth NP)",
      "type": "Safari"
    },
    {
      "name": "Kihihi Airfield",
      "location": "Bwindi",
      "type": "Safari"
    },
    {
      "name": "Pakuba Airfield",
      "location": "Murchison Falls NP",
      "type": "Safari"
    }
  ],
  "images": [
    "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800",
    "https://images.unsplash.com/photo-1553775282-20af80779df7?w=800",
    "https://images.unsplash.com/photo-1578507065211-1c4e99a5fd24?w=800",
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
    "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800"
  ],
  "heroImage": "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=1920",
  "mapPosition": {
    "lat": 1.373333,
    "lng": 32.290275
  },
  "neighboringCountries": [
    "Kenya",
    "Tanzania",
    "Rwanda",
    "Democratic Republic of Congo",
    "South Sudan"
  ],
  "economicInfo": {
    "gdp": "$45.6 billion (2022)",
    "gdpPerCapita": "$964",
    "mainIndustries": [
      "Agriculture",
      "Tourism",
      "Mining",
      "Manufacturing"
    ],
    "exports": [
      "Coffee",
      "Fish",
      "Tea",
      "Tobacco",
      "Cotton",
      "Gold"
    ]
  }
}
```

### Rwanda

```json
{
  "id": "rwanda",
  "name": "Rwanda",
  "capital": "Kigali",
  "flag": "🇷🇼",
  "tagline": "Land of a Thousand Hills",
  "motto": "Ubumwe, Umurimo, Gukunda Igihugu (Unity, Work, Patriotism)",
  "independence": "July 1, 1962",
  "description": "Rwanda, the \"Land of a Thousand Hills,\" has emerged as one of Africa's most remarkable success stories, combining world-class conservation, cultural renaissance, sustainable development, and a commitment to excellence that has transformed it into a premier destination.",
  "fullDescription": "Rwanda has undergone one of history's most remarkable transformations, rising from the ashes of the 1994 genocide to become Africa's most clean, safe, and innovative nation. Known as the \"Land of a Thousand Hills\" for its stunning landscape of undulating verdant hillsides, terraced agriculture, and mist-shrouded volcanic peaks, Rwanda offers visitors world-class wildlife experiences wrapped in extraordinary natural beauty and warm hospitality.\n\nThe country's greatest treasure – and a powerful symbol of successful conservation – is its population of endangered mountain gorillas, protected in the mist-shrouded forests of Volcanoes National Park (Parc National des Volcans). This park, part of the greater Virunga Conservation Area shared with Uganda and the Democratic Republic of Congo, protects roughly one-third of the world's remaining mountain gorillas. Here, in the shadow of five volcanic peaks, visitors can undertake the life-changing experience of trekking through bamboo forests and steep hillsides to spend a precious hour observing a gorilla family.\n\nThe park was made famous by American primatologist Dian Fossey, who established the Karisoke Research Center in 1967 and dedicated her life to gorilla conservation until her murder in 1985. Her grave, alongside those of beloved gorillas including Digit, lies within the park, a pilgrimage site for those inspired by her work. Her legacy continues through ongoing research and Rwanda's remarkably successful conservation programs, which have seen mountain gorilla populations steadily increase.\n\nVolcanoes National Park offers more than gorillas. Golden monkeys, another endangered primate species, inhabit the bamboo forests and can be tracked in a similar but less demanding experience. The volcanic peaks themselves, including Mount Karisimbi (4,507m) and Mount Bisoke with its stunning crater lake, offer challenging hikes with spectacular rewards. The Dian Fossey tomb trek and visits to caves once inhabited by ancient humans add cultural and historical dimensions.\n\nNyungwe Forest National Park, in Rwanda's southwest, protects one of Africa's oldest montane rainforests – a biodiversity hotspot harboring 13 primate species, over 300 bird species, and remarkable flora. Chimpanzee tracking here offers another compelling primate encounter, though the forest's steep terrain makes this a physically demanding activity. Rwanda's famous canopy walkway, suspended 50 meters above the forest floor, provides unique perspectives of the forest ecosystem. Troops of L'Hoest's monkeys, grey-cheeked mangabeys, and colobus monkeys are regularly encountered on forest trails, while the rare Albertine Rift endemic birds draw serious birders.\n\nAkagera National Park, along the Tanzanian border in eastern Rwanda, represents the country's successful restoration of Big Five safari experiences. After populations of many species were decimated in the years following the genocide, an ambitious rewilding program has reintroduced lions (2015), rhinos (2017), and other species. Today, Akagera offers classic savanna safari experiences – elephants, giraffes, zebras, hippos, crocodiles, and diverse birdlife in a landscape of lakes, swamps, and grasslands. Game drives, night drives, and boat safaris on Lake Ihema provide varied perspectives.\n\nLake Kivu, one of Africa's Great Lakes, forms Rwanda's western border with the Democratic Republic of Congo. This stunning freshwater lake, remarkably free of crocodiles and bilharzia due to volcanic gases in its depths, offers swimming, kayaking, island-hopping, and relaxation along its shores. The lakeside towns of Rubavu (Gisenyi) and Karongi (Kibuye) provide perfect post-trekking recovery with their beaches, boutique hotels, and scenic beauty. The lake's unique characteristic – it contains vast quantities of dissolved methane and carbon dioxide – has been turned into an innovative energy source, with extraction plants producing electricity for the national grid.\n\nKigali, Rwanda's capital and commercial center, consistently surprises visitors with its cleanliness, safety, order, and progressive development. The city's hillside geography creates dramatic viewpoints, while its restaurants, cafes, boutique hotels, and cultural institutions reflect Rwanda's ambitious vision. The Kigali Genocide Memorial, final resting place for over 250,000 victims and the most comprehensive documentation of the 1994 genocide, provides essential historical context – a sobering but necessary experience that deepens appreciation for Rwanda's remarkable reconciliation and recovery.\n\nCultural experiences abound throughout Rwanda. The Iby'Iwacu Cultural Village near Volcanoes National Park offers immersive experiences with former poachers turned cultural ambassadors, including traditional dancing, archery, brewing, and visits to reconstructed royal dwellings. The King's Palace Museum in Nyanza preserves the traditional royal kraal and provides insight into Rwanda's pre-colonial monarchy. Contemporary art galleries in Kigali showcase the country's creative renaissance, while cooperative workshops demonstrate traditional basketry – the intricately woven \"peace baskets\" having become symbols of Rwanda's recovery.\n\nRwanda's legendary coffee, grown on volcanic hillsides and processed at numerous washing stations, has earned international acclaim. Coffee tours allow visitors to follow the bean from tree to cup, often ending with cupping sessions of some of Africa's finest specialty coffee. Tea plantations near Nyungwe offer similar experiences, with tours through verdant estates and tastings of Rwandan tea.\n\nThe country's commitment to sustainability is evident everywhere – from the worldwide ban on plastic bags (enforced since 2008) to monthly community cleaning days (Umuganda), when citizens gather to maintain public spaces. This environmental stewardship extends to premium positioning for tourism, with high fees but exceptional service and low visitor numbers ensuring quality experiences while maximizing conservation and community benefits.",
  "additionalInfo": "Rwanda is Africa's most densely populated mainland country, yet maintains remarkable environmental programs. The country aims to become a high-income nation by 2050 through its Vision 2050 development strategy.\n\nThe gorilla naming ceremony, \"Kwita Izina,\" is an annual event celebrating new gorilla births, drawing international celebrities, conservationists, and dignitaries. Each baby gorilla is given a name, emphasizing the individual value of these magnificent creatures.\n\nWomen hold a majority of parliamentary seats in Rwanda, the highest proportion of female legislators in the world. The country has also pioneered innovations in healthcare delivery, including using drones to deliver blood supplies to remote clinics.\n\nRwanda is increasingly positioning itself as a conference and business tourism destination, with state-of-the-art facilities including the Kigali Convention Centre. The country has sponsored Arsenal Football Club and Paris Saint-Germain as part of its global marketing strategy.",
  "population": "13 million",
  "area": "26,338 km²",
  "languages": [
    "Kinyarwanda",
    "English",
    "French",
    "Swahili"
  ],
  "officialLanguages": [
    "Kinyarwanda",
    "English",
    "French",
    "Swahili"
  ],
  "ethnicGroups": [
    "Hutu (84%)",
    "Tutsi (15%)",
    "Twa (1%)"
  ],
  "religions": [
    "Christianity (93%)",
    "Islam (5%)",
    "Traditional beliefs (1%)",
    "None (1%)"
  ],
  "currency": "Rwandan Franc (RWF)",
  "currencySymbol": "FRw",
  "timezone": "Central Africa Time (UTC+2)",
  "callingCode": "+250",
  "drivingSide": "Right",
  "climate": "Temperate highland; two rainy seasons",
  "seasons": {
    "dry": [
      "June-September",
      "December-February"
    ],
    "wet": [
      "March-May (long rains)",
      "October-November (short rains)"
    ],
    "best": "June to September and December to February for gorilla trekking and general travel"
  },
  "bestTime": "June to September, December to February (dry seasons)",
  "visaInfo": "Visa on arrival for most nationalities; some can obtain eVisa. 30-day visa costs $50. East Africa Tourist Visa available.",
  "healthInfo": "Yellow fever vaccination required if arriving from endemic areas. Malaria risk in lower-altitude areas; highlands are generally safe.",
  "highlights": [
    "Volcanoes National Park",
    "Nyungwe Forest National Park",
    "Lake Kivu",
    "Akagera National Park",
    "Kigali City",
    "Kigali Genocide Memorial",
    "King's Palace Museum (Nyanza)",
    "Twin Lakes (Burera & Ruhondo)",
    "Musanze Caves",
    "Ethnographic Museum (Huye)",
    "Iby'Iwacu Cultural Village",
    "Bisoke Crater Lake",
    "Rubavu (Lake Kivu beaches)",
    "Congo Nile Trail"
  ],
  "experiences": [
    "Trek to encounter mountain gorillas in the Virungas",
    "Track golden monkeys in bamboo forests",
    "Observe chimpanzees in Nyungwe Forest",
    "Walk the canopy walkway above the rainforest",
    "Safari for lions and elephants in Akagera",
    "Kayak on the tranquil waters of Lake Kivu",
    "Pay respects at the Kigali Genocide Memorial",
    "Cycle the Congo Nile Trail along Lake Kivu",
    "Visit coffee plantations and learn about processing",
    "Hike to Bisoke crater lake",
    "Explore Musanze caves",
    "Visit the grave of Dian Fossey",
    "Experience traditional Intore dancing",
    "Learn basket weaving from local cooperatives",
    "Boat safari on Lake Ihema in Akagera",
    "Summit Mount Karisimbi",
    "Explore Kigali's art galleries and restaurants",
    "Visit traditional royal sites at Nyanza"
  ],
  "wildlife": {
    "mammals": [
      "Mountain Gorilla",
      "Chimpanzee",
      "Golden Monkey",
      "Elephant",
      "Lion",
      "White Rhino",
      "Black Rhino",
      "Buffalo",
      "Giraffe",
      "Zebra",
      "Hippo",
      "Various Antelope",
      "Various Forest Monkeys"
    ],
    "birds": [
      "Great Blue Turaco",
      "Ruwenzori Turaco",
      "Albertine Rift Endemics",
      "Papyrus Gonolek",
      "Shoebill (rare)",
      "Various Sunbirds"
    ],
    "primates": [
      "Mountain Gorilla",
      "Chimpanzee",
      "Golden Monkey",
      "Owl-faced Monkey",
      "L'Hoest's Monkey",
      "Grey-cheeked Mangabey",
      "Blue Monkey",
      "Black-and-white Colobus",
      "Red Colobus",
      "Olive Baboon"
    ]
  },
  "cuisine": {
    "staples": [
      "Ugali (ubugari)",
      "Isombe (cassava leaves)",
      "Ibihaza (pumpkins)",
      "Beans",
      "Plantains"
    ],
    "specialties": [
      "Brochettes (skewered meat)",
      "Tilapia from Lake Kivu",
      "Akabenz (small fried fish)",
      "Igisafuliya (local stew)",
      "Ibirayi (potatoes)"
    ],
    "beverages": [
      "Rwandan coffee",
      "Ikivuguto (fermented milk)",
      "Urwagwa (banana beer)",
      "Primus beer",
      "Tea"
    ]
  },
  "festivals": [
    {
      "name": "Kwita Izina (Gorilla Naming Ceremony)",
      "period": "September"
    },
    {
      "name": "Umuganura (National Harvest Day)",
      "period": "August"
    },
    {
      "name": "Genocide Commemoration Week (Kwibuka)",
      "period": "April 7-13"
    },
    {
      "name": "Independence Day",
      "period": "July 1"
    },
    {
      "name": "Liberation Day",
      "period": "July 4"
    },
    {
      "name": "Kigali Up Festival",
      "period": "November"
    }
  ],
  "unescoSites": [
    "Nyungwe National Park (Tentative)",
    "Memorial sites of the Genocide (Tentative)"
  ],
  "travelTips": [
    "Gorilla permits cost $1,500 – book months in advance",
    "Permits are limited to 8 per gorilla group per day",
    "Rwanda is extremely safe – one of Africa's safest countries",
    "Plastic bags are banned – use paper or cloth alternatives",
    "Tip in Rwandan francs or US dollars",
    "Dress smartly in Kigali; Rwandans take pride in appearance",
    "Photography of military installations and government buildings is prohibited",
    "The genocide memorial requires respectful behavior; photography restrictions apply",
    "Credit cards are accepted in major hotels and restaurants; cash needed elsewhere",
    "Gorilla trekking requires reasonable fitness; porters are available",
    "Learn a few Kinyarwanda phrases – \"Muraho\" (Hello), \"Murakoze\" (Thank you)"
  ],
  "airports": [
    {
      "name": "Kigali International Airport (KGL)",
      "location": "Kigali",
      "type": "International Hub"
    },
    {
      "name": "Kamembe Airport",
      "location": "Cyangugu (Lake Kivu)",
      "type": "Domestic"
    },
    {
      "name": "Bugesera International Airport",
      "location": "Kigali (under construction)",
      "type": "Future Hub"
    }
  ],
  "images": [
    "https://images.unsplash.com/photo-1580746738783-63c5b771c993?w=800",
    "https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=800",
    "https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=800",
    "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800",
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800"
  ],
  "heroImage": "https://images.unsplash.com/photo-1580746738783-63c5b771c993?w=1920",
  "mapPosition": {
    "lat": -1.940278,
    "lng": 29.873888
  },
  "neighboringCountries": [
    "Uganda",
    "Tanzania",
    "",
    "Democratic Republic of Congo"
  ],
  "economicInfo": {
    "gdp": "$11.1 billion (2022)",
    "gdpPerCapita": "$833",
    "mainIndustries": [
      "Agriculture",
      "Tourism",
      "Mining",
      "Services",
      "Technology"
    ],
    "exports": [
      "Coffee",
      "Tea",
      "Minerals (coltan, tin, tungsten)",
      "Pyrethrum"
    ]
  }
}
```

### Ethiopia

```json
{
  "id": "ethiopia",
  "name": "Ethiopia",
  "capital": "Addis Ababa",
  "flag": "🇪🇹",
  "tagline": "Land of Origins",
  "motto": "Ethiopia Stretches Her Hands unto God",
  "independence": "Never colonized (ancient independent nation)",
  "description": "Ethiopia, the cradle of humanity and birthplace of coffee, offers an extraordinary journey through ancient civilizations, unique wildlife found nowhere else on Earth, and landscapes ranging from the soaring Simien Mountains to the otherworldly Danakil Depression.",
  "fullDescription": "Ethiopia stands alone among African nations – a land where ancient civilizations flourished for millennia, where Christianity took root in the 4th century, where unique species evolved in isolation, and where the very origins of humanity may be traced. Never colonized (except for a brief Italian occupation from 1936-1941), Ethiopia has preserved traditions, customs, and a sense of identity stretching back thousands of years.\n\nThe country claims the title \"Cradle of Humanity\" with legitimate authority. The 3.2-million-year-old fossilized remains of \"Lucy\" (known locally as Dinkinesh, meaning \"you are wonderful\"), our most famous ancient ancestor, were discovered in the Afar region in 1974. Older hominid fossils have since been found in Ethiopian soil, reinforcing the nation's role in human evolution. This deep history continues through the legendary meeting of King Solomon and the Queen of Sheba, whose lineage allegedly produced Menelik I and established Ethiopia's Solomonic dynasty.\n\nThe Historic Route through northern Ethiopia traces millennia of civilization. Lalibela, the \"New Jerusalem,\" contains 11 medieval rock-hewn churches carved directly from solid volcanic rock in the 12th and 13th centuries. These UNESCO World Heritage monuments, still actively used for Orthodox Christian worship, represent one of the world's most remarkable feats of architecture and devotion. The Church of Saint George (Bete Giyorgis), carved in the shape of a Greek cross and descending 15 meters into the earth, epitomizes this achievement. During important religious festivals, particularly Ethiopian Christmas (Genna) and Timkat (Epiphany), the churches come alive with white-robed worshippers, ancient chants, and ceremonies unchanged for centuries.\n\nAxum (Aksum), once the capital of the powerful Aksumite Empire, preserves monuments spanning over 2,000 years. The towering stelae field, featuring massive carved obelisks up to 33 meters tall, marks the tombs of ancient kings. Ethiopians believe the Ark of the Covenant resides in the Church of St. Mary of Zion – guarded by a single monk who never leaves the chapel. The ruins of the Queen of Sheba's palace, ancient tombs, and the oldest standing church in sub-Saharan Africa add to Axum's significance.\n\nGondar, the \"Camelot of Africa,\" served as Ethiopia's capital from 1636 to 1855, and its Royal Enclosure (Fasil Ghebbi) contains castles, palaces, and churches that blend Ethiopian, Portuguese, Moorish, and Hindu influences. The fairy-tale turrets and towers of Emperor Fasilides' castle seem transported from medieval Europe, yet remain distinctly Ethiopian. The Debre Berhan Selassie church, with its famous ceiling painted with angelic faces, represents the pinnacle of Ethiopian ecclesiastical art.\n\nThe Simien Mountains National Park, a UNESCO World Heritage Site, offers some of Africa's most spectacular trekking. Massive basalt escarpments plunge 1,500 meters to distant valleys, while peaks rise to 4,533 meters at Ras Dashen, Ethiopia's highest point. The park protects endemic species found nowhere else on Earth: the Gelada baboon, the world's only grass-eating primate, grazes in troops of hundreds on the mountain meadows; the Ethiopian wolf, the world's rarest canid, hunts rodents on the Afro-alpine moorlands; the Walia ibex, a magnificent wild goat, navigates seemingly impossible cliff faces. Multi-day treks through changing landscapes and remote villages provide immersive adventures.\n\nThe Danakil Depression ranks among Earth's most extreme and visually stunning environments. Lying more than 100 meters below sea level in the Afar region, this geological wonder presents landscapes more alien than terrestrial. Sulfur springs in yellows, greens, and reds bubble at Dallol, the hottest inhabited place on Earth. Salt flats stretch to distant horizons, mined by Afar caravans using methods unchanged for centuries. Erta Ale, one of the world's few permanent lava lakes, glows red against the night sky. Despite extreme temperatures routinely exceeding 50°C, organized tours allow adventurous travelers to experience this remarkable region.\n\nThe Omo Valley in southwestern Ethiopia preserves some of Africa's most distinctive tribal cultures. The Mursi, known for their clay lip plates; the Hamar, with their bull-jumping ceremonies and intricate hairstyles; the Karo, who paint elaborate body decorations; and numerous other groups maintain traditions largely unchanged by modernity. Visiting requires sensitivity and often negotiation, but offers glimpses into ways of life rapidly disappearing elsewhere.\n\nThe Bale Mountains National Park, in southeastern Ethiopia, protects additional endemic species, including the largest population of Ethiopian wolves and the endangered mountain nyala. The Harenna Forest, one of Africa's largest remaining cloud forests, harbors the elusive Bale monkey. The Sanetti Plateau, at over 4,000 meters, provides outstanding wolf sightings in Afro-alpine landscapes.\n\nEthiopian culture permeates every experience. The Ethiopian Orthodox Church, one of Christianity's oldest branches, maintains traditions including its own biblical canon, calendar (seven years behind the Gregorian calendar), and time system (with days beginning at sunrise). Religious festivals, particularly Timkat and Meskel, create colorful spectacles of faith. The country's cuisine, built around injera (spongy sourdough flatbread) and various wots (stews), presents unique flavors found nowhere else – and satisfies vegetarians better than any other African cuisine due to Orthodox fasting traditions. The coffee ceremony, essential to Ethiopian hospitality, celebrates the beverage Ethiopia gave to the world, with beans roasted, ground, and brewed before guests in an aromatic ritual.\n\nAddis Ababa, the highest capital city in Africa at 2,400 meters, serves as headquarters for the African Union and offers excellent museums, including the National Museum housing Lucy's remains. The city's vibrant music scene, diverse restaurants, and bustling Merkato – Africa's largest open-air market – provide urban contrasts to rural adventures.",
  "additionalInfo": "Ethiopia operates on its own calendar (the Ethiopian calendar, based on the Coptic calendar), which runs 7-8 years behind the Gregorian calendar. The Ethiopian New Year falls on September 11 (or 12 in leap years). The Ethiopian time system also differs, with the day beginning at sunrise (6 AM Western time = 12:00 Ethiopian time).\n\nCoffee was discovered in Ethiopia, according to legend by a goatherd named Kaldi who noticed his goats becoming energetic after eating certain berries. The country remains Africa's largest coffee producer and the world's fifth-largest, with the ceremony remaining central to social and business life.\n\nEthiopia's 13-month calendar (\"thirteen months of sunshine\") is often used in tourism marketing. The \"extra\" month, Pagume, has only 5 or 6 days.\n\nEthiopian runners have dominated world distance running, with the high-altitude training grounds producing numerous Olympic and world champions.",
  "population": "120 million",
  "area": "1,104,300 km²",
  "languages": [
    "Amharic",
    "English",
    "Oromo",
    "Tigrinya",
    "Somali"
  ],
  "officialLanguages": [
    "Amharic (federal)",
    "Various regional languages"
  ],
  "ethnicGroups": [
    "Oromo (34%)",
    "Amhara (27%)",
    "Somali (6%)",
    "Tigray (6%)",
    "Sidama (4%)",
    "Over 80 other groups"
  ],
  "religions": [
    "Ethiopian Orthodox (44%)",
    "Islam (34%)",
    "Protestant (19%)",
    "Traditional (3%)"
  ],
  "currency": "Ethiopian Birr (ETB)",
  "currencySymbol": "Br",
  "timezone": "East Africa Time (UTC+3)",
  "callingCode": "+251",
  "drivingSide": "Right",
  "climate": "Tropical monsoon with wide topographic-induced variation",
  "seasons": {
    "dry": [
      "October-May"
    ],
    "wet": [
      "June-September (main rains)",
      "February-May (small rains in south)"
    ],
    "best": "October to March (dry season); September for Meskel Festival; January for Timkat"
  },
  "bestTime": "October to March (dry season)",
  "visaInfo": "eVisa required for most nationalities; available online. Some nationalities can obtain visa on arrival at Addis Ababa airport.",
  "healthInfo": "Yellow fever vaccination required if arriving from endemic countries. Malaria prophylaxis recommended for areas below 2,000 meters.",
  "highlights": [
    "Rock-Hewn Churches of Lalibela",
    "Simien Mountains National Park",
    "Danakil Depression",
    "Axum Obelisks and Ancient Sites",
    "Gondar Castles (Fasil Ghebbi)",
    "Omo Valley Tribal Cultures",
    "Blue Nile Falls (Tis Abay)",
    "Bale Mountains National Park",
    "Lake Tana Monasteries",
    "Harar Walled City",
    "Addis Ababa and National Museum",
    "Erta Ale Volcano",
    "Tigray Rock Churches",
    "Debre Damo Monastery"
  ],
  "experiences": [
    "Explore the rock-hewn churches of Lalibela",
    "Trek through the Simien Mountains with endemic wildlife",
    "Witness the otherworldly landscapes of the Danakil Depression",
    "Stand before the ancient obelisks of Axum",
    "Attend Timkat (Epiphany) celebrations",
    "Experience coffee ceremony hospitality",
    "Meet Omo Valley tribes",
    "Search for Ethiopian wolves in the Bale Mountains",
    "Explore Gondar's medieval castles",
    "Visit the ancient walls and hyena feeding in Harar",
    "See Gelada baboons in their natural habitat",
    "Boat to ancient island monasteries on Lake Tana",
    "Taste authentic Ethiopian cuisine",
    "Experience Ethiopian Orthodox services at dawn",
    "Watch the Erta Ale lava lake by night",
    "Visit Lucy at the National Museum",
    "Attend Meskel (Finding of the True Cross) celebrations"
  ],
  "wildlife": {
    "mammals": [
      "Gelada Baboon",
      "Ethiopian Wolf",
      "Walia Ibex",
      "Mountain Nyala",
      "Bale Monkey",
      "Menelik's Bushbuck",
      "Spotted Hyena",
      "Lion",
      "Elephant",
      "Various Antelope"
    ],
    "birds": [
      "Ethiopian Siskin",
      "Spot-breasted Lapwing",
      "Blue-winged Goose",
      "Thick-billed Raven",
      "Wattled Ibis",
      "Black-headed Siskin",
      "Abyssinian Longclaw",
      "Prince Ruspoli's Turaco"
    ],
    "endemics": "Ethiopia has more endemic mammals than any other African country"
  },
  "cuisine": {
    "staples": [
      "Injera (fermented flatbread)",
      "Berbere (spice blend)",
      "Niter kibbeh (spiced butter)",
      "Teff (grain)"
    ],
    "specialties": [
      "Doro Wot (chicken stew)",
      "Kitfo (Ethiopian tartare)",
      "Tibs (sautéed meat)",
      "Shiro (chickpea stew)",
      "Beyainatu (fasting platter)"
    ],
    "beverages": [
      "Ethiopian coffee",
      "Tej (honey wine)",
      "Tella (traditional beer)",
      "Fresh fruit juices"
    ]
  },
  "festivals": [
    {
      "name": "Timkat (Epiphany)",
      "period": "January 19"
    },
    {
      "name": "Meskel (Finding of the True Cross)",
      "period": "September 27"
    },
    {
      "name": "Genna (Ethiopian Christmas)",
      "period": "January 7"
    },
    {
      "name": "Fasika (Ethiopian Easter)",
      "period": "April (varies)"
    },
    {
      "name": "Ethiopian New Year (Enkutatash)",
      "period": "September 11"
    },
    {
      "name": "Hidar Zion (St. Mary of Zion)",
      "period": "November/December"
    }
  ],
  "unescoSites": [
    "Rock-Hewn Churches of Lalibela",
    "Simien National Park",
    "Fasil Ghebbi, Gondar Region",
    "Aksum Archaeological Site",
    "Lower Valley of the Awash (Lucy)",
    "Lower Valley of the Omo",
    "Tiya Standing Stones",
    "Harar Jugol, the Fortified Historic Town",
    "Konso Cultural Landscape"
  ],
  "travelTips": [
    "Ethiopia uses its own calendar and time system – confirm dates and times carefully",
    "The country is 7-8 years behind the Gregorian calendar",
    "Most Ethiopians are friendly to photography, but always ask first",
    "Dress modestly when visiting churches; women may need head coverings",
    "Learn to eat with your right hand – the left is considered unclean",
    "Fasting days (Wednesdays and Fridays) mean many restaurants serve only vegetarian food",
    "Book internal flights early, especially during festival periods",
    "The Historic Route can be done by land or with multiple flights",
    "Altitude sickness can affect visitors in highlands; acclimatize in Addis Ababa",
    "Carry small bills – change is often scarce",
    "Ethiopian coffee is prepared fresh – enjoy the ceremony"
  ],
  "airports": [
    {
      "name": "Bole International Airport (ADD)",
      "location": "Addis Ababa",
      "type": "International Hub"
    },
    {
      "name": "Lalibela Airport",
      "location": "Lalibela",
      "type": "Domestic"
    },
    {
      "name": "Axum Airport",
      "location": "Axum",
      "type": "Domestic"
    },
    {
      "name": "Gondar Airport",
      "location": "Gondar",
      "type": "Domestic"
    },
    {
      "name": "Bahir Dar Airport",
      "location": "Bahir Dar",
      "type": "Domestic"
    },
    {
      "name": "Mekele Airport",
      "location": "Mekele",
      "type": "Domestic"
    },
    {
      "name": "Dire Dawa Airport",
      "location": "Dire Dawa",
      "type": "Domestic"
    }
  ],
  "images": [
    "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800",
    "https://images.unsplash.com/photo-1569144654912-5f146d155a23?w=800",
    "https://images.unsplash.com/photo-1510155324852-d5d2dbe7a5e8?w=800",
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
    "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800"
  ],
  "heroImage": "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1920",
  "mapPosition": {
    "lat": 9.145,
    "lng": 40.489673
  },
  "neighboringCountries": [
    "Eritrea",
    "Djibouti",
    "Somalia",
    "Kenya",
    "South Sudan",
    "Sudan"
  ],
  "economicInfo": {
    "gdp": "$126.8 billion (2022)",
    "gdpPerCapita": "$1,027",
    "mainIndustries": [
      "Agriculture",
      "Manufacturing",
      "Services",
      "Construction"
    ],
    "exports": [
      "Coffee",
      "Oilseeds",
      "Flowers",
      "Leather",
      "Gold",
      "Khat"
    ]
  }
}
```

### unknown-country

```json
{
  "id": "",
  "name": "",
  "capital": "Gitega",
  "commercialCapital": "Bujumbura",
  "flag": "🇧🇮",
  "tagline": "Heart of Africa",
  "motto": "Ubumwe, Ibikorwa, Iterambere (Unity, Work, Progress)",
  "independence": "July 1, 1962",
  "description": ", the \"Heart of Africa,\" offers intimate encounters with authentic African culture and nature, from the ancient shores of Lake Tanganyika to the world-famous Royal Drummers, the misty source of the Nile, and highland tea plantations.",
  "fullDescription": ", one of Africa's smallest yet most densely populated nations, occupies a landlocked position at the geographic heart of the continent. Often overlooked on tourist itineraries, this emerging destination rewards adventurous travelers with authentic cultural experiences, untouched natural landscapes, and the warmth of a people whose traditions remain vibrant despite historical challenges.\n\nLake Tanganyika, the world's second-deepest freshwater lake and second-largest by volume, forms 's southwestern border and provides the country's most significant natural attraction. This ancient lake, estimated at 9-13 million years old, harbors over 300 fish species, many found nowhere else on Earth. The shoreline around Bujumbura, the former capital and largest city, offers sandy beaches for swimming and relaxation – rare opportunities in landlocked Africa. The scenic lakeside villages, traditional fishing communities, and mountain-backed vistas create an environment of remarkable tranquility.\n\nThe southern source of the Nile, at Rutovu in Bururi Province, marks one of several points claiming to be the great river's most distant headwater. A modest monument marks the spring where water begins its incredible 6,650-kilometer journey to the Mediterranean Sea. The surrounding area, with its rolling hills and traditional villages, provides insight into rural an life.\n\n's cultural crown jewels are the Royal Drummers of  – the legendary Karyenda. These powerful performances, traditionally reserved for royal ceremonies, now showcase 's cultural heritage to the world. The massive drums, carved from entire tree trunks and covered with cowhide, produce rhythms that have achieved international fame. Drummers leap, spin, and dance while maintaining perfect rhythmic coordination, creating spectacles of athletic and artistic excellence. The drums themselves are considered sacred, historically playing central roles in coronations, funerals, and agricultural festivals.\n\nKibira National Park, the country's largest protected area, preserves the majority of 's remaining montane rainforest. This biodiversity hotspot spans the Congo-Nile divide and harbors populations of chimpanzees, colobus monkeys, baboons, and numerous forest bird species. The park's hiking trails range from short nature walks to challenging multi-day treks, passing through pristine forest, bamboo groves, and high-altitude grasslands.\n\nRusizi National Park, at the northern tip of Lake Tanganyika where the Rusizi River delta creates extensive wetlands, provides excellent opportunities to observe hippos, crocodiles, and aquatic birds. Boat safaris through the papyrus-lined channels offer peaceful wildlife encounters in dramatic lakeside settings.\n\nRuvubu National Park, the country's largest conservation area, protects savanna and gallery forest along the Ruvubu River. While infrastructure is limited, adventurous visitors may encounter buffalo, antelope, hippos, and crocodiles in relatively wild settings.\n\nan tea and coffee rank among Africa's finest, though less internationally recognized than their regional competitors. The highland tea plantations near Teza, with their emerald geometric patterns and misty mountain backdrops, offer touring opportunities and stunning scenery. an coffee, particularly from the Ngozi region, has gained specialty coffee recognition for its complex, fruit-forward profiles. Coffee washing stations welcome visitors for processing tours during harvest season.\n\nThe Karera Waterfalls, tumbling through dense forest in the east, provide scenic hiking destinations. The Gishora Drum Sanctuary, near Gitega, preserves the tradition of sacred drumming and allows visitors to witness performances and learn about drum-making and the drums' historical significance.\n\nGitega, the official capital since 2019, houses the National Museum of Gitega, presenting 's history and culture through ethnographic collections. The city's relatively relaxed pace offers contrast to busier Bujumbura while providing access to central highland attractions.\n\n's recovery from decades of conflict continues, with tourism infrastructure developing slowly but steadily. Current visitors find a country of generous hospitality, where authentic interactions come naturally and mass tourism remains absent. Traditional crafts, including intricate basket weaving and pottery, provide opportunities for cultural exchange and meaningful souvenirs.",
  "additionalInfo": " and Rwanda are the only African countries where most of the population shares a common language (Kirundi and Kinyarwanda, which are mutually intelligible). The two countries also share similar cultures and pre-colonial political structures based on monarchies.\n\nThe an drumming tradition was inscribed on UNESCO's Representative List of the Intangible Cultural Heritage of Humanity in 2014, recognizing its cultural significance.\n\nLake Tanganyika is so deep (1,470 meters maximum) that its lower waters have been isolated for millions of years, creating unique lifeforms. The lake is estimated to contain about 16% of the world's available freshwater.\n\nCoffee constitutes about 60% of 's export earnings, making it crucial to the national economy. The country is working to develop specialty coffee markets for better returns.",
  "population": "12 million",
  "area": "27,834 km²",
  "languages": [
    "Kirundi",
    "French",
    "English"
  ],
  "officialLanguages": [
    "Kirundi",
    "French",
    "English"
  ],
  "ethnicGroups": [
    "Hutu (85%)",
    "Tutsi (14%)",
    "Twa (1%)"
  ],
  "religions": [
    "Christianity (93%)",
    "Traditional beliefs (5%)",
    "Islam (2%)"
  ],
  "currency": "an Franc (BIF)",
  "currencySymbol": "FBu",
  "timezone": "Central Africa Time (UTC+2)",
  "callingCode": "+257",
  "drivingSide": "Right",
  "climate": "Equatorial highland; moderate temperatures year-round",
  "seasons": {
    "dry": [
      "June-September",
      "December-January"
    ],
    "wet": [
      "February-May",
      "September-November"
    ],
    "best": "June to September (dry season)"
  },
  "bestTime": "June to September (dry season)",
  "visaInfo": "Visa required; can be obtained on arrival at Bujumbura airport or major border crossings for most nationalities.",
  "healthInfo": "Yellow fever vaccination required. Malaria prophylaxis recommended throughout the country.",
  "highlights": [
    "Lake Tanganyika",
    "Royal Drummers of ",
    "Kibira National Park",
    "Rusizi National Park",
    "Source of the Nile",
    "Gitega National Museum",
    "Tea Plantations",
    "Karera Waterfalls",
    "Gishora Drum Sanctuary",
    "Ruvubu National Park",
    "Bujumbura City",
    "Saga Beach"
  ],
  "experiences": [
    "Watch the Royal Drummers perform",
    "Relax on Lake Tanganyika beaches",
    "Trek through Kibira Forest",
    "Visit the southernmost Source of the Nile",
    "Tour tea plantations in the highlands",
    "Explore Bujumbura's lakeside culture",
    "Spot hippos in Rusizi National Park",
    "Learn about drum making at Gishora",
    "Discover chimpanzees in Kibira",
    "Experience local markets",
    "Sample specialty an coffee",
    "Hike to Karera Waterfalls",
    "Visit the National Museum in Gitega",
    "Canoe on Lake Tanganyika",
    "Meet local craft artisans"
  ],
  "wildlife": {
    "mammals": [
      "Chimpanzee",
      "Hippo",
      "Crocodile",
      "Buffalo",
      "Black-and-white Colobus",
      "Olive Baboon",
      "Various Antelope"
    ],
    "birds": [
      "Shoebill (rare)",
      "Papyrus Gonolek",
      "Various Kingfishers",
      "African Fish Eagle",
      "Forest species"
    ],
    "aquatic": [
      "Tanganyika cichlids",
      "Nile Perch",
      "Various endemic fish species"
    ]
  },
  "cuisine": {
    "staples": [
      "Beans",
      "Bananas (plantains)",
      "Sweet potatoes",
      "Cassava",
      "Rice"
    ],
    "specialties": [
      "Mukeke (fish from Tanganyika)",
      "Ndagala (small fried fish)",
      "Brochettes",
      "Isombe (cassava leaves)",
      "Igisafuliya (cooking pot stew)"
    ],
    "beverages": [
      "an coffee",
      "Impeke (banana beer)",
      "Primus beer",
      "Tea"
    ]
  },
  "festivals": [
    {
      "name": "Independence Day",
      "period": "July 1"
    },
    {
      "name": "Unity Day",
      "period": "February 5"
    },
    {
      "name": "Assumption Day",
      "period": "August 15"
    },
    {
      "name": "Drums Festival",
      "period": "Various"
    }
  ],
  "unescoSites": [
    "Ritual dance of the Royal Drum (Intangible Heritage)",
    "Kibira-Nyungwe transboundary forest (Tentative)"
  ],
  "travelTips": [
    "The country is recovering from conflict; check travel advisories before visiting",
    "Book drum performances in advance when possible",
    "Roads can be challenging; 4WD recommended for national parks",
    "Limited ATMs; bring sufficient cash in US dollars or euros",
    "French is more widely spoken than English",
    "Lake Tanganyika is safe for swimming (bilharzia-free in most areas)",
    "Photography may require permission; ask before photographing people",
    "Simple but clean accommodation available in main towns",
    "Respect is valued; greetings are important in an culture",
    "Local transport is informal; negotiate prices in advance"
  ],
  "airports": [
    {
      "name": "Bujumbura International Airport (BJM)",
      "location": "Bujumbura",
      "type": "International"
    }
  ],
  "images": [
    "https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=800",
    "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=800",
    "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800"
  ],
  "heroImage": "https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=1920",
  "mapPosition": {
    "lat": -3.373056,
    "lng": 29.918886
  },
  "neighboringCountries": [
    "Rwanda",
    "Tanzania",
    "Democratic Republic of Congo"
  ],
  "economicInfo": {
    "gdp": "$3.4 billion (2022)",
    "gdpPerCapita": "$272",
    "mainIndustries": [
      "Agriculture",
      "Light manufacturing",
      "Mining"
    ],
    "exports": [
      "Coffee",
      "Tea",
      "Sugar",
      "Cotton",
      "Hides"
    ]
  }
}
```

### South Sudan

```json
{
  "id": "south-sudan",
  "name": "South Sudan",
  "capital": "Juba",
  "flag": "🇸🇸",
  "tagline": "The Wild Frontier",
  "motto": "Justice, Liberty, Prosperity",
  "independence": "July 9, 2011",
  "description": "South Sudan, the world's newest nation, harbors one of Africa's greatest wildlife migrations, vast untouched wilderness, and resilient cultures maintaining ancient traditions in a land of frontier adventure.",
  "fullDescription": "South Sudan, which gained independence in 2011 to become the world's newest nation, represents one of the last true frontiers in African travel. While ongoing challenges limit tourism, those who venture here discover extraordinary wildlife spectacles, resilient cultures, and landscapes largely unchanged by modernity – a glimpse of Africa as it existed before mass tourism transformed other destinations.\n\nThe country hosts what may be Africa's largest land mammal migration – the white-eared kob migration. Each year, an estimated 800,000 to 1.2 million white-eared kob, along with tiang and Mongalla gazelle, traverse the Boma-Jonglei landscape in search of grazing and water. This migration, larger than the famous Serengeti-Mara migration by some estimates, remains virtually unknown to most of the world. Boma National Park and Bandingilo National Park, though lacking tourism infrastructure, protect portions of this remarkable phenomenon.\n\nThe Sudd, one of the world's largest tropical wetlands, dominates central South Sudan. Fed by the White Nile, this vast swamp expands and contracts seasonally between 30,000 and 130,000 square kilometers. The Sudd supports incredible biodiversity, including the iconic shoebill stork, sitatunga antelope, and countless other wetland species. Traditional fishing communities have lived sustainably within this ecosystem for millennia, their lives attuned to the rhythm of floods and dry seasons.\n\nSouth Sudan's cultural diversity spans over 60 ethnic groups, many maintaining distinct traditions, languages, and customs despite decades of conflict. The Mundari people have achieved particular renown for their extraordinary relationship with their Ankole-Watusi cattle. These massive long-horned cattle, often taller than their handlers, are bathed in ash, have their horns shaped from youth, and sleep within protective fires each night to ward off insects. Mundari cattle camps near Juba have become the most accessible cultural experience for visitors, offering photographic opportunities of daily rituals unchanged for generations.\n\nThe Dinka, South Sudan's largest ethnic group, practice similar cattle-centered traditions across their territories. Their scarification patterns, traditional wrestling competitions, and striking height (among the world's tallest populations) create distinct cultural identities. The Nuer, closely related to the Dinka, maintain their own cattle traditions and distinctive facial scarification. The Toposa, Lotuko, Bari, and numerous other groups add depth to South Sudan's cultural mosaic.\n\nThe White Nile, flowing through South Sudan before joining the Blue Nile at Khartoum, provides the country's main artery. River travel, though slow, offers unique perspectives on wildlife and communities along the banks. The city of Juba, growing rapidly since independence, straddles the Nile and serves as the primary gateway for visitors.\n\nNimule National Park, along the Ugandan border, offers the most accessible wildlife viewing, with elephants, hippos, and various antelope present. However, infrastructure remains basic, and visiting requires careful planning and often private arrangements.\n\nThe challenges of visiting South Sudan are significant. Ongoing conflicts in some areas require careful monitoring of security situations. Infrastructure is minimal – roads are frequently impassable during rainy seasons, accommodation options are limited, and flights are expensive and irregular. Most visitors come either as aid workers, journalists, or serious expedition travelers willing to accept these challenges for unique experiences.\n\nConservation efforts, supported by international organizations including the Wildlife Conservation Society and African Parks, are working to protect South Sudan's remarkable wildlife heritage. If peace becomes sustained, the potential for wildlife tourism is immense – the combination of massive migrations, untouched wilderness, and authentic cultures could position South Sudan among Africa's premier adventure destinations.",
  "additionalInfo": "South Sudan's estimated migration of white-eared kob was only confirmed by aerial surveys in 2007, making it one of Africa's most recent major wildlife discoveries. The country's civil wars had prevented scientific surveys for decades.\n\nThe Sudd wetland acts as a massive evaporation system, with over half of the Nile's water lost to evaporation before reaching Sudan. Various colonial schemes to drain or bypass the Sudd were never completed.\n\nSouth Sudan has Africa's lowest literacy rates and some of its highest poverty rates, legacies of decades of conflict. The country's oil reserves provide the primary revenue source but have also been sources of conflict.\n\nThe Mundari cattle camps represent one of the most visually striking cultural experiences remaining in Africa, with morning and evening rituals creating atmospheric scenes unlike anywhere else.",
  "population": "11 million",
  "area": "619,745 km²",
  "languages": [
    "English",
    "Arabic",
    "Dinka",
    "Nuer",
    "Bari",
    "Zande"
  ],
  "officialLanguages": [
    "English"
  ],
  "ethnicGroups": [
    "Dinka (36%)",
    "Nuer (16%)",
    "Shilluk",
    "Azande",
    "Bari",
    "Over 60 groups"
  ],
  "religions": [
    "Christianity (60%)",
    "Traditional beliefs (33%)",
    "Islam (6%)"
  ],
  "currency": "South Sudanese Pound (SSP)",
  "currencySymbol": "SSP",
  "timezone": "Central Africa Time (UTC+2)",
  "callingCode": "+211",
  "drivingSide": "Right",
  "climate": "Tropical; rainy season varies by region",
  "seasons": {
    "dry": [
      "December-March"
    ],
    "wet": [
      "April-November"
    ],
    "best": "December to March (dry season)"
  },
  "bestTime": "December to March (dry season)",
  "visaInfo": "Visa required; obtain in advance from South Sudanese embassies. Travel permits may be required for areas outside Juba.",
  "healthInfo": "Yellow fever vaccination required. Comprehensive vaccinations recommended. Medical facilities are extremely limited; evacuation insurance essential.",
  "highlights": [
    "Boma National Park",
    "The Sudd Wetland",
    "Bandingilo National Park",
    "Nimule National Park",
    "White Nile",
    "Mundari Cattle Camps",
    "Juba City",
    "Southern National Park",
    "Traditional Villages",
    "White-eared Kob Migration"
  ],
  "experiences": [
    "Witness the great white-eared kob migration",
    "Visit Mundari cattle camps at sunrise",
    "Explore the vast Sudd wetlands",
    "Experience traditional Dinka and Nuer cultures",
    "See wildlife in Nimule National Park",
    "Cruise the White Nile",
    "Document rarely-seen traditions",
    "Photography expeditions to cattle camps",
    "Learn about traditional scarification and ceremonies",
    "Experience frontier Africa",
    "Support conservation initiatives",
    "Meet resilient local communities"
  ],
  "wildlife": {
    "mammals": [
      "White-eared Kob (massive numbers)",
      "Tiang",
      "Mongalla Gazelle",
      "Elephant",
      "Giraffe",
      "Buffalo",
      "Lion",
      "Leopard",
      "Hippo",
      "Nile Crocodile",
      "Sitatunga"
    ],
    "birds": [
      "Shoebill Stork",
      "Saddle-billed Stork",
      "Various Wetland Species",
      "Papyrus endemics"
    ],
    "notes": "Wildlife populations were impacted by conflict but may be recovering in protected areas"
  },
  "cuisine": {
    "staples": [
      "Sorghum",
      "Millet",
      "Maize",
      "Groundnuts",
      "Sesame"
    ],
    "specialties": [
      "Kisra (fermented bread)",
      "Asida (porridge)",
      "Fish from the Nile",
      "Dried meat",
      "Milk products"
    ],
    "beverages": [
      "Sorghum beer",
      "Tea",
      "Fresh milk"
    ]
  },
  "festivals": [
    {
      "name": "Independence Day",
      "period": "July 9"
    },
    {
      "name": "SPLA Day",
      "period": "May 16"
    },
    {
      "name": "Martyrs' Day",
      "period": "July 30"
    },
    {
      "name": "Traditional ceremonies",
      "period": "Various"
    }
  ],
  "unescoSites": [
    "None currently; Sudd wetland and migration routes under consideration"
  ],
  "travelTips": [
    "Check security situation carefully before travel; conditions change rapidly",
    "Travel insurance with evacuation coverage is essential",
    "Arrange all logistics with experienced operators in advance",
    "Bring all necessary supplies; nothing is guaranteed available",
    "Photography permits may be required; ask permission before photographing people",
    "Cash only – bring clean US dollars",
    "Dry season (December-March) is the only practical travel time",
    "Expect basic or no infrastructure outside Juba",
    "Flights are expensive and irregular; book well in advance",
    "Respect local customs; some areas are sensitive",
    "Mindset: this is expedition travel, not tourism"
  ],
  "airports": [
    {
      "name": "Juba International Airport (JUB)",
      "location": "Juba",
      "type": "International"
    },
    {
      "name": "Malakal Airport",
      "location": "Malakal",
      "type": "Domestic"
    },
    {
      "name": "Wau Airport",
      "location": "Wau",
      "type": "Domestic"
    }
  ],
  "images": [
    "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
    "https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=800",
    "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=800",
    "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800"
  ],
  "heroImage": "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920",
  "mapPosition": {
    "lat": 4.859363,
    "lng": 31.571251
  },
  "neighboringCountries": [
    "Sudan",
    "Ethiopia",
    "Kenya",
    "Uganda",
    "Democratic Republic of Congo",
    "Central African Republic"
  ],
  "economicInfo": {
    "gdp": "$4.1 billion (2022)",
    "gdpPerCapita": "$394",
    "mainIndustries": [
      "Oil",
      "Agriculture",
      "Fishing"
    ],
    "exports": [
      "Crude Oil (98% of exports)",
      "Gum Arabic",
      "Timber"
    ]
  }
}
```

### Eritrea

```json
{
  "id": "eritrea",
  "name": "Eritrea",
  "capital": "Asmara",
  "flag": "🇪🇷",
  "tagline": "Africa's Hidden Gem",
  "motto": "Ever Forward",
  "independence": "May 24, 1993",
  "description": "Eritrea offers a unique glimpse into a preserved world: stunning Italian art deco architecture, ancient civilizations, and diverse landscapes from pristine Red Sea coral reefs to highland plateaus.",
  "fullDescription": "Eritrea remains one of Africa's most enigmatic and least-visited destinations – a nation where time seems to have paused in places, preserving architectural treasures, ancient traditions, and landscapes largely untouched by modern development. While challenging to visit, those who venture here discover remarkable rewards.\n\nAsmara, the capital, stands as one of the world's most remarkable architectural showcases – a UNESCO World Heritage Site presenting an almost complete ensemble of Italian Modernist architecture from the 1930s. When Italy transformed Eritrea into a showcase colony, Italian architects used Asmara as a laboratory for avant-garde design, creating buildings in Futurist, Rationalist, Novecento, and Art Deco styles that would have been controversial in Italy itself. The Cinema Impero, with its bold Futurist facade; the Fiat Tagliero service station, resembling a futuristic aircraft with cantilevered concrete wings; the Bar Zilli with its original furnishings; and countless residences, cafes, and public buildings create an open-air museum unique in all of Africa.\n\nWalking Asmara's palm-lined boulevards, visitors encounter Italian-style espresso bars serving excellent coffee, classic Italian architecture in various stages of faded elegance, bicycles from the 1940s still in daily use, and vintage cars that could populate a classic car museum. The city's remarkably safe streets, temperate highland climate (2,300 meters elevation), and relaxed pace create an atmosphere unlike any other African capital.\n\nBeyond Asmara, Eritrea's diverse landscapes stretch from the Dahlak Archipelago's pristine coral reefs in the Red Sea to the highland plateaus and the dramatic escarpment dropping toward the Danakil Desert. The ancient port of Adulis was once the hub of the Aksumite Empire, connecting Africa with Arabia, India, and beyond. Archaeological excavations continue to reveal the city's significance as a major trading center from the 1st century AD through the medieval period.\n\nMassawa, the main port city, blends Ottoman, Egyptian, and Italian influences in its architecture. The old town, built across two islands, features coral-block buildings, ancient mosques, and remnants of Italian colonial structures. Though damaged during the independence struggle, Massawa retains romantic appeal with its seaside setting and multilayered history.\n\nThe Eritrean Railway represents one of the world's most remarkable feats of colonial engineering. Built by the Italians between 1887 and 1932, the line climbs from Massawa at sea level through 30 tunnels and over 65 bridges to reach Asmara at 2,400 meters – all within just 118 kilometers. Steam locomotives from the early 20th century have been restored and occasionally operate on this scenic route, creating journeys through time as well as space.\n\nThe Dahlak Archipelago, comprising over 200 islands in the Red Sea, offers pristine diving and snorkeling opportunities on coral reefs largely untouched by tourism. Ghost crabs scuttle across beaches where no footprints precede visitors; fish schools swirl through waters unmarred by boat traffic. Access requires special permits and careful planning, but rewards include underwater experiences rivaling or exceeding the Red Sea's famous Egyptian sites.\n\nThe Qohaito archaeological site, on the highland plateau, preserves ruins of a major Aksumite settlement. Ancient tombs, a temple, stelae, and the so-called \"Dam of the Kings\" hint at the sophisticated civilization that once flourished here. The nearby escarpment provides dramatic viewpoints over the descent to the lowlands.\n\nFilfil, one of Eritrea's few remaining tropical rainforests, provides habitat for endemic species and offers cool respite from surrounding arid zones. The Semenawi Bahri (northern green belt) region supports diverse vegetation and traditional highland villages.\n\nEritrean culture blends African, Arabic, and Mediterranean influences. Nine ethnic groups – Tigrinya, Tigre, Saho, Kunama, Rashaida, Bilen, Afar, Nara, and Hidareb – contribute distinct traditions, languages, and customs. The coffee ceremony, similar to Ethiopia's, remains central to social life, with roasting, grinding, and brewing performed before guests in rituals of hospitality.",
  "additionalInfo": "Eritrea means \"Red\" in Greek, named for the Red Sea (Erythrean Sea) by Italian colonizers. The country maintains mandatory national service, which significantly impacts society and has contributed to emigration.\n\nAsmara's inclusion as a UNESCO World Heritage Site in 2017 recognized its outstanding universal value as an exceptionally intact example of early Modernist urbanism.\n\nThe Eritrean Railway once stretched beyond Asmara to Keren and Agordat. Restoration efforts have focused on the Massawa-Asmara section, with occasional tourist trains operating.\n\nEritrea's isolation has preserved many aspects that have disappeared elsewhere – vintage technology, traditional crafts, and architectural heritage all survive in forms rarely seen in the modern world.",
  "population": "3.5 million",
  "area": "117,600 km²",
  "languages": [
    "Tigrinya",
    "Arabic",
    "English",
    "Italian"
  ],
  "officialLanguages": [
    "Tigrinya",
    "Arabic"
  ],
  "ethnicGroups": [
    "Tigrinya (55%)",
    "Tigre (30%)",
    "Saho (4%)",
    "Kunama (2%)",
    "Rashaida (2%)",
    "Bilen (2%)",
    "Others"
  ],
  "religions": [
    "Christianity (63%)",
    "Islam (36%)",
    "Others (1%)"
  ],
  "currency": "Eritrean Nakfa (ERN)",
  "currencySymbol": "Nkf",
  "timezone": "East Africa Time (UTC+3)",
  "callingCode": "+291",
  "drivingSide": "Right",
  "climate": "Hot, dry desert strip along coast; cooler, wetter central highlands",
  "seasons": {
    "dry": [
      "October-May"
    ],
    "wet": [
      "June-September (highlands only)"
    ],
    "best": "October to March"
  },
  "bestTime": "October to March (dry, moderate temperatures)",
  "visaInfo": "Visa required; must be obtained in advance from Eritrean embassies. Independent travel has significant restrictions.",
  "healthInfo": "Yellow fever vaccination required if arriving from endemic countries. Malaria risk in lowland areas.",
  "highlights": [
    "Asmara Art Deco City (UNESCO)",
    "Dahlak Archipelago",
    "Massawa Old Town",
    "Eritrean Railway",
    "Qohaito Ancient Site",
    "Filfil Rainforest",
    "Semenawi Bahri",
    "Red Sea Coast",
    "Keren Market",
    "Adulis Archaeological Site",
    "Debre Bizen Monastery",
    "Nakfa Town"
  ],
  "experiences": [
    "Explore Asmara's UNESCO-listed modernist architecture",
    "Dive pristine reefs in the Dahlak Archipelago",
    "Ride the historic railway from Massawa to Asmara",
    "Discover ancient ruins at Qohaito",
    "Snorkel untouched coral reefs",
    "Experience traditional coffee ceremonies",
    "Walk through Massawa's historic old town",
    "Visit the colorful Keren camel market",
    "Enjoy Italian-style espresso in original 1930s cafes",
    "Photograph vintage architecture and vehicles",
    "Explore Adulis archaeological excavations",
    "Trek in the highland forests",
    "Witness traditional religious celebrations"
  ],
  "wildlife": {
    "mammals": [
      "Dorcas Gazelle",
      "Soemmerring's Gazelle",
      "Nubian Ibex",
      "Hamadryas Baboon",
      "Leopard (rare)",
      "Various small mammals"
    ],
    "birds": [
      "Ostrich",
      "Secretary Bird",
      "Various raptors",
      "Endemic species",
      "Migratory species"
    ],
    "marine": [
      "Dolphins",
      "Sea Turtles",
      "Dugongs",
      "Tropical Reef Fish",
      "Whale Sharks (seasonal)",
      "Manta Rays"
    ]
  },
  "cuisine": {
    "staples": [
      "Injera (similar to Ethiopian)",
      "Tsebhi (stew)",
      "Kitcha (unleavened bread)",
      "Hilbet (fenugreek dip)"
    ],
    "specialties": [
      "Zigni (spiced meat stew)",
      "Shiro (chickpea puree)",
      "Fata (bread with egg)",
      "Ful (fava beans)",
      "Italian influence: pasta, pizza, cappuccino"
    ],
    "beverages": [
      "Coffee (bun)",
      "Suwa (traditional beer)",
      "Meis (honey wine)",
      "Italian-style espresso"
    ]
  },
  "festivals": [
    {
      "name": "Independence Day",
      "period": "May 24"
    },
    {
      "name": "Martyrs' Day",
      "period": "June 20"
    },
    {
      "name": "Start of Armed Struggle",
      "period": "September 1"
    },
    {
      "name": "Meskel (Finding of the True Cross)",
      "period": "September 27"
    },
    {
      "name": "Timkat (Epiphany)",
      "period": "January 19"
    }
  ],
  "unescoSites": [
    "Asmara: A Modernist African City"
  ],
  "travelTips": [
    "Visa must be obtained in advance; allow plenty of time",
    "Travel outside Asmara may require permits and guides",
    "Photography restrictions exist; ask before photographing anything official",
    "Bring cash – credit cards are not accepted",
    "Communication with the outside world is limited; prepare for disconnection",
    "Pack supplies; not everything is available",
    "Asmara is remarkably safe; walking at night is generally fine",
    "Respect local customs and religious practices",
    "Learn a few Tigrinya phrases; English is limited",
    "Patience is essential; bureaucracy can be slow",
    "Private transport may be necessary outside main cities",
    "The espresso is excellent – enjoy the cafe culture"
  ],
  "airports": [
    {
      "name": "Asmara International Airport (ASM)",
      "location": "Asmara",
      "type": "International"
    },
    {
      "name": "Massawa International Airport",
      "location": "Massawa",
      "type": "Domestic"
    },
    {
      "name": "Assab International Airport",
      "location": "Assab",
      "type": "Domestic"
    }
  ],
  "images": [
    "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800",
    "https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=800",
    "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=800",
    "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800"
  ],
  "heroImage": "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1920",
  "mapPosition": {
    "lat": 15.179384,
    "lng": 39.782334
  },
  "neighboringCountries": [
    "Sudan",
    "Ethiopia",
    "Djibouti"
  ],
  "economicInfo": {
    "gdp": "$2.3 billion (2022 estimate)",
    "gdpPerCapita": "$643",
    "mainIndustries": [
      "Mining",
      "Agriculture",
      "Light manufacturing"
    ],
    "exports": [
      "Gold",
      "Zinc",
      "Copper",
      "Salt",
      "Fish"
    ]
  }
}
```

### Djibouti

```json
{
  "id": "djibouti",
  "name": "Djibouti",
  "capital": "Djibouti City",
  "flag": "🇩🇯",
  "tagline": "Where Earth's Forces Collide",
  "motto": "Unité, Égalité, Paix (Unity, Equality, Peace)",
  "independence": "June 27, 1977",
  "description": "Djibouti sits at the meeting point of three tectonic plates, creating otherworldly landscapes from Lake Assal's salt-encrusted shores to the ethereal limestone chimneys of Lac Abbé, with some of the world's best whale shark encounters.",
  "fullDescription": "Djibouti is one of Earth's most geologically active and visually extraordinary places – a small nation where the African, Arabian, and Somali tectonic plates meet and slowly tear apart. This process creates landscapes so dramatic and alien they've served as backdrops for science fiction films, while the surrounding waters offer marine encounters to rival any on Earth.\n\nLake Assal, lying 155 meters below sea level, is Africa's lowest point and one of the saltiest bodies of water on Earth – approximately ten times saltier than the ocean. The lake, which has no outlet, sits in a crater surrounded by dormant volcanic cones, its shores encrusted with brilliant white salt deposits that create an almost lunar landscape. The salt has been harvested for centuries by Afar caravans, who continue using traditional methods to this day. The contrast of brilliant white salt against black volcanic rock and the blue-green lake waters creates scenes of surreal beauty, particularly in the golden light of early morning or late afternoon.\n\nLac Abbé, near the Ethiopian border, presents landscapes even more otherworldly. Here, hundreds of limestone chimneys – some reaching 50 meters in height – release steam in the early morning, creating scenes that seem transported from another planet. These chimneys, formed by ancient hot springs depositing minerals over thousands of years, stand sentinel over a salt flat where flamingos sometimes wade in the reflections. The 1968 film \"Planet of the Apes\" used similar landscapes to depict an alien world; visiting at sunrise, when steam rises from countless vents against a reddening sky, visitors understand why. Nearby hot springs reach temperatures over 100°C, emphasizing the region's ongoing geological activity.\n\nThe Ghoubbet al-Kharab (often called \"The Devil's Throat\") is a bay of striking beauty where deep blue waters meet volcanic cliffs of red and black. This natural harbor, connected to the Gulf of Tadjoura by a narrow opening, offers excellent diving conditions with underwater volcanic formations, diverse marine life, and excellent visibility. The surrounding coast features dramatic black lava beaches contrasting with the turquoise sea.\n\nDjibouti's whale shark encounters rank among the world's best. Between November and February, these gentle giants – the world's largest fish, reaching up to 12 meters in length – congregate in the Gulf of Tadjoura and Gulf of Aden, drawn by plankton blooms. Snorkelers and divers can swim alongside these magnificent creatures in remarkably reliable encounters, with numerous individuals often present simultaneously.\n\nThe broader marine environment includes pristine coral reefs, resident populations of dolphins, occasional manta rays, and diverse tropical fish. The strategic position at the meeting point of the Red Sea and Indian Ocean creates rich marine biodiversity. The potential for dive tourism remains largely untapped, with many sites rarely if ever visited.\n\nDay Forest National Park (Forêt du Day), the country's only significant forested area, provides stark contrast to surrounding deserts. This juniper forest at 1,500 meters elevation harbors endemic species, including the Djibouti francolin, found nowhere else on Earth. Hiking trails offer respite from coastal heat and opportunities to observe unique flora and fauna in this isolated green pocket.\n\nDjibouti City blends French colonial heritage with modern development and traditional Afar and Somali cultures. The European Quarter features grand colonial buildings, sidewalk cafes, and a covered market, while the African Quarter buzzes with traditional life. The city's strategic location – controlling access between the Red Sea and Indian Ocean – has made it significant throughout history and ensures continued international presence, with French, American, Chinese, and Japanese military bases contributing to the cosmopolitan atmosphere.\n\nThe Afar people, whose traditional territory spans Djibouti, Eritrea, and Ethiopia, maintain nomadic traditions in this harsh environment. Their distinctive conical huts (ari), elaborate hairstyles, and adaptation to extreme conditions reflect centuries of survival in one of Earth's most challenging environments. Traditional Afar dances and ceremonies offer cultural insights for visitors.\n\nTadjoura, the oldest town in Djibouti and former sultanate capital, features historic coral-stone mosques, traditional architecture, and a laid-back waterfront atmosphere. The journey from Djibouti City, whether by road around the gulf or by speedboat across it, offers spectacular scenery.",
  "additionalInfo": "Djibouti's strategic location at the Bab el-Mandeb strait has made it significant throughout history. Today, it hosts more foreign military bases than any other country – France, the United States, China, Japan, and Italy all maintain facilities here, contributing significantly to the economy.\n\nThe Afar Triple Junction, where three tectonic plates meet, makes Djibouti one of the few places where oceanic rift systems can be studied on land. Scientists consider this an analog for studying similar processes occurring on the ocean floor and potentially on other planets.\n\nLake Assal produces over 5 million tons of salt annually, with deposits estimated at nearly 1 billion tons. Traditional Afar salt caravans still operate, though industrial extraction increasingly dominates.\n\nThe country's tiny size (roughly equivalent to Massachusetts) and strategic location have given it outsized geopolitical importance despite having minimal natural resources beyond its position.",
  "population": "1 million",
  "area": "23,200 km²",
  "languages": [
    "French",
    "Arabic",
    "Somali",
    "Afar"
  ],
  "officialLanguages": [
    "French",
    "Arabic"
  ],
  "ethnicGroups": [
    "Somali (60%)",
    "Afar (35%)",
    "Others (5%)"
  ],
  "religions": [
    "Islam (94%)",
    "Christianity (6%)"
  ],
  "currency": "Djiboutian Franc (DJF)",
  "currencySymbol": "Fdj",
  "timezone": "East Africa Time (UTC+3)",
  "callingCode": "+253",
  "drivingSide": "Right",
  "climate": "Desert; hot and humid along coast, cooler and less humid in highlands",
  "seasons": {
    "hot": [
      "June-August (most extreme)"
    ],
    "cool": [
      "November-April (relatively)"
    ],
    "best": "November to April (cooler, whale shark season)"
  },
  "bestTime": "November to April (cooler, whale sharks present)",
  "visaInfo": "Visa on arrival available for most nationalities. eVisa also available.",
  "healthInfo": "Yellow fever vaccination required if arriving from endemic countries. Malaria risk exists year-round.",
  "highlights": [
    "Lake Assal",
    "Lac Abbé",
    "Day Forest National Park",
    "Ghoubbet Bay",
    "Whale Shark Diving",
    "Moucha & Maskali Islands",
    "Tadjoura",
    "Djibouti City",
    "Ali Sabieh",
    "Arta Beach",
    "Grand Bara Desert",
    "Arta Submarine Volcano"
  ],
  "experiences": [
    "Float in the hyper-saline Lake Assal",
    "Witness sunrise at Lac Abbé's limestone chimneys",
    "Swim with whale sharks in the Gulf of Tadjoura",
    "Dive pristine Red Sea coral reefs",
    "Trek volcanic landscapes around Ghoubbet",
    "Visit traditional Afar villages",
    "Explore colonial architecture in Djibouti City",
    "Snorkel the Moucha and Maskali Islands",
    "Watch traditional salt harvesting",
    "Experience extreme heat at Lake Assal (world's hottest)",
    "Photograph the Grand Bara Desert",
    "Learn about Afar culture and traditions",
    "Visit the historic town of Tadjoura",
    "See endemic wildlife in Day Forest"
  ],
  "wildlife": {
    "mammals": [
      "Hamadryas Baboon",
      "Dorcas Gazelle",
      "Salt's Dik-dik",
      "Warthog",
      "Various bats"
    ],
    "birds": [
      "Djibouti Francolin (endemic)",
      "Greater Flamingo",
      "Ostrich",
      "Various migrant species",
      "Seabirds"
    ],
    "marine": [
      "Whale Sharks",
      "Dolphins",
      "Sea Turtles",
      "Manta Rays",
      "Dugongs",
      "Tropical Reef Fish",
      "Various shark species"
    ]
  },
  "cuisine": {
    "staples": [
      "Rice",
      "Lentils",
      "Vegetables",
      "Meat (goat, beef, camel)"
    ],
    "specialties": [
      "Fah-Fah (goat soup)",
      "Laxoox (pancake-like bread)",
      "Skoudehkaris (lamb and rice)",
      "Grilled fish",
      "French-influenced cuisine"
    ],
    "beverages": [
      "Tea",
      "Coffee",
      "Fresh fruit juices",
      "French wine (widely available)"
    ]
  },
  "festivals": [
    {
      "name": "Independence Day",
      "period": "June 27"
    },
    {
      "name": "Eid al-Fitr",
      "period": "After Ramadan"
    },
    {
      "name": "Eid al-Adha",
      "period": "After Hajj"
    },
    {
      "name": "Prophet's Birthday",
      "period": "Varies"
    }
  ],
  "unescoSites": [
    "None currently; Lake Assal under consideration"
  ],
  "travelTips": [
    "Heat can be extreme – visit Lake Assal and Lac Abbé early morning or late afternoon",
    "Carry plenty of water; dehydration is a serious risk",
    "Whale shark season is November to February",
    "Book whale shark excursions through reputable operators",
    "French is more useful than English",
    "US dollars and Euros are widely accepted",
    "Lac Abbé requires 4WD and an early start from Djibouti City",
    "Respect Islamic customs; dress modestly",
    "Photography may be restricted near military installations",
    "Summer (June-August) temperatures can exceed 45°C – avoid if possible",
    "Water activities provide relief from extreme temperatures",
    "Khat chewing is culturally significant; don't photograph without permission"
  ],
  "airports": [
    {
      "name": "Djibouti–Ambouli International Airport (JIB)",
      "location": "Djibouti City",
      "type": "International"
    }
  ],
  "images": [
    "https://images.unsplash.com/photo-1510155324852-d5d2dbe7a5e8?w=800",
    "https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=800",
    "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=800",
    "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800"
  ],
  "heroImage": "https://images.unsplash.com/photo-1510155324852-d5d2dbe7a5e8?w=1920",
  "mapPosition": {
    "lat": 11.5886,
    "lng": 43.1456
  },
  "neighboringCountries": [
    "Eritrea",
    "Ethiopia",
    "Somalia"
  ],
  "economicInfo": {
    "gdp": "$3.6 billion (2022)",
    "gdpPerCapita": "$3,661",
    "mainIndustries": [
      "Port Services",
      "Military Base Leasing",
      "Banking",
      "Telecommunications"
    ],
    "exports": [
      "Re-exports",
      "Hides",
      "Livestock",
      "Coffee (transit)"
    ]
  }
}
```

### Somalia

```json
{
  "id": "somalia",
  "name": "Somalia",
  "capital": "Mogadishu",
  "flag": "🇸🇴",
  "tagline": "Land of Ancient Shores",
  "motto": "Unity through Grace",
  "independence": "July 1, 1960",
  "description": "Somalia boasts Africa's longest coastline, ancient port cities with millennia of trading history, extraordinary rock art, and a rich cultural heritage rooted in trade, poetry, and pastoral traditions.",
  "fullDescription": "Somalia possesses Africa's longest coastline, stretching over 3,000 kilometers along the Gulf of Aden and Indian Ocean. This strategic position at the entrance to the Red Sea has made Somali ports centers of international trade for over two millennia, connecting Africa with Arabia, Persia, India, China, and beyond. While much of Somalia remains challenging for visitors, the relatively stable region of Somaliland in the north offers accessible experiences of this ancient land.\n\nThe cave paintings of Laas Geel, discovered in 2002, represent one of Africa's most significant archaeological findings and among the best-preserved rock art on the continent. Dating back approximately 5,000-11,000 years, these remarkably vivid paintings depict cattle, wild animals, and human figures in pigments that have retained striking vibrancy. The cows shown with ceremonial robes suggest religious significance, while scenes of daily life illuminate ancient societies. The site's discovery rewrote understanding of early Somali civilization and remains an extraordinary destination for those able to visit.\n\nThe ancient port cities tell stories spanning millennia. Zeila, located in modern Somaliland, served as a major trading hub from at least the 1st century AD, mentioned in the Periplus of the Erythraean Sea, a Greek merchant's guide to Red Sea trade. The city exported frankincense, myrrh, ivory, and slaves while importing cloth, glass, and metals from across the ancient world. Though now a quiet fishing town, ancient ruins and the atmosphere of deep history pervade.\n\nMogadishu's old quarter, though damaged by decades of conflict, contains remnants of medieval architecture that once made it one of the wealthiest cities in Africa. The 13th-century Arba'a Rukun Mosque, the ancient Fakhr ad-Din Mosque (dating to 1269), and the Portuguese-era fortress speak to centuries as a cosmopolitan trading center. The famous Arab geographer Ibn Battuta, visiting in 1331, described a prosperous city of sophisticated trade and Islamic learning.\n\nBerbera, another ancient port, served as one of the most important trading posts on the Horn of Africa. Its natural harbor sheltered ships trading across the Indian Ocean for centuries. Ottoman fortifications, British colonial buildings, and ancient sites create a layered historical landscape. The beaches nearby, stretching along crystal-clear waters, rank among Africa's finest but remain virtually unknown to international tourism.\n\nThe Cal Madow mountains in Somaliland offer surprising green landscapes – forests, waterfalls, and endemic species in terrain rising to nearly 2,500 meters. This range, running parallel to the Gulf of Aden coast, catches moisture from the sea, creating biodiversity hotspots that contrast sharply with surrounding arid zones.\n\nSomali culture is extraordinarily rich in oral traditions. Somalia has been called a \"nation of poets,\" with poetry holding esteemed positions in all aspects of life – from expressing love and settling disputes to recording history and debating politics. Accomplished poets enjoy celebrity status, and poetry competitions draw audiences in the thousands. The Somali language, with its sophisticated grammatical structures and extensive vocabulary for pastoral life, was only given a standard written form in 1972.\n\nNomadic pastoralism remains central to Somali identity and economy. Camel herding, in particular, defines traditional Somali life – camels provide milk, meat, and transport while serving as currency, bridal gifts, and blood-money payments. An elaborate terminology exists for camels based on age, color, character, and function. The relationship between Somalis and their camels represents one of the world's most intensive human-animal bonds.\n\nThe Somali coast supports abundant marine life, including some of the least-exploited fishing grounds in the world. Coral reefs, though little studied, are thought to be in excellent condition. Seasonal whale migrations pass these shores, while dolphins, sea turtles, and diverse fish populations thrive in waters where commercial fishing pressure has historically been limited.\n\nHargeisa, Somaliland's capital, presents a modern city of surprising normalcy given the region's complex history. Markets bustle with commerce, restaurants serve traditional Somali cuisine, and daily life proceeds with energy. The currency exchange stalls, where millions of Somaliland shillings change hands openly, create scenes unique in global finance.",
  "additionalInfo": "Somaliland declared independence from Somalia in 1991, following the collapse of the Siad Barre regime, but remains internationally unrecognized. Despite this status, it has developed functional democratic institutions, maintained relative peace, and issues its own currency and passports (though these have limited international acceptance).\n\nThe Somali diaspora, numbering over 2 million people worldwide, maintains strong connections with home communities, with remittances constituting a major part of the domestic economy. Mobile money systems have developed innovatively in the absence of traditional banking infrastructure.\n\nSomali tea culture is distinctive – chai (shaah) is prepared with spices including cardamom, cinnamon, and cloves, often sweetened heavily with sugar. The tea shop serves as a primary social institution.\n\nFrankincense and myrrh, traded from the Somali coast for over 5,000 years, continue to be harvested from trees in the Cal Madow mountains and other regions, maintaining an ancient tradition.",
  "population": "17 million",
  "area": "637,657 km²",
  "languages": [
    "Somali",
    "Arabic",
    "English",
    "Italian"
  ],
  "officialLanguages": [
    "Somali",
    "Arabic"
  ],
  "ethnicGroups": [
    "Somali (85%)",
    "Bantu and other non-Somali (15%)"
  ],
  "religions": [
    "Islam (Sunni, 99%)",
    "Other (1%)"
  ],
  "currency": "Somali Shilling (SOS), Somaliland Shilling (SLSH in Somaliland)",
  "currencySymbol": "Sh.So.",
  "timezone": "East Africa Time (UTC+3)",
  "callingCode": "+252",
  "drivingSide": "Right",
  "climate": "Desert to semi-arid; northeast monsoon brings moderate temperatures December-February",
  "seasons": {
    "gu": [
      "April-June (main rainy)"
    ],
    "hagaa": [
      "July-September (dry)"
    ],
    "deyr": [
      "October-November (short rainy)"
    ],
    "jilaal": [
      "December-March (dry, coolest)"
    ],
    "best": "December to February (dry, coolest; Somaliland most accessible)"
  },
  "bestTime": "December to February (Somaliland)",
  "visaInfo": "Somaliland: Visa on arrival available. Somalia proper: Extremely limited travel possible; consult current advisories.",
  "healthInfo": "Yellow fever vaccination required. Comprehensive vaccinations recommended. Medical facilities extremely limited; evacuation insurance essential.",
  "highlights": [
    "Laas Geel Cave Paintings",
    "Mogadishu Old Town",
    "Berbera Beach & Port",
    "Zeila Ancient Port",
    "Cal Madow Mountains",
    "Hargeisa (Somaliland capital)",
    "Kismayo Beaches",
    "Lido Beach, Mogadishu",
    "Sheikh Mountain Town",
    "Daallo Mountains",
    "Indian Ocean coastline"
  ],
  "experiences": [
    "View the ancient cave paintings of Laas Geel",
    "Explore the historic port of Berbera",
    "Visit ancient trading ruins at Zeila",
    "Experience Hargeisa's vibrant markets",
    "Relax on pristine, empty beaches",
    "Learn about nomadic pastoral culture",
    "Taste authentic Somali cuisine",
    "Witness traditional camel herding",
    "Explore the Cal Madow forests",
    "Attend a poetry recitation",
    "Visit the Hargeisa War Memorial",
    "Discover maritime trading heritage",
    "Experience Somali hospitality and tea culture"
  ],
  "wildlife": {
    "mammals": [
      "Somali Wild Ass (critically endangered)",
      "Dorcas Gazelle",
      "Gerenuk",
      "Beira Antelope",
      "Various small mammals",
      "Dromedary Camel (domestic)"
    ],
    "birds": [
      "Somali Ostrich",
      "Somali Pigeon",
      "Various migratory species",
      "Endemic species in Cal Madow"
    ],
    "marine": [
      "Dolphins",
      "Sea Turtles",
      "Sharks",
      "Whales (seasonal)",
      "Tropical Reef Fish"
    ]
  },
  "cuisine": {
    "staples": [
      "Rice",
      "Pasta (Italian influence)",
      "Flatbreads (canjeero, sabaayad)",
      "Camel milk",
      "Goat meat"
    ],
    "specialties": [
      "Hilib ari (goat meat)",
      "Suqaar (sautéed meat)",
      "Bariis iskukaris (spiced rice)",
      "Sambusa (savory pastries)",
      "Malawah (sweet pancakes)"
    ],
    "beverages": [
      "Shaah (spiced tea)",
      "Camel milk",
      "Fresh fruit juices",
      "Strong coffee"
    ]
  },
  "festivals": [
    {
      "name": "Independence Day (Somaliland)",
      "period": "May 18"
    },
    {
      "name": "Independence Day (Somalia)",
      "period": "July 1"
    },
    {
      "name": "Eid al-Fitr",
      "period": "After Ramadan"
    },
    {
      "name": "Eid al-Adha",
      "period": "After Hajj"
    }
  ],
  "unescoSites": [
    "Laas Geel (Tentative)",
    "Mogadishu Old Town (Tentative)",
    "Historical sites of Zeila (Tentative)"
  ],
  "travelTips": [
    "Somaliland is the only part accessible to most tourists; check current conditions",
    "Book through experienced local operators",
    "Women should dress conservatively; head covering advisable",
    "Respect Islamic customs, especially during Ramadan",
    "Photography restrictions may apply; ask before photographing people",
    "Cash only – US dollars preferred",
    "Hire local guides for sites like Laas Geel",
    "Khat chewing is common; don't photograph without permission",
    "Somalis are renowned for hospitality – accept tea graciously",
    "Learn basic Somali phrases; English is limited",
    "Internal flights within Somaliland are available",
    "Security situations can change rapidly; monitor conditions"
  ],
  "airports": [
    {
      "name": "Aden Adde International Airport (MGQ)",
      "location": "Mogadishu",
      "type": "International"
    },
    {
      "name": "Egal International Airport (HGA)",
      "location": "Hargeisa (Somaliland)",
      "type": "International"
    },
    {
      "name": "Berbera Airport",
      "location": "Berbera (Somaliland)",
      "type": "Regional"
    },
    {
      "name": "Bossaso Airport",
      "location": "Bossaso (Puntland)",
      "type": "Regional"
    }
  ],
  "images": [
    "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=800",
    "https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=800",
    "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
    "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800"
  ],
  "heroImage": "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=1920",
  "mapPosition": {
    "lat": 5.152149,
    "lng": 46.199616
  },
  "neighboringCountries": [
    "Djibouti",
    "Ethiopia",
    "Kenya"
  ],
  "economicInfo": {
    "gdp": "$7.6 billion (2022 estimate)",
    "gdpPerCapita": "$450",
    "mainIndustries": [
      "Agriculture",
      "Livestock",
      "Fishing",
      "Telecommunications"
    ],
    "exports": [
      "Livestock",
      "Bananas",
      "Hides",
      "Fish",
      "Charcoal",
      "Frankincense"
    ]
  }
}
```

## Destination Records (Grouped By Country, Full Objects)

### Country: kenya

Total destinations: 5

#### Maasai Mara National Reserve

```json
{
  "id": "maasai-mara",
  "countryId": "kenya",
  "name": "Maasai Mara National Reserve",
  "type": "Wildlife Safari",
  "description": "The world-famous Maasai Mara offers unparalleled wildlife viewing and hosts the spectacular Great Migration.",
  "fullDescription": "The Maasai Mara National Reserve is Kenya's most celebrated wildlife destination, a vast expanse of rolling savanna grasslands teeming with Africa's most iconic animals. Part of the greater Serengeti ecosystem, the Mara hosts the annual Great Migration, when millions of wildebeest, zebras, and gazelles cross the Mara River in a dramatic display of nature's raw power.\n\n      Throughout the year, the reserve offers exceptional game viewing. The \"Big Five\" – lion, leopard, elephant, buffalo, and rhino – are all present, along with cheetahs, hippos, crocodiles, and over 450 bird species. The Mara's predator populations are particularly impressive, with large prides of lions and significant populations of cheetahs.\n\n      The Maasai people, who have coexisted with wildlife here for centuries, add cultural depth to any visit. Community conservancies surrounding the reserve offer opportunities to visit traditional villages, learn about Maasai customs, and contribute to conservation efforts.",
  "highlights": [
    "Great Migration river crossings (July-October)",
    "Exceptional Big Five viewing",
    "Hot air balloon safaris",
    "Maasai cultural visits",
    "Night game drives in conservancies"
  ],
  "bestTime": "July to October for migration; year-round for wildlife",
  "duration": "3-5 days recommended",
  "difficulty": "Easy",
  "price": "$$$",
  "rating": 4.9,
  "reviews": 2847,
  "images": [
    "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800",
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
    "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800"
  ],
  "coordinates": {
    "lat": -1.4061,
    "lng": 35.0167
  }
}
```

#### Mount Kenya

```json
{
  "id": "mount-kenya",
  "countryId": "kenya",
  "name": "Mount Kenya",
  "type": "Mountain Trekking",
  "description": "Africa's second-highest peak offers challenging climbs through diverse ecological zones.",
  "fullDescription": "Mount Kenya, standing at 5,199 meters, is Africa's second-highest mountain and Kenya's highest point. This ancient extinct volcano features dramatic glacial valleys, alpine meadows, and unique high-altitude ecosystems that create a trekker's paradise.\n\n      The mountain presents multiple route options catering to different experience levels. The Sirimon and Chogoria routes are the most popular, offering stunning scenery and reasonable difficulty. Technical climbers can attempt the challenging Batian and Nelion peaks, which require serious mountaineering skills.\n\n      The diverse vegetation zones – from bamboo forest to alpine moorland to glacier – support unique wildlife, including endemic plants like giant lobelias and groundsels, as well as elephants, buffalo, and various antelope species at lower elevations.",
  "highlights": [
    "Point Lenana summit (4,985m)",
    "Diverse ecological zones",
    "Glacial lakes and tarns",
    "Endemic flora and fauna",
    "Stunning sunrise views"
  ],
  "bestTime": "January to February, August to September",
  "duration": "4-6 days",
  "difficulty": "Moderate to Challenging",
  "price": "$$",
  "rating": 4.7,
  "reviews": 1523,
  "images": [
    "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800",
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800"
  ],
  "coordinates": {
    "lat": -0.1521,
    "lng": 37.3084
  }
}
```

#### Diani Beach

```json
{
  "id": "diani-beach",
  "countryId": "kenya",
  "name": "Diani Beach",
  "type": "Beach & Coast",
  "description": "Kenya's premier beach destination with pristine white sands, coral reefs, and water sports.",
  "fullDescription": "Diani Beach, located on Kenya's south coast, is consistently rated among Africa's best beaches. Its 17 kilometers of pristine white sand, backed by palm trees and lapped by the warm Indian Ocean, create a tropical paradise just an hour from Mombasa.\n\n      The offshore coral reefs offer exceptional snorkeling and diving, with colorful fish, sea turtles, dolphins, and during migration season, humpback whales. Water sports enthusiasts enjoy kitesurfing, windsurfing, jet skiing, and deep-sea fishing.\n\n      Beyond the beach, attractions include the Shimba Hills National Reserve, home to Kenya's only sable antelope population, the Colobus Conservation center, and opportunities for dhow sailing to Robinson Island.",
  "highlights": [
    "White sand beaches",
    "Coral reef snorkeling/diving",
    "Kitesurfing and water sports",
    "Shimba Hills wildlife",
    "Swahili culture experiences"
  ],
  "bestTime": "December to March, June to October",
  "duration": "3-7 days",
  "difficulty": "Easy",
  "price": "$$",
  "rating": 4.8,
  "reviews": 3215,
  "images": [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800"
  ],
  "coordinates": {
    "lat": -4.2825,
    "lng": 39.5903
  }
}
```

#### Amboseli National Park

```json
{
  "id": "amboseli",
  "countryId": "kenya",
  "name": "Amboseli National Park",
  "type": "Wildlife Safari",
  "description": "Famous for large elephant herds against the backdrop of Mount Kilimanjaro.",
  "fullDescription": "Amboseli National Park offers one of Africa's most iconic vistas – large herds of elephants traversing the savanna with snow-capped Mount Kilimanjaro rising majestically in the background. This relatively small park packs an extraordinary wildlife punch.\n\n      The park's elephant population is one of the most studied in Africa, with researchers having tracked families for over 40 years. The observation hill provides panoramic views of the park's varied habitats – swamps, springs, and open plains.\n\n      Beyond elephants, Amboseli hosts good populations of lions, cheetahs, hippos, and numerous bird species. The swamps and springs fed by Kilimanjaro's melting snow create permanent water sources that sustain wildlife year-round.",
  "highlights": [
    "Large elephant herds",
    "Mount Kilimanjaro views",
    "Observation Hill panorama",
    "Swamp wildlife viewing",
    "Maasai community visits"
  ],
  "bestTime": "June to October, January to February",
  "duration": "2-3 days",
  "difficulty": "Easy",
  "price": "$$",
  "rating": 4.6,
  "reviews": 2104,
  "images": [
    "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800",
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800"
  ],
  "coordinates": {
    "lat": -2.6527,
    "lng": 37.2606
  }
}
```

#### Lamu Island

```json
{
  "id": "lamu",
  "countryId": "kenya",
  "name": "Lamu Island",
  "type": "Cultural & Beach",
  "description": "A UNESCO World Heritage Swahili town with centuries of history and pristine beaches.",
  "fullDescription": "Lamu is East Africa's oldest continuously inhabited town, a labyrinthine settlement of narrow alleyways, ornate doorways, and buildings that have stood for centuries. This UNESCO World Heritage Site preserves the Swahili culture in its most authentic form.\n\n      The car-free island moves at the pace of donkeys – the primary form of transport – and dhow boats gliding across the channel. Traditional crafts, from boat building to silver work, continue as they have for generations.\n\n      Shela Beach, a 12-kilometer stretch of pristine white sand, and the surrounding Lamu Archipelago offer excellent beaches, snorkeling, and sailing opportunities. The annual Lamu Cultural Festival showcases traditional dhow races, poetry, and music.",
  "highlights": [
    "Lamu Old Town UNESCO site",
    "Traditional dhow sailing",
    "Shela Beach",
    "Swahili architecture",
    "Donkey sanctuary"
  ],
  "bestTime": "December to March, June to October",
  "duration": "3-5 days",
  "difficulty": "Easy",
  "price": "$$",
  "rating": 4.7,
  "reviews": 1876,
  "images": [
    "https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=800",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800"
  ],
  "coordinates": {
    "lat": -2.2717,
    "lng": 40.902
  }
}
```

### Country: tanzania

Total destinations: 4

#### Serengeti National Park

```json
{
  "id": "serengeti",
  "countryId": "tanzania",
  "name": "Serengeti National Park",
  "type": "Wildlife Safari",
  "description": "Africa's most iconic safari destination, home to the greatest wildlife show on Earth.",
  "fullDescription": "The Serengeti is synonymous with African wildlife. This UNESCO World Heritage Site encompasses 14,750 square kilometers of savanna, woodlands, and riverine forests teeming with life. No other place on Earth hosts such concentrations of predators and prey.\n\n      The annual Great Migration – over 1.5 million wildebeest, 500,000 zebras, and hundreds of thousands of gazelles moving in a constant cycle – is nature's greatest spectacle. But the Serengeti offers exceptional wildlife viewing year-round, with resident populations of all major African species.\n\n      The park's different regions offer varied experiences: the Seronera Valley's big cats, the western corridor's river crossings, the northern extension's dramatic Mara River crossings, and the southern plains' calving season.",
  "highlights": [
    "Great Migration",
    "Big cat viewing",
    "Hot air balloon safaris",
    "Dramatic river crossings",
    "Year-round wildlife"
  ],
  "bestTime": "June to October for migration; December to March for calving",
  "duration": "3-5 days",
  "difficulty": "Easy",
  "price": "$$$",
  "rating": 4.9,
  "reviews": 4521,
  "images": [
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
    "https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800"
  ],
  "coordinates": {
    "lat": -2.3333,
    "lng": 34.8333
  }
}
```

#### Mount Kilimanjaro

```json
{
  "id": "kilimanjaro",
  "countryId": "tanzania",
  "name": "Mount Kilimanjaro",
  "type": "Mountain Trekking",
  "description": "Africa's highest peak, the world's tallest free-standing mountain.",
  "fullDescription": "Mount Kilimanjaro, at 5,895 meters, is Africa's highest point and the world's tallest free-standing mountain. This dormant volcano rises dramatically from the surrounding plains, its snow-capped summit visible for miles.\n\n      Unlike other peaks of similar height, Kilimanjaro requires no technical climbing skills – though it demands fitness, determination, and proper acclimatization. Six established routes lead to the summit, each offering different experiences, scenery, and levels of difficulty.\n\n      The journey passes through five distinct climate zones – from tropical forest to alpine desert to arctic summit – creating one of the world's most remarkable hiking experiences.",
  "highlights": [
    "Uhuru Peak summit",
    "Five climate zones",
    "Sunrise from the Roof of Africa",
    "Glaciers and ice fields",
    "Unique high-altitude flora"
  ],
  "bestTime": "January to March, June to October",
  "duration": "5-9 days depending on route",
  "difficulty": "Challenging",
  "price": "$$$",
  "rating": 4.8,
  "reviews": 3876,
  "images": [
    "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
    "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800"
  ],
  "coordinates": {
    "lat": -3.0674,
    "lng": 37.3556
  }
}
```

#### Ngorongoro Crater

```json
{
  "id": "ngorongoro",
  "countryId": "tanzania",
  "name": "Ngorongoro Crater",
  "type": "Wildlife Safari",
  "description": "The world's largest intact caldera, often called Africa's Garden of Eden.",
  "fullDescription": "Ngorongoro Crater is the world's largest intact volcanic caldera, a natural amphitheater 19 kilometers wide that shelters one of Africa's highest wildlife densities. This UNESCO World Heritage Site is often called the \"Eighth Wonder of the World.\"\n\n      The crater floor supports approximately 25,000 large animals, including one of the last populations of black rhinos and unusually high densities of lions. The enclosed nature means animals are present year-round – there's no migration here.\n\n      The crater rim, rising 600 meters above the floor, offers spectacular views and cooler temperatures. The surrounding conservation area includes Oldupai Gorge, where crucial human evolution discoveries were made, and traditional Maasai villages.",
  "highlights": [
    "Black rhino sightings",
    "High predator density",
    "Oldupai Gorge history",
    "Crater rim views",
    "Maasai communities"
  ],
  "bestTime": "June to September; year-round for wildlife",
  "duration": "1-2 days",
  "difficulty": "Easy",
  "price": "$$$",
  "rating": 4.9,
  "reviews": 3654,
  "images": [
    "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800",
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800"
  ],
  "coordinates": {
    "lat": -3.2,
    "lng": 35.5
  }
}
```

#### Zanzibar

```json
{
  "id": "zanzibar",
  "countryId": "tanzania",
  "name": "Zanzibar",
  "type": "Beach & Culture",
  "description": "The exotic spice island with rich history, stunning beaches, and unique culture.",
  "fullDescription": "Zanzibar, the semi-autonomous archipelago off Tanzania's coast, weaves together African, Arab, Indian, and European influences into a unique tapestry of culture and beauty. Stone Town, the historic heart of Zanzibar City, is a UNESCO World Heritage Site of winding alleys, ornate doors, and centuries of history.\n\n      The beaches of Zanzibar's east and north coasts are the stuff of tropical dreams – white sand, palm trees, and turquoise waters. The surrounding reefs offer excellent snorkeling and diving, while Mnemba Atoll is considered one of East Africa's best dive sites.\n\n      The spice heritage that made Zanzibar wealthy lives on in aromatic tours through clove, nutmeg, cinnamon, and pepper plantations. Traditional dhow sailing, seafood feasts, and Swahili culture create an intoxicating atmosphere.",
  "highlights": [
    "Stone Town exploration",
    "Pristine beaches",
    "Spice plantation tours",
    "Diving at Mnemba Atoll",
    "Swahili cuisine"
  ],
  "bestTime": "June to October, December to February",
  "duration": "4-7 days",
  "difficulty": "Easy",
  "price": "$$",
  "rating": 4.8,
  "reviews": 4123,
  "images": [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    "https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=800"
  ],
  "coordinates": {
    "lat": -6.1639,
    "lng": 39.1986
  }
}
```

### Country: uganda

Total destinations: 2

#### Bwindi Impenetrable Forest

```json
{
  "id": "bwindi",
  "countryId": "uganda",
  "name": "Bwindi Impenetrable Forest",
  "type": "Primate Trekking",
  "description": "Home to half the world's remaining mountain gorillas.",
  "fullDescription": "Bwindi Impenetrable National Park, a UNESCO World Heritage Site, protects one of Earth's most important remaining habitats for mountain gorillas. Approximately half of the world's critically endangered mountain gorilla population lives within this dense, mist-covered rainforest.\n\n      Gorilla trekking here is a life-changing experience. Tracking through the steep, dense forest to encounter a habituated gorilla family – watching these gentle giants interact, play, and go about their daily lives – ranks among wildlife viewing's pinnacle experiences.\n\n      Beyond gorillas, Bwindi supports rich biodiversity: over 350 bird species (many forest endemics), 120 mammal species including other primates, and diverse flora. The forest is believed to be one of Africa's oldest, surviving the last ice age.",
  "highlights": [
    "Mountain gorilla trekking",
    "Multiple gorilla families",
    "Ancient rainforest",
    "Rich birdlife",
    "Community experiences"
  ],
  "bestTime": "June to September, December to February",
  "duration": "2-4 days",
  "difficulty": "Moderate to Challenging",
  "price": "$$$",
  "rating": 5,
  "reviews": 2341,
  "images": [
    "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800",
    "https://images.unsplash.com/photo-1553775282-20af80779df7?w=800"
  ],
  "coordinates": {
    "lat": -1.0467,
    "lng": 29.7025
  }
}
```

#### Murchison Falls National Park

```json
{
  "id": "murchison-falls",
  "countryId": "uganda",
  "name": "Murchison Falls National Park",
  "type": "Wildlife & Waterfall",
  "description": "Uganda's largest park, featuring the world's most powerful waterfall.",
  "fullDescription": "Murchison Falls National Park is Uganda's largest protected area, bisected by the Victoria Nile as it makes its journey to Lake Albert. The park's centerpiece is Murchison Falls itself, where the entire Nile forces through a 7-meter gap in the rock, creating an explosion of water and mist.\n\n      Beyond the falls, the park offers exceptional wildlife viewing. The northern bank hosts Uganda's largest population of Rothschild's giraffes, along with lions, elephants, buffalo, and the recently reintroduced rhinos at Ziwa Rhino Sanctuary nearby.\n\n      Boat cruises to the base of the falls combine wildlife viewing – hippos, crocodiles, elephants coming to drink – with the dramatic approach to the thundering cascade.",
  "highlights": [
    "Murchison Falls",
    "Boat cruise to falls base",
    "Big game on northern bank",
    "Rothschild's giraffes",
    "Chimpanzee tracking"
  ],
  "bestTime": "June to September, December to February",
  "duration": "2-3 days",
  "difficulty": "Easy",
  "price": "$$",
  "rating": 4.7,
  "reviews": 1987,
  "images": [
    "https://images.unsplash.com/photo-1578507065211-1c4e99a5fd24?w=800",
    "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=800"
  ],
  "coordinates": {
    "lat": 2.2667,
    "lng": 31.6667
  }
}
```

### Country: rwanda

Total destinations: 1

#### Volcanoes National Park

```json
{
  "id": "volcanoes",
  "countryId": "rwanda",
  "name": "Volcanoes National Park",
  "type": "Primate Trekking",
  "description": "The famous home of mountain gorillas, made legendary by Dian Fossey.",
  "fullDescription": "Volcanoes National Park, nestled in the Virunga Mountains along Rwanda's border with Uganda and the DRC, is perhaps the world's premier destination for mountain gorilla trekking. This is where Dian Fossey conducted her groundbreaking research that brought gorillas to global attention.\n\n      The park protects a significant portion of the mountain gorilla population, with over 10 habituated groups available for trekking. The gorilla experience here is often considered even more intimate than elsewhere, with well-maintained trails and highly experienced guides.\n\n      Beyond gorillas, the park offers golden monkey tracking, hikes to Dian Fossey's grave and research station, and climbs of the volcanic peaks including Mount Bisoke with its stunning crater lake.",
  "highlights": [
    "Mountain gorilla trekking",
    "Golden monkey tracking",
    "Dian Fossey's grave",
    "Volcanic peak climbs",
    "Crater lake views"
  ],
  "bestTime": "June to September, December to February",
  "duration": "2-4 days",
  "difficulty": "Moderate to Challenging",
  "price": "$$$",
  "rating": 4.9,
  "reviews": 2156,
  "images": [
    "https://images.unsplash.com/photo-1580746738783-63c5b771c993?w=800",
    "https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=800"
  ],
  "coordinates": {
    "lat": -1.4538,
    "lng": 29.5149
  }
}
```

### Country: ethiopia

Total destinations: 2

#### Rock-Hewn Churches of Lalibela

```json
{
  "id": "lalibela",
  "countryId": "ethiopia",
  "name": "Rock-Hewn Churches of Lalibela",
  "type": "Historical & Religious",
  "description": "Eleven medieval churches carved from solid rock, a UNESCO World Heritage Site.",
  "fullDescription": "Lalibela is home to one of humanity's most remarkable architectural achievements – 11 monolithic churches carved from solid rock in the 12th and 13th centuries. These structures, commissioned by King Lalibela to create a \"New Jerusalem,\" are still active places of worship today.\n\n      The churches are divided into two main groups connected by tunnels and passageways, with the cross-shaped Bete Giyorgis (Church of St. George) standing alone as perhaps the most striking example. Each church features unique architectural details, carvings, and religious artifacts.\n\n      During major Orthodox festivals, particularly Timkat (Epiphany) and Genna (Christmas), the churches come alive with white-robed pilgrims, chanting, and ceremonies that have changed little over eight centuries.",
  "highlights": [
    "Bete Giyorgis (Church of St. George)",
    "Northern and eastern church groups",
    "Orthodox ceremonies",
    "Tunnel networks",
    "Religious festivals"
  ],
  "bestTime": "October to March; January for Timkat",
  "duration": "2-3 days",
  "difficulty": "Easy",
  "price": "$$",
  "rating": 4.9,
  "reviews": 1876,
  "images": [
    "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800",
    "https://images.unsplash.com/photo-1569144654912-5f146d155a23?w=800"
  ],
  "coordinates": {
    "lat": 12.0319,
    "lng": 39.0472
  }
}
```

#### Simien Mountains

```json
{
  "id": "simien-mountains",
  "countryId": "ethiopia",
  "name": "Simien Mountains",
  "type": "Trekking & Wildlife",
  "description": "Dramatic escarpments and endemic wildlife in Africa's \"Roof.\"",
  "fullDescription": "The Simien Mountains National Park, a UNESCO World Heritage Site, offers some of Africa's most dramatic scenery. Formed by volcanic eruptions 40 million years ago, the massif features jagged peaks, deep valleys, and sheer cliffs dropping over 1,500 meters.\n\n      The park is home to several endemic species found nowhere else on Earth: the charismatic Gelada baboon (often called the bleeding-heart monkey), the rare Ethiopian wolf, and the Walia ibex. Geladas often number in the hundreds, grazing on the alpine meadows in spectacular congregations.\n\n      Multi-day treks lead to Ras Dashen, Ethiopia's highest peak at 4,550 meters, passing through afro-alpine ecosystems with giant lobelias and other unique plants.",
  "highlights": [
    "Gelada baboon encounters",
    "Dramatic escarpment views",
    "Ethiopian wolf sightings",
    "Ras Dashen summit",
    "Endemic flora"
  ],
  "bestTime": "October to March",
  "duration": "3-10 days",
  "difficulty": "Moderate to Challenging",
  "price": "$$",
  "rating": 4.8,
  "reviews": 1432,
  "images": [
    "https://images.unsplash.com/photo-1510155324852-d5d2dbe7a5e8?w=800",
    "https://images.unsplash.com/photo-1569144654912-5f146d155a23?w=800"
  ],
  "coordinates": {
    "lat": 13.2333,
    "lng": 38.0667
  }
}
```

### Country: burundi

Total destinations: 1

#### Lake Tanganyika

```json
{
  "id": "lake-tanganyika-burundi",
  "countryId": "burundi",
  "name": "Lake Tanganyika",
  "type": "Beach & Nature",
  "description": "Africa's oldest and deepest lake, with pristine beaches and fishing villages.",
  "fullDescription": "Lake Tanganyika, the world's second-deepest lake, forms Burundi's western border, offering beaches, water activities, and glimpses into traditional fishing life. The lake's ancient origins – over 10 million years old – have resulted in remarkable endemic species, including many unique cichlid fish.\n\n      Bujumbura's lakeside beaches provide a relaxing escape with views across to the DRC mountains. Boat trips along the shore visit traditional fishing villages where life continues as it has for generations.\n\n      The lake's waters are clean and warm, safe for swimming, and the surrounding hills offer hiking opportunities with panoramic views.",
  "highlights": [
    "Saga Beach activities",
    "Fishing village visits",
    "Swimming and snorkeling",
    "Sunset views",
    "Boat excursions"
  ],
  "bestTime": "June to September",
  "duration": "2-3 days",
  "difficulty": "Easy",
  "price": "$",
  "rating": 4.3,
  "reviews": 543,
  "images": [
    "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=800",
    "https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=800"
  ],
  "coordinates": {
    "lat": -3.5,
    "lng": 29.3
  }
}
```

### Country: south-sudan

Total destinations: 1

#### Boma National Park

```json
{
  "id": "boma-national-park",
  "countryId": "south-sudan",
  "name": "Boma National Park",
  "type": "Wildlife",
  "description": "Home to one of Africa's greatest, yet least-known, wildlife migrations.",
  "fullDescription": "Boma National Park harbors what may be Africa's largest wildlife migration – hundreds of thousands of white-eared kob, along with elephants, buffalo, and numerous other species. This spectacle, virtually unknown to most travelers, rivals the famous Serengeti migration.\n\n      The park's remoteness has protected its wildlife from hunting, creating one of Africa's last true wilderness areas. Visiting requires careful planning and a spirit of adventure, but rewards with pristine wildlife viewing without another tourist in sight.\n\n      The surrounding communities, including the Murle, Anuak, and Nuer peoples, maintain traditional ways of life, adding cultural depth to any expedition.",
  "highlights": [
    "White-eared kob migration",
    "True wilderness experience",
    "Large elephant herds",
    "Traditional communities",
    "Untouched landscapes"
  ],
  "bestTime": "December to March",
  "duration": "5-7 days",
  "difficulty": "Challenging",
  "price": "$$$",
  "rating": 4.5,
  "reviews": 87,
  "images": [
    "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800",
    "https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=800"
  ],
  "coordinates": {
    "lat": 6.2,
    "lng": 33.8
  }
}
```

### Country: eritrea

Total destinations: 1

#### Asmara

```json
{
  "id": "asmara",
  "countryId": "eritrea",
  "name": "Asmara",
  "type": "Architecture & Culture",
  "description": "A UNESCO World Heritage city showcasing preserved Italian modernist architecture.",
  "fullDescription": "Asmara, Eritrea's capital, is a UNESCO World Heritage Site for its extraordinarily well-preserved Italian modernist architecture. Built during Italian colonization in the 1930s, the city features futurist, art deco, and rationalist buildings that form one of the world's most concentrated collections of modernist architecture.\n\n      Cinema Impero, Fiat Tagliero Service Station (shaped like an airplane), and numerous apartment buildings, shops, and government offices showcase the architectural ambition of the era. The city's elevation at 2,400 meters provides a pleasant climate, perfect for exploring on foot.\n\n      The coffee culture here is exceptional – the Italian influence remains in the numerous espresso bars and cafes that line the palm-tree-lined boulevards.",
  "highlights": [
    "Fiat Tagliero Service Station",
    "Cinema Impero",
    "Art Deco architecture",
    "Coffee culture",
    "Boulevard strolls"
  ],
  "bestTime": "October to March",
  "duration": "2-3 days",
  "difficulty": "Easy",
  "price": "$",
  "rating": 4.4,
  "reviews": 412,
  "images": [
    "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800",
    "https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=800"
  ],
  "coordinates": {
    "lat": 15.3229,
    "lng": 38.9251
  }
}
```

### Country: djibouti

Total destinations: 1

#### Lake Assal

```json
{
  "id": "lake-assal",
  "countryId": "djibouti",
  "name": "Lake Assal",
  "type": "Natural Wonder",
  "description": "Africa's lowest point and one of Earth's saltiest lakes.",
  "fullDescription": "Lake Assal, lying 155 meters below sea level, is Africa's lowest point and one of the saltiest bodies of water on Earth – ten times saltier than the ocean. The lake's shores are encrusted with brilliant white salt deposits that sparkle under the intense sun, creating an otherworldly landscape.\n\n      The drive to Lake Assal passes through dramatic volcanic terrain, with lava fields and colored rock formations adding to the lunar atmosphere. The Afar people still harvest salt here as they have for centuries, loading the valuable commodity onto camel caravans.\n\n      Swimming (floating, really) in the hypersaline water is a unique experience, though the harsh environment demands respect – bring plenty of water and protection from the sun.",
  "highlights": [
    "Float in hypersaline water",
    "Salt formations",
    "Africa's lowest point",
    "Afar salt caravans",
    "Volcanic landscapes"
  ],
  "bestTime": "November to April",
  "duration": "1 day",
  "difficulty": "Easy",
  "price": "$$",
  "rating": 4.6,
  "reviews": 321,
  "images": [
    "https://images.unsplash.com/photo-1510155324852-d5d2dbe7a5e8?w=800",
    "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=800"
  ],
  "coordinates": {
    "lat": 11.65,
    "lng": 42.4167
  }
}
```

### Country: somalia

Total destinations: 1

#### Laas Geel

```json
{
  "id": "laas-geel",
  "countryId": "somalia",
  "name": "Laas Geel",
  "type": "Archaeological",
  "description": "Stunning Neolithic rock art caves in the hills near Hargeisa.",
  "fullDescription": "Laas Geel, located in Somaliland, contains some of the best-preserved Neolithic rock art in Africa. Discovered in 2002 by a French archaeological team, the cave paintings date back approximately 5,000-10,000 years and depict cattle, wild animals, and human figures in vibrant reds, whites, and oranges.\n\n      The caves sit in a dramatic landscape of rocky outcrops and wadis (dry riverbeds) outside Hargeisa. The art's exceptional preservation results from the overhang of the rock shelters, which protected the paintings from the elements.\n\n      The site offers a window into the region's pastoral past, when the area was greener and supported cattle-herding communities. Local guides from Hargeisa can arrange visits, typically combined with other sites in the area.",
  "highlights": [
    "Well-preserved cave paintings",
    "Ancient cattle depictions",
    "Dramatic rock formations",
    "Archaeological significance",
    "Off-the-beaten-path adventure"
  ],
  "bestTime": "December to February",
  "duration": "1 day",
  "difficulty": "Easy",
  "price": "$",
  "rating": 4.7,
  "reviews": 156,
  "images": [
    "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=800",
    "https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=800"
  ],
  "coordinates": {
    "lat": 9.7833,
    "lng": 44.4667
  }
}
```

## Frontend Dependencies On Backend Data (Production)

- Country listing, card content, map coordinates, hero media
- Destination listing/details and slideshow images
- Country page static brief data and AI prompt context fields
- Home marketing content blocks (featured stats/cards/partners)
- About page team/media/story blocks
- Payment terms and booking contact configuration
- Tips, blog posts, testimonials, and services feeds

## Notes

- Keep stable IDs for country and destination records to preserve route URLs.
- Validate image URLs and coordinates during import to prevent runtime card/map failures.
- If moving AI prompts/config to backend, protect provider keys server-side only.