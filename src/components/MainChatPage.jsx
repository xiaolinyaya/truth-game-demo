import { useState } from 'react';

const styles = {
  container: {
    maxWidth: '390px',
    margin: '0 auto',
    height: '100vh',
    background: 'linear-gradient(180deg, #1a0e3e 0%, #2d1b69 40%, #1a0e3e 100%)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },

  // Top bar
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    paddingTop: '48px',
    background: 'rgba(26, 14, 62, 0.85)',
    backdropFilter: 'blur(10px)',
    zIndex: 10,
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  backArrow: {
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px',
    color: '#c9b8f0',
  },
  characterName: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#fff',
  },
  levelBadge: {
    fontSize: '11px',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #6c4fcf, #a855f7)',
    borderRadius: '10px',
    padding: '2px 8px',
    color: '#fff',
  },
  topTab: {
    fontSize: '13px',
    color: '#a394c8',
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '14px',
    padding: '4px 12px',
  },
  hamburger: {
    fontSize: '20px',
    cursor: 'pointer',
    color: '#c9b8f0',
    padding: '4px',
  },

  // Chat area
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  chatBubble: {
    maxWidth: '85%',
    padding: '14px 16px',
    borderRadius: '18px',
    fontSize: '14px',
    lineHeight: '1.55',
    color: '#e8dff5',
  },
  narrativeBubble: {
    background: 'linear-gradient(135deg, rgba(75, 45, 150, 0.6), rgba(45, 27, 105, 0.7))',
    border: '1px solid rgba(140, 100, 220, 0.2)',
    alignSelf: 'flex-start',
  },
  dialogueBubble: {
    background: 'linear-gradient(135deg, rgba(90, 55, 170, 0.5), rgba(60, 35, 130, 0.6))',
    border: '1px solid rgba(160, 120, 240, 0.25)',
    alignSelf: 'flex-start',
  },
  italicText: {
    fontStyle: 'italic',
    color: '#c4b5e0',
  },
  speakerLabel: {
    fontWeight: '600',
    color: '#d4a8ff',
    marginBottom: '4px',
    fontSize: '13px',
  },

  // Toolbar row
  toolbarRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px',
    background: 'rgba(26, 14, 62, 0.7)',
    borderTop: '1px solid rgba(140, 100, 220, 0.15)',
  },
  toolbarLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#a88edb',
    letterSpacing: '0.5px',
  },
  toolbarCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '14px',
    color: '#d4a8ff',
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  toolbarIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#b89edb',
  },

  // Input area
  inputArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'rgba(26, 14, 62, 0.85)',
  },
  textInput: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(140, 100, 220, 0.2)',
    borderRadius: '22px',
    padding: '10px 16px',
    color: '#e8dff5',
    fontSize: '14px',
    outline: 'none',
  },
  micButton: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c4fcf, #a855f7)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#fff',
    flexShrink: 0,
  },
  closeButton: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#a394c8',
    flexShrink: 0,
  },

  // Bottom action buttons
  bottomActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '12px 16px',
    paddingBottom: '28px',
    background: 'rgba(26, 14, 62, 0.9)',
  },
  actionButton: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.07)',
    border: '1px solid rgba(140, 100, 220, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    gap: '3px',
    transition: 'all 0.2s ease',
    color: '#c9b8f0',
  },
  actionButtonIcon: {
    fontSize: '22px',
  },
  actionButtonLabel: {
    fontSize: '9px',
    fontWeight: '600',
    letterSpacing: '0.3px',
    color: '#b89edb',
  },
  truthButton: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.35), rgba(108, 79, 207, 0.45))',
    border: '1px solid rgba(168, 85, 247, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    gap: '3px',
    transition: 'all 0.2s ease',
    color: '#e0c4ff',
    boxShadow: '0 0 16px rgba(168, 85, 247, 0.25)',
  },
};

const mockMessages = [
  {
    type: 'narrative',
    text: 'The dimly lit bar hums with soft jazz. Lane sits across from you, swirling a glass of wine, his silver rings catching the flickering candlelight.',
  },
  {
    type: 'dialogue',
    speaker: 'Lane',
    text: '"You actually came." He looks up, a faint smile tugging at the corner of his lips. "I wasn\'t sure you would."',
  },
  {
    type: 'narrative',
    text: 'He leans back in the velvet booth, studying you with those sharp, unreadable eyes. The kind of gaze that makes you feel like he already knows your secrets.',
  },
  {
    type: 'dialogue',
    speaker: 'Lane',
    text: '"So tell me something real. Not the small talk. I get enough of that." He tilts his head, waiting.',
  },
];

export default function MainChatPage({ onEnterPhoneChat, onGiftWine }) {
  const [inputValue, setInputValue] = useState('');

  return (
    <div style={styles.container}>
      {/* Top Bar */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <span style={styles.backArrow}>&#8249;</span>
          <span style={styles.characterName}>Lane</span>
          <span style={styles.levelBadge}>LV0</span>
        </div>
        <span style={styles.topTab}>Top Pic...</span>
        <span style={styles.hamburger}>&#9776;</span>
      </div>

      {/* Chat Area */}
      <div style={styles.chatArea}>
        {mockMessages.map((msg, idx) => {
          if (msg.type === 'narrative') {
            return (
              <div
                key={idx}
                style={{ ...styles.chatBubble, ...styles.narrativeBubble }}
              >
                <span style={styles.italicText}>{msg.text}</span>
              </div>
            );
          }
          return (
            <div
              key={idx}
              style={{ ...styles.chatBubble, ...styles.dialogueBubble }}
            >
              <div style={styles.speakerLabel}>{msg.speaker}</div>
              <span>{msg.text}</span>
            </div>
          );
        })}
      </div>

      {/* Toolbar Row */}
      <div style={styles.toolbarRow}>
        <span style={styles.toolbarLabel}>TATW</span>
        <div style={{...styles.toolbarCenter, cursor: 'pointer'}} onClick={onGiftWine}>
          <span role="img" aria-label="wine">🍷</span>
          <span>&times;9</span>
        </div>
        <div style={styles.toolbarRight}>
          <div style={styles.toolbarIcon}>⚙</div>
          <div style={styles.toolbarIcon}>📋</div>
        </div>
      </div>

      {/* Input Area */}
      <div style={styles.inputArea}>
        <input
          style={styles.textInput}
          type="text"
          placeholder="Text or hold to talk..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button style={styles.micButton} aria-label="Microphone">
          🎤
        </button>
        <button style={styles.closeButton} aria-label="Close">
          ✕
        </button>
      </div>

      {/* Bottom Action Buttons */}
      <div style={styles.bottomActions}>
        <div
          style={styles.actionButton}
          role="button"
          tabIndex={0}
          aria-label="Question"
        >
          <span style={styles.actionButtonIcon}>❓</span>
        </div>

        <div
          style={styles.actionButton}
          role="button"
          tabIndex={0}
          aria-label="Camera"
        >
          <span style={styles.actionButtonIcon}>📷</span>
        </div>

        <div
          style={styles.truthButton}
          role="button"
          tabIndex={0}
          aria-label="Truth Game"
          onClick={onEnterPhoneChat}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onEnterPhoneChat?.();
          }}
        >
          <span style={styles.actionButtonIcon}>🎲</span>
          <span style={styles.actionButtonLabel}>Truth</span>
        </div>
      </div>
    </div>
  );
}
