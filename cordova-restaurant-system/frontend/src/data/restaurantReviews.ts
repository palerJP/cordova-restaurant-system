import type { Review } from '@/lib/types';

export const ESTABLISHMENT_REVIEWS: Record<string, Review[]> = {
  "horizon-bean-cafe": [
    {
      "id": "hbc-rev-1",
      "restaurant_id": "horizon-bean-cafe",
      "user_id": "usr-cebu-101",
      "reviewer_name": "Maria Santos",
      "rating": 5,
      "comment": "The Spanish Latte and fresh croissants are amazing! The ambiance here in San Miguel is so chill, especially late at night when studying or catching up with friends.",
      "photos": [
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80"
      ],
      "reactions": {
        "❤️": 12,
        "☕": 18,
        "🔥": 5
      },
      "status": "visible",
      "created_at": "2026-03-10T14:30:00Z",
      "like_count": 8,
      "liked_by_me": false,
      "visit_type": "dine-in"
    },
    {
      "id": "hbc-rev-2",
      "restaurant_id": "horizon-bean-cafe",
      "user_id": "usr-cebu-102",
      "reviewer_name": "Joshua Tan",
      "rating": 5,
      "comment": "Hands down one of the best specialty cafes in Cordova! Staff is very attentive, and the matcha cold foam was velvety smooth.",
      "reactions": {
        "😋": 9,
        "👏": 6
      },
      "status": "visible",
      "created_at": "2026-03-02T19:15:00Z",
      "like_count": 5,
      "liked_by_me": false,
      "visit_type": "solo chill"
    },
    {
      "id": "hbc-rev-3",
      "restaurant_id": "horizon-bean-cafe",
      "user_id": "usr-cebu-103",
      "reviewer_name": "Leah Fernandez",
      "rating": 4,
      "comment": "Great coffee selection and very cozy seating. Parking can get a little tight on weekend evenings, but definitely worth dropping by.",
      "reactions": {
        "👍": 4
      },
      "status": "visible",
      "created_at": "2026-02-24T16:45:00Z",
      "like_count": 3,
      "liked_by_me": false,
      "visit_type": "friends"
    }
  ],
  "papsys-bbq": [
    {
      "id": "papsy-rev-1",
      "restaurant_id": "papsys-bbq",
      "user_id": "usr-cebu-201",
      "reviewer_name": "Chef Arnold D.",
      "rating": 5,
      "comment": "The pork barbecue skewers and chicken inasal are marinated to perfection. Juicy, tender, and the homemade vinegar dip is top tier!",
      "photos": [
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80"
      ],
      "reactions": {
        "🔥": 15,
        "😋": 14,
        "❤️": 8
      },
      "status": "visible",
      "created_at": "2026-03-08T18:20:00Z",
      "like_count": 11,
      "liked_by_me": false,
      "visit_type": "family dinner"
    },
    {
      "id": "papsy-rev-2",
      "restaurant_id": "papsys-bbq",
      "user_id": "usr-cebu-202",
      "reviewer_name": "Kenneth Lim",
      "rating": 5,
      "comment": "Unli-rice with sizzling sisig and grilled belly! Affordable prices right by Gaisano Grand Mall Cordova. Always our family go-to.",
      "reactions": {
        "👏": 7,
        "😋": 11
      },
      "status": "visible",
      "created_at": "2026-02-28T12:40:00Z",
      "like_count": 6,
      "liked_by_me": false,
      "visit_type": "dine-in"
    },
    {
      "id": "papsy-rev-3",
      "restaurant_id": "papsys-bbq",
      "user_id": "usr-cebu-203",
      "reviewer_name": "Bea Alcantara",
      "rating": 4,
      "comment": "Generous portions and fast service. The barbecue sauce has that classic Filipino sweet-savory glaze that hits the spot.",
      "reactions": {
        "👍": 5
      },
      "status": "visible",
      "created_at": "2026-02-18T19:00:00Z",
      "like_count": 2,
      "liked_by_me": false,
      "visit_type": "casual"
    }
  ],
  "street-food-park": [
    {
      "id": "sfp-rev-1",
      "restaurant_id": "street-food-park",
      "user_id": "usr-cebu-301",
      "reviewer_name": "Dave Villamor",
      "rating": 5,
      "comment": "Vibrant sea breeze and incredible street food choices! Fried seafood, tempura, kwek-kwek, and grilled scallops while watching the boats dock.",
      "reactions": {
        "🦞": 20,
        "🔥": 14,
        "❤️": 9
      },
      "status": "visible",
      "created_at": "2026-03-11T20:00:00Z",
      "like_count": 14,
      "liked_by_me": false,
      "visit_type": "night hangout"
    },
    {
      "id": "sfp-rev-2",
      "restaurant_id": "street-food-park",
      "user_id": "usr-cebu-302",
      "reviewer_name": "Rhea Mae Suico",
      "rating": 4,
      "comment": "Best place in Poblacion for casual barkada bonding. Very budget-friendly and lively atmosphere with local acoustic music.",
      "reactions": {
        "👏": 8,
        "😋": 10
      },
      "status": "visible",
      "created_at": "2026-03-01T21:30:00Z",
      "like_count": 7,
      "liked_by_me": false,
      "visit_type": "barkada"
    },
    {
      "id": "sfp-rev-3",
      "restaurant_id": "street-food-park",
      "user_id": "usr-cebu-303",
      "reviewer_name": "Jan Mark Veloso",
      "rating": 5,
      "comment": "Authentic Cordova portside street dining! Affordable prices, plenty of seating, and fresh cool sea air.",
      "reactions": {
        "👍": 6,
        "❤️": 5
      },
      "status": "visible",
      "created_at": "2026-02-20T19:00:00Z",
      "like_count": 4,
      "liked_by_me": false,
      "visit_type": "sunset snack"
    }
  ],
  "aby-road-resto-bar": [
    {
      "id": "aby-rev-1",
      "restaurant_id": "aby-road-resto-bar",
      "user_id": "usr-cebu-401",
      "reviewer_name": "Carlo Mendoza",
      "rating": 5,
      "comment": "Awesome Beatles theme and the live acoustic bands are fantastic! Crispy pata and cold beers made our weekend night unforgettable.",
      "reactions": {
        "🔥": 12,
        "❤️": 10
      },
      "status": "visible",
      "created_at": "2026-03-09T22:15:00Z",
      "like_count": 9,
      "liked_by_me": false,
      "visit_type": "nightlife"
    },
    {
      "id": "aby-rev-2",
      "restaurant_id": "aby-road-resto-bar",
      "user_id": "usr-cebu-402",
      "reviewer_name": "Joanna Yap",
      "rating": 4,
      "comment": "Fun karaoke vibe, welcoming staff, and delicious sizzling gambas. Great spot along Bangbang road.",
      "reactions": {
        "👏": 5
      },
      "status": "visible",
      "created_at": "2026-02-26T21:00:00Z",
      "like_count": 4,
      "liked_by_me": false,
      "visit_type": "celebration"
    },
    {
      "id": "aby-rev-3",
      "restaurant_id": "aby-road-resto-bar",
      "user_id": "usr-cebu-403",
      "reviewer_name": "Neil Brian",
      "rating": 5,
      "comment": "Great discounts, delicious sisig, and great live music performances. Perfect barkada hangout.",
      "reactions": {
        "🔥": 8,
        "🍺": 11
      },
      "status": "visible",
      "created_at": "2026-02-15T23:00:00Z",
      "like_count": 5,
      "liked_by_me": false,
      "visit_type": "barkada night"
    }
  ],
  "eat-n-repeat": [
    {
      "id": "enr-rev-1",
      "restaurant_id": "eat-n-repeat",
      "user_id": "usr-cebu-501",
      "reviewer_name": "Chloe Chen",
      "rating": 5,
      "comment": "Super cute Instagrammable interior! The Belgian waffles and iced caramel macchiato are top notch. Perfect for afternoon coffee.",
      "photos": [
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80"
      ],
      "reactions": {
        "❤️": 16,
        "😋": 12
      },
      "status": "visible",
      "created_at": "2026-03-07T15:30:00Z",
      "like_count": 8,
      "liked_by_me": false,
      "visit_type": "cafe date"
    },
    {
      "id": "enr-rev-2",
      "restaurant_id": "eat-n-repeat",
      "user_id": "usr-cebu-502",
      "reviewer_name": "Paolo Gomez",
      "rating": 4,
      "comment": "Great silog meals and milk tea selections. Fast wifi and friendly baristas!",
      "reactions": {
        "👍": 6
      },
      "status": "visible",
      "created_at": "2026-02-22T14:10:00Z",
      "like_count": 3,
      "liked_by_me": false,
      "visit_type": "remote work"
    },
    {
      "id": "enr-rev-3",
      "restaurant_id": "eat-n-repeat",
      "user_id": "usr-cebu-503",
      "reviewer_name": "Stephanie Lee",
      "rating": 5,
      "comment": "The pastries and frappes are always on point. Very cozy aesthetic corner in Bangbang.",
      "reactions": {
        "❤️": 10,
        "☕": 7
      },
      "status": "visible",
      "created_at": "2026-02-12T16:00:00Z",
      "like_count": 6,
      "liked_by_me": false,
      "visit_type": "study session"
    }
  ],
  "taytayan-pinoy-restaurant": [
    {
      "id": "taytayan-rev-1",
      "restaurant_id": "taytayan-pinoy-restaurant",
      "user_id": "usr-cebu-601",
      "reviewer_name": "Engr. Nelson Rivera",
      "rating": 5,
      "comment": "Scenic waterfront dining right near the CCLEX bridge! The sinugbang isda, kinilaw na tangigue, and fresh pochero were spectacular.",
      "photos": [
        "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80"
      ],
      "reactions": {
        "🦞": 18,
        "❤️": 14,
        "🔥": 8
      },
      "status": "visible",
      "created_at": "2026-03-12T13:00:00Z",
      "like_count": 12,
      "liked_by_me": false,
      "visit_type": "family lunch"
    },
    {
      "id": "taytayan-rev-2",
      "restaurant_id": "taytayan-pinoy-restaurant",
      "user_id": "usr-cebu-602",
      "reviewer_name": "Michelle C.",
      "rating": 4,
      "comment": "Refreshing mangrove and ocean views while eating authentic Cebuano lutong-bahay. Highly recommend bringing out-of-town guests here.",
      "reactions": {
        "👏": 9,
        "😋": 7
      },
      "status": "visible",
      "created_at": "2026-03-04T12:30:00Z",
      "like_count": 5,
      "liked_by_me": false,
      "visit_type": "tourist group"
    },
    {
      "id": "taytayan-rev-3",
      "restaurant_id": "taytayan-pinoy-restaurant",
      "user_id": "usr-cebu-603",
      "reviewer_name": "Garry P.",
      "rating": 5,
      "comment": "Best open-air native dining in Ibabao. Super fresh grilled squid and warm native chicken tinola.",
      "reactions": {
        "👍": 8,
        "❤️": 6
      },
      "status": "visible",
      "created_at": "2026-02-18T13:45:00Z",
      "like_count": 7,
      "liked_by_me": false,
      "visit_type": "native feast"
    }
  ],
  "stuffed-n-fried-cordova": [
    {
      "id": "snf-rev-1",
      "restaurant_id": "stuffed-n-fried-cordova",
      "user_id": "usr-cebu-701",
      "reviewer_name": "Dexter Ramos",
      "rating": 5,
      "comment": "The 15-spice whole stuffed fried chicken is phenomenal! Skin is glass-crisp and the herbs inside make every bite juicy.",
      "reactions": {
        "🔥": 22,
        "😋": 19,
        "❤️": 11
      },
      "status": "visible",
      "created_at": "2026-03-09T17:45:00Z",
      "like_count": 15,
      "liked_by_me": false,
      "visit_type": "takeout feast"
    },
    {
      "id": "snf-rev-2",
      "restaurant_id": "stuffed-n-fried-cordova",
      "user_id": "usr-cebu-702",
      "reviewer_name": "Katrina Sy",
      "rating": 5,
      "comment": "Their crispy lechon kawali and authentic Cebu ngohiong are unbeatable for the price. Always a must-order in Gabi.",
      "reactions": {
        "👏": 8,
        "😋": 12
      },
      "status": "visible",
      "created_at": "2026-02-27T19:20:00Z",
      "like_count": 7,
      "liked_by_me": false,
      "visit_type": "dine-in"
    },
    {
      "id": "snf-rev-3",
      "restaurant_id": "stuffed-n-fried-cordova",
      "user_id": "usr-cebu-703",
      "reviewer_name": "Aldren B.",
      "rating": 4,
      "comment": "Huge chicken portions with rich savory dipping gravy. Hot and crispy every time!",
      "reactions": {
        "👍": 5
      },
      "status": "visible",
      "created_at": "2026-02-14T18:10:00Z",
      "like_count": 4,
      "liked_by_me": false,
      "visit_type": "dinner"
    }
  ],
  "mcdonalds-cordova": [
    {
      "id": "mcdo-rev-1",
      "restaurant_id": "mcdonalds-cordova",
      "user_id": "usr-cebu-801",
      "reviewer_name": "Patricia O.",
      "rating": 5,
      "comment": "Clean, modern 2-floor store with Drive-Thru. Chicken McDo was freshly fried and hot, and the McCafe iced latte was great!",
      "reactions": {
        "❤️": 10,
        "👏": 6
      },
      "status": "visible",
      "created_at": "2026-03-11T09:30:00Z",
      "like_count": 6,
      "liked_by_me": false,
      "visit_type": "breakfast"
    },
    {
      "id": "mcdo-rev-2",
      "restaurant_id": "mcdonalds-cordova",
      "user_id": "usr-cebu-802",
      "reviewer_name": "Mark Lester",
      "rating": 4,
      "comment": "Super convenient 24/7 spot in San Miguel with ample parking. Fast Drive-Thru line even during busy peak hours.",
      "reactions": {
        "👍": 7
      },
      "status": "visible",
      "created_at": "2026-03-03T23:45:00Z",
      "like_count": 4,
      "liked_by_me": false,
      "visit_type": "drive-thru"
    },
    {
      "id": "mcdo-rev-3",
      "restaurant_id": "mcdonalds-cordova",
      "user_id": "usr-cebu-803",
      "reviewer_name": "Christine Joy",
      "rating": 5,
      "comment": "Spacious second floor dining area with good air conditioning and reliable fast WiFi.",
      "reactions": {
        "❤️": 5,
        "🍔": 8
      },
      "status": "visible",
      "created_at": "2026-02-21T11:15:00Z",
      "like_count": 3,
      "liked_by_me": false,
      "visit_type": "quick meal"
    }
  ],
  "barracks-grill-and-resto-bar": [
    {
      "id": "barracks-rev-1",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "user_id": "usr-cebu-901",
      "reviewer_name": "Vince Rosal",
      "rating": 5,
      "comment": "Hidden gem in Ajoya Gabi! Great sizzling squid, pork belly barbecue, and cold beers. Outdoor seating has a cool night breeze.",
      "reactions": {
        "🔥": 11,
        "🍺": 8
      },
      "status": "visible",
      "created_at": "2026-03-06T21:00:00Z",
      "like_count": 7,
      "liked_by_me": false,
      "visit_type": "nightout"
    },
    {
      "id": "barracks-rev-2",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "user_id": "usr-cebu-902",
      "reviewer_name": "Clarisse Diaz",
      "rating": 4,
      "comment": "Friendly staff, good music, and reasonable prices for barkada sharing.",
      "reactions": {
        "👏": 4
      },
      "status": "visible",
      "created_at": "2026-02-21T20:30:00Z",
      "like_count": 3,
      "liked_by_me": false,
      "visit_type": "barkada"
    },
    {
      "id": "barracks-rev-3",
      "restaurant_id": "barracks-grill-and-resto-bar",
      "user_id": "usr-cebu-903",
      "reviewer_name": "Rico Mendez",
      "rating": 5,
      "comment": "Love the outdoor chill vibe and sizzling pork sisig. Great neighborhood grill.",
      "reactions": {
        "👍": 5,
        "🔥": 6
      },
      "status": "visible",
      "created_at": "2026-02-10T22:00:00Z",
      "like_count": 4,
      "liked_by_me": false,
      "visit_type": "weekend drinks"
    }
  ],
  "bric-food-park": [
    {
      "id": "bric-rev-1",
      "restaurant_id": "bric-food-park",
      "user_id": "usr-cebu-1001",
      "reviewer_name": "Elaine Torres",
      "rating": 5,
      "comment": "So many delicious food stalls to choose from! The Pau's Grill pork barbecue and fresh milk tea make it our weekend family spot.",
      "reactions": {
        "😋": 15,
        "❤️": 8
      },
      "status": "visible",
      "created_at": "2026-03-08T19:30:00Z",
      "like_count": 9,
      "liked_by_me": false,
      "visit_type": "family"
    },
    {
      "id": "bric-rev-2",
      "restaurant_id": "bric-food-park",
      "user_id": "usr-cebu-1002",
      "reviewer_name": "Jerome Yu",
      "rating": 4,
      "comment": "Spacious open-air seating in San Miguel. Great community vibe and plenty of food choices.",
      "reactions": {
        "👍": 6
      },
      "status": "visible",
      "created_at": "2026-02-25T18:45:00Z",
      "like_count": 4,
      "liked_by_me": false,
      "visit_type": "dinner"
    },
    {
      "id": "bric-rev-3",
      "restaurant_id": "bric-food-park",
      "user_id": "usr-cebu-1003",
      "reviewer_name": "Janine Claire",
      "rating": 5,
      "comment": "Lively food park with generous parking and delicious local food vendors.",
      "reactions": {
        "👏": 5,
        "❤️": 4
      },
      "status": "visible",
      "created_at": "2026-02-14T20:00:00Z",
      "like_count": 5,
      "liked_by_me": false,
      "visit_type": "barkada hangout"
    }
  ],
  "rca-bilao-food-station": [
    {
      "id": "rca-rev-1",
      "restaurant_id": "rca-bilao-food-station",
      "user_id": "usr-cebu-1101",
      "reviewer_name": "Althea Grace",
      "rating": 5,
      "comment": "Their pancit bam-i and boneless lechon belly bilao are the stars of every family birthday party! Generous toppings and authentic flavor.",
      "reactions": {
        "🔥": 14,
        "😋": 16
      },
      "status": "visible",
      "created_at": "2026-03-10T11:00:00Z",
      "like_count": 10,
      "liked_by_me": false,
      "visit_type": "catering/party"
    },
    {
      "id": "rca-rev-2",
      "restaurant_id": "rca-bilao-food-station",
      "user_id": "usr-cebu-1102",
      "reviewer_name": "Glenn Pacaldo",
      "rating": 4,
      "comment": "Super sulit bilao bundles in Gabi. The kakanin treats and street food skewers in the evening are delicious.",
      "reactions": {
        "👏": 5
      },
      "status": "visible",
      "created_at": "2026-03-02T17:15:00Z",
      "like_count": 5,
      "liked_by_me": false,
      "visit_type": "takeout"
    },
    {
      "id": "rca-rev-3",
      "restaurant_id": "rca-bilao-food-station",
      "user_id": "usr-cebu-1103",
      "reviewer_name": "Maricel S.",
      "rating": 5,
      "comment": "Always reliable for celebrations in Cordova. Freshly cooked, hot, and packed neatly in traditional bilaos.",
      "reactions": {
        "❤️": 8,
        "😋": 7
      },
      "status": "visible",
      "created_at": "2026-02-19T10:30:00Z",
      "like_count": 6,
      "liked_by_me": false,
      "visit_type": "family gathering"
    }
  ],
  "mavericks-by-the-baker-street": [
    {
      "id": "mav-rev-1",
      "restaurant_id": "mavericks-by-the-baker-street",
      "user_id": "usr-cebu-1201",
      "reviewer_name": "Samantha Yu",
      "rating": 5,
      "comment": "The artisan pastries and freshly brewed pour-over coffee are top tier. Peaceful atmosphere right beside Benthel school.",
      "reactions": {
        "❤️": 14,
        "☕": 12
      },
      "status": "visible",
      "created_at": "2026-03-07T16:00:00Z",
      "like_count": 7,
      "liked_by_me": false,
      "visit_type": "study session"
    },
    {
      "id": "mav-rev-2",
      "restaurant_id": "mavericks-by-the-baker-street",
      "user_id": "usr-cebu-1202",
      "reviewer_name": "Francis T.",
      "rating": 4,
      "comment": "Aesthetic bakehouse with rich cheesecake and smooth iced Americano. Great neighborhood cafe in Cordova.",
      "reactions": {
        "👍": 4
      },
      "status": "visible",
      "created_at": "2026-02-23T15:20:00Z",
      "like_count": 3,
      "liked_by_me": false,
      "visit_type": "cafe chill"
    },
    {
      "id": "mav-rev-3",
      "restaurant_id": "mavericks-by-the-baker-street",
      "user_id": "usr-cebu-1203",
      "reviewer_name": "Danielle Cruz",
      "rating": 5,
      "comment": "Creative space with awesome pastries, artisanal coffees, and relaxing ambiance in Gabi.",
      "reactions": {
        "✨": 8,
        "❤️": 6
      },
      "status": "visible",
      "created_at": "2026-02-11T14:30:00Z",
      "like_count": 5,
      "liked_by_me": false,
      "visit_type": "afternoon coffee"
    }
  ],
  "entoys-bakasihan": [
    {
      "id": "entoy-rev-1",
      "restaurant_id": "entoys-bakasihan",
      "user_id": "usr-cebu-1301",
      "reviewer_name": "Doc Manny Castro",
      "rating": 5,
      "comment": "The legendary Netflix nilarang na bakasi lives up to all the hype! The reef eel is tender, sour-spicy soup is restorative, and the coastal wharf view is authentic Cordova.",
      "photos": [
        "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80"
      ],
      "reactions": {
        "🦞": 30,
        "🔥": 25,
        "❤️": 18
      },
      "status": "visible",
      "created_at": "2026-03-12T11:30:00Z",
      "like_count": 22,
      "liked_by_me": false,
      "visit_type": "food pilgrimage"
    },
    {
      "id": "entoy-rev-2",
      "restaurant_id": "entoys-bakasihan",
      "user_id": "usr-cebu-1302",
      "reviewer_name": "Trisha Mae Tan",
      "rating": 5,
      "comment": "Nothing beats fresh bakasi eel soup with hot puso rice right by the sea in Buagsong. An absolute culinary landmark in Cebu.",
      "reactions": {
        "👏": 14,
        "😋": 18
      },
      "status": "visible",
      "created_at": "2026-03-05T12:00:00Z",
      "like_count": 11,
      "liked_by_me": false,
      "visit_type": "lunch"
    },
    {
      "id": "entoy-rev-3",
      "restaurant_id": "entoys-bakasihan",
      "user_id": "usr-cebu-1303",
      "reviewer_name": "Raymund Ortiz",
      "rating": 4,
      "comment": "Authentic carinderia-style experience. Come early morning for the freshest batch of bakasi eel soup!",
      "reactions": {
        "👍": 8
      },
      "status": "visible",
      "created_at": "2026-02-26T08:30:00Z",
      "like_count": 6,
      "liked_by_me": false,
      "visit_type": "breakfast"
    }
  ],
  "tita-kims": [
    {
      "id": "tk-rev-1",
      "restaurant_id": "tita-kims",
      "user_id": "usr-cebu-1401",
      "reviewer_name": "Rowena Bautista",
      "rating": 5,
      "comment": "Incredible value all-you-can-eat buffet! Over 15 homestyle Cebuano dishes including buttered garlic shrimp, crispy pork, and native chicken.",
      "reactions": {
        "😋": 19,
        "❤️": 12,
        "🔥": 9
      },
      "status": "visible",
      "created_at": "2026-03-10T18:30:00Z",
      "like_count": 12,
      "liked_by_me": false,
      "visit_type": "buffet feast"
    },
    {
      "id": "tk-rev-2",
      "restaurant_id": "tita-kims",
      "user_id": "usr-cebu-1402",
      "reviewer_name": "Daryl P.",
      "rating": 4,
      "comment": "Super sulit dinner buffet along National Highway. Dishes are continuously refilled hot from the kitchen.",
      "reactions": {
        "👏": 7
      },
      "status": "visible",
      "created_at": "2026-03-01T19:00:00Z",
      "like_count": 5,
      "liked_by_me": false,
      "visit_type": "family buffet"
    },
    {
      "id": "tk-rev-3",
      "restaurant_id": "tita-kims",
      "user_id": "usr-cebu-1403",
      "reviewer_name": "Janice Yap",
      "rating": 5,
      "comment": "Unbelievable ₱299 buffet value in Gabi! The buttered garlic shrimp and crispy belly are endless.",
      "reactions": {
        "👍": 8,
        "❤️": 7
      },
      "status": "visible",
      "created_at": "2026-02-16T18:00:00Z",
      "like_count": 6,
      "liked_by_me": false,
      "visit_type": "group feast"
    }
  ],
  "burandat-seafood-bucket": [
    {
      "id": "bsb-rev-1",
      "restaurant_id": "burandat-seafood-bucket",
      "user_id": "usr-cebu-1501",
      "reviewer_name": "Hannah Victoria",
      "rating": 5,
      "comment": "Hands down the best cajun seafood bucket in Cordova! Piles of fresh crabs, plump prawns, mussels, and sweet corn tossed in savory butter cajun sauce.",
      "photos": [
        "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80"
      ],
      "reactions": {
        "🦞": 25,
        "🔥": 18,
        "😋": 20
      },
      "status": "visible",
      "created_at": "2026-03-11T18:00:00Z",
      "like_count": 17,
      "liked_by_me": false,
      "visit_type": "seafood feast"
    },
    {
      "id": "bsb-rev-2",
      "restaurant_id": "burandat-seafood-bucket",
      "user_id": "usr-cebu-1502",
      "reviewer_name": "Archie Navarro",
      "rating": 5,
      "comment": "The unlimited seafood weekends are a must-try! Fresh catch directly from local fishermen cooked with explosive flavors.",
      "reactions": {
        "👏": 11,
        "❤️": 8
      },
      "status": "visible",
      "created_at": "2026-03-03T19:30:00Z",
      "like_count": 9,
      "liked_by_me": false,
      "visit_type": "barkada dinner"
    },
    {
      "id": "bsb-rev-3",
      "restaurant_id": "burandat-seafood-bucket",
      "user_id": "usr-cebu-1503",
      "reviewer_name": "Eileen Joy",
      "rating": 5,
      "comment": "Fresh coastal seafood tossed in rich garlic butter cajun sauce. So good and messy!",
      "reactions": {
        "🔥": 12,
        "🦞": 14
      },
      "status": "visible",
      "created_at": "2026-02-18T19:15:00Z",
      "like_count": 8,
      "liked_by_me": false,
      "visit_type": "dinner date"
    }
  ],
  "csalt-cafe-cordova": [
    {
      "id": "csalt-rev-1",
      "restaurant_id": "csalt-cafe-cordova",
      "user_id": "usr-cebu-1601",
      "reviewer_name": "Janice Morales",
      "rating": 5,
      "comment": "The rooftop ocean view at Quinn Haven building is breathtaking! Try their signature Sea Salt Caramel Latte and burnt cheesecake.",
      "photos": [
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80"
      ],
      "reactions": {
        "❤️": 21,
        "☕": 15,
        "👏": 8
      },
      "status": "visible",
      "created_at": "2026-03-09T17:00:00Z",
      "like_count": 13,
      "liked_by_me": false,
      "visit_type": "sunset coffee"
    },
    {
      "id": "csalt-rev-2",
      "restaurant_id": "csalt-cafe-cordova",
      "user_id": "usr-cebu-1602",
      "reviewer_name": "Timothy Lee",
      "rating": 4,
      "comment": "Sunset spot in Poblacion with great ocean breeze and quality coffee beans.",
      "reactions": {
        "👍": 6
      },
      "status": "visible",
      "created_at": "2026-02-28T18:15:00Z",
      "like_count": 4,
      "liked_by_me": false,
      "visit_type": "date"
    },
    {
      "id": "csalt-rev-3",
      "restaurant_id": "csalt-cafe-cordova",
      "user_id": "usr-cebu-1603",
      "reviewer_name": "Camille Tan",
      "rating": 5,
      "comment": "Sea Salt Latte by the coast during golden hour is perfection. Very relaxing vibe.",
      "reactions": {
        "☕": 9,
        "❤️": 7
      },
      "status": "visible",
      "created_at": "2026-02-14T17:30:00Z",
      "like_count": 5,
      "liked_by_me": false,
      "visit_type": "sunset viewing"
    }
  ],
  "cafe-mafia": [
    {
      "id": "cm-rev-1",
      "restaurant_id": "cafe-mafia",
      "user_id": "usr-cebu-1701",
      "reviewer_name": "Gavin Cruz",
      "rating": 5,
      "comment": "Sleek, atmospheric dark aesthetic cafe. The dark mocha latte and truffle pasta are outstanding. Great late-night hangout spot!",
      "reactions": {
        "🔥": 15,
        "❤️": 12
      },
      "status": "visible",
      "created_at": "2026-03-08T21:40:00Z",
      "like_count": 8,
      "liked_by_me": false,
      "visit_type": "night hangout"
    },
    {
      "id": "cm-rev-2",
      "restaurant_id": "cafe-mafia",
      "user_id": "usr-cebu-1702",
      "reviewer_name": "Ella Marie",
      "rating": 4,
      "comment": "Very cool vibe and chill music. Good coffee roast and attentive staff in Dapitan.",
      "reactions": {
        "☕": 7,
        "👏": 5
      },
      "status": "visible",
      "created_at": "2026-02-26T20:00:00Z",
      "like_count": 4,
      "liked_by_me": false,
      "visit_type": "coffee run"
    },
    {
      "id": "cm-rev-3",
      "restaurant_id": "cafe-mafia",
      "user_id": "usr-cebu-1703",
      "reviewer_name": "Jared Lim",
      "rating": 5,
      "comment": "Signature handcrafted Mafia Premium Burgers and artisan iced espresso. Top spot in Cordova!",
      "reactions": {
        "🍔": 10,
        "❤️": 8
      },
      "status": "visible",
      "created_at": "2026-02-15T19:20:00Z",
      "like_count": 6,
      "liked_by_me": false,
      "visit_type": "burger & brew"
    }
  ],
  "solea-mactan-resort": [
    {
      "id": "solea-rev-1",
      "restaurant_id": "solea-mactan-resort",
      "user_id": "usr-cebu-1801",
      "reviewer_name": "Kristoff Vance",
      "rating": 5,
      "comment": "World-class resort dining! The seafood buffet spread and poolside cocktails with beachfront sunset views are truly five-star.",
      "photos": [
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80"
      ],
      "reactions": {
        "❤️": 26,
        "🦞": 19,
        "✨": 15
      },
      "status": "visible",
      "created_at": "2026-03-12T19:00:00Z",
      "like_count": 18,
      "liked_by_me": false,
      "visit_type": "luxury dining"
    },
    {
      "id": "solea-rev-2",
      "restaurant_id": "solea-mactan-resort",
      "user_id": "usr-cebu-1802",
      "reviewer_name": "Dra. Isabel Ong",
      "rating": 5,
      "comment": "Exceptional hospitality and delicious international and Filipino fusion menu. Perfect for anniversary dinners and celebrations.",
      "reactions": {
        "👏": 12,
        "❤️": 10
      },
      "status": "visible",
      "created_at": "2026-03-05T20:30:00Z",
      "like_count": 10,
      "liked_by_me": false,
      "visit_type": "anniversary"
    },
    {
      "id": "solea-rev-3",
      "restaurant_id": "solea-mactan-resort",
      "user_id": "usr-cebu-1803",
      "reviewer_name": "Marcus Brody",
      "rating": 5,
      "comment": "Breathtaking resort views in Alegria, exquisite wood-fired pizza and grilled seafood platters.",
      "reactions": {
        "✨": 14,
        "❤️": 9
      },
      "status": "visible",
      "created_at": "2026-02-18T20:00:00Z",
      "like_count": 8,
      "liked_by_me": false,
      "visit_type": "resort vacation"
    }
  ],
  "husbys-grill": [
    {
      "id": "husby-rev-1",
      "restaurant_id": "husbys-grill",
      "user_id": "usr-cebu-1901",
      "reviewer_name": "Ramon Garcia",
      "rating": 5,
      "comment": "Authentic charcoal barbecue grill with perfectly charred liempo and flavorful chicken skewers. Very affordable and friendly local service.",
      "reactions": {
        "🔥": 14,
        "😋": 12
      },
      "status": "visible",
      "created_at": "2026-03-09T18:45:00Z",
      "like_count": 8,
      "liked_by_me": false,
      "visit_type": "dinner"
    },
    {
      "id": "husby-rev-2",
      "restaurant_id": "husbys-grill",
      "user_id": "usr-cebu-1902",
      "reviewer_name": "Aileen Perez",
      "rating": 4,
      "comment": "Great dinner stop along Gabi. Fast serving time and tasty barbecue marinades.",
      "reactions": {
        "👍": 5
      },
      "status": "visible",
      "created_at": "2026-02-27T19:15:00Z",
      "like_count": 3,
      "liked_by_me": false,
      "visit_type": "takeout"
    },
    {
      "id": "husby-rev-3",
      "restaurant_id": "husbys-grill",
      "user_id": "usr-cebu-1903",
      "reviewer_name": "Carlo Sison",
      "rating": 5,
      "comment": "Juicy inasal and grilled tuna panga at super affordable prices.",
      "reactions": {
        "🔥": 7,
        "😋": 6
      },
      "status": "visible",
      "created_at": "2026-02-12T19:00:00Z",
      "like_count": 4,
      "liked_by_me": false,
      "visit_type": "casual dinner"
    }
  ],
  "sungka-native-restaurant": [
    {
      "id": "sungka-rev-1",
      "restaurant_id": "sungka-native-restaurant",
      "user_id": "usr-cebu-2001",
      "reviewer_name": "Atty. Victoriano Cruz",
      "rating": 5,
      "comment": "Traditional native Cebuano dining at its finest. The clam soup (tinolang hala-an), grilled squid, and sinigang na lapu-lapu are authentic and fresh.",
      "photos": [
        "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80"
      ],
      "reactions": {
        "🦞": 20,
        "❤️": 14,
        "😋": 16
      },
      "status": "visible",
      "created_at": "2026-03-11T12:45:00Z",
      "like_count": 14,
      "liked_by_me": false,
      "visit_type": "native feast"
    },
    {
      "id": "sungka-rev-2",
      "restaurant_id": "sungka-native-restaurant",
      "user_id": "usr-cebu-2002",
      "reviewer_name": "Lorna Del Rosario",
      "rating": 4,
      "comment": "Relaxing traditional cottage dining. Great selection of native Filipino dishes made with fresh local ingredients in Day-as.",
      "reactions": {
        "👏": 7
      },
      "status": "visible",
      "created_at": "2026-03-03T13:15:00Z",
      "like_count": 5,
      "liked_by_me": false,
      "visit_type": "family lunch"
    },
    {
      "id": "sungka-rev-3",
      "restaurant_id": "sungka-native-restaurant",
      "user_id": "usr-cebu-2003",
      "reviewer_name": "Felipe Santos",
      "rating": 5,
      "comment": "Fresh seafood sutukil by the port. The tinola broth warms the soul.",
      "reactions": {
        "🦞": 11,
        "👍": 7
      },
      "status": "visible",
      "created_at": "2026-02-15T12:30:00Z",
      "like_count": 6,
      "liked_by_me": false,
      "visit_type": "lunch"
    }
  ],
  "lantaw-floating-native-restaurant": [
    {
      "id": "lantaw-rev-1",
      "restaurant_id": "lantaw-floating-native-restaurant",
      "user_id": "usr-cebu-2101",
      "reviewer_name": "Beatrice Delgado",
      "rating": 5,
      "comment": "Iconic seaside floating restaurant with panoramic sunset views over the Cebu skyline. The baked scallops, crispy pata, and garlic butter crab are unforgettable!",
      "photos": [
        "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80"
      ],
      "reactions": {
        "🦞": 35,
        "❤️": 28,
        "🔥": 20,
        "👏": 15
      },
      "status": "visible",
      "created_at": "2026-03-13T18:30:00Z",
      "like_count": 26,
      "liked_by_me": false,
      "visit_type": "sunset dinner"
    },
    {
      "id": "lantaw-rev-2",
      "restaurant_id": "lantaw-floating-native-restaurant",
      "user_id": "usr-cebu-2102",
      "reviewer_name": "Gilbert Yu",
      "rating": 5,
      "comment": "A true Cebu institution. Fresh ocean breeze, romantic lighting at dusk, and top-tier seafood platters. Must-visit when in Cordova!",
      "reactions": {
        "😋": 18,
        "❤️": 14
      },
      "status": "visible",
      "created_at": "2026-03-06T19:45:00Z",
      "like_count": 15,
      "liked_by_me": false,
      "visit_type": "dinner date"
    },
    {
      "id": "lantaw-rev-3",
      "restaurant_id": "lantaw-floating-native-restaurant",
      "user_id": "usr-cebu-2103",
      "reviewer_name": "Karen Joy Solon",
      "rating": 4,
      "comment": "Spectacular sunset views over the water. Be sure to arrive before 5:30 PM to catch golden hour and get a seaside stilt table.",
      "reactions": {
        "👍": 10
      },
      "status": "visible",
      "created_at": "2026-02-28T17:30:00Z",
      "like_count": 8,
      "liked_by_me": false,
      "visit_type": "sunset viewing"
    }
  ],
  "albertos-pizza-cordova": [
    {
      "id": "alb-rev-1",
      "restaurant_id": "albertos-pizza-cordova",
      "user_id": "usr-cebu-2201",
      "reviewer_name": "Jomari S.",
      "rating": 5,
      "comment": "Cebu's favorite local pizza! The Beef & Mushroom, Quickmelt special, and Hawaiian pizza are freshly baked with a thin, crispy crust.",
      "reactions": {
        "🍕": 22,
        "🔥": 12,
        "❤️": 10
      },
      "status": "visible",
      "created_at": "2026-03-10T19:15:00Z",
      "like_count": 9,
      "liked_by_me": false,
      "visit_type": "takeout feast"
    },
    {
      "id": "alb-rev-2",
      "restaurant_id": "albertos-pizza-cordova",
      "user_id": "usr-cebu-2202",
      "reviewer_name": "Jennylyn Flores",
      "rating": 4,
      "comment": "Best budget-friendly pizza in town. Great for movie nights and barkada midnight snacks.",
      "reactions": {
        "😋": 8,
        "👏": 5
      },
      "status": "visible",
      "created_at": "2026-03-01T20:30:00Z",
      "like_count": 4,
      "liked_by_me": false,
      "visit_type": "barkada"
    },
    {
      "id": "alb-rev-3",
      "restaurant_id": "albertos-pizza-cordova",
      "user_id": "usr-cebu-2203",
      "reviewer_name": "Marco Reyes",
      "rating": 5,
      "comment": "Fast delivery and consistently hot, cheesy thin crust pizzas in Gabi.",
      "reactions": {
        "🍕": 12,
        "👍": 6
      },
      "status": "visible",
      "created_at": "2026-02-17T21:00:00Z",
      "like_count": 5,
      "liked_by_me": false,
      "visit_type": "midnight snack"
    }
  ],
  "cascaja-cafe": [
    {
      "id": "cascaja-rev-1",
      "restaurant_id": "cascaja-cafe",
      "user_id": "usr-cebu-2301",
      "reviewer_name": "Nathalie Tan",
      "rating": 5,
      "comment": "Charming coastal cafe serving fresh coffee brews and sweet baked treats. Peaceful spot in Calan to unwind and enjoy the sea breeze.",
      "reactions": {
        "❤️": 14,
        "☕": 11
      },
      "status": "visible",
      "created_at": "2026-03-08T15:00:00Z",
      "like_count": 7,
      "liked_by_me": false,
      "visit_type": "afternoon tea"
    },
    {
      "id": "cascaja-rev-2",
      "restaurant_id": "cascaja-cafe",
      "user_id": "usr-cebu-2302",
      "reviewer_name": "Rico M.",
      "rating": 4,
      "comment": "Very relaxing coastal hideaway with good espresso, rice meals, and warm hospitality.",
      "reactions": {
        "👍": 5
      },
      "status": "visible",
      "created_at": "2026-02-24T16:20:00Z",
      "like_count": 3,
      "liked_by_me": false,
      "visit_type": "chill"
    },
    {
      "id": "cascaja-rev-3",
      "restaurant_id": "cascaja-cafe",
      "user_id": "usr-cebu-2303",
      "reviewer_name": "Elena D.",
      "rating": 5,
      "comment": "Budget-friendly coffee and pasta in Calan. Very cozy atmosphere.",
      "reactions": {
        "❤️": 6,
        "☕": 8
      },
      "status": "visible",
      "created_at": "2026-02-11T16:45:00Z",
      "like_count": 4,
      "liked_by_me": false,
      "visit_type": "quiet afternoon"
    }
  ],
  "don-macchiatos-cordova": [
    {
      "id": "donmac-rev-1",
      "restaurant_id": "don-macchiatos-cordova",
      "user_id": "usr-cebu-2401",
      "reviewer_name": "Kobe Bryan C.",
      "rating": 5,
      "comment": "The famous ₱39 iced coffee that conquered Cebu! Their Caramel Macchiato and Iced Matcha are consistently refreshing and super sulit.",
      "reactions": {
        "☕": 25,
        "🔥": 16,
        "❤️": 14
      },
      "status": "visible",
      "created_at": "2026-03-11T14:15:00Z",
      "like_count": 14,
      "liked_by_me": false,
      "visit_type": "daily coffee"
    },
    {
      "id": "donmac-rev-2",
      "restaurant_id": "don-macchiatos-cordova",
      "user_id": "usr-cebu-2402",
      "reviewer_name": "Maricar Santos",
      "rating": 4,
      "comment": "Quick grab-and-go coffee along San Miguel. Great sweetness balance and friendly staff.",
      "reactions": {
        "👏": 6
      },
      "status": "visible",
      "created_at": "2026-03-04T10:30:00Z",
      "like_count": 5,
      "liked_by_me": false,
      "visit_type": "takeout"
    },
    {
      "id": "donmac-rev-3",
      "restaurant_id": "don-macchiatos-cordova",
      "user_id": "usr-cebu-2403",
      "reviewer_name": "Angelo Gomez",
      "rating": 5,
      "comment": "Unbeatable value iced coffee! Perfect fuel for workdays in Cordova.",
      "reactions": {
        "☕": 12,
        "👍": 8
      },
      "status": "visible",
      "created_at": "2026-02-19T11:00:00Z",
      "like_count": 6,
      "liked_by_me": false,
      "visit_type": "morning coffee"
    }
  ],
  "parola-seaview-restaurant": [
    {
      "id": "parola-rev-1",
      "restaurant_id": "parola-seaview-restaurant",
      "user_id": "usr-cebu-2501",
      "reviewer_name": "Captain Richard Gomez",
      "rating": 5,
      "comment": "Unrivaled 360-degree ocean view beside the historic Cordova Lighthouse! The steamed pompano, crispy calamares, and grilled tuna belly were fresh from the morning catch.",
      "photos": [
        "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80"
      ],
      "reactions": {
        "🦞": 32,
        "❤️": 24,
        "🔥": 18
      },
      "status": "visible",
      "created_at": "2026-03-12T17:45:00Z",
      "like_count": 21,
      "liked_by_me": false,
      "visit_type": "seafood sunset"
    },
    {
      "id": "parola-rev-2",
      "restaurant_id": "parola-seaview-restaurant",
      "user_id": "usr-cebu-2502",
      "reviewer_name": "Elena Rosewood",
      "rating": 5,
      "comment": "The sound of the ocean waves crashing gently below while having dinner under the starlit sky is pure magic. Highly recommend their butter garlic shrimp!",
      "reactions": {
        "😋": 16,
        "❤️": 15
      },
      "status": "visible",
      "created_at": "2026-03-07T19:00:00Z",
      "like_count": 12,
      "liked_by_me": false,
      "visit_type": "romantic dinner"
    },
    {
      "id": "parola-rev-3",
      "restaurant_id": "parola-seaview-restaurant",
      "user_id": "usr-cebu-2503",
      "reviewer_name": "Jayson Barte",
      "rating": 4,
      "comment": "Top landmark destination in Poblacion. Outstanding sea views and very generous seafood platter portions.",
      "reactions": {
        "👍": 9
      },
      "status": "visible",
      "created_at": "2026-02-25T18:15:00Z",
      "like_count": 7,
      "liked_by_me": false,
      "visit_type": "family gathering"
    }
  ],
  "10000-roses-cafe-and-more": [
    {
      "id": "roses-rev-1",
      "restaurant_id": "10000-roses-cafe-and-more",
      "user_id": "usr-cebu-2601",
      "reviewer_name": "Yuki Takahashi",
      "rating": 5,
      "comment": "The sea of illuminated white LED roses against the night sea backdrop is enchanting! Korean snacks, strawberry latte, and pasta while watching the city lights.",
      "photos": [
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80"
      ],
      "reactions": {
        "❤️": 38,
        "✨": 28,
        "🔥": 14
      },
      "status": "visible",
      "created_at": "2026-03-13T20:15:00Z",
      "like_count": 24,
      "liked_by_me": false,
      "visit_type": "sightseeing & cafe"
    },
    {
      "id": "roses-rev-2",
      "restaurant_id": "10000-roses-cafe-and-more",
      "user_id": "usr-cebu-2602",
      "reviewer_name": "Danica Belle",
      "rating": 5,
      "comment": "Must-visit tourist destination in Cordova! Beautiful photography spot and refreshing beverages.",
      "reactions": {
        "👏": 14,
        "❤️": 12
      },
      "status": "visible",
      "created_at": "2026-03-08T18:00:00Z",
      "like_count": 11,
      "liked_by_me": false,
      "visit_type": "photoshoot & coffee"
    },
    {
      "id": "roses-rev-3",
      "restaurant_id": "10000-roses-cafe-and-more",
      "user_id": "usr-cebu-2603",
      "reviewer_name": "Oliver Queen",
      "rating": 4,
      "comment": "Unique atmosphere and lovely night sea breeze. Come right around twilight when the roses light up!",
      "reactions": {
        "👍": 8
      },
      "status": "visible",
      "created_at": "2026-03-01T19:30:00Z",
      "like_count": 6,
      "liked_by_me": false,
      "visit_type": "tourism"
    }
  ],
  "the-latte-cafe-mtvn5h2j": [
    {
      "id": "tlc-rev-1",
      "restaurant_id": "the-latte-cafe-mtvn5h2j",
      "user_id": "usr-cebu-2701",
      "reviewer_name": "Monique Laurel",
      "rating": 5,
      "comment": "Quiet, premium neighborhood cafe with silky flat whites, artisanal pour-overs, and delicious freshly baked pastries.",
      "reactions": {
        "❤️": 14,
        "☕": 12
      },
      "status": "visible",
      "created_at": "2026-03-09T14:30:00Z",
      "like_count": 8,
      "liked_by_me": false,
      "visit_type": "coffee tasting"
    },
    {
      "id": "tlc-rev-2",
      "restaurant_id": "the-latte-cafe-mtvn5h2j",
      "user_id": "usr-cebu-2702",
      "reviewer_name": "Brian K.",
      "rating": 4,
      "comment": "Great cozy atmosphere, comfortable seating, and fast friendly service in Gabi, Cordova.",
      "reactions": {
        "👍": 4
      },
      "status": "visible",
      "created_at": "2026-02-26T16:00:00Z",
      "like_count": 3,
      "liked_by_me": false,
      "visit_type": "relaxing"
    },
    {
      "id": "tlc-rev-3",
      "restaurant_id": "the-latte-cafe-mtvn5h2j",
      "user_id": "usr-cebu-2703",
      "reviewer_name": "Carla Mendez",
      "rating": 5,
      "comment": "Aesthetic pet-friendly cafe with excellent espresso and warm croissants.",
      "reactions": {
        "☕": 9,
        "❤️": 7
      },
      "status": "visible",
      "created_at": "2026-02-15T15:30:00Z",
      "like_count": 5,
      "liked_by_me": false,
      "visit_type": "coffee date"
    }
  ]
};

