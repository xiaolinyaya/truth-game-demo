import { useState, useEffect, useRef, useCallback } from 'react';

// ── Question bank data ──────────────────────────────────────────────
const QUESTIONS = [
  { level: 1, text: '你最开心的一天是哪天？' },
  { level: 1, text: '你觉得我是什么样的人？' },
  { level: 2, text: '你有没有对我说过谎？' },
  { level: 2, text: '你最害怕失去什么？' },
  { level: 3, text: '你最不想让我知道的事？' },
  { level: 3, text: '你梦到过我吗？' },
];

const LOCKED_QUESTIONS = [
  { level: 5, text: '你对我动过心吗？' },
  { level: 5, text: '如果只剩一天，你想和谁度过？' },
];

// ── Drunkenness bar sub-component ───────────────────────────────────
function DrunkennessBar({ drunkLevel, drunkProgress, onGiftWine }) {
  return (
    <div style={drunkBarStyles.container}>
      <span style={drunkBarStyles.icon}>🍷</span>
      <div style={drunkBarStyles.barOuter}>
        <div
          style={{
            ...drunkBarStyles.barInner,
            width: `${Math.min(100, Math.max(0, drunkProgress))}%`,
          }}
        />
      </div>
      <span style={drunkBarStyles.label}>Lv.{drunkLevel}</span>
      <button style={drunkBarStyles.giftBtn} onClick={onGiftWine}>
        送酒
      </button>
    </div>
  );
}

const drunkBarStyles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '10px',
    margin: '0 16px 8px',
  },
  icon: { fontSize: '18px' },
  barOuter: {
    flex: 1,
    height: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  barInner: {
    height: '100%',
    background: 'linear-gradient(90deg, #e85d75, #ff8fa3)',
    borderRadius: '4px',
    transition: 'width 0.4s ease',
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#ff8fa3',
    minWidth: '32px',
    textAlign: 'center',
  },
  giftBtn: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#fff',
    background: 'linear-gradient(135deg, #e85d75, #c94060)',
    border: 'none',
    borderRadius: '12px',
    padding: '4px 12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
};

