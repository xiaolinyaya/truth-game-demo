import { useState, useEffect, useRef, useCallback } from 'react';

// ── Question pool ────────────────────────────────────────────────────
const QUESTION_POOL = [
  { minPercent: 0, text: '你最开心的一天是哪天？' },
  { minPercent: 0, text: '你觉得我是什么样的人？' },
  { minPercent: 0, text: '你最喜欢自己什么？' },
  { minPercent: 0, text: '你最珍贵的回忆是什么？' },
  { minPercent: 0, text: '你小时候的梦想是什么？' },
  { minPercent: 0, text: '如果可以去任何地方，你想去哪？' },
  { minPercent: 100, text: '你有没有对我说过谎？' },
  { minPercent: 100, text: '你最害怕失去什么？' },
  { minPercent: 100, text: '你最后一次哭是什么时候？' },
  { minPercent: 100, text: '你有什么后悔的事吗？' },
  { minPercent: 100, text: '你最想改变自己什么？' },
  { minPercent: 100, text: '你心里的秘密基地在哪里？' },
  { minPercent: 200, text: '你最不想让我知道的事？' },
  { minPercent: 200, text: '你梦到过我吗？' },
  { minPercent: 200, text: '你最深处的秘密是什么？' },
  { minPercent: 200, text: '你上次感到真正孤独是什么时候？' },
  { minPercent: 200, text: '你做过最疯狂的事是什么？' },
  { minPercent: 400, text: '你对我动过心吗？' },
  { minPercent: 400, text: '如果只剩一天，你想和谁度过？' },
  { minPercent: 400, text: '你有没有想过如果我们之间...' },
];

// ── SVG Wheel constants ─────────────────────────────────────────────
const WHEEL_SIZE = 190;
const WHEEL_R = 85;
const WHEEL_CX = WHEEL_SIZE / 2;
const WHEEL_CY = WHEEL_SIZE / 2;
const RIGHT_PATH = `M${WHEEL_CX},${WHEEL_CY} L${WHEEL_CX},${WHEEL_CY - WHEEL_R} A${WHEEL_R},${WHEEL_R} 0 0,1 ${WHEEL_CX},${WHEEL_CY + WHEEL_R} Z`;
const LEFT_PATH = `M${WHEEL_CX},${WHEEL_CY} L${WHEEL_CX},${WHEEL_CY + WHEEL_R} A${WHEEL_R},${WHEEL_R} 0 0,1 ${WHEEL_CX},${WHEEL_CY - WHEEL_R} Z`;

// ── Helper: pick N random items from pool ───────────────────────────
function pickRandom(pool, n) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

// ── Helper: heat level status name by percentage ────────────────────
function getHeatStatus(percent) {
  if (percent >= 100) return 'Lost in the Night';
  if (percent >= 80) return 'After Midnight';
  if (percent >= 60) return 'Midnight Mood';
  if (percent >= 40) return 'Tipsy';
  if (percent >= 20) return 'Relax';
  return 'Warm Up';
}

// ── Not Enough Drinks Popup ─────────────────────────────────────────
function NotEnoughPopup({ visible, onClose, characterName }) {
  if (!visible) return null;
  return (
    <>
      <div style={popupS.overlay} onClick={onClose} />
      <div style={popupS.container}>
        <button style={popupS.closeBtn} onClick={onClose}>✕</button>
        <div style={popupS.emoji}>🍷</div>
        <h3 style={popupS.title}>Not Enough Drinks</h3>
        <p style={popupS.text}>
          {characterName}'s glass is empty — top it up to keep going.
        </p>
        <button style={popupS.actionBtn} onClick={onClose}>
          Get More
        </button>
      </div>
    </>
  );
}

