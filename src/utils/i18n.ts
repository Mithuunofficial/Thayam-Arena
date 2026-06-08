export type Language = 'en' | 'ta';

export interface Translations {
  title: string;
  subtitle: string;
  playOnline: string;
  howToPlay: string;
  singlePlayer: string;
  friendsMode: string;
  easy: string;
  medium: string;
  hard: string;
  createRoom: string;
  joinRoom: string;
  enterRoomCode: string;
  roomCode: string;
  gameType: string;
  singleMode: string;
  teamMode: string;
  team: string;
  ready: string;
  notReady: string;
  startGame: string;
  waitingForPlayers: string;
  activeRolls: string;
  emptyStack: string;
  throwDice: string;
  throwing: string;
  duration: string;
  turnLogs: string;
  aiAnalysis: string;
  recommendedMove: string;
  alternativeMove: string;
  capturedMsg: string;
  victoryTitle: string;
  playAgain: string;
  returnHome: string;
  statistics: string;
  totalRolls: string;
  captures: string;
  gameDuration: string;
  chatPlaceholder: string;
  quickChat: string;
  niceMove: string;
  yourTurn: string;
  wellPlayed: string;
  
  // Custom added translations
  lobbyDesc: string;
  enterHeroName: string;
  selectAllianceMode: string;
  startOffline: string;
  friendsModeDesc: string;
  arenaLobby: string;
  connectedWarriors: string;
  openSlot: string;
  human: string;
  bot: string;
  startSector: string;
  addBot: string;
  waiting: string;
  toggleNotReady: string;
  iAmReady: string;
  classicBattleArena: string;
  heroDesc: string;
  mechanicsSubtitle: string;
  heritageTitle: string;
  heritageDesc1: string;
  heritageDesc2: string;
  estdBce: string;
  tamilNadu: string;
  ancientStrategyReborn: string;
  rule1Title: string;
  rule1Desc: string;
  rule2Title: string;
  rule2Desc: string;
  rule3Title: string;
  rule3Desc: string;
  rule4Title: string;
  rule4Desc: string;
  warriorsRoster: string;
  base: string;
  board: string;
  home: string;
  allianceRuleTeam: string;
  allianceRuleSingle: string;
  activeWarriorTurn: string;
  awaitingDiceRoll: string;
  selectHighlightedToken: string;
  selectUnitBelow: string;
  aiThinking: string;
  waitingForPlayer: string;
  selectedUnit: string;
  blocked: string;
  landExactlyInGoal: string;
  landAtCell: string;
  recommendedVectors: string;
  usingRoll: string;
  safe: string;
  awaitingMoveSuggestion: string;
  noRecordsYet: string;
  teamWin: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    title: "THAYAM ARENA",
    subtitle: "ANCIENT TAMIL STRATEGY REBORN",
    playOnline: "PLAY ONLINE",
    howToPlay: "HOW TO PLAY",
    singlePlayer: "Single Player (Vs Bots)",
    friendsMode: "Friends Mode (Online)",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    createRoom: "Create Room",
    joinRoom: "Join Room",
    enterRoomCode: "Enter 10-character Room Code",
    roomCode: "Room Code",
    gameType: "Game Mode",
    singleMode: "Free for All (Single)",
    teamMode: "Teammates (2v2 Team)",
    team: "Team",
    ready: "Ready",
    notReady: "Not Ready",
    startGame: "Start Game",
    waitingForPlayers: "Waiting for other players...",
    activeRolls: "Active Rolls",
    emptyStack: "Throw dice to get moves",
    throwDice: "Roll Dice",
    throwing: "Rolling...",
    duration: "Duration",
    turnLogs: "Game Logs",
    aiAnalysis: "Tactical Help",
    recommendedMove: "Best Move",
    alternativeMove: "Option",
    capturedMsg: "Captured!",
    victoryTitle: "VICTORY ACHIEVED!",
    playAgain: "Play Again",
    returnHome: "Return Home",
    statistics: "Match Statistics",
    totalRolls: "Total Rolls",
    captures: "Tokens Captured",
    gameDuration: "Match Duration",
    chatPlaceholder: "Send Quick Message",
    quickChat: "Quick Chat",
    niceMove: "Nice Move!",
    yourTurn: "Your Turn!",
    wellPlayed: "Well Played!",
    
