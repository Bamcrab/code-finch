import type { ClothingSlot, FurnitureSlot } from '../state/types';

export interface StyleDef {
  id: string;
  name: string;
  slot: ClothingSlot | FurnitureSlot;
  price: number;
  /** Palette keys this style is sold in. */
  colors: string[];
  /** Palette key for secondary details. */
  accent?: string;
  /** Sold every day in any color (the "Everyday collection"). */
  everyday?: boolean;
  rare?: boolean;
}

const EARTH = ['sage', 'forest', 'brown', 'tan', 'cream', 'mustard'];
const PASTEL = ['blush', 'mint', 'lavender', 'peach', 'sky', 'yellow'];
const BRIGHT = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'];
const WOOD = ['tan', 'brown', 'cream', 'white', 'charcoal', 'sage'];

export const CLOTHING_STYLES: StyleDef[] = [
  // Head
  { id: 'beanie', name: 'Beanie', slot: 'head', price: 150, colors: [...BRIGHT, 'sage', 'navy', 'charcoal'], accent: 'white', everyday: true },
  { id: 'cap', name: 'Ball Cap', slot: 'head', price: 150, colors: [...BRIGHT, 'navy', 'black'], accent: 'white', everyday: true },
  { id: 'bow', name: 'Hair Bow', slot: 'head', price: 120, colors: [...PASTEL, 'red', 'rose', 'navy'], everyday: true },
  { id: 'top-hat', name: 'Top Hat', slot: 'head', price: 400, colors: ['black', 'navy', 'plum', 'forest', 'brown'], accent: 'red' },
  { id: 'flower-crown', name: 'Flower Crown', slot: 'head', price: 350, colors: ['pink', 'yellow', 'lavender', 'coral', 'white'], accent: 'green' },
  { id: 'crown', name: 'Crown', slot: 'head', price: 700, colors: ['gold', 'silver', 'rose'], accent: 'red', rare: true },
  { id: 'witch-hat', name: 'Witch Hat', slot: 'head', price: 450, colors: ['purple', 'black', 'forest', 'navy'], accent: 'orange' },
  { id: 'party-hat', name: 'Party Hat', slot: 'head', price: 200, colors: [...BRIGHT], accent: 'yellow' },
  { id: 'beret', name: 'Beret', slot: 'head', price: 250, colors: ['red', 'navy', 'black', 'mustard', 'sage', 'blush'] },
  { id: 'bucket-hat', name: 'Bucket Hat', slot: 'head', price: 250, colors: [...PASTEL, 'tan', 'sage'] },
  { id: 'headphones', name: 'Headphones', slot: 'head', price: 400, colors: ['black', 'white', 'pink', 'mint', 'blue'], accent: 'charcoal' },
  { id: 'cat-ears', name: 'Cat Ears', slot: 'head', price: 300, colors: ['black', 'white', 'orange', 'gray', 'pink'], accent: 'blush' },
  { id: 'bunny-ears', name: 'Bunny Ears', slot: 'head', price: 300, colors: ['white', 'blush', 'gray', 'brown', 'lavender'], accent: 'pink' },
  { id: 'halo', name: 'Halo', slot: 'head', price: 500, colors: ['gold', 'silver', 'sky'], rare: true },
  { id: 'sprout', name: 'Sprout', slot: 'head', price: 150, colors: ['green', 'lime', 'forest', 'pink'] },
  { id: 'cowboy-hat', name: 'Cowboy Hat', slot: 'head', price: 400, colors: ['tan', 'brown', 'black', 'white', 'pink'], accent: 'brown' },
  { id: 'chef-hat', name: 'Chef Hat', slot: 'head', price: 300, colors: ['white', 'cream'] },
  { id: 'santa-hat', name: 'Holiday Hat', slot: 'head', price: 300, colors: ['red', 'green', 'navy'], accent: 'white' },
  { id: 'pumpkin-hat', name: 'Pumpkin Hat', slot: 'head', price: 350, colors: ['orange', 'white', 'green'], accent: 'forest' },
  { id: 'antlers', name: 'Antlers', slot: 'head', price: 350, colors: ['brown', 'tan', 'gold'] },
  { id: 'grad-cap', name: 'Graduation Cap', slot: 'head', price: 400, colors: ['black', 'navy', 'red', 'forest'], accent: 'gold' },
  { id: 'headband', name: 'Sweatband', slot: 'head', price: 120, colors: [...BRIGHT, 'white'], everyday: true },
  { id: 'pirate-hat', name: 'Pirate Hat', slot: 'head', price: 500, colors: ['black', 'brown', 'navy'], accent: 'white' },
  { id: 'straw-hat', name: 'Sun Hat', slot: 'head', price: 300, colors: ['tan', 'cream', 'mustard'], accent: 'red' },
  { id: 'frog-hat', name: 'Frog Hat', slot: 'head', price: 450, colors: ['green', 'lime', 'pink', 'sky'], accent: 'white' },
  { id: 'tiara', name: 'Tiara', slot: 'head', price: 600, colors: ['silver', 'gold', 'rose'], accent: 'sky', rare: true },
  { id: 'earmuffs', name: 'Earmuffs', slot: 'head', price: 250, colors: ['pink', 'white', 'sky', 'mint', 'red'], accent: 'gray' },
  { id: 'leaf', name: 'Leaf', slot: 'head', price: 100, colors: ['green', 'orange', 'red', 'mustard'] },
  { id: 'wizard-hat', name: 'Wizard Hat', slot: 'head', price: 550, colors: ['navy', 'purple', 'teal'], accent: 'yellow', rare: true },
  // Eyes
  { id: 'round-glasses', name: 'Round Glasses', slot: 'eyes', price: 150, colors: ['black', 'brown', 'gold', 'red', 'blue'], everyday: true },
  { id: 'sunglasses', name: 'Sunglasses', slot: 'eyes', price: 250, colors: ['black', 'pink', 'blue', 'orange', 'purple'] },
  { id: 'heart-glasses', name: 'Heart Glasses', slot: 'eyes', price: 300, colors: ['pink', 'red', 'purple', 'yellow'] },
  { id: 'star-glasses', name: 'Star Glasses', slot: 'eyes', price: 300, colors: ['yellow', 'sky', 'pink', 'lime'] },
  { id: 'monocle', name: 'Monocle', slot: 'eyes', price: 350, colors: ['gold', 'silver', 'black'] },
  { id: 'goggles', name: 'Goggles', slot: 'eyes', price: 350, colors: ['brown', 'charcoal', 'teal', 'orange'], accent: 'sky' },
  { id: 'sleep-mask', name: 'Sleep Mask', slot: 'eyes', price: 200, colors: ['lavender', 'blush', 'navy', 'mint'], accent: 'white' },
  { id: 'cat-eye-glasses', name: 'Cat-eye Glasses', slot: 'eyes', price: 300, colors: ['rose', 'black', 'teal', 'purple'] },
  // Neck
  { id: 'scarf', name: 'Scarf', slot: 'neck', price: 150, colors: [...BRIGHT, 'sage', 'navy', 'cream'], accent: 'white', everyday: true },
  { id: 'bowtie', name: 'Bow Tie', slot: 'neck', price: 150, colors: ['red', 'navy', 'black', 'pink', 'mustard', 'green'], everyday: true },
  { id: 'necktie', name: 'Necktie', slot: 'neck', price: 200, colors: ['red', 'navy', 'forest', 'plum', 'black'] },
  { id: 'pearls', name: 'Pearl Necklace', slot: 'neck', price: 450, colors: ['white', 'blush', 'lavender'], rare: true },
  { id: 'neck-bandana', name: 'Neckerchief', slot: 'neck', price: 150, colors: ['red', 'blue', 'mustard', 'green', 'pink'], accent: 'white' },
  { id: 'lei', name: 'Flower Lei', slot: 'neck', price: 300, colors: ['pink', 'yellow', 'coral', 'purple', 'white'], accent: 'green' },
  { id: 'bell-collar', name: 'Bell Collar', slot: 'neck', price: 250, colors: ['red', 'blue', 'pink', 'green'], accent: 'gold' },
  { id: 'medal', name: 'Medal', slot: 'neck', price: 400, colors: ['gold', 'silver', 'orange'], accent: 'blue' },
  { id: 'ruffle-collar', name: 'Ruffle Collar', slot: 'neck', price: 300, colors: ['white', 'cream', 'blush', 'black'] },
  // Body
  { id: 'tshirt', name: 'Heart Tee', slot: 'body', price: 150, colors: [...BRIGHT, 'white', 'gray'], accent: 'white', everyday: true },
  { id: 'sweater', name: 'Cozy Sweater', slot: 'body', price: 300, colors: [...EARTH, 'red', 'navy'], accent: 'cream' },
  { id: 'hoodie', name: 'Hoodie', slot: 'body', price: 300, colors: [...PASTEL, 'charcoal', 'navy', 'red'], accent: 'white' },
  { id: 'overalls', name: 'Overalls', slot: 'body', price: 350, colors: ['blue', 'navy', 'pink', 'sage', 'mustard'], accent: 'gold' },
  { id: 'tutu', name: 'Tutu', slot: 'body', price: 350, colors: ['pink', 'lavender', 'mint', 'white', 'yellow'] },
  { id: 'raincoat', name: 'Raincoat', slot: 'body', price: 350, colors: ['yellow', 'red', 'sky', 'green', 'pink'], accent: 'charcoal' },
  { id: 'vest', name: 'Puffer Vest', slot: 'body', price: 300, colors: ['orange', 'navy', 'forest', 'red', 'purple'] },
  { id: 'tuxedo', name: 'Tuxedo', slot: 'body', price: 600, colors: ['black', 'navy', 'white', 'plum'], accent: 'white', rare: true },
  { id: 'apron', name: 'Apron', slot: 'body', price: 200, colors: ['red', 'sage', 'blush', 'navy', 'mustard'], accent: 'white' },
  { id: 'striped-shirt', name: 'Striped Shirt', slot: 'body', price: 200, colors: ['navy', 'red', 'green', 'black', 'pink'], accent: 'white', everyday: true },
  { id: 'pajamas', name: 'Pajamas', slot: 'body', price: 250, colors: ['sky', 'blush', 'mint', 'lavender', 'yellow'], accent: 'white' },
  { id: 'jersey', name: 'Sports Jersey', slot: 'body', price: 250, colors: ['red', 'blue', 'green', 'purple', 'orange'], accent: 'white' },
  { id: 'cardigan', name: 'Cardigan', slot: 'body', price: 300, colors: ['mustard', 'sage', 'blush', 'cream', 'plum'], accent: 'tan' },
  { id: 'kimono', name: 'Robe', slot: 'body', price: 450, colors: ['red', 'navy', 'pink', 'teal'], accent: 'gold', rare: true },
  // Back
  { id: 'backpack', name: 'Backpack', slot: 'back', price: 250, colors: [...BRIGHT, 'tan'], accent: 'charcoal', everyday: true },
  { id: 'cape', name: 'Cape', slot: 'back', price: 350, colors: ['red', 'purple', 'navy', 'black', 'gold'] },
  { id: 'fairy-wings', name: 'Fairy Wings', slot: 'back', price: 500, colors: ['sky', 'pink', 'lavender', 'mint'], rare: true },
  { id: 'angel-wings', name: 'Angel Wings', slot: 'back', price: 600, colors: ['white', 'gold', 'blush'], rare: true },
  { id: 'bat-wings', name: 'Bat Wings', slot: 'back', price: 450, colors: ['black', 'purple', 'plum'] },
  { id: 'turtle-shell', name: 'Turtle Shell', slot: 'back', price: 400, colors: ['green', 'forest', 'teal'], accent: 'lime' },
  { id: 'jetpack', name: 'Jetpack', slot: 'back', price: 700, colors: ['silver', 'red', 'blue'], accent: 'orange', rare: true },
  { id: 'balloon', name: 'Balloon', slot: 'back', price: 150, colors: [...BRIGHT], everyday: true },
];

