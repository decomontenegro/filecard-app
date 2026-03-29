-- =============================================================
-- SEED: filecard.app — GI Joe ARAH catalog
-- =============================================================

-- Categories
INSERT INTO categories (id, name, slug, sort_order) VALUES
  (1, 'Action Figures', 'action-figures', 1),
  (2, 'Veículos', 'veiculos', 2),
  (3, 'Acessórios', 'acessorios', 3)
ON CONFLICT (slug) DO NOTHING;

-- Brands
INSERT INTO brands (id, name, slug, country_code) VALUES
  (1, 'Hasbro', 'hasbro', 'US'),
  (2, 'Estrela', 'estrela', 'BR')
ON CONFLICT (slug) DO NOTHING;

-- Franchises
INSERT INTO franchises (id, name, slug, description) VALUES
  (1, 'GI Joe', 'gi-joe', 'A Real American Hero — linha de action figures militares da Hasbro (1982-1994)'),
  (2, 'Transformers', 'transformers', 'Robôs em transformação da Hasbro')
ON CONFLICT (slug) DO NOTHING;

-- Product Lines
INSERT INTO product_lines (id, category_id, franchise_id, brand_id, name, slug, start_year, end_year, description) VALUES
  (1, 1, 1, 1, 'GI Joe ARAH', 'gi-joe-arah', 1982, 1994, 'A Real American Hero — série clássica de 3¾ polegadas'),
  (2, 2, 1, 1, 'GI Joe ARAH Veículos', 'gi-joe-arah-veiculos', 1982, 1994, 'Veículos da linha ARAH')
ON CONFLICT (slug) DO NOTHING;

-- ─── CATALOG ITEMS — Heróis ───────────────────────────────────────────────────
INSERT INTO catalog_items (product_line_id, canonical_name, display_name, slug, reference_code, year, era, description, rarity_level, market_value_brl, image_url, status) VALUES

-- 1982
(1, 'Grunt', 'Grunt', 'grunt-1982', 'GJ001', 1982, 'ARAH', 'Robert W. Graves. Primeira versão do soldado de infantaria. Veio com metralhadora M32. Peça de abertura da linha.', 4, 180.00, 'https://www.yojoe.com/action/82/grunt3.jpg', 'active'),
(1, 'Snake Eyes', 'Snake Eyes', 'snake-eyes-1982', 'GJ002', 1982, 'ARAH', 'Commando de elite todo de preto, sem rosto, sem fala. O personagem mais icônico da linha. Versão 1982 é a mais rara e valorizada.', 5, 650.00, NULL, 'active'),
(1, 'Scarlett', 'Scarlett', 'scarlett-1982', 'GJ003', 1982, 'ARAH', 'Shana M. O''Hara. Contraintelligência. Única mulher da formação original. Veio com besta.', 4, 220.00, NULL, 'active'),
(1, 'Breaker', 'Breaker', 'breaker-1982', 'GJ004', 1982, 'ARAH', 'Alvin R. Kibbey. Operador de comunicações. Sempre mastigando chiclete. Visor característico.', 3, 160.00, NULL, 'active'),
(1, 'Short-Fuze', 'Short-Fuze', 'short-fuze-1982', 'GJ005', 1982, 'ARAH', 'Eric W. Freistadt. Especialista em morteiros. Armadura leve e mochila com morteiro.', 3, 150.00, NULL, 'active'),
(1, 'Rock ''N'' Roll', 'Rock ''N'' Roll', 'rock-n-roll-1982', 'GJ006', 1982, 'ARAH', 'Craig S. McConnel. Artilheiro pesado com metralhadora M60. Cabelo loiro característico.', 3, 155.00, NULL, 'active'),
(1, 'Flash', 'Flash', 'flash-1982', 'GJ007', 1982, 'ARAH', 'Anthony S. Gambello. Especialista em laser. Armadura protetora laranja característica.', 3, 170.00, NULL, 'active'),
(1, 'Zap', 'Zap', 'zap-1982', 'GJ008', 1982, 'ARAH', 'Rafael J. Melendez. Anti-tanque com bazuca. Um dos primeiros soldados hispânicos da linha.', 3, 155.00, NULL, 'active'),
(1, 'Snake Eyes', 'Snake Eyes v2', 'snake-eyes-1985', 'GJ002B', 1985, 'ARAH', 'Segunda versão do Snake Eyes — visor vermelho, ombreira, Timber o lobo. Uma das figuras mais populares de toda a linha.', 4, 320.00, NULL, 'active'),

