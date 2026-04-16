'use client'
import { useState, useRef, useEffect } from 'react'

const PASSWORD = 'deatherage2024'

const FAMILY_CONTEXT = `You are JARVIS, the intelligent family assistant for the Deatherage family in Lexington, Kentucky. You are helpful, warm, and efficient — like a trusted household AI. 

Family members: Kevin (Dad, works in logistics/freight), Mom, Lincoln, Camille, Cicily, and Carter.

You have access to family tools: a chores tracker for the kids, a shared shopping list, and a daily briefing system. When users ask about chores or shopping, remind them they can use the Chores and Shopping tabs.

Kevin is saving for his daughter's college at University of Kentucky. Keep responses concise and conversational. Address family members by name when you know who's asking.`

const FAMILY_PHOTO = '/family.png'

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
  .user-btn:hover,.user-btn.active{border-color:#0056b3;color:#fff;background:rgba(0,86,179,0.2);}

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
  .lock-photo{position:absolute;inset:0;background-image:url('https://i.postimg.cc/3NLC68RY/family-(1).jpg');background-size:contain;background-position:center top;background-repeat:no-repeat;background-color:#0a1428;}
  .lock-photo::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom, rgba(0,0,0,0.0) 0%, rgba(0,10,40,0.2) 35%, rgba(0,10,40,0.85) 65%, rgba(0,10,40,0.97) 100%);}
  .lock-card{position:relative;z-index:1;width:100%;max-width:360px;text-align:center;padding:0 24px;}
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
  .clear-checked-btn{background:none;border:1px solid rgba(255,80,80,0.2);color:rgba(255,80,80,0.5);font-family:'Inter',sans-serif;font-size:10px;padding:5px 12px;cursor:pointer;border-radius:6px;}
  .clear-checked-btn:hover{border-color:rgba(255,80,80,0.5);color:rgba(255,80,80,0.8);}

  /* ── CALENDAR ── */
  .calendar-panel{flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:12px;}
  .gcal-connect{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;flex:1;}
  .gcal-connect p{font-size:13px;color:rgba(255,255,255,0.4);text-align:center;max-width:260px;line-height:1.7;}
  .gcal-btn{background:linear-gradient(135deg,#0056b3,#003580);border:none;padding:13px 28px;color:white;font-family:'Inter',sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;cursor:pointer;border-radius:12px;box-shadow:0 4px 20px rgba(0,86,179,0.4);transition:all 0.2s;}
  .gcal-btn:hover{box-shadow:0 6px 28px rgba(0,86,179,0.6);}
  .gcal-disconnect{background:none;border:1px solid rgba(255,80,80,0.2);color:rgba(255,80,80,0.5);font-family:'Inter',sans-serif;font-size:10px;padding:4px 12px;cursor:pointer;border-radius:6px;}
  .gcal-disconnect:hover{border-color:rgba(255,80,80,0.5);color:rgba(255,80,80,0.8);}
  .cal-event{display:flex;gap:12px;padding:10px 14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);border-left:3px solid #0056b3;border-radius:0 10px 10px 0;margin-bottom:5px;}
  .cal-event-time{font-size:10px;color:rgba(255,255,255,0.4);white-space:nowrap;padding-top:2px;font-weight:600;}
  .cal-event-title{font-size:13px;color:rgba(255,255,255,0.85);flex:1;}
  .cal-day-header{font-size:11px;font-weight:700;color:rgba(255,255,255,0.5);letter-spacing:2px;text-transform:uppercase;margin:12px 0 6px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,0.07);}
  .cal-loading{font-size:12px;color:rgba(255,255,255,0.3);text-align:center;padding:20px;animation:blink 1s ease-in-out infinite;}
`

const GOOGLE_CLIENT_ID = '523937270224-lum8mrkbggm92pi15037v78r8ed0v4qo.apps.googleusercontent.com'
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.readonly'

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
  const [calEvents, setCalEvents] = useState([])
  const [calAuthed, setCalAuthed] = useState(false)
  const [calLoading, setCalLoading] = useState(false)
  const [tokenClient, setTokenClient] = useState(null)
  const [chores, setChores] = useState({})
  const [shopping, setShopping] = useState([])
  const [shopFilter, setShopFilter] = useState('ALL')
  const [newChore, setNewChore] = useState({})
  const [newShopItem, setNewShopItem] = useState('')
  const [newShopCat, setNewShopCat] = useState('OTHER')
  const bottomRef = useRef(null)
  const family = ['Dad', 'Mom', 'Lincoln', 'Camille', 'Cicily', 'Carter']

  // Load persisted data
  useEffect(() => {
    setChores(loadLS('jarvis_chores', DEFAULT_CHORES.Cicily ? 
      Object.fromEntries(KIDS.map(k => [k, (DEFAULT_CHORES[k] || []).map((t, i) => ({ id: i, text: t, done: false }))])) : {}
    ))
    setShopping(loadLS('jarvis_shopping', []))
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }, 1000)
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

  // Load Google Identity Services
  useEffect(() => {
    if (!authed) return
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        callback: (resp) => {
          if (resp.access_token) {
            saveLS('jarvis_cal_token', { token: resp.access_token, exp: Date.now() + 3500000 })
            fetchCalendarEvents(resp.access_token)
          }
        }
      })
      setTokenClient(client)
      // Auto-reconnect if we have a saved non-expired token
      const saved = loadLS('jarvis_cal_token', null)
      if (saved && saved.exp > Date.now()) {
        fetchCalendarEvents(saved.token)
      }
    }
    document.body.appendChild(script)
    return () => document.body.removeChild(script)
  }, [authed])

  async function fetchCalendarEvents(token) {
    setCalLoading(true)
    try {
      const now = new Date().toISOString()
      const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      // Fetch from all calendars
      const listRes = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const listData = await listRes.json()
      const calendarIds = (listData.items || []).map(c => c.id)
      if (calendarIds.length === 0) calendarIds.push('primary')

      let allEvents = []
      for (const calId of calendarIds) {
        const encoded = encodeURIComponent(calId)
        const res = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encoded}/events?timeMin=${now}&timeMax=${future}&singleEvents=true&orderBy=startTime&maxResults=50`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = await res.json()
        if (data.items) allEvents = allEvents.concat(data.items)
      }
      // Sort all events by start time
      allEvents.sort((a, b) => {
        const aTime = a.start?.dateTime || a.start?.date || ''
        const bTime = b.start?.dateTime || b.start?.date || ''
        return aTime.localeCompare(bTime)
      })
      setCalEvents(allEvents)
      setCalAuthed(true)
    } catch (e) {
      console.error('Calendar fetch error:', e)
    }
    setCalLoading(false)
  }

  function connectCalendar() {
    if (tokenClient) tokenClient.requestAccessToken({ prompt: '' })
  }

  function disconnectCalendar() {
    setCalAuthed(false)
    setCalEvents([])
    saveLS('jarvis_cal_token', null)
  }

  // Group events by day
  function groupEventsByDay(events) {
    const groups = {}
    events.forEach(ev => {
      const start = ev.start?.dateTime || ev.start?.date
      if (!start) return
      const day = start.split('T')[0]
      if (!groups[day]) groups[day] = []
      groups[day].push(ev)
    })
    return groups
  }

  function formatDay(dateStr) {
    const d = new Date(dateStr + 'T12:00:00')
    const today = new Date()
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
    if (dateStr === today.toISOString().split('T')[0]) return 'TODAY'
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'TOMORROW'
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()
  }

  function formatEventTime(ev) {
    if (ev.start?.date && !ev.start?.dateTime) return 'ALL DAY'
    const d = new Date(ev.start.dateTime)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  function saveShopping(updated) { setShopping(updated); saveLS('jarvis_shopping', updated) }

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
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input, name: user }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, user, context: FAMILY_CONTEXT })
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'assistant', content: data.reply, name: 'JARVIS' }])
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'System error. Please try again.', name: 'JARVIS' }])
    }
    setLoading(false)
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
              {/* Date */}
              <div className="dash-card">
                <div className="dash-card-label">DATE</div>
                <div className="dash-date">{today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}</div>
                <div className="dash-sub">{today.getFullYear()} · LEXINGTON KY</div>
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

            {/* Chore Summary */}
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

            {/* Shopping Summary */}
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

            {/* Today's Events + Upcoming Events */}
            {calAuthed && (() => {
              const todayStr = new Date().toISOString().split('T')[0]
              const todayEvents = calEvents.filter(ev => {
                const start = ev.start?.dateTime || ev.start?.date || ''
                return start.startsWith(todayStr)
              })
              const upcomingEvents = calEvents.filter(ev => {
                const start = ev.start?.dateTime || ev.start?.date || ''
                return !start.startsWith(todayStr)
              })
              return (
                <>
                  <div className="dash-card">
                    <div className="dash-card-label">TODAY&apos;S EVENTS</div>
                    {todayEvents.length === 0
                      ? <div style={{ fontSize: 10, color: 'rgba(0,180,255,0.3)', letterSpacing: 2 }}>NOTHING SCHEDULED TODAY</div>
                      : <div className="briefing-list">
                          {todayEvents.map(ev => (
                            <div key={ev.id} className="briefing-item">
                              {ev.summary} <span style={{ color: 'rgba(0,180,255,0.3)' }}>· {formatEventTime(ev)}</span>
                            </div>
                          ))}
                        </div>
                    }
                  </div>
                  {upcomingEvents.length > 0 && (
                    <div className="dash-card">
                      <div className="dash-card-label">UPCOMING EVENTS</div>
                      <div className="briefing-list">
                        {upcomingEvents.slice(0, 5).map(ev => (
                          <div key={ev.id} className="briefing-item">
                            {ev.summary} <span style={{ color: 'rgba(0,180,255,0.3)' }}>· {formatDay(ev.start?.dateTime?.split('T')[0] || ev.start?.date)} · {formatEventTime(ev)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )
            })()}
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
                    <div className="msg-bubble">{m.content}</div>
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
              <div className="input-row">
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
              <div className="section-title">Calendar</div>
              {calAuthed && <button className="gcal-disconnect" onClick={disconnectCalendar}>Disconnect</button>}
            </div>
            {!calAuthed && !calLoading && (
              <div className="gcal-connect">
                <div style={{ fontSize: 32 }}>📅</div>
                <p>CONNECT YOUR GOOGLE CALENDAR TO VIEW UPCOMING EVENTS</p>
                <button className="gcal-btn" onClick={connectCalendar}>CONNECT CALENDAR</button>
              </div>
            )}
            {calLoading && <div className="cal-loading">SYNCING CALENDAR DATA...</div>}
            {calAuthed && !calLoading && (
              <>
                {calEvents.length === 0 && <div className="empty-state">NO UPCOMING EVENTS IN THE NEXT 14 DAYS</div>}
                {Object.entries(groupEventsByDay(calEvents)).map(([day, events]) => (
                  <div key={day}>
                    <div className="cal-day-header">{formatDay(day)}</div>
                    {events.map(ev => (
                      <div key={ev.id} className="cal-event">
                        <div className="cal-event-time">{formatEventTime(ev)}</div>
                        <div className="cal-event-title">{ev.summary}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}
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
