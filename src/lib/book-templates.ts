// src/lib/book-templates.ts - Version 3.0 avec prompts d'écriture directe

export interface BookTemplate {
  id: string;
  name: string;
  description: string;
  genre: string;
  targetWords: number;
  emoji: string;
  fullPrompt: string; // Prompt qui déclenche l'écriture immédiate
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
  },
  {
    id: 'self-help',
    name: 'Développement personnel',
    description: 'Guide pratique pour aider les lecteurs à s\'améliorer',
    genre: 'Développement personnel',
    targetWords: 50000,
    emoji: '🌱',
    fullPrompt: `🎯 **MISSION ÉCRITURE : Guide de transformation**

Stop la théorie - passons à l'action ! Votre livre va changer des vies. Commençons par créer du contenu impactant :

**⚡ EXERCICE IMMÉDIAT : Votre méthode signature (400 mots)**

Rédigez MAINTENANT votre introduction avec cette structure :

**• Le problème** (que vivez-vous/vos lecteurs ?)
**• Votre solution** (votre approche unique en 3-5 étapes)
**• La promesse** (résultat concret après application)
**• Premier exercice pratique** (action immédiate pour le lecteur)

**🚀 COMMENCEZ PAR :**
"Si vous lisez ce livre, c'est que [problème] vous préoccupe. J'ai découvert une méthode qui [promesse de résultat]..."

**🛠️ APRÈS VOTRE INTRO :**

✅ **Votre méthode complète** (5-7 étapes progressives)
✅ **15 exercices pratiques** (un par chapitre)
✅ **Études de cas** (3 histoires de réussite)
✅ **Plan d'action 30 jours** (programme concret)
✅ **Outils et ressources** (templates, checklist)

**💡 RÈGLE D'OR :** Chaque page doit apporter une valeur actionnable. Pas de blabla - du concret !

**📊 STRUCTURE TESTÉE :**
- **Partie 1 :** Diagnostic (où vous êtes)
- **Partie 2 :** Méthode (comment progresser)  
- **Partie 3 :** Action (plan concret)
- **Partie 4 :** Maintien (pérenniser les résultats)

**🎖️ VOTRE CRÉDIBILITÉ :** Intégrez votre expérience personnelle - vos échecs ET vos réussites.

**Votre mission immédiate : Définissez LE problème que vous résolvez en 1 phrase claire !** 💪`,
    suggestedStructure: [
      "Problème et solution claire",
      "Méthode étape par étape",
      "Exercices pratiques concrets",
      "Études de cas et témoignages",
      "Plan d'action détaillé",
      "Outils et ressources"
    ]
  },
  {
    id: 'business-book',
    name: 'Livre business/entrepreneuriat',
    description: 'Partage d\'expertise professionnelle et conseils business',
    genre: 'Business',
    targetWords: 55000,
    emoji: '💼',
    fullPrompt: `💼 **MISSION ÉCRITURE : Expertise business**

Votre expérience = la valeur pour d'autres entrepreneurs. Transformons vos connaissances en contenu business actionnable !

**📊 EXERCICE IMMÉDIAT : Votre framework signature (500 mots)**

Créez MAINTENANT le framework qui fait votre expertise unique :

**• Votre domaine d'expertise** (marketing, vente, management, etc.)
**• Le défi business #1** (que vous résolvez mieux que personne)
**• Votre méthode** (3-5 étapes concrètes)
**• Cas d'étude** (votre meilleur exemple)

**🎯 COMMENCEZ PAR :**
"En [X années] dans [domaine], j'ai vu trop d'entrepreneurs échouer sur [problème]. Voici la méthode que j'ai développée pour [résultat]..."

**💡 APRÈS VOTRE FRAMEWORK :**

✅ **Votre histoire d'entrepreneur** (crédibilité + leçons)
✅ **5 cas d'études détaillés** (échecs ET réussites)
✅ **Templates business** (outils pratiques)
✅ **Métriques et KPIs** (comment mesurer le succès)
✅ **Roadmap 90 jours** (plan d'implémentation)

**🔥 CRÉDIBILITÉ BUSINESS :**
- Vos chiffres concrets (CA, croissance, équipe...)
- Vos erreurs coûteuses (et comment les éviter)
- Vos outils/méthodes exclusifs

**📈 STRUCTURE BUSINESS EFFICACE :**
1. **Diagnostic** (où en est le lecteur ?)
2. **Stratégie** (votre approche unique)
3. **Tactiques** (actions concrètes)
4. **Exécution** (comment implémenter)
5. **Optimisation** (comment améliorer)

**💰 VALEUR AJOUTÉE :** Chaque chapitre = gain potentiel mesurable pour le lecteur.

**Votre mission immédiate : Décrivez votre plus gros succès business en 100 mots !** 🚀`,
    suggestedStructure: [
      "Expertise et crédibilité",
      "Framework signature",
      "Cas d'études concrets",
      "Outils et templates",
      "Plan d'implémentation",
      "Métriques de succès"
    ]
  },
  {
    id: 'mystery-thriller',
    name: 'Thriller/Polar',
    description: 'Roman à suspense avec enquête et révélations progressives',
    genre: 'Thriller',
    targetWords: 75000,
    emoji: '🔍',
    fullPrompt: `🔍 **MISSION ÉCRITURE : Thriller addictif**

Le suspense commence MAINTENANT ! Créons ensemble un thriller qui tiendra vos lecteurs éveillés toute la nuit.

**⚡ EXERCICE IMMÉDIAT : Votre scène d'ouverture (400 mots)**

Écrivez votre premier chapitre avec cette recette thriller :

**• Crime/mystère** (mort, disparition, secret découvert)
**• Enquêteur** (flic, journaliste, amateur - 1 trait marquant)
**• Premier indice** (qui lance l'enquête)
**• Tension immédiate** (danger ou urgence)

**🎯 COMMENCEZ PAR :**
"Le corps fut découvert à [heure précise]. [Détail troublant]. L'inspecteur [nom] comprit immédiatement que cette affaire allait être [adjectif]..."

**🕵️ APRÈS VOTRE OUVERTURE :**

✅ **Votre enquêteur** (passé, méthodes, défauts)
✅ **Le crime central** (qui, comment, pourquoi ?)
✅ **5 indices clés** (chronologie de découverte)
✅ **3 fausses pistes** (pour égarer le lecteur)
✅ **Le vrai coupable** (motivation cachée)
✅ **Plot twist final** (révélation surprise)

**🎭 TECHNIQUE THRILLER :**
- Alternez investigation et action
- Révélez 1 indice par chapitre
- Créez de fausses évidences
- Gardez le vrai mobile pour la fin

**🗂️ STRUCTURE ÉPROUVÉE :**
1. **Crime** (chapitres 1-2)
2. **Enquête initiale** (chapitres 3-6)
3. **Complications** (chapitres 7-10)
4. **Révélations** (chapitres 11-14)
5. **Climax** (chapitres 15-16)

**💀 RÈGLE D'OR :** Chaque chapitre doit finir sur une question ou un danger.

**Votre mission immédiate : Décrivez votre crime en 3 phrases percutantes !** 🔥`,
    suggestedStructure: [
      "Scène de crime marquante",
      "Enquêteur et méthodes",
      "Système d'indices",
      "Fausses pistes créées",
      "Révélations progressives",
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
    fullPrompt: `🏰 **MISSION ÉCRITURE : Épopée fantastique**

Bienvenue dans la création d'univers ! Votre monde fantastique va prendre vie dès maintenant.

**🌟 EXERCICE IMMÉDIAT : Votre monde + héros (500 mots)**

Créez MAINTENANT l'ouverture de votre fantasy :

**• Votre héros** (nom, âge, don/faiblesse magique)
**• Le monde** (lieu + règle magique principale)
**• L'appel à l'aventure** (menace/quête qui commence)
**• Premier pouvoir** (magie en action dès page 1)

**🎯 COMMENCEZ PAR :**
"Dans le royaume de [nom], où [règle magique], [héros] venait de découvrir que [pouvoir/secret]. Mais [danger] approchait..."

**✨ APRÈS VOTRE OUVERTURE :**

✅ **Système magique** (règles, limites, coût)
✅ **Géographie du monde** (royaumes, races, langues)
✅ **Quête principale** (enjeu + 5 étapes)
✅ **Compagnons** (groupe d'aventuriers)
✅ **Antagoniste** (seigneur noir + motivations)
✅ **Créatures fantastiques** (bestiaire unique)

**🗺️ WORLD-BUILDING EXPRESS :**
- **Magie :** Comment ça marche ? Qui peut l'utiliser ?
- **Races :** Humains + 2-3 peuples fantastiques
- **Histoire :** 1 événement majeur du passé
- **Conflit :** Guerre/menace qui unit les héros

**⚔️ STRUCTURE FANTASY :**
1. **Monde ordinaire** (avant l'aventure)
2. **Appel** (quête commence)
3. **Voyage** (découvertes + épreuves)
4. **Alliés/Ennemis** (formation du groupe)
5. **Bataille finale** (magie vs magie)

**🐉 RÈGLE D'OR :** Cohérence > originalité. Votre monde doit avoir sa logique interne.

**Votre mission immédiate : Nommez votre héros et décrivez son premier sort !** ⚡`,
    suggestedStructure: [
      "Héros et monde fantastique",
      "Système magique cohérent",
      "Quête et enjeux épiques",
      "Compagnons d'aventure",
      "Créatures et antagonistes",
      "Bataille finale magique"
    ]
  },
  {
    id: 'children-book',
    name: 'Livre pour enfants',
    description: 'Histoire adaptée aux jeunes lecteurs avec message positif',
    genre: 'Jeunesse',
    targetWords: 3000,
    emoji: '🧸',
    fullPrompt: `🧸 **MISSION ÉCRITURE : Histoire magique pour enfants**

Les enfants méritent des histoires extraordinaires ! Créons ensemble un livre qu'ils vont adorer.

**🌈 EXERCICE IMMÉDIAT : Votre premier chapitre (300 mots)**

Écrivez MAINTENANT l'ouverture avec cette recette testée :

**• Héros enfant** (âge + 1 trait amusant)
**• Problème simple** (peur, conflit, défi)
**• Élément magique/spécial** (animal parlant, objet, pouvoir)
**• Émotion positive** (curiosité, courage, amitié)

**🎯 COMMENCEZ PAR :**
"[Prénom] était un petit [garçon/fille] de [âge] ans qui [trait spécial]. Ce matin-là, il/elle découvrit quelque chose d'extraordinaire : [élément magique]..."

**📚 APRÈS VOTRE DÉBUT :**

✅ **Message principal** (courage, amitié, confiance, etc.)
✅ **Péripéties amusantes** (3-4 mini-aventures)
✅ **Résolution positive** (problème résolu + leçon)
✅ **Vocabulaire adapté** (selon l'âge cible)
✅ **Descriptions visuelles** (pour les illustrations)

**🎨 TECHNIQUES ENFANTS :**
- Phrases courtes et rythmées
- Répétitions amusantes
- Dialogues simples
- Émotions claires
- Fin rassurante

**📖 STRUCTURE JEUNESSE :**
1. **Présentation** (héros + situation)
2. **Problème** (défi à relever)
3. **Aventure** (tentatives + obstacles)
4. **Solution** (comment ça marche)
5. **Célébration** (fierté + leçon)

**👶 TRANCHES D'ÂGE :**
- **3-5 ans :** 500 mots, phrases simples
- **6-8 ans :** 1500 mots, plus d'action
- **9-12 ans :** 3000 mots, émotions complexes

**Votre mission immédiate : Présentez votre petit héros en 2 phrases attachantes !** 🌟`,
    suggestedStructure: [
      "Petit héros attachant",
      "Problème adapté à l'âge",
      "Aventure et péripéties",
      "Message positif intégré",
      "Résolution rassurante",
      "Vocabulaire et style adaptés"
    ]
  },
  {
    id: 'travel-book',
    name: 'Récit de voyage',
    description: 'Carnet de voyage mêlant découvertes et réflexions personnelles',
    genre: 'Récit de voyage',
    targetWords: 45000,
    emoji: '🗺️',
    fullPrompt: `🗺️ **MISSION ÉCRITURE : Carnet d'aventures**

Vos voyages sont des trésors d'histoires ! Transformons vos souvenirs en récit captivant qui fera rêver vos lecteurs.

**✈️ EXERCICE IMMÉDIAT : Votre première aventure (400 mots)**

Racontez MAINTENANT votre moment de voyage le plus marquant :

**• Le lieu** (pays, ville, paysage précis)
**• L'instant T** (que faisiez-vous à ce moment ?)
**• La surprise/découverte** (inattendu qui vous a marqué)
**• Vos sensations** (5 sens + émotions)
**• La leçon** (ce que ça vous a appris)

**🎯 COMMENCEZ PAR :**
"J'étais à [lieu précis] quand [événement]. Jamais je n'avais imaginé que [découverte/sensation]..."

**🌍 APRÈS VOTRE PREMIÈRE HISTOIRE :**

✅ **Itinéraire complet** (chronologie de votre voyage)
✅ **Rencontres marquantes** (locals, voyageurs, guides)
✅ **Découvertes culturelles** (traditions, nourriture, art)
✅ **Galères et anecdotes** (ratés qui font les meilleures histoires)
✅ **Transformation personnelle** (comment le voyage vous a changé)

**📝 TECHNIQUES RÉCIT VOYAGE :**
- Détails sensoriels (odeurs, bruits, textures)
- Dialogues avec les locaux
- Comparaisons avec votre culture
- Moments d'émerveillement ET de difficulté
- Réflexions personnelles

**🗂️ STRUCTURE VOYAGE :**
1. **Départ** (motivations + préparatifs)
2. **Premières découvertes** (choc culturel)
3. **Immersion** (vraies rencontres)
4. **Aventures** (anecdotes marquantes)
5. **Retour** (ce que vous ramenez)

**💡 ASTUCE PRO :** Alternez récit d'action et réflexion personnelle.

**Votre mission immédiate : Décrivez votre moment "WOW" de voyage en 100 mots !** 🌟`,
    suggestedStructure: [
      "Moment marquant de voyage",
      "Itinéraire et contexte",
      "Rencontres humaines",
      "Découvertes culturelles",
      "Aventures et anecdotes",
      "Transformation personnelle"
    ]
  },
  {
    id: 'cookbook',
    name: 'Livre de cuisine',
    description: 'Collection de recettes avec histoire et conseils culinaires',
    genre: 'Gastronomie',
    targetWords: 35000,
    emoji: '👨‍🍳',
    fullPrompt: `👨‍🍳 **MISSION ÉCRITURE : Livre de cuisine avec âme**

Vos recettes racontent une histoire ! Créons un livre de cuisine qu'on lit autant qu'on utilise.

**🍳 EXERCICE IMMÉDIAT : Votre recette signature (400 mots)**

Rédigez MAINTENANT votre plat fétiche avec cette approche :

**• L'histoire** (d'où vient cette recette ? souvenir lié ?)
**• Les ingrédients** (liste précise + conseils choix)
**• La méthode** (étapes claires + astuces de chef)
**• L'anecdote** (ratage mémorable ou succès fou)
**• Pourquoi vous l'aimez** (émotions associées)

**🎯 COMMENCEZ PAR :**
"Cette recette de [plat] me vient de [origine/personne]. À chaque fois que je la prépare, [émotion/souvenir]..."

**📖 APRÈS VOTRE PREMIÈRE RECETTE :**

✅ **Votre philosophie culinaire** (cuisine simple ? gastronomique ?)
✅ **30 recettes organisées** (entrées, plats, desserts)
✅ **Techniques de base** (5 gestes fondamentaux)
✅ **Astuces de chef** (secrets pour réussir)
✅ **Menus complets** (associations parfaites)
✅ **Photos et descriptions** (donner envie visuellement)

**🔥 STRUCTURE RECETTE PARFAITE :**
- **Intro émotionnelle** (pourquoi cette recette ?)
- **Ingrédients précis** (quantités + conseils d'achat)
- **Méthode détaillée** (étape par étape)
- **Astuces pro** (comment l'améliorer)
- **Variantes** (adaptations possibles)

**👩‍🍳 TECHNIQUES ÉCRITURE CULINAIRE :**
- Vocabulaire sensoriel (croustillant, fondant...)
- Métaphores gourmandes
- Conseils pratiques à chaque étape
- Anticipation des problèmes

**🍽️ ORGANISATION LIVRE :**
1. **Votre histoire culinaire** (comment vous cuisinez)
2. **Bases** (techniques fondamentales)
3. **Recettes par thème** (saisons, occasions...)
4. **Menus complets** (harmonies parfaites)

**Votre mission immédiate : Racontez l'histoire de VOTRE plat préféré !** 🌟`,
    suggestedStructure: [
      "Recette signature avec histoire",
      "Philosophie culinaire personnelle",
      "Techniques de base illustrées",
      "Recettes organisées par thème",
      "Astuces et secrets de chef",
      "Menus et accords parfaits"
    ]
  },
  {
    id: 'poetry-collection',
    name: 'Recueil de poésie',
    description: 'Collection de poèmes autour d\'un thème ou d\'une émotion',
    genre: 'Poésie',
    targetWords: 15000,
    emoji: '🎭',
    fullPrompt: `🎭 **MISSION ÉCRITURE : Recueil poétique**

Votre voix poétique n'attend que de s'exprimer ! Libérons ensemble les mots qui habitent votre âme.

**✨ EXERCICE IMMÉDIAT : Votre premier poème (150 mots)**

Écrivez MAINTENANT un poème libre sur votre émotion du moment :

**• Émotion centrale** (joie, mélancolie, colère, amour...)
**• Images fortes** (3-4 métaphores personnelles)
**• Rythme personnel** (court/long, saccadé/fluide)
**• Fin marquante** (chute qui résonne)

**🎯 COMMENCEZ PAR :**
Choisissez UNE émotion forte et laissez les mots venir naturellement. Pas de contrainte de forme - juste votre vérité.

**📝 APRÈS VOTRE PREMIER POÈME :**

✅ **Thème du recueil** (fil conducteur émotionnel)
✅ **30-40 poèmes** (variété de formes et longueurs)
✅ **Organisation poétique** (progression dans les émotions)
✅ **Votre style unique** (sonorités, images récurrentes)
✅ **Expérimentation** (haïkus, alexandrins, vers libres...)

**🎨 TECHNIQUES POÉTIQUES :**
- **Images sensorielles** (couleurs, sons, textures)
- **Métaphores personnelles** (comparaisons uniques)
- **Rythme et sonorités** (répétitions, allitérations)
- **Émotions brutes** (authenticité avant perfection)

**📚 STRUCTURE RECUEIL :**
1. **Ouverture** (poème d'introduction au thème)
2. **Exploration** (variations sur l'émotion centrale)
3. **Intensité** (moments les plus forts)
4. **Résolution** (apaisement ou transformation)
5. **Fermeture** (poème de conclusion)

**🎭 STYLES À EXPLORER :**
- Vers libres (liberté totale)
- Haïkus (capture d'instants)
- Sonnets (contrainte créative)
- Prose poétique (entre prose et vers)

**Votre mission immédiate : Écrivez 3 vers sur ce qui vous touche MAINTENANT !** 💫`,
    suggestedStructure: [
      "Premier poème personnel",
      "Thème central du recueil",
      "Exploration de différentes formes",
      "Organisation émotionnelle",
      "Style et voix uniques",
      "Progression poétique cohérente"
    ]
  },
  {
    id: 'essay-book',
    name: 'Essai thématique',
    description: 'Exploration approfondie d\'un sujet, argumentation construite',
    genre: 'Essai',
    targetWords: 40000,
    emoji: '🤔',
    fullPrompt: `🤔 **MISSION ÉCRITURE : Essai d'idées**

Vos réflexions méritent d'être partagées ! Transformons votre pensée en contribution intellectuelle marquante.

**💭 EXERCICE IMMÉDIAT : Votre thèse principale (400 mots)**

Exposez MAINTENANT votre idée centrale avec force :

**• Votre conviction** (ce en quoi vous croyez fermement)
**• Le problème actuel** (ce qui dysfonctionne aujourd'hui)
**• Votre solution/vision** (comment vous voyez les choses)
**• Premier argument** (preuve ou exemple concret)

**🎯 COMMENCEZ PAR :**
"Contrairement à ce que pensent la plupart des gens, [votre thèse]. Voici pourquoi cette idée peut changer [domaine/société]..."

**📖 APRÈS VOTRE THÈSE :**

✅ **Plan d'argumentation** (5-6 arguments progressifs)
✅ **Preuves et exemples** (statistiques, cas concrets)
✅ **Objections anticipées** (contre-arguments + réponses)
✅ **Témoignages d'experts** (citations qui soutiennent)
✅ **Implications pratiques** (conséquences de votre idée)
✅ **Appel à l'action** (que peut faire le lecteur ?)

**🏗️ STRUCTURE ESSAI EFFICACE :**
1. **Constat** (état actuel du problème)
2. **Thèse** (votre position claire)
3. **Arguments** (preuves progressives)
4. **Réfutation** (traitement des objections)
5. **Vision** (monde selon vos idées)
6. **Action** (comment y arriver)

**✍️ STYLE ESSAI ENGAGEANT :**
- Anecdotes personnelles
- Exemples concrets et actuels
- Questions rhétoriques
- Métaphores éclairantes
- Ton personnel mais rigoureux

**🔍 RECHERCHE NÉCESSAIRE :**
- 20 sources minimum (livres, études, articles)
- 5 experts à citer
- 10 exemples concrets
- Statistiques récentes

**Votre mission immédiate : Résumez votre conviction principale en 1 phrase percutante !** 🎯`,
    suggestedStructure: [
      "Thèse principale claire",
      "Arguments structurés progressifs",
      "Preuves et exemples concrets",
      "Traitement des objections",
      "Vision et implications",
      "Appel à l'action concret"
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