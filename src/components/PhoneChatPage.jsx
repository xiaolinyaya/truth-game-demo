import { useState, useRef, useEffect } from 'react';

const MOCK_MESSAGES = [
  { id: 'mock-1', sender: 'character', text: 'Hi~Kate', time: '10:12' },
  { id: 'mock-2', sender: 'user', text: 'Hi~Yate', time: '10:12' },
  { id: 'mock-3', sender: 'character', text: 'I miss you so much...', time: '10:12' },
  { id: 'mock-4', sender: 'character', type: 'voice', text: '10s', time: '10:12' },
  { id: 'mock-5', sender: 'user', text: 'Hi~Yate', time: '10:12' },
];

// ── Not Enough Drinks Popup ─────────────────────────────────────────
function NotEnoughPopup({ visible, onClose }) {
  if (!visible) return null;
  return (
    <>
      <div style={popupStyles.overlay} onClick={onClose} />
      <div style={popupStyles.container}>
        <button style={popupStyles.closeBtn} onClick={onClose}>✕</button>
        <div style={popupStyles.emoji}>🍷</div>
        <h3 style={popupStyles.title}>Not Enough Drinks</h3>
        <p style={popupStyles.text}>
          You've run out of drinks to offer. Get more drinks to keep
          the conversation going deeper.
        </p>
        <button style={popupStyles.actionBtn} onClick={onClose}>
          Get More
        </button>
      </div>
    </>
  );
}

const popupStyles = {
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    zIndex: 100,
  },
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '280px',
    background: 'linear-gradient(180deg, #2d1520 0%, #1a0a0a 100%)',
    borderRadius: '20px',
    padding: '28px 24px',
    zIndex: 101,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.08)',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  emoji: { fontSize: '40px' },
  title: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#ffd6dd',
    margin: 0,
  },
  text: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.55)',
    lineHeight: 1.5,
    textAlign: 'center',
    margin: 0,
  },
  actionBtn: {
    marginTop: '4px',
    padding: '10px 32px',
    background: 'linear-gradient(135deg, #e85d75, #c94060)',
    border: 'none',
    borderRadius: '22px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(232, 93, 117, 0.35)',
  },
};

// ── Styles ──────────────────────────────────────────────────────────
const styles = {
  container: {
    width: '100%',
    maxWidth: '390px',
    height: '100vh',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    background: '#1a0a0a',
    fontFamily: "'SF Pro Display', 'PingFang SC', -apple-system, sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },

  /* --- Top Bar --- */
  topBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'rgba(40, 16, 16, 0.95)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    flexShrink: 0,
    zIndex: 10,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#e8c4b8',
    fontSize: '22px',
    cursor: 'pointer',
    padding: '4px 8px 4px 0',
    lineHeight: 1,
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #c0392b, #e74c3c)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: '#fff',
    marginRight: '10px',
    flexShrink: 0,
  },
  characterName: {
    color: '#f0d9ce',
    fontSize: '16px',
    fontWeight: 600,
    flex: 1,
  },
  menuBtn: {
    background: 'none',
    border: 'none',
    color: '#e8c4b8',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px 0 4px 8px',
    lineHeight: 1,
  },

  /* --- Chat Area --- */
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    background: 'linear-gradient(180deg, rgba(30, 12, 12, 0.6) 0%, rgba(26, 10, 10, 1) 100%)',
  },

  /* --- Message Rows --- */
  messageRowLeft: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  messageRowRight: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    maxWidth: '80%',
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  smallAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #c0392b, #e74c3c)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    color: '#fff',
    flexShrink: 0,
  },
  bubbleCharacter: {
    background: 'linear-gradient(135deg, #c0392b, #d44637)',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '18px 18px 18px 4px',
    fontSize: '15px',
    lineHeight: '1.45',
    wordBreak: 'break-word',
  },
  bubbleUser: {
    background: 'linear-gradient(135deg, #fef3e2, #fde8c8)',
    color: '#2d1a0e',
    padding: '10px 14px',
    borderRadius: '18px 18px 4px 18px',
    fontSize: '15px',
    lineHeight: '1.45',
    wordBreak: 'break-word',
  },
  voiceBubble: {
    background: 'linear-gradient(135deg, #c0392b, #d44637)',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: '18px 18px 18px 4px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: '100px',
  },
  voiceWave: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  voiceBar: {
    width: '3px',
    borderRadius: '2px',
    background: 'rgba(255,255,255,0.7)',
  },
  timestamp: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.25)',
    marginTop: '3px',
    paddingLeft: '4px',
    paddingRight: '4px',
  },
  timestampRight: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.25)',
    marginTop: '3px',
    textAlign: 'right',
    paddingLeft: '4px',
    paddingRight: '4px',
  },

  /* --- Typing Indicator --- */
  typingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    alignSelf: 'flex-start',
    padding: '4px 0',
  },
  typingDots: {
    background: 'rgba(192, 57, 43, 0.4)',
    padding: '10px 16px',
    borderRadius: '18px 18px 18px 4px',
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  typingDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.5)',
    animation: 'phoneChatTypingBounce 1.2s infinite',
  },

  /* --- Bottom Bar --- */
  bottomBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    gap: '8px',
    background: 'rgba(40, 16, 16, 0.95)',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    flexShrink: 0,
  },
  inputWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.06)',
    borderRadius: '20px',
    padding: '0 4px 0 14px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  textInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#f0d9ce',
    fontSize: '15px',
    padding: '10px 0',
    fontFamily: 'inherit',
  },
  sendBtn: {
    background: 'linear-gradient(135deg, #c0392b, #e74c3c)',
    border: 'none',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
    fontSize: '14px',
    flexShrink: 0,
  },
  micBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px',
    color: '#e8c4b8',
    flexShrink: 0,
  },
  activityBtn: {
    background: 'linear-gradient(135deg, #8e44ad, #9b59b6)',
    border: 'none',
    borderRadius: '50%',
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '16px',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(142, 68, 173, 0.4)',
    gap: '1px',
    letterSpacing: '-2px',
  },
};

