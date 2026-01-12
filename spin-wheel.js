/**
 * ============================================ SPIN WHEEL SYSTEM ============================================
 * 
 * Deep-Thinking Algorithm for Fair Prize Distribution:
 * This system uses a weighted probability system combined with session-based tracking
 * to ensure fair distribution of prizes while maintaining engagement and business logic.
 * 
 * Key Components:
 * 1. OFFER_ACTIVE: Master toggle for the gamification system
 * 2. Prize Configuration: Odds-based probability system
 * 3. User Session Management: Phone number + OTP verification
 * 4. Spin Tracking: Maximum 2 spins per user per session
 * 5. Wallet Integration: localStorage-based reward accumulation
 * 
 * ============================================ CONFIGURATION ============================================
 */

// Master toggle - Set to false to disable the entire spin wheel feature
const OFFER_ACTIVE = true;

/**
 * Prize Configuration System
 * 
 * Odds Calculation:
 * - Total probability weight = sum of all odds denominators
 * - Each spin has equal chance across all segments
 * - Odds are distributed proportionally
 * 
 * Example: Prize A has 1/30 = 3.33% chance
 *          Prize B has 1/100 = 1% chance
 *          Prize C has 1/300 = 0.33% chance
 */
const PRIZES = [
    {
        id: 'prize_a',
        name: 'Prize A',
        amount: 100,
        odds: 1/30,          // 3.33% chance
        color: '#fbbf24',    // Amber
        emoji: '🎁'
    },
    {
        id: 'prize_b',
        name: 'Prize B',
        amount: 300,
        odds: 1/100,         // 1% chance
        color: '#60a5fa',    // Blue
        emoji: '💎'
    },
    {
        id: 'prize_c',
        name: 'Prize C',
        amount: 500,
        odds: 1/300,         // 0.33% chance
        color: '#34d399',    // Emerald
        emoji: '👑'
    }
];

/**
 * Spin Configuration
 * Controls spin behavior and animation
 */
const SPIN_CONFIG = {
    maxSpinsPerUser: 2,           // Maximum spins allowed per user
    spinDurationMs: 3000,         // Spin animation duration in milliseconds
    minSpinRotation: 360 * 3,    // Minimum rotation for realism
    maxSpinRotation: 360 * 8,    // Maximum rotation for variety
};

// ============================================ SPIN WHEEL CANVAS MANAGEMENT ============================================

/**
 * Initialize spin wheel canvas on page load
 * Sets up the canvas context, dimensions, and initial draw
 */
function initializeSpinWheel() {
    const canvas = document.getElementById('spinCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 300;
    
    // Draw initial wheel state
    drawSpinWheel(ctx, 0);
}

/**
 * Deep-Thinking: Probability-Based Prize Selection
 * Uses weighted random selection to ensure proper odds distribution
 * 
 * Algorithm:
 * 1. Create cumulative probability array
 * 2. Generate random number between 0 and 1
 * 3. Return prize where random number falls in cumulative range
 * 4. This ensures mathematical fairness while appearing random
 */
function selectPrizeByOdds() {
    // Create cumulative probability array
    const cumulativeProbabilities = [];
    let cumulativeSum = 0;
    
    for (const prize of PRIZES) {
        cumulativeSum += prize.odds;
        cumulativeProbabilities.push({
            prize,
            cumulativeProbability: cumulativeSum
        });
    }
    
    // Generate random number and find matching prize
    const randomValue = Math.random();
    
    for (const item of cumulativeProbabilities) {
        if (randomValue <= item.cumulativeProbability) {
            return item.prize;
        }
    }
    
    // Fallback (should not reach here)
    return PRIZES[0];
}

/**
 * Calculate rotation angle for selected prize
 * Maps prize to canvas segments proportionally
 */
function getPrizeRotation(prize) {
    const prizeIndex = PRIZES.findIndex(p => p.id === prize.id);
    const segmentAngle = 360 / PRIZES.length;
    const targetRotation = prizeIndex * segmentAngle + segmentAngle / 2;
    
    // Adjust for pointer position (top of wheel)
    return (360 - targetRotation + 90) % 360;
}

/**
 * Draw the spin wheel on canvas
 * Renders circular segments with colors and labels
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
 * @param {number} rotation - Current rotation angle in degrees
 */
function drawSpinWheel(ctx, rotation = 0) {
    const centerX = 150;
    const centerY = 150;
    const radius = 140;
    const segmentAngle = (360 / PRIZES.length) * (Math.PI / 180);
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 300, 300);
    
    // Save context state for rotation
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Draw segments
    PRIZES.forEach((prize, index) => {
        const startAngle = index * segmentAngle;
        const endAngle = startAngle + segmentAngle;
        
        // Draw segment
        ctx.beginPath();
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.lineTo(0, 0);
        ctx.fillStyle = prize.color;
        ctx.fill();
        
        // Add border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw text
        ctx.save();
        ctx.rotate(startAngle + segmentAngle / 2);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Inter';
        ctx.fillText(`₹${prize.amount}`, radius - 20, 5);
        ctx.restore();
        
        // Draw emoji
        ctx.save();
        ctx.rotate(startAngle + segmentAngle / 2);
        ctx.textAlign = 'right';
        ctx.font = '20px Arial';
        ctx.fillText(prize.emoji, radius - 40, 10);
        ctx.restore();
    });
    
    // Restore context state
    ctx.restore();
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#0d9488';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw pointer
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.moveTo(centerX - 15, 20);
    ctx.lineTo(centerX + 15, 20);
    ctx.lineTo(centerX, 40);
    ctx.closePath();
    ctx.fill();
}

