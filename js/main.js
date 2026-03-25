// main.js - Main application logic

// Global variables
let topicsState = {};
let globalStreak = 0;
let totalPossible = 0;
let currentUnlockedIndex = 0;
let currentTopic = null;
let confettiAnimationId = null;
let autoAdvanceTimer = null;
let userId = null;
let selectedAnswerValue = null; // Track which answer was selected
let isProcessing = false; // Prevent multiple clicks

// User Management Functions
function initializeUser() {
    let savedUser = localStorage.getItem('mathMasterUser');
    if (!savedUser) {
        userId = prompt('Welcome to Math Master! Enter your name to save your progress:', 'Student');
        if (!userId) userId = 'Student';
        localStorage.setItem('mathMasterUser', userId);
    } else {
        userId = savedUser;
    }
    return userId;
}

function saveProgress() {
    if (!userId) return;
    const saveData = {
        userId: userId,
        topicsState: topicsState,
        globalStreak: globalStreak,
        lastSaved: new Date().toISOString()
    };
    localStorage.setItem(`mathMaster_${userId}`, JSON.stringify(saveData));
    console.log(`Progress saved for ${userId}`);
}

function loadProgress() {
    if (!userId) return false;
    const savedData = localStorage.getItem(`mathMaster_${userId}`);
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            topicsState = data.topicsState;
            globalStreak = data.globalStreak;
            console.log(`Progress loaded for ${userId} - Last saved: ${data.lastSaved}`);
            return true;
        } catch (e) {
            console.error('Error loading progress:', e);
            return false;
        }
    }
    return false;
}

function resetProgress() {
    if (confirm('Are you sure you want to reset ALL your progress? This cannot be undone.')) {
        for (let tid of TOPIC_ORDER) {
            const qlist = TOPICS[tid].questions;
            topicsState[tid] = {
                currentIdx: 0,
                answers: qlist.map(() => ({ answered: false, correct: false }))
            };
        }
        globalStreak = 0;
        saveProgress();
        updateStats();
        renderDashboard();
        if (currentTopic) closeArena();
        alert('Progress has been reset!');
    }
}

function showUserInfo() {
    const correctCount = Object.values(topicsState).reduce((sum, state) => 
        sum + state.answers.filter(a => a.correct).length, 0);
    alert(`👤 User: ${userId}\n📊 Total Score: ${correctCount}/${totalPossible}\n🔥 Current Streak: ${globalStreak}\n🏆 Topics Mastered: ${document.getElementById('topicsComplete').innerText}/7\n\nProgress is automatically saved!`);
}

