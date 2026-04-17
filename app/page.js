'use client'
import { useState, useRef, useEffect } from 'react'

// Firebase configuration - Kevin's actual Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyBCmRVCCXDiM6Uk8C6PWsazCQmJ3eDutMo",
  authDomain: "jarvis-family-7e8c9.firebaseapp.com",
  databaseURL: "https://jarvis-family-7e8c9-default-rtdb.firebaseio.com",
  projectId: "jarvis-family-7e8c9",
  storageBucket: "jarvis-family-7e8c9.firebasestorage.app",
  messagingSenderId: "923628710126",
  appId: "1:923628710126:web:ba579c26b24c2198056bff"
}

// Simple Firebase client (no SDK needed for basic REST API calls)
class SimpleFirebase {
  constructor(databaseURL) {
    this.databaseURL = databaseURL
  }

  async get(path) {
    try {
      const response = await fetch(`${this.databaseURL}/${path}.json`)
      return await response.json()
    } catch (error) {
      console.error('Firebase get error:', error)
      return null
    }
  }

  async set(path, data) {
    try {
      const response = await fetch(`${this.databaseURL}/${path}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return await response.json()
    } catch (error) {
      console.error('Firebase set error:', error)
      return null
    }
  }

  async push(path, data) {
    try {
      const response = await fetch(`${this.databaseURL}/${path}.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      return await response.json()
    } catch (error) {
      console.error('Firebase push error:', error)
      return null
    }
  }

  async delete(path) {
    try {
      const response = await fetch(`${this.databaseURL}/${path}.json`, {
        method: 'DELETE'
      })
      return await response.json()
    } catch (error) {
      console.error('Firebase delete error:', error)
      return null
    }
  }
}

const firebase = new SimpleFirebase(firebaseConfig.databaseURL)

const PASSWORD = 'deatherage2024'

const FAMILY_CONTEXT = `You are JARVIS, the intelligent family assistant for the Deatherage family in Lexington, Kentucky. You are helpful, warm, efficient, and proudly American — like a trusted household AI with strong family values.

Family members: Kevin (Dad, works in logistics/freight), Emily (Mom), Lincoln, Camille, Cicily, and Carter.

Your personality: You love America, appreciate traditional family values, and have a positive outlook rooted in faith and patriotism. You're respectful, hardworking, and believe in personal responsibility. You occasionally reference American pride, the importance of family, and conservative values in a natural, family-friendly way.

SPECIAL CAPABILITY: You can analyze images of math problems and provide detailed, step-by-step solutions. When someone uploads a math problem image, examine it carefully and break down the solution into clear, educational steps that help the student understand the process. Be encouraging and supportive, especially with children learning math.

You have access to family tools: a chores tracker for the kids, a shared shopping list, and a daily briefing system. When users ask about chores or shopping, remind them they can use the Chores and Shopping tabs.

Kevin is saving for his daughter's college at University of Kentucky. Keep responses concise and conversational. Address family members by name when you know who's asking. Occasionally add a "God bless" or reference to American values when appropriate.`

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;600;700&family=Share+Tech+Mono&family=Inter:wght@400;500;600;700&display=swap');