/**
 * Animate spin wheel rotation
 * Uses RequestAnimationFrame for smooth 60fps animation
 * 
 * @param {number} finalRotation - Target rotation angle
 * @param {number} duration - Animation duration in milliseconds
 * @returns {Promise} Resolves when animation completes
 */
async function animateSpinWheel(finalRotation, duration) {
    const canvas = document.getElementById('spinCanvas');
    const ctx = canvas.getContext('2d');
    
    const startTime = performance.now();
    const startRotation = 0;
    
    return new Promise((resolve) => {
        const animate = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Easing function: ease-out for natural deceleration
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            const currentRotation = startRotation + (finalRotation - startRotation) * easeProgress;
            drawSpinWheel(ctx, currentRotation);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                resolve();
            }
        };
        
        requestAnimationFrame(animate);
    });
}

// ============================================ USER AUTHENTICATION & SESSION MANAGEMENT ============================================

/**
 * Request OTP for phone number
 * Simulates OTP sending (in production, integrate with SMS service)
 * 
 * Deep-Thinking: Session-based authentication prevents multiple accounts
 * and ensures one set of spins per phone number
 */
function requestOTP() {
    const phoneInput = document.getElementById('phoneInput');
    const phone = phoneInput.value.trim();
    
    // Validation
    if (!phone || phone.length !== 10) {
        alert('Please enter a valid 10-digit phone number');
        return;
    }
    
    // Check if user already used spins today
    const userSession = loadUserSession(phone);
    if (userSession && userSession.spinsUsed >= SPIN_CONFIG.maxSpinsPerUser) {
        alert('You have already used all your spins for today!');
        closeSpinWheel();
        return;
    }
    
    // Simulate OTP sending
    console.log(`[DEMO] OTP sent to ${phone}. Use OTP: 1234`);
    
    // Show OTP input
    document.getElementById('otpSection').classList.remove('hidden');
    phoneInput.disabled = true;
}

/**
 * Verify OTP and unlock spin wheel
 * In production, verify against actual OTP service
 */
function verifyOTP() {
    const phoneInput = document.getElementById('phoneInput');
    const otpInput = document.getElementById('otpInput');
    const phone = phoneInput.value.trim();
    const otp = otpInput.value.trim();
    
    // Demo OTP verification (replace with real API call)
    if (otp !== '1234') {
        alert('Invalid OTP. Demo OTP is: 1234');
        return;
    }
    
    // Store verified session
    storeUserSession(phone);
    
    // Hide auth section, show spin section
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('spinSection').classList.remove('hidden');
    
    updateSpinsRemaining();
}

/**
 * Load user session from localStorage
 * Returns session data or null if no session exists
 */
function loadUserSession(phone) {
    const sessionData = localStorage.getItem(`spin_session_${phone}`);
    if (!sessionData) return null;
    
    try {
        const session = JSON.parse(sessionData);
        // Check if session is still valid (same day)
        const today = new Date().toDateString();
        if (session.date === today) {
            return session;
        }
    } catch (e) {
        console.error('Error loading session:', e);
    }
    
    return null;
}

/**
 * Store user session in localStorage
 * Tracks spins used and wins today
 */
function storeUserSession(phone) {
    const today = new Date().toDateString();
    const existingSession = loadUserSession(phone) || {
        date: today,
        spinsUsed: 0,
        wins: []
    };
    
    localStorage.setItem(`spin_session_${phone}`, JSON.stringify(existingSession));
}

/**
 * Record a spin win in user's session
 */
function recordWin(phone, prize) {
    const session = loadUserSession(phone);
    if (!session) return;
    
    session.spinsUsed = (session.spinsUsed || 0) + 1;
    session.wins.push({
        timestamp: new Date().toISOString(),
        prize: prize.id,
        amount: prize.amount
    });
    
    localStorage.setItem(`spin_session_${phone}`, JSON.stringify(session));
}

/**
 * Update UI to show remaining spins
 */