// Initialize game
function initGame() {
    initializeUser();
    
    totalPossible = 0;
    for (let tid of TOPIC_ORDER) {
        const qlist = TOPICS[tid].questions;
        totalPossible += qlist.length;
        if (!topicsState[tid]) {
            topicsState[tid] = {
                currentIdx: 0,
                answers: qlist.map(() => ({ answered: false, correct: false }))
            };
        }
    }
    
    const loaded = loadProgress();
    
    document.getElementById('totalPossible').innerText = totalPossible;
    document.getElementById('totalTopics').innerText = TOPIC_ORDER.length;
    
    addUserControls();
    
    updateStats();
    renderDashboard();
    loadTheme();
    
    if (loaded) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `<i class="fas fa-save"></i> Welcome back, ${userId}! Your progress has been loaded.`;
        toast.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#2196f3; color:white; padding:12px 20px; border-radius:8px; z-index:9999; animation:fadeOut 3s forwards;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

function addUserControls() {
    const statsSection = document.querySelector('.stats-section');
    if (statsSection && !document.getElementById('userInfoBtn')) {
        const userBtn = document.createElement('button');
        userBtn.id = 'userInfoBtn';
        userBtn.className = 'pdf-btn';
        userBtn.innerHTML = `<i class="fas fa-user"></i> ${userId.substring(0, 10)}`;
        userBtn.onclick = showUserInfo;
        
        const resetBtn = document.createElement('button');
        resetBtn.id = 'resetProgressBtn';
        resetBtn.className = 'pdf-btn';
        resetBtn.innerHTML = `<i class="fas fa-trash-alt"></i> Reset`;
        resetBtn.style.background = '#f44336';
        resetBtn.onclick = resetProgress;
        
        statsSection.appendChild(userBtn);
        statsSection.appendChild(resetBtn);
    }
}

function updateStats() {
    let totalCorrect = 0;
    let defeatedCount = 0;
    for (let tid of TOPIC_ORDER) {
        const state = topicsState[tid];
        if (state) {
            const correct = state.answers.filter(a => a.correct).length;
            totalCorrect += correct;
            // Topic is considered mastered only if ALL answers are correct
            if (correct === TOPICS[tid].questions.length) defeatedCount++;
        }
    }
    document.getElementById('totalScore').innerText = totalCorrect;
    document.getElementById('topicsComplete').innerText = defeatedCount;
    document.getElementById('streakCount').innerText = globalStreak;
    currentUnlockedIndex = defeatedCount;
    
    saveProgress();
}

function renderDashboard() {
    const container = document.getElementById('topicsGrid');
    if (!container) return;
    container.innerHTML = '';
    
    for (let i = 0; i < TOPIC_ORDER.length; i++) {
        const tid = TOPIC_ORDER[i];
        const topic = TOPICS[tid];
        const state = topicsState[tid];
        if (!state) continue;
        
        const correctCount = state.answers.filter(a => a.correct).length;
        const totalQs = topic.questions.length;
        const isDefeated = correctCount === totalQs;
        const isUnlocked = i <= currentUnlockedIndex;
        
        const card = document.createElement('div');
        card.className = `topic-card ${!isUnlocked ? 'locked' : ''}`;
        if (isUnlocked) {
            card.onclick = () => openTopic(tid);
        }
        
        const progressPercent = (correctCount / totalQs) * 100;
        
        card.innerHTML = `
            <div class="card-header">
                <i class="${topic.icon}"></i>
                <h3>${topic.name}</h3>
            </div>
            <div class="card-body">
                <div class="card-stats">
                    <span><i class="fas fa-check-circle"></i> ${correctCount}/${totalQs}</span>
                    <span><i class="fas fa-chart-line"></i> ${Math.round(progressPercent)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div class="card-status">
                    ${!isUnlocked ? '<span class="status-locked"><i class="fas fa-lock"></i> LOCKED</span>' : 
                      isDefeated ? '<span class="status-defeated"><i class="fas fa-trophy"></i> MASTERED</span>' : 
                      '<span class="status-unlocked"><i class="fas fa-play"></i> START CHALLENGE</span>'}
                </div>
            </div>
        `;
        container.appendChild(card);
    }
}

function openTopic(tid) {
    const idx = TOPIC_ORDER.indexOf(tid);
    if (idx > currentUnlockedIndex) {
        alert("🔒 Complete previous topics first to unlock this challenge!");
        return;
    }
    currentTopic = tid;
    selectedAnswerValue = null;
    isProcessing = false;
    document.getElementById('arenaTitle').innerHTML = `<i class="${TOPICS[tid].icon}"></i> ${TOPICS[tid].name}`;
    document.getElementById('quizArena').classList.remove('hidden');
    renderQuiz();
}

function closeArena() {
    if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
        autoAdvanceTimer = null;
    }
    document.getElementById('quizArena').classList.add('hidden');
    currentTopic = null;
    selectedAnswerValue = null;
    isProcessing = false;
    renderDashboard();
    updateStats();
    saveProgress();
}

