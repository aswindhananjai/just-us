import { useState, useEffect, useRef } from 'react';
import '../styles/hit-game.css';

function HitRoshanHari() {
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [punchCount, setPunchCount] = useState(0);
  const [meterProgress, setMeterProgress] = useState(0);
  const [isExploding, setIsExploding] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showPunchEffect, setShowPunchEffect] = useState(false);
  const [motivationalText, setMotivationalText] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [shatterPieces, setShatterPieces] = useState([]);
  const [showAxe, setShowAxe] = useState(false);

  const audioRef = useRef(null);
  const explosionAudioRef = useRef(null);
  const maxPunches = 20;

  const initAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/hit-roshan/punch.mp3');
      audioRef.current.volume = 0.7;
      audioRef.current.preload = 'auto';

      audioRef.current.addEventListener('canplaythrough', () => {
        console.log('Punch audio can play through');
      });

      audioRef.current.addEventListener('error', (e) => {
        console.error('Punch audio error:', e);
        console.error('Error code:', audioRef.current.error?.code);
        console.error('Error message:', audioRef.current.error?.message);
      });

      audioRef.current.load();
      console.log('Punch audio initialized from:', audioRef.current.src);
    }
    if (!explosionAudioRef.current) {
      explosionAudioRef.current = new Audio('/hit-roshan/explosion.mp3');
      explosionAudioRef.current.volume = 0.8;
      explosionAudioRef.current.preload = 'auto';

      explosionAudioRef.current.addEventListener('canplaythrough', () => {
        console.log('Explosion audio can play through');
      });

      explosionAudioRef.current.addEventListener('error', (e) => {
        console.error('Explosion audio error:', e);
        console.error('Error code:', explosionAudioRef.current.error?.code);
        console.error('Error message:', explosionAudioRef.current.error?.message);
      });

      explosionAudioRef.current.load();
      console.log('Explosion audio initialized from:', explosionAudioRef.current.src);
    }
  };

  const motivationalMessages = [
    'Nice!', 'Keep going!', 'Yes!', 'Perfect!', 'Good one!',
    'Amazing!', 'Awesome!', 'Great hit!', 'Fantastic!', 'Brilliant!'
  ];

  const handleTargetSelect = (target) => {
    setSelectedTarget(target);
    initAudio(); // Initialize audio on first user interaction
  };

  const playPunchSound = () => {
    if (audioRef.current) {
      console.log('Playing punch sound...');
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => console.log('Punch sound played successfully'))
        .catch(err => console.log('Punch audio play failed:', err));
    } else {
      console.log('Punch audio not initialized');
    }
  };

  const generateShatterPieces = () => {
    const pieces = [];
    for (let i = 0; i < 20; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        velocityX: (Math.random() - 0.5) * 200,
        velocityY: (Math.random() - 0.5) * 200
      });
    }
    return pieces;
  };

  const handlePunch = () => {
    if (punchCount >= maxPunches || isExploding) return;

    // Ensure audio is initialized
    initAudio();

    // Play sound
    playPunchSound();

    // Trigger punch animation
    setShowPunchEffect(true);
    setTimeout(() => setShowPunchEffect(false), 300);

    // Update counter and meter
    const newCount = punchCount + 1;
    setPunchCount(newCount);
    setMeterProgress((newCount / maxPunches) * 100);

    // Show motivational text
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    setMotivationalText(randomMessage);
    setTimeout(() => setMotivationalText(''), 800);

    // Trigger haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Check if meter is full
    if (newCount >= maxPunches) {
      startExplosion();
    }
  };

  const startExplosion = () => {
    // Countdown
    let count = 3;
    setCountdown(count);

    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        setCountdown(null);
        clearInterval(countdownInterval);
        explode();
      }
    }, 1000);
  };

  const explode = () => {
    // Play explosion sound
    if (explosionAudioRef.current) {
      console.log('Playing explosion sound...');
      explosionAudioRef.current.currentTime = 0;
      explosionAudioRef.current.play()
        .then(() => console.log('Explosion sound played successfully'))
        .catch(err => console.log('Explosion audio play failed:', err));
    } else {
      console.log('Explosion audio not initialized');
    }

    setIsExploding(true);
    setShatterPieces(generateShatterPieces());

    // Show axe immediately after explosion starts
    setShowAxe(true);

    // Strong haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }

    // Hide axe and show completion after shatter animation
    setTimeout(() => {
      setShowAxe(false);
      setGameComplete(true);
    }, 1500);
  };

  const resetGame = () => {
    setSelectedTarget(null);
    setPunchCount(0);
    setMeterProgress(0);
    setIsExploding(false);
    setGameComplete(false);
    setShowPunchEffect(false);
    setMotivationalText('');
    setCountdown(null);
    setShatterPieces([]);
    setShowAxe(false);
  };

  return (
    <div className="hit-game-container">
      {!selectedTarget ? (
        // Target Selection Screen
        <div className="target-selection">
          <h1 className="game-title">Who needs a punch today?</h1>
          <div className="targets-grid">
            <div
              className="target-card"
              onClick={() => handleTargetSelect('roshan')}
            >
              <img src="/hit-roshan/roshan.png" alt="Roshan" />
              <div className="target-name">Roshan</div>
            </div>
            <div
              className="target-card"
              onClick={() => handleTargetSelect('hari')}
            >
              <img src="/hit-roshan/hari.png" alt="Hari" />
              <div className="target-name">Hari</div>
            </div>
          </div>
        </div>
      ) : (
        // Punching Game Screen
        <div className="punching-game">
          {!gameComplete ? (
            <>
              {/* Progress Meter */}
              <div className="progress-section">
                <div className="punch-counter">
                  Punches: {punchCount}
                </div>
                <div className="meter-container">
                  <div
                    className="meter-fill"
                    style={{ width: `${meterProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Motivational text OR Countdown - positioned between progress bar and image */}
              <div className="motivational-section">
                {countdown !== null ? (
                  <div className="countdown-display">
                    <div className="bomb-emoji">💣</div>
                    <div className="detonating-text">Detonating in</div>
                    <div className="countdown-number">{countdown}</div>
                  </div>
                ) : motivationalText ? (
                  <div className="motivational-text">{motivationalText}</div>
                ) : null}
              </div>

              {/* Target Image */}
              <div className="target-image-container">
                {showAxe && (
                  <div className="blast-overlay">💥</div>
                )}

                <img
                  src={`/hit-roshan/${selectedTarget}.png`}
                  alt={selectedTarget}
                  className={`target-image ${showPunchEffect ? 'shake' : ''} ${isExploding ? 'exploding' : ''}`}
                />

                {/* Shatter pieces */}
                {isExploding && shatterPieces.map(piece => (
                  <div
                    key={piece.id}
                    className="shatter-piece"
                    style={{
                      left: `${piece.x}%`,
                      top: `${piece.y}%`,
                      transform: `rotate(${piece.rotation}deg)`,
                      '--velocity-x': `${piece.velocityX}px`,
                      '--velocity-y': `${piece.velocityY}px`
                    }}
                  />
                ))}

                {/* Punch fist animation */}
                {showPunchEffect && (
                  <div className="punch-fist">👊</div>
                )}
              </div>

              {/* Punch Button */}
              {!isExploding && (
                <button
                  className="punch-button"
                  onClick={handlePunch}
                >
                  <span className="punch-button-text">PUNCH! 👊</span>
                </button>
              )}
            </>
          ) : (
            // Game Complete Screen
            <div className="game-complete">
              <div className="celebration-text">Do you feel better now, or do you want to start again?</div>
              <div className="celebration-emoji">🎉</div>
              <button className="play-again-button" onClick={resetGame}>
                Start Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HitRoshanHari;
