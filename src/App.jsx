import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc, onSnapshot, arrayUnion } from 'firebase/firestore';
import { 
  Dice5, User, Car, ArrowRight, X, Building2, Handshake, Hotel, 
  Train, Zap, Droplets, Users, Play, Plus, ArrowLeft, Info, 
  Skull, Lock, Unlock, Trophy, Copy, Star, Crown, Sparkles, 
  Home, ScrollText, Landmark, Gavel, Hammer, ArrowRightLeft, Check,
  Network
} from 'lucide-react';

// --- DEINE FIREBASE CONFIG (BITTE HIER EINFÜGEN) ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialisiere Firebase
let app, db;
try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch(e) {
    console.error("Firebase Init Fehler:", e);
}

// --- KONSTANTEN ---
const BOARD_SIZE = 40;
const GROUPS = { BROWN: 'brown', LIGHTBLUE: 'lightblue', PINK: 'pink', ORANGE: 'orange', RED: 'red', YELLOW: 'yellow', GREEN: 'green', DARKBLUE: 'darkblue', STATION: 'station', UTILITY: 'utility' };

const BOARD_DATA = [
  { id: 0, type: 'start', name: 'LOS', price: 0 },
  { id: 1, type: 'property', name: 'Badstraße', group: GROUPS.BROWN, color: 'bg-amber-900', price: 60, houseCost: 50, rent: [2, 10, 30, 90, 160, 250], mortgage: 30 },
  { id: 2, type: 'chance', name: 'Gemeinschaft', price: 0 },
  { id: 3, type: 'property', name: 'Turmstraße', group: GROUPS.BROWN, color: 'bg-amber-900', price: 60, houseCost: 50, rent: [4, 20, 60, 180, 320, 450], mortgage: 30 },
  { id: 4, type: 'tax', name: 'Eink. Steuer', price: 0, amount: 200 },
  { id: 5, type: 'property', name: 'Südbahnhof', group: GROUPS.STATION, color: 'bg-black', text: 'text-white', price: 200, rent: [25, 50, 100, 200], mortgage: 100 },
  { id: 6, type: 'property', name: 'Chausseestr.', group: GROUPS.LIGHTBLUE, color: 'bg-sky-300', price: 100, houseCost: 50, rent: [6, 30, 90, 270, 400, 550], mortgage: 50 },
  { id: 7, type: 'chance', name: 'Ereignis', price: 0 },
  { id: 8, type: 'property', name: 'Elisenstr.', group: GROUPS.LIGHTBLUE, color: 'bg-sky-300', price: 100, houseCost: 50, rent: [6, 30, 90, 270, 400, 550], mortgage: 50 },
  { id: 9, type: 'property', name: 'Poststraße', group: GROUPS.LIGHTBLUE, color: 'bg-sky-300', price: 120, houseCost: 50, rent: [8, 40, 100, 300, 450, 600], mortgage: 60 },
  { id: 10, type: 'jail', name: 'Gefängnis', price: 0 },
  { id: 11, type: 'property', name: 'Seestraße', group: GROUPS.PINK, color: 'bg-pink-400', price: 140, houseCost: 100, rent: [10, 50, 150, 450, 625, 750], mortgage: 70 },
  { id: 12, type: 'property', name: 'E-Werk', group: GROUPS.UTILITY, color: 'bg-gray-400', price: 150, rent: [], mortgage: 75 },
  { id: 13, type: 'property', name: 'Hafenstr.', group: GROUPS.PINK, color: 'bg-pink-400', price: 140, houseCost: 100, rent: [10, 50, 150, 450, 625, 750], mortgage: 70 },
  { id: 14, type: 'property', name: 'Neue Str.', group: GROUPS.PINK, color: 'bg-pink-400', price: 160, houseCost: 100, rent: [12, 60, 180, 500, 700, 900], mortgage: 80 },
  { id: 15, type: 'property', name: 'Westbahnhof', group: GROUPS.STATION, color: 'bg-black', text: 'text-white', price: 200, rent: [25, 50, 100, 200], mortgage: 100 },
  { id: 16, type: 'property', name: 'Münchener Str.', group: GROUPS.ORANGE, color: 'bg-orange-400', price: 180, houseCost: 100, rent: [14, 70, 200, 550, 750, 950], mortgage: 90 },
  { id: 17, type: 'chance', name: 'Gemeinschaft', price: 0 },
  { id: 18, type: 'property', name: 'Wiener Str.', group: GROUPS.ORANGE, color: 'bg-orange-400', price: 180, houseCost: 100, rent: [14, 70, 200, 550, 750, 950], mortgage: 90 },
  { id: 19, type: 'property', name: 'Berliner Str.', group: GROUPS.ORANGE, color: 'bg-orange-400', price: 200, houseCost: 100, rent: [16, 80, 220, 600, 800, 1000], mortgage: 100 },
  { id: 20, type: 'parking', name: 'Frei Parken', price: 0 },
  { id: 21, type: 'property', name: 'Theaterstr.', group: GROUPS.RED, color: 'bg-red-500', price: 220, houseCost: 150, rent: [18, 90, 250, 700, 875, 1050], mortgage: 110 },
  { id: 22, type: 'chance', name: 'Ereignis', price: 0 },
  { id: 23, type: 'property', name: 'Museumstr.', group: GROUPS.RED, color: 'bg-red-500', price: 220, houseCost: 150, rent: [18, 90, 250, 700, 875, 1050], mortgage: 110 },
  { id: 24, type: 'property', name: 'Opernplatz', group: GROUPS.RED, color: 'bg-red-500', price: 240, houseCost: 150, rent: [20, 100, 300, 750, 925, 1100], mortgage: 120 },
  { id: 25, type: 'property', name: 'Nordbahnhof', group: GROUPS.STATION, color: 'bg-black', text: 'text-white', price: 200, rent: [25, 50, 100, 200], mortgage: 100 },
  { id: 26, type: 'property', name: 'Lessingstr.', group: GROUPS.YELLOW, color: 'bg-yellow-400', price: 260, houseCost: 150, rent: [22, 110, 330, 800, 975, 1150], mortgage: 130 },
  { id: 27, type: 'property', name: 'Schillerstr.', group: GROUPS.YELLOW, color: 'bg-yellow-400', price: 260, houseCost: 150, rent: [22, 110, 330, 800, 975, 1150], mortgage: 130 },
  { id: 28, type: 'property', name: 'Wasserwerk', group: GROUPS.UTILITY, color: 'bg-gray-400', price: 150, rent: [], mortgage: 75 },
  { id: 29, type: 'property', name: 'Goethestr.', group: GROUPS.YELLOW, color: 'bg-yellow-400', price: 280, houseCost: 150, rent: [24, 120, 360, 850, 1025, 1200], mortgage: 140 },
  { id: 30, type: 'gotojail', name: 'Geh ins Gefängnis', price: 0 },
  { id: 31, type: 'property', name: 'Rathausplatz', group: GROUPS.GREEN, color: 'bg-green-600', text: 'text-white', price: 300, houseCost: 200, rent: [26, 130, 390, 900, 1100, 1275], mortgage: 150 },
  { id: 32, type: 'property', name: 'Hauptstr.', group: GROUPS.GREEN, color: 'bg-green-600', text: 'text-white', price: 300, houseCost: 200, rent: [26, 130, 390, 900, 1100, 1275], mortgage: 150 },
  { id: 33, type: 'chance', name: 'Gemeinschaft', price: 0 },
  { id: 34, type: 'property', name: 'Bahnhofstr.', group: GROUPS.GREEN, color: 'bg-green-600', text: 'text-white', price: 320, houseCost: 200, rent: [28, 150, 450, 1000, 1200, 1400], mortgage: 160 },
  { id: 35, type: 'property', name: 'Hauptbahnhof', group: GROUPS.STATION, color: 'bg-black', text: 'text-white', price: 200, rent: [25, 50, 100, 200], mortgage: 100 },
  { id: 36, type: 'chance', name: 'Ereignis', price: 0 },
  { id: 37, type: 'property', name: 'Parkstraße', group: GROUPS.DARKBLUE, color: 'bg-blue-800', text: 'text-white', price: 350, houseCost: 200, rent: [35, 175, 500, 1100, 1300, 1500], mortgage: 175 },
  { id: 38, type: 'tax', name: 'Zusatzsteuer', price: 0, amount: 100 },
  { id: 39, type: 'property', name: 'Schlossallee', group: GROUPS.DARKBLUE, color: 'bg-blue-800', text: 'text-white', price: 400, houseCost: 200, rent: [50, 200, 600, 1400, 1700, 2000], mortgage: 200 },
];

const CHANCE_CARDS = [
  { text: "Rücke vor bis auf Los.", action: "move", target: 0 },
  { text: "Bank Irrtum zu deinen Gunsten. Ziehe 200€ ein.", action: "money", amount: 200 },
  { text: "Arztkosten. Zahle 50€.", action: "money", amount: -50 },
  { text: "Gehe direkt ins Gefängnis.", action: "jail" },
  { text: "Du hast im Lotto gewonnen! Erhalte 100€.", action: "money", amount: 100 },
  { text: "Rücke vor bis zur Schlossallee.", action: "move", target: 39 },
  { text: "Gehe 3 Felder zurück.", action: "move_steps", steps: -3 },
  { text: "Mache einen Ausflug zum Südbahnhof.", action: "move", target: 5 },
  { text: "Renovierungskosten! Zahle 25€ pro Haus und 100€ pro Hotel.", action: "house_repairs_complex", house: 25, hotel: 100 },
  { text: "Strafe für zu schnelles Fahren. Zahle 15€.", action: "money", amount: -15 },
  { text: "Die Bank zahlt dir eine Dividende von 50€.", action: "money", amount: 50 },
  { text: "Rücke vor bis zur Seestraße.", action: "move", target: 11 },
];

const PLAYER_COLORS = [
  { name: 'Rot', bg: 'bg-red-600', border: 'border-red-600', light: 'bg-red-100', text: 'text-white' },
  { name: 'Blau', bg: 'bg-blue-600', border: 'border-blue-600', light: 'bg-blue-100', text: 'text-white' },
  { name: 'Grün', bg: 'bg-emerald-600', border: 'border-emerald-600', light: 'bg-emerald-100', text: 'text-white' },
  { name: 'Gelb', bg: 'bg-yellow-500', border: 'border-yellow-500', light: 'bg-yellow-100', text: 'text-black' },
  { name: 'Lila', bg: 'bg-purple-600', border: 'border-purple-600', light: 'bg-purple-100', text: 'text-white' },
  { name: 'Türkis', bg: 'bg-cyan-500', border: 'border-cyan-500', light: 'bg-cyan-100', text: 'text-black' },
];