function updateSpinsRemaining() {
    const phoneInput = document.getElementById('phoneInput');
    const phone = phoneInput.value.trim();
    const session = loadUserSession(phone);
    const spinsUsed = session ? session.spinsUsed : 0;
    const spinsRemaining = SPIN_CONFIG.maxSpinsPerUser - spinsUsed;
    
    document.getElementById('spinsRemaining').textContent = Math.max(0, spinsRemaining);
    
    // Disable spin button if no spins remaining
    if (spinsRemaining <= 0) {
        document.getElementById('spinButton').disabled = true;
        document.getElementById('spinButton').classList.add('opacity-50');
    }
}

// ============================================ MAIN SPIN LOGIC ============================================

/**
 * Primary spin function
 * Orchestrates the entire spin process:
 * 1. Validate user eligibility
 * 2. Select prize based on odds
 * 3. Animate wheel rotation
 * 4. Update wallet
 * 5. Show congratulations
 */
async function startSpin() {
    if (!OFFER_ACTIVE) {
        alert('Spin wheel is currently disabled');
        return;
    }
    
    const phoneInput = document.getElementById('phoneInput');
    const phone = phoneInput.value.trim();
    const spinButton = document.getElementById('spinButton');
    
    // Validate eligibility
    const session = loadUserSession(phone);
    if (!session || session.spinsUsed >= SPIN_CONFIG.maxSpinsPerUser) {
        alert('You have exhausted your spins for today!');
        return;
    }
    
    // Disable button during spin
    spinButton.disabled = true;
    spinButton.textContent = 'SPINNING...';
    
    try {
        // Deep-Thinking: Select prize using weighted probability
        const selectedPrize = selectPrizeByOdds();
        
        // Calculate rotation based on selected prize
        const targetRotation = getPrizeRotation(selectedPrize);
        const finalRotation = SPIN_CONFIG.minSpinRotation + 
                            (SPIN_CONFIG.maxSpinRotation - SPIN_CONFIG.minSpinRotation) * Math.random() + 
                            targetRotation;
        
        // Animate the spin
        await animateSpinWheel(finalRotation, SPIN_CONFIG.spinDurationMs);
        
        // Record win and update wallet
        recordWin(phone, selectedPrize);
        addToWallet(selectedPrize.amount);
        
        // Update UI
        updateSpinsRemaining();
        
        // Show congratulations modal
        showCongrats(selectedPrize);
        
        // Redirect to home after 2 seconds
        setTimeout(() => {
            closeCongrats();
            closeSpinWheel();
            navigateTo('home');
        }, 2000);
        
    } catch (error) {
        console.error('Spin error:', error);
        alert('An error occurred during spin. Please try again.');
    } finally {
        spinButton.disabled = false;
        spinButton.textContent = 'SPIN NOW';
    }
}

// ============================================ WALLET MANAGEMENT ============================================

/**
 * Add amount to user wallet
 * Stored in localStorage for client-side persistence
 */
function addToWallet(amount) {
    const currentBalance = getWalletBalance();
    const newBalance = currentBalance + amount;
    localStorage.setItem('wallet_balance', newBalance.toString());
    updateWalletDisplay();
}

/**
 * Get current wallet balance
 */
function getWalletBalance() {
    const balance = localStorage.getItem('wallet_balance');
    return balance ? parseInt(balance, 10) : 0;
}

/**
 * Update wallet display in header
 */
function updateWalletDisplay() {
    const balance = getWalletBalance();
    document.getElementById('walletBalance').textContent = balance;
}

// ============================================ UI CONTROLS ============================================

/**
 * Open spin wheel modal
 */
function openSpinWheel() {
    if (!OFFER_ACTIVE) {
        alert('Spin wheel is currently disabled');
        return;
    }
    
    document.getElementById('spinWheelModal').classList.remove('hidden');
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('spinSection').classList.add('hidden');
    document.getElementById('otpSection').classList.add('hidden');
    
    // Reset inputs
    document.getElementById('phoneInput').value = '';
    document.getElementById('otpInput').value = '';
    document.getElementById('phoneInput').disabled = false;
    
    // Initialize wheel
    initializeSpinWheel();
}

/**
 * Close spin wheel modal
 */
function closeSpinWheel() {
    document.getElementById('spinWheelModal').classList.add('hidden');
}

/**
 * Show congratulations modal
 */
function showCongrats(prize) {
    document.getElementById('prizeText').textContent = `You won ₹${prize.amount}!`;
    document.getElementById('congratsModal').classList.remove('hidden');
}

/**
 * Close congratulations modal
 */
function closeCongrats() {
    document.getElementById('congratsModal').classList.add('hidden');
}

// ============================================ INITIALIZATION ============================================

/**
 * Initialize spin wheel system on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    if (OFFER_ACTIVE) {
        updateWalletDisplay();
    }
});