/* Keyframes injected once */
const KEYFRAMES_ID = 'phone-chat-keyframes';

function injectKeyframes() {
  if (document.getElementById(KEYFRAMES_ID)) return;
  const sheet = document.createElement('style');
  sheet.id = KEYFRAMES_ID;
  sheet.textContent = `
    @keyframes phoneChatTypingBounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }
    .phone-chat-area::-webkit-scrollbar {
      width: 3px;
    }
    .phone-chat-area::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
    }
    .phone-chat-area::-webkit-scrollbar-track {
      background: transparent;
    }
    .phone-chat-input::placeholder {
      color: rgba(240, 217, 206, 0.35);
    }
  `;
  document.head.appendChild(sheet);
}

function VoiceMessage({ duration }) {
  const bars = [6, 10, 14, 8, 16, 12, 6, 10, 14, 8];
  return (
    <div style={styles.voiceBubble}>
      <span style={{ fontSize: '16px' }}>&#9654;</span>
      <div style={styles.voiceWave}>
        {bars.map((h, i) => (
          <div key={i} style={{ ...styles.voiceBar, height: `${h}px` }} />
        ))}
      </div>
      <span style={{ fontSize: '12px', opacity: 0.8 }}>{duration}</span>
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.sender === 'user';

  if (msg.type === 'voice') {
    return (
      <div>
        <div style={styles.messageRowLeft}>
          <div style={styles.smallAvatar}>P</div>
          <div>
            <VoiceMessage duration={msg.text} />
            <div style={styles.timestamp}>{msg.time}</div>
          </div>
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div style={styles.messageRowRight}>
        <div>
          <div style={styles.bubbleUser}>{msg.text}</div>
          <div style={styles.timestampRight}>{msg.time}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.messageRowLeft}>
      <div style={styles.smallAvatar}>P</div>
      <div>
        <div style={styles.bubbleCharacter}>{msg.text}</div>
        <div style={styles.timestamp}>{msg.time}</div>
      </div>
    </div>
  );
}

export default function PhoneChatPage({
  onBack,
  onStartGame,
  onGiftWine,
  messages = [],
  showCharacterTyping = false,
  onSendMessage,
  drinkInventory = 5,
  truthUnlocked = false,
  activityBtnRef,
}) {
  const [inputText, setInputText] = useState('');
  const [showNotEnough, setShowNotEnough] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    injectKeyframes();
  }, []);

  /* Auto-scroll on new messages or typing indicator */
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, showCharacterTyping]);

  const allMessages = [...MOCK_MESSAGES, ...messages];

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    if (onSendMessage) onSendMessage(trimmed);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.container}>
      {/* ===== Top Bar ===== */}
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onBack} aria-label="Back">
          &#8592;
        </button>
        <div style={styles.avatar}>P</div>
        <span style={styles.characterName}>Prisoner</span>
        <button style={styles.menuBtn} aria-label="Menu">
          &#9776;
        </button>
      </div>

      {/* ===== Chat Area ===== */}
      <div className="phone-chat-area" style={styles.chatArea}>
        {allMessages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {showCharacterTyping && (
          <div style={styles.typingRow}>
            <div style={styles.smallAvatar}>P</div>
            <div style={styles.typingDots}>
              <div style={{ ...styles.typingDot, animationDelay: '0s' }} />
              <div style={{ ...styles.typingDot, animationDelay: '0.2s' }} />
              <div style={{ ...styles.typingDot, animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ===== Bottom Bar ===== */}
      <div style={styles.bottomBar}>
        <div style={styles.inputWrapper}>
          <input
            className="phone-chat-input"
            style={styles.textInput}
            type="text"
            placeholder="Type a message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {inputText.trim() && (
            <button style={styles.sendBtn} onClick={handleSend} aria-label="Send">
              &#8593;
            </button>
          )}
        </div>
        <button style={styles.micBtn} aria-label="Voice">
          &#127908;
        </button>
        {/* Activity button → opens GamePanel */}
        <button
          ref={activityBtnRef}
          style={styles.activityBtn}
          onClick={onStartGame}
          aria-label="Activity"
        >
          <span>🍷</span><span style={{ fontSize: '14px' }}>🎲</span>
        </button>
      </div>

      {/* ===== Not Enough Drinks Popup ===== */}
      <NotEnoughPopup
        visible={showNotEnough}
        onClose={() => setShowNotEnough(false)}
      />
    </div>
  );
}