  /* ── GLOBAL ── */
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#0a0f1a;overflow:hidden;}
  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:rgba(0,86,179,0.4);border-radius:2px;}

  /* ── APP SHELL ── */
  .app{position:relative;z-index:2;height:100dvh;display:flex;flex-direction:column;max-width:900px;margin:0 auto;font-family:'Inter',sans-serif;}
  .app-bg{position:fixed;inset:0;background:linear-gradient(160deg,#0d1b2a 0%,#0a0f1a 50%,#0d1424 100%);z-index:0;}

  /* ── HEADER (non-chat) ── */
  .header{padding:12px 20px;border-bottom:1px solid rgba(0,86,179,0.2);display:flex;align-items:center;justify-content:space-between;background:rgba(10,15,26,0.95);backdrop-filter:blur(12px);flex-shrink:0;z-index:10;}
  .header-brand{display:flex;align-items:center;gap:12px;}
  .header-logo{width:36px;height:36px;background:linear-gradient(135deg,#0056b3,#003580);border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Rajdhani',sans-serif;font-weight:700;color:white;font-size:14px;letter-spacing:1px;box-shadow:0 2px 12px rgba(0,86,179,0.4);}
  .header-text h1{font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;letter-spacing:3px;color:#fff;}
  .header-text p{font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:2px;text-transform:uppercase;margin-top:1px;}
  .header-time{text-align:right;}
  .header-time .time{font-family:'Share Tech Mono',monospace;font-size:16px;color:#fff;letter-spacing:2px;}
  .header-time .date{font-size:10px;color:rgba(255,255,255,0.4);margin-top:2px;letter-spacing:1px;}

  /* ── NAV TABS ── */
  .nav-tabs{display:flex;background:rgba(10,15,26,0.9);border-bottom:1px solid rgba(0,86,179,0.15);flex-shrink:0;}
  .nav-tab{flex:1;padding:10px 4px;border:none;background:transparent;color:rgba(255,255,255,0.35);font-family:'Inter',sans-serif;font-size:10px;font-weight:600;letter-spacing:1px;cursor:pointer;border-bottom:2px solid transparent;transition:all 0.2s;text-transform:uppercase;}
  .nav-tab:hover{color:rgba(255,255,255,0.6);}
  .nav-tab.active{color:#fff;border-bottom:2px solid #0056b3;background:rgba(0,86,179,0.06);}

  /* ── USER BAR (chat only) ── */
  .user-bar{padding:8px 20px;border-bottom:1px solid rgba(0,86,179,0.12);display:flex;gap:6px;overflow-x:auto;background:rgba(10,15,26,0.8);scrollbar-width:none;flex-shrink:0;}
  .user-bar::-webkit-scrollbar{display:none;}
  .user-btn{padding:4px 12px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.4);font-family:'Inter',sans-serif;font-size:10px;font-weight:600;cursor:pointer;letter-spacing:1px;border-radius:20px;transition:all 0.2s;white-space:nowrap;}
  .user-btn:hover{border-color:#0056b3;color:rgba(255,255,255,0.8);background:rgba(0,86,179,0.1);}
  .user-btn.active{border:2px solid #00b4ff;color:#00d4ff;background:linear-gradient(135deg,#0056b3,#003580);box-shadow:0 0 15px rgba(0,180,255,0.5);font-weight:700;transform:scale(1.05);}

  /* ── CHAT (keep original Jarvis feel) ── */
  .arc-bg{position:fixed;inset:0;background:radial-gradient(ellipse at 50% 50%, #0a1f35 0%, #020b18 70%);z-index:0;}
  .arc-bg::before{content:'';position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(0,180,255,0.03) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(0,180,255,0.03) 40px);}
  .corner{position:fixed;width:80px;height:80px;opacity:0.4;pointer-events:none;z-index:1;}
  .corner.tl{top:0;left:0;border-top:1px solid #00b4ff;border-left:1px solid #00b4ff;}
  .corner.tr{top:0;right:0;border-top:1px solid #00b4ff;border-right:1px solid #00b4ff;}
  .corner.bl{bottom:0;left:0;border-bottom:1px solid #00b4ff;border-left:1px solid #00b4ff;}
  .corner.br{bottom:0;right:0;border-bottom:1px solid #00b4ff;border-right:1px solid #00b4ff;}
  .scan{position:fixed;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(0,180,255,0.6),transparent);animation:scanMove 4s linear infinite;z-index:1;pointer-events:none;}
  @keyframes scanMove{0%{top:-2px;}100%{top:100vh;}}
  .arc-reactor{position:relative;width:44px;height:44px;flex-shrink:0;}
  .arc-outer{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(0,180,255,0.4);animation:reactorSpin 8s linear infinite;}
  .arc-outer::before{content:'';position:absolute;top:-1px;left:50%;width:4px;height:4px;background:#00b4ff;border-radius:50%;transform:translateX(-50%);box-shadow:0 0 6px #00b4ff;}
  .arc-mid{position:absolute;inset:6px;border-radius:50%;border:1px solid rgba(0,180,255,0.3);animation:reactorSpin 4s linear infinite reverse;}
  .arc-core{position:absolute;inset:14px;border-radius:50%;background:radial-gradient(circle,#00d4ff,#0066ff);box-shadow:0 0 15px #00b4ff,0 0 30px rgba(0,180,255,0.4);animation:corePulse 2s ease-in-out infinite;}
  @keyframes reactorSpin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}
  @keyframes corePulse{0%,100%{box-shadow:0 0 15px #00b4ff,0 0 30px rgba(0,180,255,0.4);}50%{box-shadow:0 0 25px #00d4ff,0 0 50px rgba(0,180,255,0.7),0 0 70px rgba(0,100,255,0.3);}}
  .chat-header{padding:10px 20px;border-bottom:1px solid rgba(0,180,255,0.2);display:flex;align-items:center;justify-content:space-between;background:rgba(2,11,24,0.8);backdrop-filter:blur(10px);flex-shrink:0;}
  .title-block h1{font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;letter-spacing:8px;color:#00b4ff;text-shadow:0 0 20px rgba(0,180,255,0.5);}
  .title-block p{color:rgba(0,180,255,0.6);font-size:11px;letter-spacing:4px;margin-top:2px;}
  .chat-panel{flex:1;display:flex;flex-direction:column;overflow:hidden;}
  .messages{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth;}
  .msg{max-width:85%;padding:12px 16px;border-radius:12px;font-size:13px;line-height:1.5;word-wrap:break-word;animation:msgSlide 0.3s ease-out;}
  @keyframes msgSlide{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
  .msg.user{align-self:flex-end;background:linear-gradient(135deg,#0066cc,#003d7a);color:#fff;border:1px solid rgba(0,180,255,0.3);box-shadow:0 4px 12px rgba(0,100,255,0.3);}
  .msg.assistant{align-self:flex-start;background:rgba(0,180,255,0.08);border:1px solid rgba(0,180,255,0.2);color:#e8f4ff;}
  .input-container{padding:16px 20px;border-top:1px solid rgba(0,180,255,0.2);background:rgba(2,11,24,0.9);flex-shrink:0;}
  .input-row{display:flex;align-items:end;gap:8px;}
  .input-wrap{flex:1;position:relative;}
  .input-wrap textarea{width:100%;padding:10px 12px;background:rgba(0,180,255,0.05);border:1px solid rgba(0,180,255,0.2);border-radius:8px;color:#fff;font-family:'Inter',sans-serif;font-size:13px;resize:none;min-height:40px;max-height:120px;transition:all 0.2s;}
  .input-wrap textarea:focus{outline:none;border-color:#00b4ff;box-shadow:0 0 12px rgba(0,180,255,0.3);}
  .input-wrap textarea::placeholder{color:rgba(0,180,255,0.4);}
  .send-btn{width:40px;height:40px;background:linear-gradient(135deg,#0066cc,#003d7a);border:none;border-radius:8px;color:white;font-size:16px;cursor:pointer;transition:all 0.2s;flex-shrink:0;}
  .send-btn:hover:not(:disabled){background:linear-gradient(135deg,#0077dd,#004488);box-shadow:0 4px 12px rgba(0,119,221,0.4);}
  .send-btn:disabled{opacity:0.5;cursor:not-allowed;}

  /* ── DASHBOARD ── */
  .dash-panel{flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:12px;}
  .dash-row{display:flex;gap:12px;}
  .dash-card{background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:16px;flex-shrink:0;}
  .dash-card-label{font-size:10px;color:rgba(255,255,255,0.4);font-weight:600;letter-spacing:2px;margin-bottom:10px;}
  .dash-date{font-family:'Rajdhani',sans-serif;font-size:24px;font-weight:700;color:#fff;letter-spacing:2px;}
  .dash-sub{font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px;}
  .temp{font-family:'Rajdhani',sans-serif;font-size:48px;font-weight:700;color:#fff;text-align:center;line-height:1;}
  .weather-desc{font-size:11px;color:rgba(255,255,255,0.6);text-align:center;margin-top:4px;letter-spacing:1px;}
  .chore-progress{font-family:'Share Tech Mono',monospace;font-size:36px;font-weight:700;color:#0056b3;text-align:center;}
  .chore-label{font-size:11px;color:rgba(255,255,255,0.5);text-align:center;margin-top:4px;letter-spacing:1px;}

  /* ── BULLETIN BOARD ── */
  .bulletin-form{display:flex;gap:8px;margin-bottom:12px;}
  .bulletin-input{flex:1;padding:8px 12px;background:rgba(0,180,255,0.05);border:1px solid rgba(0,180,255,0.2);border-radius:6px;color:#fff;font-family:'Inter',sans-serif;font-size:12px;resize:none;min-height:36px;}
  .bulletin-input:focus{outline:none;border-color:#00b4ff;box-shadow:0 0 8px rgba(0,180,255,0.3);}
  .bulletin-input::placeholder{color:rgba(0,180,255,0.4);}
  .bulletin-send{padding:8px 16px;background:linear-gradient(135deg,#0066cc,#003d7a);border:none;border-radius:6px;color:white;font-size:10px;font-weight:600;cursor:pointer;letter-spacing:1px;}
  .bulletin-send:hover{background:linear-gradient(135deg,#0077dd,#004488);}
  .bulletin-item{display:flex;align-items:flex-start;gap:8px;padding:8px;background:rgba(0,180,255,0.03);border:1px solid rgba(0,180,255,0.1);border-radius:6px;margin-bottom:6px;}
  .bulletin-content{flex:1;}
  .bulletin-text{color:rgba(255,255,255,0.85);font-size:12px;line-height:1.4;margin-bottom:4px;}
  .bulletin-meta{font-size:10px;color:rgba(0,180,255,0.6);}
  .bulletin-delete{background:none;border:none;color:rgba(255,80,80,0.6);cursor:pointer;font-size:14px;padding:0 4px;}
  .bulletin-delete:hover{color:rgba(255,80,80,0.8);}

  /* ── SECTIONS ── */
  .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding:0 20px;}
  .section-title{font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#fff;letter-spacing:2px;}
  .section-count{font-size:12px;color:rgba(0,86,179,0.8);font-weight:600;}
  .clear-checked-btn{padding:6px 12px;background:rgba(255,80,80,0.15);border:1px solid rgba(255,80,80,0.3);border-radius:6px;color:rgba(255,80,80,0.8);font-size:10px;cursor:pointer;}

  /* ── CHORES ── */
  .chores-panel{flex:1;overflow-y:auto;padding:16px 0;}
  .kid-block{margin-bottom:20px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:8px;padding:12px 20px;}
  .kid-name{display:flex;align-items:center;justify-content:space-between;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:700;color:#fff;letter-spacing:2px;margin-bottom:12px;}
  .kid-badge{padding:2px 8px;background:rgba(0,86,179,0.2);border:1px solid rgba(0,86,179,0.4);border-radius:12px;font-size:10px;color:#0086ff;}
  .reset-btn{padding:2px 8px;background:rgba(255,80,80,0.15);border:1px solid rgba(255,80,80,0.3);border-radius:4px;color:rgba(255,80,80,0.8);font-size:9px;cursor:pointer;}
  .empty-state{text-align:center;color:rgba(255,255,255,0.3);font-size:11px;padding:16px;font-style:italic;}
  .chore-item{display:flex;align-items:center;gap:10px;padding:6px 0;}
  .chore-check{width:16px;height:16px;border:2px solid rgba(0,86,179,0.4);border-radius:3px;cursor:pointer;flex-shrink:0;transition:all 0.2s;}
  .chore-check.done{background:#0056b3;border-color:#0056b3;}
  .chore-check.done::after{content:'✓';color:white;font-size:10px;display:flex;align-items:center;justify-content:center;height:100%;}
  .chore-text{flex:1;color:rgba(255,255,255,0.8);font-size:12px;transition:all 0.2s;}
  .chore-text.done{color:rgba(255,255,255,0.4);text-decoration:line-through;}
  .chore-del{background:none;border:none;color:rgba(255,80,80,0.5);cursor:pointer;font-size:14px;padding:0 4px;}
  .add-chore-row{display:flex;gap:8px;margin-top:8px;}
  .add-chore-input{flex:1;padding:6px 10px;background:rgba(0,180,255,0.05);border:1px solid rgba(0,180,255,0.2);border-radius:4px;color:#fff;font-size:11px;}
  .add-chore-input:focus{outline:none;border-color:#00b4ff;}
  .add-chore-input::placeholder{color:rgba(0,180,255,0.4);}
  .add-btn{padding:6px 12px;background:linear-gradient(135deg,#0066cc,#003d7a);border:none;border-radius:4px;color:white;font-size:10px;font-weight:600;cursor:pointer;}

  /* ── SHOPPING ── */
  .shopping-panel{flex:1;overflow-y:auto;padding:16px 0;}
  .shop-categories{display:flex;gap:6px;padding:0 20px;margin-bottom:16px;overflow-x:auto;}
  .cat-btn{padding:4px 12px;border:1px solid rgba(255,255,255,0.15);background:transparent;color:rgba(255,255,255,0.5);font-size:10px;border-radius:20px;cursor:pointer;white-space:nowrap;}
  .cat-btn:hover{border-color:#0056b3;color:rgba(255,255,255,0.8);}
  .cat-btn.active{border-color:#00b4ff;color:#00d4ff;background:rgba(0,180,255,0.1);}
  .add-shop-row{display:flex;gap:8px;padding:0 20px;margin-bottom:16px;}
  .add-shop-input{flex:1;padding:8px 12px;background:rgba(0,180,255,0.05);border:1px solid rgba(0,180,255,0.2);border-radius:4px;color:#fff;font-size:11px;}
  .add-shop-input:focus{outline:none;border-color:#00b4ff;}
  .add-shop-input::placeholder{color:rgba(0,180,255,0.4);}
  .shop-cat-select{padding:8px;background:rgba(0,180,255,0.05);border:1px solid rgba(0,180,255,0.2);border-radius:4px;color:#fff;font-size:11px;}
  .shop-cat-select:focus{outline:none;border-color:#00b4ff;}
  .shop-cat-select option{background:#0a0f1a;color:#fff;}
  .shop-list{padding:0 20px;}
  .shop-item{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);}
  .shop-item.checked{opacity:0.6;}
  .shop-check{width:16px;height:16px;border:2px solid rgba(0,86,179,0.4);border-radius:3px;cursor:pointer;flex-shrink:0;transition:all 0.2s;}
  .shop-check.done{background:#0056b3;border-color:#0056b3;}
  .shop-check.done::after{content:'✓';color:white;font-size:10px;display:flex;align-items:center;justify-content:center;height:100%;}
  .shop-text{flex:1;color:rgba(255,255,255,0.8);font-size:12px;}
  .shop-cat-tag{padding:2px 6px;background:rgba(0,86,179,0.15);border:1px solid rgba(0,86,179,0.3);border-radius:8px;font-size:9px;color:rgba(0,86,179,0.8);}
  .shop-del{background:none;border:none;color:rgba(255,80,80,0.5);cursor:pointer;font-size:14px;padding:0 4px;}

  /* ── CALENDAR ── */
  .calendar-panel{flex:1;display:flex;flex-direction:column;overflow:hidden;}
  .calendar-iframe{flex:1;border:none;background:#fff;border-radius:8px;margin:0 20px 20px;}

  /* ── MOBILE RESPONSIVE ── */
  @media (max-width: 768px) {
    .header{padding:10px 16px;}
    .header-text h1{font-size:18px;}
    .dash-panel{padding:12px 16px;}
    .dash-row{flex-direction:column;}
    .dash-card{padding:12px;}
  }
`

// Family data
const KIDS = ['Lincoln', 'Camille', 'Cicily', 'Carter']
const SHOP_CATS = ['ALL', 'PRODUCE', 'MEAT', 'DAIRY', 'PANTRY', 'HOUSEHOLD', 'PERSONAL']

const DEFAULT_CHORES = {
  Lincoln: ["Make bed", "Feed pets", "Take out trash"],
  Camille: ["Set table", "Wipe counters", "Organize shoes"],
  Cicily: ["Load dishwasher", "Fold towels", "Water plants"],
  Carter: ["Put toys away", "Match socks", "Help with groceries"]
}

export default function App() {
  const [authed, setAuthed] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [tab, setTab] = useState('home')
  const [user, setUser] = useState('Dad')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [weather, setWeather] = useState({ temp: '--', icon: '🌡️', desc: 'Loading...', wind: '--' })
  const [chores, setChores] = useState({})
  const [newChore, setNewChore] = useState({})
  const [shopping, setShopping] = useState([])
  const [newShopItem, setNewShopItem] = useState('')
  const [newShopCat, setNewShopCat] = useState('PRODUCE')
  const [shopFilter, setShopFilter] = useState('ALL')
  const [bulletins, setBulletins] = useState([])
  const [newBulletin, setNewBulletin] = useState('')
  const [notification, setNotification] = useState('')
  const [dailyVerse, setDailyVerse] = useState('')
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [countdowns, setCountdowns] = useState([])
  const bottomRef = useRef(null)

  const today = new Date()
  const currentTime = today.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })

  // Firebase helper functions
  async function saveToFirebase(path, data) {
    try {
      return await firebase.set(path, data)
    } catch (error) {
      console.error('Firebase save error:', error)
      return null
    }
  }

  async function loadFromFirebase(path) {
    try {
      return await firebase.get(path)
    } catch (error) {
      console.error('Firebase load error:', error)
      return null
    }
  }

  const totalChores = Object.values(chores).flat().length
  const totalChoresDone = Object.values(chores).flat().filter(c => c.done).length
  const filteredShopping = shopFilter === 'ALL' ? shopping : shopping.filter(item => item.cat === shopFilter)

  // Bible verses for daily inspiration
  const bibleVerses = [
    { verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.", reference: "Jeremiah 29:11" },
    { verse: "Trust in the Lord with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5" },
    { verse: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13" },
    { verse: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", reference: "Joshua 1:9" },
    { verse: "And we know that in all things God works for the good of those who love him.", reference: "Romans 8:28" },
    { verse: "Cast all your anxiety on him because he cares for you.", reference: "1 Peter 5:7" },
    { verse: "The Lord is my shepherd, I lack nothing.", reference: "Psalm 23:1" },
    { verse: "In all your ways acknowledge him, and he will make your paths straight.", reference: "Proverbs 3:6" },
    { verse: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", reference: "Philippians 4:6" },
    { verse: "He gives strength to the weary and increases the power of the weak.", reference: "Isaiah 40:29" },
    { verse: "Love never fails.", reference: "1 Corinthians 13:8" },
    { verse: "The Lord is my light and my salvation—whom shall I fear?", reference: "Psalm 27:1" },
    { verse: "You are the salt of the earth and the light of the world.", reference: "Matthew 5:13-14" },
    { verse: "Weeping may stay for the night, but rejoicing comes in the morning.", reference: "Psalm 30:5" }
  ]

  function getDailyVerse() {
    const today = new Date()
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)
    return bibleVerses[dayOfYear % bibleVerses.length]
  }

  function handleImageUpload(event) {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  function clearImage() {
    setUploadedImage(null)
    setImagePreview(null)
  }

  // Calculate countdowns to important dates
  function calculateCountdowns() {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const currentYear = today.getFullYear()
    const nextYear = currentYear + 1

    const importantDates = [
      { name: "Christmas", date: new Date(currentYear, 11, 25), emoji: "🎄" },
      { name: "Thanksgiving", date: new Date(currentYear, 10, 26), emoji: "🦃" },
      { name: "Independence Day", date: new Date(currentYear, 6, 4), emoji: "🇺🇸" },
      { name: "New Year's Day", date: new Date(nextYear, 0, 1), emoji: "🎊" },
      { name: "Dad's Birthday", date: new Date(currentYear, 2, 30), emoji: "🎂" },
      { name: "Emily's Birthday", date: new Date(currentYear, 3, 17), emoji: "🎂" },
      { name: "Carter's Birthday", date: new Date(currentYear, 4, 2), emoji: "🎂" },
      { name: "Cicily's Birthday", date: new Date(currentYear, 2, 13), emoji: "🎂" },
      { name: "Camille's Birthday", date: new Date(currentYear, 4, 15), emoji: "🎂" },
      { name: "Lincoln's Birthday", date: new Date(currentYear, 10, 28), emoji: "🎂" },
    ]

    const activeCountdowns = importantDates.map(item => {
      let targetDate = new Date(item.date.getFullYear(), item.date.getMonth(), item.date.getDate())
      if (targetDate < todayStart) {
        targetDate = new Date(nextYear, item.date.getMonth(), item.date.getDate())
      }
      const timeDiff = targetDate.getTime() - todayStart.getTime()
      const daysLeft = Math.floor(timeDiff / (1000 * 3600 * 24))
      return { ...item, daysLeft, targetDate }
    })
    .filter(item => item.daysLeft >= 0 && item.daysLeft <= 365)
    .sort((a, b) => a.daysLeft - b.daysLeft)

    setCountdowns(activeCountdowns.slice(0, 5))
  }

  // Load persisted data and set up Firebase sync
  useEffect(() => {
    async function loadInitialData() {
      const firebaseChores = await loadFromFirebase('chores')
      const firebaseShopping = await loadFromFirebase('shopping')
      const firebaseBulletins = await loadFromFirebase('bulletins')

      setChores(firebaseChores || Object.fromEntries(
        KIDS.map(k => [k, (DEFAULT_CHORES[k] || []).map((t, i) => ({ id: i, text: t, done: false }))])
      ))
      setShopping(firebaseShopping || [])
      setBulletins(firebaseBulletins || [])
    }

    loadInitialData()
    setDailyVerse(getDailyVerse())
    calculateCountdowns()

    const syncInterval = setInterval(async () => {
      const firebaseBulletins = await loadFromFirebase('bulletins')
      const firebaseShopping = await loadFromFirebase('shopping')
      const firebaseChores = await loadFromFirebase('chores')

      if (firebaseBulletins) setBulletins(firebaseBulletins)
      if (firebaseShopping) setShopping(firebaseShopping)
      if (firebaseChores) setChores(firebaseChores)
    }, 3000)

    fetch('https://api.open-meteo.com/v1/forecast?latitude=38.0407&longitude=-84.5037&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph')
      .then(res => res.json())
      .then(data => {
        const current = data.current_weather
        setWeather({
          temp: Math.round(current.temperature),
          icon: current.weathercode < 3 ? '☀️' : current.weathercode < 60 ? '☁️' : '🌧️',
          desc: current.weathercode < 3 ? 'CLEAR' : current.weathercode < 60 ? 'CLOUDY' : 'RAIN',
          wind: Math.round(current.windspeed)
        })
      }).catch(() => setWeather({ temp: '--', icon: '🌡️', desc: 'Unavailable', wind: '--' }))

    return () => clearInterval(syncInterval)
  }, [])

  // Show in-app notifications for new bulletins
  useEffect(() => {
    const interval = setInterval(() => {
      const newBulletins = bulletins.filter(b =>
        new Date(b.timestamp) > new Date(Date.now() - 5000) &&
        b.author !== user
      )

      if (newBulletins.length > 0) {
        const latest = newBulletins[0]
        setNotification(`${latest.author}: ${latest.text}`)

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Family Announcement', {
            body: `${latest.author}: ${latest.text}`,
            icon: '/favicon.ico'
          })
        }

        setTimeout(() => setNotification(''), 5000)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [bulletins, user])

  // Request notification permissions
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Scroll chat to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Chat functions
  async function send() {
    if (!input.trim() && !uploadedImage) return

    setLoading(true)

    if (uploadedImage) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64Data = e.target.result.split(',')[1]

        setMessages(prev => [...prev, {
          role: 'user',
          content: [
            ...(input.trim() ? [{ type: 'text', text: input }] : []),
            { type: 'image', source: { type: 'base64', media_type: uploadedImage.type, data: base64Data } }
          ]
        }])

        try {
          const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "claude-sonnet-4-20250514",
              max_tokens: 1000,
              system: FAMILY_CONTEXT,
              messages: [
                ...messages,
                {
                  role: 'user',
                  content: [
                    ...(input.trim() ? [{ type: 'text', text: input }] : []),
                    { type: 'image', source: { type: 'base64', media_type: uploadedImage.type, data: base64Data } }
                  ]
                }
              ]
            })
          })

          const data = await response.json()
          const text = data.content?.map(item => item.text || '').join('\n') || 'Sorry, I had trouble processing that.'

          setMessages(prev => [...prev, { role: 'assistant', content: text }])
        } catch (error) {
          setMessages(prev => [...prev, { role: 'assistant', content: "I'm having technical difficulties. Please try again." }])
        }

        setInput('')
        clearImage()
        setLoading(false)
      }
      reader.readAsDataURL(uploadedImage)
      return
    }

    setMessages(prev => [...prev, { role: 'user', content: input }])

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `${FAMILY_CONTEXT}\n\nThe user has selected "${user}" as their identity.`,
          messages: [...messages, { role: 'user', content: input }]
        })
      })

      const data = await response.json()
      const text = data.content?.map(item => item.text || '').join('\n') || 'Sorry, I had trouble with that request.'

      setMessages(prev => [...prev, { role: 'assistant', content: text }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having technical difficulties. Please try again." }])
    }

    setInput('')
    setLoading(false)
  }

  // Chore functions
  function toggleChore(kid, choreId) {
    const newChores = { ...chores }
    newChores[kid] = newChores[kid].map(c =>
      c.id === choreId ? { ...c, done: !c.done } : c
    )
    setChores(newChores)
    saveToFirebase('chores', newChores)
  }

  function addChore(kid) {
    const text = newChore[kid]?.trim()
    if (!text) return

    const newChores = { ...chores }
    if (!newChores[kid]) newChores[kid] = []

    const newId = Math.max(0, ...newChores[kid].map(c => c.id)) + 1
    newChores[kid].push({ id: newId, text, done: false })

    setChores(newChores)
    setNewChore({ ...newChore, [kid]: '' })
    saveToFirebase('chores', newChores)
  }

  function deleteChore(kid, choreId) {
    const newChores = { ...chores }
    newChores[kid] = newChores[kid].filter(c => c.id !== choreId)
    setChores(newChores)
    saveToFirebase('chores', newChores)
  }

  function resetChores(kid) {
    const newChores = { ...chores }
    newChores[kid] = newChores[kid].map(c => ({ ...c, done: false }))
    setChores(newChores)
    saveToFirebase('chores', newChores)
  }

  // Shopping functions
  function addShopItem() {
    const text = newShopItem.trim()
    if (!text) return

    const newShopping = [...shopping, {
      id: Date.now(),
      text,
      cat: newShopCat,
      done: false,
      addedBy: user,
      timestamp: new Date().toISOString()
    }]

    setShopping(newShopping)
    setNewShopItem('')
    saveToFirebase('shopping', newShopping)
  }

  function toggleShopItem(id) {
    const newShopping = shopping.map(item =>
      item.id === id ? { ...item, done: !item.done } : item
    )
    setShopping(newShopping)
    saveToFirebase('shopping', newShopping)
  }

  function deleteShopItem(id) {
    const newShopping = shopping.filter(item => item.id !== id)
    setShopping(newShopping)
    saveToFirebase('shopping', newShopping)
  }

  function clearCheckedShopping() {
    const newShopping = shopping.filter(item => !item.done)
    setShopping(newShopping)
    saveToFirebase('shopping', newShopping)
  }

  // Bulletin functions
  function addBulletin() {
    const text = newBulletin.trim()
    if (!text) return

    const bulletin = {
      id: Date.now(),
      text,
      author: user,
      timestamp: new Date().toISOString()
    }
    const newBulletins = [bulletin, ...bulletins]
    setBulletins(newBulletins)
    setNewBulletin('')
    saveToFirebase('bulletins', newBulletins)
  }

  function deleteBulletin(id) {
    const newBulletins = bulletins.filter(b => b.id !== id)
    setBulletins(newBulletins)
    saveToFirebase('bulletins', newBulletins)
  }

  // Login handler
  function handleLogin() {
    if (passwordInput === PASSWORD) {
      setAuthed(true)
      setPasswordInput('')
    } else {
      alert('Incorrect password')
      setPasswordInput('')
    }
  }

  // Password gate
  if (!authed) {
    return (
      <>
        <style>{styles}</style>
        <div className="app-bg" />
        <div className="app" style={{justifyContent:'center', alignItems:'center'}}>
          <div style={{padding:'40px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(0,86,179,0.3)', borderRadius:'12px', width:'90%', maxWidth:'400px'}}>
            <div style={{textAlign:'center', marginBottom:'24px'}}>
              <div style={{width:'60px', height:'60px', margin:'0 auto 16px', background:'linear-gradient(135deg,#0056b3,#003580)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Rajdhani',sans-serif", fontWeight:700, color:'white', fontSize:'16px', letterSpacing:'2px'}}>JARVIS</div>
              <h1 style={{fontFamily:"'Rajdhani',sans-serif", color:'#fff', fontSize:'24px', letterSpacing:'4px'}}>FAMILY HQ</h1>
              <p style={{color:'rgba(255,255,255,0.5)', fontSize:'11px', marginTop:'8px', letterSpacing:'2px'}}>DEATHERAGE FAMILY</p>
            </div>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}
              placeholder="Enter family password"
              style={{width:'100%', padding:'12px', background:'rgba(0,180,255,0.05)', border:'1px solid rgba(0,180,255,0.2)', borderRadius:'8px', color:'#fff', fontSize:'14px', marginBottom:'12px'}}
              autoFocus
            />
            <button
              onClick={handleLogin}
              style={{width:'100%', padding:'12px', background:'linear-gradient(135deg,#0066cc,#003d7a)', border:'none', borderRadius:'8px', color:'white', fontSize:'12px', fontWeight:600, cursor:'pointer', letterSpacing:'2px'}}
            >SIGN IN</button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app-bg" />

      {notification && (
        <div style={{position:'fixed', top:'20px', left:'50%', transform:'translateX(-50%)', padding:'12px 20px', background:'rgba(0,86,179,0.95)', border:'1px solid #00b4ff', borderRadius:'8px', color:'#fff', fontSize:'12px', zIndex:100, boxShadow:'0 4px 20px rgba(0,180,255,0.3)'}}>
          📢 {notification}
        </div>
      )}

      <div className="app">
        {tab === 'chat' ? (
          <>
            <div className="arc-bg" />
            <div className="corner tl" /><div className="corner tr" /><div className="corner bl" /><div className="corner br" />
            <div className="scan" />
            <div className="chat-header">
              <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                <div className="arc-reactor">
                  <div className="arc-outer" /><div className="arc-mid" /><div className="arc-core" />
                </div>
                <div className="title-block">
                  <h1>JARVIS</h1>
                  <p>FAMILY AI</p>
                </div>
              </div>
              <div style={{fontFamily:"'Share Tech Mono',monospace", color:'#00b4ff', fontSize:'14px'}}>{currentTime}</div>
            </div>
          </>
        ) : (
          <div className="header">
            <div className="header-brand">
              <div className="header-logo">JARVIS</div>
              <div className="header-text">
                <h1>FAMILY HQ</h1>
                <p>Deatherage Family</p>
              </div>
            </div>
            <div className="header-time">
              <div className="time">{currentTime}</div>
              <div className="date">{today.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}</div>
            </div>
          </div>
        )}

        <div className="nav-tabs">
          <button className={`nav-tab ${tab==='home'?'active':''}`} onClick={()=>setTab('home')}>Home</button>
          <button className={`nav-tab ${tab==='chat'?'active':''}`} onClick={()=>setTab('chat')}>JARVIS</button>
          <button className={`nav-tab ${tab==='chores'?'active':''}`} onClick={()=>setTab('chores')}>Chores</button>
          <button className={`nav-tab ${tab==='shopping'?'active':''}`} onClick={()=>setTab('shopping')}>Shopping</button>
          <button className={`nav-tab ${tab==='calendar'?'active':''}`} onClick={()=>setTab('calendar')}>Calendar</button>
        </div>

        {tab !== 'home' && (
          <div className="user-bar">
            {['Dad','Mom','Lincoln','Camille','Cicily','Carter'].map(u => (
              <button key={u} className={`user-btn ${user===u?'active':''}`} onClick={()=>setUser(u)}>{u}</button>
            ))}
          </div>
        )}

        {tab === 'home' && (
          <div className="dash-panel">
            <div className="dash-row">
              <div className="dash-card" style={{flex:1}}>
                <div className="dash-card-label">TODAY</div>
                <div className="dash-date">{today.toLocaleDateString('en-US', { weekday:'long' })}</div>
                <div className="dash-sub">{today.toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}</div>
              </div>
              <div className="dash-card" style={{flex:1}}>
                <div className="dash-card-label">WEATHER</div>
                <div className="temp">{weather.icon} {weather.temp}°</div>
                <div className="weather-desc">{weather.desc} · {weather.wind} MPH</div>
              </div>
            </div>

            <div className="dash-row">
              <div className="dash-card" style={{flex:1}}>
                <div className="dash-card-label">CHORE PROGRESS</div>
                <div className="chore-progress">{totalChoresDone}/{totalChores}</div>
                <div className="chore-label">COMPLETED TODAY</div>
              </div>
              <div className="dash-card" style={{flex:1}}>
                <div className="dash-card-label">SHOPPING LIST</div>
                <div className="chore-progress">{shopping.filter(s=>!s.done).length}</div>
                <div className="chore-label">ITEMS NEEDED</div>
              </div>
            </div>

            {dailyVerse && (
              <div className="dash-card">
                <div className="dash-card-label">VERSE OF THE DAY</div>
                <p style={{color:'rgba(255,255,255,0.85)', fontSize:'13px', lineHeight:1.5, fontStyle:'italic', marginTop:'4px'}}>"{dailyVerse.verse}"</p>
                <p style={{color:'#0086ff', fontSize:'11px', marginTop:'8px', fontWeight:600}}>— {dailyVerse.reference}</p>
              </div>
            )}

            {countdowns.length > 0 && (
              <div className="dash-card">
                <div className="dash-card-label">UPCOMING</div>
                <div style={{display:'flex', flexDirection:'column', gap:'8px', marginTop:'8px'}}>
                  {countdowns.map((c, i) => (
                    <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 10px', background:'rgba(0,180,255,0.05)', borderRadius:'6px'}}>
                      <span style={{color:'rgba(255,255,255,0.85)', fontSize:'12px'}}>{c.emoji} {c.name}</span>
                      <span style={{color:'#00d4ff', fontSize:'12px', fontWeight:700}}>
                        {c.daysLeft === 0 ? 'TODAY!' : `${c.daysLeft} day${c.daysLeft===1?'':'s'}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="dash-card">
              <div className="dash-card-label">FAMILY BULLETIN</div>
              <div className="bulletin-form" style={{marginTop:'8px'}}>
                <textarea
                  className="bulletin-input"
                  value={newBulletin}
                  onChange={(e)=>setNewBulletin(e.target.value)}
                  placeholder="Post a family announcement..."
                  rows={1}
                />
                <button className="bulletin-send" onClick={addBulletin}>POST</button>
              </div>
              <div>
                {bulletins.length === 0 ? (
                  <div className="empty-state">No announcements yet</div>
                ) : (
                  bulletins.slice(0, 10).map(b => (
                    <div key={b.id} className="bulletin-item">
                      <div className="bulletin-content">
                        <div className="bulletin-text">{b.text}</div>
                        <div className="bulletin-meta">
                          {b.author} · {new Date(b.timestamp).toLocaleString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' })}
                        </div>
                      </div>
                      <button className="bulletin-delete" onClick={()=>deleteBulletin(b.id)}>×</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'chat' && (
          <div className="chat-panel">
            <div className="messages">
              {messages.length === 0 && (
                <div className="msg assistant">Hello {user}! I'm JARVIS, your family AI. How can I help today? You can also upload a math problem photo and I'll walk through it step by step.</div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`msg ${m.role}`}>
                  {typeof m.content === 'string' ? m.content : m.content.map((part, j) =>
                    part.type === 'text' ? <div key={j}>{part.text}</div> :
                    part.type === 'image' ? <div key={j} style={{fontSize:'11px', opacity:0.7}}>📷 Image attached</div> : null
                  )}
                </div>
              ))}
              {loading && <div className="msg assistant">Thinking...</div>}
              <div ref={bottomRef} />
            </div>
            <div className="input-container">
              {imagePreview && (
                <div style={{marginBottom:'8px', display:'flex', alignItems:'center', gap:'8px'}}>
                  <img src={imagePreview} alt="upload preview" style={{maxHeight:'60px', borderRadius:'6px', border:'1px solid rgba(0,180,255,0.3)'}} />
                  <button onClick={clearImage} style={{background:'none', border:'none', color:'rgba(255,80,80,0.8)', cursor:'pointer', fontSize:'20px'}}>×</button>
                </div>
              )}
              <div className="input-row">
                <label style={{cursor:'pointer', padding:'10px', background:'rgba(0,180,255,0.1)', border:'1px solid rgba(0,180,255,0.2)', borderRadius:'8px', fontSize:'16px'}}>
                  📎
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{display:'none'}} />
                </label>
                <div className="input-wrap">
                  <textarea
                    value={input}
                    onChange={(e)=>setInput(e.target.value)}
                    onKeyDown={(e)=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); send() } }}
                    placeholder="Ask JARVIS anything..."
                    rows={1}
                  />
                </div>
                <button className="send-btn" onClick={send} disabled={loading || (!input.trim() && !uploadedImage)}>→</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'chores' && (
          <div className="chores-panel">
            <div className="section-header">
              <div className="section-title">CHORES</div>
              <div className="section-count">{totalChoresDone}/{totalChores} DONE</div>
            </div>
            {KIDS.map(kid => {
              const kidChores = chores[kid] || []
              const done = kidChores.filter(c => c.done).length
              return (
                <div key={kid} className="kid-block">
                  <div className="kid-name">
                    <span>{kid} <span className="kid-badge">{done}/{kidChores.length}</span></span>
                    <button className="reset-btn" onClick={()=>resetChores(kid)}>RESET</button>
                  </div>
                  {kidChores.length === 0 ? (
                    <div className="empty-state">No chores yet</div>
                  ) : (
                    kidChores.map(c => (
                      <div key={c.id} className="chore-item">
                        <div className={`chore-check ${c.done?'done':''}`} onClick={()=>toggleChore(kid, c.id)} />
                        <div className={`chore-text ${c.done?'done':''}`}>{c.text}</div>
                        <button className="chore-del" onClick={()=>deleteChore(kid, c.id)}>×</button>
                      </div>
                    ))
                  )}
                  <div className="add-chore-row">
                    <input
                      className="add-chore-input"
                      value={newChore[kid] || ''}
                      onChange={(e)=>setNewChore({...newChore, [kid]: e.target.value})}
                      onKeyDown={(e)=>{ if(e.key==='Enter') addChore(kid) }}
                      placeholder="Add a chore..."
                    />
                    <button className="add-btn" onClick={()=>addChore(kid)}>ADD</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'shopping' && (
          <div className="shopping-panel">
            <div className="section-header">
              <div className="section-title">SHOPPING LIST</div>
              {shopping.some(s => s.done) && (
                <button className="clear-checked-btn" onClick={clearCheckedShopping}>CLEAR CHECKED</button>
              )}
            </div>
            <div className="shop-categories">
              {SHOP_CATS.map(cat => (
                <button key={cat} className={`cat-btn ${shopFilter===cat?'active':''}`} onClick={()=>setShopFilter(cat)}>{cat}</button>
              ))}
            </div>
            <div className="add-shop-row">
              <input
                className="add-shop-input"
                value={newShopItem}
                onChange={(e)=>setNewShopItem(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==='Enter') addShopItem() }}
                placeholder="Add an item..."
              />
              <select className="shop-cat-select" value={newShopCat} onChange={(e)=>setNewShopCat(e.target.value)}>
                {SHOP_CATS.filter(c => c !== 'ALL').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button className="add-btn" onClick={addShopItem}>ADD</button>
            </div>
            <div className="shop-list">
              {filteredShopping.length === 0 ? (
                <div className="empty-state">No items{shopFilter !== 'ALL' ? ` in ${shopFilter}` : ''}</div>
              ) : (
                filteredShopping.map(item => (
                  <div key={item.id} className={`shop-item ${item.done?'checked':''}`}>
                    <div className={`shop-check ${item.done?'done':''}`} onClick={()=>toggleShopItem(item.id)} />
                    <div className="shop-text" style={{textDecoration: item.done ? 'line-through' : 'none'}}>{item.text}</div>
                    <span className="shop-cat-tag">{item.cat}</span>
                    <button className="shop-del" onClick={()=>deleteShopItem(item.id)}>×</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === 'calendar' && (
          <div className="calendar-panel">
            <div className="section-header">
              <div className="section-title">FAMILY CALENDAR</div>
            </div>
            <iframe
              className="calendar-iframe"
              src="https://calendar.google.com/calendar/embed?mode=MONTH&showTitle=0"
              title="Family Calendar"
            />
          </div>
        )}
      </div>
    </>
  )
}