function renderQuiz() {
    if (!currentTopic) return;
    
    const container = document.getElementById('quizContent');
    const topic = TOPICS[currentTopic];
    const state = topicsState[currentTopic];
    const totalQs = topic.questions.length;
    const correctCount = state.answers.filter(a => a.correct).length;
    const allQuestionsAnswered = state.answers.every(a => a.answered === true);
    
    document.getElementById('progressInfo').innerHTML = `<i class="fas fa-chart-line"></i> ${correctCount}/${totalQs} Correct`;
    
    // Check if all questions have been answered (regardless of correctness)
    if (allQuestionsAnswered) {
        const score = correctCount;
        const percentage = Math.round((score / totalQs) * 100);
        let message = '';
        let icon = '';
        
        if (percentage >= 80) {
            message = 'Excellent work! You\'ve mastered this topic!';
            icon = '🏆';
        } else if (percentage >= 60) {
            message = 'Good job! Review the questions you missed to improve.';
            icon = '👍';
        } else if (percentage >= 40) {
            message = 'Keep practicing! Review the material and try again.';
            icon = '📚';
        } else {
            message = 'Don\'t give up! Study the material and try this topic again.';
            icon = '💪';
        }
        
        container.innerHTML = `
            <div class="victory-screen">
                <i class="fas fa-chart-line" style="font-size: 48px;"></i>
                <h2>TOPIC COMPLETED!</h2>
                <div class="score-display">
                    <div class="score-circle">
                        <span class="score-number">${score}</span>
                        <span class="score-total">/${totalQs}</span>
                    </div>
                    <div class="score-percentage">${percentage}%</div>
                </div>
                <p><i class="fas ${icon}"></i> ${message}</p>
                <div class="completion-buttons">
                    <button class="next-btn" onclick="retryTopic('${currentTopic}')">Retry Topic</button>
                    <button class="next-btn" onclick="closeArena()">Return to Dashboard</button>
                </div>
            </div>
        `;
        return;
    }
    
    const current = topic.questions[state.currentIdx];
    const isAnswered = state.answers[state.currentIdx].answered;
    const isCorrect = state.answers[state.currentIdx].correct;
    const progressPercent = (state.answers.filter(a => a.answered).length / totalQs) * 100;
    
    let feedbackHtml = `<i class="fas fa-brain"></i> Select an answer and click Submit`;
    let feedbackClass = '';
    
    if (isAnswered) {
        if (isCorrect) {
            feedbackHtml = `<i class="fas fa-check-circle"></i> Correct! +1 point. Streak: ${globalStreak}x`;
            feedbackClass = 'feedback-correct';
        } else {
            feedbackHtml = `<i class="fas fa-lightbulb"></i> ${current.hint || 'Try again!'} Correct answer: ${current.correct}`;
            feedbackClass = 'feedback-wrong';
        }
    }
    
    // Build options with proper icon based on selection
    const optionsHtml = current.options.map((opt, idx) => {
        let icon = 'fa-circle';
        
        if (isAnswered) {
            // After answering, show checkmark on the correct answer
            if (opt === current.correct) {
                icon = 'fa-check-circle';
            }
        } else {
            // Before answering, show checkmark on the selected answer (if any)
            if (selectedAnswerValue === opt) {
                icon = 'fa-check-circle';
            }
        }
        
        return `
            <button class="option-btn" data-opt="${opt.replace(/"/g, '&quot;')}" data-index="${idx}" data-correct="${opt === current.correct}" ${isAnswered ? 'disabled' : ''}>
                <i class="fas ${icon}"></i>
                ${opt}
            </button>
        `;
    }).join('');
    
    container.innerHTML = `
        <div class="question-card">
            <div class="progress-bar" style="margin-bottom: 1rem;">
                <div class="progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <div class="question-text">
                <i class="fas fa-question-circle"></i> ${current.text}
            </div>
            <div class="options-grid" id="optionsContainer">
                ${optionsHtml}
            </div>
            <div class="feedback ${feedbackClass}">${feedbackHtml}</div>
            ${!isAnswered ? `<button class="submit-btn" id="submitAnswerBtn"><i class="fas fa-check"></i> Submit Answer</button>` : ''}
            ${isAnswered ? `<button class="next-btn" id="nextQuestionBtn"><i class="fas fa-forward"></i> Next Question</button>` : ''}
        </div>
    `;
    
    // Attach click handlers for option buttons (only if not answered)
    if (!isAnswered) {
        const btns = document.querySelectorAll('.option-btn');
        const submitBtn = document.getElementById('submitAnswerBtn');
        
        // Make sure submit button starts disabled
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            submitBtn.style.cursor = 'not-allowed';
        }
        
        btns.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Get the selected option
                const selected = btn.getAttribute('data-opt');
                
                // Update selected answer
                selectedAnswerValue = selected;
                
                // Update ALL icons immediately
                btns.forEach((otherBtn) => {
                    const otherIcon = otherBtn.querySelector('i');
                    const otherOpt = otherBtn.getAttribute('data-opt');
                    if (otherIcon) {
                        if (otherOpt === selected) {
                            otherIcon.className = 'fas fa-check-circle';
                        } else {
                            otherIcon.className = 'fas fa-circle';
                        }
                    }
                });
                
                // Enable and activate submit button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.cursor = 'pointer';
                    submitBtn.classList.add('active');
                }
            });
            
            btn.style.cursor = 'pointer';
        });
        
        // Attach submit button handler
        if (submitBtn) {
            const handleSubmit = () => {
                // Check if an answer was selected
                if (!selectedAnswerValue) {
                    const feedbackDiv = document.querySelector('.feedback');
                    const originalHtml = feedbackDiv.innerHTML;
                    feedbackDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Please select an answer first!';
                    feedbackDiv.style.color = '#ff9800';
                    setTimeout(() => {
                        feedbackDiv.innerHTML = originalHtml;
                        feedbackDiv.style.color = '';
                    }, 1500);
                    return;
                }
                
                if (isProcessing) return;
                isProcessing = true;
                
                submitBtn.disabled = true;
                submitBtn.style.opacity = '0.7';
                submitBtn.style.cursor = 'not-allowed';
                submitBtn.classList.remove('active');
                
                const selectedBtn = Array.from(document.querySelectorAll('.option-btn')).find(
                    btn => btn.getAttribute('data-opt') === selectedAnswerValue
                );
                const isOptionCorrect = selectedBtn ? selectedBtn.getAttribute('data-correct') === 'true' : false;
                
                submitAnswer(currentTopic, selectedAnswerValue, isOptionCorrect);
            };
            
            submitBtn.removeEventListener('click', handleSubmit);
            submitBtn.addEventListener('click', handleSubmit);
        }
    }
    
    const nextBtn = document.getElementById('nextQuestionBtn');
    if (nextBtn) {
        const handleNext = () => {
            nextQuestion(currentTopic);
        };
        
        nextBtn.removeEventListener('click', handleNext);
        nextBtn.addEventListener('click', handleNext);
        nextBtn.style.pointerEvents = 'auto';
        nextBtn.style.cursor = 'pointer';
    }
}

