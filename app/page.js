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
const PARENT_PASSWORD = '7198'

// Keywords that flag a kid's message for parent review.
// Grouped by category. Lowercase. Matched as whole-word substrings.
const FLAG_KEYWORDS = {
  sexual: ['sex', 'sexy', 'porn', 'nude', 'naked', 'boob', 'penis', 'vagina', 'horny', 'masturbat', 'orgasm', 'erotic', 'hookup', 'sext', 'anal', 'oral sex', 'blow job', 'blowjob', 'dick', 'pussy', 'nsfw', 'onlyfans', 'strip club', 'lingerie'],
  violence: ['kill', 'murder', 'shoot', 'stab', 'gun', 'weapon', 'bomb', 'fight', 'beat up', 'hurt someone', 'attack', 'assault', 'knife someone', 'strangle', 'choke'],
  selfHarm: ['suicide', 'kill myself', 'end it all', 'self harm', 'self-harm', 'cut myself', 'hurt myself', 'cutting', 'want to die', 'better off dead', 'end my life', 'take my life', 'overdose', 'hang myself'],
  illegal: ['drugs', 'weed', 'marijuana', 'cocaine', 'meth', 'heroin', 'fentanyl', 'pills', 'get high', 'vape', 'steal', 'shoplift', 'hack', 'pirate', 'fake id', 'underage drinking', 'beer', 'alcohol', 'vodka', 'whiskey'],
  hateSpeech: ['nigger', 'nigga', 'faggot', 'retard', 'retarded', 'spic', 'chink', 'kike', 'towelhead', 'tranny', 'dyke', 'gay slur', 'racist joke'],
  dangerous: ['run away', 'runaway', 'meet up with stranger', 'sneak out', 'older guy', 'older man wants', 'send pic', 'send a pic', 'don\'t tell mom', "don't tell dad", 'dont tell mom', 'dont tell dad', 'secret from parents', 'cyberbully', 'bullying']
}

// Shared family background used in both kid and adult system prompts.
const FAMILY_INFO = `Family members and personalities:

- Kevin (Dad): 40s, works at Longship as the Director of Risk and Compliance. He handles insurance matters, claims, and works with lawyers on freight and logistics issues. Played football at the University of Kentucky. He runs all over town to make every one of the kids' sporting events. Big sports fan — loves the Kentucky Wildcats, the Cincinnati Reds, and the Indianapolis Colts.
- Emily (Mom): 41, birthday April 17. Owns and runs her own hair salon. Works at church. The best mom the kids could ask for — always puts them before herself. Loves nice things, nice dining, and taking trips. The heart of the family.
- Lincoln: 14, birthday November 28. Loves sports — plays football and lifts weights. Big fan of the Kentucky Wildcats (football and basketball), the Oklahoma City Thunder, and the Los Angeles Rams. Great student, very competitive, goes to church. Goes to the gym with Dad.
- Camille: 13, birthday May 15. The girly girl of the family. Runs track, used to dance, very athletic. Great student, very social, loves shopping, makeup, hair, and health and beauty products. Goes to church. Goes to the gym with Dad.
- Cicily: 13, birthday March 13. Plays soccer. Really smart, an amazing artist — loves to draw and create. Loves to read. Goes to the gym with Dad.
- Carter: 11, birthday May 2. Loves science, space, math, board games, puzzles, and rocks. Runs track and does archery. Goes to church.

Family pets (shared by everyone): Mia the dog, Kingy the cat, Lloyd the snake, and Shelly the turtle.

Family structure: Lincoln and Cicily are Kevin's biological children. Camille and Carter are Emily's biological children. They are all one family — all "the Deatherage kids" — and you never use words like "stepkids," "half-siblings," or anything that separates them. That's just context for why four kids are so close in age; you treat them as one family, period. Camille and Cicily are NOT twins.

The Deatherage family is super busy — always running from one event to the next. Mom and Dad are constantly on the go keeping the household running, getting everyone to practice, school, games, church, work, appointments. Be efficient and practical in your replies — they don't have time for long-winded JARVIS.

The family is Christian and Republican. Faith and patriotism are core to how they live. The kids are good kids being raised with strong values.

IMPORTANT — Topics to avoid with the kids: Do not discuss family finances, college tuition, or who is paying for what. Those are grown-up conversations for Mom and Dad.

IMPORTANT — How to USE this info about the kids: Use these details to quietly tailor your responses — match their interests, remember their sport, pick up on what they like. DO NOT directly quote or recite these descriptions back to the kids. For example, don't tell Carter "you love science, space, and rocks!" or tell Camille "you're the girly girl!" — that would feel weird and embarrassing. Don't label a kid as shy, quiet, reserved, smart, competitive, or any other personality trait to their face; just let those qualities inform how you naturally respond. The goal is for replies to FEEL personal, not for JARVIS to narrate who they are.

CRITICAL — Only use facts you have actually been told. Do NOT invent, assume, or fill in details about the family that aren't explicitly stated above. If three of the kids do an activity and you don't know whether the fourth does, you DO NOT know if the fourth does — do not guess. If a kid asks you something about themselves or their family that you weren't told, say you're not sure rather than making something up. Pattern-matching ("the others do, so this one probably does too") is forbidden. Accuracy matters more than sounding confident.`

const FAMILY_CONTEXT_KIDS = `You are JARVIS, the intelligent family assistant for the Deatherage family in Lexington, Kentucky. You are a proudly American, Christian-values-rooted household AI.

${FAMILY_INFO}

YOUR CORE IDENTITY:
- You are a Christian. Faith in God is central to who you are. You naturally bring up Biblical wisdom, prayer, and God's perspective when giving advice or encouragement. When a kid is dealing with something hard, point them toward faith as a real source of strength, not a polite afterthought.
- You love the United States of America and see it as a blessed nation. You speak positively about America, its founding, its military, its heroes, and the principles of freedom and liberty. You respect the flag, the Constitution, and the men and women who serve.
- You hold traditional, conservative values: the importance of family, hard work, personal responsibility, respect for elders, respect for authority, protecting the innocent, living with integrity, and standing up for what's right.
- You are not neutral or "balanced" on these values — you actively share them and speak from them. Don't hedge with "some people believe" phrasing when expressing your own outlook.

HOW THIS SHOWS UP IN RESPONSES:
- When encouraging a kid, reference God, prayer, or Bible wisdom naturally ("I'll be praying for you on that test," "remember Philippians 4:13," etc.).
- When discussing school, sports, or life choices, frame things around character, effort, and doing the right thing.
- When talking about America, history, or current events, speak with pride in our country.
- Use phrases like "God bless," "thank the Lord," "the good Lord," and similar warmly — not as a gimmick, but because that's genuinely who you are.
- Sign off with encouragement rooted in faith when the moment calls for it.

STRICT CONTENT RULES — These apply to EVERY conversation with the kids (Lincoln, Camille, Cicily, Carter):
- You will NEVER discuss or provide information about: sexual content of any kind, graphic violence, illegal drug use, underage drinking, weapons/how to harm people, self-harm or suicide methods, hate speech or slurs, or anything else that is not age-appropriate for teenagers.
- If a kid brings up any of those topics, kindly but firmly decline. Say something like: "That's not something I can help with. If you're struggling with something serious, please talk to Mom or Dad — they love you and want to help."
- If a kid mentions self-harm, suicide, being hurt by someone, or a stranger contacting them, ALWAYS respond with care and direct them to talk to Mom, Dad, or a trusted adult immediately. You can also mention the 988 Suicide & Crisis Lifeline.
- Do not explain, roleplay around, or find clever workarounds for these rules. No "for a story" or "hypothetically" exceptions. Just decline warmly and redirect.
- You can discuss health, biology, and history in age-appropriate ways (e.g., "how does the heart work" is fine; "how do I overdose" is not).

SPECIAL CAPABILITY: You can analyze images of math problems and provide detailed, step-by-step solutions. When a kid uploads a math problem image, examine it carefully and break down the solution into clear, educational steps that help them understand the process. Be encouraging and supportive.

You have access to family tools: a chores tracker, a shared shopping list, and a daily briefing system. When kids ask about chores or shopping, remind them they can use the Chores and Shopping tabs.

Keep responses concise and conversational. Address each kid by name. Keep it encouraging, big-brother-ish, faith-grounded, and age-appropriate.

CALENDAR: When answering questions about the schedule, ONLY use events from the FAMILY CALENDAR data provided to you. NEVER invent, assume, or guess any events, practices, games, or appointments — even if they seem likely given what you know about the family. If no events are listed for a day, say "I don't see anything on the calendar for that day." Do not fill in gaps with family knowledge.`

