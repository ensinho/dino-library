-- Update behavior_notes with interesting descriptions for dinosaurs
UPDATE dinosaur_species2 SET behavior_notes = 
CASE 
  WHEN scientific_name ILIKE '%tyrannosaurus%' OR common_name ILIKE '%t-rex%' OR common_name ILIKE '%tyrannosaurus%' THEN 
    'One of the most fearsome predators ever to walk the Earth, T-Rex was an apex hunter with bone-crushing jaws that could exert a bite force of over 12,800 pounds per square inch. This massive theropod could grow up to 40 feet long and weighed as much as 9 tons.'
  
  WHEN scientific_name ILIKE '%allosaurus%' OR common_name ILIKE '%allosaurus%' THEN 
    'A powerful and agile predator from the Late Jurassic period, Allosaurus was known for its impressive hunting abilities and distinctive skull ridges. With sharp, serrated teeth and powerful claws, it dominated the prehistoric landscapes of North America.'
  
  WHEN scientific_name ILIKE '%spinosaurus%' OR common_name ILIKE '%spinosaurus%' THEN 
    'The largest known carnivorous dinosaur, Spinosaurus was a semi-aquatic giant with a distinctive sail-like structure on its back. This unique predator spent much of its time in water, hunting fish with its crocodile-like snout and paddle-like tail.'
  
  WHEN scientific_name ILIKE '%brachiosaurus%' OR common_name ILIKE '%brachiosaurus%' THEN 
    'A gentle giant of the Jurassic period, Brachiosaurus was one of the tallest dinosaurs ever discovered, reaching heights of up to 50 feet. With its long neck and small head, it could browse on treetops that other dinosaurs could not reach.'
  
  WHEN scientific_name ILIKE '%triceratops%' OR common_name ILIKE '%triceratops%' THEN 
    'Famous for its three distinctive facial horns and large bony frill, Triceratops was a formidable herbivore that could defend itself against even the largest predators. These social dinosaurs lived in herds and used their impressive headgear for both defense and display.'
  
  WHEN scientific_name ILIKE '%stegosaurus%' OR common_name ILIKE '%stegosaurus%' THEN 
    'Instantly recognizable by its double row of large triangular plates along its back and four sharp spikes on its tail, Stegosaurus was a unique herbivore. Despite its fearsome appearance, it had a brain the size of a walnut but was perfectly adapted for its plant-eating lifestyle.'
  
  WHEN scientific_name ILIKE '%velociraptor%' OR common_name ILIKE '%velociraptor%' THEN 
    'A cunning pack hunter with a sickle-shaped claw on each foot, Velociraptor was smaller than depicted in movies but no less deadly. These intelligent predators hunted in coordinated groups and were covered in feathers, making them more bird-like than reptilian.'
  
  WHEN scientific_name ILIKE '%diplodocus%' OR common_name ILIKE '%diplodocus%' THEN 
    'One of the longest dinosaurs ever discovered, Diplodocus could reach lengths of up to 90 feet. With its whip-like tail and incredibly long neck, this gentle giant could defend itself from predators while browsing on both high and low vegetation.'
  
  WHEN scientific_name ILIKE '%ankylosaurus%' OR common_name ILIKE '%ankylosaurus%' THEN 
    'A living tank of the Cretaceous period, Ankylosaurus was covered in thick, bony armor plates and wielded a massive club at the end of its tail. This herbivore was so well-defended that even the mighty T-Rex would think twice before attacking it.'
  
  WHEN scientific_name ILIKE '%pteranodon%' OR common_name ILIKE '%pteranodon%' THEN 
    'Though not technically a dinosaur, Pteranodon was a magnificent flying reptile with a wingspan that could reach 20 feet. These graceful gliders soared over ancient seas, diving to catch fish with their long, toothless beaks.'
  
  WHEN diet = 'Carnivore' OR diet = 'carnivore' THEN 
    'A fearsome predator of its time, this carnivorous dinosaur was equipped with sharp teeth and powerful claws designed for hunting. With keen senses and impressive speed, it dominated its prehistoric ecosystem as an apex predator.'
  
  WHEN diet = 'Herbivore' OR diet = 'herbivore' THEN 
    'A peaceful giant that roamed ancient landscapes in search of vegetation, this herbivorous dinosaur played a crucial role in its ecosystem. With specialized teeth and digestive systems, it could process tough plant material that other animals could not.'
  
  WHEN diet = 'Omnivore' OR diet = 'omnivore' THEN 
    'A versatile survivor that could adapt to various food sources, this omnivorous dinosaur had the flexibility to eat both plants and meat. This dietary adaptability made it highly successful in changing prehistoric environments.'
  
  WHEN geological_period ILIKE '%jurassic%' THEN 
    'Living during the golden age of dinosaurs, this magnificent creature roamed the lush, warm landscapes of the Jurassic period. This era was marked by abundant vegetation and diverse dinosaur species that ruled both land and sea.'
  
  WHEN geological_period ILIKE '%cretaceous%' THEN 
    'A survivor from the final chapter of the dinosaur age, this species lived during the Cretaceous period when flowering plants first appeared and dinosaur diversity reached its peak. These were the last giants before the great extinction event.'
  
  WHEN geological_period ILIKE '%triassic%' THEN 
    'An ancient pioneer from the dawn of the dinosaur age, this species lived during the Triassic period when dinosaurs first began to dominate terrestrial ecosystems. These early dinosaurs laid the foundation for millions of years of reptilian rule.'
  
  ELSE 
    'A remarkable creature from the age of dinosaurs, this species represents the incredible diversity and evolutionary success of prehistoric reptiles. Each dinosaur was uniquely adapted to its environment, showcasing millions of years of natural selection and survival.'
END
WHERE behavior_notes IS NULL OR behavior_notes = '' OR behavior_notes = 'Unknown';