'use client'
import { useState, useRef, useEffect } from 'react'

const PASSWORD = 'deatherage2024'

const FAMILY_CONTEXT = `You are JARVIS, the intelligent family assistant for the Deatherage family in Kentucky. You are helpful, warm, and efficient. Family members: Kevin (Dad), Mom, Cicily, Camille, Carter, Emily, Millie, Kevo. Carter plays football at Lincoln. Kevin is saving for his daughter's college at University of Kentucky. Keep responses concise and conversational.`

export default function Home() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState('Dad')
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const bottomRef = useRef(null)
  const family = ['Dad','Mom','Cicily','Camille','Carter','Emily','Millie','Kevo']

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

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
    <div style={{background:'#0a0a0f',minHeight:'100dvh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'monospace'}}>
      <div style={{textAlign:'center',border:'1px solid #1e3a5f',padding:40,borderRadius:4}}>
        <div style={{color:'#00d4ff',fontSize:20,letterSpacing:6,marginBottom:24}}>JARVIS</div>
        <input type="password" placeholder="Enter password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&pass===PASSWORD&&setAuthed(true)} style={{background:'#0d1117',border:'1px solid #1e3a5f',padding:'10px 14px',color:'white',fontFamily:'monospace',fontSize:13,borderRadius:2,display:'block',marginBottom:12,width:200}}/>
        <button onClick={()=>pass===PASSWORD&&setAuthed(true)} style={{background:'linear-gradient(135deg,#0066ff,#00d4ff)',border:'none',padding:'10px 24px',color:'white',fontFamily:'monospace',cursor:'pointer',borderRadius:2,width:200}}>ENTER</button>
      </div>
    </div>
  )

  return (
    <div style={{background:'#0a0a0f',minHeight:'100dvh',display:'flex',flexDirection:'column',fontFamily:'monospace',color:'#c8e6ff'}}>
      <div style={{padding:'12px 20px',borderBottom:'1px solid #1e3a5f',background:'rgba(10,10,15,0.9)',display:'flex',alignItems:'center',gap:'12px'}}>
        <div style={{width:36,height:36,borderRadius:'50%',background:'radial-gradient(circle at 35% 35%, #00ffff, #0044ff 60%, #000033)',boxShadow:'0 0 15px rgba(0,212,255,0.8)'}}/>
        <div>
          <div style={{fontFamily:'serif',fontSize:18,fontWeight:900,letterSpacing:6,color:'#00d4ff'}}>JARVIS</div>
          <div style={{fontSize:9,color:'#4a6fa5',letterSpacing:3}}>DEATHERAGE FAMILY SYSTEM</div>
        </div>
      </div>
      <div style={{padding:'8px 20px',borderBottom:'1px solid #1e3a5f',display:'flex',gap:8,overflowX:'auto'}}>
        {family.map(f => (
          <button key={f} onClick={() => setUser(f)} style={{padding:'4px 12px',border:`1px solid ${user===f?'#00d4ff':'#1e3a5f'}`,background:'transparent',color:user===f?'#00d4ff':'#4a6fa5',fontFamily:'monospace',fontSize:11,cursor:'pointer',borderRadius:2,whiteSpace:'nowrap'}}>
            {f.toUpperCase()}
          </button>
        ))}
      </div>
      <div style={{flex:1,overflowY:'auto',padding:20,display:'flex',flexDirection:'column',gap:16}}>
        {messages.length === 0 && (
          <div style={{textAlign:'center',opacity:0.5,marginTop:60}}>
            <div style={{fontSize:40,marginBottom:16}}>⬡</div>
            <div style={{letterSpacing:4,fontSize:14,color:'#00d4ff'}}>JARVIS ONLINE</div>
            <div style={{fontSize:12,color:'#4a6fa5',marginTop:8}}>How can I assist the Deatherage family today?</div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{display:'flex',flexDirection:m.role==='user'?'row-reverse':'row',gap:12}}>
            <div style={{width:32,height:32,borderRadius:2,background:m.role==='user'?'#0a2040':'radial-gradient(circle at 35% 35%, #00ccff, #003399)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'white',flexShrink:0,alignSelf:'flex-end',border:'1px solid #1e3a5f'}}>
              {m.role==='user'?m.name.substring(0,2).toUpperCase():'J·A·I'}
            </div>
            <div style={{maxWidth:'75%'}}>
              <div style={{padding:'12px 16px',background:m.role==='user'?'#0a2040':'#061218',border:'1px solid #1e3a5f',borderLeft:m.role==='assistant'?'2px solid #00d4ff':'none',borderRight:m.role==='user'?'2px solid #0066ff':'none',fontSize:13,lineHeight:1.6,borderRadius:2}}>
                {m.content}
              </div>
              <div style={{fontSize:9,color:'#4a6fa5',marginTop:4,textAlign:m.role==='user'?'right':'left'}}>{m.name}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{display:'flex',gap:12}}>
            <div style={{width:32,height:32,borderRadius:2,background:'radial-gradient(circle at 35% 35%, #00ccff, #003399)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'white',border:'1px solid #1e3a5f'}}>J·A·I</div>
            <div style={{padding:'12px 16px',background:'#061218',border:'1px solid #1e3a5f',borderLeft:'2px solid #00d4ff',borderRadius:2,fontSize:13}}>...</div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:'12px 16px',borderTop:'1px solid #1e3a5f',background:'rgba(10,10,15,0.95)',display:'flex',gap:10}}>
        <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder="Ask Jarvis anything..." style={{flex:1,background:'#0d1117',border:'1px solid #1e3a5f',borderRadius:2,padding:'10px 14px',color:'#c8e6ff',fontFamily:'monospace',fontSize:13,resize:'none',minHeight:42,outline:'none'}} rows={1}/>
        <button onClick={send} disabled={loading} style={{width:42,height:42,background:'linear-gradient(135deg, #0066ff, #00d4ff)',border:'none',borderRadius:2,cursor:'pointer',color:'white',fontSize:18}}>➤</button>
      </div>
    </div>
  )
}