const popupS = {
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    zIndex: 20,
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
    zIndex: 21,
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

// ── Main GamePanel component ────────────────────────────────────────
export default function GamePanel({
  drunkPercent = 0,
  drinkInventory = 5,
  onRouletteResult,
  onSelectQuestion,
  onClose,
  onGiftWine,
  visible = false,
  characterName = 'Prisoner',
  roleCardName = 'Kate',
  anchorRef,
}) {
  // ── Wheel state ───────────────────────────────────────────────────
  const [wheelPhase, setWheelPhase] = useState('idle');
  const [resultTarget, setResultTarget] = useState(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const spinTimerRef = useRef(null);
  const panelRef = useRef(null);

  // ── Close animation state ─────────────────────────────────────────
  const [closing, setClosing] = useState(false);
  const [closeStyle, setCloseStyle] = useState({});
  const closingTimerRef = useRef(null);

  // ── Question bank state ───────────────────────────────────────────
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [displayedQuestions, setDisplayedQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [inputValue, setInputValue] = useState('');

  // ── Not Enough Drinks popup ───────────────────────────────────────
  const [showNotEnough, setShowNotEnough] = useState(false);

  // ── Toast state ───────────────────────────────────────────────────
  const [toastText, setToastText] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((text) => {
    setToastText(text);
    setToastVisible(true);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2000);
  }, []);

  const refreshQuestions = useCallback(() => {
    setDisplayedQuestions(pickRandom(
      QUESTION_POOL.filter((q) => q.minPercent <= drunkPercent),
      5
    ));
    setSelectedQuestion(null);
  }, [drunkPercent]);

  // ── Reset internal state when panel opens ──────────────────────────
  useEffect(() => {
    if (visible) {
      setWheelPhase('idle');
      setResultTarget(null);
      setWheelRotation(0);
      setShowQuestionBank(false);
      setSelectedQuestion(null);
      setInputValue('');
      setShowNotEnough(false);
    }
    return () => {
      clearTimeout(spinTimerRef.current);
      clearTimeout(closingTimerRef.current);
      clearTimeout(toastTimerRef.current);
    };
  }, [visible]);

  // ── Close with shrink-to-anchor animation ─────────────────────────
  const handleClose = useCallback(() => {
    if (closing) return;
    const btn = anchorRef?.current;
    const panel = panelRef.current;
    if (btn && panel) {
      const btnRect = btn.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const panelCX = panelRect.left + panelRect.width / 2;
      const panelCY = panelRect.top + panelRect.height / 2;
      const btnCX = btnRect.left + btnRect.width / 2;
      const btnCY = btnRect.top + btnRect.height / 2;
      const dx = btnCX - panelCX;
      const dy = btnCY - panelCY;
      const targetScale = btnRect.width / panelRect.width;

      setCloseStyle({
        transform: `translate(${dx}px, ${dy}px) scale(${targetScale})`,
        opacity: 0,
        borderRadius: '50%',
      });
      setClosing(true);

      closingTimerRef.current = setTimeout(() => {
        setClosing(false);
        setCloseStyle({});
        onClose?.();
      }, 420);
    } else {
      onClose?.();
    }
  }, [closing, anchorRef, onClose]);

  // ── Send drink handler (with Not Enough popup) ────────────────────
  const handleSendDrink = useCallback(() => {
    if (drinkInventory <= 0) {
      setShowNotEnough(true);
      return;
    }
    onGiftWine?.();
  }, [drinkInventory, onGiftWine]);

  // ── Spin logic ────────────────────────────────────────────────────
  const handleSpinClick = useCallback(() => {
    if (drunkPercent < 20) {
      showToast(`${characterName} needs to be at least 20% heated up to spin.`);
      return;
    }
    if (wheelPhase !== 'idle') return;
    setWheelPhase('spinning');
    setResultTarget(null);
    setShowQuestionBank(false);

    const landOnCharacter = Math.random() < 0.5;
    const spins = 4 + Math.floor(Math.random() * 2);
    const offset = (Math.random() - 0.5) * 50;
    const targetAngle = landOnCharacter ? 90 + offset : 270 + offset;
    const totalRotation = spins * 360 + targetAngle;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setWheelRotation(totalRotation);
      });
    });

    spinTimerRef.current = setTimeout(() => {
      setWheelPhase('result');
      setResultTarget(landOnCharacter ? 'character' : 'user');
    }, 2200);
  }, [wheelPhase, drunkPercent, characterName, showToast]);

  // ── Handle roulette result button click ───────────────────────────
  const handleResultAction = useCallback(() => {
    if (resultTarget === 'character') {
      setShowQuestionBank(true);
      setDisplayedQuestions(pickRandom(
        QUESTION_POOL.filter((q) => q.minPercent <= drunkPercent),
        5
      ));
      setSelectedQuestion(null);
      setInputValue('');
    } else if (resultTarget === 'user') {
      onRouletteResult?.('user');
    }
  }, [resultTarget, onRouletteResult, drunkPercent]);

  // ── Question bank handlers ────────────────────────────────────────
  const handleSelectOption = (text) => {
    setSelectedQuestion(text);
  };

  const handleInputFocus = () => {
    if (selectedQuestion) setSelectedQuestion(null);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (e.target.value) setSelectedQuestion(null);
  };

  const handleAsk = () => {
    const question = selectedQuestion || inputValue.trim();
    if (question) onSelectQuestion?.(question);
  };

  // ── Derived values ────────────────────────────────────────────────
  const wheelTransition =
    wheelPhase === 'spinning'
      ? 'transform 2s cubic-bezier(0.17, 0.67, 0.12, 0.99)'
      : 'none';

  const canSpin = drunkPercent >= 20;

  let btnText = 'Spin the Wheel';
  let btnDisabled = false;
  let btnOnClick = handleSpinClick;
  if (wheelPhase === 'spinning') {
    btnText = 'Spinning';
    btnDisabled = true;
    btnOnClick = undefined;
  } else if (wheelPhase === 'result') {
    btnDisabled = false;
    btnOnClick = handleResultAction;
    btnText = resultTarget === 'character' ? 'Ask a Question' : 'Answer the Question';
  } else if (!canSpin) {
    btnDisabled = true;
  }

  const askActive = !!selectedQuestion || !!inputValue.trim();
  const inputDisplayValue = selectedQuestion ? '' : inputValue;

  // Progress bar fill: wraps every 20%
  const barFill = drunkPercent >= 500 ? 100 : ((drunkPercent % 20) / 20 * 100);

  // ── Render ────────────────────────────────────────────────────────
  return (
    <>
      {/* Overlay */}
      <div
        style={{
          ...s.overlay,
          opacity: visible && !closing ? 1 : 0,
          pointerEvents: visible && !closing ? 'auto' : 'none',
        }}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        style={{
          ...s.panel,
          ...(closing
            ? {
                ...closeStyle,
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.7, 0.2), opacity 0.4s ease 0.1s, border-radius 0.4s ease',
                overflow: 'hidden',
              }
            : {
                transform: visible ? 'translateY(0)' : 'translateY(100%)',
                opacity: 1,
              }
          ),
        }}
      >
        {/* Header: drag handle + close button */}
        <div style={s.headerRow}>
          <div style={s.handleBar}>
            <div style={s.handle} />
          </div>
          <button style={s.closeBtn} onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div style={s.scrollContainer}>

          {/* ═══════════ TITLE ═══════════ */}
          <h3 style={s.title}>Tidal Hearts</h3>

          {/* ═══════════ SECTION 1: HEAT LEVEL ═══════════ */}
          <div style={s.sectionBox}>
            <div style={s.sectionLabel}>Heat Level</div>

            <p style={s.ruleText}>
              {characterName}'s heat level shapes how {characterName} talks in Inbox.
              Hit 20% to unlock Heart Reveal and dig deeper.
              Heads up — heat level fades 20% every hour.
            </p>

            {/* Drunk progress + Send drink */}
            <div style={s.drunkSection}>
              <div style={s.drunkHeader}>
                <span style={s.drunkLabel}>{getHeatStatus(drunkPercent)}</span>
                <span style={s.drunkPercentText}>{drunkPercent}%</span>
              </div>
              <div style={s.drunkTrack}>
                <div style={{
                  ...s.drunkFill,
                  width: `${barFill}%`,
                }} />
              </div>
              <div style={s.drunkRow}>
                <span style={s.drunkDesc}>Send drinks to raise heat level</span>
                <button style={s.drunkSendBtn} onClick={handleSendDrink}>
                  🍷 <span style={s.drunkInv}>×{drinkInventory}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={s.divider} />

          {/* ═══════════ SECTION 2: HEART REVEAL ═══════════ */}
          <div style={s.sectionBox}>
            <div style={s.sectionLabel}>Heart Reveal</div>

            <p style={s.ruleText}>
              Spin the wheel to pick who answers.
            </p>

            {/* Wheel */}
            <div style={s.wheelWrapper}>
              <div style={s.pointer}>▼</div>
              <svg
                viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
                style={{ width: WHEEL_SIZE, height: WHEEL_SIZE, display: 'block', marginTop: 14 }}
              >
                <circle
                  cx={WHEEL_CX} cy={WHEEL_CY} r={WHEEL_R + 4}
                  fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2"
                />
                <g style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transformOrigin: `${WHEEL_CX}px ${WHEEL_CY}px`,
                  transition: wheelTransition,
                }}>
                  <path d={RIGHT_PATH} fill="#e85d75" />
                  <path d={LEFT_PATH} fill="#7c5cbf" />
                  <line
                    x1={WHEEL_CX} y1={WHEEL_CY - WHEEL_R}
                    x2={WHEEL_CX} y2={WHEEL_CY + WHEEL_R}
                    stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"
                  />
                  <text x={WHEEL_CX + WHEEL_R * 0.5} y={WHEEL_CY}
                    textAnchor="middle" dominantBaseline="central"
                    fill="#fff" fontSize="12" fontWeight="600">{characterName}</text>
                  <text x={WHEEL_CX - WHEEL_R * 0.5} y={WHEEL_CY}
                    textAnchor="middle" dominantBaseline="central"
                    fill="#fff" fontSize="12" fontWeight="600">{roleCardName}</text>
                  <circle cx={WHEEL_CX} cy={WHEEL_CY} r="10" fill="#2d1520" />
                  <circle cx={WHEEL_CX} cy={WHEEL_CY} r="4" fill="rgba(255,255,255,0.5)" />
                  {resultTarget === 'character' && (
                    <path d={RIGHT_PATH} fill="rgba(255,255,255,0.18)"
                      style={{ animation: 'wheelWinPulse 1s ease infinite' }} />
                  )}
                  {resultTarget === 'user' && (
                    <path d={LEFT_PATH} fill="rgba(255,255,255,0.18)"
                      style={{ animation: 'wheelWinPulse 1s ease infinite' }} />
                  )}
                </g>
              </svg>
            </div>

            {/* Legend */}
            <div style={s.legendRow}>
              <div style={{ ...s.legendItem, ...(resultTarget === 'character' ? s.legendItemActive : {}) }}>
                <div style={{ ...s.legendDot, background: '#e85d75' }} />
                <span>{characterName}</span>
              </div>
              <div style={{ ...s.legendItem, ...(resultTarget === 'user' ? s.legendItemActive : {}) }}>
                <div style={{ ...s.legendDot, background: '#7c5cbf' }} />
                <span>{roleCardName}</span>
              </div>
            </div>

            {resultTarget && (
              <div style={s.resultAnnounce}>
                {resultTarget === 'character'
                  ? `${characterName} answers!`
                  : `${roleCardName} answers!`}
              </div>
            )}

            {/* Spin / Result action button */}
            <button
              style={{
                ...s.actionBtn,
                ...(btnDisabled ? s.actionBtnDisabled : {}),
              }}
              onClick={btnOnClick}
              disabled={wheelPhase === 'spinning'}
            >
              {btnText}
            </button>
          </div>
        </div>

        {/* ═══════════ QUESTION BANK OVERLAY ═══════════ */}
        <div
          style={{
            ...s.qbOverlay,
            opacity: showQuestionBank ? 1 : 0,
            pointerEvents: showQuestionBank ? 'auto' : 'none',
          }}
        >
          <div style={s.qbHeader}>
            <button style={s.qbBackBtn} onClick={() => setShowQuestionBank(false)}>
              &#8592;
            </button>
            <h3 style={s.qbTitle}>Tidal Hearts</h3>
            <button style={s.closeBtn} onClick={handleClose} aria-label="Close">
              ✕
            </button>
          </div>

          <div style={s.qbScrollContent}>
            <p style={s.qbSubtitle}>What do you want to ask {characterName}?</p>

            {/* Drunk progress in QB */}
            <div style={{ ...s.drunkSection, padding: '0 20px 8px' }}>
              <div style={s.drunkHeader}>
                <span style={s.drunkLabel}>{getHeatStatus(drunkPercent)}</span>
                <span style={s.drunkPercentText}>{drunkPercent}%</span>
              </div>
              <div style={s.drunkTrack}>
                <div style={{
                  ...s.drunkFill,
                  width: `${barFill}%`,
                }} />
              </div>
              <div style={s.drunkRow}>
                <span style={s.drunkDesc}>Send drinks to raise heat level</span>
                <button style={s.drunkSendBtn} onClick={handleSendDrink}>
                  🍷 <span style={s.drunkInv}>×{drinkInventory}</span>
                </button>
              </div>
            </div>

            {/* Question options */}
            <div style={s.optionsList}>
              {displayedQuestions.map((q, idx) => {
                const isSelected = selectedQuestion === q.text;
                return (
                  <div
                    key={`opt-${idx}-${q.text}`}
                    style={{
                      ...s.optionRow,
                      ...(isSelected ? s.optionRowSelected : {}),
                    }}
                    onClick={() => handleSelectOption(q.text)}
                  >
                    <div style={isSelected ? s.radioActive : s.radio}>
                      {isSelected && <div style={s.radioDot} />}
                    </div>
                    <span style={{ ...s.optionText, ...(isSelected ? s.optionTextSelected : {}) }}>
                      {q.text}
                    </span>
                  </div>
                );
              })}

              {/* Refresh button */}
              <div style={s.refreshRow}>
                <button style={s.refreshBtn} onClick={refreshQuestions}>
                  <span style={s.refreshIcon}>↻</span> Refresh
                </button>
              </div>
            </div>

            {/* Custom question input */}
            <div style={s.askInputRow}>
              <input
                type="text"
                placeholder="Type your question..."
                value={inputDisplayValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                style={s.askInput}
              />
            </div>

            {/* Ask button */}
            <button
              style={{
                ...s.askBtn,
                ...(!askActive ? s.askBtnDisabled : {}),
              }}
              onClick={handleAsk}
              disabled={!askActive}
            >
              Ask
            </button>
          </div>
        </div>

        {/* ═══════════ NOT ENOUGH DRINKS POPUP ═══════════ */}
        <NotEnoughPopup
          visible={showNotEnough}
          onClose={() => setShowNotEnough(false)}
          characterName={characterName}
        />

        {/* ═══════════ TOAST ═══════════ */}
        {toastText && (
          <div
            style={{
              ...s.toast,
              opacity: toastVisible ? 1 : 0,
            }}
          >
            {toastText}
          </div>
        )}
      </div>

      <style>{keyframes}</style>
    </>
  );
}

