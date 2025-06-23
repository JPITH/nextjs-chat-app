// src/lib/book-templates.ts - Version 2.0 avec prompts complets
export interface BookTemplate {
  id: string;
  name: string;
  description: string;
  genre: string;
  targetWords: number;
  emoji: string;
  fullPrompt: string; // Prompt complet qui sera envoyé automatiquement
  suggestedStructure: string[];
}

export const bookTemplates: BookTemplate[] = [
  {
    id: 'novel-fiction',
    name: 'Roman de fiction',
    description: 'Roman narratif avec personnages et intrigue développés',
    genre: 'Fiction',
    targetWords: 80000,
    emoji: '📖',
    fullPrompt: `Bonjour ! Je veux écrire un roman de fiction et j'aimerais votre aide en tant qu'assistant d'écriture spécialisé.

Voici ce que j'aimerais créer :
- Un roman de fiction d'environ 80 000 mots
- Une histoire captivante avec des personnages développés
- Une intrigue bien structurée

Pouvez-vous m'aider à :
1. Développer une idée centrale pour mon roman
2. Créer des personnages principaux tridimensionnels
3. Établir l'univers et le contexte de l'histoire
4. Structurer l'intrigue en 3 actes
5. Planifier les chapitres

En tant qu'expert en romans de fiction, guidez-moi étape par étape. Commençons par explorer quelques idées de base pour mon histoire. Que suggérez-vous comme première étape ?`,
    suggestedStructure: [
      "Développement de l'idée principale",
      "Création des personnages principaux", 
      "Établissement de l'univers/contexte",
      "Structure de l'intrigue (3 actes)",
      "Écriture chapitre par chapitre",
      "Révision et peaufinage"
    ]
  },
  {
    id: 'short-story',
    name: 'Nouvelle',
    description: 'Histoire courte et percutante avec un point culminant fort',
    genre: 'Fiction courte',
    targetWords: 5000,
    emoji: '📝',
    fullPrompt: `Salut ! Je veux écrire une nouvelle impactante d'environ 5000 mots et j'ai besoin de votre expertise.

Mon objectif :
- Créer une histoire courte mais mémorable
- Avoir un impact émotionnel fort sur le lecteur
- Construire vers une chute ou révélation marquante
- Maîtriser l'art de l'économie de mots

En tant que spécialiste des nouvelles, aidez-moi à :
1. Trouver un concept central puissant
2. Créer un personnage principal attachant rapidement
3. Établir le conflit en quelques lignes
4. Construire la tension narrative
5. Préparer une chute efficace

L'art de la nouvelle, c'est dire beaucoup avec peu. Comment commencer ? Avez-vous des techniques pour créer un impact immédiat dès les premières lignes ?`,
    suggestedStructure: [
      "Concept central de la nouvelle",
      "Personnage principal et conflit",
      "Mise en situation rapide",
      "Développement de la tension",
      "Climax et résolution",
      "Peaufinage du style"
    ]
  },
  {
    id: 'memoir',
    name: 'Mémoires/Autobiographie',
    description: 'Récit personnel de vie, expériences marquantes',
    genre: 'Non-fiction',
    targetWords: 60000,
    emoji: '👤',
    fullPrompt: `Bonjour ! Je souhaite écrire mes mémoires ou raconter une période importante de ma vie dans un livre d'environ 60 000 mots.

Ce que je veux accomplir :
- Partager mon histoire personnelle de manière authentique
- Transformer mes souvenirs en récit captivant
- Transmettre mes apprentissages et réflexions
- Créer un livre qui résonne avec les lecteurs

J'ai besoin de votre aide pour :
1. Identifier la période ou le thème central à raconter
2. Structurer chronologiquement mes souvenirs
3. Trouver le bon équilibre entre anecdotes et réflexions
4. Donner de la profondeur aux personnages de ma vie
5. Créer une progression narrative même dans du vécu

Comment fait-on pour transformer des souvenirs parfois fragmentés en un récit cohérent et engageant ? Par quoi commencer ?`,
    suggestedStructure: [
      "Période/thème principal à raconter",
      "Chronologie des événements clés",
      "Personnages importants de cette période",
      "Réflexions et apprentissages",
      "Écriture des chapitres par période",
      "Ajout de perspectives actuelles"
    ]
  },
  {
    id: 'self-help',
    name: 'Développement personnel',
    description: 'Guide pratique pour aider les lecteurs à s\'améliorer',
    genre: 'Développement personnel',
    targetWords: 50000,
    emoji: '🌱',
    fullPrompt: `Salut ! Je veux créer un livre de développement personnel d'environ 50 000 mots pour vraiment aider les gens à transformer leur vie.

Mon objectif :
- Créer un guide pratique et actionnable
- Inspirer et motiver les lecteurs
- Proposer des exercices concrets
- Partager des méthodes qui fonctionnent vraiment

Domaines d'expertise possibles : [confiance en soi, productivité, relations, carrière, bien-être, habitudes, mindset, etc.]

Aidez-moi à :
1. Identifier le problème spécifique que je veux résoudre
2. Développer une méthode ou approche unique
3. Créer des étapes pratiques et des exercices
4. Structurer le contenu de manière progressive
5. Inclure des témoignages et exemples concrets

Un bon livre de développement personnel change vraiment des vies. Comment puis-je m'assurer que le mien aura cet impact ? Commençons par définir le domaine où je veux aider les gens.`,
    suggestedStructure: [
      "Identification du problème à résoudre",
      "Méthode ou approche proposée",
      "Étapes pratiques et exercices",
      "Témoignages et exemples",
      "Plan d'action pour le lecteur",
      "Ressources complémentaires"
    ]
  },
  {
    id: 'business-book',
    name: 'Livre business/entrepreneuriat',
    description: 'Partage d\'expertise professionnelle et conseils business',
    genre: 'Business',
    targetWords: 55000,
    emoji: '💼',
    fullPrompt: `Bonjour ! Je veux partager mon expertise professionnelle dans un livre business d'environ 55 000 mots qui apportera une vraie valeur aux entrepreneurs et professionnels.

Mon objectif :
- Transmettre mes connaissances et expérience terrain
- Créer des frameworks pratiques et réutilisables
- Aider d'autres entrepreneurs à éviter mes erreurs
- Établir ma crédibilité dans mon domaine

Domaines possibles : [marketing, vente, management, finance, startups, transformation digitale, leadership, etc.]

J'ai besoin de votre aide pour :
1. Structurer mon expertise en contenu actionnable
2. Créer des méthodologies claires et applicables
3. Intégrer des études de cas et exemples concrets
4. Développer des outils pratiques pour les lecteurs
5. Rendre le contenu accessible sans simplifier à l'excès

Un bon livre business doit équilibrer théorie, pratique et storytelling. Comment transformer mon expérience en valeur pour d'autres entrepreneurs ? Commençons par identifier mon domaine d'expertise unique.`,
    suggestedStructure: [
      "Expertise et crédibilité de l'auteur",
      "Problématiques business abordées",
      "Frameworks et méthodologies",
      "Études de cas et exemples concrets",
      "Outils et ressources pratiques",
      "Plan d'implémentation"
    ]
  },
  {
    id: 'mystery-thriller',
    name: 'Thriller/Polar',
    description: 'Roman à suspense avec enquête et révélations progressives',
    genre: 'Thriller',
    targetWords: 75000,
    emoji: '🔍',
    fullPrompt: `Salut ! Je veux écrire un thriller captivant d'environ 75 000 mots qui tiendra les lecteurs en haleine du début à la fin.

Mon ambition :
- Créer une intrigue solide et crédible
- Maintenir le suspense à chaque chapitre
- Développer un enquêteur/protagoniste mémorable
- Maîtriser l'art des indices et fausses pistes
- Construire vers un climax explosif

Types possibles : [polar urbain, thriller psychologique, enquête criminelle, suspense paranormal, etc.]

Aidez-moi à :
1. Créer le crime ou mystère central de l'histoire
2. Développer mon protagoniste enquêteur
3. Construire un système d'indices cohérent
4. Gérer les révélations et plot twists
5. Maintenir la tension narrative constante

L'art du thriller, c'est de garder le lecteur sur le fil du rasoir. Comment créer cette tension addictive ? Commençons par le mystère central - avez-vous des idées pour un crime intriguant ?`,
    suggestedStructure: [
      "Crime ou mystère central",
      "Protagoniste enquêteur",
      "Mise en place des indices",
      "Développement de l'enquête",
      "Fausses pistes et révélations",
      "Climax et résolution"
    ]
  },
  {
    id: 'fantasy-novel',
    name: 'Roman de fantasy',
    description: 'Univers fantastique avec magie, créatures et aventures épiques',
    genre: 'Fantasy',
    targetWords: 90000,
    emoji: '🏰',
    fullPrompt: `Bonjour ! Je rêve de créer un univers de fantasy épique d'environ 90 000 mots avec un monde riche, de la magie, et une aventure inoubliable.

Ma vision :
- Construire un monde fantastique cohérent et immersif
- Créer un système de magie original et logique
- Développer des personnages héroïques attachants
- Raconter une quête épique avec de vrais enjeux
- Intégrer créatures mystiques et civilisations fantastiques

Sous-genres possibles : [high fantasy, urban fantasy, dark fantasy, fantasy épique, etc.]

J'ai besoin de votre expertise pour :
1. Construire les règles et géographie de mon monde
2. Développer un système de magie cohérent
3. Créer le héros et sa quête principale
4. Concevoir les antagonistes et obstacles
5. Équilibrer action, développement de personnages et world-building

La fantasy permet tout, mais paradoxalement demande beaucoup de cohérence. Comment créer un monde à la fois original et crédible ? Commençons par l'univers - quel type de monde fantasy m'inspire ?`,
    suggestedStructure: [
      "Monde fantastique et ses règles",
      "Système de magie et créatures",
      "Héros et sa quête principale",
      "Alliés, ennemis et obstacles",
      "Aventures et défis progressifs",
      "Bataille finale et résolution épique"
    ]
  },
  {
    id: 'children-book',
    name: 'Livre pour enfants',
    description: 'Histoire adaptée aux jeunes lecteurs avec message positif',
    genre: 'Jeunesse',
    targetWords: 3000,
    emoji: '🧸',
    fullPrompt: `Salut ! Je veux créer un livre pour enfants d'environ 3000 mots qui va les captiver tout en leur transmettant de belles valeurs.

Mon objectif :
- Raconter une histoire que les enfants adorent
- Transmettre des valeurs positives naturellement
- Utiliser un vocabulaire adapté à l'âge
- Créer des personnages attachants et relatable
- Stimuler l'imagination et la créativité

Tranches d'âge possibles : [3-5 ans, 6-8 ans, 9-12 ans]
Thèmes possibles : [amitié, courage, différence, famille, environnement, confiance en soi, etc.]

Aidez-moi à :
1. Choisir la tranche d'âge et adapter le style
2. Créer des personnages que les enfants aiment
3. Développer une histoire simple mais engageante
4. Intégrer le message éducatif avec subtilité
5. Prévoir les descriptions pour les illustrations

Les enfants sont un public exigeant - ils sentent tout de suite si c'est authentique. Comment créer une histoire qui les transporte vraiment ? Commençons par définir l'âge des lecteurs et le message que je veux transmettre.`,
    suggestedStructure: [
      "Âge cible et niveau de lecture",
      "Personnages attachants et relatable",
      "Message ou valeur à transmettre",
      "Aventure ou conflit adapté à l'âge",
      "Résolution positive et apprentissage",
      "Éléments visuels et descriptions"
    ]
  },
  {
    id: 'travel-book',
    name: 'Récit de voyage',
    description: 'Carnet de voyage mêlant découvertes et réflexions personnelles',
    genre: 'Récit de voyage',
    targetWords: 45000,
    emoji: '🗺️',
    fullPrompt: `Bonjour ! Je veux transformer mes expériences de voyage en un récit captivant d'environ 45 000 mots qui fera voyager les lecteurs depuis leur salon.

Ma vision :
- Partager mes découvertes et aventures authentiquement  
- Mélanger descriptions vivantes et réflexions personnelles
- Transmettre la magie des rencontres culturelles
- Inspirer d'autres à voyager ou voir le monde différemment
- Créer un livre qu'on a envie de dévorer

Destinations possibles : [pays spécifique, tour du monde, pèlerinage, voyage intérieur, exploration urbaine, etc.]

Votre aide me sera précieuse pour :
1. Structurer mes souvenirs de voyage en récit cohérent
2. Équilibrer anecdotes, descriptions et réflexions
3. Donner vie aux lieux et aux rencontres
4. Transmettre l'émotion et la transformation personnelle
5. Créer un fil conducteur au-delà de la chronologie

Un bon récit de voyage ne raconte pas juste "ce qui s'est passé" mais transforme le lecteur. Comment faire vivre mes aventures sur papier ? Commençons par le voyage qui m'a le plus marqué.`,
    suggestedStructure: [
      "Destination(s) et contexte du voyage",
      "Préparatifs et attentes",
      "Découvertes et premières impressions",
      "Rencontres et échanges culturels",
      "Défis et apprentissages du voyage",
      "Retour et transformation personnelle"
    ]
  },
  {
    id: 'cookbook',
    name: 'Livre de cuisine',
    description: 'Collection de recettes avec histoire et conseils culinaires',
    genre: 'Gastronomie',
    targetWords: 35000,
    emoji: '👨‍🍳',
    fullPrompt: `Salut ! Je veux créer un livre de cuisine d'environ 35 000 mots qui ne soit pas qu'un simple recueil de recettes, mais qui raconte une histoire culinaire.

Mon approche :
- Partager mes recettes favorites avec leur histoire
- Transmettre ma passion pour la cuisine
- Donner des conseils pratiques et astuces de chef
- Créer un livre qu'on lit autant qu'on utilise
- Mélanger technique culinaire et storytelling

Styles possibles : [cuisine familiale, cuisine du monde, pâtisserie, cuisine healthy, street food, cuisine de saison, etc.]

J'aimerais votre aide pour :
1. Définir mon style culinaire et philosophie
2. Structurer les recettes par thèmes cohérents
3. Raconter l'histoire derrière chaque plat
4. Intégrer conseils techniques et astuces
5. Créer des menus et associations de saveurs

Un livre de cuisine réussi donne envie de cuisiner ET de lire. Comment transformer mes recettes en expérience complète ? Commençons par identifier ma signature culinaire unique.`,
    suggestedStructure: [
      "Philosophie culinaire et approche",
      "Recettes de base et techniques fondamentales",
      "Recettes par catégorie ou saison",
      "Histoires et anecdotes culinaires",
      "Conseils et astuces de chef",
      "Menus et occasions spéciales"
    ]
  },
  {
    id: 'poetry-collection',
    name: 'Recueil de poésie',
    description: 'Collection de poèmes autour d\'un thème ou d\'une émotion',
    genre: 'Poésie',
    targetWords: 15000,
    emoji: '🎭',
    fullPrompt: `Bonjour ! Je ressens le besoin de créer un recueil de poésie d'environ 15 000 mots qui touchera les âmes et explorera les profondeurs de l'émotion humaine.

Ma vision poétique :
- Explorer un thème central qui me passionne
- Créer une progression émotionnelle dans le recueil
- Développer ma voix poétique unique
- Jouer avec les formes, rythmes et sonorités
- Toucher les lecteurs au cœur

Thèmes possibles : [amour, perte, nature, identité, société, spiritualité, transformation, mémoire, etc.]
Styles possibles : [vers libre, sonnets, haïkus, prose poétique, slam, etc.]

Aidez-moi à :
1. Identifier le thème central fédérateur
2. Explorer les émotions et images associées
3. Expérimenter différentes formes poétiques
4. Organiser les poèmes en progression cohérente
5. Affiner le rythme et la musicalité

La poésie, c'est l'art de dire l'ineffable avec précision. Comment transformer mes émotions en vers qui résonnent universellement ? Explorons ensemble le thème qui me hante et demande à s'exprimer.`,
    suggestedStructure: [
      "Thème central du recueil",
      "Exploration des émotions et images",
      "Différents styles et formes poétiques",
      "Organisation thématique des poèmes",
      "Travail sur le rythme et la sonorité",
      "Cohérence et progression du recueil"
    ]
  },
  {
    id: 'essay-book',
    name: 'Essai thématique',
    description: 'Exploration approfondie d\'un sujet, argumentation construite',
    genre: 'Essai',
    targetWords: 40000,
    emoji: '🤔',
    fullPrompt: `Bonjour ! Je veux écrire un essai approfondi d'environ 40 000 mots sur un sujet qui me passionne et qui mérite d'être exploré avec rigueur et créativité.

Mon ambition :
- Apporter un éclairage nouveau sur un sujet important
- Développer une argumentation solide et nuancée
- Mélanger réflexion personnelle et recherche approfondie
- Rendre accessible des idées complexes
- Contribuer au débat intellectuel contemporain

Sujets possibles : [société, technologie, philosophie, art, politique, environnement, psychologie, futur, etc.]

Votre expertise m'aiderait à :
1. Définir précisément mon sujet et angle d'approche
2. Structurer ma réflexion de manière convaincante
3. Équilibrer arguments rationnels et touches personnelles
4. Intégrer exemples concrets et références pertinentes
5. Développer un style d'écriture engageant

Un bon essai ne donne pas juste des réponses, il pose les bonnes questions. Comment transformer ma passion pour un sujet en contribution intellectuelle significative ? Explorons le sujet qui m'anime vraiment.`,
    suggestedStructure: [
      "Définition du sujet et angle d'approche",
      "Recherche et collecte d'arguments",
      "Plan détaillé de l'argumentation",
      "Développement chapitre par chapitre",
      "Exemples et illustrations",
      "Conclusion et synthèse"
    ]
  }
];

// Fonctions utilitaires mises à jour
export const getTemplateById = (id: string): BookTemplate | undefined => {
  return bookTemplates.find(template => template.id === id);
};

export const getTemplatesByGenre = (genre: string): BookTemplate[] => {
  return bookTemplates.filter(template => template.genre === genre);
};

export const getAllGenres = (): string[] => {
  return [...new Set(bookTemplates.map(template => template.genre))];
};

// Fonction pour envoyer le prompt initial d'un template
export const sendTemplateInitialPrompt = async (
  templateId: string, 
  bookId: string, 
  userId: string,
  webhookFunction: (bookId: string, message: string, userId: string) => Promise<void>
) => {
  const template = getTemplateById(templateId);
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  // Envoyer le prompt complet
  await webhookFunction(bookId, template.fullPrompt, userId);
  
  return template;
};