function retryTopic(tid) {
    // Reset all answers for this topic
    const totalQs = TOPICS[tid].questions.length;
    topicsState[tid] = {
        currentIdx: 0,
        answers: Array(totalQs).fill().map(() => ({ answered: false, correct: false }))
    };
    
    // Reset selected answer
    selectedAnswerValue = null;
    isProcessing = false;
    
    // Save progress and refresh
    saveProgress();
    updateStats();
    renderDashboard();
    
    // Re-open the topic
    openTopic(tid);
}

function submitAnswer(tid, selected, isCorrect) {
    const state = topicsState[tid];
    
    // Mark as answered
    state.answers[state.currentIdx].answered = true;
    state.answers[state.currentIdx].correct = isCorrect;
    
    // Update streak and stats
    if (isCorrect) {
        globalStreak++;
        updateStats();
        triggerConfetti();
    } else {
        globalStreak = 0;
        updateStats();
    }
    
    // Reset selected answer
    selectedAnswerValue = null;
    isProcessing = false;
    
    // Re-render to show answer feedback and next button with correct answer highlighted
    renderQuiz();
    updateStats();
    renderDashboard();
    saveProgress();
}

function nextQuestion(tid) {
    const state = topicsState[tid];
    const totalQs = TOPICS[tid].questions.length;
    
    // Reset selected answer for the new question
    selectedAnswerValue = null;
    isProcessing = false;
    
    // Move to next question if available
    if (state.currentIdx + 1 < totalQs) {
        state.currentIdx++;
        renderQuiz();
    } else {
        // All questions answered - render completion screen
        renderQuiz();
        updateStats();
        renderDashboard();
        saveProgress();
    }
}

