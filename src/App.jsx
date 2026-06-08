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
  // Navigation
  const [currentPage, setCurrentPage] = useState('main');

  // Game state
  const [drunkPercent, setDrunkPercent] = useState(0);
  const [messages, setMessages] = useState([]);
  const [mainChatMessages, setMainChatMessages] = useState([]);
  const [showCharacterTyping, setShowCharacterTyping] = useState(false);
  const [gamePanelVisible, setGamePanelVisible] = useState(false);
  const [truthUnlocked, setTruthUnlocked] = useState(false);
  const [drinkInventory, setDrinkInventory] = useState(5);

  // Toast
  const [toastText, setToastText] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Timer refs for cleanup
  const timersRef = useRef([]);
  const activityBtnRef = useRef(null);
  const unlockCardSentRef = useRef(false);

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
    }, 800);
  }, [addTimer]);

  // ── Flow: Start game (from phone chat toolbar) ──
  const onStartGame = useCallback(() => {
    setGamePanelVisible(true);
  }, []);

  // ── Flow: Roulette result (only 'user' comes here; 'character' handled inside GamePanel) ──
  const onRouletteResult = useCallback(
    (result) => {
      if (result === 'user') {
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
  const onGiftWine = useCallback((source) => {
    if (drinkInventory <= 0) return false;

    setDrinkInventory((prev) => prev - 1);
    showToast('\uD83C\uDF77 Drink sent! +10%');

    setDrunkPercent((prev) => {
      const next = Math.min(500, prev + 10);

      // Unlock card at 20% — only once, only from main chat
      if (source === 'chat' && next >= 20 && !unlockCardSentRef.current) {
        unlockCardSentRef.current = true;
        setTruthUnlocked(true);
        addTimer(() => {
          setMainChatMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: 'unlock-card',
              text: '',
              time: now_HHMM(),
            },
          ]);
        }, 800);
      }

      return next;
    });

    return true;
  }, [showToast, addTimer, drinkInventory]);

  // ── Flow: Back to main ──
  const onBack = useCallback(() => {
    clearAllTimers();
    setCurrentPage('main');
    setMessages([]);
    setShowCharacterTyping(false);
    setGamePanelVisible(false);
  }, [clearAllTimers]);

  // ── Flow: Close game panel ──
  const onClosePanel = useCallback(() => {
    setGamePanelVisible(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  return (
    <div style={styles.page}>
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
          <MainChatPage
            onEnterPhoneChat={onEnterPhoneChat}
            onGiftWine={onGiftWine}
            truthUnlocked={truthUnlocked}
            mainChatMessages={mainChatMessages}
            drinkInventory={drinkInventory}
          />
        )}

        {currentPage === 'phone' && (
          <>
            <PhoneChatPage
              onBack={onBack}
              onStartGame={onStartGame}
              onGiftWine={onGiftWine}
              messages={messages}
              showCharacterTyping={showCharacterTyping}
              onSendMessage={onSendMessage}
              truthUnlocked={truthUnlocked}
              drinkInventory={drinkInventory}
              activityBtnRef={activityBtnRef}
            />
            <GamePanel
              drunkPercent={drunkPercent}
              drinkInventory={drinkInventory}
              onRouletteResult={onRouletteResult}
              onSelectQuestion={onSelectQuestion}
              onClose={onClosePanel}
              onGiftWine={onGiftWine}
              visible={gamePanelVisible}
              characterName="Prisoner"
              roleCardName="Kate"
              anchorRef={activityBtnRef}
            />
          </>
        )}
      </div>
    </div>
  );
}