// Aliases lookup map for robust matching
const SLUG_ALIASES: Record<string, string> = {
  papsysbbq: 'papsys-bbq',
  grillhousecordovabbq: 'papsys-bbq',
  thelattecafe: 'the-latte-cafe-mtvn5h2j',
  thelattecafemtvn5h2j: 'the-latte-cafe-mtvn5h2j',
  tenthousandroses: '10000-roses-cafe-and-more',
  '10000roses': '10000-roses-cafe-and-more',
  '10000rosescafe': '10000-roses-cafe-and-more',
  '10000rosescafeandmore': '10000-roses-cafe-and-more',
  albertospizza: 'albertos-pizza-cordova',
  albertospizzacordova: 'albertos-pizza-cordova',
  donmacchiatos: 'don-macchiatos-cordova',
  donmacchiatoscordova: 'don-macchiatos-cordova',
  parolaseaview: 'parola-seaview-restaurant',
  parolaseaviewrestaurant: 'parola-seaview-restaurant',
  parolarestaurant: 'parola-seaview-restaurant',
  lantawfloating: 'lantaw-floating-native-restaurant',
  lantawfloatingnativerestaurant: 'lantaw-floating-native-restaurant',
  mcdonalds: 'mcdonalds-cordova',
  mcdonaldscordova: 'mcdonalds-cordova',
  stuffednfried: 'stuffed-n-fried-cordova',
  stuffednfriedcordova: 'stuffed-n-fried-cordova',
  taytayanpinoy: 'taytayan-pinoy-restaurant',
  taytayanpinoyrestaurant: 'taytayan-pinoy-restaurant',
  entoysbakasihan: 'entoys-bakasihan',
  entoysbakasi: 'entoys-bakasihan',
  titakims: 'tita-kims',
  burandatseafood: 'burandat-seafood-bucket',
  burandatseafoodbucket: 'burandat-seafood-bucket',
  csaltcafe: 'csalt-cafe-cordova',
  csaltcafecordova: 'csalt-cafe-cordova',
  cafemafia: 'cafe-mafia',
  soleamactan: 'solea-mactan-resort',
  soleamactanresort: 'solea-mactan-resort',
  sungkanative: 'sungka-native-restaurant',
  sungkanativerestaurant: 'sungka-native-restaurant',
  cascajacafe: 'cascaja-cafe',
  barracksgrill: 'barracks-grill-and-resto-bar',
  barracksgrillandresto: 'barracks-grill-and-resto-bar',
  barracksgrillandrestobar: 'barracks-grill-and-resto-bar',
  bricfoodpark: 'bric-food-park',
  rcabilao: 'rca-bilao-food-station',
  rcabilaofoodstation: 'rca-bilao-food-station',
  mavericks: 'mavericks-by-the-baker-street',
  mavericksbythebakerstreet: 'mavericks-by-the-baker-street',
  abyroad: 'aby-road-resto-bar',
  abyroadrestobar: 'aby-road-resto-bar',
  streetfoodpark: 'street-food-park',
  horizonbeancafe: 'horizon-bean-cafe',
  eatnrepeat: 'eat-n-repeat',
};