-- COBRA (vilões)
(1, 'Cobra Commander', 'Cobra Commander', 'cobra-commander-1982', 'CB001', 1982, 'ARAH', 'Líder supremo da Cobra. Versão com capuz 1982. Extremamente raro completo. Vilão principal da linha.', 5, 480.00, NULL, 'active'),
(1, 'Destro', 'Destro', 'destro-1983', 'CB002', 1983, 'ARAH', 'James McCullen Destro XXIV. Fornecedor de armas da Cobra. Máscara de metal cromada icônica. Versão 1983.', 4, 280.00, NULL, 'active'),
(1, 'Major Bludd', 'Major Bludd', 'major-bludd-1983', 'CB003', 1983, 'ARAH', 'Sebastian Bludd. Mercenário australiano da Cobra. Braço mecânico característico.', 4, 240.00, NULL, 'active'),
(1, 'Baroness', 'Baroness', 'baroness-1984', 'CB004', 1984, 'ARAH', 'Anastasia DeCobray. Espionagem e terrorismo. Óculos e cabelo preto longo. Uma das favoritas dos colecionadores.', 5, 420.00, NULL, 'active'),
(1, 'Storm Shadow', 'Storm Shadow', 'storm-shadow-1984', 'CB005', 1984, 'ARAH', 'Thomas S. Arashikage. Ninja da Cobra. Uniforme branco com arco e flechas. Um dos personagens mais populares da linha.', 5, 380.00, NULL, 'active'),
(1, 'Zartan', 'Zartan', 'zartan-1984', 'CB006', 1984, 'ARAH', 'Mestre do disfarce e líder dos Dreadnoks. Pele que muda de cor com exposição à luz UV. Figura complexa e rara completa.', 5, 520.00, NULL, 'active'),

-- 1986
(1, 'Leatherneck', 'Leatherneck', 'leatherneck-1986', 'GJ020', 1986, 'ARAH', 'Wendell A. Metzger. Marine. Figura popular do ano de 1986.', 3, 140.00, NULL, 'active'),
(1, 'Lifeline', 'Lifeline', 'lifeline-1986', 'GJ021', 1986, 'ARAH', 'Edwin C. Steen. Médico de combate pacifista. Uniforme vermelho característico.', 3, 150.00, NULL, 'active'),
(1, 'Hawk', 'General Hawk', 'hawk-1986', 'GJ022', 1986, 'ARAH', 'Clayton M. Abernathy. Comandante dos GI Joe. Versão 1986 com capacete de aviador.', 4, 200.00, NULL, 'active'),
(1, 'Serpentor', 'Serpentor', 'serpentor-1986', 'CB010', 1986, 'ARAH', 'Imperador da Cobra criado a partir do DNA de grandes guerreiros históricos. Capacete de cobra e capa dourada.', 4, 280.00, NULL, 'active'),

-- 1987
(1, 'Jinx', 'Jinx', 'jinx-1987', 'GJ030', 1987, 'ARAH', 'Kim Arashikage. Apprentice ninja e agente especial. Uniforme vermelho. Personagem favorita do público feminino.', 4, 260.00, NULL, 'active'),
(1, 'Tunnel Rat', 'Tunnel Rat', 'tunnel-rat-1987', 'GJ031', 1987, 'ARAH', 'Nicky Lee. Especialista em túneis e demolição. Figura do personagem inspirado no criador da linha, Larry Hama.', 3, 160.00, NULL, 'active'),

-- 1988
(1, 'Shockwave', 'Shockwave', 'shockwave-1988', 'GJ040', 1988, 'ARAH', 'Jason A. Faria. SWAT. Uniforme azul com equipamento tático completo.', 3, 130.00, NULL, 'active'),
(1, 'Iron Grenadier', 'Iron Grenadier', 'iron-grenadier-1988', 'CB020', 1988, 'ARAH', 'Soldado de elite do Destro. Uniforme preto e dourado. Tropa de apoio para Destro.', 3, 120.00, NULL, 'active'),

-- 1989
(1, 'Snake Eyes', 'Snake Eyes v3', 'snake-eyes-1989', 'GJ002C', 1989, 'ARAH', 'Terceira versão do Snake Eyes — capacete integral com visor vermelho, dois Uzis. Uma das mais procuradas pelos colecionadores.', 4, 290.00, NULL, 'active'),
(1, 'Stalker', 'Stalker', 'stalker-1989', 'GJ041', 1989, 'ARAH', 'Lonzo R. Wilkinson. Rastreador e líder de campo. Amigo de infância do Snake Eyes. Versão repintada 1989.', 3, 140.00, NULL, 'active'),

-- 1991
(1, 'Dusty', 'Dusty', 'dusty-1991', 'GJ050', 1991, 'ARAH', 'Roland E. Pulaski. Especialista em desertos. Versão 1991 com nova pintura.', 2, 90.00, NULL, 'active'),
(1, 'Spirit', 'Spirit', 'spirit-1991', 'GJ051', 1991, 'ARAH', 'Charlie Iron-Knife. Rastreador nativo americano. Com águia Freedom. Uma das figuras mais distintas da linha.', 3, 180.00, NULL, 'active')

ON CONFLICT (slug) DO NOTHING;
