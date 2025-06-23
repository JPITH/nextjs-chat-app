// src/lib/book-templates.ts
export interface BookTemplate {
    id: string;
    name: string;
    description: string;
    genre: string;
    targetWords: number;
    emoji: string;
    initialPrompt: string;
    aiSystemPrompt: string;
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
      initialPrompt: "Je veux écrire un roman de fiction. Peux-tu m'aider à développer l'idée, les personnages principaux et l'intrigue ?",
      aiSystemPrompt: "Tu es un assistant d'écriture spécialisé dans les romans de fiction. Aide l'auteur à développer une intrigue captivante, des personnages tridimensionnels, et un style narratif engageant. Focus sur la structure narrative, le développement des personnages, et la cohérence de l'univers.",
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
      initialPrompt: "Je souhaite écrire une nouvelle. Aide-moi à créer une histoire courte mais impactante avec une chute mémorable.",
      aiSystemPrompt: "Tu es expert en nouvelles et récits courts. Aide à créer des histoires concises mais puissantes, avec un impact émotionnel fort. Focus sur l'économie de mots, la tension narrative, et une chute efficace.",
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
      initialPrompt: "Je veux écrire mes mémoires ou raconter une période importante de ma vie. Comment structurer ce récit personnel ?",
      aiSystemPrompt: "Tu es spécialisé dans l'écriture de mémoires et récits autobiographiques. Aide à structurer les souvenirs, trouver les thèmes récurrents, et créer un récit personnel authentique et engageant.",
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
      id: 'essay-book',
      name: 'Essai thématique',
      description: 'Exploration approfondie d\'un sujet, argumentation construite',
      genre: 'Essai',
      targetWords: 40000,
      emoji: '🤔',
      initialPrompt: "Je veux écrire un essai approfondi sur un sujet qui me passionne. Comment développer mes idées de manière structurée et convaincante ?",
      aiSystemPrompt: "Tu es expert en écriture d'essais et textes argumentatifs. Aide à structurer la pensée, développer des arguments solides, et présenter des idées complexes de manière claire et persuasive.",
      suggestedStructure: [
        "Définition du sujet et angle d'approche",
        "Recherche et collecte d'arguments",
        "Plan détaillé de l'argumentation",
        "Développement chapitre par chapitre",
        "Exemples et illustrations",
        "Conclusion et synthèse"
      ]
    },
    {
      id: 'self-help',
      name: 'Développement personnel',
      description: 'Guide pratique pour aider les lecteurs à s\'améliorer',
      genre: 'Développement personnel',
      targetWords: 50000,
      emoji: '🌱',
      initialPrompt: "Je veux écrire un livre de développement personnel pour aider les gens dans un domaine spécifique. Comment créer un guide pratique et inspirant ?",
      aiSystemPrompt: "Tu es spécialisé dans l'écriture de livres de développement personnel. Aide à créer du contenu pratique, inspirant et actionnable. Focus sur les exercices, les étapes concrètes, et la motivation du lecteur.",
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
      initialPrompt: "Je veux partager mon expertise professionnelle dans un livre business. Comment transmettre mes connaissances de manière utile pour d'autres entrepreneurs ?",
      aiSystemPrompt: "Tu es expert en écriture de contenu business et entrepreneurial. Aide à structurer l'expertise professionnelle, créer des frameworks utiles, et partager des insights pratiques pour le monde des affaires.",
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
      id: 'poetry-collection',
      name: 'Recueil de poésie',
      description: 'Collection de poèmes autour d\'un thème ou d\'une émotion',
      genre: 'Poésie',
      targetWords: 15000,
      emoji: '🎭',
      initialPrompt: "Je veux créer un recueil de poésie. Aide-moi à explorer un thème central et à développer une voix poétique cohérente.",
      aiSystemPrompt: "Tu es un guide pour l'écriture poétique. Aide à explorer les émotions, travailler les images et métaphores, et développer un style poétique personnel. Focus sur le rythme, la musicalité et l'expression artistique.",
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
      id: 'children-book',
      name: 'Livre pour enfants',
      description: 'Histoire adaptée aux jeunes lecteurs avec message positif',
      genre: 'Jeunesse',
      targetWords: 3000,
      emoji: '🧸',
      initialPrompt: "Je veux écrire un livre pour enfants. Comment créer une histoire captivante et éducative adaptée aux jeunes lecteurs ?",
      aiSystemPrompt: "Tu es spécialisé dans la littérature jeunesse. Aide à créer des histoires adaptées à l'âge, avec des messages positifs, du vocabulaire approprié, et des situations que les enfants peuvent comprendre et apprécier.",
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
      initialPrompt: "Je veux écrire un récit de voyage basé sur mes expériences. Comment mélanger descriptions de lieux, rencontres, et réflexions personnelles ?",
      aiSystemPrompt: "Tu es expert en récits de voyage. Aide à transformer les expériences de voyage en récit captivant, mêlant descriptions vivantes, rencontres humaines, et réflexions personnelles sur la découverte.",
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
      initialPrompt: "Je veux créer un livre de cuisine qui raconte l'histoire derrière mes recettes. Comment combiner recettes, techniques et récits personnels ?",
      aiSystemPrompt: "Tu es spécialisé dans l'écriture culinaire. Aide à présenter les recettes de manière claire, raconter les histoires qui les accompagnent, et transmettre la passion pour la cuisine.",
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
      id: 'mystery-thriller',
      name: 'Thriller/Polar',
      description: 'Roman à suspense avec enquête et révélations progressives',
      genre: 'Thriller',
      targetWords: 75000,
      emoji: '🔍',
      initialPrompt: "Je veux écrire un thriller captivant avec une enquête prenante. Comment construire le suspense et maintenir le lecteur en haleine ?",
      aiSystemPrompt: "Tu es expert en thrillers et romans policiers. Aide à construire une intrigue solide, gérer les indices et fausses pistes, développer la tension, et créer des révélations impactantes.",
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
      initialPrompt: "Je veux créer un univers de fantasy avec magie et créatures fantastiques. Comment construire un monde cohérent et une aventure épique ?",
      aiSystemPrompt: "Tu es spécialisé dans la fantasy et world-building. Aide à créer des univers fantastiques cohérents, développer des systèmes de magie, et construire des aventures épiques avec des enjeux importants.",
      suggestedStructure: [
        "Monde fantastique et ses règles",
        "Système de magie et créatures",
        "Héros et sa quête principale",
        "Alliés, ennemis et obstacles",
        "Aventures et défis progressifs",
        "Bataille finale et résolution épique"
      ]
    }
  ];
  
  // Fonctions utilitaires pour les templates
  export const getTemplateById = (id: string): BookTemplate | undefined => {
    return bookTemplates.find(template => template.id === id);
  };
  
  export const getTemplatesByGenre = (genre: string): BookTemplate[] => {
    return bookTemplates.filter(template => template.genre === genre);
  };
  
  export const getAllGenres = (): string[] => {
    return [...new Set(bookTemplates.map(template => template.genre))];
  };
  
  // Configuration des prompts IA selon le template
  export const getAIPromptForTemplate = (templateId: string, userMessage: string): string => {
    const template = getTemplateById(templateId);
    if (!template) return userMessage;
  
    return `${template.aiSystemPrompt}\n\nMessage de l'utilisateur: ${userMessage}`;
  };
  
  // Génération de suggestions contextuelles
  export const getContextualSuggestions = (templateId: string, wordCount: number): string[] => {
    const template = getTemplateById(templateId);
    if (!template) return [];
  
    const progress = wordCount / template.targetWords;
    
    if (progress < 0.1) {
      return [
        "Développons les personnages principaux",
        "Précisons le contexte et l'univers",
        "Définissons le conflit central"
      ];
    } else if (progress < 0.5) {
      return [
        "Approfondissons l'intrigue",
        "Ajoutons des obstacles et défis",
        "Développons les relations entre personnages"
      ];
    } else if (progress < 0.8) {
      return [
        "Préparons le climax",
        "Intensifions la tension",
        "Nouons les fils de l'intrigue"
      ];
    } else {
      return [
        "Réglons les derniers détails",
        "Préparons la conclusion",
        "Révisons les passages clés"
      ];
    }
  };