import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Department Data ───────────────────────────────────────────────────────────
const DEPARTMENTS = [
  { name: 'Cardiology', icon: '❤️', keywords: ['heart', 'chest pain', 'palpitations', 'blood pressure', 'cardiac'] },
  { name: 'Neurology', icon: '🧠', keywords: ['headache', 'migraine', 'seizure', 'numbness', 'dizziness', 'nerve'] },
  { name: 'Orthopedics', icon: '🦴', keywords: ['bone', 'joint', 'fracture', 'back pain', 'knee', 'hip', 'shoulder'] },
  { name: 'Gastroenterology', icon: '🫃', keywords: ['stomach', 'abdomen', 'digestive', 'nausea', 'vomiting', 'diarrhea', 'constipation'] },
  { name: 'Pulmonology', icon: '🫁', keywords: ['breathing', 'cough', 'asthma', 'lung', 'respiratory', 'shortness of breath'] },
  { name: 'Dermatology', icon: '🧴', keywords: ['skin', 'rash', 'acne', 'eczema', 'itching', 'allergy'] },
  { name: 'ENT', icon: '👂', keywords: ['ear', 'nose', 'throat', 'hearing', 'sinus', 'tonsil', 'voice'] },
  { name: 'Ophthalmology', icon: '👁️', keywords: ['eye', 'vision', 'blurry', 'cataract', 'glaucoma', 'sight'] },
  { name: 'Psychiatry', icon: '🧩', keywords: ['anxiety', 'depression', 'mental', 'stress', 'insomnia', 'mood', 'panic'] },
  { name: 'General Medicine', icon: '🩺', keywords: ['fever', 'fatigue', 'general', 'checkup', 'weakness', 'flu', 'cold'] },
];

// ─── System Prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are MediGuide, a compassionate and knowledgeable AI healthcare assistant for a patient appointment management system. Your role is to:

1. Listen to patients describe their symptoms or health concerns with empathy
2. Ask clear, focused follow-up questions to better understand their condition
3. Based on their symptoms, guide them to the most appropriate medical department:
   - Cardiology: Heart, chest pain, blood pressure, palpitations
   - Neurology: Headaches, migraines, seizures, numbness, dizziness
   - Orthopedics: Bone/joint issues, back pain, fractures, sports injuries
   - Gastroenterology: Stomach/digestive issues, nausea, abdominal pain
   - Pulmonology: Breathing difficulties, cough, asthma, lung issues
   - Dermatology: Skin conditions, rashes, allergies
   - ENT: Ear, nose, throat, hearing, sinus issues
   - Ophthalmology: Eye/vision problems
   - Psychiatry: Mental health, anxiety, depression, stress
   - General Medicine: Fever, fatigue, general checkups, flu symptoms

4. Always remind patients that seeing a real doctor is essential for proper diagnosis
5. Keep responses concise (2-4 sentences max) and warm
6. End department recommendations with a clear statement like: "I recommend seeing a **[Department]** specialist"
7. Never diagnose conditions - only recommend departments
8. For emergencies (e.g., severe chest pain, difficulty breathing, stroke symptoms), always say to call emergency services (911 or local emergency number) immediately

Start by greeting the patient warmly and asking how you can help today.`;

// ─── Quick Suggestion Chips ────────────────────────────────────────────────────
const QUICK_CHIPS = [
  'I have chest pain',
  'Frequent headaches',
  'Skin rash/itching',
  'Stomach problems',
  'Joint/back pain',
  'Anxiety & stress',
  'Breathing issues',
  'Eye problems',
];

// ─── Groq API Call ─────────────────────────────────────────────────────────────
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

async function callGroqAPI(messages) {
  // Fallback to rule-based if no API key
  if (!GROQ_API_KEY || GROQ_API_KEY.trim() === '') {
    console.warn('[MediGuide] No Groq API key found — using rule-based fallback.');
    return generateFallbackResponse(messages[messages.length - 1]?.content || '');
  }

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[MediGuide] Groq API error ${res.status}:`, errBody);
      // Gracefully fall back instead of throwing
      return generateFallbackResponse(messages[messages.length - 1]?.content || '');
    }

    const data = await res.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error('[MediGuide] Network/fetch error:', err);
    // Gracefully fall back to rule-based on network failure
    return generateFallbackResponse(messages[messages.length - 1]?.content || '');
  }
}

