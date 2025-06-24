// src/lib/book-templates.ts - Version corrigée avec ES2015 target
export interface BookTemplate {
  id: string;
  name: string;
  description: string;
  genre: string;
  targetWords: number;
  emoji: string;
  fullPrompt: string;
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
    fullPrompt: `🎯 **MISSION ÉCRITURE : Roman de fiction**

Parfait ! Passons directement à l'action pour votre roman de fiction. Voici votre plan de travail immédiat :

**📝 ÉTAPE 1 : Votre premier chapitre (À écrire MAINTENANT)**

Commencez par écrire l'incipit de votre roman - les 500 premiers mots qui vont accrocher le lecteur. Voici une structure testée :

**• Phrase d'ouverture marquante** (action, dialogue percutant, ou image forte)
**• Présentation du protagoniste** (nom, âge, situation actuelle)
**• Le décor** (lieu, époque, ambiance en quelques touches)
**• L'élément déclencheur** (ce qui va changer la vie du héros)

**🚀 COMMENCEZ PAR ÉCRIRE :**
"[Votre phrase d'ouverture ici - quelque chose qui donne envie de lire la suite]"

**📋 APRÈS VOTRE PREMIER PARAGRAPHE, JE VOUS AIDERAI AVEC :**

✅ **Le profil complet de votre héros** (background, motivations, défauts)
✅ **L'intrigue principale** (conflit central + 3 obstacles majeurs)
✅ **L'univers** (règles, géographie, époque)
✅ **Le plan des 12 premiers chapitres**
✅ **Les personnages secondaires clés**

**💡 CONSEIL D'EXPERT :** Ne réfléchissez pas trop - lancez-vous ! Les meilleurs romans naissent quand on commence à écrire. Tapez votre premier paragraphe maintenant, même imparfait.

**Votre mission immédiate : Écrivez les 3 premières phrases de votre roman. GO !** 🏃‍♂️`,
    suggestedStructure: [
      "Premier chapitre et incipit",
      "Développement du protagoniste", 
      "Construction de l'univers",
      "Intrigue et conflits principaux",
      "Personnages secondaires",
      "Plan détaillé des chapitres"
    ]
  },
  {
    id: 'short-story',
    name: 'Nouvelle',
    description: 'Histoire courte et percutante avec un point culminant fort',
    genre: 'Fiction courte',
    targetWords: 5000,
    emoji: '📝',
    fullPrompt: `⚡ **MISSION ÉCRITURE : Nouvelle impactante**

C'est parti ! Les nouvelles sont l'art de la précision - chaque mot compte. Voici votre roadmap d'écriture immédiate :

**📝 DÉFI 1 : Votre première scène (300 mots max)**

Écrivez MAINTENANT l'ouverture de votre nouvelle avec cette structure efficace :

**• 1 personnage principal** (+ 1 trait marquant)
**• 1 situation précise** (lieu + moment + action)
**• 1 tension immédiate** (conflit, secret, ou danger)

**🎯 VOTRE MISSION :**
Commencez par cette phrase : "Ce matin-là, [nom du héros] comprit que [événement/découverte] allait tout changer..."

**⚡ APRÈS VOS 300 PREMIERS MOTS :**

✅ **Le twist central** (la révélation qui va surprendre)
✅ **L'escalade** (comment la tension monte rapidement)
✅ **La chute finale** (résolution en 2-3 paragraphes)
✅ **Le peaufinage** (chaque phrase optimisée)

**💎 TECHNIQUE DE PRO :** Dans une nouvelle, commencez au plus près du climax. Pas de longue introduction - plongez direct dans l'action !

**📊 STRUCTURE RECOMMANDÉE :**
- 25% : Mise en situation + personnage
- 50% : Développement du conflit
- 25% : Climax + résolution

**Votre défi immédiat : Écrivez votre premier paragraphe de 50 mots maximum. Soyez percutant !** 💥`,
    suggestedStructure: [
      "Ouverture percutante",
      "Personnage et conflit immédiat",
      "Développement de la tension",
      "Climax et révélation",
      "Résolution efficace",
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
    fullPrompt: `📖 **MISSION ÉCRITURE : Vos mémoires authentiques**

Vos souvenirs sont votre trésor - transformons-les en récit captivant ! Commençons par l'écriture immédiate :

**✍️ EXERCICE D'ÉCRITURE IMMÉDIAT (500 mots)**

Choisissez UN moment marquant de votre vie et décrivez-le avec cette méthode :

**• L'instant précis** (jour, heure, lieu exact)
**• Vos sensations** (ce que vous voyiez, entendiez, ressentiez)
**• L'émotion dominante** (peur, joie, colère, surprise...)
**• La leçon apprise** (ce que ça vous a enseigné sur vous)

**🎯 COMMENCEZ PAR :**
"Je me souviens précisément de [date/âge] quand [événement]. C'était [description sensorielle]..."

**📝 APRÈS VOTRE PREMIER RÉCIT :**

✅ **Chronologie personnelle** (10 événements clés de votre vie)
✅ **Thèmes récurrents** (les leçons qui reviennent)
✅ **Personnages marquants** (famille, amis, mentors)
✅ **Structure narrative** (comment organiser vos souvenirs)
✅ **Fil conducteur** (le message principal de votre histoire)

**💡 ASTUCE MÉMOIRES :** Écrivez comme si vous racontiez à un ami. L'authenticité prime sur le style parfait.

**🗂️ PLAN DE TRAVAIL :**
1. **Enfance** (3-4 souvenirs fondateurs)
2. **Adolescence** (défis et découvertes)
3. **Vie adulte** (tournants majeurs)
4. **Réflexions actuelles** (ce que vous en pensez aujourd'hui)

**Votre mission immédiate : Racontez votre souvenir le plus vif en 200 mots. Allez-y !** 🚀`,
    suggestedStructure: [
      "Souvenir fondateur détaillé",
      "Chronologie des événements clés",
      "Personnages importants",
      "Thèmes et apprentissages",
      "Réflexions et perspectives",
      "Structure narrative finale"
    ]
  }
  // Ajoutez ici les autres templates...
];

