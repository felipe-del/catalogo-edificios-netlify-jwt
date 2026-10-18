-- Datos iniciales - Catálogo de Edificios más Altos del Mundo
-- Fuente: imágenes profesionales y completamente distintas por registro para un catálogo pulido.

-- ===================== CIUDADES (8) =====================
INSERT INTO ciudades (nombre, pais, continente, poblacion, imagen_url) VALUES
('Dubái', 'Emiratos Árabes Unidos', 'Asia', 3400000, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80'),
('Shanghái', 'China', 'Asia', 24870000, 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80'),
('La Meca', 'Arabia Saudita', 'Asia', 2042000, 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80'),
('Shenzhen', 'China', 'Asia', 17560000, 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'),
('Seúl', 'Corea del Sur', 'Asia', 9776000, 'https://images.unsplash.com/photo-1538485399081-6451ff8e0c56?auto=format&fit=crop&w=1200&q=80'),
('Nueva York', 'Estados Unidos', 'América del Norte', 8804000, 'https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1200&q=80'),
('Hong Kong', 'China', 'Asia', 7413000, 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=1200&q=80'),
('Taipéi', 'Taiwán', 'Asia', 2646000, 'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?auto=format&fit=crop&w=1200&q=80');

-- ===================== ARQUITECTOS (6) =====================
INSERT INTO arquitectos (nombre, nacionalidad, anio_nacimiento, biografia, imagen_url) VALUES
('Adrian Smith', 'Estados Unidos', 1944, 'Arquitecto estadounidense, socio de Skidmore, Owings & Merrill (SOM) durante el diseño del Burj Khalifa y fundador posterior de AS+GG. Reconocido por sus diseños de superrascacielos.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80'),
('Jun Xia', 'Estados Unidos', 1966, 'Arquitecto principal de Gensler para la Torre de Shanghái, una de las torres retorcidas más altas del mundo, reconocida por su eficiencia energética.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80'),
('William Pedersen', 'Estados Unidos', 1938, 'Cofundador del estudio Kohn Pedersen Fox (KPF), responsable del diseño de múltiples rascacielos emblemáticos en Asia.', 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80'),
('Mahmoud Bodo Rasch', 'Alemania', 1944, 'Arquitecto alemán especializado en estructuras a gran escala en Medio Oriente, director del estudio SL Rasch responsable del complejo Abraj Al-Bait.', 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=900&q=80'),
('David Childs', 'Estados Unidos', 1941, 'Arquitecto de Skidmore, Owings & Merrill (SOM), diseñador principal del One World Trade Center en Nueva York.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80'),
('C. Y. Lee', 'Taiwán', 1938, 'Arquitecto taiwanés reconocido internacionalmente por el diseño del Taipéi 101, inspirado en la forma de un tallo de bambú.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80');

-- ===================== EDIFICIOS (12) - entidad principal =====================
-- ciudad_id y arquitecto_id referencian los registros insertados arriba (1-8 y 1-6)
INSERT INTO edificios (nombre, altura_metros, pisos, anio_finalizacion, descripcion, imagen_url, ciudad_id, arquitecto_id) VALUES
('Burj Khalifa', 828, 163, 2010, 'El edificio más alto del mundo desde su inauguración. Su diseño en espiral escalonada está inspirado en la flor del desierto Hymenocallis.', 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80', 1, 1),
('Shanghai Tower', 632, 128, 2015, 'Segundo edificio más alto del mundo, con una fachada exterior retorcida 120 grados que reduce las cargas de viento hasta en un 24%.', 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80', 2, 2),
('Abraj Al-Bait Clock Tower', 601, 120, 2012, 'También conocida como Torre del Reloj de La Meca, alberga el reloj más grande del mundo y forma parte de un complejo hotelero junto a la Mezquita Sagrada.', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', 3, 4),
('Ping An Finance Centre', 599, 115, 2017, 'Rascacielos financiero de Shenzhen que alberga el observatorio cerrado más alto del mundo en el momento de su apertura.', 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80', 4, 3),
('Lotte World Tower', 555, 123, 2017, 'El edificio más alto de Corea del Sur, cuya forma cónica está inspirada en la cerámica y caligrafía tradicionales coreanas.', 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80', 5, 3),
('One World Trade Center', 541, 94, 2014, 'Edificio principal del complejo reconstruido en el sitio del World Trade Center en Nueva York, con una altura simbólica de 1776 pies.', 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80', 6, 5),
('International Commerce Centre', 484, 108, 2010, 'El edificio más alto de Hong Kong, parte del desarrollo Union Square sobre la estación de tren de Kowloon.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80', 7, 3),
('Two International Finance Centre', 415, 88, 2003, 'Icónico rascacielos de la isla de Hong Kong, reconocible por su antena piramidal y su presencia en el horizonte de Victoria Harbour.', 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80', 7, 3),
('Taipei 101', 508, 101, 2004, 'Fue el edificio más alto del mundo entre 2004 y 2010. Su diseño en segmentos de ocho pisos evoca un tallo de bambú y símbolos de buena fortuna.', 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80', 8, 6),
('Shanghai World Financial Center', 492, 101, 2008, 'Reconocible por su abertura trapezoidal en la cima, diseñada originalmente como un círculo y modificada por razones culturales.', 'https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=1200&q=80', 2, 3),
('Jin Mao Tower', 421, 88, 1999, 'Rascacielos pionero del distrito de Pudong en Shanghái, con un diseño que combina elementos de arquitectura tradicional china tipo pagoda.', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80', 2, 1),
('Central Park Tower', 472, 98, 2020, 'El edificio residencial más alto del mundo al momento de su finalización, ubicado en la calle 57 de Manhattan frente a Central Park.', 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80', 6, 1);
