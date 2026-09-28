/* ==========================================================================
   Mel's Dress Up Studio | DATA FILE
   --------------------------------------------------------------------------
   Characters, wardrobe items, shop items and Dreamland scenes live here.
   Edit this file to add or change things; the pages update automatically.

   Rules of thumb
   - Keep the commas between items and the quotes around text.
   - Colors are hex codes like "#FF69B4" (search "color picker" to find one).
   - Every item id must be unique.
   - After editing, open the site and check the Home page still shows Mel.
     If the page goes blank, a comma or quote is missing.
   ========================================================================== */

window.MEL_DATA = {

  /* ------------------------------------------------------------------------
     CHARACTERS (the "Pick a friend" row)
     style:  "photo" = a 3D picture whose clothes are recolored (needs a
                       picture plus a clothing mask, see README)
             "art"   = drawn by the site, works for every outfit
     tint:   the two colors of the button when it's picked
     ------------------------------------------------------------------------ */
  characters: [
    { id: "girl",     name: "Mel",     label: "Mel",       emoji: "👧🏾", tint: ["#f472b6", "#fb7185"], style: "photo" },
    { id: "princess", name: "Royal",   label: "Royal Mel", emoji: "👸🏾", tint: ["#fde047", "#f472b6"], style: "art" },
    { id: "robot",    name: "Robo",    label: "Robo",      emoji: "🤖",             tint: ["#c084fc", "#f472b6"], style: "art" },
    { id: "unicorn",  name: "Sparkle", label: "Sparkle",   emoji: "🦄",             tint: ["#d8b4fe", "#f9a8d4"], style: "art" },
    { id: "cat",      name: "Fuzzy",   label: "Fuzzy",     emoji: "🐱",             tint: ["#fdba74", "#f472b6"], style: "art" },
    { id: "bear",     name: "Cuddles", label: "Cuddles",   emoji: "🐻",             tint: ["#fcd34d", "#f9a8d4"], style: "art" },
    { id: "bunny",    name: "Fluffy",  label: "Fluffy",    emoji: "🐰",             tint: ["#f9a8d4", "#fda4af"], style: "art" },
    { id: "fairy",    name: "Twinkle", label: "Twinkle",   emoji: "🧚🏾", tint: ["#67e8f9", "#f472b6"], style: "art" }
  ],

  /* 3D picture settings for "photo" characters.
     masks: black-and-white pictures; white = where that clothing is.
     anchors: where accessories sit on the picture (0-1024 grid). */
  photos: {
    girl: {
      image: "mel.jpg",
      masks: { top: "mel-mask-top.png", bottom: "mel-mask-bottom.png", shoes: "mel-mask-shoes.png" },
      /* average brightness of each piece of clothing in the picture (0-1);
         used to keep the shading when recoloring */
      brightness: { top: 0.757, bottom: 0.637, shoes: 0.608 },
      anchors: {
        headTop: [512, 118], head: [512, 292], eyeY: 286, eyeL: 463, eyeR: 562,
        earL: [432, 330], earR: [596, 330], neck: [512, 402], handR: [736, 214],
        handL: [262, 292], wristR: [684, 292], back: [512, 520], scale: 0.8
      }
    }
  },

  /* Clothes a character wears when nothing is picked in that slot */
  defaults: {
    top:    { id: "default-top",    name: "Default Top",    color: "#FF69B4", slot: "top" },
    bottom: { id: "default-bottom", name: "Default Shorts", color: "#87CEEB", slot: "bottom" }
  },

  /* ------------------------------------------------------------------------
     WARDROBE TABS  (the "Hair" tab holds accessories, as in the original)
     ------------------------------------------------------------------------ */
  categories: [
    { id: "tops",        label: "Tops",    icon: "shirt" },
    { id: "bottoms",     label: "Bottoms", icon: "palette" },
    { id: "accessories", label: "Hair",    icon: "crown" },
    { id: "shoes",       label: "Shoes",   icon: "footprints" }
  ],

  /* ------------------------------------------------------------------------
     WARDROBE  (per character; copied from the original app)
     To add an item, copy a line and give it a new id, name and color.
     slot must be "top", "bottom", "accessory" or "shoes".
     ------------------------------------------------------------------------ */
  wardrobe: {
    girl: {
      tops: [
        { id: "g-top-1", name: "Pink Tee", color: "#FF69B4", slot: "top" },
        { id: "g-top-2", name: "Purple Top", color: "#9370DB", slot: "top" },
        { id: "g-top-3", name: "Yellow Sun", color: "#FFD700", slot: "top" },
        { id: "g-top-4", name: "Blue Blouse", color: "#87CEEB", slot: "top" },
        { id: "g-top-5", name: "Red Heart", color: "#FF6B6B", slot: "top" },
        { id: "g-top-6", name: "Green Leaf", color: "#98D8AA", slot: "top" },
        { id: "g-top-7", name: "Orange Fun", color: "#FFA500", slot: "top" },
        { id: "g-top-8", name: "Mint Cool", color: "#98FFD8", slot: "top" },
        { id: "g-top-9", name: "Coral Top", color: "#FF7F50", slot: "top" },
        { id: "g-top-10", name: "Lavender", color: "#E6E6FA", slot: "top" },
        { id: "g-top-11", name: "Turquoise", color: "#40E0D0", slot: "top" },
        { id: "g-top-12", name: "Peach", color: "#FFDAB9", slot: "top" }
      ],
      bottoms: [
        { id: "g-bot-1", name: "Pink Skirt", color: "#FFB6C1", slot: "bottom" },
        { id: "g-bot-2", name: "Blue Jeans", color: "#6495ED", slot: "bottom" },
        { id: "g-bot-3", name: "Purple Pants", color: "#DDA0DD", slot: "bottom" },
        { id: "g-bot-4", name: "Yellow Shorts", color: "#FFEB3B", slot: "bottom" },
        { id: "g-bot-5", name: "Red Skirt", color: "#FF6B6B", slot: "bottom" },
        { id: "g-bot-6", name: "Green Pants", color: "#98D8AA", slot: "bottom" },
        { id: "g-bot-7", name: "Orange Shorts", color: "#FFA500", slot: "bottom" },
        { id: "g-bot-8", name: "Coral Skirt", color: "#FF7F50", slot: "bottom" },
        { id: "g-bot-9", name: "Mint Pants", color: "#98FFD8", slot: "bottom" }
      ],
      accessories: [
        { id: "g-acc-1", name: "Pink Bow", color: "#FF69B4", slot: "accessory" },
        { id: "g-acc-2", name: "Crown", color: "#FFD700", slot: "accessory" },
        { id: "g-acc-3", name: "Flowers", color: "#FF6B6B", slot: "accessory" },
        { id: "g-acc-4", name: "Headband", color: "#9370DB", slot: "accessory" },
        { id: "g-acc-5", name: "Sunglasses", color: "#000000", slot: "accessory" },
        { id: "g-acc-6", name: "Necklace", color: "#FFD700", slot: "accessory" },
        { id: "g-acc-7", name: "Hat", color: "#FF69B4", slot: "accessory" },
        { id: "g-acc-8", name: "Scarf", color: "#9370DB", slot: "accessory" },
        { id: "g-acc-9", name: "Earrings", color: "#87CEEB", slot: "accessory" },
        { id: "g-acc-10", name: "Tiara", color: "#FFD700", slot: "accessory" },
        { id: "g-acc-11", name: "Bracelet", color: "#FF69B4", slot: "accessory" },
        { id: "g-acc-12", name: "Clips", color: "#40E0D0", slot: "accessory" }
      ],
      shoes: [
        { id: "g-shoe-1", name: "Pink Shoes", color: "#FF69B4", slot: "shoes" },
        { id: "g-shoe-2", name: "Blue Sneakers", color: "#6495ED", slot: "shoes" },
        { id: "g-shoe-3", name: "Gold Sandals", color: "#FFD700", slot: "shoes" },
        { id: "g-shoe-4", name: "Purple Boots", color: "#9370DB", slot: "shoes" },
        { id: "g-shoe-5", name: "Red Flats", color: "#FF6B6B", slot: "shoes" },
        { id: "g-shoe-6", name: "Green Boots", color: "#98D8AA", slot: "shoes" },
        { id: "g-shoe-7", name: "Orange Shoes", color: "#FFA500", slot: "shoes" },
        { id: "g-shoe-8", name: "White Sneakers", color: "#FFFFFF", slot: "shoes" }
      ]
    },
    princess: {
      tops: [
        { id: "p-top-1", name: "Pink Gown", color: "#FF69B4", slot: "top" },
        { id: "p-top-2", name: "Purple Royal", color: "#9370DB", slot: "top" },
        { id: "p-top-3", name: "Gold Dress", color: "#FFD700", slot: "top" },
        { id: "p-top-4", name: "Blue Ball", color: "#87CEEB", slot: "top" },
        { id: "p-top-5", name: "Rose Gown", color: "#FF6B6B", slot: "top" },
        { id: "p-top-6", name: "Mint Gown", color: "#98FFD8", slot: "top" },
        { id: "p-top-7", name: "Coral Dress", color: "#FF7F50", slot: "top" },
        { id: "p-top-8", name: "Lavender Gown", color: "#E6E6FA", slot: "top" },
        { id: "p-top-9", name: "Teal Dress", color: "#40E0D0", slot: "top" }
      ],
      bottoms: [
        { id: "p-bot-1", name: "Pink Skirt", color: "#FFB6C1", slot: "bottom" },
        { id: "p-bot-2", name: "Sparkle Layer", color: "#E6E6FA", slot: "bottom" },
        { id: "p-bot-3", name: "Gold Trim", color: "#FFD700", slot: "bottom" },
        { id: "p-bot-4", name: "Purple Skirt", color: "#DDA0DD", slot: "bottom" },
        { id: "p-bot-5", name: "Blue Tulle", color: "#87CEEB", slot: "bottom" },
        { id: "p-bot-6", name: "Rose Skirt", color: "#FF6B6B", slot: "bottom" }
      ],
      accessories: [
        { id: "p-acc-1", name: "Tiara", color: "#FFD700", slot: "accessory" },
        { id: "p-acc-2", name: "Diamond Crown", color: "#E6E6FA", slot: "accessory" },
        { id: "p-acc-3", name: "Rose Crown", color: "#FF69B4", slot: "accessory" },
        { id: "p-acc-4", name: "Magic Wand", color: "#FFD700", slot: "accessory" },
        { id: "p-acc-5", name: "Necklace", color: "#87CEEB", slot: "accessory" },
        { id: "p-acc-6", name: "Earrings", color: "#FFD700", slot: "accessory" },
        { id: "p-acc-7", name: "Veil", color: "#FFFFFF", slot: "accessory" },
        { id: "p-acc-8", name: "Bracelet", color: "#FF69B4", slot: "accessory" },
        { id: "p-acc-9", name: "Pearl Crown", color: "#FFDAB9", slot: "accessory" }
      ],
      shoes: [
        { id: "p-shoe-1", name: "Glass Slipper", color: "#E6E6FA", slot: "shoes" },
        { id: "p-shoe-2", name: "Pink Heels", color: "#FF69B4", slot: "shoes" },
        { id: "p-shoe-3", name: "Gold Flats", color: "#FFD700", slot: "shoes" },
        { id: "p-shoe-4", name: "Silver Heels", color: "#C0C0C0", slot: "shoes" },
        { id: "p-shoe-5", name: "Purple Heels", color: "#9370DB", slot: "shoes" },
        { id: "p-shoe-6", name: "Rose Flats", color: "#FF6B6B", slot: "shoes" }
      ]
    },
    robot: {
      tops: [
        { id: "r-top-1", name: "Silver Chest", color: "#C0C0C0", slot: "top" },
        { id: "r-top-2", name: "Gold Plate", color: "#FFD700", slot: "top" },
        { id: "r-top-3", name: "Pink Metal", color: "#FF69B4", slot: "top" },
        { id: "r-top-4", name: "Blue Steel", color: "#4682B4", slot: "top" },
        { id: "r-top-5", name: "Green Circuit", color: "#98D8AA", slot: "top" }
      ],
      bottoms: [
        { id: "r-bot-1", name: "Chrome Legs", color: "#A8A8A8", slot: "bottom" },
        { id: "r-bot-2", name: "Pink Gears", color: "#FFB6C1", slot: "bottom" },
        { id: "r-bot-3", name: "Gold Parts", color: "#DAA520", slot: "bottom" },
        { id: "r-bot-4", name: "Blue Parts", color: "#6495ED", slot: "bottom" }
      ],
      accessories: [
        { id: "r-acc-1", name: "Antenna", color: "#FF69B4", slot: "accessory" },
        { id: "r-acc-2", name: "LED Eyes", color: "#00FF00", slot: "accessory" },
        { id: "r-acc-3", name: "Sparkle Bolts", color: "#FFD700", slot: "accessory" },
        { id: "r-acc-4", name: "Visor", color: "#87CEEB", slot: "accessory" },
        { id: "r-acc-5", name: "Headlights", color: "#FFEB3B", slot: "accessory" }
      ],
      shoes: [
        { id: "r-shoe-1", name: "Rocket Feet", color: "#FF4500", slot: "shoes" },
        { id: "r-shoe-2", name: "Wheel Base", color: "#696969", slot: "shoes" },
        { id: "r-shoe-3", name: "Pink Boosters", color: "#FF69B4", slot: "shoes" },
        { id: "r-shoe-4", name: "Hover Pads", color: "#87CEEB", slot: "shoes" }
      ]
    },
    unicorn: {
      tops: [
        { id: "u-top-1", name: "Rainbow Top", color: "#FF69B4", slot: "top" },
        { id: "u-top-2", name: "Sparkle Coat", color: "#E6E6FA", slot: "top" },
        { id: "u-top-3", name: "Pink Fur", color: "#FFB6C1", slot: "top" },
        { id: "u-top-4", name: "Purple Magic", color: "#9370DB", slot: "top" },
        { id: "u-top-5", name: "Gold Shimmer", color: "#FFD700", slot: "top" }
      ],
      bottoms: [
        { id: "u-bot-1", name: "Rainbow Tail", color: "#FF69B4", slot: "bottom" },
        { id: "u-bot-2", name: "Sparkle Legs", color: "#DDA0DD", slot: "bottom" },
        { id: "u-bot-3", name: "Cloud Pants", color: "#E6E6FA", slot: "bottom" },
        { id: "u-bot-4", name: "Star Shorts", color: "#FFD700", slot: "bottom" }
      ],
      accessories: [
        { id: "u-acc-1", name: "Horn Crown", color: "#FFD700", slot: "accessory" },
        { id: "u-acc-2", name: "Star Horn", color: "#FF69B4", slot: "accessory" },
        { id: "u-acc-3", name: "Rainbow Mane", color: "#9370DB", slot: "accessory" },
        { id: "u-acc-4", name: "Flower Crown", color: "#FFB6C1", slot: "accessory" },
        { id: "u-acc-5", name: "Wings", color: "#E6E6FA", slot: "accessory" }
      ],
      shoes: [
        { id: "u-shoe-1", name: "Gold Hooves", color: "#FFD700", slot: "shoes" },
        { id: "u-shoe-2", name: "Pink Hooves", color: "#FF69B4", slot: "shoes" },
        { id: "u-shoe-3", name: "Rainbow Hooves", color: "#9370DB", slot: "shoes" },
        { id: "u-shoe-4", name: "Star Hooves", color: "#87CEEB", slot: "shoes" }
      ]
    },
    cat: {
      tops: [
        { id: "c-top-1", name: "Fluffy Pink", color: "#FFB6C1", slot: "top" },
        { id: "c-top-2", name: "Orange Fur", color: "#FFA07A", slot: "top" },
        { id: "c-top-3", name: "White Spots", color: "#FFFAF0", slot: "top" },
        { id: "c-top-4", name: "Purple Stripes", color: "#DDA0DD", slot: "top" },
        { id: "c-top-5", name: "Rainbow Fur", color: "#FF69B4", slot: "top" }
      ],
      bottoms: [
        { id: "c-bot-1", name: "Fluffy Tail", color: "#FFB6C1", slot: "bottom" },
        { id: "c-bot-2", name: "Striped Pants", color: "#FFA500", slot: "bottom" },
        { id: "c-bot-3", name: "Spotted Legs", color: "#DDA0DD", slot: "bottom" },
        { id: "c-bot-4", name: "Pink Shorts", color: "#FF69B4", slot: "bottom" }
      ],
      accessories: [
        { id: "c-acc-1", name: "Bow Tie", color: "#FF69B4", slot: "accessory" },
        { id: "c-acc-2", name: "Tiny Crown", color: "#FFD700", slot: "accessory" },
        { id: "c-acc-3", name: "Flower Ear", color: "#FF6B6B", slot: "accessory" },
        { id: "c-acc-4", name: "Collar", color: "#9370DB", slot: "accessory" },
        { id: "c-acc-5", name: "Bandana", color: "#87CEEB", slot: "accessory" }
      ],
      shoes: [
        { id: "c-shoe-1", name: "Pink Paws", color: "#FFB6C1", slot: "shoes" },
        { id: "c-shoe-2", name: "Fuzzy Boots", color: "#DEB887", slot: "shoes" },
        { id: "c-shoe-3", name: "Rainbow Paws", color: "#FF69B4", slot: "shoes" },
        { id: "c-shoe-4", name: "Sneakers", color: "#87CEEB", slot: "shoes" }
      ]
    },
    bear: {
      tops: [
        { id: "b-top-1", name: "Brown Fur", color: "#8B4513", slot: "top" },
        { id: "b-top-2", name: "Honey Top", color: "#DAA520", slot: "top" },
        { id: "b-top-3", name: "Pink Fluff", color: "#FFB6C1", slot: "top" },
        { id: "b-top-4", name: "Rainbow Coat", color: "#FF69B4", slot: "top" },
        { id: "b-top-5", name: "Blue Sweater", color: "#87CEEB", slot: "top" }
      ],
      bottoms: [
        { id: "b-bot-1", name: "Brown Pants", color: "#8B4513", slot: "bottom" },
        { id: "b-bot-2", name: "Honey Shorts", color: "#DAA520", slot: "bottom" },
        { id: "b-bot-3", name: "Pink Shorts", color: "#FFB6C1", slot: "bottom" },
        { id: "b-bot-4", name: "Blue Pants", color: "#6495ED", slot: "bottom" }
      ],
      accessories: [
        { id: "b-acc-1", name: "Bow Tie", color: "#FF69B4", slot: "accessory" },
        { id: "b-acc-2", name: "Party Hat", color: "#FFD700", slot: "accessory" },
        { id: "b-acc-3", name: "Scarf", color: "#9370DB", slot: "accessory" },
        { id: "b-acc-4", name: "Flowers", color: "#FF6B6B", slot: "accessory" },
        { id: "b-acc-5", name: "Crown", color: "#FFD700", slot: "accessory" }
      ],
      shoes: [
        { id: "b-shoe-1", name: "Brown Paws", color: "#8B4513", slot: "shoes" },
        { id: "b-shoe-2", name: "Pink Boots", color: "#FF69B4", slot: "shoes" },
        { id: "b-shoe-3", name: "Blue Sneakers", color: "#6495ED", slot: "shoes" },
        { id: "b-shoe-4", name: "Gold Shoes", color: "#FFD700", slot: "shoes" }
      ]
    },
    bunny: {
      tops: [
        { id: "bn-top-1", name: "White Fluff", color: "#FFFAF0", slot: "top" },
        { id: "bn-top-2", name: "Pink Fur", color: "#FFB6C1", slot: "top" },
        { id: "bn-top-3", name: "Grey Coat", color: "#C0C0C0", slot: "top" },
        { id: "bn-top-4", name: "Rainbow Top", color: "#FF69B4", slot: "top" },
        { id: "bn-top-5", name: "Blue Hoodie", color: "#87CEEB", slot: "top" }
      ],
      bottoms: [
        { id: "bn-bot-1", name: "Fluffy Tail", color: "#FFFAF0", slot: "bottom" },
        { id: "bn-bot-2", name: "Pink Shorts", color: "#FFB6C1", slot: "bottom" },
        { id: "bn-bot-3", name: "Blue Pants", color: "#6495ED", slot: "bottom" },
        { id: "bn-bot-4", name: "Purple Skirt", color: "#DDA0DD", slot: "bottom" }
      ],
      accessories: [
        { id: "bn-acc-1", name: "Bow", color: "#FF69B4", slot: "accessory" },
        { id: "bn-acc-2", name: "Flower Crown", color: "#FF6B6B", slot: "accessory" },
        { id: "bn-acc-3", name: "Carrot Pin", color: "#FFA500", slot: "accessory" },
        { id: "bn-acc-4", name: "Ear Muffs", color: "#9370DB", slot: "accessory" },
        { id: "bn-acc-5", name: "Sunglasses", color: "#000000", slot: "accessory" }
      ],
      shoes: [
        { id: "bn-shoe-1", name: "Pink Paws", color: "#FFB6C1", slot: "shoes" },
        { id: "bn-shoe-2", name: "White Paws", color: "#FFFAF0", slot: "shoes" },
        { id: "bn-shoe-3", name: "Blue Sneakers", color: "#6495ED", slot: "shoes" },
        { id: "bn-shoe-4", name: "Purple Boots", color: "#9370DB", slot: "shoes" }
      ]
    },
    fairy: {
      tops: [
        { id: "f-top-1", name: "Pink Dress", color: "#FF69B4", slot: "top" },
        { id: "f-top-2", name: "Purple Gown", color: "#9370DB", slot: "top" },
        { id: "f-top-3", name: "Blue Magic", color: "#87CEEB", slot: "top" },
        { id: "f-top-4", name: "Rainbow Top", color: "#FFD700", slot: "top" },
        { id: "f-top-5", name: "Green Leaf", color: "#98D8AA", slot: "top" }
      ],
      bottoms: [
        { id: "f-bot-1", name: "Pink Skirt", color: "#FFB6C1", slot: "bottom" },
        { id: "f-bot-2", name: "Sparkle Pants", color: "#E6E6FA", slot: "bottom" },
        { id: "f-bot-3", name: "Purple Tutu", color: "#DDA0DD", slot: "bottom" },
        { id: "f-bot-4", name: "Cloud Skirt", color: "#87CEEB", slot: "bottom" }
      ],
      accessories: [
        { id: "f-acc-1", name: "Wings", color: "#E6E6FA", slot: "accessory" },
        { id: "f-acc-2", name: "Flower Crown", color: "#FF6B6B", slot: "accessory" },
        { id: "f-acc-3", name: "Magic Wand", color: "#FFD700", slot: "accessory" },
        { id: "f-acc-4", name: "Tiara", color: "#FF69B4", slot: "accessory" },
        { id: "f-acc-5", name: "Star Wand", color: "#87CEEB", slot: "accessory" },
        { id: "f-acc-6", name: "Bow", color: "#9370DB", slot: "accessory" }
      ],
      shoes: [
        { id: "f-shoe-1", name: "Pink Slippers", color: "#FF69B4", slot: "shoes" },
        { id: "f-shoe-2", name: "Gold Flats", color: "#FFD700", slot: "shoes" },
        { id: "f-shoe-3", name: "Purple Boots", color: "#9370DB", slot: "shoes" },
        { id: "f-shoe-4", name: "Rainbow Shoes", color: "#87CEEB", slot: "shoes" }
      ]
    }
  },

  /* ------------------------------------------------------------------------
     MAGICAL SHOP  (play money only: Sparkles, never real payments)
     locked: true shows "Coming Soon"
     ------------------------------------------------------------------------ */
  startingSparkles: 500,
  sparklesPerSave: 10,
  shop: [
    { id: 1,  name: "Magical Wings",  price: 50,  icon: "🦋", locked: false },
    { id: 2,  name: "Rainbow Hair",   price: 100, icon: "🌈", locked: false },
    { id: 3,  name: "Sparkle Dress",  price: 75,  icon: "👗", locked: false },
    { id: 4,  name: "Crystal Crown",  price: 150, icon: "👑", locked: false },
    { id: 5,  name: "Fairy Wand",     price: 80,  icon: "wand",          locked: false },
    { id: 6,  name: "Star Necklace",  price: 60,  icon: "⭐",       locked: false },
    { id: 7,  name: "Unicorn Horn",   price: 200, icon: "🦄", locked: true },
    { id: 8,  name: "Magic Shoes",    price: 90,  icon: "👠", locked: false },
    { id: 9,  name: "Glitter Cape",   price: 120, icon: "🎀", locked: false },
    { id: 10, name: "Enchanted Ring", price: 250, icon: "💍", locked: true }
  ],

  /* ------------------------------------------------------------------------
     DREAMLAND
     ------------------------------------------------------------------------ */
  scenes: {
    stars:   { name: "Starry Night",    icon: "star",     page: ["#312e81", "#581c87", "#831843"], help: "Tap stars to make them sparkle ✨" },
    moon:    { name: "Moonlight Magic", icon: "moon",     page: ["#1e3a8a", "#3730a3", "#581c87"], help: "Touch the moon to send out moonbeams 🌙" },
    clouds:  { name: "Cloud Kingdom",   icon: "cloud",    page: ["#38bdf8", "#93c5fd", "#c7d2fe"], help: "Puff the clouds and feel the wind 🌬️" },
    rainbow: { name: "Rainbow Dreams",  icon: "rainbow",  page: ["#f472b6", "#c084fc", "#60a5fa"], help: "Tap anywhere to burst rainbow magic 🌈" }
  },
  dreamJournal: [
    "My Starry Adventure ⭐",
    "Dancing with Moonbeams 🌙",
    "Cloud Castle Quest ☁️",
    "Rainbow Bridge Discovery 🌈"
  ]
};