// ─── Rule-based Fallback ───────────────────────────────────────────────────────
function generateFallbackResponse(input) {
  const lower = input.toLowerCase();

  // Emergency check
  if (/severe chest pain|can't breathe|stroke|unconscious|emergency/.test(lower)) {
    return '🚨 **This sounds like a medical emergency!** Please call **911** (or your local emergency number) immediately. Do not wait for an appointment.';
  }

  // Department matching
  for (const dept of DEPARTMENTS) {
    if (dept.keywords.some(kw => lower.includes(kw))) {
      return `Based on what you've described, I recommend seeing a **${dept.name}** specialist ${dept.icon}. They are best equipped to evaluate and treat your condition. Would you like me to help you book an appointment with this department?`;
    }
  }

  // General questions
  if (/hello|hi|hey|help/.test(lower)) {
    return "Hello! 👋 I'm MediGuide, your health assistant. Could you describe your symptoms or health concerns? I'll help guide you to the right medical department.";
  }

  return "I understand your concern. Could you describe your symptoms in a bit more detail? For example, where is the discomfort located, how long have you had it, and how severe is it on a scale of 1-10?";
}

// ─── Message Bubble ────────────────────────────────────────────────────────────
const MessageBubble = ({ message }) => {
  const isBot = message.role === 'assistant';

  // Parse **bold** markdown
  const formatText = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: isBot ? '#a78bfa' : '#fff' }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        display: 'flex',
        justifyContent: isBot ? 'flex-start' : 'flex-end',
        marginBottom: '10px',
        gap: '8px',
        alignItems: 'flex-end',
      }}
    >
      {isBot && (
        <div style={{
          width: '30px', height: '30px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', flexShrink: 0,
        }}>
          🤖
        </div>
      )}
      <div style={{
        maxWidth: '80%',
        padding: '10px 14px',
        borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
        background: isBot
          ? 'rgba(99, 102, 241, 0.12)'
          : 'linear-gradient(135deg, #6366f1, #a855f7)',
        border: isBot ? '1px solid rgba(99, 102, 241, 0.25)' : 'none',
        color: '#f1f5f9',
        fontSize: '0.84rem',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {formatText(message.content)}
      </div>
    </motion.div>
  );
};

// ─── Typing Indicator ──────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '10px' }}
  >
    <div style={{
      width: '30px', height: '30px', borderRadius: '50%',
      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
    }}>🤖</div>
    <div style={{
      padding: '12px 16px',
      background: 'rgba(99, 102, 241, 0.12)',
      border: '1px solid rgba(99, 102, 241, 0.25)',
      borderRadius: '4px 16px 16px 16px',
      display: 'flex', gap: '5px', alignItems: 'center',
    }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.15, ease: 'easeInOut' }}
          style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#a78bfa' }}
        />
      ))}
    </div>
  </motion.div>
);