// In-memory runtime persistence cache to ensure immediate cross-component sync
const RUNTIME_USER_REVIEWS: Record<string, Review[]> = {};

export function normalizeKey(key: string): string {
  return (key || '')
    .toLowerCase()
    .trim()
    .replace(/[\s\-_]/g, '');
}

/**
 * Resolve exact key from aliases or normalized strings
 */
export function resolveReviewKey(slugOrId: string): string {
  if (!slugOrId) return '';
  const norm = normalizeKey(slugOrId);
  if (SLUG_ALIASES[norm]) {
    return SLUG_ALIASES[norm];
  }
  if (ESTABLISHMENT_REVIEWS[slugOrId]) {
    return slugOrId;
  }
  const matched = Object.keys(ESTABLISHMENT_REVIEWS).find(
    (k) => normalizeKey(k) === norm || norm.includes(normalizeKey(k)) || normalizeKey(k).includes(norm)
  );
  return matched || slugOrId;
}

/**
 * Get verified reviews for a restaurant by slug or id, including persistent user-submitted reviews.
 */
export function getVerifiedReviews(slugOrId: string): Review[] {
  if (!slugOrId) return [];
  const exactKey = resolveReviewKey(slugOrId);
  const norm = normalizeKey(exactKey);

  const baseReviews: Review[] = ESTABLISHMENT_REVIEWS[exactKey]
    ? [...ESTABLISHMENT_REVIEWS[exactKey]]
    : [
        {
          id: 'base-rev-' + slugOrId + '-1',
          restaurant_id: slugOrId,
          user_id: 'usr-default-1',
          reviewer_name: 'Cordova Food Explorer',
          rating: 5,
          comment: 'Great dining experience with fresh flavors, friendly local hospitality, and authentic Cordova vibes!',
          reactions: { '❤️': 8, '👏': 5 },
          status: 'visible',
          created_at: '2026-03-01T12:00:00Z',
          like_count: 4,
          liked_by_me: false,
          visit_type: 'casual',
        },
        {
          id: 'base-rev-' + slugOrId + '-2',
          restaurant_id: slugOrId,
          user_id: 'usr-default-2',
          reviewer_name: 'Cebu Local Guide',
          rating: 4,
          comment: 'Very good food quality and generous portions. Definitely recommended when visiting this part of Cordova.',
          reactions: { '👍': 6 },
          status: 'visible',
          created_at: '2026-02-20T17:30:00Z',
          like_count: 3,
          liked_by_me: false,
          visit_type: 'dine-in',
        },
      ];

  const userReviews: Review[] = [];

  // Check runtime memory cache
  if (RUNTIME_USER_REVIEWS[norm]) {
    userReviews.push(...RUNTIME_USER_REVIEWS[norm]);
  }

  // Merge with client-side user submitted reviews from localStorage if in browser
  if (typeof window !== 'undefined') {
    try {
      const storageKey = 'cordova_user_reviews_' + norm;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed: Review[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          for (const item of parsed) {
            if (!userReviews.some((r) => r.id === item.id)) {
              userReviews.push(item);
            }
          }
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }

  // Combine user reviews on top of base reviews, removing duplicate IDs
  const combined = [...userReviews, ...baseReviews];
  const seenIds = new Set<string>();
  const uniqueReviews: Review[] = [];

  for (const r of combined) {
    if (!seenIds.has(r.id)) {
      seenIds.add(r.id);
      uniqueReviews.push(r);
    }
  }

  return uniqueReviews;
}

/**
 * Add and persist a user-submitted review in real time.
 */
export function addPersistedReview(slugOrId: string, newReview: Review): Review[] {
  const exactKey = resolveReviewKey(slugOrId);
  const norm = normalizeKey(exactKey);

  // Update in-memory runtime cache
  if (!RUNTIME_USER_REVIEWS[norm]) {
    RUNTIME_USER_REVIEWS[norm] = [];
  }
  RUNTIME_USER_REVIEWS[norm] = [
    newReview,
    ...RUNTIME_USER_REVIEWS[norm].filter((r) => r.id !== newReview.id),
  ];

  // Update localStorage in browser
  if (typeof window !== 'undefined') {
    try {
      const storageKey = 'cordova_user_reviews_' + norm;
      const saved = localStorage.getItem(storageKey);
      const userList: Review[] = saved ? JSON.parse(saved) : [];
      const updatedUserList = [
        newReview,
        ...userList.filter((r) => r.id !== newReview.id),
      ];
      localStorage.setItem(storageKey, JSON.stringify(updatedUserList));
    } catch {
      // Ignore storage write errors
    }
  }

  const updatedReviews = getVerifiedReviews(exactKey);
  const newStats = calculateRestaurantRatingStats(updatedReviews);

  if (typeof window !== 'undefined') {
    try {
      // Dispatch global real-time event for cards and directories
      window.dispatchEvent(
        new CustomEvent('cordova_review_updated', {
          detail: {
            slugOrId: exactKey,
            rawSlugOrId: slugOrId,
            review: newReview,
            totalReviews: updatedReviews.length,
            stats: newStats,
          },
        })
      );
    } catch {
      // Ignore dispatch errors
    }
  }

  return updatedReviews;
}

/**
 * Calculate accurate review statistics (exact count & avg rating).
 */
export function calculateRestaurantRatingStats(reviews: Review[]): { count: number; rating: number } {
  if (!reviews || reviews.length === 0) {
    return { count: 0, rating: 5.0 };
  }
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
  const avg = parseFloat((sum / reviews.length).toFixed(1));
  return {
    count: reviews.length,
    rating: avg,
  };
}

/**
 * Get dynamic stats for any establishment.
 */
export function getRestaurantReviewStats(slugOrId: string): { count: number; rating: number } {
  const reviews = getVerifiedReviews(slugOrId);
  return calculateRestaurantRatingStats(reviews);
}
