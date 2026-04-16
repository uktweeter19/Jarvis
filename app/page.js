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

Family members: Kevin (Dad, works in logistics/freight), Mom, Lincoln, Camille, Cicily, and Carter.

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
  .title-block p{font-size:8px;color:rgba(0,180,255,0.5);letter-spacing:4px;text-transform:uppercase;}
  .hud-stats{display:flex;gap:16px;font-size:9px;color:rgba(0,180,255,0.5);letter-spacing:1px;}
  .hud-stat{display:flex;flex-direction:column;align-items:flex-end;gap:2px;}
  .hud-stat span:first-child{color:#00b4ff;font-size:10px;}
  .messages{flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:12px;}
  .welcome{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;opacity:0.5;text-align:center;}
  .welcome-ring{width:100px;height:100px;position:relative;margin:0 auto 8px;}
  .welcome-ring::before{content:'';position:absolute;inset:0;border-radius:50%;border:1px solid rgba(0,180,255,0.3);animation:reactorSpin 6s linear infinite;}
  .welcome-ring::after{content:'';position:absolute;inset:8px;border-radius:50%;border:1px solid rgba(0,180,255,0.2);animation:reactorSpin 3s linear infinite reverse;}
  .welcome-core{position:absolute;inset:20px;border-radius:50%;background:radial-gradient(circle,#00d4ff,#0044cc);box-shadow:0 0 20px #00b4ff;animation:corePulse 2s ease-in-out infinite;}
  .welcome h2{font-family:'Rajdhani',sans-serif;font-size:13px;letter-spacing:6px;color:#00b4ff;}
  .welcome p{font-size:10px;color:rgba(0,180,255,0.6);max-width:260px;line-height:1.8;}
  .msg{display:flex;gap:10px;animation:msgIn 0.3s ease-out;}
  .msg.user{flex-direction:row-reverse;}
  @keyframes msgIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
  .msg-icon{width:30px;height:30px;flex-shrink:0;align-self:flex-end;display:flex;align-items:center;justify-content:center;font-size:8px;letter-spacing:1px;clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);}
  .msg.assistant .msg-icon{background:linear-gradient(135deg,#003366,#0066cc);color:#00d4ff;box-shadow:0 0 10px rgba(0,180,255,0.3);}
  .msg.user .msg-icon{background:rgba(0,60,100,0.8);color:#00b4ff;border:1px solid rgba(0,180,255,0.3);}
  .msg-body{max-width:78%;}
  .msg-bubble{padding:10px 14px;font-size:12px;line-height:1.7;position:relative;white-space:pre-wrap;}
  .msg.assistant .msg-bubble{background:rgba(0,20,50,0.8);border:1px solid rgba(0,180,255,0.2);border-left:2px solid #00b4ff;clip-path:polygon(0 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%);color:#a8d4f0;font-family:'Share Tech Mono',monospace;}
  .msg.user .msg-bubble{background:rgba(0,40,80,0.6);border:1px solid rgba(0,180,255,0.15);border-right:2px solid rgba(0,180,255,0.5);clip-path:polygon(8px 0,100% 0,100% 100%,0 calc(100% - 8px),0 8px);color:#c8e6ff;text-align:right;font-family:'Share Tech Mono',monospace;}
  .msg-meta{font-size:8px;color:rgba(0,180,255,0.35);margin-top:3px;letter-spacing:1px;font-family:'Share Tech Mono',monospace;}
  .msg.user .msg-meta{text-align:right;}
  .thinking{display:flex;gap:5px;padding:10px 14px;}
  .thinking span{width:5px;height:5px;border-radius:50%;background:#00b4ff;animation:think 1.2s ease-in-out infinite;}
  .thinking span:nth-child(2){animation-delay:0.2s;}
  .thinking span:nth-child(3){animation-delay:0.4s;}
  @keyframes think{0%,100%{opacity:0.2;transform:scale(0.7);}50%{opacity:1;transform:scale(1.2);box-shadow:0 0 6px #00b4ff;}}
  .input-area{padding:10px 16px;border-top:1px solid rgba(0,180,255,0.15);background:rgba(2,11,24,0.9);backdrop-filter:blur(10px);flex-shrink:0;}
  .input-row{display:flex;gap:8px;align-items:flex-end;}
  .input-wrap{flex:1;position:relative;}
  .input-wrap::before{content:'//';position:absolute;left:10px;top:50%;transform:translateY(-50%);color:rgba(0,180,255,0.3);font-size:11px;pointer-events:none;}
  textarea{width:100%;background:rgba(0,20,50,0.6);border:1px solid rgba(0,180,255,0.2);padding:10px 12px 10px 28px;color:#a8d4f0;font-family:'Share Tech Mono',monospace;font-size:12px;resize:none;min-height:40px;max-height:100px;outline:none;clip-path:polygon(0 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%);transition:border-color 0.2s;}
  textarea:focus{border-color:rgba(0,180,255,0.5);}
  textarea::placeholder{color:rgba(0,180,255,0.25);}
  .send-btn{width:40px;height:40px;background:linear-gradient(135deg,#003399,#0099ff);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);transition:all 0.2s;color:white;font-size:14px;box-shadow:0 0 15px rgba(0,150,255,0.3);}
  .send-btn:hover{box-shadow:0 0 25px rgba(0,180,255,0.6);}
  .send-btn:disabled{opacity:0.3;cursor:not-allowed;}

  /* ── LOCK SCREEN ── */
  .lock-screen{position:fixed;inset:0;display:flex;align-items:flex-end;justify-content:center;z-index:100;padding-bottom:40px;}
  .lock-photo{position:absolute;inset:0;background-image:url('https://i.postimg.cc/3NLC68RY/family-(1).jpg');background-size:contain;background-position:center top;background-repeat:no-repeat;background-color:#050d1f;}
  .lock-photo::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom, rgba(0,0,0,0.0) 0%, rgba(5,13,31,0.2) 35%, rgba(5,13,31,0.85) 65%, rgba(5,13,31,0.97) 100%);z-index:1;}
  .lock-sides{position:absolute;inset:0;display:flex;pointer-events:none;z-index:0;}
  .lock-side-panel{position:absolute;top:0;bottom:0;width:calc(50% - 265px);overflow:hidden;opacity:0.3;}
  .lock-side-panel.left{left:0;background-image:url('https://i.postimg.cc/KvDwQBxR/ky1.webp');background-size:280px auto;background-repeat:repeat;}
  .lock-side-panel.right{right:0;background-image:url('https://i.postimg.cc/fTCqYsfL/ky2.webp');background-size:280px auto;background-repeat:repeat;}
  .lock-card{position:relative;z-index:2;width:100%;max-width:360px;text-align:center;padding:0 24px;}
  .lock-title{font-family:'Rajdhani',sans-serif;font-size:32px;font-weight:700;letter-spacing:6px;color:#fff;text-shadow:0 2px 20px rgba(0,0,0,0.8);margin-bottom:4px;}
  .lock-sub{font-size:11px;color:rgba(255,255,255,0.6);letter-spacing:3px;margin-bottom:28px;text-shadow:0 1px 8px rgba(0,0,0,0.8);}
  .lock-input{background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);padding:14px 18px;color:#fff;font-family:'Inter',sans-serif;font-size:15px;display:block;width:100%;margin:0 0 12px;text-align:center;outline:none;border-radius:12px;backdrop-filter:blur(10px);transition:all 0.2s;letter-spacing:4px;}
  .lock-input:focus{border-color:rgba(255,255,255,0.5);background:rgba(255,255,255,0.18);}
  .lock-input::placeholder{color:rgba(255,255,255,0.4);letter-spacing:2px;}
  .lock-btn{background:linear-gradient(135deg,#0056b3,#003580);border:none;padding:14px 0;color:white;font-family:'Inter',sans-serif;font-size:13px;font-weight:700;letter-spacing:3px;cursor:pointer;width:100%;border-radius:12px;box-shadow:0 4px 20px rgba(0,86,179,0.5);transition:all 0.2s;text-transform:uppercase;}
  .lock-btn:hover{background:linear-gradient(135deg,#0066cc,#004499);box-shadow:0 6px 28px rgba(0,86,179,0.7);}
  .lock-uk{font-size:11px;color:rgba(255,255,255,0.35);letter-spacing:2px;margin-top:16px;text-shadow:0 1px 6px rgba(0,0,0,0.8);}

  /* ── DASHBOARD ── */
  .dashboard{flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:12px;background:transparent;}
  .dash-row{display:grid;gap:10px;}
  .dash-row.cols-3{grid-template-columns:1fr 1fr 1fr;}
  .dash-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px 16px;backdrop-filter:blur(8px);}
  .dash-card-label{font-size:10px;font-weight:600;color:rgba(255,255,255,0.4);letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;}
  .dash-big{font-family:'Rajdhani',sans-serif;font-size:34px;font-weight:700;color:#fff;line-height:1;}
  .dash-sub{font-size:10px;color:rgba(255,255,255,0.4);margin-top:4px;letter-spacing:1px;}
  .dash-weather-icon{font-size:30px;margin-bottom:4px;}
  .dash-date{font-size:15px;font-weight:600;color:#fff;letter-spacing:1px;}
  .briefing-list{display:flex;flex-direction:column;gap:7px;}
  .briefing-item{font-size:12px;color:rgba(255,255,255,0.8);line-height:1.4;padding-left:14px;position:relative;}
  .briefing-item::before{content:'●';position:absolute;left:0;color:#0056b3;font-size:7px;top:4px;}
  .chore-summary{display:flex;flex-direction:column;gap:6px;}
  .chore-row{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:rgba(255,255,255,0.7);}
  .chore-done-badge{background:rgba(0,200,100,0.15);color:#00c864;font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;border:1px solid rgba(0,200,100,0.2);}
  .chore-progress{font-size:11px;color:rgba(255,255,255,0.4);}
  .weather-loading{font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:1px;animation:blink 1s ease-in-out infinite;}
  @keyframes blink{0%,100%{opacity:0.3;}50%{opacity:1;}}
  .uk-accent{color:#0066cc;font-weight:700;}

  /* ── CHORES ── */
  .chores-panel{flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:10px;}
  .section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;}
  .section-title{font-size:13px;font-weight:700;color:#fff;letter-spacing:2px;text-transform:uppercase;}
  .section-count{font-size:11px;color:rgba(255,255,255,0.4);}
  .kid-block{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px 16px;}
  .kid-name{font-size:13px;font-weight:700;color:#fff;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;}
  .kid-badge{background:rgba(0,200,100,0.15);color:#00c864;font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;border:1px solid rgba(0,200,100,0.2);}
  .chore-item{display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);}
  .chore-item:last-of-type{border-bottom:none;}
  .chore-check{width:18px;height:18px;border:1.5px solid rgba(255,255,255,0.2);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;border-radius:4px;transition:all 0.2s;}
  .chore-check.done{background:#0056b3;border-color:#0056b3;}
  .chore-check.done::after{content:'✓';font-size:11px;color:#fff;font-weight:700;}
  .chore-text{font-size:13px;color:rgba(255,255,255,0.8);flex:1;}
  .chore-text.done{color:rgba(255,255,255,0.25);text-decoration:line-through;}
  .chore-del{background:none;border:none;color:rgba(255,255,255,0.15);cursor:pointer;font-size:16px;line-height:1;padding:0 2px;}
  .chore-del:hover{color:rgba(255,80,80,0.6);}
  .add-chore-row{display:flex;gap:6px;margin-top:10px;}
  .add-chore-input{flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);padding:7px 12px;color:#fff;font-family:'Inter',sans-serif;font-size:12px;outline:none;border-radius:8px;}
  .add-chore-input:focus{border-color:rgba(0,86,179,0.5);}
  .add-chore-input::placeholder{color:rgba(255,255,255,0.2);}
  .add-btn{background:#0056b3;border:none;color:white;font-family:'Inter',sans-serif;font-size:11px;font-weight:600;padding:7px 14px;cursor:pointer;border-radius:8px;letter-spacing:0.5px;}
  .add-btn:hover{background:#0066cc;}
  .reset-btn{background:none;border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.3);font-family:'Inter',sans-serif;font-size:10px;padding:3px 10px;cursor:pointer;border-radius:6px;}
  .reset-btn:hover{border-color:rgba(255,255,255,0.3);color:rgba(255,255,255,0.6);}
  .empty-state{font-size:12px;color:rgba(255,255,255,0.25);text-align:center;padding:20px;}

  /* ── SHOPPING ── */
  .shopping-panel{flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:12px;}
  .shop-categories{display:flex;gap:6px;flex-wrap:wrap;}
  .cat-btn{padding:5px 12px;border:1px solid rgba(255,255,255,0.1);background:transparent;color:rgba(255,255,255,0.4);font-family:'Inter',sans-serif;font-size:10px;font-weight:600;cursor:pointer;letter-spacing:1px;border-radius:20px;transition:all 0.2s;}
  .cat-btn.active{border-color:#0056b3;color:#fff;background:rgba(0,86,179,0.25);}
  .shop-list{display:flex;flex-direction:column;gap:4px;}
  .shop-item{display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-radius:10px;}
  .shop-item.checked{opacity:0.35;}
  .shop-check{width:18px;height:18px;border:1.5px solid rgba(255,255,255,0.2);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;border-radius:4px;transition:all 0.2s;}
  .shop-check.done{background:#0056b3;border-color:#0056b3;}
  .shop-check.done::after{content:'✓';font-size:11px;color:#fff;font-weight:700;}
  .shop-text{flex:1;font-size:13px;color:rgba(255,255,255,0.85);}
  .shop-cat-tag{font-size:9px;font-weight:600;color:rgba(255,255,255,0.25);letter-spacing:1px;background:rgba(255,255,255,0.05);padding:2px 7px;border-radius:10px;}
  .shop-del{background:none;border:none;color:rgba(255,255,255,0.15);cursor:pointer;font-size:16px;}
  .shop-del:hover{color:rgba(255,80,80,0.6);}
  .add-shop-row{display:flex;gap:6px;}
  .add-shop-input{flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);padding:9px 12px;color:#fff;font-family:'Inter',sans-serif;font-size:12px;outline:none;border-radius:8px;}
  .add-shop-input:focus{border-color:rgba(0,86,179,0.5);}
  .add-shop-input::placeholder{color:rgba(255,255,255,0.2);}
  .shop-cat-select{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.7);font-family:'Inter',sans-serif;font-size:11px;padding:9px 8px;outline:none;cursor:pointer;border-radius:8px;}
  .shop-cat-select option{background:#1a2332;color:#fff;padding:8px;}
  .clear-checked-btn{background:none;border:1px solid rgba(255,80,80,0.2);color:rgba(255,80,80,0.5);font-family:'Inter',sans-serif;font-size:10px;padding:5px 12px;cursor:pointer;border-radius:6px;}
  .clear-checked-btn:hover{border-color:rgba(255,80,80,0.5);color:rgba(255,80,80,0.8);}

  /* ── BULLETIN BOARD ── */
  .bulletin-form{display:flex;gap:8px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.06);}
  .bulletin-input{flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);padding:10px 12px;color:#fff;font-family:'Inter',sans-serif;font-size:12px;outline:none;border-radius:8px;resize:none;min-height:40px;max-height:80px;}
  .bulletin-input:focus{border-color:rgba(0,86,179,0.5);}
  .bulletin-input::placeholder{color:rgba(255,255,255,0.2);}
  .bulletin-send{background:#0056b3;border:none;color:white;font-family:'Inter',sans-serif;font-size:11px;font-weight:600;padding:10px 16px;cursor:pointer;border-radius:8px;letter-spacing:0.5px;}
  .bulletin-send:hover{background:#0066cc;}
  .bulletin-item{background:rgba(0,86,179,0.08);border:1px solid rgba(0,86,179,0.15);border-left:3px solid #0056b3;border-radius:0 8px 8px 0;padding:10px 12px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:flex-start;}
  .bulletin-content{flex:1;}
  .bulletin-text{font-size:12px;color:rgba(255,255,255,0.85);line-height:1.4;margin-bottom:4px;}
  .bulletin-meta{font-size:9px;color:rgba(0,86,179,0.6);letter-spacing:1px;}
  .bulletin-delete{background:none;border:none;color:rgba(255,80,80,0.4);cursor:pointer;font-size:14px;padding:0 4px;margin-left:8px;}
  .bulletin-delete:hover{color:rgba(255,80,80,0.8);}

  /* ── NOTIFICATION ── */
  .notification{position:fixed;top:20px;right:20px;background:linear-gradient(135deg,#0056b3,#003580);color:#fff;padding:12px 16px;border-radius:8px;box-shadow:0 4px 20px rgba(0,86,179,0.6);z-index:1000;font-family:'Inter',sans-serif;font-size:12px;font-weight:600;letter-spacing:0.5px;animation:notifySlide 0.3s ease-out;max-width:300px;}
  @keyframes notifySlide{from{transform:translateX(100%);opacity:0;}to{transform:translateX(0);opacity:1;}}
  .notification.hide{animation:notifySlideOut 0.3s ease-out forwards;}
  @keyframes notifySlideOut{from{transform:translateX(0);opacity:1;}to{transform:translateX(100%);opacity:0;}}

  /* ── CALENDAR ── */
  .calendar-panel{flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:12px;}
  .calendar-iframe{width:100%;height:calc(100vh - 160px);border:0;border-radius:12px;background:rgba(255,255,255,0.95);}
`

const KIDS = ['Lincoln', 'Camille', 'Cicily', 'Carter']
const SHOP_CATS = ['ALL', 'PRODUCE', 'DAIRY', 'MEAT', 'PANTRY', 'HOUSEHOLD', 'OTHER']

const DEFAULT_CHORES = {
  Lincoln: ['Clean bathroom', 'Vacuum living room'],
  Camille: ['Wash dishes', 'Take out trash'],
  Cicily: ['Feed pets', 'Tidy bedroom'],
  Carter: ['Mow lawn', 'Sweep kitchen'],
}

function loadLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
function saveLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

// Firebase sync functions
async function loadFromFirebase(path, fallback = []) {
  const data = await firebase.get(path)
  return data || fallback
}

async function saveToFirebase(path, data) {
  await firebase.set(path, data)
}

export default function Home() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState('Dad')
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [time, setTime] = useState('')
  const [tab, setTab] = useState('dashboard')
  const [weather, setWeather] = useState(null)
  const [chores, setChores] = useState({})
  const [shopping, setShopping] = useState([])
  const [shopFilter, setShopFilter] = useState('ALL')
  const [newChore, setNewChore] = useState({})
  const [newShopItem, setNewShopItem] = useState('')
  const [newShopCat, setNewShopCat] = useState('OTHER')
  const [bulletins, setBulletins] = useState([])
  const [newBulletin, setNewBulletin] = useState('')
  const [notification, setNotification] = useState('')
  const [dailyVerse, setDailyVerse] = useState('')
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const bottomRef = useRef(null)
  const family = ['Dad', 'Mom', 'Lincoln', 'Camille', 'Cicily', 'Carter']

  // Daily Bible verses - large collection for daily variety
  const bibleVerses = [
    { verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.", reference: "Jeremiah 29:11" },
    { verse: "Trust in the Lord with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5" },
    { verse: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13" },
    { verse: "And we know that in all things God works for the good of those who love him.", reference: "Romans 8:28" },
    { verse: "Be strong and courageous! Do not be afraid or discouraged, for the Lord your God is with you wherever you go.", reference: "Joshua 1:9" },
    { verse: "The Lord is my shepherd; I shall not want.", reference: "Psalm 23:1" },
    { verse: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud.", reference: "1 Corinthians 13:4" },
    { verse: "Cast all your anxiety on him because he cares for you.", reference: "1 Peter 5:7" },
    { verse: "But seek first his kingdom and his righteousness, and all these things will be given to you as well.", reference: "Matthew 6:33" },
    { verse: "The Lord your God is with you, the Mighty Warrior who saves.", reference: "Zephaniah 3:17" },
    { verse: "Give thanks to the Lord, for he is good; his love endures forever.", reference: "Psalm 107:1" },
    { verse: "Train up a child in the way he should go; even when he is old he will not depart from it.", reference: "Proverbs 22:6" },
    { verse: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", reference: "Joshua 1:9" },
    { verse: "The Lord will fight for you; you need only to be still.", reference: "Exodus 14:14" },
    { verse: "Delight yourself in the Lord, and he will give you the desires of your heart.", reference: "Psalm 37:4" },
    { verse: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", reference: "Philippians 4:6" },
    { verse: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.", reference: "Psalm 34:18" },
    { verse: "Commit to the Lord whatever you do, and he will establish your plans.", reference: "Proverbs 16:3" },
    { verse: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.", reference: "Isaiah 40:31" },
    { verse: "Be joyful in hope, patient in affliction, faithful in prayer.", reference: "Romans 12:12" },
    { verse: "The Lord bless you and keep you; the Lord make his face shine on you and be gracious to you.", reference: "Numbers 6:24-25" },
    { verse: "He gives strength to the weary and increases the power of the weak.", reference: "Isaiah 40:29" },
    { verse: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.", reference: "Galatians 6:9" },
    { verse: "Above all else, guard your heart, for everything you do flows from it.", reference: "Proverbs 4:23" },
    { verse: "The name of the Lord is a fortified tower; the righteous run to it and are safe.", reference: "Proverbs 18:10" },
    { verse: "In their hearts humans plan their course, but the Lord establishes their steps.", reference: "Proverbs 16:9" },
    { verse: "Fear not, for I am with you; be not dismayed, for I am your God.", reference: "Isaiah 41:10" },
    { verse: "Therefore do not worry about tomorrow, for tomorrow will worry about itself.", reference: "Matthew 6:34" },
    { verse: "The joy of the Lord is your strength.", reference: "Nehemiah 8:10" },
    { verse: "God is our refuge and strength, an ever-present help in trouble.", reference: "Psalm 46:1" },
    { verse: "Trust in the Lord forever, for the Lord, the Lord himself, is the Rock eternal.", reference: "Isaiah 26:4" },
    { verse: "The Lord your God is in your midst, a mighty one who will save.", reference: "Zephaniah 3:17" },
    { verse: "Come to me, all you who are weary and burdened, and I will give you rest.", reference: "Matthew 11:28" },
    { verse: "Wait for the Lord; be strong and take heart and wait for the Lord.", reference: "Psalm 27:14" },
    { verse: "May the God of hope fill you with all joy and peace as you trust in him.", reference: "Romans 15:13" },
    { verse: "She is clothed with strength and dignity; she can laugh at the days to come.", reference: "Proverbs 31:25" },
    { verse: "Do everything in love.", reference: "1 Corinthians 16:14" },
    { verse: "Whatever you do, work at it with all your heart, as working for the Lord.", reference: "Colossians 3:23" },
    { verse: "Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.", reference: "Ephesians 4:32" },
    { verse: "And my God will meet all your needs according to the riches of his glory in Christ Jesus.", reference: "Philippians 4:19" },
    { verse: "The Lord is good, a refuge in times of trouble. He cares for those who trust in him.", reference: "Nahum 1:7" },
    { verse: "This is the day the Lord has made; let us rejoice and be glad in it.", reference: "Psalm 118:24" },
    { verse: "Children are a heritage from the Lord, offspring a reward from him.", reference: "Psalm 127:3" },
    { verse: "As for me and my household, we will serve the Lord.", reference: "Joshua 24:15" },
    { verse: "Honor your father and mother, so that you may live long in the land the Lord your God is giving you.", reference: "Exodus 20:12" },
    { verse: "A cheerful heart is good medicine, but a crushed spirit dries up the bones.", reference: "Proverbs 17:22" },
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

  // Load persisted data and set up Firebase sync
  useEffect(() => {
    async function loadInitialData() {
      // Load from Firebase
      const firebaseChores = await loadFromFirebase('chores')
      const firebaseShopping = await loadFromFirebase('shopping')
      const firebaseBulletins = await loadFromFirebase('bulletins')
      
      // Set state with Firebase data or fallbacks
      setChores(firebaseChores || DEFAULT_CHORES.Cicily ? 
        Object.fromEntries(KIDS.map(k => [k, (DEFAULT_CHORES[k] || []).map((t, i) => ({ id: i, text: t, done: false }))])) : {}
      )
      setShopping(firebaseShopping || [])
      setBulletins(firebaseBulletins || [])
    }

    loadInitialData()

    // Set daily Bible verse
    setDailyVerse(getDailyVerse())

    // Real-time sync - check for updates every 3 seconds
    const syncInterval = setInterval(async () => {
      const firebaseBulletins = await loadFromFirebase('bulletins')
      const firebaseShopping = await loadFromFirebase('shopping')
      const firebaseChores = await loadFromFirebase('chores')
      
      // Update state if Firebase has newer data
      if (firebaseBulletins && firebaseBulletins.length !== bulletins.length) {
        setBulletins(firebaseBulletins)
        // Show notification if new bulletin from someone else
        if (firebaseBulletins.length > bulletins.length) {
          const newBulletin = firebaseBulletins[0]
          if (newBulletin && newBulletin.author !== user) {
            showNotification(`New bulletin from ${newBulletin.author}: ${newBulletin.text.substring(0, 50)}...`)
          }
        }
      }
      
      if (firebaseShopping && JSON.stringify(firebaseShopping) !== JSON.stringify(shopping)) {
        setShopping(firebaseShopping)
      }
      
      if (firebaseChores && JSON.stringify(firebaseChores) !== JSON.stringify(chores)) {
        setChores(firebaseChores)
      }
    }, 3000)

    return () => clearInterval(syncInterval)
  }, [user, bulletins.length, shopping, chores])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }, 1000)
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    
    return () => clearInterval(t)
  }, [])

  // Fetch weather for Lexington, KY
  useEffect(() => {
    if (!authed) return
    fetch('https://api.open-meteo.com/v1/forecast?latitude=38.0406&longitude=-84.5037&current=temperature_2m,weathercode,windspeed_10m&temperature_unit=fahrenheit&windspeed_unit=mph')
      .then(r => r.json())
      .then(d => {
        const code = d.current.weathercode
        const icons = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️', 51: '🌦️', 61: '🌧️', 71: '🌨️', 80: '🌦️', 95: '⛈️' }
        const descs = { 0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast', 45: 'Foggy', 51: 'Drizzle', 61: 'Rain', 71: 'Snow', 80: 'Showers', 95: 'Thunderstorm' }
        setWeather({
          temp: Math.round(d.current.temperature_2m),
          icon: icons[code] || '🌡️',
          desc: descs[code] || 'Mixed',
          wind: Math.round(d.current.windspeed_10m)
        })
      }).catch(() => setWeather({ temp: '--', icon: '🌡️', desc: 'Unavailable', wind: '--' }))
  }, [authed])

  function showNotification(message) {
    setNotification(message)
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification('')
    }, 5000)
    
    // Try to show browser notification if allowed
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('JARVIS Family Bulletin', {
        body: message,
        icon: '/favicon.ico'
      })
    }
  }

  function addBulletin() {
    const text = newBulletin.trim()
    if (!text) return
    const bulletin = {
      id: Date.now(),
      text,
      author: user,
      timestamp: new Date().toISOString()
    }
    const updated = [bulletin, ...bulletins]
    setBulletins(updated)
    saveToFirebase('bulletins', updated)
    setNewBulletin('')
  }
  
  function deleteBulletin(id) {
    const updated = bulletins.filter(b => b.id !== id)
    setBulletins(updated)
    saveToFirebase('bulletins', updated)
  }

  function saveShopping(updated) { 
    setShopping(updated)
    saveToFirebase('shopping', updated)
  }
  
  function saveChores(updated) { 
    setChores(updated)
    saveToFirebase('chores', updated)
  }

  function toggleChore(kid, id) {
    const updated = { ...chores, [kid]: chores[kid].map(c => c.id === id ? { ...c, done: !c.done } : c) }
    saveChores(updated)
  }
  function addChore(kid) {
    const text = (newChore[kid] || '').trim()
    if (!text) return
    const updated = { ...chores, [kid]: [...(chores[kid] || []), { id: Date.now(), text, done: false }] }
    saveChores(updated)
    setNewChore({ ...newChore, [kid]: '' })
  }
  function deleteChore(kid, id) {
    const updated = { ...chores, [kid]: chores[kid].filter(c => c.id !== id) }
    saveChores(updated)
  }
  function resetChores(kid) {
    const updated = { ...chores, [kid]: chores[kid].map(c => ({ ...c, done: false })) }
    saveChores(updated)
  }

  function addShopItem() {
    const text = newShopItem.trim()
    if (!text) return
    saveShopping([...shopping, { id: Date.now(), text, cat: newShopCat, done: false }])
    setNewShopItem('')
  }
  function toggleShop(id) { saveShopping(shopping.map(i => i.id === id ? { ...i, done: !i.done } : i)) }
  function deleteShop(id) { saveShopping(shopping.filter(i => i.id !== id)) }
  function clearChecked() { saveShopping(shopping.filter(i => !i.done)) }

  async function send() {
    if ((!input.trim() && !uploadedImage) || loading) return
    
    // Create user message with optional image
    const userMsg = { 
      role: 'user', 
      content: input || (uploadedImage ? "Can you help me solve this math problem step by step?" : ""), 
      name: user,
      image: imagePreview 
    }
    
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    const userInput = input.toLowerCase()
    setInput('')
    setLoading(true)
    
    try {
      // Check for special commands first (weather/news)
      if (userInput.includes('weather') && (userInput.includes('tomorrow') || userInput.includes('forecast'))) {
        // Weather forecast code stays the same...
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=38.0406&longitude=-84.5037&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&forecast_days=2')
        const data = await response.json()
        const tomorrowData = data.daily
        const tomorrowCode = tomorrowData.weathercode[1]
        const tomorrowHigh = Math.round(tomorrowData.temperature_2m_max[1])
        const tomorrowLow = Math.round(tomorrowData.temperature_2m_min[1])
        
        const icons = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️', 51: '🌦️', 61: '🌧️', 71: '🌨️', 80: '🌦️', 95: '⛈️' }
        const descs = { 0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast', 45: 'Foggy', 51: 'Drizzle', 61: 'Rain', 71: 'Snow', 80: 'Showers', 95: 'Thunderstorm' }
        
        const weatherReply = `Tomorrow's weather in Lexington: ${icons[tomorrowCode] || '🌡️'} ${descs[tomorrowCode] || 'Mixed conditions'}\n\nHigh: ${tomorrowHigh}°F\nLow: ${tomorrowLow}°F\n\nPlan accordingly, ${user}!`
        setMessages(m => [...m, { role: 'assistant', content: weatherReply, name: 'JARVIS' }])
        setLoading(false)
        return
      }
      
      if (userInput.includes('news') || userInput.includes('headlines')) {
        // News code stays the same...
        const response = await fetch('https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=demo')
        let newsReply = "Here are today's top headlines:\n\n"
        
        if (!response.ok) {
          newsReply = `I don't have access to live news feeds right now, ${user}. For the latest updates, I'd recommend:\n\n• BBC News (bbc.com/news)\n• Reuters (reuters.com)\n• AP News (apnews.com)\n• NPR (npr.org)\n\nIs there anything specific you'd like to know about?`
        } else {
          const data = await response.json()
          if (data.articles && data.articles.length > 0) {
            data.articles.slice(0, 4).forEach((article, i) => {
              newsReply += `${i + 1}. ${article.title}\n`
            })
            newsReply += "\nFor full articles, check your preferred news app or website."
          }
        }
        
        setMessages(m => [...m, { role: 'assistant', content: newsReply, name: 'JARVIS' }])
        setLoading(false)
        return
      }
      
      // Prepare API call with potential image
      const apiBody = { messages: newMessages, user, context: FAMILY_CONTEXT }
      
      // If there's an uploaded image, convert to base64 and add to API call
      if (uploadedImage) {
        const reader = new FileReader()
        reader.onload = async () => {
          const base64Image = reader.result.split(',')[1]
          apiBody.image = {
            type: 'image',
            source: {
              type: 'base64',
              media_type: uploadedImage.type,
              data: base64Image
            }
          }
          
          // Make API call with image
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiBody)
          })
          const data = await res.json()
          setMessages(m => [...m, { role: 'assistant', content: data.reply, name: 'JARVIS' }])
          setLoading(false)
          clearImage() // Clear the uploaded image after sending
        }
        reader.readAsDataURL(uploadedImage)
      } else {
        // Regular text-only API call
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(apiBody)
        })
        const data = await res.json()
        setMessages(m => [...m, { role: 'assistant', content: data.reply, name: 'JARVIS' }])
        setLoading(false)
      }
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'System error. Please try again.', name: 'JARVIS' }])
      setLoading(false)
    }
  }

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const filteredShopping = shopFilter === 'ALL' ? shopping : shopping.filter(i => i.cat === shopFilter)
  const totalChoresDone = Object.values(chores).flat().filter(c => c.done).length
  const totalChores = Object.values(chores).flat().length

  if (!authed) return (
    <>
      <style>{styles}</style>
      <div className="lock-screen">
        <div className="lock-photo" />
        <div className="lock-sides">
          <div className="lock-side-panel left" />
          <div className="lock-side-panel right" />
        </div>
        <div className="lock-card">
          <div className="lock-title">DEATHERAGE</div>
          <div className="lock-sub">FAMILY SYSTEM · LEXINGTON KY</div>
          <input className="lock-input" type="password" placeholder="Enter password" value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && pass === PASSWORD && setAuthed(true)} />
          <button className="lock-btn" onClick={() => pass === PASSWORD && setAuthed(true)}>Unlock</button>
          <div className="lock-uk">GO WILDCATS 🐾</div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style>{styles}</style>
      <div className="app-bg" />
      {tab === 'chat' && <><div className="arc-bg" /><div className="scan" /><div className="corner tl" /><div className="corner tr" /><div className="corner bl" /><div className="corner br" /></>}
      
      {/* Notification popup */}
      {notification && (
        <div className="notification" onClick={() => setNotification('')}>
          📢 {notification}
        </div>
      )}
      
      <div className="app">

        {/* HEADER */}
        {tab === 'chat' ? (
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="arc-reactor">
                <div className="arc-outer" /><div className="arc-mid" /><div className="arc-core" />
              </div>
              <div className="title-block">
                <h1>J.A.R.V.I.S</h1>
                <p>Just A Rather Very Intelligent System</p>
              </div>
            </div>
            <div className="hud-stats">
              <div className="hud-stat"><span>{time}</span><span>LOCAL TIME</span></div>
              <div className="hud-stat"><span style={{ color: '#00ff88' }}>ONLINE</span><span>STATUS</span></div>
            </div>
          </div>
        ) : (
          <div className="header">
            <div className="header-brand">
              <div className="header-logo">UK</div>
              <div className="header-text">
                <h1>DEATHERAGE</h1>
                <p>Family Command Center</p>
              </div>
            </div>
            <div className="header-time">
              <div className="time">{time}</div>
              <div className="date">{today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}</div>
            </div>
          </div>
        )}

        {/* NAV */}
        <div className="nav-tabs">
          {['dashboard', 'chat', 'chores', 'shopping', 'calendar'].map(t => (
            <button key={t} className={`nav-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t === 'dashboard' ? '⬡ HOME' : t === 'chat' ? '◈ CHAT' : t === 'chores' ? '✦ CHORES' : t === 'shopping' ? '⊕ SHOPPING' : '◷ CALENDAR'}
            </button>
          ))}
        </div>

        {/* USER BAR (chat only) */}
        {tab === 'chat' && (
          <div className="user-bar">
            {family.map(f => (
              <button key={f} className={`user-btn${user === f ? ' active' : ''}`} onClick={() => setUser(f)}>
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* ── DASHBOARD TAB ── */}
        {tab === 'dashboard' && (
          <div className="dashboard">
            <div className="dash-row cols-3">
              {/* Date + Today's Events */}
              <div className="dash-card">
                <div className="dash-card-label">TODAY'S SCHEDULE</div>
                <div className="dash-date">{today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}</div>
                <div className="dash-sub" style={{ marginBottom: 12 }}>{today.getFullYear()} · LEXINGTON KY</div>
                
                {/* Mini Calendar Widget */}
                <iframe 
                  src="https://calendar.google.com/calendar/embed?height=140&wkst=1&bgcolor=%23000000&ctz=America%2FNew_York&src=uktweeter19%40gmail.com&src=family021430976716499641216%40group.calendar.google.com&src=98vibj87ujjb3cm68lo4jatcghv2dq16%40import.calendar.google.com&color=%23039BE5&color=%2333B679&color=%23F4511E&mode=AGENDA&showTitle=0&showNav=0&showDate=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0" 
                  style={{ 
                    width: '100%', 
                    height: '120px', 
                    border: '1px solid rgba(0,86,179,0.2)', 
                    borderRadius: '8px',
                    background: '#0a0f1a',
                    filter: 'invert(0.85) hue-rotate(180deg) brightness(0.6) contrast(1.5)',
                    opacity: '0.9'
                  }}
                  title="Today's Events"
                />
              </div>
              {/* Weather */}
              <div className="dash-card">
                <div className="dash-card-label">WEATHER</div>
                {weather ? (
                  <>
                    <div className="dash-weather-icon">{weather.icon}</div>
                    <div className="dash-big">{weather.temp}°F</div>
                    <div className="dash-sub">{weather.desc.toUpperCase()} · WIND {weather.wind}MPH</div>
                  </>
                ) : <div className="weather-loading">SCANNING...</div>}
              </div>
              {/* Chore Progress */}
              <div className="dash-card">
                <div className="dash-card-label">CHORES</div>
                <div className="dash-big">{totalChoresDone}<span style={{ fontSize: 14, color: 'rgba(0,180,255,0.4)' }}>/{totalChores}</span></div>
                <div className="dash-sub">TASKS COMPLETED TODAY</div>
              </div>
            </div>

            {/* Daily Bible Verse - TOP PRIORITY POSITION */}
            <div className="dash-card">
              <div className="dash-card-label">
                DAILY WORD
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginLeft: 8 }}>
                  ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                </span>
              </div>
              <div style={{ 
                fontSize: 13, 
                color: 'rgba(255,255,255,0.9)', 
                lineHeight: 1.6, 
                fontStyle: 'italic',
                marginBottom: 8,
                padding: '8px 0'
              }}>
                "{dailyVerse.verse}"
              </div>
              <div style={{ 
                fontSize: 11, 
                color: '#0056b3', 
                fontWeight: 600,
                letterSpacing: 1,
                textAlign: 'right'
              }}>
                — {dailyVerse.reference}
              </div>
            </div>

            {/* Family Bulletin Board */}
            <div className="dash-card">
              <div className="dash-card-label">
                FAMILY BULLETIN BOARD
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginLeft: 8 }}>
                  ({bulletins.length} announcements)
                </span>
              </div>
              
              {/* Quick Post Form */}
              <div className="bulletin-form">
                <textarea 
                  className="bulletin-input" 
                  placeholder={`Post an announcement as ${user}...`}
                  value={newBulletin}
                  onChange={e => setNewBulletin(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      addBulletin()
                    }
                  }}
                />
                <button className="bulletin-send" onClick={addBulletin}>POST</button>
              </div>

              {/* Bulletins Display */}
              {bulletins.length === 0 ? (
                <div style={{ fontSize: 11, color: 'rgba(0,180,255,0.3)', letterSpacing: 1, textAlign: 'center', padding: '12px 0' }}>
                  NO ANNOUNCEMENTS · POST ONE ABOVE
                </div>
              ) : (
                <div>
                  {bulletins.slice(0, 5).map(bulletin => (
                    <div key={bulletin.id} className="bulletin-item">
                      <div className="bulletin-content">
                        <div className="bulletin-text">{bulletin.text}</div>
                        <div className="bulletin-meta">
                          <strong>{bulletin.author}</strong> · {new Date(bulletin.timestamp).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      <button 
                        className="bulletin-delete" 
                        onClick={() => deleteBulletin(bulletin.id)}
                      >×</button>
                    </div>
                  ))}
                  {bulletins.length > 5 && (
                    <div style={{ fontSize: 10, color: 'rgba(0,180,255,0.4)', textAlign: 'center', padding: 4 }}>
                      +{bulletins.length - 5} more announcements
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chore Summary - MOVED TO BOTTOM */}
            <div className="dash-card">
              <div className="dash-card-label">CHORE STATUS BY AGENT</div>
              <div className="chore-summary">
                {KIDS.map(kid => {
                  const kidChores = chores[kid] || []
                  const done = kidChores.filter(c => c.done).length
                  const total = kidChores.length
                  const allDone = total > 0 && done === total
                  return (
                    <div key={kid} className="chore-row">
                      <span>{kid}</span>
                      {allDone
                        ? <span className="chore-done-badge">✓ Done</span>
                        : <span className="chore-progress">{done}/{total}</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Shopping Summary - MOVED TO BOTTOM */}
            <div className="dash-card">
              <div className="dash-card-label">SHOPPING LIST</div>
              {shopping.filter(i => !i.done).length === 0 ? (
                <div style={{ fontSize: 10, color: 'rgba(0,180,255,0.3)', letterSpacing: 2 }}>NO ITEMS PENDING</div>
              ) : (
                <div className="briefing-list">
                  {shopping.filter(i => !i.done).slice(0, 6).map(i => (
                    <div key={i.id} className="briefing-item">{i.text} <span style={{ color: 'rgba(0,180,255,0.3)' }}>· {i.cat}</span></div>
                  ))}
                  {shopping.filter(i => !i.done).length > 6 && (
                    <div className="briefing-item" style={{ color: 'rgba(0,180,255,0.4)' }}>+{shopping.filter(i => !i.done).length - 6} more items</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── CHAT TAB ── */}
        {tab === 'chat' && (
          <>
            <div className="messages">
              {messages.length === 0 && (
                <div className="welcome">
                  <div className="welcome-ring"><div className="welcome-core" /></div>
                  <h2>SYSTEMS ONLINE</h2>
                  <p>Good to see you, {user}. All Deatherage family systems operational. How may I assist?</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`msg ${m.role}`}>
                  <div className="msg-icon">{m.role === 'user' ? m.name.substring(0, 2).toUpperCase() : 'J·A·I'}</div>
                  <div className="msg-body">
                    <div className="msg-bubble">
                      {m.image && (
                        <img 
                          src={m.image} 
                          alt="Uploaded math problem" 
                          style={{ 
                            maxWidth: '100%', 
                            borderRadius: '8px', 
                            marginBottom: '8px',
                            border: '1px solid rgba(0,180,255,0.3)'
                          }} 
                        />
                      )}
                      {m.content}
                    </div>
                    <div className="msg-meta">{m.name} · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="msg assistant">
                  <div className="msg-icon">J·A·I</div>
                  <div className="msg-body">
                    <div className="msg-bubble" style={{ background: 'rgba(0,20,50,0.8)', border: '1px solid rgba(0,180,255,0.2)', borderLeft: '2px solid #00b4ff' }}>
                      <div className="thinking"><span /><span /><span /></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="input-area">
              {/* Image preview */}
              {imagePreview && (
                <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(0,180,255,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={imagePreview} 
                      alt="Upload preview" 
                      style={{ 
                        width: '60px', 
                        height: '60px', 
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        border: '1px solid rgba(0,180,255,0.3)'
                      }} 
                    />
                    <div style={{ flex: 1, fontSize: '11px', color: 'rgba(0,180,255,0.6)' }}>
                      Math problem ready to solve
                    </div>
                    <button 
                      onClick={clearImage}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,80,80,0.6)',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: '4px'
                      }}
                    >×</button>
                  </div>
                </div>
              )}
              
              <div className="input-row">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <button 
                  onClick={() => document.getElementById('image-upload').click()}
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg,#003366,#0066cc)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)',
                    color: 'white',
                    fontSize: '16px',
                    boxShadow: '0 0 15px rgba(0,150,255,0.3)',
                    marginRight: '8px'
                  }}
                  title="Upload math problem image"
                >📷</button>
                <div className="input-wrap">
                  <textarea value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                    placeholder="Awaiting your command..." rows={1} style={{ lineHeight: '20px' }} />
                </div>
                <button className="send-btn" onClick={send} disabled={loading}>➤</button>
              </div>
            </div>
          </>
        )}

        {/* ── CALENDAR TAB ── */}
        {tab === 'calendar' && (
          <div className="calendar-panel">
            <div className="section-header">
              <div className="section-title">Family Calendar</div>
            </div>
            <iframe 
              src="https://calendar.google.com/calendar/embed?src=uktweeter19%40gmail.com&src=family021430976716499641216%40group.calendar.google.com&src=98vibj87ujjb3cm68lo4jatcghv2dq16%40import.calendar.google.com&ctz=America%2FNew_York" 
              className="calendar-iframe"
              title="Family Calendar"
            />
          </div>
        )}

        {tab === 'chores' && (
          <div className="chores-panel">
            <div className="section-header">
              <div className="section-title">Chore Assignments</div>
              <div className="section-count">{totalChoresDone}/{totalChores} done</div>
            </div>
            {KIDS.map(kid => {
              const kidChores = chores[kid] || []
              const doneCount = kidChores.filter(c => c.done).length
              return (
                <div key={kid} className="kid-block">
                  <div className="kid-name">
                    {kid.toUpperCase()}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="kid-badge">{doneCount}/{kidChores.length}</span>
                      <button className="reset-btn" onClick={() => resetChores(kid)}>RESET</button>
                    </div>
                  </div>
                  {kidChores.length === 0 && <div className="empty-state">NO CHORES ASSIGNED</div>}
                  {kidChores.map(c => (
                    <div key={c.id} className="chore-item">
                      <div className={`chore-check${c.done ? ' done' : ''}`} onClick={() => toggleChore(kid, c.id)} />
                      <span className={`chore-text${c.done ? ' done' : ''}`}>{c.text}</span>
                      <button className="chore-del" onClick={() => deleteChore(kid, c.id)}>×</button>
                    </div>
                  ))}
                  <div className="add-chore-row">
                    <input className="add-chore-input" placeholder="Add task..." value={newChore[kid] || ''}
                      onChange={e => setNewChore({ ...newChore, [kid]: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && addChore(kid)} />
                    <button className="add-btn" onClick={() => addChore(kid)}>+ ADD</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── SHOPPING TAB ── */}
        {tab === 'shopping' && (
          <div className="shopping-panel">
            <div className="section-header">
              <div className="section-title">Shopping List</div>
              {shopping.some(i => i.done) && (
                <button className="clear-checked-btn" onClick={clearChecked}>Clear checked</button>
              )}
            </div>
            <div className="shop-categories">
              {SHOP_CATS.map(c => (
                <button key={c} className={`cat-btn${shopFilter === c ? ' active' : ''}`} onClick={() => setShopFilter(c)}>{c}</button>
              ))}
            </div>
            <div className="add-shop-row">
              <input className="add-shop-input" placeholder="Add item..." value={newShopItem}
                onChange={e => setNewShopItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addShopItem()} />
              <select className="shop-cat-select" value={newShopCat} onChange={e => setNewShopCat(e.target.value)}>
                {SHOP_CATS.filter(c => c !== 'ALL').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button className="add-btn" onClick={addShopItem}>+ ADD</button>
            </div>
            <div className="shop-list">
              {filteredShopping.length === 0 && <div className="empty-state">NO ITEMS · ADD SOMETHING ABOVE</div>}
              {filteredShopping.map(item => (
                <div key={item.id} className={`shop-item${item.done ? ' checked' : ''}`}>
                  <div className={`shop-check${item.done ? ' done' : ''}`} onClick={() => toggleShop(item.id)} />
                  <span className="shop-text" style={item.done ? { textDecoration: 'line-through' } : {}}>{item.text}</span>
                  <span className="shop-cat-tag">{item.cat}</span>
                  <button className="shop-del" onClick={() => deleteShop(item.id)}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  )
}
