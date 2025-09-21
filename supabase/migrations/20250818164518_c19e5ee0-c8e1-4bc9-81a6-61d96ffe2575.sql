-- Criar tabela de espécies de dinossauros
CREATE TABLE public.dinosaur_species2 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  scientific_name TEXT NOT NULL,
  period TEXT NOT NULL,
  diet TEXT NOT NULL CHECK (diet IN ('carnivorous', 'herbivorous', 'omnivorous')),
  size_length DECIMAL(5,2),
  size_height DECIMAL(5,2),
  size_weight DECIMAL(8,2),
  habitat TEXT,
  description TEXT,
  fun_facts TEXT[],
  image_url TEXT,
  discovered_year INTEGER,
  discovered_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de descobertas arqueológicas
CREATE TABLE public.archaeological_discoveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discovery_date DATE NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  organization TEXT,
  researcher_name TEXT,
  significance TEXT,
  species_id UUID REFERENCES public.dinosaur_species2(id),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de perguntas do quiz
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  wrong_answers TEXT[] NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  species_id UUID REFERENCES public.dinosaur_species2(id),
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'researcher', 'educator', 'user')),
  avatar_url TEXT,
  bio TEXT,
  organization TEXT,
  quiz_scores JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.dinosaur_species2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archaeological_discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para espécies de dinossauros (leitura pública, escrita apenas para admins)
CREATE POLICY "Espécies são visíveis para todos" 
ON public.dinosaur_species2 
FOR SELECT 
USING (true);

CREATE POLICY "Apenas admins podem inserir espécies" 
ON public.dinosaur_species2 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Apenas admins podem atualizar espécies" 
ON public.dinosaur_species2 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Políticas para descobertas arqueológicas
CREATE POLICY "Descobertas são visíveis para todos" 
ON public.archaeological_discoveries 
FOR SELECT 
USING (true);

CREATE POLICY "Admins e pesquisadores podem inserir descobertas" 
ON public.archaeological_discoveries 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'researcher')
));

CREATE POLICY "Admins e pesquisadores podem atualizar descobertas" 
ON public.archaeological_discoveries 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'researcher')
));

-- Políticas para perguntas do quiz
CREATE POLICY "Perguntas são visíveis para usuários autenticados" 
ON public.quiz_questions 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Apenas admins e educadores podem gerenciar perguntas" 
ON public.quiz_questions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role IN ('admin', 'educator')
));

-- Políticas para perfis
CREATE POLICY "Perfis são visíveis para todos" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Usuários podem criar seu próprio perfil" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar timestamps
CREATE TRIGGER update_dinosaur_species2_updated_at
  BEFORE UPDATE ON public.dinosaur_species2
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_archaeological_discoveries_updated_at
  BEFORE UPDATE ON public.archaeological_discoveries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir dados de exemplo