const generateGameId = () => Math.random().toString(36).substr(2, 6).toUpperCase();

const INITIAL_GAME_STATE = {
    status: 'LOBBY', 
    players: [],
    currentPlayerIdx: 0,
    dice: [1, 1],
    gameLog: ["Spielraum erstellt."],
    consecutiveDoubles: 0,
    turnContinue: false
};

const getGridPosition = (index) => {
  if (index >= 0 && index <= 10) return { gridRow: 11, gridColumn: 11 - index };
  if (index > 10 && index <= 20) return { gridRow: 11 - (index - 10), gridColumn: 1 };
  if (index > 20 && index <= 30) return { gridRow: 1, gridColumn: 1 + (index - 20) };
  if (index > 30 && index < 40) return { gridRow: 1 + (index - 30), gridColumn: 11 };
  return { gridRow: 6, gridColumn: 6 };
};

export default function App() {
  const [errorMsg, setErrorMsg] = useState(null);
  
  // State
  const [gameId, setGameId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [joined, setJoined] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState(null); 
  const [gameState, setGameState] = useState(null);
  const [modal, setModal] = useState(null); 
  const [rolling, setRolling] = useState(false);
  const [dice, setDice] = useState([1, 1]); // Standardmäßig zeigt er 1 und 1
  const logsEndRef = useRef(null);

  const [lastHandledPos, setLastHandledPos] = useState(-1);
  const [lastHandledTurn, setLastHandledTurn] = useState(-1);
  const [hasRolled, setHasRolled] = useState(false);

  // --- FIREBASE SYNC ---
  useEffect(() => {
    if (!joined || !gameId) return;
    const gameRef = doc(db, "games", gameId);
    const unsubscribe = onSnapshot(gameRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
            setGameState(docSnapshot.data());
        } else {
            setErrorMsg("Spiel existiert nicht mehr.");
            setJoined(false);
        }
    }, (err) => {
        console.error("Firebase Error:", err);
        setErrorMsg("Verbindungsfehler: " + err.message);
    });
    return () => unsubscribe();
  }, [joined, gameId]);

  // --- HELPER ---
  const getOwner = (spaceId, players) => {
      if (!players) return undefined;
      return players.find(p => p.properties && p.properties.includes(spaceId));
  };

  const hasFullColorGroup = (player, group) => {
    if (!group || group === GROUPS.STATION || group === GROUPS.UTILITY) return false;
    const groupProps = BOARD_DATA.filter(b => b.group === group);
    return groupProps.every(p => player.properties?.includes(p.id));
  };

  const calculateRent = (spaceId, owner, dice, multiplier = 1) => {
    if (!owner) return 0;
    const space = BOARD_DATA[spaceId];
    if (owner.mortgaged && owner.mortgaged.includes(spaceId)) return 0;

    let baseRent = 0;
    if (space.group === GROUPS.STATION) {
      const stationsOwned = owner.properties ? owner.properties.filter(id => BOARD_DATA[id].group === GROUPS.STATION).length : 0;
      baseRent = space.rent[Math.max(0, stationsOwned - 1)] || 25;
    } else if (space.group === GROUPS.UTILITY) {
       const ownedCount = owner.properties ? owner.properties.filter(id => BOARD_DATA[id].group === GROUPS.UTILITY).length : 0;
       const multiplierValue = ownedCount === 2 ? 10 : 4;
       const currentDice = dice || [1, 1];
       baseRent = (currentDice[0] + currentDice[1]) * multiplierValue;
    } else {
      const houses = (owner.houses && owner.houses[spaceId]) || 0;
      if (houses > 0) {
          baseRent = space.rent[houses];
      } else {
          baseRent = space.rent[0];
          const groupProps = BOARD_DATA.filter(b => b.group === space.group);
          if (owner.properties && groupProps.every(p => owner.properties.includes(p.id))) {
              baseRent *= 2;
          }
      }
    }
    return baseRent * multiplier;
  };

  // --- ACTIONS ---
  const createGame = async () => {
      if (!playerName) return alert("Name fehlt");
      const newId = generateGameId();
      await setDoc(doc(db, "games", newId), {
          ...INITIAL_GAME_STATE,
          players: [{
              id: 0, name: playerName, money: 1500, pos: 0, color: 0, jailed: false, jailTurns: 0, properties: [], houses: {}, mortgaged: [], bankrupt: false
          }]
      });
      setGameId(newId);
      setMyPlayerId(0);
      setJoined(true);
  };

  const joinGame = async () => {
      if (!playerName || !gameId) return alert("Daten fehlen");
      const gameRef = doc(db, "games", gameId.toUpperCase());
      const snap = await getDoc(gameRef);
      if (!snap.exists()) return alert("Nicht gefunden");
      const data = snap.data();
      if (data.status !== 'LOBBY') return alert("Spiel läuft schon");
      if (data.players.length >= 6) return alert("Lobby voll");

      const newId = data.players.length;
      const newPlayer = {
          id: newId, name: playerName, money: 1500, pos: 0, color: newId, jailed: false, jailTurns: 0, properties: [], houses: {}, mortgaged: [], bankrupt: false
      };
      await updateDoc(gameRef, {
          players: arrayUnion(newPlayer),
          gameLog: arrayUnion(`${playerName} kam dazu.`)
      });
      setMyPlayerId(newId);
      setJoined(true);
  };

  const startMyGame = async () => {
      await updateDoc(doc(db, "games", gameId), { status: 'PLAYING', gameLog: arrayUnion("Spiel gestartet!") });
  };

  const updateDB = async (updates) => {
      try {
          await updateDoc(doc(db, "games", gameId), updates);
      } catch(e) { console.error("DB Error", e); }
  };

  const performPlayerUpdate = async (playerId, changes) => {
      const players = [...gameState.players];
      players[playerId] = { ...players[playerId], ...changes };
      await updateDB({ players });
  };

    // --- TRADE ACTION ---
    const executeTrade = async (tradeData) => {
        // 1. Sicherheits-Check
        if (!gameState || !gameState.players) return;

        // 2. Kopie des Spieler-Arrays erstellen (State nicht direkt mutieren)
        const players = [...gameState.players];
        
        // Indizes finden
        const myIdx = myPlayerId;
        const partnerIdx = players.findIndex(p => p.id === tradeData.partnerId);

        if (partnerIdx === -1) return; // Partner nicht gefunden

        // Kopien der beiden beteiligten Spieler erstellen
        const me = { ...players[myIdx] };
        const partner = { ...players[partnerIdx] };

        // 3. Geld transferieren (ParseInt zur Sicherheit, damit es Zahlen bleiben)
        const moneyGiven = parseInt(tradeData.giveMoney || 0);
        const moneyReceived = parseInt(tradeData.receiveMoney || 0);

        // Geld abziehen/hinzufügen
        me.money -= moneyGiven;
        partner.money += moneyGiven;

        me.money += moneyReceived;
        partner.money -= moneyReceived;

        // 4. Grundstücke transferieren
        
        // A) Ich gebe Grundstücke
        if (tradeData.giveProps && tradeData.giveProps.length > 0) {
            // Bei mir entfernen
            me.properties = me.properties.filter(id => !tradeData.giveProps.includes(id));
            // Beim Partner hinzufügen (Sicherstellen, dass Array existiert)
            partner.properties = [...(partner.properties || []), ...tradeData.giveProps];
        }

        // B) Ich bekomme Grundstücke
        if (tradeData.receiveProps && tradeData.receiveProps.length > 0) {
            // Beim Partner entfernen
            partner.properties = partner.properties.filter(id => !tradeData.receiveProps.includes(id));
            // Bei mir hinzufügen
            me.properties = [...(me.properties || []), ...tradeData.receiveProps];
        }

        // 5. Spieler-Objekte im Array aktualisieren
        players[myIdx] = me;
        players[partnerIdx] = partner;

        // 6. DB Update durchführen & Log schreiben & Modal schließen
        const logMsg = `HANDEL: ${me.name} und ${partner.name} haben getauscht.`;
        
        await updateDB({
            players,
            gameLog: arrayUnion(logMsg)
        });

        setModal(null);
    };  

    // 1. Das Angebot an den anderen schicken
    const sendTradeOffer = async (targetPlayerId, myOffer, theirAsk) => {
        await updateDB({
            pendingTrade: {
                fromId: myPlayerId,
                toId: targetPlayerId,
                offer: myOffer,  // z.B. { money: 500, props: [1, 5] }
                ask: theirAsk    // z.B. { money: 0, props: [12] }
            },
            gameLog: arrayUnion(`${gameState.players[myPlayerId].name} hat ein Handelsangebot an ${gameState.players[targetPlayerId].name} gesendet.`)
        });
        setModal(null);
    };

    // 2. Die Antwort des anderen verarbeiten
    const handleTradeResponse = async (accepted) => {
        if (!accepted) {
            await updateDB({
                pendingTrade: null, // Handel löschen
                gameLog: arrayUnion("Das Handelsangebot wurde abgelehnt.")
            });
            return;
        }

        // Wenn angenommen -> Eigentliche Tausch-Logik
        const trade = gameState.pendingTrade;
        const players = [...gameState.players];
        const sender = players[trade.fromId];
        const receiver = players[trade.toId];

        // Geld transferieren
        sender.money -= trade.offer.money;
        receiver.money += trade.offer.money;
        receiver.money -= trade.ask.money;
        sender.money += trade.ask.money;

        // A) Ich gebe Grundstücke
        if(trade.offer.props && trade.offer.props.length > 0){
            sender.properties = sender.properties.filter(id => !trade.offer.props.includes(id));
            // Beim Partner hinzufügen (Sicherstellen, dass Array existiert)
            receiver.properties = [...(receiver.properties || []), ...trade.offer.props];
        }

        // B) Ich bekomme Grundstücke
        if (trade.ask.props && trade.ask.props.length > 0) {
            // Beim Partner entfernen
            receiver.properties = receiver.properties.filter(id => !trade.ask.props.includes(id));
            // Bei mir hinzufügen
            sender.properties = [...(sender.properties || []), ...trade.ask.props];
        }

        // 5. Spieler-Objekte im Array aktualisieren
        players[trade.fromId] = sender;
        players[trade.toId] = receiver;

        // 6. DB Update durchführen & Log schreiben & Modal schließen
        const logMsg = `HANDEL: ${sender.name} und ${receiver.name} haben getauscht.`;
        // trade.offer.props.forEach(propId => {
        //     // Logik um Besitzer von sender zu receiver zu ändern
        // });
        // trade.ask.props.forEach(propId => {
        //     // Logik um Besitzer von receiver zu sender zu ändern
        // });

        await updateDB({
            players,
            pendingTrade: null,
            gameLog: arrayUnion("Handel erfolgreich abgeschlossen!")
        });
    };    

    const payJailFine = async () => {
      const players = [...gameState.players];
      const me = { ...players[myPlayerId] };

      if (me.money < 50) return alert("Nicht genug Geld!");

      me.money -= 50;
      me.jailed = false;
      me.jailTurns = 0;
      
      players[myPlayerId] = me;

      await updateDB({
          players,
          gameLog: arrayUnion(`${me.name} zahlt 50€ und ist frei. (Bitte jetzt würfeln!)`)
      });
      // Jetzt ist 'jailed' false, der Spieler kann ganz normal würfeln und ziehen.
  };