    // Custom added translations
    lobbyDesc: "Traditional Tamil Board Combat",
    enterHeroName: "ENTER HERO NAME:",
    selectAllianceMode: "SELECT ALLIANCE MODE:",
    startOffline: "Start Offline",
    friendsModeDesc: "Create a private room to invite friends or enter a code to join.",
    arenaLobby: "Arena Room Lobby",
    connectedWarriors: "Connected Warriors (4 Required):",
    openSlot: "Open Slot",
    human: "Human",
    bot: "Bot",
    startSector: "Start Sector",
    addBot: "Add Bot",
    waiting: "Waiting...",
    toggleNotReady: "Toggle Not Ready",
    iAmReady: "I am Ready!",
    classicBattleArena: "CLASSIC BATTLE ARENA",
    heroDesc: "Roll. Move. Cut. Defend. Guide your pieces along the ancient spiral matrix into the central Home. Experience Tamil Nadu's traditional strategy board game reimagined with premium aesthetics, smart bot levels, and online lobby sync.",
    mechanicsSubtitle: "Learn the mathematical rules of the Tamil courtyard board game",
    heritageTitle: "TAMIL TRADITIONAL HERITAGE",
    heritageDesc1: "Thayam (also known as Dayakattai) is an ancient board game of probability and logic played in southern India for over 2,000 years. Carved into stone pillars of historic temples and played on hand-drawn chalk maps in village porches, it represents mathematical wisdom.",
    heritageDesc2: "We have preserved this ancient logic while building a modern web client with high-fidelity aesthetics, clean interfaces, and low-latency synchronization.",
    estdBce: "ESTD. 300 BCE",
    tamilNadu: "Tamil Nadu",
    ancientStrategyReborn: "Ancient Strategy Reborn",
    rule1Title: "ROLL THE DICE",
    rule1Desc: "Roll the 3D dice. Rolling a 1 (Thayam) or a 6 awards you an extra throw! Accumulate rolls in your turn stack.",
    rule2Title: "SPAWN TOKEN",
    rule2Desc: "You must roll exactly a 1 (Thayam) to activate a token from your base onto the starting sector cell.",
    rule3Title: "TACTICAL CUTS",
    rule3Desc: "Land exactly on enemies to capture (cut) them and send them back to base, rewarding yourself with an extra bonus turn.",
    rule4Title: "REACH HOME",
    rule4Desc: "Spiral inward through safe blockade zones to land exactly in the central HOME. First clan (or team) to finish wins!",
    warriorsRoster: "WARRIORS ROSTER",
    base: "BASE",
    board: "BOARD",
    home: "HOME",
    allianceRuleTeam: "ALLIANCE RULE: Cooperate! Red (P0) & Green (P2) are allies. Blue (P1) & Yellow (P3) are allies. Land on opponents to cut them.",
    allianceRuleSingle: "Free-For-All match. Capture opponents and race to the central HOME!",
    activeWarriorTurn: "Active Warrior Turn:",
    awaitingDiceRoll: "Awaiting dice roll throw.",
    selectHighlightedToken: "Select a highlighted token to move.",
    selectUnitBelow: "Select Unit Below",
    aiThinking: "AI Thinking...",
    waitingForPlayer: "Waiting for Player...",
    selectedUnit: "SELECTED UNIT",
    blocked: "Blocked",
    landExactlyInGoal: "Land exactly in Goal",
    landAtCell: "Land at cell",
    recommendedVectors: "RECOMMENDED VECTORS:",
    usingRoll: "Using roll:",
    safe: "SAFE",
    awaitingMoveSuggestion: "Awaiting your active movement turn to suggest vectors.",
    noRecordsYet: "No records yet",
    teamWin: "Team Win!"
  },
  ta: {
    title: "தாயம் அரங்கம்",
    subtitle: "பண்டைய தமிழ் தாயம் மறுபிறவி",
    playOnline: "விளையாடு",
    howToPlay: "விளையாடும் முறை",
    singlePlayer: "தனி நபர் (கணினியுடன்)",
    friendsMode: "நண்பர்களுடன் (ஆன்லைன்)",
    easy: "எளிது",
    medium: "நடுத்தரம்",
    hard: "கடினம்",
    createRoom: "அறையை உருவாக்கு",
    joinRoom: "அறையில் இணை",
    enterRoomCode: "அறை குறியீட்டை உள்ளிடவும்",
    roomCode: "அறை குறியீடு",
    gameType: "விளையாட்டு வகை",
    singleMode: "தனித்தனி ஆட்டம் (நால்வர்)",
    teamMode: "கூட்டு ஆட்டம் (2v2 ஜோடி)",
    team: "அணி",
    ready: "தயார்",
    notReady: "தயாரில்லை",
    startGame: "ஆட்டத்தைத் தொடங்கு",
    waitingForPlayers: "பிற வீரர்களுக்காக காத்திருக்கிறது...",
    activeRolls: "தற்போதைய உருட்டல்கள்",
    emptyStack: "நகர்த்த உருட்டவும்",
    throwDice: "தாயக்கட்டை உருட்டு",
    throwing: "உருளுகிறது...",
    duration: "நேரம்",
    turnLogs: "ஆட்டப் பதிவுகள்",
    aiAnalysis: "சமிக்ஞை உத்திகள்",
    recommendedMove: "சிறந்த நகர்வு",
    alternativeMove: "மாற்று நகர்வு",
    capturedMsg: "வெட்டு!",
    victoryTitle: "வெற்றி பெற்றார்!",
    playAgain: "மீண்டும் விளையாடு",
    returnHome: "முகப்புக்குச் செல்",
    statistics: "ஆட்ட விவரங்கள்",
    totalRolls: "மொத்த உருட்டல்கள்",
    captures: "கைப்பற்றிய வெட்டுகள்",
    gameDuration: "ஆட்ட நேரம்",
    chatPlaceholder: "விரைவு செய்தி அனுப்பு",
    quickChat: "விரைவு அரட்டை",
    niceMove: "நல்ல நகர்வு!",
    yourTurn: "உங்கள் முறை!",
    wellPlayed: "அருமையாக விளையாடினீர்கள்!",
    
    // Custom added translations
    lobbyDesc: "பாரம்பரிய தமிழ் பலகை போர் விளையாட்டு",
    enterHeroName: "வீரரின் பெயரை உள்ளிடவும்:",
    selectAllianceMode: "கூட்டணி முறையைத் தேர்ந்தெடுக்கவும்:",
    startOffline: "கணினியுடன் விளையாடு",
    friendsModeDesc: "நண்பர்களை அழைக்க தனிப்பட்ட அறையை உருவாக்கவும் அல்லது குறியீட்டை உள்ளிட்டு இணையவும்.",
    arenaLobby: "அறை காத்திருப்புக்கூடம்",
    connectedWarriors: "இணைக்கப்பட்ட வீரர்கள் (4 தேவை):",
    openSlot: "காலியான இடம்",
    human: "மனிதன்",
    bot: "கணினி",
    startSector: "தொடக்க பகுதி",
    addBot: "கணினியை சேர்",
    waiting: "காத்திருக்கிறது...",
    toggleNotReady: "தயாரில்லை என மாற்று",
    iAmReady: "நான் தயார்!",
    classicBattleArena: "கிளாசிக் போர் அரங்கம்",
    heroDesc: "உருட்டவும். நகர்த்தவும். வெட்டவும். காக்கவும். உங்கள் காய்களை பண்டைய சுழல் பாதையில் மத்திய இல்லத்தை நோக்கி வழிநடத்துங்கள். நவீன அழகியல், மேம்பட்ட கணினி எதிரிகள் மற்றும் ஆன்லைன் ஒத்திசைவுடன் தமிழகத்தின் பாரம்பரிய தாயம் விளையாட்டை விளையாடுங்கள்.",
    mechanicsSubtitle: "தமிழ் முற்றம் பலகை விளையாட்டின் கணித விதிகளை அறிந்து கொள்ளுங்கள்",
    heritageTitle: "தமிழர் பாரம்பரிய மரபு",
    heritageDesc1: "தாயம் (தாயக்கட்டை என்றும் அழைக்கப்படும்) என்பது 2,000 ஆண்டுகளுக்கும் மேலாக தென்னிந்தியாவில் விளையாடப்பட்டு வரும் ஒரு பண்டைய நிகழ்தகவு மற்றும் தர்க்க பலகை விளையாட்டு ஆகும். வரலாற்று சிறப்புமிக்க கோவில்களின் கல் தூண்களில் செதுக்கப்பட்டு, கிராமத்து திண்ணைகளில் சுண்ணக்கட்டியால் வரையப்பட்ட வரைபடங்களில் விளையாடப்படும் இது கணித ஞானத்தை பிரதிபலிக்கிறது.",
    heritageDesc2: "உயர்தர அழகியல், சுத்தமான இடைமுகங்கள் மற்றும் குறைந்த தாமத ஒத்திசைவுடன் கூடிய நவீன இணைய கிளையண்டை உருவாக்கும் போது, நாங்கள் இந்த பண்டைய தர்க்கத்தை அப்படியே பாதுகாத்துள்ளோம்.",
    estdBce: "நிறுவப்பட்டது மு.ச. 300",
    tamilNadu: "தமிழ்நாடு",
    ancientStrategyReborn: "பண்டைய உத்தி மறுபிறவி",
    rule1Title: "தாயத்தை உருட்டு",
    rule1Desc: "முப்பரிமாண தாயக்கட்டையை உருட்டவும். 1 (தாயம்) அல்லது 6 உருட்டினால் உங்களுக்கு கூடுதல் வாய்ப்பு கிடைக்கும்! உங்கள் நகர்வுகளைச் சேகரித்துக் கொள்ளுங்கள்.",
    rule2Title: "காய்களைத் தொடங்கு",
    rule2Desc: "உங்கள் தளத்திலிருந்து தொடக்கக் கட்டத்திற்கு காய்களை நகர்த்த தாயம் (1) மட்டுமே உருட்ட வேண்டும்.",
    rule3Title: "வெட்டுக்கள்",
    rule3Desc: "எதிரிகளின் காய்கள் இருக்கும் இடத்தில் உங்கள் காயை இறக்கி அவற்றை வெட்டித் தளத்திற்கு அனுப்பவும். இதற்கு உங்களுக்கு ஒரு கூடுதல் வாய்ப்பு கிடைக்கும்.",
    rule4Title: "இல்லத்தை அடை",
    rule4Desc: "பாதுகாப்பான கட்டங்கள் வழியாக உள்நோக்கிச் சென்று மத்திய இல்லத்தை சரியாக அடைய வேண்டும். முதலில் முடிக்கும் நபர் (அல்லது அணி) வெற்றி பெறுவர்!",
    warriorsRoster: "வீரர்கள் பட்டியல்",
    base: "தளம்",
    board: "பலகை",
    home: "இல்லம்",
    allianceRuleTeam: "கூட்டணி விதி: ஒத்துழையுங்கள்! சிவப்பு (P0) & பச்சை (P2) கூட்டாளிகள். நீலம் (P1) & மஞ்சள் (P3) கூட்டாளிகள். எதிரிகளை வெட்ட அவர்கள் மேல் இறங்குங்கள்.",
    allianceRuleSingle: "தனித்தனி ஆட்டம். எதிரிகளை வெட்டி மத்திய இல்லத்தை நோக்கி முன்னேறுங்கள்!",
    activeWarriorTurn: "தற்போதைய வீரரின் முறை:",
    awaitingDiceRoll: "உருட்டுவதற்காக காத்திருக்கிறது.",
    selectHighlightedToken: "நகர்த்த ஒளிரும் காயைத் தேர்ந்தெடுக்கவும்.",
    selectUnitBelow: "கீழே உள்ள காயைத் தேர்ந்தெடுக்கவும்",
    aiThinking: "கணினி யோசிக்கிறது...",
    waitingForPlayer: "வீரருக்காக காத்திருக்கிறது...",
    selectedUnit: "தேர்ந்தெடுக்கப்பட்ட காய்",
    blocked: "தடுக்கப்பட்டது",
    landExactlyInGoal: "இல்லத்தில் சரியாக இறங்கு",
    landAtCell: "இந்தக் கட்டத்தில் இறங்கு",
    recommendedVectors: "பரிந்துரைக்கப்பட்ட நகர்வுகள்:",
    usingRoll: "இதனைப் பயன்படுத்தி:",
    safe: "பாதுகாப்பானது",
    awaitingMoveSuggestion: "பரிந்துரைகளைக் காட்ட உங்கள் நகர்வு முறைக்காகக் காத்திருக்கிறது.",
    noRecordsYet: "பதிவுகள் எதுவும் இல்லை",
    teamWin: "அணி வெற்றி!"
  }
};
