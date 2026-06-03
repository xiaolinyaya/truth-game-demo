import { useState, useRef, useCallback, useEffect } from 'react';
import MainChatPage from './components/MainChatPage';
import PhoneChatPage from './components/PhoneChatPage';
import GamePanel from './components/GamePanel';

// ── Helper ──────────────────────────────────────────────
function now_HHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const CHARACTER_QUESTIONS = [
  '你有没有喜欢过别人？',
  '你最想对我说的一句话是什么？',
  '你觉得我们之间是什么关系？',
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeCharacterResponse(questionText) {
  const responses = {
    '你有没有喜欢过别人？':
      '（角色思考了一会儿）...这个问题啊...有过吧，不过那种感觉很模糊，像梦里的事情一样。',
    '你最想对我说的一句话是什么？':
      '（角色思考了一会儿）...这个问题啊...大概是"谢谢你愿意陪我坐在这里"。',
    '你觉得我们之间是什么关系？':
      '（角色思考了一会儿）...这个问题啊...比朋友近一点，但又说不上更多。你觉得呢？',
  };
  return responses[questionText] || '（角色思考了一会儿）...这个问题啊...让我想想怎么回答你。';
}

// ── Styles ──────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Toggle area
  toggleArea: {
    width: '100%',
    maxWidth: '600px',
    padding: '18px 20px 14px',
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  toggleBtnBase: {
    padding: '8px 18px',
    borderRadius: '20px',
    border: '2px solid transparent',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    lineHeight: 1.4,
  },
  toggleBtnActive: {
    background: 'linear-gradient(135deg, #e05555, #d44040)',
    color: '#fff',
    border: '2px solid #e05555',
    boxShadow: '0 2px 12px rgba(224, 85, 85, 0.35)',
  },
  toggleBtnInactive: {
    background: 'rgba(255,255,255,0.06)',
    color: '#888',
    border: '2px solid rgba(255,255,255,0.1)',
  },
  toggleDesc: {
    fontSize: '12px',
    color: '#777',
    marginTop: '4px',
    lineHeight: 1.5,
  },

  // Phone frame
  phoneFrame: {
    width: '390px',
    height: '844px',
    borderRadius: '40px',
    border: '3px solid #333',
    overflow: 'hidden',
    position: 'relative',
    background: '#000',
    boxShadow: '0 0 60px rgba(0,0,0,0.6), 0 0 20px rgba(80, 50, 160, 0.15)',
    flexShrink: 0,
  },

  // Toast
  toast: {
    position: 'absolute',
    top: '60px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(60, 40, 120, 0.92)',
    color: '#fff',
    padding: '10px 22px',
    borderRadius: '22px',
    fontSize: '14px',
    fontWeight: 600,
    zIndex: 1000,
    pointerEvents: 'none',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.4s ease',
  },
};

// ── App Component ───────────────────────────────────────
export default function App() {
  // Demo mode
  const [demoMode, setDemoMode] = useState('A');

  // Navigation
  const [currentPage, setCurrentPage] = useState('main');

  // Game state
  const [drunkLevel, setDrunkLevel] = useState(3);
  const [drunkProgress, setDrunkProgress] = useState(60);
  const [messages, setMessages] = useState([]);
  const [showCharacterTyping, setShowCharacterTyping] = useState(false);
  const [gamePanelVisible, setGamePanelVisible] = useState(false);
  const [panelState, setPanelState] = useState('roulette');

  // Toast
  const [toastText, setToastText] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Timer refs for cleanup
  const timersRef = useRef([]);

  const addTimer = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  // ── Toast helper ──
  const showToast = useCallback(
    (text) => {
      setToastText(text);
      setToastVisible(true);
      addTimer(() => setToastVisible(false), 2000);
    },
    [addTimer]
  );

  // ── Flow: Enter phone chat ──
  const onEnterPhoneChat = useCallback(() => {
    setCurrentPage('phone');
    addTimer(() => {
      setGamePanelVisible(true);
      setPanelState('roulette');
    }, 800);
  }, [addTimer]);

  // ── Flow: Start game (from phone chat toolbar) ──
  const onStartGame = useCallback(() => {
    setGamePanelVisible(true);
    setPanelState('roulette');
  }, []);

  // ── Flow: Roulette result ──
  const onRouletteResult = useCallback(
    (result) => {
      if (result === 'character') {
        setPanelState('questionBank');
      } else if (result === 'user') {
        setGamePanelVisible(false);
        addTimer(() => {
          const question = pickRandom(CHARACTER_QUESTIONS);
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              sender: 'character',
              text: question,
              time: now_HHMM(),
            },
          ]);
        }, 500);
      }
    },
    [addTimer]
  );

  // ── Flow: Select question from question bank ──
  const onSelectQuestion = useCallback(
    (questionText) => {
      setGamePanelVisible(false);

      // Add user question message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'user',
          text: questionText,
          time: now_HHMM(),
        },
      ]);

      // Character typing indicator after 1s
      addTimer(() => setShowCharacterTyping(true), 1000);

      // Character responds after 3s
      addTimer(() => {
        setShowCharacterTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: 'character',
            text: makeCharacterResponse(questionText),
            time: now_HHMM(),
          },
        ]);
      }, 3000);
    },
    [addTimer]
  );

  // ── Flow: User sends free-text message ──
  const onSendMessage = useCallback(
    (text) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: 'user',
          text,
          time: now_HHMM(),
        },
      ]);

      addTimer(() => setShowCharacterTyping(true), 1000);

      const genericResponses = [
        '嗯...我觉得...',
        '谢谢你告诉我这些',
        '...你说的我需要想想',
        '原来如此，谢谢你的坦诚',
      ];

      addTimer(() => {
        setShowCharacterTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: 'character',
            text: pickRandom(genericResponses),
            time: now_HHMM(),
          },
        ]);
      }, 2500);
    },
    [addTimer]
  );

  // ── Flow: Gift wine ──
  const onGiftWine = useCallback(() => {
    showToast('\uD83C\uDF77 送酒成功！醉意值 +10');
    setDrunkProgress((prev) => {
      const next = prev + 10;
      if (next > 100) {
        setDrunkLevel((lvl) => lvl + 1);
        return next - 100;
      }
      return next;
    });
  }, [showToast]);

  // ── Flow: Back to main ──
  const onBack = useCallback(() => {
    clearAllTimers();
    setCurrentPage('main');
    setMessages([]);
    setShowCharacterTyping(false);
    setGamePanelVisible(false);
    setPanelState('roulette');
  }, [clearAllTimers]);

  // ── Flow: Close game panel ──
  const onClosePanel = useCallback(() => {
    setGamePanelVisible(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // ── Descriptions per mode ──
  const demoDescriptions = {
    A: '小手机顶部显示醉意进度条和送酒入口',
    B: '小手机保持纯净聊天，醉意值收进游戏面板',
  };

  return (
    <div style={styles.page}>
      {/* ── Demo Mode Toggle ── */}
      <div style={styles.toggleArea}>
        <div style={styles.toggleRow}>
          <button
            style={{
              ...styles.toggleBtnBase,
              ...(demoMode === 'A' ? styles.toggleBtnActive : styles.toggleBtnInactive),
            }}
            onClick={() => setDemoMode('A')}
          >
            方案 A: 醉意值在聊天页
          </button>
          <button
            style={{
              ...styles.toggleBtnBase,
              ...(demoMode === 'B' ? styles.toggleBtnActive : styles.toggleBtnInactive),
            }}
            onClick={() => setDemoMode('B')}
          >
            方案 B: 醉意值在游戏面板
          </button>
        </div>
        <div style={styles.toggleDesc}>{demoDescriptions[demoMode]}</div>
      </div>

      {/* ── Phone Frame ── */}
      <div style={styles.phoneFrame}>
        {/* Toast Notification */}
        {toastText && (
          <div
            style={{
              ...styles.toast,
              opacity: toastVisible ? 1 : 0,
            }}
          >
            {toastText}
          </div>
        )}

        {/* Page Router */}
        {currentPage === 'main' && (
          <MainChatPage onEnterPhoneChat={onEnterPhoneChat} onGiftWine={onGiftWine} />
        )}

        {currentPage === 'phone' && (
          <>
            <PhoneChatPage
              demoMode={demoMode}
              onBack={onBack}
              onStartGame={onStartGame}
              onGiftWine={onGiftWine}
              messages={messages}
              showCharacterTyping={showCharacterTyping}
              onSendMessage={onSendMessage}
              drunkLevel={drunkLevel}
              drunkProgress={drunkProgress}
            />
            <GamePanel
              panelState={panelState}
              demoMode={demoMode}
              drunkLevel={drunkLevel}
              drunkProgress={drunkProgress}
              onRouletteResult={onRouletteResult}
              onSelectQuestion={onSelectQuestion}
              onClose={onClosePanel}
              onGiftWine={onGiftWine}
              visible={gamePanelVisible}
            />
          </>
        )}
      </div>
    </div>
  );
}