// ── Main GamePanel component ────────────────────────────────────────
export default function GamePanel({
  panelState = 'roulette',
  demoMode = 'A',
  drunkLevel = 3,
  drunkProgress = 50,
  onRouletteResult,
  onSelectQuestion,
  onClose,
  onGiftWine,
  visible = false,
}) {
  // ── Roulette state ──────────────────────────────────────────────
  const [spinning, setSpinning] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0); // 0 = user, 1 = character
  const spinTimer = useRef(null);
  const stepTimer = useRef(null);

  // ── Question bank state ─────────────────────────────────────────
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [customQuestion, setCustomQuestion] = useState('');

  // Reset internal state when panel opens / changes state
  useEffect(() => {
    if (visible) {
      setSpinning(false);
      setSelectedQuestion(null);
      setCustomQuestion('');
      setHighlightIndex(0);
    }
    return () => {
      clearTimeout(spinTimer.current);
      clearInterval(stepTimer.current);
    };
  }, [visible, panelState]);

  // ── Roulette spin logic ─────────────────────────────────────────
  const startSpin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);

    let step = 0;
    const totalSteps = 14 + Math.floor(Math.random() * 6); // 14-19 bounces
    // Demo always lands on character for better showcase
    const landOnCharacter = Math.random() < 0.7;
    const finalIndex = landOnCharacter ? 1 : 0;

    // Make sure total steps parity matches the final index
    let adjustedSteps = totalSteps;
    if (adjustedSteps % 2 !== finalIndex) {
      adjustedSteps += 1;
    }

    // Start with fast bouncing, then slow down
    const bounce = () => {
      step += 1;
      setHighlightIndex((prev) => (prev === 0 ? 1 : 0));

      if (step >= adjustedSteps) {
        // Done spinning
        clearInterval(stepTimer.current);
        setSpinning(false);

        // Wait 1 second then notify parent
        spinTimer.current = setTimeout(() => {
          if (finalIndex === 1) {
            onRouletteResult?.('character');
          } else {
            onRouletteResult?.('user');
          }
        }, 1000);
        return;
      }

      // Gradually slow down: recalculate interval for next step
      const progress = step / adjustedSteps;
      const nextInterval = 100 + progress * 400; // 100ms → 500ms
      clearInterval(stepTimer.current);
      stepTimer.current = setTimeout(bounce, nextInterval);
    };

    // Initial kick
    setHighlightIndex(0);
    stepTimer.current = setTimeout(bounce, 120);
  }, [spinning, onRouletteResult]);

  // ── Confirm question ────────────────────────────────────────────
  const handleConfirm = () => {
    const question = customQuestion.trim() || selectedQuestion;
    if (question) {
      onSelectQuestion?.(question);
    }
  };

  // ── Determine which questions are available ─────────────────────
  const availableQuestions = QUESTIONS.filter((q) => q.level <= drunkLevel);
  const unavailableQuestions = QUESTIONS.filter((q) => q.level > drunkLevel);

  // ── Render ──────────────────────────────────────────────────────
  return (
    <>
      {/* Overlay */}
      <div
        style={{
          ...s.overlay,
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        style={{
          ...s.panel,
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {/* Drag handle */}
        <div style={s.handleBar}>
          <div style={s.handle} />
        </div>

        {/* ═══════════ ROULETTE STATE ═══════════ */}
        <div
          style={{
            ...s.stateContainer,
            opacity: panelState === 'roulette' ? 1 : 0,
            transform: panelState === 'roulette' ? 'translateX(0)' : 'translateX(-30px)',
            pointerEvents: panelState === 'roulette' ? 'auto' : 'none',
            position: panelState === 'roulette' ? 'relative' : 'absolute',
            width: '100%',
          }}
        >
          <h3 style={s.title}>🎲 真心话</h3>

          {demoMode === 'B' && (
            <DrunkennessBar
              drunkLevel={drunkLevel}
              drunkProgress={drunkProgress}
              onGiftWine={onGiftWine}
            />
          )}

          {/* Two circles */}
          <div style={s.circlesRow}>
            {/* User circle */}
            <div style={s.circleWrapper}>
              <div
                style={{
                  ...s.circle,
                  ...(highlightIndex === 0 && spinning ? s.circleActive : {}),
                  ...(highlightIndex === 0 && !spinning && spinning === false
                    ? {}
                    : {}),
                }}
              >
                <div
                  style={{
                    ...s.circleGlow,
                    opacity: highlightIndex === 0 ? 1 : 0,
                  }}
                />
                <span style={s.circleEmoji}>👤</span>
              </div>
              <span style={s.circleLabel}>You</span>
            </div>

            {/* VS indicator */}
            <div style={s.vsContainer}>
              <span style={{ ...s.vsText, ...(spinning ? s.vsPulse : {}) }}>VS</span>
            </div>

            {/* Character circle */}
            <div style={s.circleWrapper}>
              <div
                style={{
                  ...s.circle,
                  ...s.circleCharacter,
                  ...(highlightIndex === 1 && spinning ? s.circleActive : {}),
                }}
              >
                <div
                  style={{
                    ...s.circleGlow,
                    opacity: highlightIndex === 1 ? 1 : 0,
                  }}
                />
                <span style={s.circleEmoji}>🎭</span>
              </div>
              <span style={s.circleLabel}>Prisoner</span>
            </div>
          </div>

          {/* Start button */}
          <button
            style={{
              ...s.startBtn,
              ...(spinning ? s.startBtnDisabled : {}),
            }}
            onClick={startSpin}
            disabled={spinning}
          >
            {spinning ? '抽选中...' : '开始'}
          </button>
        </div>

        {/* ═══════════ QUESTION BANK STATE ═══════════ */}
        <div
          style={{
            ...s.stateContainer,
            opacity: panelState === 'questionBank' ? 1 : 0,
            transform: panelState === 'questionBank' ? 'translateX(0)' : 'translateX(30px)',
            pointerEvents: panelState === 'questionBank' ? 'auto' : 'none',
            position: panelState === 'questionBank' ? 'relative' : 'absolute',
            width: '100%',
          }}
        >
          <h3 style={s.title}>🎲 真心话 → 角色回答</h3>

          {demoMode === 'B' && (
            <DrunkennessBar
              drunkLevel={drunkLevel}
              drunkProgress={drunkProgress}
              onGiftWine={onGiftWine}
            />
          )}

          {/* Scrollable question list */}
          <div style={s.questionList}>
            {/* Available questions */}
            {availableQuestions.map((q, idx) => {
              const isSelected = selectedQuestion === q.text;
              return (
                <div
                  key={`avail-${idx}`}
                  style={{
                    ...s.questionRow,
                    ...(isSelected ? s.questionRowSelected : {}),
                  }}
                  onClick={() => {
                    setSelectedQuestion(q.text);
                    setCustomQuestion('');
                  }}
                >
                  <div style={s.radioOuter}>
                    {isSelected && <div style={s.radioInner} />}
                  </div>
                  <span style={s.questionLevel}>Lv.{q.level}</span>
                  <span style={s.questionText}>{q.text}</span>
                </div>
              );
            })}

            {/* Unavailable (level too high but not locked) */}
            {unavailableQuestions.map((q, idx) => (
              <div key={`unavail-${idx}`} style={{ ...s.questionRow, ...s.questionRowLocked }}>
                <div style={{ ...s.radioOuter, opacity: 0.3 }} />
                <span style={{ ...s.questionLevel, opacity: 0.4 }}>Lv.{q.level}</span>
                <span style={{ ...s.questionText, opacity: 0.4 }}>🔒 {q.text}</span>
              </div>
            ))}

            {/* Locked high-level questions */}
            {LOCKED_QUESTIONS.map((q, idx) => (
              <div key={`locked-${idx}`} style={{ ...s.questionRow, ...s.questionRowLocked }}>
                <div style={{ ...s.radioOuter, opacity: 0.3 }} />
                <span style={{ ...s.questionLevel, opacity: 0.4 }}>Lv.{q.level}</span>
                <span style={{ ...s.questionText, opacity: 0.4 }}>🔒 {q.text}</span>
              </div>
            ))}
          </div>

          {/* Custom question input */}
          <div style={s.customInputRow}>
            <input
              type="text"
              placeholder="输入自定义问题..."
              value={customQuestion}
              onChange={(e) => {
                setCustomQuestion(e.target.value);
                if (e.target.value.trim()) setSelectedQuestion(null);
              }}
              style={s.customInput}
            />
          </div>

          {/* Confirm button */}
          <button
            style={{
              ...s.confirmBtn,
              ...(!selectedQuestion && !customQuestion.trim() ? s.confirmBtnDisabled : {}),
            }}
            onClick={handleConfirm}
            disabled={!selectedQuestion && !customQuestion.trim()}
          >
            确认
          </button>
        </div>
      </div>

      {/* Keyframe animations injected via style tag */}
      <style>{keyframes}</style>
    </>
  );
}

// ── Keyframe CSS (injected once) ────────────────────────────────────
const keyframes = `
  @keyframes gamePanelPulse {
    0%, 100% { box-shadow: 0 0 12px rgba(232, 93, 117, 0.3); }
    50% { box-shadow: 0 0 28px rgba(232, 93, 117, 0.7); }
  }
  @keyframes gamePanelGlow {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
  @keyframes vsBounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.25); }
  }
`;

// ── Styles ──────────────────────────────────────────────────────────
const s = {
  // Overlay
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.55)',
    zIndex: 900,
    transition: 'opacity 0.35s ease',
  },

  // Panel
  panel: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60vh',
    maxWidth: '430px',
    margin: '0 auto',
    background: 'linear-gradient(180deg, #2d1520 0%, #1a0a0a 100%)',
    borderRadius: '20px 20px 0 0',
    zIndex: 910,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden',
    transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#fff',
  },

  // Drag handle
  handleBar: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: '10px 0 4px',
    cursor: 'grab',
  },
  handle: {
    width: '36px',
    height: '4px',
    borderRadius: '2px',
    background: 'rgba(255, 255, 255, 0.2)',
  },

  // State container (shared wrapper for both states)
  stateContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    transition: 'opacity 0.35s ease, transform 0.35s ease',
    paddingBottom: '16px',
  },

  // Title
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffd6dd',
    margin: '8px 0 10px',
    letterSpacing: '0.5px',
  },

  // ── Roulette circles ──────────────────────────────────────────
  circlesRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    margin: '20px 0 28px',
    width: '100%',
    padding: '0 24px',
    boxSizing: 'border-box',
  },
  circleWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  circle: {
    width: '88px',
    height: '88px',
    borderRadius: '50%',
    background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
    border: '2px solid rgba(255, 255, 255, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    overflow: 'hidden',
  },
  circleCharacter: {
    background: 'linear-gradient(145deg, rgba(232, 93, 117, 0.15), rgba(201, 64, 96, 0.08))',
    border: '2px solid rgba(232, 93, 117, 0.2)',
  },
  circleActive: {
    borderColor: '#e85d75',
    boxShadow: '0 0 20px rgba(232, 93, 117, 0.5)',
    animation: 'gamePanelPulse 0.6s ease infinite',
  },
  circleGlow: {
    position: 'absolute',
    inset: '-4px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(232, 93, 117, 0.25) 0%, transparent 70%)',
    transition: 'opacity 0.15s ease',
    pointerEvents: 'none',
    animation: 'gamePanelGlow 1s ease infinite',
  },
  circleEmoji: {
    fontSize: '36px',
    position: 'relative',
    zIndex: 1,
  },
  circleLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: '0.3px',
  },

  // VS
  vsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  vsText: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.3)',
    letterSpacing: '2px',
    transition: 'color 0.2s ease',
  },
  vsPulse: {
    color: '#e85d75',
    animation: 'vsBounce 0.5s ease infinite',
  },

  // Start button
  startBtn: {
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
    transition: 'opacity 0.2s ease, transform 0.15s ease',
    marginTop: 'auto',
    marginBottom: '8px',
  },
  startBtnDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
    transform: 'none',
  },

  // ── Question bank ─────────────────────────────────────────────
  questionList: {
    width: '100%',
    flex: 1,
    overflowY: 'auto',
    padding: '0 16px',
    boxSizing: 'border-box',
  },
  questionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    margin: '4px 0',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.04)',
    cursor: 'pointer',
    transition: 'background 0.2s ease, border-color 0.2s ease',
    border: '1px solid transparent',
  },
  questionRowSelected: {
    background: 'rgba(232, 93, 117, 0.12)',
    borderColor: 'rgba(232, 93, 117, 0.4)',
  },
  questionRowLocked: {
    cursor: 'default',
    opacity: 0.6,
  },
  radioOuter: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioInner: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#e85d75',
  },
  questionLevel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#ff8fa3',
    minWidth: '28px',
    flexShrink: 0,
  },
  questionText: {
    fontSize: '14px',
    color: '#f0d6dc',
    lineHeight: '1.4',
  },

  // Custom input
  customInputRow: {
    width: '100%',
    padding: '8px 16px',
    boxSizing: 'border-box',
  },
  customInput: {
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    color: '#f0d6dc',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
  },

  // Confirm button
  confirmBtn: {
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
    flexShrink: 0,
  },
  confirmBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
};