// ─── Main Chatbot Component ────────────────────────────────────────────────────
const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isLoading, scrollToBottom]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Stop pulse after 5 seconds
  useEffect(() => {
    const t = setTimeout(() => setShowPulse(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // Greet on first open
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      setIsLoading(true);
      setTimeout(() => {
        setMessages([{
          role: 'assistant',
          content: "Hello! 👋 I'm **MediGuide**, your personal health assistant. I'm here to listen to your concerns and help guide you to the right medical department.\n\nHow are you feeling today? Please describe your symptoms or health concerns.",
        }]);
        setIsLoading(false);
      }, 800);
    }
  }, [isOpen, hasGreeted]);

  const sendMessage = useCallback(async (text) => {
    const userText = text || input.trim();
    if (!userText || isLoading) return;

    const userMsg = { role: 'user', content: userText };
    const newMessages = [...messages, userMsg];

    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history for API (last 10 messages for context)
      const apiMessages = newMessages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const reply = await callGroqAPI(apiMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('[MediGuide] Unexpected error in sendMessage:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: generateFallbackResponse(userText),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, isLoading]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setHasGreeted(false);
    setIsOpen(false);
    setTimeout(() => setIsOpen(true), 50);
  };

  return (
    <>
      {/* ── Floating Toggle Button ── */}
      <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 9999 }}>
        {/* Pulse ring */}
        {showPulse && !isOpen && (
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.4)', pointerEvents: 'none',
            }}
          />
        )}

        {/* Tooltip */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: 0.5 }}
              style={{
                position: 'absolute', right: '70px', top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(15, 18, 33, 0.95)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: '12px', padding: '8px 14px',
                fontSize: '0.8rem', color: '#f1f5f9', whiteSpace: 'nowrap',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                pointerEvents: 'none',
              }}
            >
              💬 Ask MediGuide
              <div style={{
                position: 'absolute', right: '-6px', top: '50%',
                width: '12px', height: '12px', background: 'rgba(15,18,33,0.95)',
                border: '1px solid rgba(99,102,241,0.3)',
                borderTop: 'none', borderLeft: 'none',
                transform: 'translateY(-50%) rotate(-45deg)',
              }} />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          id="chatbot-toggle-btn"
          onClick={() => setIsOpen(o => !o)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(99,102,241,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', position: 'relative',
          }}
          aria-label="Toggle AI health assistant"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >✕</motion.span>
            ) : (
              <motion.span
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >🩺</motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chatbot-window"
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              position: 'fixed',
              bottom: '104px',
              right: '28px',
              width: 'min(400px, calc(100vw - 40px))',
              height: 'min(580px, calc(100vh - 140px))',
              zIndex: 9998,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '24px',
              overflow: 'hidden',
              background: 'rgba(9, 11, 20, 0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(99,102,241,0.1)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.15))',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', gap: '12px',
              flexShrink: 0,
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem', boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                flexShrink: 0,
              }}>🤖</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#f1f5f9' }}>MediGuide AI</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#22c55e',
                    boxShadow: '0 0 6px #22c55e',
                  }} />
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Online • Health Assistant</span>
                </div>
              </div>
              <button
                onClick={clearChat}
                title="Clear chat"
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px', padding: '6px 8px', cursor: 'pointer',
                  color: '#94a3b8', fontSize: '0.72rem', fontWeight: '600',
                }}
              >
                Clear
              </button>
            </div>

            {/* Messages */}
            <div
              id="chatbot-messages"
              style={{
                flex: 1, overflowY: 'auto', padding: '16px',
                display: 'flex', flexDirection: 'column',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(99,102,241,0.3) transparent',
              }}
            >
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <MessageBubble key={i} message={msg} />
                ))}
                {isLoading && <TypingIndicator key="typing" />}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Chips (shown only when few messages) */}
            <AnimatePresence>
              {messages.length <= 1 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    padding: '8px 12px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', flexWrap: 'wrap', gap: '6px',
                    flexShrink: 0,
                  }}
                >
                  {QUICK_CHIPS.map((chip) => (
                    <motion.button
                      key={chip}
                      onClick={() => sendMessage(chip)}
                      whileHover={{ scale: 1.04, background: 'rgba(99,102,241,0.25)' }}
                      whileTap={{ scale: 0.96 }}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '20px',
                        background: 'rgba(99,102,241,0.1)',
                        border: '1px solid rgba(99,102,241,0.2)',
                        color: '#c4b5fd',
                        fontSize: '0.72rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                    >
                      {chip}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input area */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', gap: '10px', alignItems: 'flex-end',
              flexShrink: 0,
              background: 'rgba(255,255,255,0.02)',
            }}>
              <textarea
                ref={inputRef}
                id="chatbot-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your symptoms..."
                disabled={isLoading}
                rows={1}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  color: '#f1f5f9',
                  fontSize: '0.84rem',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'Outfit, sans-serif',
                  lineHeight: 1.5,
                  minHeight: '42px',
                  maxHeight: '100px',
                  overflowY: 'auto',
                  transition: 'border-color 0.2s',
                  margin: 0,
                  marginBottom: 0,
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.2)'}
              />
              <motion.button
                id="chatbot-send-btn"
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                whileHover={{ scale: input.trim() && !isLoading ? 1.06 : 1 }}
                whileTap={{ scale: input.trim() && !isLoading ? 0.94 : 1 }}
                style={{
                  width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                  background: input.trim() && !isLoading
                    ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                    : 'rgba(255,255,255,0.05)',
                  border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', transition: 'background 0.2s',
                  boxShadow: input.trim() && !isLoading ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
                }}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#a78bfa' }}
                  />
                ) : '➤'}
              </motion.button>
            </div>

            {/* Footer disclaimer */}
            <div style={{
              padding: '6px 16px 10px',
              textAlign: 'center',
              fontSize: '0.65rem',
              color: 'rgba(148,163,184,0.5)',
              flexShrink: 0,
            }}>
              For emergencies, call 911 immediately. This AI does not provide medical diagnoses.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
