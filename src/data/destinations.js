export const destinations = {
  kenya: [
    {
      id: 'maasai-mara',
      countryId: 'kenya',
      name: 'Maasai Mara National Reserve',
      type: 'Wildlife Safari',
      description: 'The world-famous Maasai Mara offers unparalleled wildlife viewing and hosts the spectacular Great Migration.',
      fullDescription: `The Maasai Mara National Reserve is Kenya's most celebrated wildlife destination, a vast expanse of rolling savanna grasslands teeming with Africa's most iconic animals. Part of the greater Serengeti ecosystem, the Mara hosts the annual Great Migration, when millions of wildebeest, zebras, and gazelles cross the Mara River in a dramatic display of nature's raw power.

      Throughout the year, the reserve offers exceptional game viewing. The "Big Five" – lion, leopard, elephant, buffalo, and rhino – are all present, along with cheetahs, hippos, crocodiles, and over 450 bird species. The Mara's predator populations are particularly impressive, with large prides of lions and significant populations of cheetahs.

      The Maasai people, who have coexisted with wildlife here for centuries, add cultural depth to any visit. Community conservancies surrounding the reserve offer opportunities to visit traditional villages, learn about Maasai customs, and contribute to conservation efforts.`,
      highlights: [
        'Great Migration river crossings (July-October)',
        'Exceptional Big Five viewing',
        'Hot air balloon safaris',
        'Maasai cultural visits',
        'Night game drives in conservancies'
      ],
      bestTime: 'July to October for migration; year-round for wildlife',
      duration: '3-5 days recommended',
      difficulty: 'Easy',
      price: '$$$',
      rating: 4.9,
      reviews: 2847,
      images: [
        'https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=800',
        'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
        'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800'
      ],
      coordinates: { lat: -1.4061, lng: 35.0167 }
    },
    {
      id: 'mount-kenya',
      countryId: 'kenya',
      name: 'Mount Kenya',
      type: 'Mountain Trekking',
      description: 'Africa\'s second-highest peak offers challenging climbs through diverse ecological zones.',
      fullDescription: `Mount Kenya, standing at 5,199 meters, is Africa's second-highest mountain and Kenya's highest point. This ancient extinct volcano features dramatic glacial valleys, alpine meadows, and unique high-altitude ecosystems that create a trekker's paradise.

      The mountain presents multiple route options catering to different experience levels. The Sirimon and Chogoria routes are the most popular, offering stunning scenery and reasonable difficulty. Technical climbers can attempt the challenging Batian and Nelion peaks, which require serious mountaineering skills.

      The diverse vegetation zones – from bamboo forest to alpine moorland to glacier – support unique wildlife, including endemic plants like giant lobelias and groundsels, as well as elephants, buffalo, and various antelope species at lower elevations.`,
      highlights: [
        'Point Lenana summit (4,985m)',
        'Diverse ecological zones',
        'Glacial lakes and tarns',
        'Endemic flora and fauna',
        'Stunning sunrise views'
      ],
      bestTime: 'January to February, August to September',
      duration: '4-6 days',
      difficulty: 'Moderate to Challenging',
      price: '$$',
      rating: 4.7,
      reviews: 1523,
      images: [
        'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800',
        'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800'
      ],
      coordinates: { lat: -0.1521, lng: 37.3084 }
    },
    {
      id: 'diani-beach',
      countryId: 'kenya',
      name: 'Diani Beach',
      type: 'Beach & Coast',
      description: 'Kenya\'s premier beach destination with pristine white sands, coral reefs, and water sports.',
      fullDescription: `Diani Beach, located on Kenya's south coast, is consistently rated among Africa's best beaches. Its 17 kilometers of pristine white sand, backed by palm trees and lapped by the warm Indian Ocean, create a tropical paradise just an hour from Mombasa.

      The offshore coral reefs offer exceptional snorkeling and diving, with colorful fish, sea turtles, dolphins, and during migration season, humpback whales. Water sports enthusiasts enjoy kitesurfing, windsurfing, jet skiing, and deep-sea fishing.

      Beyond the beach, attractions include the Shimba Hills National Reserve, home to Kenya's only sable antelope population, the Colobus Conservation center, and opportunities for dhow sailing to Robinson Island.`,
      highlights: [
        'White sand beaches',
        'Coral reef snorkeling/diving',
        'Kitesurfing and water sports',
        'Shimba Hills wildlife',
        'Swahili culture experiences'
      ],
      bestTime: 'December to March, June to October',
      duration: '3-7 days',
      difficulty: 'Easy',
      price: '$$',
      rating: 4.8,
      reviews: 3215,
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800'
      ],
      coordinates: { lat: -4.2825, lng: 39.5903 }
    },
    {
      id: 'amboseli',
      countryId: 'kenya',
      name: 'Amboseli National Park',
      type: 'Wildlife Safari',
      description: 'Famous for large elephant herds against the backdrop of Mount Kilimanjaro.',
      fullDescription: `Amboseli National Park offers one of Africa's most iconic vistas – large herds of elephants traversing the savanna with snow-capped Mount Kilimanjaro rising majestically in the background. This relatively small park packs an extraordinary wildlife punch.

      The park's elephant population is one of the most studied in Africa, with researchers having tracked families for over 40 years. The observation hill provides panoramic views of the park's varied habitats – swamps, springs, and open plains.

      Beyond elephants, Amboseli hosts good populations of lions, cheetahs, hippos, and numerous bird species. The swamps and springs fed by Kilimanjaro's melting snow create permanent water sources that sustain wildlife year-round.`,
      highlights: [
        'Large elephant herds',
        'Mount Kilimanjaro views',
        'Observation Hill panorama',
        'Swamp wildlife viewing',
        'Maasai community visits'
      ],
      bestTime: 'June to October, January to February',
      duration: '2-3 days',
      difficulty: 'Easy',
      price: '$$',
      rating: 4.6,
      reviews: 2104,
      images: [
        'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800',
        'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800'
      ],
      coordinates: { lat: -2.6527, lng: 37.2606 }
    },
    {
      id: 'lamu',
      countryId: 'kenya',
      name: 'Lamu Island',
      type: 'Cultural & Beach',
      description: 'A UNESCO World Heritage Swahili town with centuries of history and pristine beaches.',
      fullDescription: `Lamu is East Africa's oldest continuously inhabited town, a labyrinthine settlement of narrow alleyways, ornate doorways, and buildings that have stood for centuries. This UNESCO World Heritage Site preserves the Swahili culture in its most authentic form.

      The car-free island moves at the pace of donkeys – the primary form of transport – and dhow boats gliding across the channel. Traditional crafts, from boat building to silver work, continue as they have for generations.

      Shela Beach, a 12-kilometer stretch of pristine white sand, and the surrounding Lamu Archipelago offer excellent beaches, snorkeling, and sailing opportunities. The annual Lamu Cultural Festival showcases traditional dhow races, poetry, and music.`,
      highlights: [
        'Lamu Old Town UNESCO site',
        'Traditional dhow sailing',
        'Shela Beach',
        'Swahili architecture',
        'Donkey sanctuary'
      ],
      bestTime: 'December to March, June to October',
      duration: '3-5 days',
      difficulty: 'Easy',
      price: '$$',
      rating: 4.7,
      reviews: 1876,
      images: [
        'https://lp-cms-production.imgix.net/2022-02/iStock-532057664%20RFC.jpg?auto=format,compress&q=72&w=1095&h=821&fit=crop&crop=faces,edges',
        'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSiIaRzqstI9ci-gcHv4Q2MvvHaUX3FlwfcauQbXoBEgk9rCjTT'
      ],
      coordinates: { lat: -2.2717, lng: 40.9020 }
    }
  ],
  tanzania: [
    {
      id: 'serengeti',
      countryId: 'tanzania',
      name: 'Serengeti National Park',
      type: 'Wildlife Safari',
      description: 'Africa\'s most iconic safari destination, home to the greatest wildlife show on Earth.',
      fullDescription: `The Serengeti is synonymous with African wildlife. This UNESCO World Heritage Site encompasses 14,750 square kilometers of savanna, woodlands, and riverine forests teeming with life. No other place on Earth hosts such concentrations of predators and prey.

      The annual Great Migration – over 1.5 million wildebeest, 500,000 zebras, and hundreds of thousands of gazelles moving in a constant cycle – is nature's greatest spectacle. But the Serengeti offers exceptional wildlife viewing year-round, with resident populations of all major African species.

      The park's different regions offer varied experiences: the Seronera Valley's big cats, the western corridor's river crossings, the northern extension's dramatic Mara River crossings, and the southern plains' calving season.`,
      highlights: [
        'Great Migration',
        'Big cat viewing',
        'Hot air balloon safaris',
        'Dramatic river crossings',
        'Year-round wildlife'
      ],
      bestTime: 'June to October for migration; December to March for calving',
      duration: '3-5 days',
      difficulty: 'Easy',
      price: '$$$',
      rating: 4.9,
      reviews: 4521,
      images: [
        'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
        'https://images.unsplash.com/photo-1535941339077-2dd1c7963098?w=800'
      ],
      coordinates: { lat: -2.3333, lng: 34.8333 }
    },
    {
      id: 'kilimanjaro',
      countryId: 'tanzania',
      name: 'Mount Kilimanjaro',
      type: 'Mountain Trekking',
      description: 'Africa\'s highest peak, the world\'s tallest free-standing mountain.',
      fullDescription: `Mount Kilimanjaro, at 5,895 meters, is Africa's highest point and the world's tallest free-standing mountain. This dormant volcano rises dramatically from the surrounding plains, its snow-capped summit visible for miles.

      Unlike other peaks of similar height, Kilimanjaro requires no technical climbing skills – though it demands fitness, determination, and proper acclimatization. Six established routes lead to the summit, each offering different experiences, scenery, and levels of difficulty.

      The journey passes through five distinct climate zones – from tropical forest to alpine desert to arctic summit – creating one of the world's most remarkable hiking experiences.`,
      highlights: [
        'Uhuru Peak summit',
        'Five climate zones',
        'Sunrise from the Roof of Africa',
        'Glaciers and ice fields',
        'Unique high-altitude flora'
      ],
      bestTime: 'January to March, June to October',
      duration: '5-9 days depending on route',
      difficulty: 'Challenging',
      price: '$$$',
      rating: 4.8,
      reviews: 3876,
      images: [
        'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
        'https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=800'
      ],
      coordinates: { lat: -3.0674, lng: 37.3556 }
    },
    {
      id: 'ngorongoro',
      countryId: 'tanzania',
      name: 'Ngorongoro Crater',
      type: 'Wildlife Safari',
      description: 'The world\'s largest intact caldera, often called Africa\'s Garden of Eden.',
      fullDescription: `Ngorongoro Crater is the world's largest intact volcanic caldera, a natural amphitheater 19 kilometers wide that shelters one of Africa's highest wildlife densities. This UNESCO World Heritage Site is often called the "Eighth Wonder of the World."

      The crater floor supports approximately 25,000 large animals, including one of the last populations of black rhinos and unusually high densities of lions. The enclosed nature means animals are present year-round – there's no migration here.

      The crater rim, rising 600 meters above the floor, offers spectacular views and cooler temperatures. The surrounding conservation area includes Oldupai Gorge, where crucial human evolution discoveries were made, and traditional Maasai villages.`,
      highlights: [
        'Black rhino sightings',
        'High predator density',
        'Oldupai Gorge history',
        'Crater rim views',
        'Maasai communities'
      ],
      bestTime: 'June to September; year-round for wildlife',
      duration: '1-2 days',
      difficulty: 'Easy',
      price: '$$$',
      rating: 4.9,
      reviews: 3654,
      images: [
        'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800',
        'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800'
      ],
      coordinates: { lat: -3.2, lng: 35.5 }
    },
    {
      id: 'zanzibar',
      countryId: 'tanzania',
      name: 'Zanzibar',
      type: 'Beach & Culture',
      description: 'The exotic spice island with rich history, stunning beaches, and unique culture.',
      fullDescription: `Zanzibar, the semi-autonomous archipelago off Tanzania's coast, weaves together African, Arab, Indian, and European influences into a unique tapestry of culture and beauty. Stone Town, the historic heart of Zanzibar City, is a UNESCO World Heritage Site of winding alleys, ornate doors, and centuries of history.

      The beaches of Zanzibar's east and north coasts are the stuff of tropical dreams – white sand, palm trees, and turquoise waters. The surrounding reefs offer excellent snorkeling and diving, while Mnemba Atoll is considered one of East Africa's best dive sites.

      The spice heritage that made Zanzibar wealthy lives on in aromatic tours through clove, nutmeg, cinnamon, and pepper plantations. Traditional dhow sailing, seafood feasts, and Swahili culture create an intoxicating atmosphere.`,
      highlights: [
        'Stone Town exploration',
        'Pristine beaches',
        'Spice plantation tours',
        'Diving at Mnemba Atoll',
        'Swahili cuisine'
      ],
      bestTime: 'June to October, December to February',
      duration: '4-7 days',
      difficulty: 'Easy',
      price: '$$',
      rating: 4.8,
      reviews: 4123,
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        'https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=800'
      ],
      coordinates: { lat: -6.1639, lng: 39.1986 }
    }
  ],
  uganda: [
    {
      id: 'bwindi',
      countryId: 'uganda',
      name: 'Bwindi Impenetrable Forest',
      type: 'Primate Trekking',
      description: 'Home to half the world\'s remaining mountain gorillas.',
      fullDescription: `Bwindi Impenetrable National Park, a UNESCO World Heritage Site, protects one of Earth's most important remaining habitats for mountain gorillas. Approximately half of the world's critically endangered mountain gorilla population lives within this dense, mist-covered rainforest.

      Gorilla trekking here is a life-changing experience. Tracking through the steep, dense forest to encounter a habituated gorilla family – watching these gentle giants interact, play, and go about their daily lives – ranks among wildlife viewing's pinnacle experiences.

      Beyond gorillas, Bwindi supports rich biodiversity: over 350 bird species (many forest endemics), 120 mammal species including other primates, and diverse flora. The forest is believed to be one of Africa's oldest, surviving the last ice age.`,
      highlights: [
        'Mountain gorilla trekking',
        'Multiple gorilla families',
        'Ancient rainforest',
        'Rich birdlife',
        'Community experiences'
      ],
      bestTime: 'June to September, December to February',
      duration: '2-4 days',
      difficulty: 'Moderate to Challenging',
      price: '$$$',
      rating: 5.0,
      reviews: 2341,
      images: [
        'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800',
        'https://images.unsplash.com/photo-1553775282-20af80779df7?w=800'
      ],
      coordinates: { lat: -1.0467, lng: 29.7025 }
    },
    {
      id: 'murchison-falls',
      countryId: 'uganda',
      name: 'Murchison Falls National Park',
      type: 'Wildlife & Waterfall',
      description: 'Uganda\'s largest park, featuring the world\'s most powerful waterfall.',
      fullDescription: `Murchison Falls National Park is Uganda's largest protected area, bisected by the Victoria Nile as it makes its journey to Lake Albert. The park's centerpiece is Murchison Falls itself, where the entire Nile forces through a 7-meter gap in the rock, creating an explosion of water and mist.

      Beyond the falls, the park offers exceptional wildlife viewing. The northern bank hosts Uganda's largest population of Rothschild's giraffes, along with lions, elephants, buffalo, and the recently reintroduced rhinos at Ziwa Rhino Sanctuary nearby.

      Boat cruises to the base of the falls combine wildlife viewing – hippos, crocodiles, elephants coming to drink – with the dramatic approach to the thundering cascade.`,
      highlights: [
        'Murchison Falls',
        'Boat cruise to falls base',
        'Big game on northern bank',
        'Rothschild\'s giraffes',
        'Chimpanzee tracking'
      ],
      bestTime: 'June to September, December to February',
      duration: '2-3 days',
      difficulty: 'Easy',
      price: '$$',
      rating: 4.7,
      reviews: 1987,
      images: [
        'https://images.unsplash.com/photo-1578507065211-1c4e99a5fd24?w=800',
        'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=800'
      ],
      coordinates: { lat: 2.2667, lng: 31.6667 }
    }
  ],
  rwanda: [
    {
      id: 'volcanoes',
      countryId: 'rwanda',
      name: 'Volcanoes National Park',
      type: 'Primate Trekking',
      description: 'The famous home of mountain gorillas, made legendary by Dian Fossey.',
      fullDescription: `Volcanoes National Park, nestled in the Virunga Mountains along Rwanda's border with Uganda and the DRC, is perhaps the world's premier destination for mountain gorilla trekking. This is where Dian Fossey conducted her groundbreaking research that brought gorillas to global attention.

      The park protects a significant portion of the mountain gorilla population, with over 10 habituated groups available for trekking. The gorilla experience here is often considered even more intimate than elsewhere, with well-maintained trails and highly experienced guides.

      Beyond gorillas, the park offers golden monkey tracking, hikes to Dian Fossey's grave and research station, and climbs of the volcanic peaks including Mount Bisoke with its stunning crater lake.`,
      highlights: [
        'Mountain gorilla trekking',
        'Golden monkey tracking',
        'Dian Fossey\'s grave',
        'Volcanic peak climbs',
        'Crater lake views'
      ],
      bestTime: 'June to September, December to February',
      duration: '2-4 days',
      difficulty: 'Moderate to Challenging',
      price: '$$$',
      rating: 4.9,
      reviews: 2156,
      images: [
        'https://images.unsplash.com/photo-1580746738783-63c5b771c993?w=800',
        'https://images.unsplash.com/photo-1619451334792-150fd785ee74?w=800'
      ],
      coordinates: { lat: -1.4538, lng: 29.5149 }
    }
  ],
  ethiopia: [
    {
      id: 'lalibela',
      countryId: 'ethiopia',
      name: 'Rock-Hewn Churches of Lalibela',
      type: 'Historical & Religious',
      description: 'Eleven medieval churches carved from solid rock, a UNESCO World Heritage Site.',
      fullDescription: `Lalibela is home to one of humanity's most remarkable architectural achievements – 11 monolithic churches carved from solid rock in the 12th and 13th centuries. These structures, commissioned by King Lalibela to create a "New Jerusalem," are still active places of worship today.

      The churches are divided into two main groups connected by tunnels and passageways, with the cross-shaped Bete Giyorgis (Church of St. George) standing alone as perhaps the most striking example. Each church features unique architectural details, carvings, and religious artifacts.

      During major Orthodox festivals, particularly Timkat (Epiphany) and Genna (Christmas), the churches come alive with white-robed pilgrims, chanting, and ceremonies that have changed little over eight centuries.`,
      highlights: [
        'Bete Giyorgis (Church of St. George)',
        'Northern and eastern church groups',
        'Orthodox ceremonies',
        'Tunnel networks',
        'Religious festivals'
      ],
      bestTime: 'October to March; January for Timkat',
      duration: '2-3 days',
      difficulty: 'Easy',
      price: '$$',
      rating: 4.9,
      reviews: 1876,
      images: [
        'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800',
        'https://images.unsplash.com/photo-1569144654912-5f146d155a23?w=800'
      ],
      coordinates: { lat: 12.0319, lng: 39.0472 }
    },
    {
      id: 'simien-mountains',
      countryId: 'ethiopia',
      name: 'Simien Mountains',
      type: 'Trekking & Wildlife',
      description: 'Dramatic escarpments and endemic wildlife in Africa\'s "Roof."',
      fullDescription: `The Simien Mountains National Park, a UNESCO World Heritage Site, offers some of Africa's most dramatic scenery. Formed by volcanic eruptions 40 million years ago, the massif features jagged peaks, deep valleys, and sheer cliffs dropping over 1,500 meters.

      The park is home to several endemic species found nowhere else on Earth: the charismatic Gelada baboon (often called the bleeding-heart monkey), the rare Ethiopian wolf, and the Walia ibex. Geladas often number in the hundreds, grazing on the alpine meadows in spectacular congregations.

      Multi-day treks lead to Ras Dashen, Ethiopia's highest peak at 4,550 meters, passing through afro-alpine ecosystems with giant lobelias and other unique plants.`,
      highlights: [
        'Gelada baboon encounters',
        'Dramatic escarpment views',
        'Ethiopian wolf sightings',
        'Ras Dashen summit',
        'Endemic flora'
      ],
      bestTime: 'October to March',
      duration: '3-10 days',
      difficulty: 'Moderate to Challenging',
      price: '$$',
      rating: 4.8,
      reviews: 1432,
      images: [
        'https://images.unsplash.com/photo-1510155324852-d5d2dbe7a5e8?w=800',
        'https://images.unsplash.com/photo-1569144654912-5f146d155a23?w=800'
      ],
      coordinates: { lat: 13.2333, lng: 38.0667 }
    }
  ],
  burundi: [
    {
      id: 'lake-tanganyika-burundi',
      countryId: 'burundi',
      name: 'Lake Tanganyika',
      type: 'Beach & Nature',
      description: 'Africa\'s oldest and deepest lake, with pristine beaches and fishing villages.',
      fullDescription: `Lake Tanganyika, the world's second-deepest lake, forms Burundi's western border, offering beaches, water activities, and glimpses into traditional fishing life. The lake's ancient origins – over 10 million years old – have resulted in remarkable endemic species, including many unique cichlid fish.

      Bujumbura's lakeside beaches provide a relaxing escape with views across to the DRC mountains. Boat trips along the shore visit traditional fishing villages where life continues as it has for generations.

      The lake's waters are clean and warm, safe for swimming, and the surrounding hills offer hiking opportunities with panoramic views.`,
      highlights: [
        'Saga Beach activities',
        'Fishing village visits',
        'Swimming and snorkeling',
        'Sunset views',
        'Boat excursions'
      ],
      bestTime: 'June to September',
      duration: '2-3 days',
      difficulty: 'Easy',
      price: '$',
      rating: 4.3,
      reviews: 543,
      images: [
        'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=800',
        'https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=800'
      ],
      coordinates: { lat: -3.5, lng: 29.3 }
    }
  ],
  'south-sudan': [
    {
      id: 'boma-national-park',
      countryId: 'south-sudan',
      name: 'Boma National Park',
      type: 'Wildlife',
      description: 'Home to one of Africa\'s greatest, yet least-known, wildlife migrations.',
      fullDescription: `Boma National Park harbors what may be Africa's largest wildlife migration – hundreds of thousands of white-eared kob, along with elephants, buffalo, and numerous other species. This spectacle, virtually unknown to most travelers, rivals the famous Serengeti migration.

      The park's remoteness has protected its wildlife from hunting, creating one of Africa's last true wilderness areas. Visiting requires careful planning and a spirit of adventure, but rewards with pristine wildlife viewing without another tourist in sight.

      The surrounding communities, including the Murle, Anuak, and Nuer peoples, maintain traditional ways of life, adding cultural depth to any expedition.`,
      highlights: [
        'White-eared kob migration',
        'True wilderness experience',
        'Large elephant herds',
        'Traditional communities',
        'Untouched landscapes'
      ],
      bestTime: 'December to March',
      duration: '5-7 days',
      difficulty: 'Challenging',
      price: '$$$',
      rating: 4.5,
      reviews: 87,
      images: [
        'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
        'https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=800'
      ],
      coordinates: { lat: 6.2, lng: 33.8 }
    }
  ],
  eritrea: [
    {
      id: 'asmara',
      countryId: 'eritrea',
      name: 'Asmara',
      type: 'Architecture & Culture',
      description: 'A UNESCO World Heritage city showcasing preserved Italian modernist architecture.',
      fullDescription: `Asmara, Eritrea's capital, is a UNESCO World Heritage Site for its extraordinarily well-preserved Italian modernist architecture. Built during Italian colonization in the 1930s, the city features futurist, art deco, and rationalist buildings that form one of the world's most concentrated collections of modernist architecture.

      Cinema Impero, Fiat Tagliero Service Station (shaped like an airplane), and numerous apartment buildings, shops, and government offices showcase the architectural ambition of the era. The city's elevation at 2,400 meters provides a pleasant climate, perfect for exploring on foot.

      The coffee culture here is exceptional – the Italian influence remains in the numerous espresso bars and cafes that line the palm-tree-lined boulevards.`,
      highlights: [
        'Fiat Tagliero Service Station',
        'Cinema Impero',
        'Art Deco architecture',
        'Coffee culture',
        'Boulevard strolls'
      ],
      bestTime: 'October to March',
      duration: '2-3 days',
      difficulty: 'Easy',
      price: '$',
      rating: 4.4,
      reviews: 412,
      images: [
        'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800',
        'https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=800'
      ],
      coordinates: { lat: 15.3229, lng: 38.9251 }
    }
  ],
  djibouti: [
    {
      id: 'lake-assal',
      countryId: 'djibouti',
      name: 'Lake Assal',
      type: 'Natural Wonder',
      description: 'Africa\'s lowest point and one of Earth\'s saltiest lakes.',
      fullDescription: `Lake Assal, lying 155 meters below sea level, is Africa's lowest point and one of the saltiest bodies of water on Earth – ten times saltier than the ocean. The lake's shores are encrusted with brilliant white salt deposits that sparkle under the intense sun, creating an otherworldly landscape.

      The drive to Lake Assal passes through dramatic volcanic terrain, with lava fields and colored rock formations adding to the lunar atmosphere. The Afar people still harvest salt here as they have for centuries, loading the valuable commodity onto camel caravans.

      Swimming (floating, really) in the hypersaline water is a unique experience, though the harsh environment demands respect – bring plenty of water and protection from the sun.`,
      highlights: [
        'Float in hypersaline water',
        'Salt formations',
        'Africa\'s lowest point',
        'Afar salt caravans',
        'Volcanic landscapes'
      ],
      bestTime: 'November to April',
      duration: '1 day',
      difficulty: 'Easy',
      price: '$$',
      rating: 4.6,
      reviews: 321,
      images: [
        'https://images.unsplash.com/photo-1510155324852-d5d2dbe7a5e8?w=800',
        'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=800'
      ],
      coordinates: { lat: 11.6500, lng: 42.4167 }
    }
  ],
  somalia: [
    {
      id: 'laas-geel',
      countryId: 'somalia',
      name: 'Laas Geel',
      type: 'Archaeological',
      description: 'Stunning Neolithic rock art caves in the hills near Hargeisa.',
      fullDescription: `Laas Geel, located in Somaliland, contains some of the best-preserved Neolithic rock art in Africa. Discovered in 2002 by a French archaeological team, the cave paintings date back approximately 5,000-10,000 years and depict cattle, wild animals, and human figures in vibrant reds, whites, and oranges.

      The caves sit in a dramatic landscape of rocky outcrops and wadis (dry riverbeds) outside Hargeisa. The art's exceptional preservation results from the overhang of the rock shelters, which protected the paintings from the elements.

      The site offers a window into the region's pastoral past, when the area was greener and supported cattle-herding communities. Local guides from Hargeisa can arrange visits, typically combined with other sites in the area.`,
      highlights: [
        'Well-preserved cave paintings',
        'Ancient cattle depictions',
        'Dramatic rock formations',
        'Archaeological significance',
        'Off-the-beaten-path adventure'
      ],
      bestTime: 'December to February',
      duration: '1 day',
      difficulty: 'Easy',
      price: '$',
      rating: 4.7,
      reviews: 156,
      images: [
        'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?w=800',
        'https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=800'
      ],
      coordinates: { lat: 9.7833, lng: 44.4667 }
    }
  ]
};

export const getAllDestinations = () => {
  return Object.values(destinations).flat();
};

export const getDestinationsByCountry = (countryId) => {
  return destinations[countryId] || [];
};

export const getDestinationById = (destinationId) => {
  return getAllDestinations().find(d => d.id === destinationId);
};

export default destinations;