// ── Keyframe CSS ────────────────────────────────────────────────────
const keyframes = `
  @keyframes wheelWinPulse {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }
  @keyframes resultFadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// ── Styles ──────────────────────────────────────────────────────────
const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.55)',
    zIndex: 900,
    transition: 'opacity 0.35s ease',
  },

  panel: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '75vh',
    maxWidth: '430px',
    margin: '0 auto',
    background: 'linear-gradient(180deg, #2d1520 0%, #1a0a0a 100%)',
    borderRadius: '20px 20px 0 0',
    zIndex: 910,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#fff',
  },

  headerRow: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: '10px 0 4px',
    flexShrink: 0,
  },
  handleBar: {
    display: 'flex',
    justifyContent: 'center',
    cursor: 'grab',
  },
  handle: {
    width: '36px',
    height: '4px',
    borderRadius: '2px',
    background: 'rgba(255, 255, 255, 0.2)',
  },
  closeBtn: {
    position: 'absolute',
    right: '12px',
    top: '8px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.08)',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },

  scrollContainer: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: '20px',
  },

  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffd6dd',
    margin: '4px 0 10px',
    letterSpacing: '0.5px',
  },

  sectionBox: {
    width: '100%',
    padding: '0 20px',
    boxSizing: 'border-box',
  },
  sectionLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#ff8fa3',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '10px',
  },

  ruleText: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.55)',
    lineHeight: '1.5',
    margin: '0 0 10px',
  },

  // Drunk progress section
  drunkSection: {
    width: '100%',
    marginBottom: '12px',
  },
  drunkHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  drunkLabel: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#ff8fa3',
  },
  drunkPercentText: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#ffd6dd',
  },
  drunkTrack: {
    height: '6px',
    borderRadius: '3px',
    background: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    marginBottom: '6px',
  },
  drunkFill: {
    height: '100%',
    borderRadius: '3px',
    background: 'linear-gradient(90deg, #e85d75, #ff8fa3)',
    transition: 'width 0.4s ease',
  },
  drunkRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drunkDesc: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.35)',
  },
  drunkSendBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    background: 'linear-gradient(135deg, #e85d75, #c94060)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  drunkInv: {
    fontSize: '11px',
    opacity: 0.7,
  },

  divider: {
    width: 'calc(100% - 40px)',
    height: '1px',
    background: 'rgba(255, 255, 255, 0.08)',
    margin: '8px 0 14px',
  },

  // Wheel
  wheelWrapper: {
    position: 'relative',
    width: WHEEL_SIZE,
    height: WHEEL_SIZE + 16,
    margin: '4px auto 4px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  pointer: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 2,
    fontSize: '18px',
    lineHeight: 1,
    color: '#fff',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
  },

  legendRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    margin: '6px 0 2px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
    transition: 'color 0.3s ease',
  },
  legendItemActive: {
    color: '#fff',
    fontWeight: '700',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    flexShrink: 0,
  },

  resultAnnounce: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#ffd6dd',
    margin: '4px 0 2px',
    animation: 'resultFadeIn 0.4s ease',
    textAlign: 'center',
  },

  actionBtn: {
    width: '220px',
    padding: '14px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#fff',
    background: 'linear-gradient(135deg, #e85d75, #c94060)',
    border: 'none',
    borderRadius: '28px',
    cursor: 'pointer',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 20px rgba(232, 93, 117, 0.35)',
    transition: 'opacity 0.2s ease, transform 0.15s ease',
    margin: '12px auto 8px',
    display: 'block',
  },
  actionBtnDisabled: {
    opacity: 0.45,
    cursor: 'not-allowed',
    transform: 'none',
    boxShadow: 'none',
  },

  // Toast
  toast: {
    position: 'absolute',
    top: '50px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(60, 40, 120, 0.92)',
    color: '#fff',
    padding: '10px 22px',
    borderRadius: '22px',
    fontSize: '13px',
    fontWeight: 600,
    zIndex: 30,
    pointerEvents: 'none',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.4s ease',
    maxWidth: '90%',
    textAlign: 'center',
  },

  // ── Question bank overlay ─────────────────────────────────────────
  qbOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(180deg, #2d1520 0%, #1a0a0a 100%)',
    display: 'flex',
    flexDirection: 'column',
    transition: 'opacity 0.3s ease',
    zIndex: 5,
    borderRadius: '20px 20px 0 0',
  },
  qbHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 12px 8px',
    flexShrink: 0,
  },
  qbBackBtn: {
    background: 'none',
    border: 'none',
    color: '#ffd6dd',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px 8px 4px 0',
    lineHeight: 1,
  },
  qbTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffd6dd',
    flex: 1,
    margin: 0,
    letterSpacing: '0.5px',
  },
  qbScrollContent: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: '20px',
  },
  qbSubtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.55)',
    margin: '0 0 10px',
  },

  optionsList: {
    width: '100%',
    padding: '0 16px',
    boxSizing: 'border-box',
  },
  optionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    margin: '3px 0',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.04)',
    cursor: 'pointer',
    transition: 'background 0.2s ease, border-color 0.2s ease',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
  },
  optionRowSelected: {
    background: 'rgba(232, 93, 117, 0.12)',
    borderColor: 'rgba(232, 93, 117, 0.4)',
  },

  radio: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'border-color 0.2s ease',
  },
  radioActive: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#e85d75',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#e85d75',
  },

  optionText: {
    fontSize: '14px',
    color: '#f0d6dc',
    lineHeight: '1.35',
    transition: 'color 0.2s ease',
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },

  refreshRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '4px 0 0',
  },
  refreshBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    borderRadius: '8px',
    transition: 'color 0.2s ease, background 0.2s ease',
  },
  refreshIcon: {
    fontSize: '14px',
    fontWeight: '700',
  },

  askInputRow: {
    width: '100%',
    padding: '8px 16px',
    boxSizing: 'border-box',
  },
  askInput: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    color: '#f0d6dc',
    background: 'rgba(255, 255, 255, 0.06)',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
  },

  askBtn: {
    width: '200px',
    padding: '14px 0',
    fontSize: '17px',
    fontWeight: '700',
    color: '#fff',
    background: 'linear-gradient(135deg, #e85d75, #c94060)',
    border: 'none',
    borderRadius: '28px',
    cursor: 'pointer',
    letterSpacing: '1px',
    boxShadow: '0 4px 20px rgba(232, 93, 117, 0.35)',
    transition: 'opacity 0.2s ease',
    margin: '8px 0',
  },
  askBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
};