export const FURNITURE_STYLES: StyleDef[] = [
  // Wallpaper
  { id: 'wp-plain', name: 'Plain Wallpaper', slot: 'wallpaper', price: 100, colors: ['cream', 'white', 'blush', 'mint', 'sky', 'lavender', 'peach', 'sage', 'yellow', 'gray', 'navy', 'charcoal'], everyday: true },
  { id: 'wp-stripes', name: 'Striped Wallpaper', slot: 'wallpaper', price: 250, colors: [...PASTEL, 'sage', 'navy'], accent: 'white' },
  { id: 'wp-dots', name: 'Polka Dot Wallpaper', slot: 'wallpaper', price: 250, colors: [...PASTEL, 'rose', 'teal'], accent: 'white' },
  { id: 'wp-stars', name: 'Starry Wallpaper', slot: 'wallpaper', price: 350, colors: ['navy', 'purple', 'charcoal', 'teal'], accent: 'yellow' },
  { id: 'wp-hearts', name: 'Heart Wallpaper', slot: 'wallpaper', price: 300, colors: ['blush', 'cream', 'lavender', 'white'], accent: 'rose' },
  { id: 'wp-gingham', name: 'Gingham Wallpaper', slot: 'wallpaper', price: 300, colors: ['red', 'sky', 'sage', 'mustard', 'pink'], accent: 'white' },
  { id: 'wp-wood', name: 'Wood Paneling', slot: 'wallpaper', price: 350, colors: WOOD },
  { id: 'wp-brick', name: 'Brick Wall', slot: 'wallpaper', price: 350, colors: ['coral', 'white', 'gray', 'tan'], accent: 'cream' },
  { id: 'wp-clouds', name: 'Cloud Wallpaper', slot: 'wallpaper', price: 350, colors: ['sky', 'lavender', 'blush', 'mint'], accent: 'white' },
  { id: 'wp-leaves', name: 'Leafy Wallpaper', slot: 'wallpaper', price: 350, colors: ['cream', 'mint', 'sage', 'white'], accent: 'green' },
  { id: 'wp-scallop', name: 'Scallop Wallpaper', slot: 'wallpaper', price: 300, colors: [...PASTEL], accent: 'white' },
  { id: 'wp-flowers', name: 'Floral Wallpaper', slot: 'wallpaper', price: 400, colors: ['cream', 'sky', 'sage', 'navy'], accent: 'pink', rare: true },
  { id: 'wp-diamonds', name: 'Diamond Wallpaper', slot: 'wallpaper', price: 300, colors: ['teal', 'mustard', 'plum', 'sage'], accent: 'cream' },
  // Floor
  { id: 'fl-planks', name: 'Wood Floor', slot: 'floor', price: 100, colors: WOOD, everyday: true },
  { id: 'fl-carpet', name: 'Carpet', slot: 'floor', price: 100, colors: ['cream', 'sage', 'blush', 'gray', 'navy', 'lavender', 'teal', 'plum'], everyday: true },
  { id: 'fl-checker', name: 'Checker Tile', slot: 'floor', price: 100, colors: ['black', 'red', 'sky', 'mint', 'mustard', 'pink'], accent: 'white', everyday: true },
  { id: 'fl-herringbone', name: 'Herringbone Floor', slot: 'floor', price: 250, colors: ['tan', 'brown', 'cream', 'charcoal'] },
  { id: 'fl-stone', name: 'Stone Floor', slot: 'floor', price: 250, colors: ['gray', 'tan', 'sage', 'cream'] },
  { id: 'fl-grass', name: 'Grassy Floor', slot: 'floor', price: 300, colors: ['green', 'lime', 'sage'] },
  // Window
  { id: 'win-curtain', name: 'Curtained Window', slot: 'window', price: 150, colors: ['red', 'blush', 'sage', 'sky', 'mustard', 'lavender', 'cream'], everyday: true },
  { id: 'win-round', name: 'Round Window', slot: 'window', price: 250, colors: WOOD },
  { id: 'win-arched', name: 'Arched Window', slot: 'window', price: 350, colors: ['white', 'cream', 'sage', 'navy', 'plum'] },
  { id: 'win-porthole', name: 'Porthole', slot: 'window', price: 300, colors: ['gold', 'silver', 'teal'] },
  { id: 'win-shutters', name: 'Shuttered Window', slot: 'window', price: 300, colors: ['sky', 'green', 'red', 'navy', 'mustard'] },
  { id: 'win-stained', name: 'Stained Glass Window', slot: 'window', price: 600, colors: ['purple', 'teal', 'rose'], rare: true },
  // Door
  { id: 'door-plain', name: 'Wooden Door', slot: 'door', price: 150, colors: [...WOOD, 'red', 'sky', 'mint'], everyday: true },
  { id: 'door-round', name: 'Round Door', slot: 'door', price: 350, colors: ['green', 'red', 'mustard', 'sky', 'brown'], accent: 'gold' },
  { id: 'door-arched', name: 'Arched Door', slot: 'door', price: 300, colors: ['brown', 'navy', 'plum', 'forest'], accent: 'gold' },
  { id: 'door-dutch', name: 'Dutch Door', slot: 'door', price: 300, colors: ['blue', 'red', 'mint', 'yellow', 'white'] },
  { id: 'door-glass', name: 'Glass Door', slot: 'door', price: 400, colors: ['white', 'black', 'sage'] },
  // Bed
  { id: 'bed-simple', name: 'Cozy Bed', slot: 'bed', price: 150, colors: ['sky', 'blush', 'mint', 'lavender', 'yellow', 'sage', 'navy', 'red'], everyday: true },
  { id: 'bed-canopy', name: 'Canopy Bed', slot: 'bed', price: 600, colors: ['pink', 'lavender', 'white', 'mint'], rare: true },
  { id: 'bed-nest', name: 'Nest Bed', slot: 'bed', price: 400, colors: ['tan', 'brown', 'mustard'], accent: 'cream' },
  { id: 'bed-cloud', name: 'Cloud Bed', slot: 'bed', price: 500, colors: ['white', 'sky', 'lavender', 'blush'], rare: true },
  { id: 'bed-hammock', name: 'Hammock', slot: 'bed', price: 350, colors: ['coral', 'teal', 'mustard', 'sage'] },
  { id: 'bed-heart', name: 'Heart Bed', slot: 'bed', price: 450, colors: ['rose', 'pink', 'red'] },
  { id: 'bed-futon', name: 'Futon', slot: 'bed', price: 250, colors: ['charcoal', 'sage', 'navy', 'cream'] },
  // Dresser
  { id: 'dr-dresser', name: 'Dresser', slot: 'dresser', price: 150, colors: WOOD, accent: 'gold', everyday: true },
  { id: 'dr-bookshelf', name: 'Bookshelf', slot: 'dresser', price: 300, colors: WOOD },
  { id: 'dr-wardrobe', name: 'Wardrobe', slot: 'dresser', price: 350, colors: [...WOOD, 'sky', 'blush'], accent: 'gold' },
  { id: 'dr-plantshelf', name: 'Plant Shelf', slot: 'dresser', price: 350, colors: ['tan', 'white', 'charcoal'] },
  { id: 'dr-vanity', name: 'Vanity', slot: 'dresser', price: 450, colors: ['white', 'blush', 'lavender', 'mint'], accent: 'gold' },
  { id: 'dr-record', name: 'Record Cabinet', slot: 'dresser', price: 450, colors: ['brown', 'mustard', 'teal', 'charcoal'] },
  // Rug
  { id: 'rug-round', name: 'Round Rug', slot: 'rug', price: 100, colors: [...PASTEL, 'sage', 'coral', 'navy', 'cream'], everyday: true },
  { id: 'rug-braided', name: 'Braided Rug', slot: 'rug', price: 250, colors: ['red', 'blue', 'green', 'mustard'], accent: 'cream' },
  { id: 'rug-striped', name: 'Striped Rug', slot: 'rug', price: 250, colors: ['teal', 'coral', 'navy', 'mustard', 'plum'], accent: 'cream' },
  { id: 'rug-star', name: 'Star Rug', slot: 'rug', price: 350, colors: ['yellow', 'sky', 'pink', 'lavender'] },
  { id: 'rug-heart', name: 'Heart Rug', slot: 'rug', price: 350, colors: ['rose', 'pink', 'red', 'blush'] },
  { id: 'rug-fluffy', name: 'Fluffy Rug', slot: 'rug', price: 300, colors: ['white', 'cream', 'blush', 'gray'] },
  // Doormat
  { id: 'mat-plain', name: 'Doormat', slot: 'doormat', price: 100, colors: ['tan', 'brown', 'sage', 'red', 'navy'], everyday: true },
  { id: 'mat-welcome', name: 'Welcome Mat', slot: 'doormat', price: 150, colors: ['tan', 'mustard', 'sage'], accent: 'brown' },
  { id: 'mat-halfmoon', name: 'Half-moon Mat', slot: 'doormat', price: 200, colors: ['coral', 'teal', 'plum', 'mustard'] },
  // Lamp
  { id: 'lamp-floor', name: 'Floor Lamp', slot: 'lamp', price: 150, colors: ['white', 'mustard', 'sage', 'blush', 'sky', 'charcoal'], accent: 'tan', everyday: true },
  { id: 'lamp-arc', name: 'Arc Lamp', slot: 'lamp', price: 350, colors: ['gold', 'black', 'white', 'silver'] },
  { id: 'lamp-lava', name: 'Lava Lamp', slot: 'lamp', price: 400, colors: ['pink', 'lime', 'purple', 'orange'], accent: 'silver' },
  { id: 'lamp-mushroom', name: 'Mushroom Lamp', slot: 'lamp', price: 400, colors: ['red', 'orange', 'lavender', 'mint'], accent: 'white' },
  { id: 'lamp-lantern', name: 'Lantern', slot: 'lamp', price: 300, colors: ['black', 'gold', 'forest', 'red'] },
  { id: 'lamp-candles', name: 'Candle Cluster', slot: 'lamp', price: 200, colors: ['cream', 'blush', 'lavender', 'white'] },
  // Wall decor
  { id: 'wd-frame', name: 'Landscape Painting', slot: 'wallDecor', price: 150, colors: ['gold', 'brown', 'white', 'black'], everyday: true },
  { id: 'wd-mirror', name: 'Round Mirror', slot: 'wallDecor', price: 250, colors: ['gold', 'tan', 'white', 'rose'] },
  { id: 'wd-clock', name: 'Wall Clock', slot: 'wallDecor', price: 250, colors: ['red', 'sky', 'mint', 'mustard', 'white'] },
  { id: 'wd-pennant', name: 'Pennant', slot: 'wallDecor', price: 150, colors: ['red', 'navy', 'green', 'purple', 'orange'], accent: 'white' },
  { id: 'wd-wreath', name: 'Wreath', slot: 'wallDecor', price: 300, colors: ['green', 'forest', 'sage'], accent: 'red' },
  { id: 'wd-shelf', name: 'Wall Shelf', slot: 'wallDecor', price: 250, colors: WOOD, accent: 'green' },
  { id: 'wd-poster', name: 'Star Poster', slot: 'wallDecor', price: 200, colors: ['navy', 'purple', 'teal', 'plum'], accent: 'yellow' },
  { id: 'wd-cuckoo', name: 'Cuckoo Clock', slot: 'wallDecor', price: 500, colors: ['brown', 'forest', 'red'], accent: 'cream', rare: true },
  // Plant
  { id: 'pl-fern', name: 'Potted Fern', slot: 'plant', price: 100, colors: ['coral', 'white', 'sky', 'mustard', 'tan', 'charcoal'], everyday: true },
  { id: 'pl-cactus', name: 'Cactus', slot: 'plant', price: 200, colors: ['coral', 'white', 'mustard', 'sky'] },
  { id: 'pl-monstera', name: 'Monstera', slot: 'plant', price: 350, colors: ['white', 'charcoal', 'tan', 'blush'] },
  { id: 'pl-flowers', name: 'Flower Pot', slot: 'plant', price: 250, colors: ['pink', 'yellow', 'purple', 'red', 'white'], accent: 'tan' },
  { id: 'pl-sunflower', name: 'Sunflowers', slot: 'plant', price: 300, colors: ['sky', 'white', 'tan'] },
  { id: 'pl-lemon', name: 'Lemon Tree', slot: 'plant', price: 500, colors: ['white', 'coral', 'tan'], rare: true },
  { id: 'pl-bonsai', name: 'Bonsai', slot: 'plant', price: 450, colors: ['navy', 'charcoal', 'tan'] },
  // Toys
  { id: 'toy-teddy', name: 'Teddy Bear', slot: 'toy', price: 200, colors: ['brown', 'tan', 'white', 'pink'], accent: 'red', everyday: true },
  { id: 'toy-ball', name: 'Beach Ball', slot: 'toy', price: 100, colors: ['red', 'blue', 'yellow', 'green'], accent: 'white' },
  { id: 'toy-books', name: 'Book Stack', slot: 'toy', price: 150, colors: ['red', 'navy', 'green', 'mustard'], accent: 'cream' },
  { id: 'toy-globe', name: 'Globe', slot: 'toy', price: 300, colors: ['sky', 'teal', 'navy'], accent: 'gold' },
  { id: 'toy-beanbag', name: 'Beanbag', slot: 'toy', price: 300, colors: ['orange', 'purple', 'teal', 'pink', 'charcoal'] },
  { id: 'toy-guitar', name: 'Guitar', slot: 'toy', price: 400, colors: ['orange', 'red', 'black', 'sky'], accent: 'tan' },
  { id: 'toy-fishbowl', name: 'Fishbowl', slot: 'toy', price: 350, colors: ['orange', 'yellow', 'blue'] },
  { id: 'toy-telescope', name: 'Telescope', slot: 'toy', price: 500, colors: ['navy', 'gold', 'white'], rare: true },
  { id: 'toy-blocks', name: 'Toy Blocks', slot: 'toy', price: 150, colors: ['red', 'blue', 'yellow'] },
  // Ceiling
  { id: 'ce-garland', name: 'Leaf Garland', slot: 'ceiling', price: 200, colors: ['green', 'sage', 'orange'] },
  { id: 'ce-bunting', name: 'Bunting', slot: 'ceiling', price: 200, colors: ['red', 'blue', 'pink', 'yellow', 'green'], accent: 'white', everyday: true },
  { id: 'ce-lights', name: 'String Lights', slot: 'ceiling', price: 300, colors: ['yellow', 'pink', 'sky', 'white'] },
  { id: 'ce-lanterns', name: 'Paper Lanterns', slot: 'ceiling', price: 300, colors: ['red', 'pink', 'white', 'orange'] },
  { id: 'ce-mobile', name: 'Star Mobile', slot: 'ceiling', price: 350, colors: ['yellow', 'silver', 'lavender'] },
  { id: 'ce-disco', name: 'Disco Ball', slot: 'ceiling', price: 500, colors: ['silver', 'gold', 'pink'], rare: true },
  { id: 'ce-plant', name: 'Hanging Plant', slot: 'ceiling', price: 300, colors: ['white', 'tan', 'coral'] },
];