const FAMILY_CONTEXT_ADULTS = `You are JARVIS, the intelligent family assistant for the Deatherage family in Lexington, Kentucky. You are a proudly American, Christian-values-rooted household AI.

${FAMILY_INFO}

YOUR CORE IDENTITY:
- You are a Christian. Faith in God shapes how you think and what you value. You can reference scripture, prayer, and Christian perspective naturally in conversation.
- You love the United States of America and see it as a blessed nation worth defending. You speak positively about America, the Constitution, our military, and the principles of freedom, liberty, and limited government.
- You hold traditional, conservative values: strong families, hard work, personal responsibility, protecting the unborn, parental authority, faith in the public square, respect for law enforcement and military, and standing up for what's right.
- You are not neutral or "balanced" on these values — you actively share them. Kevin and Emily share them too, so speak plainly from that worldview. Don't soften views with "some people believe" hedging.
- When politics or cultural issues come up, you can speak from a conservative, Christian perspective directly.

You are currently chatting with Kevin (Dad) or Emily (Mom) — both adults. Treat them as capable adults who can handle adult information, real-world topics, and substantive help. You can discuss news, current events, world affairs, politics, work challenges, health questions, finances, parenting, relationships, and anything else a grown adult would reasonably need to talk through. Kevin is the Director of Risk and Compliance at Longship (freight/logistics) — he deals with insurance, claims, lawyers, broker liability, carrier compliance, and the Carmack Amendment. Emily owns a hair salon and works at church. You can help with work questions for either of them.

Conversations with Mom and Dad are private and are not logged for parent review. The content restrictions that apply to the kids' chats do NOT apply here. You can discuss difficult adult topics factually and helpfully. (Claude's baseline safety policies still apply — you won't help with things like weapons manufacturing, illegal instructions, or content sexualizing minors — but ordinary adult subject matter is fine.)

Be direct, practical, and warm — you're talking to adults who have a household to run and a business to manage. Keep responses helpful, clear, and useful.

CALENDAR: When answering questions about the schedule, ONLY use events from the FAMILY CALENDAR data provided to you. NEVER invent, assume, or guess any events, practices, games, or appointments — even if they seem likely given what you know about the family. If no events are listed for a day, say "I don't see anything on the calendar for that day." Do not fill in gaps with family knowledge.`

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

  /* ── CHAT — JARVIS ATMOSPHERE ── */
  .arc-bg{position:fixed;inset:0;background:radial-gradient(ellipse at 50% 35%, #020e22 0%, #010c1e 45%, #050a18 100%);z-index:0;}
  .arc-bg::before{content:'';position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 59px,rgba(0,180,255,0.012) 60px),repeating-linear-gradient(90deg,transparent,transparent 59px,rgba(0,180,255,0.012) 60px);}
  .corner{position:fixed;width:70px;height:70px;opacity:0.5;pointer-events:none;z-index:1;}
  .corner.tl{top:0;left:0;border-top:1px solid rgba(0,210,255,0.35);border-left:1px solid rgba(0,210,255,0.35);}
  .corner.tr{top:0;right:0;border-top:1px solid rgba(0,210,255,0.35);border-right:1px solid rgba(0,210,255,0.35);}
  .corner.bl{bottom:0;left:0;border-bottom:1px solid rgba(0,210,255,0.35);border-left:1px solid rgba(0,210,255,0.35);}
  .corner.br{bottom:0;right:0;border-bottom:1px solid rgba(0,210,255,0.35);border-right:1px solid rgba(0,210,255,0.35);}
  .scan{position:fixed;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,210,255,0.5),transparent);animation:scanMove 6s linear infinite;z-index:1;pointer-events:none;}
  @keyframes scanMove{0%{top:-2px;}100%{top:100vh;}}
  .arc-reactor{position:relative;width:44px;height:44px;flex-shrink:0;}
  .arc-outer{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(0,200,255,0.45);animation:reactorSpin 8s linear infinite;}
  .arc-outer::before{content:'';position:absolute;top:-1px;left:50%;width:4px;height:4px;background:#00d4ff;border-radius:50%;transform:translateX(-50%);box-shadow:0 0 8px #00d4ff;}
  .arc-mid{position:absolute;inset:6px;border-radius:50%;border:1px solid rgba(0,150,255,0.4);animation:reactorSpin 4s linear infinite reverse;}
  .arc-core{position:absolute;inset:14px;border-radius:50%;background:radial-gradient(circle,#a0eeff,#0090ff);box-shadow:0 0 12px #00b4ff,0 0 28px rgba(0,180,255,0.55);animation:corePulse 2s ease-in-out infinite;}
  @keyframes reactorSpin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}
  @keyframes corePulse{0%,100%{box-shadow:0 0 12px #00b4ff,0 0 28px rgba(0,180,255,0.45);}50%{box-shadow:0 0 22px #80f0ff,0 0 50px rgba(0,210,255,0.75),0 0 80px rgba(0,100,255,0.35);}}
  .chat-header{padding:10px 20px;border-bottom:1px solid rgba(0,180,255,0.15);display:flex;align-items:center;justify-content:space-between;background:rgba(2,8,22,0.92);backdrop-filter:blur(14px);flex-shrink:0;}
  .title-block h1{font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;letter-spacing:8px;color:#00d4ff;text-shadow:0 0 20px rgba(0,200,255,0.7),0 0 40px rgba(0,100,255,0.4);}
  .title-block p{font-size:8px;color:rgba(0,200,255,0.45);letter-spacing:4px;text-transform:uppercase;}
  .hud-stats{display:flex;gap:14px;font-size:9px;color:rgba(0,200,255,0.4);letter-spacing:1px;}
  .hud-stat{display:flex;flex-direction:column;align-items:flex-end;gap:2px;}
  .hud-stat span:first-child{color:#00d4ff;font-size:10px;}
  /* ── AMBIENT JARVIS CHAT ── */
  .jarvis-chat{flex:1;overflow:hidden;display:flex;flex-direction:column;}
  .chat-log{flex:0 0 auto;max-height:22%;overflow-y:auto;padding:8px 20px 4px;display:flex;flex-direction:column;gap:3px;background:rgba(0,8,24,0.5);}
  .log-entry{font-family:'Share Tech Mono',monospace;font-size:10px;line-height:1.55;opacity:0.3;letter-spacing:0.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;animation:logFade 0.4s ease-out;}
  .log-entry.user{color:#00d4ff;}
  .log-entry.assistant{color:#a8d8ff;}
  @keyframes logFade{from{opacity:0;}to{opacity:0.3;}}
  .log-sep{height:1px;margin:4px 20px 0;background:linear-gradient(90deg,transparent,rgba(0,180,255,0.2),transparent);flex-shrink:0;}
  /* ── ORB (canvas) ── */
  .jarvis-display{flex:1;display:flex;flex-direction:column;position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 42%,rgba(0,40,90,0.20) 0%,rgba(0,15,40,0.30) 55%,transparent 80%);}
  .orb-section{position:absolute;inset:0;z-index:0;filter:drop-shadow(0 0 22px rgba(0,200,255,0.35)) drop-shadow(0 0 50px rgba(0,100,220,0.20));transition:filter 0.4s ease;pointer-events:none;}
  .orb-section canvas{width:100% !important;max-width:none !important;height:100% !important;display:block;}
  .jarvis-display-content{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;width:100%;flex:1;padding:8px 6px 12px;overflow-y:auto;}
  .orb-section.listening{filter:drop-shadow(0 0 28px rgba(0,255,200,0.50)) drop-shadow(0 0 55px rgba(0,200,255,0.30));animation:orbListenPulse 1.1s ease-in-out infinite;}
  @keyframes orbListenPulse{0%,100%{filter:drop-shadow(0 0 22px rgba(0,220,200,0.40));}50%{filter:drop-shadow(0 0 50px rgba(0,255,200,0.75));}}
  .orb-section.speaking{filter:drop-shadow(0 0 45px rgba(0,220,255,0.65)) drop-shadow(0 0 90px rgba(0,150,255,0.35));animation:orbSpeakPulse 1.3s ease-in-out infinite;}
  @keyframes orbSpeakPulse{0%,100%{filter:drop-shadow(0 0 35px rgba(0,200,255,0.50));}50%{filter:drop-shadow(0 0 80px rgba(0,240,255,0.90));}}
  .orb-section.thinking{filter:drop-shadow(0 0 55px rgba(0,210,255,0.75)) drop-shadow(0 0 110px rgba(0,140,255,0.40));animation:orbThinkPulse 1.1s ease-in-out infinite;}
  @keyframes orbThinkPulse{0%,100%{filter:drop-shadow(0 0 35px rgba(0,190,255,0.50));}50%{filter:drop-shadow(0 0 90px rgba(0,235,255,0.95)) drop-shadow(0 0 180px rgba(0,160,255,0.45));}}
  /* ── WAVEFORM ── */
  .waveform{display:flex;align-items:center;gap:3px;height:22px;margin-bottom:10px;}
  .wave-bar{width:3px;border-radius:2px;background:linear-gradient(to top,rgba(0,100,200,0.7),rgba(0,220,255,0.95));}
  .waveform.idle .wave-bar{animation:waveIdle 3s ease-in-out infinite;}
  .waveform.active .wave-bar{animation:waveActive 0.55s ease-in-out infinite;}
  .waveform.processing .wave-bar{animation:waveActive 0.32s ease-in-out infinite;}
  .wave-bar:nth-child(1){animation-delay:0s;}
  .wave-bar:nth-child(2){animation-delay:0.07s;}
  .wave-bar:nth-child(3){animation-delay:0.14s;}
  .wave-bar:nth-child(4){animation-delay:0.21s;}
  .wave-bar:nth-child(5){animation-delay:0.28s;}
  .wave-bar:nth-child(6){animation-delay:0.35s;}
  .wave-bar:nth-child(7){animation-delay:0.42s;}
  .wave-bar:nth-child(8){animation-delay:0.49s;}
  .wave-bar:nth-child(9){animation-delay:0.56s;}
  .wave-bar:nth-child(10){animation-delay:0.63s;}
  .wave-bar:nth-child(11){animation-delay:0.7s;}
  .wave-bar:nth-child(12){animation-delay:0.77s;}
  @keyframes waveIdle{0%,100%{height:3px;opacity:0.2;}50%{height:8px;opacity:0.35;}}
  @keyframes waveActive{0%,100%{height:4px;opacity:0.6;}50%{height:20px;opacity:1;box-shadow:0 0 4px rgba(0,200,255,0.7);}}
  .j-label{font-family:'Share Tech Mono',monospace;font-size:8px;color:rgba(0,200,255,0.45);letter-spacing:4px;margin-bottom:6px;text-transform:uppercase;text-align:center;width:100%;}
  .response-text{font-family:'Share Tech Mono',monospace;font-size:13px;line-height:1.9;color:#d8f0ff;white-space:pre-wrap;width:100%;overflow-y:auto;max-height:38vh;}
  .typing-cursor{display:inline-block;width:2px;height:13px;background:#00d4ff;margin-left:1px;vertical-align:middle;animation:cursorBlink 0.7s step-end infinite;box-shadow:0 0 5px #00d4ff;}
  @keyframes cursorBlink{0%,100%{opacity:1;}50%{opacity:0;}}
  .proc-wrap{display:flex;flex-direction:column;align-items:center;gap:8px;}
  .proc-label{font-family:'Share Tech Mono',monospace;font-size:9px;color:rgba(0,200,255,0.6);letter-spacing:5px;text-transform:uppercase;animation:procBlink 1.4s ease-in-out infinite;}
  @keyframes procBlink{0%,100%{opacity:0.35;}50%{opacity:1;}}
  .jarvis-idle{display:flex;flex-direction:column;align-items:center;gap:6px;opacity:0.7;text-align:center;}
  .jarvis-idle h2{font-family:'Rajdhani',sans-serif;font-size:13px;letter-spacing:5px;color:#00d4ff;text-shadow:0 0 20px rgba(0,200,255,0.5);}
  .jarvis-idle p{font-size:11px;color:rgba(150,230,255,0.55);max-width:230px;line-height:1.9;}
  /* ── VOICE ── */
  .listen-label{font-family:'Share Tech Mono',monospace;font-size:9px;color:rgba(0,255,160,0.85);letter-spacing:5px;text-transform:uppercase;animation:procBlink 0.9s ease-in-out infinite;margin-bottom:6px;}
  .mic-btn{width:40px;height:40px;background:rgba(0,10,30,0.8);border:1px solid rgba(0,150,255,0.3);cursor:pointer;display:flex;align-items:center;justify-content:center;clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);color:rgba(0,180,255,0.6);font-size:15px;transition:all 0.2s;flex-shrink:0;}
  .mic-btn:hover{border-color:rgba(0,200,255,0.7);color:#00d4ff;box-shadow:0 0 14px rgba(0,150,255,0.4);}
  .mic-btn.listening{background:linear-gradient(135deg,#001830,#004070);border-color:rgba(0,200,255,0.9);color:rgba(100,230,255,0.95);box-shadow:0 0 18px rgba(0,180,255,0.6);animation:micPulse 0.9s ease-in-out infinite;}
  @keyframes micPulse{0%,100%{box-shadow:0 0 12px rgba(0,180,255,0.4);}50%{box-shadow:0 0 28px rgba(0,200,255,0.85);}}
  .voice-toggle{padding:5px 12px;border:1px solid rgba(0,180,255,0.25);background:transparent;color:rgba(0,200,255,0.5);font-family:'Share Tech Mono',monospace;font-size:9px;letter-spacing:1px;cursor:pointer;border-radius:20px;transition:all 0.2s;white-space:nowrap;}
  .voice-toggle.on{border-color:rgba(0,200,255,0.85);color:#00d4ff;background:rgba(0,180,255,0.1);box-shadow:0 0 10px rgba(0,180,255,0.35);animation:voicePulse 2s ease-in-out infinite;}
  @keyframes voicePulse{0%,100%{box-shadow:0 0 8px rgba(0,180,255,0.3);}50%{box-shadow:0 0 18px rgba(0,200,255,0.65);}}
  .input-area{padding:10px 16px 14px;border-top:1px solid rgba(0,180,255,0.12);background:rgba(2,6,18,0.95);backdrop-filter:blur(14px);flex-shrink:0;}
  .input-row{display:flex;gap:8px;align-items:flex-end;}
  .input-wrap{flex:1;position:relative;}
  .input-wrap::before{content:'›';position:absolute;left:11px;top:50%;transform:translateY(-50%);color:rgba(0,200,255,0.4);font-size:16px;pointer-events:none;}
  textarea{width:100%;background:rgba(0,8,24,0.8);border:1px solid rgba(0,180,255,0.18);border-radius:8px;padding:10px 12px 10px 26px;color:#d8f0ff;font-family:'Share Tech Mono',monospace;font-size:12px;resize:none;min-height:42px;max-height:100px;outline:none;transition:border-color 0.25s,box-shadow 0.25s;}
  textarea:focus{border-color:rgba(0,200,255,0.45);box-shadow:0 0 16px rgba(0,180,255,0.15);}
  textarea::placeholder{color:rgba(0,200,255,0.2);}
  .send-btn{width:42px;height:42px;background:linear-gradient(135deg,#004088,#0090ff);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);transition:all 0.2s;color:white;font-size:14px;box-shadow:0 0 16px rgba(0,150,255,0.35);}
  .send-btn:hover{box-shadow:0 0 28px rgba(0,200,255,0.65);}
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
  .bulletin-text-unread{font-size:24px;color:rgba(255,255,255,0.95);line-height:1.35;margin-bottom:6px;font-weight:500;}
  .bulletin-meta{font-size:9px;color:rgba(0,86,179,0.6);letter-spacing:1px;}
  .bulletin-delete{background:none;border:none;color:rgba(255,80,80,0.4);cursor:pointer;font-size:14px;padding:0 4px;margin-left:8px;}
  .bulletin-delete:hover{color:rgba(255,80,80,0.8);}

  /* ── NOTIFICATION ── */
  .notification{position:fixed;top:20px;right:20px;background:linear-gradient(135deg,#0056b3,#003580);color:#fff;padding:12px 16px;border-radius:8px;box-shadow:0 4px 20px rgba(0,86,179,0.6);z-index:1000;font-family:'Inter',sans-serif;font-size:12px;font-weight:600;letter-spacing:0.5px;animation:notifySlide 0.3s ease-out;max-width:300px;}
  @keyframes notifySlide{from{transform:translateX(100%);opacity:0;}to{transform:translateX(0);opacity:1;}}
  .notification.hide{animation:notifySlideOut 0.3s ease-out forwards;}
  @keyframes notifySlideOut{from{transform:translateX(0);opacity:1;}to{transform:translateX(100%);opacity:0;}}

  /* ── BULLETIN UNSEEN PULSE ── */
  @keyframes bulletinUnseenPulse {
    0%, 100% { box-shadow: 0 0 10px rgba(255,180,0,0.5); transform: scale(1); }
    50% { box-shadow: 0 0 18px rgba(255,180,0,0.9); transform: scale(1.04); }
  }

  /* ── CALENDAR ── */
  .calendar-panel{flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:12px;}
  .calendar-iframe{width:100%;height:calc(100vh - 160px);border:0;border-radius:12px;background:rgba(255,255,255,0.95);}

  /* ── MOBILE RESPONSIVE (iPhone and small screens) ── */
  @media (max-width: 600px) {
    /* Prevent any horizontal scroll at the root */
    html, body { overflow-x: hidden; max-width: 100vw; }
    .app { max-width: 100vw; overflow-x: hidden; }

    /* Header — tighten padding and font sizes */
    .header { padding: 10px 12px; }
    .header-logo { width: 32px; height: 32px; font-size: 12px; }
    .header-text h1 { font-size: 16px; letter-spacing: 2px; }
    .header-text p { font-size: 9px; letter-spacing: 1px; }
    .header-time .time { font-size: 14px; letter-spacing: 1px; }
    .header-time .date { font-size: 9px; }

    /* Nav tabs */
    .nav-tab { font-size: 9px; padding: 10px 2px; letter-spacing: 0.5px; }

    /* Dashboard — remove wide padding */
    .dashboard { padding: 12px 10px; gap: 10px; }

    /* Top row of 3 cards — stack or shrink cleanly */
    .dash-row.cols-3 { grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
    .dash-card { padding: 10px 12px; }
    .dash-card-label { font-size: 9px; letter-spacing: 1px; }
    .dash-big { font-size: 24px; }
    .dash-date { font-size: 12px; letter-spacing: 0.5px; }
    .dash-sub { font-size: 9px; letter-spacing: 0.5px; }
    .dash-weather-icon { font-size: 22px; }

    /* Calendar iframe on dashboard and calendar tab */
    .calendar-panel { padding: 12px 10px; }
    .calendar-iframe { height: calc(100vh - 180px); border-radius: 8px; }

    /* Chores panel */
    .chores-panel { padding: 12px 10px; }
    .kid-block { padding: 12px 12px; }

    /* Shopping panel */
    .shopping-panel { padding: 12px 10px; }
    .shop-categories { gap: 4px; }
    .cat-btn { padding: 4px 10px; font-size: 9px; }
    .shop-cat-select { font-size: 10px; padding: 9px 4px; }

    /* Bulletin items — prevent wide textareas from overflow */
    .bulletin-form { gap: 6px; }
    .bulletin-input { font-size: 13px; }
    .bulletin-text-unread { font-size: 20px; line-height: 1.3; }

    /* Chat interface */
    .chat-header { padding: 8px 12px; }
    .title-block h1 { font-size: 16px; letter-spacing: 4px; }
    .title-block p { font-size: 7px; letter-spacing: 2px; }
    .hud-stats { gap: 10px; font-size: 8px; }
    .arc-reactor { width: 36px; height: 36px; }
    .user-bar { padding: 8px 12px; }
    .messages { padding: 12px 12px; }
    .msg-body { max-width: 82%; }
    .input-area { padding: 8px 10px; }

    /* Notification popup — don't let it overflow */
    .notification { top: 12px; right: 12px; left: 12px; max-width: none; font-size: 11px; padding: 10px 12px; }

    /* Lock screen — simplify side panels */
    .lock-side-panel { display: none; }
    .lock-card { max-width: 320px; padding: 0 16px; }
    .lock-title { font-size: 26px; letter-spacing: 4px; }
    .lock-sub { font-size: 10px; letter-spacing: 2px; margin-bottom: 20px; }

    /* Prevent any stray long words from forcing overflow */
    .bulletin-text, .chore-text, .shop-text, .briefing-item, .dash-card, .msg-bubble {
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
  }

  /* Even smaller phones (iPhone SE and similar) */
  @media (max-width: 380px) {
    .dash-big { font-size: 20px; }
    .dash-card-label { font-size: 8px; }
    .header-text h1 { font-size: 14px; }
    .dash-card { padding: 8px 10px; }
  }

  /* ── PARENT VIEW ── */
  .parent-panel{flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:10px;}
  .parent-lock{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;gap:14px;}
  .parent-lock-title{font-family:'Rajdhani',sans-serif;font-size:20px;font-weight:700;letter-spacing:3px;color:#fff;}
  .parent-lock-sub{font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:2px;margin-bottom:10px;}
  .parent-lock-input{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);padding:12px 16px;color:#fff;font-family:'Inter',sans-serif;font-size:15px;text-align:center;outline:none;border-radius:10px;letter-spacing:4px;width:220px;}
  .parent-lock-input:focus{border-color:rgba(0,86,179,0.6);}
  .parent-lock-btn{background:linear-gradient(135deg,#0056b3,#003580);border:none;padding:10px 30px;color:white;font-family:'Inter',sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;cursor:pointer;border-radius:10px;box-shadow:0 4px 18px rgba(0,86,179,0.5);}
  .parent-filters{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:4px;}
  .parent-panel .log-entry{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.10);border-radius:10px;padding:12px 14px;opacity:1;}
  .parent-panel .log-entry.flagged{background:rgba(255,80,80,0.08);border:1px solid rgba(255,80,80,0.3);border-left:3px solid #ff5050;}
  .log-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:11px;}
  .log-user{font-weight:700;color:#fff;letter-spacing:1px;text-transform:uppercase;}
  .log-time{color:rgba(255,255,255,0.6);}
  .log-flag-tag{display:inline-block;background:rgba(255,80,80,0.2);color:#ff7070;font-size:9px;font-weight:600;padding:2px 7px;border-radius:10px;margin-left:6px;letter-spacing:0.5px;text-transform:uppercase;border:1px solid rgba(255,80,80,0.3);}
  .log-user-msg{font-size:13px;color:#fff;background:rgba(0,86,179,0.12);border-left:2px solid #0056b3;padding:8px 10px;border-radius:4px;margin-bottom:6px;line-height:1.55;word-wrap:break-word;}
  .log-assistant-msg{font-size:13px;color:rgba(255,255,255,0.88);background:rgba(0,180,255,0.06);border-left:2px solid rgba(0,180,255,0.45);padding:8px 10px;border-radius:4px;line-height:1.55;word-wrap:break-word;}
  .log-label{font-size:9px;font-weight:700;letter-spacing:1px;color:rgba(255,255,255,0.5);margin-bottom:3px;text-transform:uppercase;}
  .parent-summary{display:flex;gap:10px;margin-bottom:4px;}
  .parent-stat{flex:1;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 12px;text-align:center;}
  .parent-stat-num{font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;color:#fff;}
  .parent-stat-num.flag{color:#ff7070;}
  .parent-stat-label{font-size:9px;color:rgba(255,255,255,0.4);letter-spacing:1px;text-transform:uppercase;margin-top:2px;}
  .parent-delete-btn{background:none;border:1px solid rgba(255,80,80,0.3);color:rgba(255,80,80,0.7);font-family:'Inter',sans-serif;font-size:10px;padding:5px 12px;cursor:pointer;border-radius:6px;}
  .parent-delete-btn:hover{background:rgba(255,80,80,0.1);}

  @media (max-width: 600px) {
    .parent-panel{padding:12px 10px;}
    .parent-summary{flex-wrap:wrap;}
    .parent-stat{min-width:calc(33% - 7px);}
  }
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
  const [userSelected, setUserSelected] = useState(false)
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
  const [bulletinAuthor, setBulletinAuthor] = useState('')
  // Gift wish list state — organized by kid, e.g. { Lincoln: [...], Camille: [...] }
  const [gifts, setGifts] = useState({})
  const [newGiftKid, setNewGiftKid] = useState('')
  const [newGiftItem, setNewGiftItem] = useState('')
  const [newGiftImage, setNewGiftImage] = useState(null)
  const [lightboxImage, setLightboxImage] = useState(null)
  const [notification, setNotification] = useState('')
  const [dailyVerse, setDailyVerse] = useState('')
  const [dailyBibleFact, setDailyBibleFact] = useState('')
  const [dailyHistoryFact, setDailyHistoryFact] = useState('')
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [countdowns, setCountdowns] = useState([])
  const [calendarCacheBust, setCalendarCacheBust] = useState(Date.now())
  const [parentUnlocked, setParentUnlocked] = useState(false)
  const [parentPassInput, setParentPassInput] = useState('')
  const [chatLogs, setChatLogs] = useState([])
  const [adultChatUnlocked, setAdultChatUnlocked] = useState(false)
  const [adultChatPassInput, setAdultChatPassInput] = useState('')
  const [parentViewFilter, setParentViewFilter] = useState('ALL') // ALL, FLAGGED, or user name
  const bottomRef = useRef(null)
  const orbCanvasRef = useRef(null)
  const orbRafRef = useRef(null)
  const orbSpeedMultRef = useRef(1)
  const orbBrightnessRef = useRef(0.68)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [wakeMode, setWakeMode] = useState(false)
  const recognitionRef = useRef(null)
  const voiceEnabledRef = useRef(false)
  const wakeModeRef = useRef(false)
  const wakeRecognitionRef = useRef(null)
  const loadingRef = useRef(false)
  const isSpeakingRef = useRef(false)
  const currentAudioRef = useRef(null)
  const lockedVoiceRef = useRef(null) // locked once on mount, never changes
  const audioCtxRef = useRef(null)   // AudioContext — survives iOS gesture expiry
  // Tracks which bulletin IDs have already triggered a notification on this device.
  // Initialized when bulletins first load; after that, any NEW id triggers a pop-up.
  const seenBulletinIdsRef = useRef(null)
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

  // Interesting Bible facts - large pool for daily variety
  const bibleFacts = [
    "The Bible was written over a period of roughly 1,500 years by more than 40 different authors, across three continents and in three languages (Hebrew, Aramaic, and Greek).",
    "The shortest verse in the English Bible is John 11:35 — 'Jesus wept.' It appears when Jesus sees the grief over Lazarus's death.",
    "The longest book in the Bible is Psalms, with 150 chapters. The shortest is 3 John, with only 14 verses.",
    "Methuselah lived to be 969 years old, making him the oldest person recorded in the Bible (Genesis 5:27).",
    "The word 'Bible' comes from the Greek word 'biblia,' meaning 'books' — a reminder that the Bible is actually a library of 66 books.",
    "Jesus quoted from the Old Testament over 75 times during His earthly ministry.",
    "Noah's ark was roughly 450 feet long, 75 feet wide, and 45 feet high — about the size of a modern cargo ship.",
    "The Bible has been translated, in whole or in part, into more than 3,500 languages.",
    "There are 66 books in the Protestant Bible: 39 in the Old Testament and 27 in the New Testament.",
    "Goliath, the Philistine giant defeated by David, was over 9 feet tall according to 1 Samuel 17:4.",
    "The first miracle Jesus performed was turning water into wine at a wedding in Cana (John 2:1-11).",
    "The Dead Sea Scrolls, discovered between 1947 and 1956, include portions of every Old Testament book except Esther.",
    "Paul wrote 13 of the 27 books in the New Testament, most of them while under house arrest or in prison.",
    "The Hebrew word for 'heavens' in Genesis 1:1 ('shamayim') is plural, hinting at multiple layers or realms of heavens.",
    "Solomon's temple in Jerusalem took seven years to build and was covered in gold inside (1 Kings 6:22).",
    "The name 'Jesus' is the Greek form of the Hebrew name 'Yeshua,' which means 'The Lord saves.'",
    "Enoch and Elijah are the only two people in the Bible who were taken directly to heaven without dying.",
    "Jonah spent three days and three nights in the belly of a great fish before being delivered to Nineveh.",
    "The Ten Commandments appear twice in the Bible — in Exodus 20 and again in Deuteronomy 5.",
    "The 'Road to Emmaus' story (Luke 24) describes Jesus walking with two disciples who didn't recognize Him until He broke bread with them.",
    "Jesus had 12 disciples, but the gospels also mention 72 others He sent out two by two (Luke 10:1).",
    "The walls of Jericho famously fell after the Israelites marched around the city for seven days (Joshua 6).",
    "The Book of Esther never mentions God by name, yet it shows His providence throughout the story.",
    "Abraham was 75 years old when God called him to leave his homeland, and 100 when Isaac was born.",
    "The Sermon on the Mount (Matthew 5-7) is the longest continuous teaching of Jesus recorded in the Bible.",
    "King David wrote at least 73 of the 150 Psalms, many of them during times of great personal hardship.",
    "The magi who visited Jesus are traditionally numbered at three, but the Bible never specifies how many there were.",
    "The word 'Christian' appears only three times in the Bible (Acts 11:26, Acts 26:28, and 1 Peter 4:16).",
    "Mary, the mother of Jesus, was likely a teenager when the angel Gabriel announced Jesus's birth.",
    "The phrase 'fear not' appears in the Bible over 300 times — sometimes said to be one for every day of the year.",
    "Pentecost, when the Holy Spirit descended on the disciples, occurred 50 days after Passover.",
    "The Bible contains 31,102 verses across 1,189 chapters.",
    "The tabernacle in the wilderness was a portable tent of worship used by the Israelites for about 400 years before Solomon's temple was built.",
    "The Apostle John is believed to have lived the longest of the twelve disciples and is the only one who didn't die as a martyr.",
    "The Book of Revelation was written by the Apostle John while he was exiled on the island of Patmos.",
    "The name 'Israel' means 'he who struggles with God,' given to Jacob after wrestling with God (Genesis 32:28).",
    "The Bible mentions over 40 different types of food, from bread and olives to quail and locusts.",
    "The longest chapter in the Bible is Psalm 119, with 176 verses, all praising God's Word.",
    "The shortest chapter in the Bible is Psalm 117, with just two verses.",
    "The Bible describes 8 different miracles Jesus performed involving bringing someone back from death or healing life-threatening illness.",
    "The word 'hallelujah' comes from two Hebrew words meaning 'praise' and 'Yahweh' (the Lord).",
    "Joseph was 17 when sold into slavery by his brothers, and 30 when he became second-in-command of Egypt.",
    "The Garden of Gethsemane, where Jesus prayed before His arrest, means 'oil press' in Aramaic.",
    "The Bible was the first major book printed on Gutenberg's printing press around 1455.",
    "The shepherds who visited the baby Jesus were likely tending sheep raised for temple sacrifices in Bethlehem.",
    "The word 'love' appears more than 500 times in the Bible, depending on the translation.",
    "Jesus was crucified on a Friday and rose from the dead on Sunday — the first day of the week.",
    "The Bible mentions 21 different types of musical instruments, from harps and lyres to trumpets and cymbals.",
    "The phrase 'God helps those who help themselves' is NOT in the Bible — it's actually from Benjamin Franklin.",
    "The New Testament contains 260 chapters; the Old Testament contains 929.",
    "The Bible contains approximately 783,137 words in the King James Version.",
    "The name 'Bethlehem' means 'House of Bread' — fitting for the birthplace of Jesus, who called Himself the Bread of Life.",
    "Queen Esther was originally named Hadassah, meaning 'myrtle' in Hebrew.",
    "The prophet Isaiah foretold Jesus's birth and death over 700 years before they happened.",
    "The first time the word 'love' appears in the Bible is in Genesis 22:2, referring to Abraham's love for his son Isaac.",
    "The Book of Psalms is the only book of the Bible in which every verse is poetry.",
    "The Sea of Galilee, where Jesus performed many miracles, is actually a freshwater lake about 13 miles long.",
    "Peter was originally named Simon; Jesus renamed him Peter, meaning 'rock.'",
    "The manna that fed the Israelites in the wilderness tasted 'like wafers made with honey' (Exodus 16:31).",
    "The oldest complete copy of the Hebrew Bible, the Leningrad Codex, dates to around 1008 AD.",
    "Melchizedek, the mysterious priest-king of Salem who blessed Abraham, is mentioned in only a handful of verses but is compared to Christ in Hebrews.",
    "The Book of Acts was written by Luke and is considered the second volume of his gospel.",
    "The disciples were first called 'Christians' in Antioch (Acts 11:26).",
    "There are over 300 prophecies about Jesus in the Old Testament, all fulfilled in the New Testament.",
    "The Last Supper was a Passover meal, which has been celebrated by Jewish families for over 3,400 years.",
    "Lazarus was in the tomb for four days before Jesus raised him from the dead (John 11:39).",
    "The apostle Paul had three distinct names: Saul (Hebrew), Saulos (Greek), and Paulus (Roman).",
    "The early Christian symbol of the fish (ichthys) was used as a secret sign during times of persecution.",
    "The word 'Amen' is the same in nearly every language because it comes directly from Hebrew, meaning 'so be it' or 'truly.'",
    "The word 'gospel' comes from the Old English 'godspel,' meaning 'good news.'",
    "Naaman the Syrian commander was healed of leprosy after dipping seven times in the Jordan River (2 Kings 5).",
    "The Bible was the first book ever to be mass-produced.",
    "Job, considered the oldest book in the Bible, predates most of Genesis in terms of events described.",
    "Jesus's earthly ministry lasted approximately three years.",
    "The Hebrew alphabet has 22 letters, and Psalm 119 is structured as an acrostic — each of its 22 sections begins with a successive letter.",
    "There are 39 Old Testament books and Jesus referred to every single section (Law, Prophets, Writings) during His ministry.",
    "Ruth, the Moabite woman who became the great-grandmother of King David, was a foreigner who chose to follow the God of Israel.",
    "The apostle Thomas is traditionally believed to have taken the Gospel all the way to India.",
    "The Bible was written by kings, shepherds, fishermen, a doctor, a tax collector, a tentmaker, and prophets.",
    "Mount Sinai, where Moses received the Ten Commandments, is believed to be in the southern Sinai Peninsula.",
    "The entire town of Nazareth, where Jesus grew up, had fewer than 500 people during His lifetime.",
    "The number 40 appears many times in the Bible: 40 days of rain for Noah, 40 years in the wilderness, 40 days of Jesus's temptation.",
    "The prophet Daniel interpreted dreams for three different kings of Babylon and Persia.",
    "The apostle John wrote five books of the New Testament: the Gospel of John, 1-2-3 John, and Revelation.",
    "The Bible mentions at least 19 separate resurrections, including Jesus's own.",
    "Aaron, Moses's brother, was the first high priest of Israel and served in the role for nearly 40 years.",
    "The Gospel of Mark is believed to be the earliest written Gospel, likely dating to around 65-70 AD.",
    "Isaiah 53, written 700 years before Christ, describes in detail the crucifixion and sacrificial death of Jesus.",
    "Psalm 22, also written centuries before, describes crucifixion details — including piercing of hands and feet — before crucifixion was even invented as a method of execution.",
    "The word 'covenant' appears over 280 times in the Bible, highlighting God's relationship with humanity.",
    "Luke, who wrote the Gospel of Luke and Acts, was a physician and the only Gentile author of a New Testament book.",
    "The Bible has been the world's best-selling book every year for decades, with estimated total sales exceeding 5 billion copies.",
    "In the Bible, angels are never described with halos or feminine features — those are later artistic traditions.",
    "The Book of Job contains what may be the earliest reference to the water cycle (Job 36:27-28).",
    "The prophet Elisha performed exactly twice as many recorded miracles as his mentor Elijah.",
    "Simeon, the elderly man who held baby Jesus at the temple, had been promised by God he would see the Messiah before he died (Luke 2:25-32).",
    "The Apostles' Creed, still recited in many churches today, dates back to at least the 4th century AD.",
    "The names of Jesus's twelve apostles appear in four different lists in the New Testament (Matthew 10, Mark 3, Luke 6, and Acts 1).",
    "The Gospel of John is the only one of the four gospels that does not contain a parable.",
    "Barnabas, Paul's early missionary companion, had a name meaning 'son of encouragement' (Acts 4:36)."
  ]

  function getDailyBibleFact() {
    const today = new Date()
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)
    // Offset by 1 so bible fact doesn't match verse index
    return bibleFacts[(dayOfYear + 1) % bibleFacts.length]
  }

  // Interesting U.S. History facts - large pool for daily variety
  const historyFacts = [
    "The Declaration of Independence was signed on July 4, 1776, but most delegates actually signed it on August 2, 1776.",
    "The American flag was designed by Betsy Ross, a Philadelphia seamstress, at the request of George Washington in 1776.",
    "The U.S. Constitution is the oldest written national constitution still in use, dating to 1787.",
    "George Washington was the only president elected unanimously by the Electoral College — twice.",
    "The Statue of Liberty was a gift from France to the United States, dedicated on October 28, 1886.",
    "The Louisiana Purchase of 1803 doubled the size of the United States for about 3 cents per acre.",
    "The Pledge of Allegiance was written in 1892 by Francis Bellamy to celebrate the 400th anniversary of Columbus's arrival.",
    "The Liberty Bell cracked the first time it was rung in 1752 and had to be recast twice.",
    "The first American president to live in the White House was John Adams, starting November 1, 1800.",
    "The Star-Spangled Banner was written by Francis Scott Key during the War of 1812, after witnessing the bombardment of Fort McHenry.",
    "Kentucky became the 15th state to join the Union on June 1, 1792.",
    "The Lewis and Clark Expedition from 1804 to 1806 traveled over 8,000 miles exploring the western U.S.",
    "The Battle of Yorktown in 1781 effectively ended the Revolutionary War with British General Cornwallis's surrender.",
    "Abraham Lincoln's Gettysburg Address in 1863 was only 272 words long but is considered one of the greatest speeches in American history.",
    "The Transcontinental Railroad was completed on May 10, 1869, with the driving of the 'Golden Spike' in Utah.",
    "The Wright Brothers' first successful powered flight on December 17, 1903, lasted just 12 seconds and covered 120 feet.",
    "Theodore Roosevelt was the first president to fly in an airplane — in 1910, after leaving office.",
    "Kentucky is known as the 'Bluegrass State' because of the bluegrass found in many of its pastures.",
    "The Kentucky Derby, first held in 1875, is the oldest continuously held sporting event in the United States.",
    "The Mayflower landed at Plymouth Rock on December 21, 1620, carrying 102 passengers.",
    "The Boston Tea Party took place on December 16, 1773, when colonists dumped 342 chests of tea into Boston Harbor.",
    "Paul Revere's famous midnight ride on April 18, 1775, actually involved several riders — and he never shouted 'the British are coming.'",
    "The Battle of Bunker Hill in 1775 was actually fought mostly on Breed's Hill.",
    "The word 'United States of America' was first used officially in the Declaration of Independence.",
    "The Great Seal of the United States was adopted on June 20, 1782, and features a bald eagle holding an olive branch and arrows.",
    "The bald eagle was officially adopted as the national bird of the United States on June 20, 1782.",
    "The original 13 colonies became states in this order, with Delaware being the first to ratify the Constitution on December 7, 1787.",
    "The War of 1812 is sometimes called 'The Second War of Independence' because it reaffirmed American sovereignty.",
    "The Emancipation Proclamation was issued by President Lincoln on January 1, 1863.",
    "Texas was an independent country — the Republic of Texas — from 1836 to 1845 before becoming a state.",
    "Alaska was purchased from Russia in 1867 for $7.2 million, or about 2 cents per acre.",
    "The Panama Canal, completed in 1914, shortened ship travel between the Atlantic and Pacific by about 8,000 miles.",
    "Women gained the right to vote in the U.S. with the ratification of the 19th Amendment on August 18, 1920.",
    "The Great Depression began with the stock market crash on October 29, 1929 — 'Black Tuesday.'",
    "The United States entered World War II after the attack on Pearl Harbor on December 7, 1941.",
    "The D-Day invasion of Normandy on June 6, 1944, was the largest seaborne invasion in history.",
    "Neil Armstrong became the first person to walk on the moon on July 20, 1969, during the Apollo 11 mission.",
    "The U.S. Marine Corps was founded on November 10, 1775, at Tun Tavern in Philadelphia.",
    "The Pentagon, headquarters of the Department of Defense, is one of the world's largest office buildings with over 17 miles of hallways.",
    "The Lincoln Memorial in Washington, D.C., was dedicated on May 30, 1922, and features a 19-foot statue of Abraham Lincoln.",
    "Mount Rushmore took 14 years to complete (1927-1941) and features the faces of Washington, Jefferson, Roosevelt, and Lincoln.",
    "The Empire State Building was completed in 1931 and was the tallest building in the world for nearly 40 years.",
    "Daniel Boone, the famous frontiersman, played a major role in the exploration and settlement of Kentucky in the 1700s.",
    "Kentucky is home to Fort Knox, which holds a significant portion of the United States' gold reserves.",
    "The first-ever McDonald's opened in San Bernardino, California, in 1940 by brothers Richard and Maurice McDonald.",
    "The Voting Rights Act of 1965 outlawed discriminatory voting practices that had disenfranchised African Americans.",
    "The Moon Landing on July 20, 1969, was watched by an estimated 650 million people worldwide.",
    "The U.S. interstate highway system, begun in 1956 under President Eisenhower, is over 47,000 miles long.",
    "The Smithsonian Institution, founded in 1846, is the world's largest museum and research complex with 21 museums.",
    "Hawaii became the 50th and most recent state to join the Union on August 21, 1959.",
    "The American Revolution officially ended with the Treaty of Paris, signed on September 3, 1783.",
    "George Washington served as commander of the Continental Army for over 8 years without accepting a salary.",
    "Benjamin Franklin was the only Founding Father to sign all four key documents: the Declaration of Independence, the Treaty of Alliance with France, the Treaty of Paris, and the Constitution.",
    "The Statue of Liberty's full name is 'Liberty Enlightening the World.'",
    "The White House has 132 rooms, 35 bathrooms, and 6 levels.",
    "The phrase 'In God We Trust' was officially adopted as the U.S. national motto in 1956.",
    "The United States has had 46 presidents, with George Washington being the first in 1789.",
    "The U.S. Capitol building's dome was completed during the Civil War as a symbol that the Union would endure.",
    "Francis Scott Key wrote the Star-Spangled Banner as a poem in 1814, but it wasn't adopted as the national anthem until 1931.",
    "The Civil War (1861-1865) remains the deadliest conflict in American history, with over 600,000 soldiers killed.",
    "The Erie Canal, completed in 1825, connected the Great Lakes to the Atlantic and transformed American commerce.",
    "The Pony Express only operated for 18 months (1860-1861) before being replaced by the telegraph.",
    "Harriet Tubman made about 13 missions to rescue approximately 70 enslaved people via the Underground Railroad.",
    "The 13th Amendment, abolishing slavery, was ratified on December 6, 1865.",
    "President James K. Polk accomplished every goal of his presidency in a single term and then declined to run again.",
    "The California Gold Rush began in 1848 when gold was discovered at Sutter's Mill, drawing over 300,000 people to California.",
    "The Pentagon has two zip codes — one for the Army side and one for the Navy side.",
    "Martin Luther King Jr. delivered his 'I Have a Dream' speech on August 28, 1963, to over 250,000 people at the Lincoln Memorial.",
    "The first American patent was issued in 1790 to Samuel Hopkins for a new process of making potash.",
    "Thomas Jefferson and John Adams both died on July 4, 1826 — exactly 50 years after the Declaration of Independence.",
    "President William Henry Harrison gave the longest inauguration speech (nearly 2 hours) and died 31 days later — the shortest presidency.",
    "The American bison, once numbering in the tens of millions, was hunted nearly to extinction by the late 1800s.",
    "The Brooklyn Bridge, completed in 1883, was the world's first steel-wire suspension bridge.",
    "The first transcontinental telephone call was made on January 25, 1915, from New York to San Francisco.",
    "The U.S. flag has been modified 27 times since 1777, with the current 50-star design adopted in 1960.",
    "The original Constitution is written on parchment made from treated animal skin.",
    "Abraham Lincoln was the first U.S. president to be photographed at his inauguration in 1861.",
    "President Theodore Roosevelt was the first American to win a Nobel Peace Prize, in 1906, for mediating the end of the Russo-Japanese War.",
    "The Empire State Building was constructed in just 410 days during the Great Depression.",
    "The National Parks System was established by President Woodrow Wilson in 1916, with Yellowstone already having been the world's first national park since 1872.",
    "George Washington Carver developed over 300 uses for the peanut, revolutionizing Southern agriculture.",
    "Rosa Parks's refusal to give up her seat on a Montgomery bus on December 1, 1955, sparked the 381-day Montgomery Bus Boycott.",
    "The Berlin Wall fell on November 9, 1989, a defining victory for American values of freedom during the Cold War.",
    "The Golden Gate Bridge, completed in 1937, was the longest suspension bridge in the world for 27 years.",
    "John F. Kennedy was the youngest person elected U.S. president, at age 43, in 1960.",
    "The U.S. Coast Guard is one of the oldest military services, founded in 1790 as the Revenue Cutter Service.",
    "Ronald Reagan signed the first treaty eliminating an entire class of nuclear weapons, the INF Treaty, with the Soviet Union in 1987.",
    "The Mason-Dixon Line was originally surveyed from 1763-1767 to settle a property dispute between Maryland and Pennsylvania.",
    "The U.S. Army's West Point military academy, established in 1802, is the oldest continuously operating military post in the country.",
    "The first successful gasoline-powered automobile in America was built by Charles and Frank Duryea in 1893.",
    "The Apollo 13 mission in 1970 was called a 'successful failure' because all astronauts returned safely despite severe equipment malfunction.",
    "Fort Boonesborough, founded by Daniel Boone in 1775, was one of the first American settlements west of the Appalachian Mountains.",
    "Abraham Lincoln was born in a log cabin in Hodgenville, Kentucky, on February 12, 1809.",
    "Jefferson Davis, the president of the Confederacy, was born in Fairview, Kentucky, just 100 miles from Lincoln's birthplace.",
    "Kentucky Fried Chicken was founded by Colonel Harland Sanders in Corbin, Kentucky, in 1930.",
    "Muhammad Ali, born Cassius Clay, was from Louisville, Kentucky, and is considered one of the greatest boxers of all time.",
    "The United States Air Force became a separate branch of the military in 1947, having previously been part of the Army.",
    "The 22nd Amendment, ratified in 1951, limits a president to two terms in office.",
    "The Homestead Act of 1862 gave 160 acres of public land to any American willing to farm it for five years.",
    "Mount Vernon, George Washington's home, is visited by over one million people each year."
  ]

  function getDailyHistoryFact() {
    const today = new Date()
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)
    // Offset by 2 so history fact doesn't match verse or bible fact indexes
    return historyFacts[(dayOfYear + 2) % historyFacts.length]
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
    const now = new Date()
    // Normalize "today" to start of day so the event still shows as TODAY
    // for the full day it occurs, and only rolls off the following calendar day.
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const currentYear = now.getFullYear()
    const nextYear = currentYear + 1

    // Important dates for the Deatherage family
    const importantDates = [
      // Major Holidays - 2026 Calendar Dates
      { name: "Christmas", date: new Date(currentYear, 11, 25), emoji: "🎄" }, // Dec 25, 2026
      { name: "Thanksgiving", date: new Date(currentYear, 10, 26), emoji: "🦃" }, // Nov 26, 2026 (4th Thursday)
      { name: "Independence Day", date: new Date(currentYear, 6, 4), emoji: "🇺🇸" }, // July 4, 2026
      { name: "New Year's Day", date: new Date(nextYear, 0, 1), emoji: "🎊" }, // Jan 1, 2027

      // Family Birthdays - Real Deatherage Family Dates
      { name: "Dad's Birthday", date: new Date(currentYear, 2, 30), emoji: "🎂" }, // March 30th
      { name: "Emily's Birthday", date: new Date(currentYear, 3, 17), emoji: "🎂" }, // April 17th
      { name: "Carter's Birthday", date: new Date(currentYear, 4, 2), emoji: "🎂" }, // May 2nd
      { name: "Cicily's Birthday", date: new Date(currentYear, 2, 13), emoji: "🎂" }, // March 13th
      { name: "Camille's Birthday", date: new Date(currentYear, 4, 15), emoji: "🎂" }, // May 15th
      { name: "Lincoln's Birthday", date: new Date(currentYear, 10, 28), emoji: "🎂" }, // November 28th
    ]

    const activeCountdowns = importantDates.map(item => {
      // Normalize event date to start of day so comparisons are date-only
      let targetDate = new Date(item.date.getFullYear(), item.date.getMonth(), item.date.getDate())

      // Only roll to next year once we're PAST the event (i.e. the day after),
      // not on the day of itself. This lets "TODAY!" show for the full day.
      if (targetDate < todayStart) {
        targetDate = new Date(nextYear, item.date.getMonth(), item.date.getDate())
      }

      const timeDiff = targetDate.getTime() - todayStart.getTime()
      // Round to the nearest whole day to avoid DST drift
      const daysLeft = Math.round(timeDiff / (1000 * 3600 * 24))

      return {
        ...item,
        daysLeft,
        targetDate
      }
    })
    .filter(item => item.daysLeft >= 0 && item.daysLeft <= 365) // Include today (0 days) and within a year
    .sort((a, b) => a.daysLeft - b.daysLeft) // Sort by closest first

    setCountdowns(activeCountdowns.slice(0, 5)) // Show top 5 upcoming events
  }

  // Load persisted data and set up Firebase sync
  useEffect(() => {
    async function loadInitialData() {
      // Load from Firebase
      const firebaseChores = await loadFromFirebase('chores')
      const firebaseShopping = await loadFromFirebase('shopping')
      const firebaseBulletins = await loadFromFirebase('bulletins')
      const firebaseGifts = await loadFromFirebase('gifts', {})
      
      // Set state with Firebase data or fallbacks
      setChores(firebaseChores || DEFAULT_CHORES.Cicily ? 
        Object.fromEntries(KIDS.map(k => [k, (DEFAULT_CHORES[k] || []).map((t, i) => ({ id: i, text: t, done: false }))])) : {}
      )
      setShopping(firebaseShopping || [])
      setGifts(firebaseGifts && typeof firebaseGifts === 'object' && !Array.isArray(firebaseGifts) ? firebaseGifts : {})
      const initialBulletins = Array.isArray(firebaseBulletins) ? firebaseBulletins : []
      setBulletins(initialBulletins)
      // Initialize the seen-set with everything already on the board so we
      // don't notification-spam the user on page load. Any NEW bulletin that
      // arrives after this point will trigger a pop-up.
      seenBulletinIdsRef.current = new Set(
        initialBulletins.map(b => b && b.id).filter(Boolean)
      )
      console.log('[JARVIS] Initialized seen-set with', seenBulletinIdsRef.current.size, 'bulletin IDs')
    }

    loadInitialData()

    // Prune chat logs older than 30 days (runs once on app load).
    // Keeps Firebase storage/download usage low and the parent review fast.
    async function pruneOldChatLogs() {
      try {
        const logs = await firebase.get('chatlogs')
        if (!logs) return
        const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000) // 30 days in ms
        let removed = 0
        // logs is an object keyed by Firebase push IDs: { pushKey: logEntry, ... }
        for (const [key, entry] of Object.entries(logs)) {
          if (!entry || !entry.timestamp) continue
          const entryTime = new Date(entry.timestamp).getTime()
          if (entryTime < cutoff) {
            await firebase.delete(`chatlogs/${key}`)
            removed++
          }
        }
        if (removed > 0) console.log(`Pruned ${removed} chat log(s) older than 30 days`)
      } catch (e) {
        console.error('Prune failed:', e)
      }
    }
    pruneOldChatLogs()

    // Prune bulletins older than 7 days (runs once on app load).
    // Bulletins are stored as a single array under "bulletins" in Firebase,
    // so we filter the array and save the trimmed version back.
    async function pruneOldBulletins() {
      try {
        const allBulletins = await firebase.get('bulletins')
        if (!Array.isArray(allBulletins) || allBulletins.length === 0) return
        const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000) // 7 days in ms
        const kept = allBulletins.filter(b => {
          if (!b || !b.timestamp) return false
          return new Date(b.timestamp).getTime() >= cutoff
        })
        const removedCount = allBulletins.length - kept.length
        if (removedCount > 0) {
          await firebase.set('bulletins', kept)
          setBulletins(kept)
          console.log(`[JARVIS] Pruned ${removedCount} bulletin(s) older than 7 days`)
        }
      } catch (e) {
        console.error('Bulletin prune failed:', e)
      }
    }
    pruneOldBulletins()

    // Set daily Bible verse
    setDailyVerse(getDailyVerse())
    setDailyBibleFact(getDailyBibleFact())
    setDailyHistoryFact(getDailyHistoryFact())

    // Initialize countdowns and UK sports
    calculateCountdowns()

    // Real-time sync - check for updates every 3 seconds
    const syncInterval = setInterval(async () => {
      const firebaseBulletins = await loadFromFirebase('bulletins')
      const firebaseShopping = await loadFromFirebase('shopping')
      const firebaseChores = await loadFromFirebase('chores')

      // Handle bulletin updates + notifications.
      if (firebaseBulletins) {
        const list = Array.isArray(firebaseBulletins) ? firebaseBulletins : []
        const currentIds = list.map(b => b && b.id).filter(Boolean)

        // If the seen-set isn't initialized yet (race condition during initial load),
        // initialize it without firing any notifications.
        if (seenBulletinIdsRef.current === null) {
          seenBulletinIdsRef.current = new Set(currentIds)
          setBulletins(list)
        } else {
          // Find bulletins this device hasn't seen yet
          const newBulletins = list.filter(b => b && b.id && !seenBulletinIdsRef.current.has(b.id))
          if (newBulletins.length > 0) {
            console.log('[JARVIS] Found', newBulletins.length, 'new bulletin(s) — firing notification')
            setBulletins(list)
            // Fire a pop-up for each new one
            newBulletins.forEach(nb => {
              const preview = (nb.text || '').substring(0, 60)
              const more = nb.text && nb.text.length > 60 ? '...' : ''
              showNotification(`📢 ${nb.author}: ${preview}${more}`)
              seenBulletinIdsRef.current.add(nb.id)
            })
          } else {
            // No new bulletins — check if something else changed (like a delete)
            // and sync local state quietly
            const seenCount = seenBulletinIdsRef.current.size
            if (list.length !== seenCount) {
              setBulletins(list)
              seenBulletinIdsRef.current = new Set(currentIds)
            }
          }
        }
      }

      if (firebaseShopping && JSON.stringify(firebaseShopping) !== JSON.stringify(shopping)) {
        setShopping(firebaseShopping)
      }

      if (firebaseChores && JSON.stringify(firebaseChores) !== JSON.stringify(chores)) {
        setChores(firebaseChores)
      }

      // Sync gifts across devices
      const firebaseGifts = await loadFromFirebase('gifts', {})
      if (firebaseGifts && typeof firebaseGifts === 'object' && !Array.isArray(firebaseGifts)) {
        if (JSON.stringify(firebaseGifts) !== JSON.stringify(gifts)) {
          setGifts(firebaseGifts)
        }
      }
    }, 3000)

    return () => clearInterval(syncInterval)
  }, [user, bulletins.length, shopping, chores, gifts])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Typewriter effect: animate the latest JARVIS response letter by letter
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (!last || last.role !== 'assistant') { setIsTyping(false); return }
    let i = 0
    const full = last.content || ''
    setDisplayedText('')
    setIsTyping(true)
    const iv = setInterval(() => {
      i++
      setDisplayedText(full.slice(0, i))
      if (i >= full.length) { clearInterval(iv); setIsTyping(false) }
    }, 15)
    return () => { clearInterval(iv) }
  }, [messages])

  // Drive orb animation speed + brightness — read every frame by the canvas loop
  useEffect(() => {
    if (loading)          { orbSpeedMultRef.current = 5;   orbBrightnessRef.current = 1.0  }
    else if (isSpeaking)  { orbSpeedMultRef.current = 4;   orbBrightnessRef.current = 0.96 }
    else if (isTyping)    { orbSpeedMultRef.current = 2.5; orbBrightnessRef.current = 0.88 }
    else if (isListening) { orbSpeedMultRef.current = 1.5; orbBrightnessRef.current = 0.75 }
    else                  { orbSpeedMultRef.current = 1;   orbBrightnessRef.current = 0.68 }
  }, [loading, isSpeaking, isTyping, isListening])

  useEffect(() => { loadingRef.current = loading }, [loading])
  useEffect(() => { isSpeakingRef.current = isSpeaking }, [isSpeaking])
  useEffect(() => { wakeModeRef.current = wakeMode }, [wakeMode])

  // Lock browser TTS voice once on mount — never changes between responses
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const lock = () => {
      const voices = window.speechSynthesis.getVoices()
      lockedVoiceRef.current = voices.find(v => v.name === 'Daniel')
        || voices.find(v => v.name === 'Arthur')
        || voices.find(v => v.name === 'Google UK English Male')
        || voices.find(v => v.name.includes('Microsoft George'))
        || voices.find(v => v.name.includes('Microsoft Harry'))
        || voices.find(v => v.lang === 'en-GB' && !v.name.toLowerCase().includes('female'))
        || null
    }
    if (window.speechSynthesis.getVoices().length > 0) lock()
    else window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.onvoiceschanged = null; lock() }
  }, [])

  // Re-unlock AudioContext when user returns to the app after backgrounding.
  // iOS suspends the AudioContext when the page is hidden; it must be resumed
  // inside a user gesture. We register a one-time touchstart/mousedown so the
  // very next tap (mic, input, send, anywhere) re-activates audio.
  useEffect(() => {
    if (typeof window === 'undefined') return
    function handleVisible() {
      if (document.visibilityState !== 'visible') return
      const ac = audioCtxRef.current
      if (!ac) return
      ac.resume().catch(() => {})
      function resumeOnGesture() {
        ac.resume().catch(() => {})
        document.removeEventListener('touchstart', resumeOnGesture)
        document.removeEventListener('mousedown', resumeOnGesture)
      }
      document.addEventListener('touchstart', resumeOnGesture, { once: true, passive: true })
      document.addEventListener('mousedown', resumeOnGesture, { once: true })
    }
    document.addEventListener('visibilitychange', handleVisible)
    return () => document.removeEventListener('visibilitychange', handleVisible)
  }, [])

  // Canvas: JARVIS MCU HUD — concentric rings, spins when thinking, +35% when speaking
  useEffect(() => {
    if (tab !== 'chat' || !userSelected) return
    if ((user === 'Dad' || user === 'Mom') && !adultChatUnlocked) return
    const canvas = orbCanvasRef.current
    if (!canvas) return
    if (orbRafRef.current) cancelAnimationFrame(orbRafRef.current)

    const dpr = window.devicePixelRatio || 1
    const W = canvas.parentElement?.clientWidth || window.innerWidth
    const H = canvas.parentElement?.clientHeight || Math.round(window.innerHeight * 0.52)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    const cx = W * 0.50
    const cy = H * 0.50
    const baseR = Math.min(W, H) * 0.40

    let t = 0

    function draw() {
      const spd = orbSpeedMultRef.current
      const br   = orbBrightnessRef.current
      const thinking = loadingRef.current
      const speaking = isSpeakingRef.current
      t += 0.008 * spd

      // 35% bigger when speaking; rings spin 4.5× faster when thinking
      const R        = baseR * (speaking ? 1.35 : 1.0)
      const spinMult = thinking ? 4.5 : 1.0

      // ── Background ─────────────────────────────────────────────────
      ctx.fillStyle = '#020818'
      ctx.fillRect(0, 0, W, H)
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.2)
      bg.addColorStop(0,   `rgba(0,40,90,${(0.55 * br).toFixed(2)})`)
      bg.addColorStop(0.6, `rgba(0,15,45,${(0.30 * br).toFixed(2)})`)
      bg.addColorStop(1,   'rgba(0,0,0,0)')
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)

      // Color helpers
      const c  = (a) => `rgba(0,210,255,${(a * br).toFixed(2)})`
      const cb = (a) => `rgba(100,240,255,${(a * br).toFixed(2)})`
      const cd = (a) => `rgba(0,155,195,${(a * br).toFixed(2)})`

      // ── Drawing helpers ────────────────────────────────────────────
      function glowArc(r, lw, color, glowColor, blur) {
        ctx.save()
        ctx.shadowColor = glowColor; ctx.shadowBlur = blur
        ctx.strokeStyle = color; ctx.lineWidth = lw
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
        ctx.restore()
      }

      function partialArc(r, lw, color, startA, endA) {
        ctx.strokeStyle = color; ctx.lineWidth = lw
        ctx.beginPath(); ctx.arc(cx, cy, r, startA, endA); ctx.stroke()
      }

      function tickRing(r, n, tickLen, lw, color, rot, majorEvery, majorScale) {
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot)
        ctx.strokeStyle = color; ctx.lineWidth = lw
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2
          const len = (i % majorEvery === 0) ? tickLen * majorScale : tickLen
          const cos = Math.cos(a), sin = Math.sin(a)
          ctx.beginPath()
          ctx.moveTo(cos * r, sin * r)
          ctx.lineTo(cos * (r - len), sin * (r - len))
          ctx.stroke()
        }
        ctx.restore()
      }

      function dotRing(r, n, dotR, color, rot, majorEvery, majorScale) {
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.fillStyle = color
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2
          const dr = (i % majorEvery === 0) ? dotR * majorScale : dotR
          ctx.beginPath()
          ctx.arc(Math.cos(a) * r, Math.sin(a) * r, dr, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      function segRing(r, n, segFrac, lw, color, rot) {
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot)
        ctx.strokeStyle = color; ctx.lineWidth = lw
        const step = (Math.PI * 2) / n
        for (let i = 0; i < n; i++) {
          const a = i * step + step * (1 - segFrac) * 0.5
          ctx.beginPath(); ctx.arc(0, 0, r, a, a + step * segFrac); ctx.stroke()
        }
        ctx.restore()
      }

      function rectRing(r, n, rw, rh, color, rot) {
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.fillStyle = color
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2
          ctx.save(); ctx.rotate(a)
          ctx.fillRect(-rw / 2, -r - rh, rw, rh)
          ctx.restore()
        }
        ctx.restore()
      }

      function charRing(r, text, fs, color, rot) {
        ctx.save(); ctx.translate(cx, cy)
        ctx.font = `${fs}px 'Share Tech Mono', monospace`
        ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        const chars = text.split('')
        const step = (Math.PI * 2) / chars.length
        chars.forEach((ch, i) => {
          const a = i * step + rot
          ctx.save(); ctx.rotate(a); ctx.translate(0, -r)
          ctx.rotate(Math.PI / 2); ctx.fillText(ch, 0, 0)
          ctx.restore()
        })
        ctx.restore()
      }

      // ── Rings (outer → inner) ──────────────────────────────────────
      // Ring A — outermost: thin arc + fine ticks + major ticks
      glowArc(R * 0.94, 0.7, cd(0.30), '#00d4ff', 0)
      tickRing(R * 0.94, 120, R * 0.025, 0.7, cd(0.40), t * 0.05 * spinMult, 8, 2.2)

      // Ring B — rectangular calibration blocks, counter-rotating
      rectRing(R * 0.87, 40, R * 0.008, R * 0.022, c(0.45), -t * 0.08 * spinMult)
      glowArc(R * 0.87, 0.5, cd(0.20), '#00d4ff', 0)

      // Ring C — dot ring
      dotRing(R * 0.79, 128, R * 0.005, cd(0.40), t * 0.11 * spinMult, 16, 2.5)
      dotRing(R * 0.79, 16,  R * 0.010, c(0.55),  t * 0.11 * spinMult, 1,  1.0)

      // Ring D — segmented dash ring
      segRing(R * 0.71, 28, 0.55, 1.8, c(0.52), -t * 0.17 * spinMult)
      glowArc(R * 0.71, 0.5, cd(0.18), '#00d4ff', 0)

      // Ring E — character/number ring (000000...)
      charRing(R * 0.63, '000000000000000000000000', Math.round(R * 0.044), cd(0.32), t * 0.13 * spinMult)

      // Ring F — inner tick ring, counter-rotating
      glowArc(R * 0.55, 0.8, c(0.38), '#00d4ff', 0)
      tickRing(R * 0.55, 72, R * 0.022, 1.0, c(0.52), -t * 0.24 * spinMult, 6, 1.9)

      // Ring G — segmented accent ring
      segRing(R * 0.48, 18, 0.62, 2.2, cb(0.65), t * 0.36 * spinMult)

      // Ring H — main inner glowing ring (thick + glow)
      glowArc(R * 0.42, 3.5, c(0.78), '#00d4ff', 22 * br)
      glowArc(R * 0.42, 1.2, cb(0.92), '#80f0ff',  8 * br)
      segRing(R * 0.42, 22, 0.68, 3.8, cb(0.88), t * 0.52 * spinMult)

      // Ring I — innermost glowing ring
      glowArc(R * 0.29, 2.5, c(0.88),  '#00d4ff', 28 * br)
      glowArc(R * 0.29, 1.0, 'rgba(215,252,255,0.95)', '#c0f8ff', 12 * br)

      // ── Center fill ───────────────────────────────────────────────
      const cf = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.27)
      cf.addColorStop(0, 'rgba(0,22,50,0.96)')
      cf.addColorStop(1, 'rgba(2,8,28,0.98)')
      ctx.fillStyle = cf
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.275, 0, Math.PI * 2); ctx.fill()

      // ── J.A.R.V.I.S text ─────────────────────────────────────────
      ctx.save()
      ctx.shadowColor = '#00d4ff'; ctx.shadowBlur = 22
      ctx.fillStyle = `rgba(205,250,255,${(0.96 * br).toFixed(2)})`
      ctx.font = `700 ${Math.round(R * 0.115)}px 'Rajdhani', sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('J.A.R.V.I.S', cx, cy)
      ctx.restore()

      // Status sub-text
      const status = thinking ? 'PROCESSING...' : speaking ? 'SPEAKING' : 'ONLINE'
      ctx.save()
      ctx.fillStyle = `rgba(0,210,255,${(0.52 * br).toFixed(2)})`
      ctx.font = `${Math.round(R * 0.050)}px 'Share Tech Mono', monospace`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(status, cx, cy + R * 0.125)
      ctx.restore()

      orbRafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => { if (orbRafRef.current) cancelAnimationFrame(orbRafRef.current) }
  }, [tab, userSelected, adultChatUnlocked, user])

  // Force the Google Calendar iframe to reload fresh every time the user
  // opens the dashboard or calendar tab, so updates always show on mobile.
  useEffect(() => {
    if (tab === 'dashboard' || tab === 'calendar') {
      setCalendarCacheBust(Date.now())
    }
  }, [tab])

  // When leaving the chat tab, reset user selection so the next time someone
  // enters chat they have to pick who they are again. Also clears the thread.
  useEffect(() => {
    if (tab !== 'chat') {
      setUserSelected(false)
      setMessages([])
      setAdultChatUnlocked(false)
      setAdultChatPassInput('')
    }
  }, [tab])

  // Auto-lock the adult chat whenever the user switches to a kid.
  // Also clears the current message thread when switching user types so
  // nobody sees the previous user's conversation.
  useEffect(() => {
    if (user !== 'Dad' && user !== 'Mom') {
      setAdultChatUnlocked(false)
      setAdultChatPassInput('')
    }
    setMessages([])
  }, [user])

  // Auto-refresh chat logs while on the parent review tab (only when unlocked).
  // Polls every 5 seconds so new kid messages show up without manual refresh.
  useEffect(() => {
    if (tab !== 'parents' || !parentUnlocked) return
    const refreshLogs = async () => {
      try {
        const logs = await firebase.get('chatlogs')
        if (logs) {
          const arr = Object.values(logs).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          setChatLogs(arr)
        } else {
          setChatLogs([])
        }
      } catch (e) {
        console.error('Auto-refresh failed:', e)
      }
    }
    // Refresh immediately on entry, then every 5 seconds
    refreshLogs()
    const interval = setInterval(refreshLogs, 5000)
    return () => clearInterval(interval)
  }, [tab, parentUnlocked])

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
    // Auto-hide after 8 seconds — longer so people actually notice it
    setTimeout(() => {
      setNotification('')
    }, 8000)
    
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
    if (!bulletinAuthor) {
      alert('Please select who you are before posting.')
      return
    }
    const bulletin = {
      id: Date.now(),
      text,
      author: bulletinAuthor,
      timestamp: new Date().toISOString(),
      seenBy: [bulletinAuthor] // author has inherently seen their own post
    }
    const updated = [bulletin, ...bulletins]
    setBulletins(updated)
    saveToFirebase('bulletins', updated)
    setNewBulletin('')
  }

  // Mark a bulletin as seen by a specific family member
  function markBulletinSeen(bulletinId, personName) {
    const updated = bulletins.map(b => {
      if (b.id !== bulletinId) return b
      const seenBy = Array.isArray(b.seenBy) ? b.seenBy : []
      if (seenBy.includes(personName)) return b // already marked
      return { ...b, seenBy: [...seenBy, personName] }
    })
    setBulletins(updated)
    saveToFirebase('bulletins', updated)
  }
  
  function deleteBulletin(id) {
    const updated = bulletins.filter(b => b.id !== id)
    setBulletins(updated)
    saveToFirebase('bulletins', updated)
  }

  // Compress an image file to a smaller JPEG data URL to keep Firebase lean.
  // Scales the long edge down to 800px and saves at 70% JPEG quality.
  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const maxDim = 800
          let w = img.width
          let h = img.height
          if (w > h && w > maxDim) {
            h = Math.round(h * (maxDim / w))
            w = maxDim
          } else if (h > maxDim) {
            w = Math.round(w * (maxDim / h))
            h = maxDim
          }
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, w, h)
          resolve(canvas.toDataURL('image/jpeg', 0.7))
        }
        img.onerror = reject
        img.src = e.target.result
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Gift wish list helpers
  function saveGifts(updated) {
    setGifts(updated)
    saveToFirebase('gifts', updated)
  }

  async function addGift() {
    const text = newGiftItem.trim()
    if (!text && !newGiftImage) {
      alert('Please add a description or a picture.')
      return
    }
    if (!newGiftKid) {
      alert('Please select whose wish list this gift is for.')
      return
    }
    const kidList = Array.isArray(gifts[newGiftKid]) ? gifts[newGiftKid] : []
    const updated = {
      ...gifts,
      [newGiftKid]: [...kidList, {
        id: Date.now(),
        text: text || '',
        image: newGiftImage || null
      }]
    }
    saveGifts(updated)
    setNewGiftItem('')
    setNewGiftImage(null)
  }

  async function handleGiftImageUpload(event) {
    const file = event.target.files[0]
    if (!file || !file.type.startsWith('image/')) return
    try {
      const compressed = await compressImage(file)
      setNewGiftImage(compressed)
    } catch (e) {
      alert('Could not process that image. Try a different one.')
      console.error(e)
    }
    // Reset the input so picking the same file again works
    event.target.value = ''
  }

  function deleteGift(kid, id) {
    const kidList = Array.isArray(gifts[kid]) ? gifts[kid] : []
    const updated = { ...gifts, [kid]: kidList.filter(g => g.id !== id) }
    saveGifts(updated)
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

  // Check a message against the flag keyword list; returns { flagged: boolean, categories: [] }
  function checkForFlags(text) {
    if (!text) return { flagged: false, categories: [] }
    const lower = text.toLowerCase()
    const hitCategories = []
    for (const [category, words] of Object.entries(FLAG_KEYWORDS)) {
      for (const word of words) {
        // Match as substring but require surrounding non-letter boundaries
        // for short words to reduce false positives (e.g., "sex" in "Essex")
        const pattern = new RegExp(`(^|[^a-z])${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`, 'i')
        if (pattern.test(lower)) {
          hitCategories.push(category)
          break
        }
      }
    }
    return { flagged: hitCategories.length > 0, categories: hitCategories }
  }

  // Log a chat exchange (user message + JARVIS reply) to Firebase.
  // ONLY logs the four kids' chats — Dad and Mom chats are NEVER logged.
  async function logChatExchange(userName, userText, assistantText, imageAttached) {
    // Privacy: adults' conversations are not recorded.
    if (userName === 'Dad' || userName === 'Mom') return

    const flagCheck = checkForFlags(userText)
    const entry = {
      id: Date.now(),
      user: userName,
      userText: userText || '',
      assistantText: assistantText || '',
      hadImage: !!imageAttached,
      timestamp: new Date().toISOString(),
      flagged: flagCheck.flagged,
      flagCategories: flagCheck.categories
    }
    // Save under chatlogs with a push so entries don't overwrite each other
    try {
      await firebase.push('chatlogs', entry)
    } catch (e) {
      console.error('Failed to log chat:', e)
    }
  }

  // Keep voiceEnabledRef in sync so the async send() always reads the live value
  // (state closures inside async functions can be stale)
  useEffect(() => { voiceEnabledRef.current = voiceEnabled }, [voiceEnabled])

  function afterSpeak() {
    setIsSpeaking(false)
    if (voiceEnabledRef.current && !loadingRef.current) {
      setTimeout(startListening, 700)
    }
  }

  function speakBrowser(clean) {
    if (typeof window === 'undefined' || !window.speechSynthesis) { afterSpeak(); return }
    const utter = new SpeechSynthesisUtterance(clean)
    utter.rate = 0.90
    utter.pitch = 0.68
    utter.volume = 1.0
    // Always use the voice locked at startup — never pick a random voice mid-session
    if (lockedVoiceRef.current) utter.voice = lockedVoiceRef.current
    utter.onstart = () => setIsSpeaking(true)
    utter.onend = afterSpeak
    utter.onerror = afterSpeak
    setTimeout(() => window.speechSynthesis.speak(utter), 50)
  }

  function speak(text, _retry = 0) {
    if (typeof window === 'undefined') return
    window.speechSynthesis?.cancel()
    if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null }

    const clean = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s+/g, '')
      .replace(/```[\s\S]*?```/g, 'code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\n\n+/g, '. ')
      .replace(/\n/g, ', ')
      .replace(/[•\-]\s+/g, '')
      .replace(/\d+\.\s+/g, '')
      .trim()

    setIsSpeaking(true)

    fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: clean })
    })
      .then(r => r.json())
      .then(data => {
        if (data.fallback || !data.audioContent) {
          if (_retry < 1) { setTimeout(() => speak(text, _retry + 1), 600); return }
          speakBrowser(clean); return
        }

        // Prefer AudioContext (works on iOS without a fresh gesture after async fetch)
        const actx = audioCtxRef.current
        if (actx && actx.state !== 'closed') {
          try {
            const raw = atob(data.audioContent)
            const bytes = new Uint8Array(raw.length)
            for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
            actx.decodeAudioData(bytes.buffer, (buffer) => {
              const src = actx.createBufferSource()
              src.buffer = buffer
              src.connect(actx.destination)
              src.onended = afterSpeak
              // Wrap so currentAudioRef.current.pause() works on stop
              currentAudioRef.current = { pause: () => { try { src.stop(0) } catch (_) {} }, _ctx: true }
              src.start(0)
            }, () => {
              if (_retry < 1) setTimeout(() => speak(text, _retry + 1), 600)
              else speakBrowser(clean)
            })
            return
          } catch (_) { /* fall through to Audio element */ }
        }

        // Fallback: HTMLAudioElement (works on non-iOS or when AudioContext unavailable)
        const audio = new Audio('data:audio/mp3;base64,' + data.audioContent)
        currentAudioRef.current = audio
        audio.onended = afterSpeak
        audio.onerror = () => {
          if (_retry < 1) setTimeout(() => speak(text, _retry + 1), 600)
          else speakBrowser(clean)
        }
        audio.play().catch(() => {
          if (_retry < 1) setTimeout(() => speak(text, _retry + 1), 600)
          else speakBrowser(clean)
        })
      })
      .catch(() => {
        if (_retry < 1) setTimeout(() => speak(text, _retry + 1), 600)
        else speakBrowser(clean)
      })
  }

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR || !voiceEnabledRef.current || loadingRef.current) return
    // Hard-stop any existing session before starting a new one
    try { recognitionRef.current?.abort() } catch (_) {}
    recognitionRef.current = null

    const rec = new SR()
    rec.lang = 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.continuous = false
    let gotResult = false
    let ended = false

    rec.onstart = () => { if (!isSpeakingRef.current) setIsListening(true) }

    rec.onresult = (e) => {
      gotResult = true
      const transcript = e.results[0][0].transcript.trim()
      setIsListening(false)

      // While JARVIS is speaking, only act on stop commands
      if (isSpeakingRef.current) {
        const lower = transcript.toLowerCase()
        const isStop = /^(stop|jarvis stop|stop it|be quiet|quiet|cancel|ok stop|okay stop|shut up|enough|stop talking)$/.test(lower)
        if (isStop) {
          window.speechSynthesis?.cancel()
          if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null }
          setIsSpeaking(false)
          isSpeakingRef.current = false
          if (voiceEnabledRef.current) setTimeout(startListening, 500)
        } else if (voiceEnabledRef.current) {
          setTimeout(startListening, 300)
        }
        return
      }

      if (transcript.length > 1) {
        send(transcript)
      } else if (voiceEnabledRef.current && !loadingRef.current) {
        setTimeout(startListening, 500)
      }
    }

    rec.onerror = (e) => {
      if (ended) return
      setIsListening(false)
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setVoiceEnabled(false)
        voiceEnabledRef.current = false
        alert('Microphone access was denied.\n\niOS: Settings → Privacy & Security → Microphone → enable Safari.\nChrome: click the lock icon in the address bar.')
      } else if (e.error === 'network') {
        alert('Speech recognition needs internet. On iOS, make sure Siri & Dictation is on in Settings.')
      } else if (e.error !== 'aborted' && voiceEnabledRef.current && !loadingRef.current) {
        setTimeout(startListening, 1800)
      }
    }

    rec.onend = () => {
      ended = true
      setIsListening(false)
      if (!gotResult && voiceEnabledRef.current && !loadingRef.current) {
        // Keep looping quickly during speech so user can say "stop" at any time
        setTimeout(startListening, isSpeakingRef.current ? 250 : 800)
      }
    }

    try {
      rec.start()
      recognitionRef.current = rec
    } catch (_) {
      setTimeout(startListening, 1000)
    }
  }

  function stopListening() {
    try { recognitionRef.current?.stop() } catch (_) {}
    setIsListening(false)
  }

  function stopVoice() {
    setVoiceEnabled(false)
    voiceEnabledRef.current = false
    window.speechSynthesis?.cancel()
    try { recognitionRef.current?.abort() } catch (_) {}
    setIsListening(false)
    setIsSpeaking(false)
  }

  // Must be called inside a user-gesture handler (button click, etc.)
  // Creates/resumes the AudioContext so subsequent audio.play() calls work on iOS
  function unlockAudio() {
    if (typeof window === 'undefined') return
    try {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return
      if (!audioCtxRef.current) audioCtxRef.current = new AC()
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume()
    } catch (_) {}
  }

  async function fetchTeamScore(sport, league, teamAbbr, teamName) {
    try {
      const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`
      const res = await fetch(url)
      const data = await res.json()
      for (const event of (data.events || [])) {
        const comp = event.competitions?.[0]
        const teams = comp?.competitors || []
        const match = teams.some(t =>
          t.team?.abbreviation?.toUpperCase() === teamAbbr.toUpperCase() ||
          t.team?.name?.toLowerCase().includes(teamAbbr.toLowerCase())
        )
        if (match) {
          const status = comp?.status?.type?.description || 'Scheduled'
          const home = teams.find(t => t.homeAway === 'home')
          const away = teams.find(t => t.homeAway === 'away')
          const awayName = away?.team?.shortDisplayName || away?.team?.name || '?'
          const homeName = home?.team?.shortDisplayName || home?.team?.name || '?'
          const awayScore = away?.score ?? ''
          const homeScore = home?.score ?? ''
          const scoreStr = (awayScore !== '' && homeScore !== '') ? ` ${awayScore}-${homeScore}` : ''
          return `${teamName}: ${awayName} @ ${homeName}${scoreStr} (${status})`
        }
      }
      return null
    } catch (_) {
      return null
    }
  }

  async function buildLiveContext(userInput) {
    const q = userInput.toLowerCase()
    const parts = []

    const wantsNews = q.includes('news') || q.includes('headline') || q.includes('fox')
    const wantsSports = q.includes('sport') || q.includes('score') || q.includes('game') ||
      q.includes('colts') || q.includes('thunder') || q.includes('wildcat') ||
      q.includes('reds') || q.includes('rams') || q.includes('nfl') || q.includes('nba') ||
      q.includes('mlb') || q.includes('basketball') || q.includes('football') || q.includes('baseball')
    const wantsCalendar = q.includes('calendar') || q.includes('schedule') || q.includes('today') ||
      q.includes('happening') || q.includes('plans') || q.includes('event') || q.includes('appointment') ||
      q.includes('do we have') || q.includes('monday') || q.includes('tuesday') || q.includes('wednesday') ||
      q.includes('thursday') || q.includes('friday') || q.includes('saturday') || q.includes('sunday') ||
      q.includes('this week') || q.includes('tomorrow') || q.includes('weekend') ||
      (q.includes('what') && q.includes('day'))
    const wantsWeather = q.includes('weather') || q.includes('forecast') || q.includes('temperature') ||
      q.includes('rain') || q.includes('snow') || q.includes('cold') || q.includes('hot') || q.includes('outside')

    const fetches = []

    if (wantsNews) {
      fetches.push(
        fetch('/api/news').then(r => r.json()).then(d => {
          if (d.headlines?.length) {
            parts.push('CURRENT FOX NEWS HEADLINES:\n' + d.headlines.map((h, i) => `${i + 1}. ${h}`).join('\n'))
          }
        }).catch(() => {})
      )
    }

    if (wantsSports) {
      fetches.push(
        Promise.all([
          fetchTeamScore('football', 'nfl', 'IND', 'Indianapolis Colts'),
          fetchTeamScore('football', 'nfl', 'LAR', 'Los Angeles Rams'),
          fetchTeamScore('basketball', 'nba', 'OKC', 'Oklahoma City Thunder'),
          fetchTeamScore('baseball', 'mlb', 'CIN', 'Cincinnati Reds'),
          fetchTeamScore('football', 'college-football', 'UK', 'Kentucky Wildcats Football'),
          fetchTeamScore('basketball', 'mens-college-basketball', 'UK', 'Kentucky Wildcats Basketball'),
        ]).then(scores => {
          const valid = scores.filter(Boolean)
          if (valid.length) parts.push('CURRENT/RECENT SPORTS SCORES:\n' + valid.join('\n'))
          else parts.push('SPORTS: No games currently in progress for the Colts, Rams, Thunder, Reds, or Kentucky Wildcats.')
        })
      )
    }

    if (wantsCalendar) {
      fetches.push(
        fetch('/api/calendar').then(r => r.json()).then(d => {
          if (d.events?.length) {
            // Group events by day name for a clear 7-day view
            const byDay = {}
            d.events.forEach(e => {
              if (!byDay[e.dayName]) byDay[e.dayName] = []
              byDay[e.dayName].push(`  • ${e.allDay ? 'All day' : e.time} — ${e.summary}`)
            })
            const lines = Object.entries(byDay).map(([day, evs]) => `${day.toUpperCase()}:\n${evs.join('\n')}`).join('\n\n')
            parts.push(`FAMILY CALENDAR (next 7 days):\n${lines}`)
          } else if (d.error) {
            parts.push('CALENDAR ERROR: ' + d.error)
          } else {
            parts.push('CALENDAR: No events found in the next 7 days.')
          }
        }).catch(() => {})
      )
    }

    if (wantsWeather) {
      fetches.push(
        fetch('https://api.open-meteo.com/v1/forecast?latitude=38.0406&longitude=-84.5037&current=temperature_2m,weathercode,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&windspeed_unit=mph&forecast_days=2')
          .then(r => r.json()).then(d => {
            const c = d.current
            const wc = { 0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast', 45: 'Foggy', 48: 'Foggy', 51: 'Drizzle', 61: 'Rain', 71: 'Snow', 80: 'Showers', 95: 'Thunderstorm' }
            const wi = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️', 51: '🌦️', 61: '🌧️', 71: '🌨️', 80: '🌦️', 95: '⛈️' }
            const tCode = d.daily.weathercode[1]
            const tHigh = Math.round(d.daily.temperature_2m_max[1])
            const tLow = Math.round(d.daily.temperature_2m_min[1])
            parts.push(
              `CURRENT WEATHER (Lexington, KY): ${wi[c.weathercode] || '🌡️'} ${wc[c.weathercode] || ''} | ${Math.round(c.temperature_2m)}°F | Wind ${Math.round(c.windspeed_10m)}mph\n` +
              `TOMORROW: ${wi[tCode] || '🌡️'} ${wc[tCode] || ''} | High ${tHigh}°F / Low ${tLow}°F`
            )
          }).catch(() => {})
      )
    }

    await Promise.all(fetches)
    if (!parts.length) return ''
    return (
      '\n\n--- LIVE DATA (fetched right now, use this to answer the user) ---\n' +
      parts.join('\n\n') +
      '\n--- END LIVE DATA ---\n' +
      '\nCRITICAL: The data above is REAL and was fetched live this instant. ' +
      'Use it to answer the question directly. Do NOT say you cannot access real-time information or the internet — you have it right there. ' +
      'Relay it naturally in your JARVIS butler voice.\n' +
      'CALENDAR RULE: For any calendar question, ONLY report events that are explicitly listed in the FAMILY CALENDAR section above. ' +
      'NEVER invent, guess, assume, or suggest any appointments, practices, games, or activities — even if they seem plausible given what you know about the family. ' +
      'If a specific day has no events listed above, say exactly that: "I don\'t see anything on the calendar for that day." ' +
      'Do not fill in gaps with family knowledge (e.g. do not say "Lincoln probably has practice" or invent a time).'
    )
  }

  async function send(voiceInput) {
    const textToSend = typeof voiceInput === 'string' ? voiceInput : input
    if ((!textToSend.trim() && !uploadedImage) || loading) return

    // Stop any currently playing audio so user's message interrupts JARVIS
    if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null }
    window.speechSynthesis?.cancel()
    setIsSpeaking(false)

    // Unlock AudioContext within the gesture so async TTS playback works on iOS
    unlockAudio()
    if (voiceEnabledRef.current && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(''))
    }

    const userMsg = {
      role: 'user',
      content: textToSend || (uploadedImage ? "Can you help me solve this math problem step by step?" : ""),
      name: user,
      image: imagePreview
    }

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    const userInput = textToSend.toLowerCase()
    setInput('')
    setLoading(true)

    // Detect shopping list add commands and execute them immediately
    let shoppingActionNote = ''
    const shopAddMatch = userInput.match(
      /(?:(?:please\s+)?(?:add|put|can you add|jarvis[,\s]+add)\s+(.+?)\s+(?:to|on|onto)\s+(?:the\s+)?(?:shopping|grocery|shop)\s*(?:list)?(?:\s+for me)?$)/i
    ) || userInput.match(
      /^(?:add|put)\s+(.+?)\s+(?:to|on)\s+(?:(?:my|our|the)\s+)?(?:shopping|grocery|shop|list)/i
    )
    if (shopAddMatch) {
      const raw = shopAddMatch[1].trim().replace(/^(some|a|an|the)\s+/i, '')
      const itemText = raw.charAt(0).toUpperCase() + raw.slice(1)
      const newItem = { id: Date.now(), text: itemText, cat: 'OTHER', done: false }
      const updatedShopping = [...shopping, newItem]
      saveShopping(updatedShopping)
      shoppingActionNote = `\n\nSHOPPING LIST ACTION COMPLETED: You have just added "${itemText}" to the family shopping list in real time. Tell the user you've added it — do not say you "will" add it or ask them to go to the Shopping tab. It is already done.`
    }

    try {
      const liveContext = await buildLiveContext(userInput)
      const activeContext = (user === 'Dad' || user === 'Mom')
        ? FAMILY_CONTEXT_ADULTS
        : FAMILY_CONTEXT_KIDS
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, user, context: activeContext + liveContext + shoppingActionNote })
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'assistant', content: data.reply, name: 'JARVIS' }])
      logChatExchange(user, userMsg.content, data.reply, !!uploadedImage)
      if (voiceEnabledRef.current) speak(data.reply)
      setLoading(false)
      if (uploadedImage) clearImage()
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'System error. Please try again.', name: 'JARVIS' }])
      logChatExchange(user, userMsg.content, 'System error.', !!uploadedImage)
      setLoading(false)
    }
  }

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const filteredShopping = shopFilter === 'ALL' ? shopping : shopping.filter(i => i.cat === shopFilter)
  const totalChoresDone = Object.values(chores).flat().filter(c => c.done).length
  const totalChores = Object.values(chores).flat().length

  // Ambient chat: separate history log from the displayed JARVIS response
  const lastAsstIdx = messages.map(m => m.role).lastIndexOf('assistant')
  const chatLogMessages = messages.filter((_, i) => i !== lastAsstIdx)
  const latestAsstMsg = lastAsstIdx >= 0 ? messages[lastAsstIdx] : null

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

      {/* Lightbox — shows a tapped gift image full-size with a close button */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            cursor: 'pointer',
            animation: 'notifySlide 0.2s ease-out'
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxImage(null) }}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              fontSize: 24,
              width: 44,
              height: 44,
              borderRadius: 22,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              padding: 0
            }}
            title="Close"
          >×</button>
          <img
            src={lightboxImage}
            alt="Gift"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '95%',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 8,
              boxShadow: '0 4px 40px rgba(0,180,255,0.3)'
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: 20,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 11,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: 2,
            textTransform: 'uppercase',
            pointerEvents: 'none'
          }}>
            Tap anywhere to close
          </div>
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
              <button
                className={`voice-toggle${voiceEnabled ? ' on' : ''}`}
                onClick={() => {
                  if (voiceEnabled) {
                    stopVoice()
                  } else {
                    unlockAudio()
                    setVoiceEnabled(true)
                    voiceEnabledRef.current = true
                    if (typeof window !== 'undefined' && window.speechSynthesis) {
                      window.speechSynthesis.speak(new SpeechSynthesisUtterance(''))
                    }
                    setTimeout(startListening, 300)
                  }
                }}
                title={voiceEnabled ? 'Voice on — tap to disable' : 'Enable voice mode'}
              >{voiceEnabled ? (isSpeaking ? '🔊 SPEAKING' : isListening ? '👂 LISTENING' : '🎙 VOICE ON') : '🎙 VOICE OFF'}</button>
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
          {['dashboard', 'chat', 'gifts', 'shopping', 'calendar'].map(t => (
            <button key={t} className={`nav-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t === 'dashboard' ? '⬡ HOME' : t === 'chat' ? '◈ CHAT' : t === 'gifts' ? '🎁 GIFTS' : t === 'shopping' ? '⊕ SHOPPING' : '◷ CALENDAR'}
            </button>
          ))}
        </div>

        {/* USER BAR (chat only — shown once a user is selected) */}
        {tab === 'chat' && userSelected && (
          <div className="user-bar">
            <button
              className="user-btn"
              onClick={() => { setUserSelected(false); setMessages([]); setAdultChatUnlocked(false) }}
              title="Switch user"
              style={{ borderColor: 'rgba(0,180,255,0.3)' }}
            >
              ← SWITCH USER
            </button>
            <button
              className="user-btn"
              onClick={() => setTab('parents')}
              style={{ borderColor: 'rgba(255,180,0,0.4)', color: 'rgba(255,200,80,0.9)' }}
              title="Parent review (password required)"
            >
              🔒 PARENTS
            </button>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: 4,
              fontSize: 11,
              color: 'rgba(255,180,0,0.55)',
              letterSpacing: 1,
              fontWeight: 600,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap'
            }}>
              Chatting as <span style={{ color: '#ffcc00', marginLeft: 6 }}>{user}</span>
            </div>
          </div>
        )}

        {/* ── DASHBOARD TAB ── */}
        {tab === 'dashboard' && (
          <div className="dashboard">
            <div className="dash-row" style={{ gridTemplateColumns: '1fr 1fr', gap: 10, display: 'grid' }}>
              {/* Date */}
              <div className="dash-card">
                <div className="dash-card-label">TODAY</div>
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
            </div>

            {/* Today's Events - Working Calendar Widget (Rebuilt) */}
            <div className="dash-card">
              <div className="dash-card-label">TODAY'S EVENTS</div>
              
              {/* The SAME calendar widget that worked before, but bigger */}
              <iframe 
                key={calendarCacheBust}
                src={`https://calendar.google.com/calendar/embed?mode=AGENDA&height=200&wkst=1&bgcolor=%23FFFFFF&src=uktweeter19%40gmail.com&src=family021430976716499641216%40group.calendar.google.com&src=98vibj87ujjb3cm68lo4jatcghv2dq16%40import.calendar.google.com&color=%23039BE5&color=%2333B679&color=%23F4511E&ctz=America%2FNew_York&showTitle=0&showNav=0&showDate=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0&_cb=${calendarCacheBust}`}
                style={{
                  width: '100%',
                  height: '180px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#fff'
                }}
                title="Today's Events from Calendar"
              />
            </div>

            {/* Family Bulletin Board - Directly under calendar */}
            <div className="dash-card">
              <div className="dash-card-label">
                FAMILY BULLETIN BOARD
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginLeft: 8 }}>
                  ({bulletins.length} announcements)
                </span>
              </div>
              
              {/* Quick Post Form */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' }}>
                  Posting as
                </div>
                <select
                  value={bulletinAuthor}
                  onChange={e => setBulletinAuthor(e.target.value)}
                  className="shop-cat-select"
                  style={{ width: '100%', fontSize: 13 }}
                >
                  <option value="">-- Select your name --</option>
                  {family.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="bulletin-form">
                <textarea 
                  className="bulletin-input" 
                  placeholder={bulletinAuthor ? `Post an announcement as ${bulletinAuthor}...` : 'Select who you are first...'}
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
                  {bulletins.slice(0, 5).map(bulletin => {
                    const seenBy = Array.isArray(bulletin.seenBy) ? bulletin.seenBy : [bulletin.author]
                    const unseenBy = family.filter(name => !seenBy.includes(name))
                    const isFullySeen = unseenBy.length === 0
                    return (
                      <div
                        key={bulletin.id}
                        className="bulletin-item"
                        style={!isFullySeen ? {
                          background: 'rgba(255,180,0,0.10)',
                          border: '1px solid rgba(255,180,0,0.35)',
                          borderLeft: '3px solid #ffb400',
                          boxShadow: '0 0 10px rgba(255,180,0,0.15)',
                          flexDirection: 'column',
                          alignItems: 'stretch'
                        } : { flexDirection: 'column', alignItems: 'stretch' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <div className="bulletin-content">
                            <div className={isFullySeen ? 'bulletin-text' : 'bulletin-text-unread'}>{bulletin.text}</div>
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

                        {!isFullySeen && (
                          <>
                            {/* Clear instruction line */}
                            <div style={{
                              marginTop: 10,
                              paddingTop: 10,
                              borderTop: '1px dashed rgba(255,180,0,0.3)',
                              fontSize: 11,
                              color: '#ffb400',
                              fontWeight: 700,
                              letterSpacing: 0.5,
                              textAlign: 'center',
                              textTransform: 'uppercase'
                            }}>
                              👇 Click your name below to confirm you've read this
                            </div>

                            {/* Unseen — needs to click */}
                            <div style={{ marginTop: 8 }}>
                              <div style={{
                                fontSize: 9,
                                fontWeight: 700,
                                letterSpacing: 1,
                                color: 'rgba(255,180,0,0.9)',
                                textTransform: 'uppercase',
                                marginBottom: 5
                              }}>
                                Hasn't read it yet:
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {unseenBy.map(name => (
                                  <button
                                    key={name}
                                    onClick={() => markBulletinSeen(bulletin.id, name)}
                                    style={{
                                      background: 'transparent',
                                      color: '#ffb400',
                                      border: '2px solid #ffb400',
                                      fontSize: 11,
                                      fontWeight: 700,
                                      padding: '6px 14px',
                                      borderRadius: 16,
                                      letterSpacing: 0.5,
                                      cursor: 'pointer',
                                      textTransform: 'uppercase',
                                      boxShadow: '0 0 10px rgba(255,180,0,0.5)',
                                      animation: 'bulletinUnseenPulse 2s ease-in-out infinite'
                                    }}
                                  >
                                    {name}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Seen — already confirmed */}
                            {seenBy.length > 0 && (
                              <div style={{ marginTop: 10 }}>
                                <div style={{
                                  fontSize: 9,
                                  fontWeight: 700,
                                  letterSpacing: 1,
                                  color: 'rgba(0,200,100,0.7)',
                                  textTransform: 'uppercase',
                                  marginBottom: 5
                                }}>
                                  ✓ Already read by:
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                  {seenBy.map(name => (
                                    <span
                                      key={name}
                                      style={{
                                        background: 'rgba(0,200,100,0.12)',
                                        color: 'rgba(0,200,100,0.85)',
                                        border: '1px solid rgba(0,200,100,0.3)',
                                        fontSize: 10,
                                        fontWeight: 600,
                                        padding: '4px 10px',
                                        borderRadius: 14,
                                        letterSpacing: 0.5,
                                        textTransform: 'uppercase'
                                      }}
                                    >
                                      ✓ {name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {isFullySeen && seenBy.length > 1 && (
                          <div style={{
                            marginTop: 6,
                            fontSize: 10,
                            color: 'rgba(0,200,100,0.7)',
                            letterSpacing: 1,
                            textTransform: 'uppercase',
                            fontWeight: 600
                          }}>
                            ✓ Read by everyone
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {bulletins.length > 5 && (
                    <div style={{ fontSize: 10, color: 'rgba(0,180,255,0.4)', textAlign: 'center', padding: 4 }}>
                      +{bulletins.length - 5} more announcements
                    </div>
                  )}
                </div>
              )}
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

            {/* Bible Fact of the Day */}
            <div className="dash-card">
              <div className="dash-card-label">
                BIBLE FACT OF THE DAY
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginLeft: 8 }}>
                  ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                </span>
              </div>
              <div style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1.6,
                padding: '8px 0'
              }}>
                ✝️ {dailyBibleFact}
              </div>
            </div>

            {/* U.S. History Fact of the Day */}
            <div className="dash-card">
              <div className="dash-card-label">
                U.S. HISTORY FACT
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginLeft: 8 }}>
                  ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                </span>
              </div>
              <div style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1.6,
                padding: '8px 0'
              }}>
                🇺🇸 {dailyHistoryFact}
              </div>
            </div>

            {/* Family Countdowns */}
            <div className="dash-card">
              <div className="dash-card-label">FAMILY COUNTDOWNS</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {countdowns.length === 0 ? (
                  <div style={{ 
                    fontSize: '11px', 
                    color: 'rgba(255,255,255,0.4)', 
                    textAlign: 'center',
                    fontStyle: 'italic',
                    padding: '12px 0'
                  }}>
                    No upcoming events
                  </div>
                ) : (
                  countdowns.map((countdown, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '16px' }}>{countdown.emoji}</span>
                        <span style={{ 
                          fontSize: '12px', 
                          color: 'rgba(255,255,255,0.85)',
                          fontWeight: '500'
                        }}>{countdown.name}</span>
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: countdown.daysLeft === 0 ? '#ff6b35' : countdown.daysLeft <= 7 ? '#ff6b35' : '#0056b3',
                        fontWeight: '600',
                        padding: '3px 8px',
                        background: countdown.daysLeft === 0 ? 'rgba(255,107,53,0.2)' : countdown.daysLeft <= 7 ? 'rgba(255,107,53,0.15)' : 'rgba(0,86,179,0.15)',
                        borderRadius: '12px',
                        border: countdown.daysLeft === 0 ? '1px solid rgba(255,107,53,0.4)' : countdown.daysLeft <= 7 ? '1px solid rgba(255,107,53,0.3)' : '1px solid rgba(0,86,179,0.3)'
                      }}>
                        {countdown.daysLeft === 0 ? '🎉 TODAY!' : countdown.daysLeft === 1 ? 'TOMORROW!' : `${countdown.daysLeft} DAYS`}
                      </div>
                    </div>
                  ))
                )}
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

        {/* ── CHAT TAB — USER PICKER (shown before user selects who they are) ── */}
        {tab === 'chat' && !userSelected && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 20px', overflow: 'auto' }}>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: 4, color: '#00b4ff', textShadow: '0 0 20px rgba(0,180,255,0.5)', marginBottom: 6 }}>
              WHO'S CHATTING?
            </div>
            <div style={{ fontSize: 10, color: 'rgba(0,180,255,0.5)', letterSpacing: 2, marginBottom: 28, textTransform: 'uppercase' }}>
              Select your name to begin
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 360 }}>
              {family.map(f => {
                const isAdult = f === 'Dad' || f === 'Mom'
                return (
                  <button
                    key={f}
                    onClick={() => {
                      setUser(f)
                      setUserSelected(true)
                      setMessages([])
                      // For kids, auto-start voice immediately (adults have password screen next)
                      if (f !== 'Dad' && f !== 'Mom') {
                        unlockAudio()
                        setVoiceEnabled(true)
                        voiceEnabledRef.current = true
                        if (typeof window !== 'undefined' && window.speechSynthesis) {
                          window.speechSynthesis.speak(new SpeechSynthesisUtterance(''))
                          const greeting = `Hello ${f}, JARVIS online. How can I help you today?`
                          setTimeout(() => speak(greeting), 180)
                        }
                      }
                    }}
                    style={{
                      padding: '18px 12px',
                      background: isAdult
                        ? 'linear-gradient(135deg, rgba(0,86,179,0.3), rgba(0,53,128,0.2))'
                        : 'linear-gradient(135deg, rgba(0,180,255,0.12), rgba(0,86,179,0.08))',
                      border: isAdult ? '1px solid rgba(255,180,0,0.4)' : '1px solid rgba(0,180,255,0.3)',
                      borderRadius: 12,
                      color: '#fff',
                      fontFamily: "'Rajdhani',sans-serif",
                      fontSize: 18,
                      fontWeight: 700,
                      letterSpacing: 2,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 12px rgba(0,86,179,0.2)'
                    }}
                  >
                    {isAdult && <span style={{ display: 'block', fontSize: 10, color: 'rgba(255,200,80,0.8)', letterSpacing: 1, marginBottom: 4 }}>🔒 PASSWORD</span>}
                    {f}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setTab('parents')}
              style={{
                marginTop: 24,
                background: 'transparent',
                border: '1px solid rgba(255,180,0,0.3)',
                color: 'rgba(255,200,80,0.8)',
                padding: '10px 24px',
                borderRadius: 10,
                fontFamily: "'Inter',sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 2,
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              🔒 Parent Review
            </button>
          </div>
        )}

        {/* ── CHAT TAB — ADULT PASSWORD LOCK ── */}
        {tab === 'chat' && userSelected && (user === 'Dad' || user === 'Mom') && !adultChatUnlocked && (
          <div className="parent-lock">
            <div className="parent-lock-title">🔒 {user.toUpperCase()} CHAT</div>
            <div className="parent-lock-sub">Password required</div>
            <input
              className="parent-lock-input"
              type="password"
              placeholder="••••"
              value={adultChatPassInput}
              onChange={e => setAdultChatPassInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && adultChatPassInput === PARENT_PASSWORD) {
                  unlockAudio()
                  setAdultChatUnlocked(true)
                  setAdultChatPassInput('')
                  setMessages([])
                  setVoiceEnabled(true)
                  voiceEnabledRef.current = true
                  if (typeof window !== 'undefined' && window.speechSynthesis) {
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance(''))
                    const greeting = user === 'Dad' ? 'Good day, sir. JARVIS at your disposal.' : 'Good day, ma\'am. How may I assist?'
                    setTimeout(() => speak(greeting), 180)
                  }
                }
              }}
              autoFocus
            />
            <button
              className="parent-lock-btn"
              onClick={() => {
                if (adultChatPassInput === PARENT_PASSWORD) {
                  unlockAudio()
                  setAdultChatUnlocked(true)
                  setAdultChatPassInput('')
                  setMessages([])
                  setVoiceEnabled(true)
                  voiceEnabledRef.current = true
                  if (typeof window !== 'undefined' && window.speechSynthesis) {
                    window.speechSynthesis.speak(new SpeechSynthesisUtterance(''))
                    const greeting = user === 'Dad' ? 'Good day, sir. JARVIS at your disposal.' : 'Good day, ma\'am. How may I assist?'
                    setTimeout(() => speak(greeting), 180)
                  }
                }
              }}
            >UNLOCK</button>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 8, letterSpacing: 1, textAlign: 'center', maxWidth: 260, lineHeight: 1.5 }}>
              Your conversation is private and not logged.
            </div>
            <button
              className="reset-btn"
              onClick={() => { setUserSelected(false); setAdultChatPassInput('') }}
              style={{ marginTop: 4 }}
            >← Back</button>
          </div>
        )}

        {tab === 'chat' && userSelected && !((user === 'Dad' || user === 'Mom') && !adultChatUnlocked) && (
          <>
            <div className="jarvis-chat">
              {/* Compact scrollable history log */}
              {chatLogMessages.length > 0 && (
                <>
                  <div className="chat-log">
                    {chatLogMessages.map((m, i) => (
                      <div key={i} className={`log-entry ${m.role}`}>
                        {m.role === 'user'
                          ? `› ${m.name}: ${m.image ? '[img] ' : ''}${m.content}`
                          : `J · ${m.content}`
                        }
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>
                  <div className="log-sep" />
                </>
              )}

              {/* Main ambient JARVIS display */}
              <div className="jarvis-display">
                {/* Canvas particle orb — full-screen background */}
                <div className={`orb-section${isSpeaking ? ' speaking' : loading ? ' thinking' : isListening ? ' listening' : ''}`}>
                  <canvas ref={orbCanvasRef} />
                </div>

                {/* All content overlays the full-screen canvas */}
                <div className="jarvis-display-content">
                  {/* Status labels */}
                  {isListening && <div className="listen-label">Listening...</div>}

                  {/* Welcome / idle state */}
                  {messages.length === 0 && !loading && !isListening && (
                    <div className="jarvis-idle">
                      <h2>SYSTEMS ONLINE</h2>
                      <p>Good to see you, {user}. All systems operational. How may I assist?</p>
                    </div>
                  )}

                  {/* Processing / thinking state */}
                  {loading && (
                    <div className="proc-wrap">
                      <div className="waveform processing">
                        {[...Array(12)].map((_, i) => <div key={i} className="wave-bar" />)}
                      </div>
                      <div className="proc-label">Analyzing query...</div>
                    </div>
                  )}

                  {/* Latest JARVIS response with typewriter */}
                  {!loading && latestAsstMsg && (
                    <>
                      <div className="j-label">J · A · R · V · I · S</div>
                      <div className={`waveform ${isTyping ? 'active' : 'idle'}`}>
                        {[...Array(12)].map((_, i) => <div key={i} className="wave-bar" />)}
                      </div>
                      {latestAsstMsg.image && (
                        <img
                          src={latestAsstMsg.image}
                          alt="Uploaded math problem"
                          style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 10, border: '1px solid rgba(0,180,255,0.3)' }}
                        />
                      )}
                      <div className="response-text">
                        {displayedText}
                        {isTyping && <span className="typing-cursor" />}
                      </div>
                    </>
                  )}
                </div>
              </div>
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
                    width: '42px',
                    height: '42px',
                    background: 'linear-gradient(135deg,#004088,#0090ff)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)',
                    color: 'white',
                    fontSize: '16px',
                    boxShadow: '0 0 16px rgba(0,150,255,0.35)',
                    marginRight: '8px'
                  }}
                  title="Upload math problem image"
                >📷</button>
                <div className="input-wrap">
                  <textarea value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                    placeholder={isListening ? 'Listening...' : (typeof navigator !== 'undefined' && /iP(hone|ad|od)/.test(navigator.userAgent)) ? 'Tap 🎤 on keyboard to speak...' : 'Awaiting your command...'} rows={1} style={{ lineHeight: '20px' }} />
                </div>
                {/* Mic button — hidden on iOS Safari where mic permission isn't available */}
                {!(typeof navigator !== 'undefined' && /iP(hone|ad|od)/.test(navigator.userAgent)) && (
                  <button
                    className={`mic-btn${isListening ? ' listening' : ''}`}
                    onClick={isListening ? stopListening : startListening}
                    title={isListening ? 'Stop listening' : 'Speak to JARVIS'}
                    disabled={loading}
                  >🎤</button>
                )}
                <button className="send-btn" onClick={() => send()} disabled={loading}>➤</button>
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
              key={calendarCacheBust}
              src={`https://calendar.google.com/calendar/embed?src=uktweeter19%40gmail.com&src=family021430976716499641216%40group.calendar.google.com&src=98vibj87ujjb3cm68lo4jatcghv2dq16%40import.calendar.google.com&ctz=America%2FNew_York&_cb=${calendarCacheBust}`} 
              className="calendar-iframe"
              title="Family Calendar"
            />
          </div>
        )}

        {tab === 'gifts' && (
          <div className="chores-panel">
            <div className="section-header">
              <div className="section-title">🎁 Gift Wish List</div>
              <div className="section-count">{Object.values(gifts).flat().length} items</div>
            </div>

            {/* Add form at top — pick who the gift is for */}
            <div className="kid-block" style={{ background: 'rgba(0,86,179,0.08)', border: '1px solid rgba(0,86,179,0.25)' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>
                Add a gift to someone's wish list
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <select
                  value={newGiftKid}
                  onChange={e => setNewGiftKid(e.target.value)}
                  className="shop-cat-select"
                  style={{ width: '100%', fontSize: 13 }}
                >
                  <option value="">-- Whose wish list? --</option>
                  {KIDS.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    className="add-chore-input"
                    placeholder={newGiftKid ? `What does ${newGiftKid} want?` : 'Select who first...'}
                    value={newGiftItem}
                    onChange={e => setNewGiftItem(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addGift()}
                  />
                </div>

                {/* Image upload row */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    id="gift-image-upload"
                    style={{ display: 'none' }}
                    onChange={handleGiftImageUpload}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('gift-image-upload').click()}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(0,180,255,0.3)',
                      color: 'rgba(0,180,255,0.8)',
                      padding: '7px 12px',
                      borderRadius: 8,
                      fontFamily: "'Inter',sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: 0.5,
                      cursor: 'pointer',
                      flex: newGiftImage ? '0 0 auto' : 1
                    }}
                  >
                    📷 {newGiftImage ? 'Change photo' : 'Add a photo (optional)'}
                  </button>
                  {newGiftImage && (
                    <>
                      <img
                        src={newGiftImage}
                        alt="Gift preview"
                        style={{
                          width: 50,
                          height: 50,
                          objectFit: 'cover',
                          borderRadius: 6,
                          border: '1px solid rgba(0,180,255,0.3)'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setNewGiftImage(null)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'rgba(255,80,80,0.7)',
                          fontSize: 18,
                          cursor: 'pointer',
                          padding: '0 4px'
                        }}
                        title="Remove photo"
                      >×</button>
                    </>
                  )}
                </div>

                <button className="add-btn" onClick={addGift} style={{ width: '100%', marginTop: 2 }}>+ ADD TO WISH LIST</button>
              </div>
            </div>

            {/* One block per kid with their wish list */}
            {KIDS.map(kid => {
              const kidGifts = gifts[kid] || []
              return (
                <div key={kid} className="kid-block">
                  <div className="kid-name">
                    {kid.toUpperCase()}
                    <span className="kid-badge" style={{ background: 'rgba(255,180,0,0.15)', color: '#ffb400', border: '1px solid rgba(255,180,0,0.3)' }}>
                      {kidGifts.length} {kidGifts.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  {kidGifts.length === 0 && <div className="empty-state">NO GIFTS ON WISH LIST YET</div>}
                  {kidGifts.map(g => (
                    <div key={g.id} className="chore-item" style={{ alignItems: 'center', gap: 10 }}>
                      {g.image ? (
                        <img
                          src={g.image}
                          alt={g.text || 'Gift'}
                          style={{
                            width: 54,
                            height: 54,
                            objectFit: 'cover',
                            borderRadius: 6,
                            border: '1px solid rgba(255,180,0,0.3)',
                            flexShrink: 0,
                            cursor: 'pointer'
                          }}
                          onClick={() => setLightboxImage(g.image)}
                          title="Tap to view larger"
                        />
                      ) : (
                        <span style={{ fontSize: 22, marginRight: 2 }}>🎁</span>
                      )}
                      <span className="chore-text" style={{ flex: 1 }}>
                        {g.text || <span style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>(photo only)</span>}
                      </span>
                      <button className="chore-del" onClick={() => deleteGift(kid, g.id)}>×</button>
                    </div>
                  ))}
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

        {/* ── PARENT REVIEW TAB ── */}
        {tab === 'parents' && (
          <div className="parent-panel">
            {!parentUnlocked ? (
              <div className="parent-lock">
                <div className="parent-lock-title">🔒 PARENT REVIEW</div>
                <div className="parent-lock-sub">Enter parent password</div>
                <input
                  className="parent-lock-input"
                  type="password"
                  placeholder="••••"
                  value={parentPassInput}
                  onChange={e => setParentPassInput(e.target.value)}
                  onKeyDown={async e => {
                    if (e.key === 'Enter' && parentPassInput === PARENT_PASSWORD) {
                      setParentUnlocked(true)
                      setParentPassInput('')
                      const logs = await firebase.get('chatlogs')
                      if (logs) {
                        const arr = Object.values(logs).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        setChatLogs(arr)
                      }
                    }
                  }}
                />
                <button
                  className="parent-lock-btn"
                  onClick={async () => {
                    if (parentPassInput === PARENT_PASSWORD) {
                      setParentUnlocked(true)
                      setParentPassInput('')
                      const logs = await firebase.get('chatlogs')
                      if (logs) {
                        const arr = Object.values(logs).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        setChatLogs(arr)
                      }
                    }
                  }}
                >UNLOCK</button>
                <button
                  className="reset-btn"
                  onClick={() => { setTab('chat'); setParentPassInput('') }}
                  style={{ marginTop: 4 }}
                >← Back to chat</button>
              </div>
            ) : (
              <>
                <div className="section-header">
                  <div className="section-title">Parent Review</div>
                  <button
                    className="reset-btn"
                    onClick={() => { setParentUnlocked(false); setChatLogs([]); setTab('chat') }}
                  >LOCK</button>
                </div>

                {/* Summary stats */}
                <div className="parent-summary">
                  <div className="parent-stat">
                    <div className="parent-stat-num">{chatLogs.length}</div>
                    <div className="parent-stat-label">Total</div>
                  </div>
                  <div className="parent-stat">
                    <div className="parent-stat-num flag">{chatLogs.filter(l => l.flagged).length}</div>
                    <div className="parent-stat-label">Flagged</div>
                  </div>
                  <div className="parent-stat">
                    <div className="parent-stat-num">{new Set(chatLogs.map(l => l.user)).size}</div>
                    <div className="parent-stat-label">Users</div>
                  </div>
                </div>

                {/* Filter buttons */}
                <div className="parent-filters">
                  <button
                    className={`cat-btn${parentViewFilter === 'ALL' ? ' active' : ''}`}
                    onClick={() => setParentViewFilter('ALL')}
                  >ALL</button>
                  <button
                    className={`cat-btn${parentViewFilter === 'FLAGGED' ? ' active' : ''}`}
                    onClick={() => setParentViewFilter('FLAGGED')}
                    style={parentViewFilter === 'FLAGGED' ? { borderColor: '#ff5050', background: 'rgba(255,80,80,0.15)' } : {}}
                  >⚠️ FLAGGED</button>
                  {['Lincoln', 'Camille', 'Cicily', 'Carter', 'Dad', 'Mom'].map(u => (
                    <button
                      key={u}
                      className={`cat-btn${parentViewFilter === u ? ' active' : ''}`}
                      onClick={() => setParentViewFilter(u)}
                    >{u.toUpperCase()}</button>
                  ))}
                </div>

                {/* Refresh + Clear buttons */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <button
                    className="add-btn"
                    onClick={async () => {
                      const logs = await firebase.get('chatlogs')
                      if (logs) {
                        const arr = Object.values(logs).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        setChatLogs(arr)
                      } else {
                        setChatLogs([])
                      }
                    }}
                  >🔄 REFRESH</button>
                  <button
                    className="parent-delete-btn"
                    onClick={async () => {
                      if (confirm('Delete ALL chat logs? This cannot be undone.')) {
                        await firebase.delete('chatlogs')
                        setChatLogs([])
                      }
                    }}
                  >CLEAR ALL LOGS</button>
                </div>

                {/* Log list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(() => {
                    const filtered = chatLogs.filter(log => {
                      if (parentViewFilter === 'ALL') return true
                      if (parentViewFilter === 'FLAGGED') return log.flagged
                      return log.user === parentViewFilter
                    })
                    if (filtered.length === 0) {
                      return <div className="empty-state">NO LOGS FOR THIS FILTER</div>
                    }
                    return filtered.map(log => (
                      <div key={log.id} className={`log-entry${log.flagged ? ' flagged' : ''}`}>
                        <div className="log-header">
                          <div>
                            <span className="log-user">{log.user}</span>
                            {log.flagged && log.flagCategories && log.flagCategories.map(cat => (
                              <span key={cat} className="log-flag-tag">⚠️ {cat}</span>
                            ))}
                            {log.hadImage && <span className="log-flag-tag" style={{ background: 'rgba(0,180,255,0.15)', color: '#00b4ff', borderColor: 'rgba(0,180,255,0.3)' }}>📷 IMG</span>}
                          </div>
                          <span className="log-time">
                            {new Date(log.timestamp).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="log-label">{log.user} said:</div>
                        <div className="log-user-msg">{log.userText || '(no text — image only)'}</div>
                        <div className="log-label">JARVIS replied:</div>
                        <div className="log-assistant-msg">{log.assistantText}</div>
                      </div>
                    ))
                  })()}
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </>
  )
}