function triggerConfetti() {
    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
    
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let particles = [];
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 6 + 2,
            speedY: Math.random() * 6 + 3,
            speedX: (Math.random() - 0.5) * 4,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        });
    }
    
    let startTime = Date.now();
    
    function draw() {
        if (Date.now() - startTime > 1500) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            confettiAnimationId = null;
            return;
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let p of particles) {
            p.y += p.speedY;
            p.x += p.speedX;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);
        }
        confettiAnimationId = requestAnimationFrame(draw);
    }
    draw();
}

function generateReport() {
    let totalCor = parseInt(document.getElementById('totalScore').innerText);
    let completed = parseInt(document.getElementById('topicsComplete').innerText);
    let reportDiv = document.createElement('div');
    const currentTheme = document.body.getAttribute('data-theme');
    reportDiv.style.background = currentTheme === 'light' ? '#ffffff' : '#0f2a3a';
    reportDiv.style.padding = "25px";
    reportDiv.style.borderRadius = "20px";
    reportDiv.style.color = currentTheme === 'light' ? '#0a2b3e' : '#e6f3ff';
    reportDiv.style.fontFamily = "'Inter', sans-serif";
    reportDiv.style.border = "2px solid #2196f3";
    reportDiv.innerHTML = `
        <div style="text-align:center; margin-bottom:20px;">
            <i class="fas fa-graduation-cap" style="font-size: 40px; color:#2196f3;"></i>
            <h2 style="color:#2196f3;">NCUK Math Master Report</h2>
            <p><strong>Student:</strong> ${userId}</p>
        </div>
        <p><strong>Final Score:</strong> ${totalCor} / ${totalPossible}</p>
        <p><strong>Topics Mastered:</strong> ${completed} / 7</p>
        <p><strong>Current Streak:</strong> ${globalStreak}</p>
        <hr style="margin:15px 0; border-color:#2196f3;">
        <p><i class="fas fa-chart-line"></i> Keep practicing to achieve mastery!</p>
        <p><i class="fas fa-calendar"></i> Report Date: ${new Date().toLocaleDateString()}</p>
        <p><i class="fas fa-user"></i> Progress is automatically saved for ${userId}</p>
    `;
    if (typeof html2pdf !== 'undefined') {
        html2pdf().set({ margin: 0.5, filename: `Math_Master_Report_${userId}.pdf`, image: { type: 'jpeg', quality: 0.98 } }).from(reportDiv).save();
    } else {
        console.warn('html2pdf library not loaded');
        alert('PDF generation requires html2pdf library');
    }
}

function loadTheme() {
    const saved = localStorage.getItem('mathTheme') || 'dark';
    document.body.setAttribute('data-theme', saved);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        if (btn.dataset.theme === saved) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('mathTheme', theme);
    document.getElementById('themeModal').classList.remove('show');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const reportBtn = document.getElementById('pdfReportBtn');
    if (reportBtn) reportBtn.addEventListener('click', generateReport);
    
    const closeBtn = document.getElementById('closeArenaBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeArena);
    
    const openThemeBtn = document.getElementById('openThemeModal');
    if (openThemeBtn) {
        openThemeBtn.addEventListener('click', () => {
            document.getElementById('themeModal').classList.add('show');
        });
    }
    
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            document.getElementById('themeModal').classList.remove('show');
        });
    }
    
    const applyBtn = document.getElementById('applyThemeBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const selected = document.querySelector('.theme-btn.active')?.dataset.theme || 'dark';
            applyTheme(selected);
        });
    }
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    initGame();
});