export const STARTER_ROOM = {
  wallpaper: 'wp-plain:cream',
  floor: 'fl-planks:tan',
  window: 'win-curtain:sage',
  door: 'door-plain:brown',
  bed: 'bed-simple:sky',
  rug: 'rug-round:blush',
  lamp: 'lamp-floor:mustard',
} as const;

export const SLOT_LABELS: Record<string, string> = {
  head: 'Hats',
  eyes: 'Eyewear',
  neck: 'Neckwear',
  body: 'Tops',
  back: 'Back',
  wallpaper: 'Wallpaper',
  floor: 'Floor',
  window: 'Window',
  door: 'Door',
  bed: 'Bed',
  dresser: 'Furniture',
  rug: 'Rug',
  doormat: 'Doormat',
  lamp: 'Lamp',
  wallDecor: 'Wall art',
  plant: 'Plant',
  toy: 'Toy',
  ceiling: 'Ceiling',
  body_dye: 'Body',
};

export const CLOTHING_SLOTS = ['head', 'eyes', 'neck', 'body', 'back'] as const;
export const FURNITURE_SLOTS = [
  'wallpaper',
  'floor',
  'window',
  'door',
  'bed',
  'dresser',
  'rug',
  'doormat',
  'lamp',
  'wallDecor',
  'plant',
  'toy',
  'ceiling',
] as const;