INSERT INTO public.dinosaur_species2 (name, scientific_name, period, diet, size_length, size_height, size_weight, habitat, description, fun_facts, discovered_year, discovered_location) VALUES
('Tyrannosaurus Rex', 'Tyrannosaurus rex', 'Cretaceous', 'carnivorous', 12.30, 3.60, 7000.00, 'Forests and plains', 'One of the largest land predators of all time, T. Rex was a apex predator with massive jaws and teeth.', ARRAY['Had teeth up to 20cm long', 'Could bite with a force of 12,800 pounds', 'Had tiny arms but they were very strong'], 1905, 'Montana, USA'),
('Triceratops', 'Triceratops horridus', 'Cretaceous', 'herbivorous', 9.00, 3.00, 5400.00, 'Plains and forests', 'Large herbivorous dinosaur with three distinctive horns and a large bony frill.', ARRAY['Had over 800 small teeth for grinding plants', 'The frill could be up to 2 meters wide', 'Lived in herds for protection'], 1889, 'Colorado, USA'),
('Velociraptor', 'Velociraptor mongoliensis', 'Cretaceous', 'carnivorous', 2.07, 0.50, 20.00, 'Deserts and plains', 'Small but intelligent predator known for its speed and pack hunting behavior.', ARRAY['Could run up to 40 km/h', 'Had a large curved claw on each foot', 'Was actually covered in feathers'], 1924, 'Mongolia'),
('Brachiosaurus', 'Brachiosaurus altithorax', 'Jurassic', 'herbivorous', 26.00, 12.00, 28000.00, 'Forests and plains', 'Massive long-necked dinosaur that could reach high vegetation other dinosaurs could not access.', ARRAY['Could reach heights of 12-13 meters', 'Had nostrils on top of its head', 'Its front legs were longer than back legs'], 1903, 'Colorado, USA'),
('Stegosaurus', 'Stegosaurus stenops', 'Jurassic', 'herbivorous', 9.00, 4.00, 2300.00, 'Plains and forests', 'Herbivorous dinosaur famous for its double row of plates along its back and spikes on its tail.', ARRAY['Had a brain the size of a walnut', 'The plates may have been used for temperature regulation', 'The tail spikes were called a thagomizer'], 1877, 'Colorado, USA');

INSERT INTO public.archaeological_discoveries (title, description, discovery_date, location, latitude, longitude, organization, researcher_name, significance) VALUES
('Sue the T. Rex Discovery', 'Discovery of the most complete T. Rex skeleton ever found, nicknamed Sue after the discoverer.', '1990-08-12', 'South Dakota, USA', 44.0805, -103.2310, 'Field Museum of Natural History', 'Sue Hendrickson', 'Provided unprecedented insights into T. Rex anatomy and behavior'),
('Fighting Dinosaurs Fossil', 'Remarkable fossil showing a Velociraptor and Protoceratops locked in combat, preserved for 80 million years.', '1971-07-09', 'Gobi Desert, Mongolia', 43.0000, 104.0000, 'Polish-Mongolian Paleontological Expedition', 'Kielan-Jaworowska', 'Demonstrates predator-prey relationships in the Cretaceous period'),
('Maiasaura Nesting Grounds', 'Discovery of the first dinosaur nesting site, revealing parental care behavior in dinosaurs.', '1978-06-15', 'Montana, USA', 47.7511, -111.7910, 'Museum of the Rockies', 'Jack Horner', 'Revolutionized understanding of dinosaur behavior and parental care'),
('Bonatitan Remains', 'Discovery of a complete sauropod skeleton in Patagonia, providing insights into South American dinosaurs.', '2004-03-22', 'Patagonia, Argentina', -41.1335, -71.3103, 'Argentine Museum of Natural Sciences', 'Pablo Puerta', 'Enhanced understanding of sauropod diversity in South America');

INSERT INTO public.quiz_questions (question, correct_answer, wrong_answers, difficulty, explanation) VALUES
('What does the name "Tyrannosaurus Rex" mean?', 'King of the tyrant lizards', ARRAY['Giant meat eater', 'Terrible thunder lizard', 'Royal beast'], 'easy', 'Tyrannosaurus means "tyrant lizard" and Rex means "king" in Latin.'),
('In which geological period did most dinosaurs live?', 'Mesozoic Era', ARRAY['Paleozoic Era', 'Cenozoic Era', 'Precambrian Era'], 'medium', 'The Mesozoic Era (252-66 million years ago) is known as the "Age of Dinosaurs".'),
('What is the study of fossils called?', 'Paleontology', ARRAY['Archaeology', 'Geology', 'Anthropology'], 'easy', 'Paleontology is the scientific study of life that existed prior to recorded history through fossils.'),
('Which dinosaur had the longest neck relative to its body size?', 'Mamenchisaurus', ARRAY['Brachiosaurus', 'Diplodocus', 'Apatosaurus'], 'hard', 'Mamenchisaurus had a neck that could reach up to 15 meters long, about half its total body length.');