const handleRollDice = async () => {
      if (!gameState || gameState.currentPlayerIdx !== myPlayerId) return;
      
      // KORREKTUR: Wir erlauben das Würfeln, wenn 'turnContinue' true ist (Pasch),
      // selbst wenn 'hasRolled' schon true ist.
      if (rolling) return;
      if (hasRolled && !gameState.turnContinue) return; 

      setRolling(true);

        setTimeout(async () => {
            setRolling(false);
            setHasRolled(true);

            const d1 = Math.ceil(Math.random() * 6);
            const d2 = Math.ceil(Math.random() * 6);
            const total = d1 + d2;
            const isDouble = d1 === d2;
            
            setDice([d1, d2]);
            let updates = { dice: [d1, d2] };
            let logMsg = `${gameState.players[myPlayerId].name} würfelt ${d1} & ${d2}.`;
            
            const players = [...gameState.players];
            const me = { ...players[myPlayerId] };
            
            let nextConsecutiveDoubles = gameState.consecutiveDoubles || 0;
            
            setTimeout(() => {
            // --- GEFÄNGNIS LOGIK ---
            if (me.jailed) {
                
                if (isDouble) {
                    // FALL A: Pasch gewürfelt -> Sofort frei und ziehen
                    // WICHTIG: Hier machen wir das Update manuell, um sicherzugehen, dass turnContinue = false ist!
                    logMsg += " PASCH! Du bist frei!";
                    me.jailed = false;
                    me.jailTurns = 0;
                    
                    movePlayerLogic(me, total, players, updates, logMsg, false, 0); 
                    // Das 'false' hier ist entscheidend!
                    
                } else {
                    // Kein Pasch
                    me.jailTurns = (me.jailTurns || 0) + 1;

                    if (me.jailTurns >= 3) {
                        // FALL B: 3. Versuch misslungen -> Zwangszahlung & Ziehen
                        logMsg += " 3. Fehlversuch. Du zahlst 50€ und ziehst.";
                        me.money -= 50;
                        me.jailed = false;
                        me.jailTurns = 0;
                        movePlayerLogic(me, total, players, updates, logMsg, false, 0);
                    } else {
                        // FALL C: Sitzenbleiben
                        logMsg += ` Kein Pasch (${me.jailTurns}/3). Du bleibst sitzen.`;
                        players[myPlayerId] = me;
                        
                        updateDB({ 
                            players, 
                            ...updates, 
                            gameLog: arrayUnion(logMsg), 
                            turnContinue: false, // Zug definitiv zu Ende
                            consecutiveDoubles: 0 
                        });
                    }
                }

            } 
            // --- NORMALE LOGIK ---
            else {
                if (isDouble) {
                    nextConsecutiveDoubles++;
                    if (nextConsecutiveDoubles === 3) {
                        logMsg += " 3x Pasch -> Ab ins Gefängnis!";
                        me.pos = 10;
                        me.jailed = true;
                        me.jailTurns = 0;
                        nextConsecutiveDoubles = 0;
                        players[myPlayerId] = me;
                        updateDB({ players, ...updates, gameLog: arrayUnion(logMsg), turnContinue: false, consecutiveDoubles: 0 });
                    } else {
                        // Normaler Pasch -> Darf nochmal (turnContinue: true)
                        movePlayerLogic(me, total, players, updates, logMsg, true, nextConsecutiveDoubles);
                    }
                } else {
                    movePlayerLogic(me, total, players, updates, logMsg, false, 0);
                }
            }},1000);
        }, 10);
    }; 

    const movePlayerLogic = async (me, steps, players, updates, logMsg, turnContinue = false, doubles = 0) => {
        let newPos = me.pos + steps;
        
        // Über Los gegangen?
        if (newPos >= 40) { // Angenommen 40 Felder
            newPos -= 40;
            me.money += 200;
            logMsg += " (+200€)";
        }
        
        me.pos = newPos;
        players[myPlayerId] = me; // Spieler im Array aktualisieren

        // 1. In Datenbank speichern
        await updateDB({
            players,
            ...updates,
            gameLog: arrayUnion(logMsg),
            turnContinue,
            consecutiveDoubles: doubles
        });
        // 2. WICHTIG: Jetzt prüfen, wo wir gelandet sind!
        // Wir übergeben 'players', damit checkSpace schon weiß, dass wir Geld haben/verloren haben
        checkSpace(newPos, players); 
    };

  const nextPlayer = async () => {
        // 1. Lokalen Status sofort resetten (wichtig für flüssige UI)
        setHasRolled(false);
        setModal(null); 

        // 2. Nächsten Spieler berechnen
        let nextIdx = (gameState.currentPlayerIdx + 1) % gameState.players.length;

        // (Optional) Bankrotte Spieler überspringen
        let count = 0;
        while (gameState.players[nextIdx].bankrupt && count < gameState.players.length) {
            nextIdx = (nextIdx + 1) % gameState.players.length;
            count++;
        }

        // 3. Datenbank Update
        await updateDB({
            currentPlayerIdx: nextIdx,
            turnContinue: false,      // WICHTIG: Pasch-Status löschen!
            consecutiveDoubles: 0,    // WICHTIG: Pasch-Zähler löschen!
            gameLog: arrayUnion(`Zug beendet. ${gameState.players[nextIdx].name} ist dran.`)
        });
    };

    // Wir fügen ein zweites Argument 'currentPlayers' hinzu (Standardwert: gameState.players)
    const checkSpace = (pos, currentPlayers = gameState.players) => {
        const space = BOARD_DATA[pos];
        if (!space) return;

        // START
        if (space.type === 'start') {
            // Geld wurde schon in movePlayerLogic addiert, hier nur Meldung falls nötig
            // Oder doppelte Sicherheit:
            // const players = [...currentPlayers];
            // updateDB({ gameLog: arrayUnion("Auf LOS gelandet.") });
            return;
        }

        // GEFÄNGNIS FELD (Gehe ins Gefängnis)
        if (space.type === 'gotojail') {
            const players = [...currentPlayers];
            players[myPlayerId].pos = 10;
            players[myPlayerId].jailed = true;
            players[myPlayerId].jailTurns = 0; // Reset counter
            
            updateDB({ 
                players, 
                turnContinue: false, // Zug sofort vorbei
                gameLog: arrayUnion("Ab ins Gefängnis!") 
            });
            return;
        }

        // EREIGNISFELDER
        if (space.type === 'chance' || space.type === 'chest') { // Habe 'chest' ergänzt falls du Gemeinschaftsfelder hast
            // Hier simple Zufallskarte wählen (oder deine Logik)
            const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
            setModal({ type: 'show_card', card });
            return;
        }

        // STEUER
        if (space.type === 'tax') {
            setModal({ type: 'expense', title: space.name, amount: space.amount });
            return;
        }

        // GRUNDSTÜCKE / BAHNHÖFE / WERKE
        if (space.group) { // Ich prüfe hier auf 'group' statt 'type', das ist meist sicherer bei BOARD_DATA
            const owner = getOwner(pos, currentPlayers); // Hier currentPlayers nutzen!
            
            if (owner) {
                // Gehört jemandem
                if (owner.id !== myPlayerId && !owner.jailed) { // Miete nur zahlen wenn Besitzer nicht im Knast
                    const rent = calculateRent(pos, owner, currentDice || gameState.dice); // currentDice nutzen falls vorhanden
                    if (rent > 0) {
                        setModal({ type: 'pay_rent', ownerId: owner.id, amount: rent, spaceName: space.name });
                    }
                }
            } else {
                // Gehört niemandem -> Kaufen
                setModal({ type: 'buy', space });
            }
        }
    };

  // --- MODAL HANDLERS ---
  const finishCardAction = async (card) => {
      const players = [...gameState.players];
      const me = players[myPlayerId];
      let msg = `Karte: ${card.text}`;
      let localModal = null;

      if (card.action === 'money') {
          if (card.amount < 0 && me.money < Math.abs(card.amount)) {
              localModal = { type: 'expense', title: 'Strafe', amount: Math.abs(card.amount) };
          } else {
              me.money += card.amount;
          }
      } else if (card.action === 'move') {
          me.pos = card.target;
          if (card.target === 0) me.money += 200;
          setTimeout(() => checkSpace(me.pos), 500); 
      } else if (card.action === 'move_steps') {
          me.pos += card.steps;
          if (me.pos < 0) me.pos += BOARD_SIZE;
      } else if (card.action === 'jail') {
          me.pos = 10;
          me.jailed = true;
      } else if (card.action === 'house_repairs') {
          me.money -= 100;
      }

      if (localModal) {
          setModal(localModal);
      } else {
          await updateDB({ players, gameLog: arrayUnion(msg) });
          setModal(null);
      }
  };

  const execBuy = async () => {
      const space = modal.space;
      const players = [...gameState.players];
      const me = players[myPlayerId];
      me.money -= space.price;
      if (!me.properties) me.properties = [];
      me.properties.push(space.id);
      await updateDB({ players, gameLog: arrayUnion(`${me.name} kauft ${space.name}`) });
      setModal(null);
  };

  const execPay = async (targetId, amount) => {
      const players = [...gameState.players];
      const me = players[myPlayerId];
      me.money -= amount;
      if (targetId !== 'BANK') players[targetId].money += amount;
      await updateDB({ players, gameLog: arrayUnion(`${me.name} zahlt ${amount}€`) });
      setModal(null);
  };

  const execBankruptcy = async (creditorId) => {
      const players = [...gameState.players];
      const me = players[myPlayerId];
      if (creditorId !== 'BANK') {
          const creditor = players[creditorId];
          creditor.money += Math.max(0, me.money);
          if (me.properties) creditor.properties.push(...me.properties);
      }
      players[myPlayerId] = { ...me, money: 0, properties: [], bankrupt: true };
      
      const active = players.filter(p => !p.bankrupt);
      if (active.length <= 1) {
          await updateDB({ players, status: 'GAME_OVER', gameLog: arrayUnion(`${me.name} ist raus!`) });
      } else {
          let nextIdx = (gameState.currentPlayerIdx + 1) % players.length;
          while(players[nextIdx].bankrupt) nextIdx = (nextIdx + 1) % players.length;
          await updateDB({ players, currentPlayerIdx: nextIdx, gameLog: arrayUnion(`${me.name} ist bankrott!`) });
      }
      setModal(null);
  };

  // --- ACTIONS FOR MANAGE MODAL ---
  const buildHouse = async (spaceId) => {
    const players = [...gameState.players];
    const me = players[myPlayerId];
    const space = BOARD_DATA[spaceId];
    
    if (me.money < space.houseCost) return alert("Nicht genug Geld");
    if (!me.houses) me.houses = {};
    const currentHouses = me.houses[spaceId] || 0;
    if (currentHouses >= 5) return;

    me.money -= space.houseCost;
    me.houses[spaceId] = currentHouses + 1;
    
    await updateDB({ players, gameLog: arrayUnion(`${me.name} baut auf ${space.name}`) });
  };

  const toggleMortgage = async (spaceId) => {
    const players = [...gameState.players];
    const me = players[myPlayerId];
    const space = BOARD_DATA[spaceId];
    if (!me.mortgaged) me.mortgaged = [];

    if (me.mortgaged.includes(spaceId)) {
        const cost = Math.floor(space.mortgage * 1.1);
        if (me.money < cost) return alert("Nicht genug Geld");
        me.money -= cost;
        me.mortgaged = me.mortgaged.filter(id => id !== spaceId);
        await updateDB({ players, gameLog: arrayUnion(`${me.name} löst Hypothek auf ${space.name}`) });
    } else {
        me.money += space.mortgage;
        me.mortgaged.push(spaceId);
        await updateDB({ players, gameLog: arrayUnion(`${me.name} nimmt Hypothek auf ${space.name}`) });
    }
  };

  // --- RENDER MODAL ---
  const renderModal = () => {
    if (!modal) return null;

    if (modal.type === 'view_space') {
        // Logik für die Hintergrundfarbe der Kopfzeile
        let headerColor = 'bg-gray-400'; // Standard (z.B. Werke)
        if (modal.space.color) {
            headerColor = modal.space.color; // Normale Straßenfarben
        } else if (modal.space.group === GROUPS.STATION) {
            headerColor = 'bg-black'; // Bahnhöfe schwarz (oder weiß, je nach Design)
        }

        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
                <div 
                    className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200" 
                    onClick={e => e.stopPropagation()} // Verhindert Schließen beim Klick auf die Karte
                >
                    {/* Header Bereich (Farbe & Name) */}
                    <div className={`h-24 ${headerColor} rounded-t-lg -mx-6 -mt-6 mb-4 flex items-center justify-center relative overflow-hidden`}>
                        <h2 className={`text-2xl font-bold ${modal.space.text || 'text-white'} relative z-10 shadow-black drop-shadow-md`}>
                            {modal.space.name}
                        </h2>
                        <button 
                            onClick={() => setModal(null)} 
                            className="absolute top-2 right-2 text-white/80 hover:text-white"
                        >
                            <X size={24}/>
                        </button>
                    </div>

                    {/* Preis Anzeige */}
                    <div className="flex justify-between items-end border-b pb-2 mb-2">
                        <span className="text-lg font-bold">Kaufpreis</span>
                        <span className="text-2xl font-bold text-gray-800">
                            {modal.space.price > 0 ? modal.space.price + ' €' : '-'}
                        </span>
                    </div>

                    {/* HIER wird die Tabelle eingefügt */}
                    <RentTable space={modal.space} />

                    {/* Footer Hinweis */}
                    <div className="mt-4 text-xs text-center text-gray-400">
                        Klicke außerhalb um zu schließen
                    </div>
                </div>
            </div>
        );
    }

    if (modal.type === 'show_card') {
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
                <div className="bg-orange-50 rounded-xl shadow-2xl p-8 max-w-sm w-full border-4 border-orange-200 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                    <div className="absolute top-[-20px] left-[-20px] text-orange-200 opacity-20"><span className="text-9xl font-serif">?</span></div>
                    <div className="relative z-10 text-center">
                        <h3 className="text-orange-600 font-bold uppercase tracking-widest mb-6 border-b border-orange-200 pb-2">Ereigniskarte</h3>
                        <p className="text-xl font-medium mb-8 leading-relaxed text-gray-800">{modal.card.text}</p>
                        <button onClick={() => finishCardAction(modal.card)} className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-orange-600 transition-transform hover:scale-105">OK</button>
                    </div>
                </div>
            </div>
        );
    }

    const me = gameState.players[myPlayerId];
    
    if (modal.type === 'expense') {
        const canPay = me.money >= modal.amount;
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Building2 size={32}/></div>
                        <h2 className="text-xl font-bold mb-2">{modal.title}</h2>
                        <p className="text-gray-500">Du musst eine Gebühr entrichten.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center mb-6"><span className="font-bold text-gray-700">Betrag</span><span className="text-2xl font-bold text-red-600">-{modal.amount} €</span></div>
                    <div className="space-y-2">
                        <button onClick={() => execPay('BANK', modal.amount)} disabled={!canPay} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3 rounded-lg shadow-lg">{canPay ? 'Zahlen' : 'Zu wenig Geld!'}</button>
                        {!canPay && (<div className="grid grid-cols-2 gap-2"><button onClick={() => setModal({...modal, type: 'manage', returnTo: 'expense'})} className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-bold text-sm">Verwalten</button><button onClick={() => execBankruptcy('BANK')} className="bg-black hover:bg-gray-800 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1"><Skull size={14}/> Bankrott</button></div>)}
                    </div>
                </div>
            </div>
        );
    }

    if (modal.type === 'pay_rent') {
        const owner = gameState.players[modal.ownerId];
        const canPay = me.money >= modal.amount;
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
                    <div className="text-center mb-6"><h2 className="text-xl font-bold mb-1">{modal.spaceName}</h2><div className="text-sm text-gray-500 mb-4">Besitzer: <span className="font-bold text-black">{owner.name}</span></div></div>
                    <div className="bg-red-50 p-6 rounded-lg border border-red-100 flex flex-col items-center mb-6"><span className="text-xs uppercase font-bold text-red-400 mb-1">{modal.isDoubled ? 'Doppelte Miete fällig' : 'Miete fällig'}</span><span className="text-4xl font-black text-red-600">-{modal.amount} €</span></div>
                    <div className="space-y-2">
                        <button onClick={() => execPay(modal.ownerId, modal.amount)} disabled={!canPay} className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3 rounded-lg shadow-lg">{canPay ? 'Miete zahlen' : 'Zu wenig Geld!'}</button>
                        {!canPay && (<div className="grid grid-cols-2 gap-2"><button onClick={() => setModal({...modal, type: 'manage', returnTo: 'pay_rent'})} className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg font-bold text-sm">Verwalten</button><button onClick={() => execBankruptcy(modal.ownerId)} className="bg-black hover:bg-gray-800 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1"><Skull size={14}/> Bankrott</button></div>)}
                    </div>
                </div>
            </div>
        );
    }

    if (modal.type === 'buy') {
        const canBuy = me.money >= modal.space.price;
        return (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
                    <div className={`h-24 ${modal.space.color || (modal.space.group === GROUPS.STATION ? 'bg-black' : 'bg-gray-400')} rounded-t-lg -mx-6 -mt-6 mb-4 flex items-center justify-center relative overflow-hidden`}><h2 className={`text-2xl font-bold ${modal.space.text || 'text-white'} relative z-10`}>{modal.space.name}</h2></div>
                    <div className="flex justify-between items-end border-b pb-2 mb-2"><span className="text-lg font-bold">Kaufpreis</span><span className="text-2xl font-bold text-green-600">{modal.space.price} €</span></div>
                    <RentTable space={modal.space} />
                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <button onClick={execBuy} disabled={!canBuy} className="bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">{canBuy ? 'Kaufen' : 'Zu teuer'}</button>
                        <button onClick={() => { setModal(null); setLastHandledPos(me.pos); }} className="bg-gray-100 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-200 border">{canBuy ? 'Ablehnen' : 'Passen'}</button>
                    </div>
                </div>
            </div>
        );
    }

    if (modal.type === 'manage') {
        // Sortieren
        const myProps = (me.properties || []).sort((a, b) => a - b);

        // Farbe ermitteln (bleibt gleich)
        const getHeaderColor = (s) => {
            if (s.group === GROUPS.STATION) return 'bg-slate-800'; // Softeres Schwarz
            if (s.group === GROUPS.UTILITY) return 'bg-slate-500'; 
            return s.color || 'bg-slate-300';
        };

        return (
            // 1. Hintergrund dunkler und unschärfer (backdrop-blur-md)
            <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50 p-4 backdrop-blur-md">
                
                {/* 2. Modal-Container: Nicht mehr reines Weiß, sondern 'bg-slate-50' (ganz helles Grau) */}
                <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
                    
                    {/* 3. Header: Dunkel (Slate-800) für weniger Blendung oben */}
                    <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-800 text-white">
                        <div>
                            <h2 className="font-bold text-2xl flex items-center gap-3">
                                {/* Icon Farbe angepasst auf helles Indigo */}
                                <Building2 className="text-indigo-300 w-8 h-8"/> 
                                Immobilien Verwaltung
                            </h2>
                            <p className="text-slate-300 text-sm mt-1">Verwalte deine Gebäude, Mieten und Hypotheken</p>
                        </div>
                        <button 
                            onClick={() => modal.returnTo ? setModal({ ...modal, type: modal.returnTo }) : setModal(null)} 
                            className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-300 hover:text-white"
                        >
                            {modal.returnTo ? <ArrowLeft size={24}/> : <X size={24}/>}
                        </button>
                    </div>

                    {/* 4. Hintergrund des Scroll-Bereichs: Etwas dunkler (Slate-200) damit die Karten sich abheben */}
                    <div className="p-6 overflow-y-auto bg-slate-200/60">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            
                            {myProps.length === 0 && (
                                <div className="text-slate-500 text-center col-span-full py-12 flex flex-col items-center gap-4">
                                    <Building2 size={48} className="opacity-20"/>
                                    <span className="text-lg font-medium">Keine Grundstücke vorhanden.</span>
                                </div>
                            )}

                            {myProps.map(id => {
                                const s = BOARD_DATA[id];
                                const canBuild = hasFullColorGroup(me, s.group) && !me.mortgaged?.includes(id);
                                const isMortgaged = me.mortgaged?.includes(id);
                                const houses = me.houses?.[id] || 0;
                                const rent = calculateRent(id, me);

                                return (
                                    // 5. Karte: Weiß ist okay hier, da der Hintergrund grau ist. 
                                    // Wir nehmen aber 'bg-[#f8fafc]' (Slate-50), das ist minimal weicher als #fff
                                    <div key={id} className={`bg-[#f8fafc] rounded-xl shadow-sm border border-slate-300 flex flex-col overflow-hidden transition-all hover:shadow-md ${isMortgaged ? 'opacity-60 grayscale' : ''}`}>
                                        
                                        {/* Farb-Streifen */}
                                        <div className={`h-4 w-full ${getHeaderColor(s)}`}></div>
                                        
                                        <div className="p-5 flex flex-col h-full gap-4">
                                            
                                            {/* Titel */}
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-bold text-xl leading-tight text-slate-800">{s.name}</h3>
                                                
                                                {houses > 0 && (
                                                    <div className="flex gap-1 bg-slate-200 px-2 py-1 rounded-full items-center">
                                                        {houses === 5 ? (
                                                            <Hotel size={18} className="text-rose-600"/>
                                                        ) : (
                                                            Array(houses).fill(0).map((_, i) => (
                                                                <Home key={i} size={14} className="text-emerald-600 fill-emerald-600"/>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Miete Box: Dunkleres Grau (Slate-100) statt Weiß */}
                                            <div className="bg-slate-100 rounded-lg p-3 border border-slate-200 text-center shadow-inner">
                                                <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Aktuelle Miete</div>
                                                {/* Farbe: Slate-700 statt grellem Indigo */}
                                                <div className="text-2xl font-extrabold text-slate-700">{rent}€</div>
                                            </div>

                                            {/* Details */}
                                            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 border-t border-slate-200 pt-3 mt-1">
                                                <div>
                                                    <span className="block text-xs text-slate-400">Hauskosten</span>
                                                    <span className="font-semibold">{s.houseCost ? s.houseCost + '€' : '-'}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="block text-xs text-slate-400">Hypothekenwert</span>
                                                    <span className="font-semibold">{s.mortgage}€</span>
                                                </div>
                                            </div>

                                            {/* Buttons: Farben weicher gemacht (Emerald/Rose statt Green/Red) */}
                                            <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
                                                
                                                {s.group !== GROUPS.STATION && s.group !== GROUPS.UTILITY && (
                                                    <button 
                                                        onClick={() => buildHouse(id)} 
                                                        disabled={!canBuild || houses >= 5}
                                                        className={`py-2 px-1 rounded-lg text-sm font-bold border flex flex-col items-center justify-center transition-colors
                                                            ${houses >= 5 || !canBuild 
                                                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                                                                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'}`}
                                                    >
                                                        <span>{houses === 4 ? '+ Hotel' : '+ Haus'}</span>
                                                        <span className="text-xs opacity-70 font-normal">{s.houseCost}€</span>
                                                    </button>
                                                )}

                                                <button 
                                                    onClick={() => toggleMortgage(id)} 
                                                    className={`py-2 px-1 rounded-lg text-sm font-bold border flex items-center justify-center transition-colors w-full
                                                        ${s.group === GROUPS.STATION || s.group === GROUPS.UTILITY ? 'col-span-2' : ''}
                                                        ${isMortgaged 
                                                            ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100' 
                                                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                                                >
                                                    {isMortgaged ? 'Auslösen' : 'Hypothek'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 1. PARTNER AUSWÄHLEN (Korrigiert)
    if (modal.type === 'trade_select_partner') {
        // FEHLERBEHEBUNG: Sicherstellen, dass gameState geladen ist
        if (!gameState || !gameState.players) return null;

        // Wir holen uns die players aus dem gameState
        const players = gameState.players;

        // Filter: Alle Spieler außer mir selbst (myPlayerId) und Bankrotte
        const otherPlayers = players.filter(p => p.id !== myPlayerId && !p.bankrupt);

        return (
            <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
                    <div className="bg-slate-100 p-4 border-b">
                        <h3 className="font-bold text-lg text-slate-700">Mit wem handeln?</h3>
                    </div>
                    <div className="p-4 flex flex-col gap-2">
                        {otherPlayers.map(p => (
                            <button 
                                key={p.id}
                                onClick={() => setModal({ type: 'trade_offer', partnerId: p.id })}
                                className="flex items-center justify-between p-3 rounded-lg border hover:bg-indigo-50 hover:border-indigo-300 transition-all group"
                            >
                                <span className="font-bold text-slate-700 group-hover:text-indigo-700">{p.name}</span>
                                <span className="text-sm font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded">{p.money}€</span>
                            </button>
                        ))}
                        {otherPlayers.length === 0 && <div className="text-gray-400 text-center">Keine Partner verfügbar.</div>}
                    </div>
                    <div className="p-4 border-t bg-slate-50">
                        <button onClick={() => setModal(null)} className="w-full py-2 text-slate-500 hover:bg-slate-200 rounded font-bold">Abbrechen</button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. DAS HANDELS-FENSTER (Korrigiert)
    if (modal.type === 'trade_offer') {
        // FEHLERBEHEBUNG: Auch hier gameState prüfen
        if (!gameState || !gameState.players) return null;

        const players = gameState.players;

        // "me" bin immer ich (myPlayerId), nicht zwingend der, der gerade am Zug ist (current)
        const me = players[myPlayerId];
        const partner = players.find(p => p.id === modal.partnerId);

        // Falls Partner nicht gefunden (Fehlerfall)
        if (!partner) { setModal(null); return null; }
        

        return (
            <TradeInterface 
            me={me} 
            partner={partner} 
            boardData={BOARD_DATA} 
            onCancel={() => setModal(null)}
            onConfirm={(data) => sendTradeOffer(data.partnerId,data.offer,data.ask)}
            />
        );
    }

    return null;
  };

  // --- RENDER MAIN ---
  if (errorMsg) return <div className="p-10 text-red-500 bg-white">Fehler: {errorMsg}</div>;
  if (!joined) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 flex items-center justify-center p-4 font-sans text-white">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 relative overflow-hidden">
            <div className="absolute top-[-50px] left-[-50px] opacity-20"><Dice5 size={150} /></div>
            <div className="absolute bottom-[-30px] right-[-30px] opacity-20"><Building2 size={120} /></div>
            <h1 className="text-4xl font-black mb-6 flex items-center gap-3 text-center justify-center drop-shadow-lg"><Building2 className="text-emerald-400" size={32}/> Tycoon</h1>
            <div className="space-y-4 relative z-10">
                <div>
                    <label className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Dein Name</label>
                    <input value={playerName} onChange={e=>setPlayerName(e.target.value)} className="w-full bg-black/20 border-2 border-indigo-500/30 rounded-xl p-4 mt-2 focus:border-emerald-500 focus:outline-none font-bold text-lg transition-colors" placeholder="Name..."/>
                </div>
                <div className="pt-4 space-y-3">
                    <button onClick={createGame} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 py-4 rounded-xl font-black text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95"><Plus size={20}/> Neues Spiel erstellen</button>
                    <div className="flex gap-2">
                        <input value={gameId} onChange={e=>setGameId(e.target.value.toUpperCase())} className="flex-1 bg-black/20 border-2 border-indigo-500/30 rounded-xl p-4 text-center tracking-[0.2em] font-mono font-bold text-lg" placeholder="CODE"/>
                        <button onClick={joinGame} className="bg-blue-600 hover:bg-blue-500 px-8 rounded-xl font-bold shadow-lg transition-transform active:scale-95">Beitreten</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  if (!gameState) return <div className="p-10">Lade...</div>;
  if (gameState.status === 'LOBBY') return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-white flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-10 left-10 opacity-20 animate-bounce"><Star size={60} /></div>
        <div className="absolute bottom-20 right-20 opacity-20 animate-pulse"><Sparkles size={80} /></div>
        
        <h1 className="text-6xl font-black mb-8 tracking-tighter drop-shadow-2xl flex items-center gap-4"><Crown size={48} className="text-yellow-300"/> LOBBY <Crown size={48} className="text-yellow-300"/></h1>
        
        <div className="bg-white/20 backdrop-blur-lg p-6 rounded-3xl mb-8 flex items-center gap-4 border-2 border-white/30 shadow-2xl cursor-pointer hover:bg-white/30 transition-all active:scale-95" onClick={() => { navigator.clipboard.writeText(gameId);}}>
            <div className="text-6xl font-mono font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-100">{gameId}</div>
            <div className="bg-white/20 p-3 rounded-full"><Copy size={32} /></div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
            {gameState.players?.map(p => (
                <div key={p.id} className="bg-black/30 backdrop-blur-md p-4 w-48 text-center rounded-xl font-bold border border-white/10 flex items-center justify-center gap-3 shadow-lg transform hover:scale-105 transition-transform">
                    <div className={`w-3 h-3 rounded-full ${PLAYER_COLORS[p.color].bg}`}></div>
                    {p.name} {p.id===0 && <Crown size={16} className="text-yellow-400"/>}
                </div>
            ))}
            {Array.from({length: Math.max(0, 6 - (gameState.players?.length||0))}).map((_, i) => (
                <div key={i} className="bg-black/10 p-4 w-48 text-center rounded-xl border-2 border-dashed border-white/20 text-white/30 flex items-center justify-center gap-2">
                    <User size={20}/> Leer
                </div>
            ))}
        </div>

        {myPlayerId === 0 ? 
            <button onClick={startMyGame} className="bg-gradient-to-r from-green-400 to-emerald-600 px-16 py-5 rounded-full font-black text-2xl shadow-2xl hover:scale-105 transition-transform flex items-center gap-3 border-4 border-white/20"><Play fill="currentColor" size={32}/> STARTEN</button> 
            : <div className="mt-6 text-center text-white/80 font-bold text-xl animate-pulse bg-black/20 px-6 py-2 rounded-full">Warte auf Host...</div>
        }
    </div>
  );

  const activeP = gameState.players[gameState.currentPlayerIdx] || {};
  const me = gameState.players[myPlayerId] || {};
  const myMoney = me.money || 0;
  const isMyTurn = gameState.currentPlayerIdx === myPlayerId;
  const currentDice = gameState.dice || [1, 1];
  const activeColorObj = PLAYER_COLORS[activeP.color || 0];

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-gray-900 flex flex-col items-center p-4 gap-6">
      <div className="flex-1 w-full flex items-center justify-center overflow-auto py-4">
        <div className="origin-center">
            <div className="grid gap-1 bg-black p-1 shadow-2xl relative select-none rounded-sm" style={{ gridTemplateColumns: 'repeat(11, minmax(110px, 1fr))', gridTemplateRows: 'repeat(11, minmax(110px, 1fr))' }}>
                {/* CENTER CONTROL */}
                <div className="col-start-2 col-end-11 row-start-2 row-end-11 bg-slate-800 flex flex-col items-center justify-center p-4 relative">
                    <div className="z-10 w-full max-w-2xl bg-white/90 backdrop-blur p-8 rounded-xl shadow-xl border border-gray-200">
                        {gameState.status === 'GAME_OVER' ? (
                            <div className="text-center py-10">
                                <Trophy size={80} className="text-yellow-500 mx-auto mb-4 animate-bounce" />
                                <h2 className="text-3xl font-black text-gray-800 mb-2">SPIEL VORBEI!</h2>
                                <button onClick={() => window.location.reload()} className="mt-8 px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg">Neues Spiel</button>
                            </div>
                        ) : (
                            <>
                                {/* HEADLINE: WER IST DRAN & GELD */}
                                <div className="flex justify-between items-center mb-6 border-b pb-4">
                                    <div>
                                        <div className="text-xs uppercase text-gray-500 font-bold">Am Zug</div>
                                        <div className={`text-2xl font-black flex items-center gap-2 ${activeColorObj.text}`}>
                                            <span className={`px-2 py-1 rounded ${activeColorObj.bg} flex items-center gap-2 shadow-sm`}>
                                                <User size={20}/> {activeP.name}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs uppercase text-gray-500 font-bold">Mein Geld</div>
                                        <div className={`text-2xl font-mono ${myMoney < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {myMoney} €
                                        </div>
                                    </div>
                                </div>

                                {/* WÜRFEL ANZEIGE */}
                                <div className="flex justify-center gap-6 mb-6">
                                    <div className="w-20 h-20 bg-gradient-to-br from-white to-gray-100 rounded-xl shadow border border-gray-200 flex items-center justify-center text-4xl font-bold text-gray-800">
                                        {dice[0]}
                                    </div>
                                    <div className="w-20 h-20 bg-gradient-to-br from-white to-gray-100 rounded-xl shadow border border-gray-200 flex items-center justify-center text-4xl font-bold text-gray-800">
                                        {dice[1]}
                                    </div>
                                </div>

                                {/* BUTTONS UND LOGIK */}
                                <div className="space-y-4">
                                    {/* Nur anzeigen wenn ich dran bin und kein Fenster offen ist */}
                                    {gameState.currentPlayerIdx === myPlayerId && !modal && (
                                        
                                        // --- FALL 1: SPIELER IST IM GEFÄNGNIS ---
                                        gameState.players[myPlayerId].jailed ? (
                                            <div className="bg-red-50 p-4 rounded-xl border border-red-100 animate-in fade-in slide-in-from-bottom-4">
                                                <div className="text-center mb-4">
                                                    <h3 className="font-bold text-red-600 flex items-center justify-center gap-2">
                                                        <Lock size={20}/> Im Gefängnis
                                                    </h3>
                                                    <p className="text-xs text-red-400 font-bold uppercase mt-1">
                                                        Versuch {gameState.players[myPlayerId].jailTurns + 1} von 3
                                                    </p>
                                                </div>

                                                {!hasRolled ? (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {/* OPTION A: Auf Pasch würfeln */}
                                                        <button 
                                                            onClick={handleRollDice} 
                                                            disabled={rolling} 
                                                            className="py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                                                        >
                                                            <Dice5 />
                                                            <span className="text-xs">Auf Pasch</span>
                                                        </button>
                                                        
                                                        {/* OPTION B: Freikaufen */}
                                                        <button 
                                                            onClick={payJailFine} 
                                                            disabled={gameState.players[myPlayerId].money < 50 || rolling} 
                                                            className="py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-1 shadow-lg transition-transform active:scale-95"
                                                        >
                                                            <Unlock />
                                                            <span className="text-xs">Freikaufen (50€)</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    // Wenn gewürfelt wurde, aber man noch immer 'jailed' ist -> Fehlgeschlagen
                                                    <button 
                                                        onClick={nextPlayer} 
                                                        className="w-full py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl shadow-lg font-bold text-lg flex items-center justify-center gap-2"
                                                    >
                                                        <ArrowRight /> Leider nicht geklappt, weiter
                                                    </button>
                                                )}
                                            </div>

                                        ) : (
                                            // --- FALL 2: NORMALER ZUG ---
                                            // Zeige Würfeln, wenn: Noch nicht gewürfelt ODER Pasch (turnContinue)
                                            (gameState.turnContinue || (!rolling && !hasRolled)) ? (
                                                <button 
                                                    onClick={handleRollDice} 
                                                    disabled={rolling}
                                                    className={`w-full py-5 text-white rounded-xl shadow-lg font-bold text-xl flex items-center justify-center gap-2 transition-all active:scale-95
                                                        ${gameState.turnContinue 
                                                            ? "bg-purple-600 hover:bg-purple-700 animate-pulse" // Pasch Design
                                                            : "bg-indigo-600 hover:bg-indigo-700"              // Normal Design
                                                        }`}
                                                >
                                                    <Dice5 /> 
                                                    {gameState.turnContinue ? "PASCH! NOCHMAL WÜRFELN" : "WÜRFELN"}
                                                </button>
                                            ) : (
                                                // Zeige Zug beenden nur, wenn gewürfelt wurde UND kein Pasch mehr offen ist
                                                <button 
                                                    onClick={nextPlayer} 
                                                    className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg font-bold text-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                                                >
                                                    <ArrowRight /> ZUG BEENDEN
                                                </button>
                                            )
                                        )
                                    )}

                                    {!isMyTurn && (
                                        <div className="text-gray-400 italic text-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                                            Warte auf <span className="font-bold text-gray-600">{activeP.name}</span>...
                                        </div>
                                    )}

                                    {/* IMMOBILIEN & HANDEL BUTTONS */}
                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <button onClick={() => setModal({ type: 'manage' })} className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-sm flex items-center justify-center gap-1 border border-gray-300 transition-colors">
                                            <Building2 size={16}/> Immobilien
                                        </button>
                                        <button onClick={() => setModal({ type: 'trade_select_partner' })} className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-sm flex items-center justify-center gap-1 border border-gray-300 transition-colors">
                                            <Handshake size={16}/> Handeln
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                {/* FIELDS */}
                {BOARD_DATA.map(space => {
                    const style = getGridPosition(space.id);
                    const owner = getOwner(space.id, gameState.players);
                    const ownerColor = owner ? (PLAYER_COLORS[owner.color] || PLAYER_COLORS[0]).bg : null;

                    // Wir prüfen: Gibt es einen Besitzer? Hat er ein 'houses' Objekt? Wie viele hat er auf DIESEM Feld (space.id)?
                    const houseCount = (owner && owner.houses && owner.houses[space.id]) ? owner.houses[space.id] : 0;
                    
                    // Prüfen ob Hypothek aufgenommen wurde
                    const isMortgaged = owner && owner.mortgaged && owner.mortgaged.includes(space.id);

                    let displayPrice = null;
                    let isRent = false;

                    if (!owner) {
                        // Zu verkaufen
                        if (space.price > 0) displayPrice = space.price + ' €';
                    } else if (isMortgaged) {
                        // Hypothek
                        displayPrice = "M"; // Oder ein Icon
                    } else {
                        // Miete anzeigen
                        isRent = true;

                        if (space.group === GROUPS.STATION) {
                            const stationsOwned = BOARD_DATA.filter(s => 
                                s.group === GROUPS.STATION && 
                                getOwner(s.id, gameState.players)?.id === owner.id
                            ).length;
                            const stationRents = [25, 50, 100, 200];
                            displayPrice = (stationRents[stationsOwned - 1] || 25) + ' €';
                        
                        } else if (space.group === GROUPS.UTILITY) {
                            displayPrice = 'Würfel'; // Dynamisch
                        
                        } else if (space.rent) {
                            // Hier wird jetzt automatisch der richtige Preis gezogen, weil houseCount jetzt stimmt!
                            // Array-Logik: space.rent[0] ist Basis, space.rent[1] ist 1 Haus, etc.
                            const rentIndex = houseCount; 
                            
                            // Sonderregel: Doppelte Miete bei vollem Set (aber 0 Häusern)
                            let currentRent = space.rent[rentIndex];
                            if (houseCount === 0 && hasFullColorGroup(owner, space.group)) {
                                currentRent = currentRent * 2;
                            }
                            
                            displayPrice = currentRent + ' €';
                        }
                    }
                    // --- KORREKTUR ENDE ---

                    return (
                        <div key={space.id} style={style} className={`bg-white border flex flex-col relative group hover:z-50 hover:scale-125 transition-all cursor-pointer ${isMortgaged ? 'grayscale opacity-80' : ''}`} onClick={() => setModal({type: 'view_space', space})}>
                            
                            {/* Farbbalken oben */}
                            {space.group && (
                                <div className={`h-[25%] w-full ${space.color || 'bg-gray-400'} flex justify-center items-center relative overflow-hidden`}>
                                    
                                    {/* Häuser Visualisierung */}
                                    {houseCount > 0 && houseCount < 5 && (
                                        <div className="flex gap-1 shadow-sm px-1 rounded bg-black/10"> 
                                            {[...Array(houseCount)].map((_, i) => (
                                                // Kleines grünes Haus mit weißem Rand
                                                <Home key={i} size={12} className="text-emerald-100 fill-emerald-600 stroke-emerald-800"/>
                                            ))}
                                        </div>
                                    )}
                                    {houseCount === 5 && (
                                        // Rotes Hotel
                                        <div className="shadow-sm px-1 rounded bg-black/10">
                                            <Hotel size={16} className="text-rose-100 fill-rose-600 stroke-rose-800"/>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex-1 flex flex-col items-center justify-center text-center p-0.5 relative">
                                {space.type === 'start' && <ArrowRight className="text-red-600 rotate-[-90deg]" size={32} />}
                                {space.type === 'chance' && <span className="text-blue-600 font-serif text-4xl font-bold">?</span>}
                                {space.type === 'jail' && <div className="absolute inset-0 flex items-center justify-center opacity-30"><Lock size={40}/></div>}
                                {space.type === 'parking' && <Car size={32} className="text-red-500" />}
                                {space.type === 'gotojail' && <div className="flex flex-col items-center"><User size={24} className="text-blue-800" /><span className="text-[10px] font-bold">KNAST</span></div>}
                                
                                {space.group === GROUPS.STATION && <Train className="text-gray-600" size={32} />}
                                {space.group === GROUPS.UTILITY && (space.name === 'E-Werk' ? <Zap className="text-yellow-500" size={32} /> : <Droplets className="text-blue-500" size={32} />)}
                                
                                <span className="font-bold text-[10px] sm:text-xs leading-tight mt-1 px-1 break-words w-full">{space.name}</span>
                                
                                {/* Preis Anzeige */}
                                {displayPrice && (
                                    <span className={`font-black text-xs mt-auto pb-1 ${isRent ? 'text-red-600 bg-red-50 px-1 rounded' : 'text-gray-700'}`}>
                                        {displayPrice}
                                    </span>
                                )}
                            </div>
                            
                            {/* Besitzer Eselsohr */}
                            {owner && <div className={`absolute bottom-0 right-0 w-4 h-4 sm:w-6 sm:h-6 ${ownerColor} border-l-2 border-t-2 border-white shadow rounded-tl-md z-10`}></div>}
                            
                            {/* Spieler Figuren */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center flex-wrap content-center gap-1 translate-y-2 z-20">
                                {gameState.players.filter(p => p.pos === space.id && !p.bankrupt).map(p => 
                                    <div key={p.id} className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white ${PLAYER_COLORS[p.color || 0].bg} shadow-lg relative`}>
                                        {/* Kleiner Indikator wer das ist */}
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] bg-black text-white px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                                            {p.name}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
                {gameState.pendingTrade && gameState.pendingTrade.toId === myPlayerId && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] p-4 backdrop-blur-md">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-4 border-blue-500">
                        <h2 className="text-2xl font-bold text-center mb-4">Handelsangebot!</h2>
                        <p className="text-gray-600 mb-6 text-center">
                            {gameState.players[gameState.pendingTrade.fromId].name} möchte mit dir handeln.
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                <p className="text-xs font-bold text-green-700 uppercase">Du erhältst:</p>
                                <p className="font-bold">{gameState.pendingTrade.offer.money}€</p>
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                    {gameState.pendingTrade.offer.props.map(propId => {
                                        const prop = BOARD_DATA[propId];
                                        return (
                                            <div key={propId} className="flex items-stretch bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-12">
                                                {/* Farbbalken wie auf der Karte */}
                                                <div className="w-3 flex-shrink-0" style={{ backgroundColor: prop.color || '#ccc' }}></div>
                                                <div className="flex items-center px-3">
                                                    <span className="font-bold text-gray-800 text-sm leading-tight">{prop.name}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {gameState.pendingTrade.offer.props.length === 0 && (
                                        <p className="text-gray-400 text-sm italic py-2 text-center border-2 border-dashed border-green-100 rounded-lg">Keine Grundstücke</p>
                                    )}
                                </div>
                            </div>

                            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                                <p className="text-xs font-bold text-red-700 uppercase">Du gibst:</p>
                                <p className="font-bold">{gameState.pendingTrade.ask.money}€</p>
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                    {gameState.pendingTrade.ask.props.map(propId => {
                                        const prop = BOARD_DATA[propId];
                                        return (
                                            <div key={propId} className="flex items-stretch bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-12">
                                                {/* Farbbalken wie auf der Karte */}
                                                <div className="w-3 flex-shrink-0" style={{ backgroundColor: prop.color || '#ccc' }}></div>
                                                <div className="flex items-center px-3">
                                                    <span className="font-bold text-gray-800 text-sm leading-tight">{prop.name}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {gameState.pendingTrade.ask.props.length === 0 && (
                                        <p className="text-gray-400 text-sm italic py-2 text-center border-2 border-dashed border-red-100 rounded-lg">Keine Grundstücke</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => handleTradeResponse(false)}
                                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-bold transition-colors"
                            >
                                Ablehnen
                            </button>
                            <button 
                                onClick={() => handleTradeResponse(true)}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95"
                            >
                                Annehmen
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
      </div>
      <PlayerList players={gameState.players} current={gameState.currentPlayerIdx} boardData={BOARD_DATA} />
      <div className="w-full max-w-4xl h-48 bg-white rounded-xl shadow-lg border border-gray-300 flex flex-col overflow-hidden text-sm shrink-0"><div className="bg-gray-100 px-4 py-2 text-xs font-bold uppercase text-gray-500 border-b">Protokoll</div><div className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50 font-mono flex flex-col-reverse">{gameState.gameLog?.map((l, i) => <div key={i} className="text-gray-700 border-b border-gray-100 pb-1">{l}</div>)}</div></div>
      {renderModal()}
    </div>
  );
}

// 1. Die Namens-Liste (Mapping von Wort zu Hex)
const COLOR_MAP = {
    // Braune Gruppe
    brown: '#8B4513',
    braun: '#8B4513',
    darkbrown: '#654321',

    // Hellblaue Gruppe
    lightblue: '#87CEEB',
    'light-blue': '#87CEEB',
    hellblau: '#87CEEB',
    cyan: '#00FFFF',

    // Pinke / Magenta Gruppe (Seestraße ist meistens hier!)
    pink: '#FF1493',
    magenta: '#FF00FF',
    rosa: '#FF69B4',
    purple: '#800080',
    lila: '#800080',

    // Orange Gruppe
    orange: '#FFA500',

    // Rote Gruppe
    red: '#FF0000',
    rot: '#FF0000',

    // Gelbe Gruppe
    yellow: '#FFD700',
    gelb: '#FFD700',

    // Grüne Gruppe
    green: '#008000',
    grün: '#008000',

    // Dunkelblaue Gruppe
    blue: '#0000FF',
    blau: '#0000FF',
    darkblue: '#00008B',

    // Bahnhöfe & Werke
    station: '#000000',
    bahnhof: '#000000',
    utility: '#A9A9A9',
    werk: '#A9A9A9',
    
    // Standard
    gray: '#D1D5DB',
    grey: '#D1D5DB'
};

// 2. Intelligente Farb-Ermittlung
const getSpaceColor = (space) => {
    // Falls Gruppe definiert ist, hat sie Vorrang für Bahnhöfe/Werke
    if (space.group) {
        const g = space.group.toLowerCase();
        if (g === 'station' || g === 'bahnhof') return COLOR_MAP.station;
        if (g === 'utility' || g === 'werk') return COLOR_MAP.utility;
    }

    // Wenn keine Farbe da ist -> Grau
    if (!space.color) return COLOR_MAP.gray;

    const c = space.color.toLowerCase();

    // A. Ist es ein Name in unserer Liste? (z.B. "pink")
    if (COLOR_MAP[c]) return COLOR_MAP[c];

    // B. Ist es bereits ein Hex-Code? (fängt mit # an)
    if (space.color.startsWith('#')) return space.color;

    // C. Fallback -> Grau (und wir loggen den Fehler in die Konsole, damit du ihn siehst)
    console.warn(`Unbekannte Farbe für Feld ${space.name}:`, space.color);
    return COLOR_MAP.gray;
};


const PlayerList = ({ players, current, boardData, getOwner }) => {
    
    // Nur kaufbare Felder filtern
    const purchasableSpaces = boardData
        .filter(s => (s.price > 0) || ['station', 'utility', 'bahnhof', 'werk'].includes(s.group?.toLowerCase()))
        .sort((a, b) => a.id - b.id);

    return (
        <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col shrink-0">
            <div className="bg-gray-100 px-4 py-3 font-bold text-gray-700 uppercase text-xs border-b">
                Spieler ({players.length})
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-2">
                {players.map((p, i) => {
                    return (
                        <div key={p.id} className={`rounded-lg p-3 border transition-all flex flex-col justify-between ${p.bankrupt ? 'opacity-50 grayscale' : ''} ${current === i && !p.bankrupt ? 'border-indigo-500 bg-indigo-50' : ''}`}>
                            
                            {/* Header */}
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <div 
                                        className="w-3 h-3 rounded-full border border-black/10" 
                                        style={{ backgroundColor: p.color ? (PLAYER_COLORS[p.color]?.hex || p.color) : '#000' }} 
                                    ></div> 
                                    <span className="font-bold text-sm truncate max-w-[100px]">{p.name}</span>
                                </div>
                                <span className="font-mono font-bold text-green-600 text-sm">{p.money}€</span>
                            </div>

                            {/* GRID ANZEIGE */}
                            <div className="mt-2">
                                {p.bankrupt ? (
                                    <span className="text-red-600 font-bold text-xs uppercase">Bankrott</span>
                                ) : (
                                    <div className="flex flex-wrap gap-1 content-start max-w-full">
                                        {purchasableSpaces.map(space => {
                                            
                                            // --- BESITZ PRÜFEN ---
                                            let ownerId = null;
                                            // 1. Versuch: Funktion
                                            if (typeof getOwner === 'function') {
                                                const o = getOwner(space.id, players);
                                                if (o) ownerId = o.id;
                                            } 
                                            // 2. Versuch: Array manuell prüfen
                                            else {
                                                players.forEach(pl => {
                                                    const props = pl.properties || pl.owned || [];
                                                    // String Vergleich um sicher zu gehen ("1" == 1)
                                                    if (props.some(id => String(id) === String(space.id))) {
                                                        ownerId = pl.id;
                                                    }
                                                });
                                            }

                                            const isMine = String(ownerId) === String(p.id);
                                            const isTaken = ownerId !== null && !isMine;
                                            
                                            // --- FARBE ERMITTELN (Neue Funktion nutzen) ---
                                            const hexColor = getSpaceColor(space);

                                            // --- STYLE SETZEN ---
                                            let style = {
                                                backgroundColor: hexColor,
                                                borderColor: 'rgba(0,0,0,0.1)'
                                            };

                                            if (isMine) {
                                                style.opacity = 1;
                                                style.border = '1px solid rgba(0,0,0,0.5)';
                                                // Kleiner Schatten für bessere Sichtbarkeit
                                                style.boxShadow = '0 1px 2px rgba(0,0,0,0.1)';
                                            } else if (isTaken) {
                                                style.opacity = 0.2; // Stark ausgebleicht
                                            } else {
                                                // Frei -> Grau
                                                style.backgroundColor = '#E5E7EB';
                                                style.opacity = 1;
                                            }

                                            return (
                                                <div 
                                                    key={space.id} 
                                                    className="w-3 h-4 rounded-[2px] border box-border shrink-0"
                                                    style={style}
                                                    title={`${space.name} (${isMine ? 'Mein Besitz' : isTaken ? 'Vergeben' : 'Frei'})`}
                                                ></div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

//const RentTable = ({ space }) => (<div className="text-xs text-gray-500 mt-2">Miete: {space.rent ? space.rent[0] : '-'}€</div>);
const RentTable = ({ space }) => {
    // Wenn keine Miete da ist und es kein Sonderfeld ist, nichts anzeigen
    if (!space.rent && space.group !== GROUPS.STATION && space.group !== GROUPS.UTILITY) return null;

    // Generelle Textgröße für die Tabelle hier angepasst: text-sm (statt text-xs)
    const tableClass = "text-lg w-full space-y-2 mt-4"; 

    if (space.group === GROUPS.STATION) {
        return (
            <div className={tableClass}>
                <div className="flex justify-between"><span>1 Bahnhof</span> <span>25€</span></div>
                <div className="flex justify-between"><span>2 Bahnhöfe</span> <span>50€</span></div>
                <div className="flex justify-between"><span>3 Bahnhöfe</span> <span>100€</span></div>
                <div className="flex justify-between"><span>4 Bahnhöfe</span> <span>200€</span></div>
                <div className="border-t pt-2 flex justify-between text-gray-500">
                    <span>Hypothek</span> <span>{space.mortgage ? space.mortgage + '€' : '100€'}</span>
                </div>
            </div>
        );
    }

    if (space.group === GROUPS.UTILITY) {
        return (
            <div className={tableClass}>
                <p className="italic mb-2 text-base">Miete: 4x (oder 10x) Augen</p>
                <div className="border-t pt-2 flex justify-between text-gray-500">
                    <span>Hypothek</span> <span>{space.mortgage ? space.mortgage + '€' : '75€'}</span>
                </div>
            </div>
        );
    }

    return (
      <div className={tableClass}>
         <div className="flex justify-between"><span>Grundmiete</span> <span>{space.rent[0]}€</span></div>
         <div className="flex justify-between"><span>1 Haus</span> <span>{space.rent[1]}€</span></div>
         <div className="flex justify-between"><span>2 Häuser</span> <span>{space.rent[2]}€</span></div>
         <div className="flex justify-between"><span>3 Häuser</span> <span>{space.rent[3]}€</span></div>
         <div className="flex justify-between"><span>4 Häuser</span> <span>{space.rent[4]}€</span></div>
         <div className="flex justify-between font-bold text-red-600"><span>HOTEL</span> <span>{space.rent[5]}€</span></div>
         
         <div className="border-t pt-2 mt-2 flex justify-between text-gray-500">
             <span>Hauskosten</span> <span>{space.houseCost}€</span>
         </div>
         <div className="flex justify-between text-gray-500">
             <span>Hypothek</span> <span>{space.mortgage}€</span>
         </div>
      </div>
    );
};



   // ---------------------------------------------------------
// 1. DIE HILFSKOMPONENTE (Jetzt AUSSERHALB definiert)
// ---------------------------------------------------------
const PropertyList = ({ title, player, selected, onToggle, money, setMoney, boardData }) => (
    <div className="flex flex-col gap-3 flex-1 min-w-[280px]">
        <h4 className="font-bold text-slate-700 border-b pb-2">{title} ({player.name})</h4>
        
        {/* Geld Input */}
        <div className="flex items-center gap-2 bg-slate-100 p-2 rounded mb-2">
            <span className="text-sm font-bold text-slate-500">€</span>
            <input 
                type="number" 
                min="0"
                max={player.money}
                value={money}
                onChange={(e) => setMoney(Math.min(parseInt(e.target.value) || 0, player.money))}
                className="w-full bg-transparent outline-none font-mono font-bold text-slate-800"
                placeholder="0"
            />
        </div>

        {/* Liste der Straßen */}
        <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-1">
            {(!player.properties || player.properties.length === 0) && (
                <div className="text-xs text-slate-400 italic text-center py-2">Keine Grundstücke</div>
            )}
            
            {(player.properties || []).sort((a,b) => a-b).map(id => {
                const space = boardData[id];
                const colorStyle = space.color && space.color.startsWith('#') ? space.color : (space.color ? space.color : '#94a3b8');
                const isSelected = selected.includes(id);

                return (
                    <div 
                        key={id} 
                        onClick={() => onToggle(id)}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer border transition-all select-none
                            ${isSelected ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                    >
                        {/* Hier verwenden wir einen kleinen Farb-Punkt */}
                        <div className="w-3 h-3 rounded-full shrink-0 border border-black/10" style={{ backgroundColor: colorStyle }}></div>
                        <span className="text-sm font-medium truncate flex-1">{space.name}</span>
                        {/* HIER WIRD CHECK BENUTZT - muss importiert sein */}
                        {isSelected && <Check size={14} className="text-indigo-600"/>}
                    </div>
                );
            })}
        </div>
    </div>
);

// ---------------------------------------------------------
// 2. DIE HAUPTKOMPONENTE
// ---------------------------------------------------------
const TradeInterface = ({ me, partner, boardData, onCancel, onConfirm }) => {
    const [giveMoney, setGiveMoney] = useState(0);
    const [receiveMoney, setReceiveMoney] = useState(0);
    const [selectedGiveProps, setSelectedGiveProps] = useState([]);
    const [selectedReceiveProps, setSelectedReceiveProps] = useState([]);

    const toggleProp = (list, setList, id) => {
        if (list.includes(id)) {
            setList(list.filter(item => item !== id));
        } else {
            setList([...list, id]);
        }
    };

    const handleConfirm = () => {
        const tradeData = {
        partnerId: partner.id,
        offer: {
            money: Number(giveMoney), // Sicherstellen, dass es eine Zahl ist
            props: selectedGiveProps   // Dein Array mit IDs
        },
        ask: {
            money: Number(receiveMoney),
            props: selectedReceiveProps // Das Array mit IDs vom Partner
        }
        };
        onConfirm(tradeData);
    };
    

    //     const sendTradeOffer = async (targetPlayerId, myOffer, theirAsk) => {
    //     await updateDB({
    //         pendingTrade: {
    //             fromId: myPlayerId,
    //             toId: targetPlayerId,
    //             offer: myOffer,  // z.B. { money: 500, props: [1, 5] }
    //             ask: theirAsk    // z.B. { money: 0, props: [12] }
    //         },
    //         gameLog: arrayUnion(`${gameState.players[myPlayerId].name} hat ein Handelsangebot an ${gameState.players[targetPlayerId].name} gesendet.`)
    //     });
    // };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <ArrowRightLeft className="text-indigo-300"/> Handel vorschlagen
                    </h3>
                    <button onClick={onCancel} className="hover:text-red-400 transition-colors"><X /></button>
                </div>

                <div className="p-6 overflow-y-auto bg-slate-200/50">
                    <div className="flex flex-wrap gap-6 justify-center">
                        {/* Linke Seite: Ich */}
                        <PropertyList 
                            title="Du bietest" 
                            player={me} 
                            selected={selectedGiveProps} 
                            onToggle={(id) => toggleProp(selectedGiveProps, setSelectedGiveProps, id)}
                            money={giveMoney}
                            setMoney={setGiveMoney}
                            boardData={boardData} /* WICHTIG: boardData wird jetzt hier übergeben */
                        />

                        {/* Trenner Icon */}
                        <div className="flex items-center justify-center py-2 md:py-0">
                            <div className="bg-white p-2 rounded-full shadow-sm">
                                <ArrowRightLeft size={24} className="text-slate-400 rotate-90 md:rotate-0"/>
                            </div>
                        </div>

                        {/* Rechte Seite: Partner */}
                        <PropertyList 
                            title={`${partner.name} erhält`} 
                            player={partner} 
                            selected={selectedReceiveProps} 
                            onToggle={(id) => toggleProp(selectedReceiveProps, setSelectedReceiveProps, id)}
                            money={receiveMoney}
                            setMoney={setReceiveMoney}
                            boardData={boardData} /* WICHTIG: boardData wird jetzt hier übergeben */
                        />
                    </div>
                </div>

                <div className="p-4 border-t bg-white flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 rounded text-slate-600 font-bold hover:bg-slate-100 transition-colors">Abbrechen</button>
                    <button 
                        onClick={handleConfirm} 
                        className="px-6 py-2 rounded bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 transition-all"
                    >
                        Handel durchführen
                    </button>
                </div>
            </div>
        </div>
    );
};

const TradeSetup = ({ me, partner, onClose }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-6 rounded max-w-sm w-full">
            <h3>Handel mit {partner.name}</h3>
            <p className="text-sm text-gray-500 mb-4">Funktion noch in Arbeit...</p>
            <button onClick={onClose} className="bg-gray-200 w-full py-2 rounded">Schließen</button>
        </div>
    </div>
);

const TradeReview = ({ onDecline }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-6 rounded max-w-sm w-full">
            <h3>Handelsanfrage</h3>
            <button onClick={onDecline} className="bg-gray-200 w-full py-2 rounded mt-4">Ablehnen</button>
        </div>
    </div>
);