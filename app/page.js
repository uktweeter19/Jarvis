'use client'
import { useState, useRef, useEffect } from 'react'

const PASSWORD = 'deatherage2024'

const FAMILY_CONTEXT = `You are JARVIS, the intelligent family assistant for the Deatherage family in Kentucky. You are helpful, warm, and efficient. Family members: Kevin (Dad), Mom, Cicily, Camille, Carter, Emily, Millie, Kevo. Carter plays football at Lincoln. Kevin is saving for his daughter's college at University of Kentucky. Keep responses concise and conversational.`

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;600;700&family=Share+Tech+Mono&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#020b18;overflow:hidden;}
  ::-webkit-scrollbar{width:3px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:#1a4a6e;}
  .arc-bg{position:fixed;inset:0;background:radial-gradient(ellipse at 50% 50%, #0a1f35 0%, #020b18 70%);z-index:0;}
  .arc-bg::before{content:'';position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(0,180,255,0.03) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(0,180,255,0.03) 40px);}
  .arc-bg::after{content:'';position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:600px;height:600px;background:radial-gradient(circle,rgba(0,120,255,0.04) 0%,transparent 70%);border-radius:50%;pointer-events:none;}
  .corner{position:fixed;width:80px;height:80px;opacity:0.4;pointer-events:none;z-index:1;}
  .corner.tl{top:0;left:0;border-top:1px solid #00b4ff;border-left:1px solid #00b4ff;}
  .corner.tr{top:0;right:0;border-top:1px solid #00b4ff;border-right:1px solid #00b4ff;}
  .corner.bl{bottom:0;left:0;border-bottom:1px solid #00b4ff;border-left:1px solid #00b4ff;}
  .corner.br{bottom:0;right:0;border-bottom:1px solid #00b4ff;border-right:1px solid #00b4ff;}
  .scan{position:fixed;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(0,180,255,0.6),transparent);animation:scanMove 4s linear infinite;z-index:1;pointer-events:none;}
  @keyframes scanMove{0%{top:-2px;}100%{top:100vh;}}
  .app{position:relative;z-index:2;height:100dvh;display:flex;flex-direction:column;max-width:900px;margin:0 auto;font-family:'Share Tech Mono',monospace;}
  .header{padding:10px 20px;border-bottom:1px solid rgba(0,180,255,0.2);display:flex;align-items:center;justify-content:space-between;background:rgba(2,11,24,0.8);backdrop-filter:blur(10px);}
  .arc-reactor{position:relative;width:44px;height:44px;flex-shrink:0;}
  .arc-outer{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(0,180,255,0.4);animation:reactorSpin 8s linear infinite;}
  .arc-outer::before{content:'';position:absolute;top:-1px;left:50%;width:4px;height:4px;background:#00b4ff;border-radius:50%;transform:translateX(-50%);box-shadow:0 0 6px #00b4ff;}
  .arc-mid{position:absolute;inset:6px;border-radius:50%;border:1px solid rgba(0,180,255,0.3);animation:reactorSpin 4s linear infinite reverse;}
  .arc-core{position:absolute;inset:14px;border-radius:50%;background:radial-gradient(circle,#00d4ff,#0066ff);box-shadow:0 0 15px #00b4ff,0 0 30px rgba(0,180,255,0.4);animation:corePulse 2s ease-in-out infinite;}
  @keyframes reactorSpin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}
  @keyframes corePulse{0%,100%{box-shadow:0 0 15px #00b4ff,0 0 30px rgba(0,180,255,0.4);}50%{box-shadow:0 0 25px #00d4ff,0 0 50px rgba(0,180,255,0.7),0 0 70px rgba(0,100,255,0.3);}}
  .title-block h1{font-family:'Rajdhani',sans-serif;font-size:22px;font-weight:700;letter-spacing:8px;color:#00b4ff;text-shadow:0 0 20px rgba(0,180,255,0.5);}
  .title-block p{font-size:8px;color:rgba(0,180,255,0.5);letter-spacing:4px;text-transform:uppercase;}
  .hud-stats{display:flex;gap:16px;font-size:9px;color:rgba(0,180,255,0.5);letter-spacing:1px;}
  .hud-stat{display:flex;flex-direction:column;align-items:flex-end;gap:2px;}
  .hud-stat span:first-child{color:#00b4ff;font-size:10px;}
  .user-bar{padding:6px 20px;border-bottom:1px solid rgba(0,180,255,0.1);display:flex;gap:6px;overflow-x:auto;background:rgba(2,11,24,0.6);scrollbar-width:none;}
  .user-bar::-webkit-scrollbar{display:none;}
  .user-btn{padding:3px 10px;border:1px solid rgba(0,180,255,0.2);background:transparent;color:rgba(0,180,255,0.4);font-family:'Share Tech Mono',monospace;font-size:10px;cursor:pointer;letter-spacing:2px;clip-path:polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%);transition:all 0.2s;white-space:nowrap;}
  .user-btn:hover,.user-btn.active{border-color:#00b4ff;color:#00b4ff;background:rgba(0,180,255,0.08);box-shadow:0 0 10px rgba(0,180,255,0.2);}
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
  .msg-bubble{padding:10px 14px;font-size:12px;line-height:1.7;position:relative;}
  .msg.assistant .msg-bubble{background:rgba(0,20,50,0.8);border:1px solid rgba(0,180,255,0.2);border-left:2px solid #00b4ff;clip-path:polygon(0 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%);color:#a8d4f0;}
  .msg.user .msg-bubble{background:rgba(0,40,80,0.6);border:1px solid rgba(0,180,255,0.15);border-right:2px solid rgba(0,180,255,0.5);clip-path:polygon(8px 0,100% 0,100% 100%,0 calc(100% - 8px),0 8px);color:#c8e6ff;text-align:right;}
  .msg-meta{font-size:8px;color:rgba(0,180,255,0.35);margin-top:3px;letter-spacing:1px;}
  .msg.user .msg-meta{text-align:right;}
  .thinking{display:flex;gap:5px;padding:10px 14px;}
  .thinking span{width:5px;height:5px;border-radius:50%;background:#00b4ff;animation:think 1.2s ease-in-out infinite;}
  .thinking span:nth-child(2){animation-delay:0.2s;}
  .thinking span:nth-child(3){animation-delay:0.4s;}
  @keyframes think{0%,100%{opacity:0.2;transform:scale(0.7);}50%{opacity:1;transform:scale(1.2);box-shadow:0 0 6px #00b4ff;}}
  .input-area{padding:10px 16px;border-top:1px solid rgba(0,180,255,0.15);background:rgba(2,11,24,0.9);backdrop-filter:blur(10px);}
  .input-row{display:flex;gap:8px;align-items:flex-end;}
  .input-wrap{flex:1;position:relative;}
  .input-wrap::before{content:'//';position:absolute;left:10px;top:50%;transform:translateY(-50%);color:rgba(0,180,255,0.3);font-size:11px;pointer-events:none;}
  textarea{width:100%;background:rgba(0,20,50,0.6);border:1px solid rgba(0,180,255,0.2);padding:10px 12px 10px 28px;color:#a8d4f0;font-family:'Share Tech Mono',monospace;font-size:12px;resize:none;min-height:40px;max-height:100px;outline:none;clip-path:polygon(0 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,0 100%);transition:border-color 0.2s;}
  textarea:focus{border-color:rgba(0,180,255,0.5);}
  textarea::placeholder{color:rgba(0,180,255,0.25);}
  .send-btn{width:40px;height:40px;background:linear-gradient(135deg,#003399,#0099ff);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);transition:all 0.2s;color:white;font-size:14px;box-shadow:0 0 15px rgba(0,150,255,0.3);}
  .send-btn:hover{box-shadow:0 0 25px rgba(0,180,255,0.6);}
  .send-btn:disabled{opacity:0.3;cursor:not-allowed;}
  .lock-screen{position:fixed;inset:0;background:#020b18;display:flex;align-items:center;justify-content:center;z-index:100;}
  .lock-panel{border:1px solid rgba(0,180,255,0.2);padding:48px;text-align:center;position:relative;clip-path:polygon(20px 0%,100% 0%,100% calc(100% - 20px),calc(100% - 20px) 100%,0% 100%,0% 20px);}
  .lock-panel::before{content:'';position:absolute;inset:0;background:rgba(0,20,50,0.6);}
  .lock-content{position:relative;z-index:1;}
  .lock-reactor{width:70px;height:70px;position:relative;margin:0 auto 20px;}
  .lock-reactor-outer{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(0,180,255,0.4);animation:reactorSpin 6s linear infinite;}
  .lock-reactor-mid{position:absolute;inset:8px;border-radius:50%;border:1px solid rgba(0,180,255,0.3);animation:reactorSpin 3s linear infinite reverse;}
  .lock-reactor-core{position:absolute;inset:18px;border-radius:50%;background:radial-gradient(circle,#00d4ff,#0044cc);box-shadow:0 0 20px #00b4ff;animation:corePulse 2s ease-in-out infinite;}
  .lock-title{font-family:'Rajdhani',sans-serif;font-size:24px;font-weight:700;letter-spacing:10px;color:#00b4ff;text-shadow:0 0 20px rgba(0,180,255,0.5);margin-bottom:4px;}
  .lock-sub{font-size:8px;color:rgba(0,180,255,0.4);letter-spacing:4px;margin-bottom:28px;}
  .lock-input{background:rgba(0,20,50,0.8);border:1px solid rgba(0,180,255,0.2);padding:10px 16px;color:#a8d4f0;font-family:'Share Tech Mono',monospace;font-size:13px;display:block;width:220px;margin:0 auto 12px;text-align:center;outline:none;clip-path:polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px);transition:border-color 0.2s;}
  .lock-input:focus{border-color:rgba(0,180,255,0.5);}
  .lock-btn{background:linear-gradient(135deg,#003399,#0099ff);border:none;padding:10px 0;color:white;font-family:'Share Tech Mono',monospace;font-size:12px;letter-spacing:4px;cursor:pointer;width:220px;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));box-shadow:0 0 20px rgba(0,150,255,0.3);transition:box-shadow 0.2s;}
  .lock-btn:hover{box-shadow:0 0 30px rgba(0,180,255,0.6);}
  .lock-lines{position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;padding:8px 12px;font-size:8px;color:rgba(0,180,255,0.2);letter-spacing:2px;}
`

export default function Home() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState('Dad')
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [time, setTime] = useState('')
  const bottomRef = useRef(null)
  const family = ['Dad','Mom','Cicily','Camille','Carter','Lincoln']

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => {
    const t = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'}))
    }, 1000)
    return () => clearInterval(t)
  }, [])

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
    } catch(e) {
      setMessages(m => [...m, { role: 'assistant', content: 'System error. Please try again.', name: 'JARVIS' }])
    }
    setLoading(false)
  }

  if (!authed) return (
    <>
      <style>{styles}</style>
      <div className="arc-bg"/>
      <div className="scan"/>
      <div className="lock-screen">
        <div className="lock-panel">
          <div className="lock-lines"><span>STARK INDUSTRIES</span><span>v4.2.1</span></div>
          <div className="lock-content">
            <div className="lock-reactor">
              <div className="lock-reactor-outer"/>
              <div className="lock-reactor-mid"/>
              <div className="lock-reactor-core"/>
            </div>
            <div className="lock-title">J.A.R.V.I.S</div>
            <div className="lock-sub">DEATHERAGE FAMILY SYSTEM</div>
            <input className="lock-input" type="password" placeholder="ENTER ACCESS CODE" value={pass}
              onChange={e=>setPass(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&pass===PASSWORD&&setAuthed(true)}/>
            <button className="lock-btn" onClick={()=>pass===PASSWORD&&setAuthed(true)}>INITIALIZE</button>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style>{styles}</style>
      <div className="arc-bg"/>
      <div className="scan"/>
      <div className="corner tl"/><div className="corner tr"/>
      <div className="corner bl"/><div className="corner br"/>
      <div className="app">
        <div className="header">
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <div className="arc-reactor">
              <div className="arc-outer"/>
              <div className="arc-mid"/>
              <div className="arc-core"/>
            </div>
            <div className="title-block">
              <h1>J.A.R.V.I.S</h1>
              <p>Just A Rather Very Intelligent System</p>
            </div>
          </div>
          <div className="hud-stats">
            <div className="hud-stat"><span>{time}</span><span>LOCAL TIME</span></div>
            <div className="hud-stat"><span style={{color:'#00ff88'}}>ONLINE</span><span>STATUS</span></div>
          </div>
        </div>
        <div className="user-bar">
          {family.map(f => (
            <button key={f} className={`user-btn${user===f?' active':''}`} onClick={()=>setUser(f)}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="messages">
          {messages.length === 0 && (
            <div className="welcome">
              <div className="welcome-ring">
                <div className="welcome-core"/>
              </div>
              <h2>SYSTEMS ONLINE</h2>
              <p>Good to see you. All Deatherage family systems are operational. How may I assist?</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className="msg-icon">{m.role==='user'?m.name.substring(0,2).toUpperCase():'J·A·I'}</div>
              <div className="msg-body">
                <div className="msg-bubble">{m.content}</div>
                <div className="msg-meta">{m.name} · {new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="msg assistant">
              <div className="msg-icon">J·A·I</div>
              <div className="msg-body">
                <div className="msg-bubble" style={{background:'rgba(0,20,50,0.8)',border:'1px solid rgba(0,180,255,0.2)',borderLeft:'2px solid #00b4ff'}}>
                  <div className="thinking"><span/><span/><span/></div>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>
        <div className="input-area">
          <div className="input-row">
            <div className="input-wrap">
              <textarea value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}}
                placeholder="Awaiting your command..." rows={1}
                style={{lineHeight:'20px'}}/>
            </div>
            <button className="send-btn" onClick={send} disabled={loading}>➤</button>
          </div>
        </div>
      </div>
    </>
  )
}