// Fonctions utilitaires
export const getTemplateById = (id: string): BookTemplate | undefined => {
  return bookTemplates.find(template => template.id === id);
};

export const getTemplatesByGenre = (genre: string): BookTemplate[] => {
  return bookTemplates.filter(template => template.genre === genre);
};

export const getAllGenres = (): string[] => {
  // Utiliser Array.from au lieu de la syntaxe spread pour éviter l'erreur
  return Array.from(new Set(bookTemplates.map(template => template.genre)));
};

// Fonction pour valider qu'un prompt est directif
export const validatePromptIsActionable = (prompt: string): boolean => {
  const actionWords = [
    'écrivez maintenant', 'commencez par', 'votre mission', 
    'exercice immédiat', 'rédigez', 'créez maintenant',
    'tapez', 'go !', 'allez-y'
  ];
  
  return actionWords.some(word => 
    prompt.toLowerCase().includes(word.toLowerCase())
  );
};

// Template pour prompts follow-up (après le premier message)
export const getFollowUpPrompt = (templateId: string, userProgress: string) => {
  const template = getTemplateById(templateId);
  if (!template) return null;

  return `🔥 **EXCELLENT DÉBUT !**

Votre ${userProgress} montre que vous êtes lancé ! Continuons sur cette lancée.

**🎯 PROCHAINE ÉTAPE IMMÉDIATE :**

${template.suggestedStructure[1]} - Développons maintenant cet aspect en détail.

**✍️ ACTION CONCRÈTE :**
Écrivez les 300 mots suivants en vous concentrant sur [aspect spécifique selon le template].

**💡 CONSEIL D'EXPERT :**
[Conseil spécifique selon le genre du livre]

Postez votre nouveau texte dès qu'il est prêt - je vous guide étape par étape ! 🚀`;
};