-- Adicionar mais perguntas de quiz sobre dinossauros
INSERT INTO quiz_questions (question, correct_answer, wrong_answers, difficulty, explanation) VALUES
-- Perguntas Fáceis
('Qual dinossauro é conhecido como "Rei dos Dinossauros"?', 'Tyrannosaurus Rex', ARRAY['Allosaurus', 'Velociraptor', 'Triceratops'], 'easy', 'O T-Rex é famoso por ser um dos maiores predadores terrestres que já existiram.'),
('Quantos braços tinha o Tyrannosaurus Rex?', '2', ARRAY['4', '6', '8'], 'easy', 'O T-Rex tinha braços pequenos mas musculosos, com apenas dois dedos em cada mão.'),
('Qual dinossauro tinha uma crista alongada na cabeça?', 'Parasaurolophus', ARRAY['Triceratops', 'Stegosaurus', 'Ankylosaurus'], 'easy', 'O Parasaurolophus usava sua crista oca para produzir sons e se comunicar.'),
('Os dinossauros viveram em qual era geológica?', 'Mesozóica', ARRAY['Paleozóica', 'Cenozóica', 'Pré-Cambriana'], 'easy', 'A Era Mesozóica durou aproximadamente 180 milhões de anos.'),
('Qual dinossauro tinha placas ósseas nas costas?', 'Stegosaurus', ARRAY['Triceratops', 'Diplodocus', 'Allosaurus'], 'easy', 'As placas do Stegosaurus ajudavam na regulação da temperatura corporal.'),

-- Perguntas Médias
('Qual período da Era Mesozóica foi o mais longo?', 'Jurássico', ARRAY['Triássico', 'Cretáceo', 'Permiano'], 'medium', 'O Período Jurássico durou cerca de 56 milhões de anos, de 201 a 145 milhões de anos atrás.'),
('O Allosaurus pertencia a qual grupo de dinossauros?', 'Terópodes', ARRAY['Saurópodes', 'Ornitópodes', 'Ceratopsianos'], 'medium', 'Os terópodes eram dinossauros carnívoros bípedes, incluindo todos os predadores.'),
('Qual dinossauro tinha o pescoço mais longo já descoberto?', 'Mamenchisaurus', ARRAY['Diplodocus', 'Brachiosaurus', 'Camarasaurus'], 'medium', 'O Mamenchisaurus tinha um pescoço de até 18 metros de comprimento.'),
('Em que continente foi descoberto o primeiro fóssil de Spinosaurus?', 'África', ARRAY['América do Sul', 'Ásia', 'Europa'], 'medium', 'Os primeiros fósseis de Spinosaurus foram encontrados no Egito em 1912.'),
('Qual característica distinguia o Carnotaurus de outros predadores?', 'Chifres na cabeça', ARRAY['Crista no dorso', 'Garras enormes', 'Cauda em forma de clube'], 'medium', 'O nome Carnotaurus significa "touro carnívoro" devido aos seus chifres frontais.'),

-- Perguntas Difíceis
('Qual dinossauro é considerado o maior predador aquático conhecido?', 'Spinosaurus', ARRAY['Carcharodontosaurus', 'Giganotosaurus', 'Tyrannosaurus Rex'], 'hard', 'Evidências recentes sugerem que o Spinosaurus era semi-aquático e pescava como um crocodilo gigante.'),
('Em que formação geológica foi descoberto o Allosaurus fragilis?', 'Formação Morrison', ARRAY['Formação Hell Creek', 'Formação Judith River', 'Formação Dinosaur Park'], 'hard', 'A Formação Morrison, nos EUA, é rica em fósseis do Jurássico Superior.'),
('Qual dinossauro tinha o maior cérebro em relação ao tamanho do corpo?', 'Troodon', ARRAY['Velociraptor', 'Deinonychus', 'Utahraptor'], 'hard', 'O Troodon tinha um cérebro proporcionalmente grande e é considerado um dos dinossauros mais inteligentes.'),
('Quantos dentes podia ter um Hadrossauro na boca ao mesmo tempo?', 'Até 1000', ARRAY['Até 100', 'Até 200', 'Até 500'], 'hard', 'Os hadrossauros tinham "baterias dentárias" com centenas de pequenos dentes para mastigar plantas.'),
('Qual dinossauro brasileiro foi descoberto na Chapada do Araripe?', 'Irritator', ARRAY['Oxalaia', 'Tapuiasaurus', 'Maxakalisaurus'], 'hard', 'O Irritator challengeri foi encontrado no Ceará e é parente do Spinosaurus.'),

-- Mais perguntas sobre os dinossauros favoritos
('Qual era a altura aproximada do Brachiosaurus?', '12-13 metros', ARRAY['8-9 metros', '15-16 metros', '20-21 metros'], 'medium', 'O Brachiosaurus era um dos dinossauros mais altos, com suas patas dianteiras mais longas que as traseiras.'),
('O Spinosaurus se alimentava principalmente de quê?', 'Peixes', ARRAY['Outros dinossauros', 'Plantas', 'Insetos'], 'medium', 'Evidências mostram que o Spinosaurus era piscívoro, adaptado para caçar peixes em rios.'),
('Em que país foram encontrados os primeiros fósseis de Allosaurus?', 'Estados Unidos', ARRAY['Argentina', 'China', 'Mongólia'], 'easy', 'O primeiro Allosaurus foi descoberto em Colorado, EUA, em 1877.'),
('Qual era a característica mais marcante do crânio do Spinosaurus?', 'Focinho alongado', ARRAY['Chifres grandes', 'Crista óssea', 'Dentes serrilhados'], 'medium', 'O focinho alongado do Spinosaurus era similar ao de um crocodilo, ideal para pescar.'),
('Quantos metros de comprimento podia atingir o Allosaurus?', '8-12 metros', ARRAY['15-18 metros', '5-7 metros', '20-25 metros'], 'easy', 'O Allosaurus era um predador de tamanho médio a grande do período Jurássico.');