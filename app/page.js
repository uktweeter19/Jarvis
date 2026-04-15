'use client'
const PASSWORD = 'deatherage2024'
import { useState, useRef, useEffect } from 'react'

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

  if (!authed) return (
    <div style={{background:'#0a0a0f',minHeight:'100dvh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'monospace'}}>
      <div style={{textAlign:'center',border:'1px solid #1e3a5f',padding:40,borderRadius:4}}>
        <div style={{color:'#00d4ff',fontSize:20,letterSpacing:6,marginBottom:24}}>JARVIS</div>
        <input type="password" placeholder="Enter password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&pass===PASSWORD&&setAuthed(true)} style={{background:'#0d1117',border:'1px solid #1e3a5f',padding:'10px 14px',color:'white',fontFamily:'monospace',fontSize:13,borderRadius:2,display:'block',marginBottom:12,width:200}}/>
        <button onClick={()=>pass===PASSWORD&&setAuthed(true)} style={{background:'linear-gradient(135deg,#0066ff,#00d4ff)',border:'none',padding:'10px 24px',color:'white',fontFamily:'monospace',cursor:'pointer',borderRadius:2,width:200}}>ENTER</button>
      </div>
    </div>
  )

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content:
