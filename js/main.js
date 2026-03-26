// main.js - Main application logic (Updated with Skip Button and Skipped Questions Tracking)

// Global variables
let topicsState = {};
let globalStreak = 0;
let totalPossible = 0;
let currentTopic = null;
let confettiAnimationId = null;
let autoAdvanceTimer = null;
let userId = null;
let selectedAnswerValue = null;
let isProcessing = false;
let currentReportData = null; // Store report data for detailed view

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
                answers: qlist.map(() => ({ answered: false, correct: false, userAnswer: null, skipped: false }))
            };
        }
        globalStreak = 0;
        saveProgress();
        updateStats();
        renderDashboard();
        if (currentTopic) closeArena();
        showToast('Progress has been reset!');
    }
}

function showUserInfo() {
    const correctCount = Object.values(topicsState).reduce((sum, state) => 
        sum + state.answers.filter(a => a.correct).length, 0);
    const skippedCount = Object.values(topicsState).reduce((sum, state) => 
        sum + state.answers.filter(a => a.skipped).length, 0);
    alert(`👤 Student: ${userId}\n📊 Score: ${correctCount}/${totalPossible}\n⏭️ Skipped: ${skippedCount}\n🔥 Streak: ${globalStreak}\n\nProgress auto-saved!`);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    toast.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#2196f3; color:white; padding:12px 20px; border-radius:8px; z-index:9999; animation:fadeOut 3s forwards;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Initialize game
function initGame() {
    // Randomize question options when game starts
    if (typeof randomizeAllQuestions === 'function') {
        randomizeAllQuestions();
    }
    
    initializeUser();
    
    totalPossible = 0;
    for (let tid of TOPIC_ORDER) {
        const qlist = TOPICS[tid].questions;
        totalPossible += qlist.length;
        if (!topicsState[tid]) {
            topicsState[tid] = {
                currentIdx: 0,
                answers: qlist.map(() => ({ answered: false, correct: false, userAnswer: null, skipped: false }))
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
        showToast(`Welcome back, ${userId}! Your progress has been loaded.`);
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
    let masteredCount = 0;
    for (let tid of TOPIC_ORDER) {
        const state = topicsState[tid];
        if (state) {
            const correct = state.answers.filter(a => a.correct).length;
            totalCorrect += correct;
            if (correct === TOPICS[tid].questions.length) masteredCount++;
        }
    }
    document.getElementById('totalScore').innerText = totalCorrect;
    document.getElementById('topicsComplete').innerText = masteredCount;
    document.getElementById('streakCount').innerText = globalStreak;
    
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
        const skippedCount = state.answers.filter(a => a.skipped).length;
        const totalQs = topic.questions.length;
        const isMastered = correctCount === totalQs;
        const progressPercent = (correctCount / totalQs) * 100;
        
        const card = document.createElement('div');
        card.className = `topic-card`;
        card.onclick = () => openTopic(tid);
        
        card.innerHTML = `
            <div class="card-header">
                <i class="${topic.icon}"></i>
                <h3>${topic.name}</h3>
            </div>
            <div class="card-body">
                <div class="card-stats">
                    <span><i class="fas fa-check-circle"></i> ${correctCount}/${totalQs}</span>
                    ${skippedCount > 0 ? `<span><i class="fas fa-forward"></i> ${skippedCount} skipped</span>` : ''}
                    <span><i class="fas fa-chart-line"></i> ${Math.round(progressPercent)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div class="card-status">
                    ${isMastered ? '<span class="status-defeated"><i class="fas fa-trophy"></i> MASTERED</span>' : 
                      '<span class="status-unlocked"><i class="fas fa-play"></i> START CHALLENGE</span>'}
                </div>
            </div>
        `;
        container.appendChild(card);
    }
}

function openTopic(tid) {
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
    const skippedCount = state.answers.filter(a => a.skipped).length;
    const allQuestionsAnswered = state.answers.every(a => a.answered === true);
    
    document.getElementById('progressInfo').innerHTML = `<i class="fas fa-chart-line"></i> ${correctCount}/${totalQs} Correct | <i class="fas fa-forward"></i> ${skippedCount} Skipped`;
    
    if (allQuestionsAnswered) {
        const score = correctCount;
        const percentage = Math.round((score / totalQs) * 100);
        let message = '';
        let icon = '';
        
        if (percentage >= 80) {
            message = 'Excellent! You have a strong foundation in this topic!';
            icon = 'fa-trophy';
        } else if (percentage >= 60) {
            message = 'Good job! Review the questions you missed to strengthen your understanding.';
            icon = 'fa-thumbs-up';
        } else if (percentage >= 40) {
            message = 'Keep practicing! Review the material and try again.';
            icon = 'fa-book';
        } else {
            message = 'Review the notes and attempt the test again to build your skills.';
            icon = 'fa-heart';
        }
        
        container.innerHTML = `
            <div class="victory-screen">
                <i class="fas ${icon}"></i>
                <h2>Topic Completed!</h2>
                <div class="score-display">
                    <div class="score-circle">
                        <span class="score-number">${score}</span>
                        <span class="score-total">/${totalQs}</span>
                    </div>
                    <div class="score-percentage">${percentage}%</div>
                    ${skippedCount > 0 ? `<div class="skipped-info"><i class="fas fa-forward"></i> ${skippedCount} questions skipped</div>` : ''}
                </div>
                <p><i class="fas ${icon}"></i> ${message}</p>
                <div class="completion-buttons">
                    <button class="next-btn" onclick="retryTopic('${currentTopic}')">
                        <i class="fas fa-redo"></i> Retake Test
                    </button>
                    <button class="next-btn" onclick="closeArena()">
                        <i class="fas fa-home"></i> Dashboard
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    const current = topic.questions[state.currentIdx];
    const isAnswered = state.answers[state.currentIdx].answered;
    const isCorrect = state.answers[state.currentIdx].correct;
    const isSkipped = state.answers[state.currentIdx].skipped;
    const progressPercent = (state.answers.filter(a => a.answered).length / totalQs) * 100;
    
    let feedbackHtml = `<i class="fas fa-brain"></i> Select an answer or click "Skip" to move on`;
    let feedbackClass = '';
    
    if (isAnswered) {
        if (isCorrect) {
            feedbackHtml = `<i class="fas fa-check-circle"></i> Correct! ${current.hint || 'Well done!'}`;
            feedbackClass = 'feedback-correct';
        } else if (isSkipped) {
            feedbackHtml = `<i class="fas fa-forward"></i> You skipped this question.<br><strong>Correct answer:</strong> ${current.correct}`;
            feedbackClass = 'feedback-skipped';
        } else {
            feedbackHtml = `<i class="fas fa-lightbulb"></i> ${current.hint || 'Review the concept.'}<br><strong>Correct answer:</strong> ${current.correct}`;
            feedbackClass = 'feedback-wrong';
        }
    }
    
    const optionsHtml = current.options.map((opt, idx) => {
        let icon = 'fa-circle';
        
        if (isAnswered) {
            if (opt === current.correct) {
                icon = 'fa-check-circle';
            }
        } else {
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
    
    // Create button group for submit and skip buttons
    const actionButtonsHtml = !isAnswered ? `
        <div class="action-buttons-group">
            <button class="submit-btn" id="submitAnswerBtn"><i class="fas fa-check"></i> Submit Answer</button>
            <button class="skip-btn" id="skipAnswerBtn"><i class="fas fa-forward"></i> Skip / Don't Know</button>
        </div>
    ` : `<button class="next-btn" id="nextQuestionBtn"><i class="fas fa-forward"></i> Next Question</button>`;
    
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
            ${actionButtonsHtml}
        </div>
    `;
    
    if (!isAnswered) {
        const btns = document.querySelectorAll('.option-btn');
        const submitBtn = document.getElementById('submitAnswerBtn');
        const skipBtn = document.getElementById('skipAnswerBtn');
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            submitBtn.style.cursor = 'not-allowed';
        }
        
        btns.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const selected = btn.getAttribute('data-opt');
                selectedAnswerValue = selected;
                
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
                
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.cursor = 'pointer';
                    submitBtn.classList.add('active');
                }
            });
            
            btn.style.cursor = 'pointer';
        });
        
        if (submitBtn) {
            const handleSubmit = () => {
                if (!selectedAnswerValue) {
                    const feedbackDiv = document.querySelector('.feedback');
                    const originalHtml = feedbackDiv.innerHTML;
                    feedbackDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Please select an answer or click "Skip"!';
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
                
                if (skipBtn) {
                    skipBtn.disabled = true;
                    skipBtn.style.opacity = '0.7';
                    skipBtn.style.cursor = 'not-allowed';
                }
                
                const selectedBtn = Array.from(document.querySelectorAll('.option-btn')).find(
                    btn => btn.getAttribute('data-opt') === selectedAnswerValue
                );
                const isOptionCorrect = selectedBtn ? selectedBtn.getAttribute('data-correct') === 'true' : false;
                
                submitAnswer(currentTopic, selectedAnswerValue, isOptionCorrect);
            };
            
            submitBtn.removeEventListener('click', handleSubmit);
            submitBtn.addEventListener('click', handleSubmit);
        }
        
        if (skipBtn) {
            const handleSkip = () => {
                if (isProcessing) return;
                isProcessing = true;
                
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.style.opacity = '0.7';
                    submitBtn.style.cursor = 'not-allowed';
                    submitBtn.classList.remove('active');
                }
                
                skipBtn.disabled = true;
                skipBtn.style.opacity = '0.7';
                skipBtn.style.cursor = 'not-allowed';
                
                skipQuestion(currentTopic);
            };
            
            skipBtn.removeEventListener('click', handleSkip);
            skipBtn.addEventListener('click', handleSkip);
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

function skipQuestion(tid) {
    const state = topicsState[tid];
    
    // Mark as answered, incorrect, and skipped
    state.answers[state.currentIdx].answered = true;
    state.answers[state.currentIdx].correct = false;
    state.answers[state.currentIdx].skipped = true;
    state.answers[state.currentIdx].userAnswer = "(Skipped)";
    
    // Reset streak on skip
    globalStreak = 0;
    
    // Reset selected answer
    selectedAnswerValue = null;
    isProcessing = false;
    
    // Re-render to show feedback and next button
    renderQuiz();
    updateStats();
    renderDashboard();
    saveProgress();
    
    // Show a brief toast notification
    showToast('Question skipped. The correct answer will be shown.');
}

function retryTopic(tid) {
    const totalQs = TOPICS[tid].questions.length;
    topicsState[tid] = {
        currentIdx: 0,
        answers: Array(totalQs).fill().map(() => ({ answered: false, correct: false, userAnswer: null, skipped: false }))
    };
    
    selectedAnswerValue = null;
    isProcessing = false;
    
    saveProgress();
    updateStats();
    renderDashboard();
    openTopic(tid);
}

function submitAnswer(tid, selected, isCorrect) {
    const state = topicsState[tid];
    
    state.answers[state.currentIdx].answered = true;
    state.answers[state.currentIdx].correct = isCorrect;
    state.answers[state.currentIdx].skipped = false;
    state.answers[state.currentIdx].userAnswer = selected;
    
    if (isCorrect) {
        globalStreak++;
        triggerConfetti();
    } else {
        globalStreak = 0;
    }
    
    selectedAnswerValue = null;
    isProcessing = false;
    
    renderQuiz();
    updateStats();
    renderDashboard();
    saveProgress();
}

function nextQuestion(tid) {
    const state = topicsState[tid];
    const totalQs = TOPICS[tid].questions.length;
    
    selectedAnswerValue = null;
    isProcessing = false;
    
    if (state.currentIdx + 1 < totalQs) {
        state.currentIdx++;
        renderQuiz();
    } else {
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

// ==================== DETAILED REPORT SYSTEM ====================

function generateDetailedReport() {
    if (!userId) return;
    
    // Collect all question results
    const reportData = [];
    let totalCorrect = 0;
    let totalQuestions = 0;
    let totalSkipped = 0;
    
    for (let tid of TOPIC_ORDER) {
        const topic = TOPICS[tid];
        const state = topicsState[tid];
        
        if (!state) continue;
        
        const topicData = {
            topicId: tid,
            topicName: topic.name,
            topicIcon: topic.icon,
            questions: [],
            correctCount: 0,
            skippedCount: 0,
            incorrectCount: 0,
            totalCount: topic.questions.length
        };
        
        for (let i = 0; i < topic.questions.length; i++) {
            const question = topic.questions[i];
            const answer = state.answers[i];
            
            // Check if question was skipped
            const isSkipped = answer.answered && answer.skipped === true;
            const isCorrect = answer.answered && answer.correct === true && !isSkipped;
            const isIncorrect = answer.answered && !answer.correct && !isSkipped;
            
            if (isCorrect) totalCorrect++;
            if (isSkipped) totalSkipped++;
            totalQuestions++;
            
            if (isCorrect) topicData.correctCount++;
            if (isSkipped) topicData.skippedCount++;
            if (isIncorrect) topicData.incorrectCount++;
            
            // Format user answer display
            let userAnswerDisplay = "Not answered";
            let statusText = "Not Answered";
            let statusIcon = "fa-question-circle";
            let statusClass = "not-answered";
            
            if (answer.answered) {
                if (isCorrect) {
                    userAnswerDisplay = answer.userAnswer || question.correct;
                    statusText = "Correct";
                    statusIcon = "fa-check-circle";
                    statusClass = "correct";
                } else if (isSkipped) {
                    userAnswerDisplay = "⏭️ Skipped";
                    statusText = "Skipped";
                    statusIcon = "fa-forward";
                    statusClass = "skipped";
                } else {
                    userAnswerDisplay = answer.userAnswer || "Incorrect";
                    statusText = "Incorrect";
                    statusIcon = "fa-times-circle";
                    statusClass = "incorrect";
                }
            }
            
            topicData.questions.push({
                number: i + 1,
                text: question.text,
                correctAnswer: question.correct,
                userAnswer: userAnswerDisplay,
                isCorrect: isCorrect,
                isSkipped: isSkipped,
                isIncorrect: isIncorrect,
                status: statusText,
                statusIcon: statusIcon,
                statusClass: statusClass,
                hint: question.hint || "Review the concept and try again.",
                options: question.options || []
            });
        }
        
        reportData.push(topicData);
    }
    
    currentReportData = reportData;
    
    const percentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const masteredTopics = reportData.filter(t => t.correctCount === t.totalCount).length;
    
    // Create report modal
    const reportModal = document.createElement('div');
    reportModal.className = 'report-modal';
    reportModal.innerHTML = `
        <div class="report-modal-content">
            <div class="report-modal-header">
                <h2><i class="fas fa-chart-line"></i> Math Master - Detailed Progress Report</h2>
                <button class="close-report-modal">&times;</button>
            </div>
            <div class="report-stats">
                <div class="report-stat-card">
                    <i class="fas fa-user-graduate"></i>
                    <div class="report-stat-info">
                        <span class="report-stat-label">Student</span>
                        <span class="report-stat-value">${escapeHtml(userId)}</span>
                    </div>
                </div>
                <div class="report-stat-card">
                    <i class="fas fa-check-circle"></i>
                    <div class="report-stat-info">
                        <span class="report-stat-label">Overall Score</span>
                        <span class="report-stat-value">${totalCorrect}/${totalQuestions}</span>
                        <span class="report-stat-percent">(${percentage}%)</span>
                    </div>
                </div>
                <div class="report-stat-card">
                    <i class="fas fa-forward"></i>
                    <div class="report-stat-info">
                        <span class="report-stat-label">Questions Skipped</span>
                        <span class="report-stat-value" style="color: #ff9800;">${totalSkipped}</span>
                    </div>
                </div>
                <div class="report-stat-card">
                    <i class="fas fa-trophy"></i>
                    <div class="report-stat-info">
                        <span class="report-stat-label">Topics Mastered</span>
                        <span class="report-stat-value">${masteredTopics}/${TOPIC_ORDER.length}</span>
                    </div>
                </div>
                <div class="report-stat-card">
                    <i class="fas fa-fire"></i>
                    <div class="report-stat-info">
                        <span class="report-stat-label">Current Streak</span>
                        <span class="report-stat-value">${globalStreak}</span>
                    </div>
                </div>
            </div>
            
            <div class="report-topics">
                ${reportData.map(topic => `
                    <div class="report-topic-section">
                        <div class="report-topic-header" onclick="toggleTopicReport('${topic.topicId}')">
                            <i class="${topic.topicIcon}"></i>
                            <h3>${escapeHtml(topic.topicName)}</h3>
                            <div class="report-topic-score">
                                <span class="${topic.correctCount === topic.totalCount ? 'mastered' : 'partial'}">
                                    ✅ ${topic.correctCount}/${topic.totalCount} correct
                                </span>
                                ${topic.skippedCount > 0 ? `
                                    <span class="skipped-badge">
                                        ⏭️ ${topic.skippedCount} skipped
                                    </span>
                                ` : ''}
                                <i class="fas fa-chevron-down toggle-icon"></i>
                            </div>
                        </div>
                        <div class="report-topic-details" id="report-topic-${topic.topicId}" style="display: none;">
                            ${topic.questions.map(q => `
                                <div class="report-question-item ${q.statusClass}">
                                    <div class="report-question-header">
                                        <span class="question-number">Q${q.number}</span>
                                        <span class="question-status ${q.statusClass}">
                                            <i class="fas ${q.statusIcon}"></i>
                                            ${q.status}
                                        </span>
                                    </div>
                                    <div class="report-question-text">${escapeHtml(q.text)}</div>
                                    <div class="report-answer-details">
                                        <div class="report-correct-answer">
                                            <strong>Correct answer:</strong> ${escapeHtml(q.correctAnswer)}
                                        </div>
                                        ${!q.isCorrect ? `
                                            <div class="report-user-answer">
                                                <strong>Your answer:</strong> ${escapeHtml(q.userAnswer)}
                                            </div>
                                            <div class="report-hint">
                                                <strong>Hint:</strong> ${escapeHtml(q.hint)}
                                            </div>
                                        ` : ''}
                                    </div>
                                    <div class="report-options">
                                        <strong>Options:</strong>
                                        <ul>
                                            ${q.options.map(opt => `
                                                <li class="${opt === q.correctAnswer ? 'correct-option' : ''}">
                                                    ${opt === q.correctAnswer ? '✓ ' : '○ '}${escapeHtml(opt)}
                                                </li>
                                            `).join('')}
                                        </ul>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="report-actions">
                <button class="report-btn print-report-btn" onclick="printMathReport()">
                    <i class="fas fa-print"></i> Print Report
                </button>
                <button class="report-btn download-report-btn" onclick="downloadMathReport()">
                    <i class="fas fa-download"></i> Download Report (JSON)
                </button>
                <button class="report-btn close-report-btn" onclick="closeMathReportModal()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(reportModal);
    
    // Add event listener to close button
    const closeBtn = reportModal.querySelector('.close-report-modal');
    closeBtn.onclick = () => closeMathReportModal();
    
    // Click outside to close
    reportModal.onclick = (e) => {
        if (e.target === reportModal) {
            closeMathReportModal();
        }
    };
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function toggleTopicReport(topicId) {
    const details = document.getElementById(`report-topic-${topicId}`);
    const toggleIcon = details?.previousElementSibling?.querySelector('.toggle-icon');
    
    if (details && details.style.display === 'none') {
        details.style.display = 'block';
        if (toggleIcon) toggleIcon.style.transform = 'rotate(180deg)';
    } else if (details) {
        details.style.display = 'none';
        if (toggleIcon) toggleIcon.style.transform = 'rotate(0deg)';
    }
}

function closeMathReportModal() {
    const modal = document.querySelector('.report-modal');
    if (modal) {
        modal.remove();
    }
}

function printMathReport() {
    const reportContent = document.querySelector('.report-modal-content');
    if (!reportContent) return;
    
    const clone = reportContent.cloneNode(true);
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Math Master Report - ${escapeHtml(userId)}</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    padding: 40px;
                    background: white;
                    color: #1a3a4f;
                }
                .report-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .report-stat-card {
                    background: #f5f5f5;
                    padding: 20px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .report-stat-card i {
                    font-size: 32px;
                    color: #2196f3;
                }
                .report-stat-info {
                    display: flex;
                    flex-direction: column;
                }
                .report-stat-label {
                    font-size: 12px;
                    color: #666;
                }
                .report-stat-value {
                    font-size: 24px;
                    font-weight: bold;
                    color: #2196f3;
                }
                .report-stat-percent {
                    font-size: 14px;
                    color: #666;
                }
                .report-topic-section {
                    margin-bottom: 25px;
                    border: 1px solid #e0e0e0;
                    border-radius: 12px;
                    overflow: hidden;
                }
                .report-topic-header {
                    background: #f8f9fa;
                    padding: 15px 20px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    flex-wrap: wrap;
                }
                .report-topic-header i {
                    font-size: 24px;
                    color: #2196f3;
                }
                .report-topic-header h3 {
                    flex: 1;
                    margin: 0;
                }
                .report-topic-score {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                .report-topic-score span {
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                }
                .report-topic-score .mastered {
                    background: #4caf50;
                    color: white;
                }
                .report-topic-score .partial {
                    background: #ff9800;
                    color: white;
                }
                .skipped-badge {
                    background: #ff9800;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: bold;
                }
                .toggle-icon {
                    display: none;
                }
                .report-topic-details {
                    display: block !important;
                    padding: 15px;
                }
                .report-question-item {
                    padding: 20px;
                    border-bottom: 1px solid #e0e0e0;
                    margin-bottom: 0;
                }
                .report-question-item.correct {
                    background: #e8f5e9;
                }
                .report-question-item.incorrect {
                    background: #ffebee;
                }
                .report-question-item.skipped {
                    background: #fff3e0;
                }
                .report-question-item.not-answered {
                    background: #f5f5f5;
                }
                .report-question-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }
                .question-number {
                    font-weight: bold;
                    color: #2196f3;
                }
                .question-status {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-weight: 500;
                }
                .question-status.correct i {
                    color: #4caf50;
                }
                .question-status.incorrect i {
                    color: #f44336;
                }
                .question-status.skipped i {
                    color: #ff9800;
                }
                .report-question-text {
                    font-weight: 500;
                    margin-bottom: 10px;
                }
                .report-answer-details {
                    margin: 10px 0;
                    padding: 10px;
                    background: rgba(0,0,0,0.05);
                    border-radius: 8px;
                }
                .correct-option {
                    color: #4caf50;
                    font-weight: bold;
                }
                .report-actions {
                    margin-top: 30px;
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                }
                .report-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                }
                .print-report-btn {
                    background: #2196f3;
                    color: white;
                }
                .download-report-btn {
                    background: #4caf50;
                    color: white;
                }
                .close-report-btn {
                    background: #f44336;
                    color: white;
                }
                @media print {
                    body {
                        padding: 20px;
                    }
                    .report-actions {
                        display: none;
                    }
                    .report-topic-header {
                        break-inside: avoid;
                    }
                    .report-question-item {
                        break-inside: avoid;
                    }
                }
            </style>
        </head>
        <body>
            ${clone.outerHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

function downloadMathReport() {
    if (!currentReportData) return;
    
    const totalCorrect = Object.values(topicsState).reduce((sum, state) => 
        sum + state.answers.filter(a => a.correct).length, 0);
    const totalSkipped = Object.values(topicsState).reduce((sum, state) => 
        sum + state.answers.filter(a => a.skipped).length, 0);
    
    const reportData = {
        student: userId,
        date: new Date().toISOString(),
        globalStreak: globalStreak,
        totalScore: {
            correct: totalCorrect,
            skipped: totalSkipped,
            total: totalPossible,
            percentage: Math.round((totalCorrect / totalPossible) * 100)
        },
        topics: currentReportData.map(topic => ({
            name: topic.topicName,
            id: topic.topicId,
            correctCount: topic.correctCount,
            skippedCount: topic.skippedCount,
            incorrectCount: topic.incorrectCount,
            totalCount: topic.totalCount,
            questions: topic.questions.map(q => ({
                number: q.number,
                text: q.text,
                correctAnswer: q.correctAnswer,
                userAnswer: q.userAnswer,
                isCorrect: q.isCorrect,
                isSkipped: q.isSkipped,
                hint: q.hint
            }))
        }))
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `Math_Master_Report_${userId}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// ==================== REPORT STYLES ====================

function addReportStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .report-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow-y: auto;
            padding: 20px;
            animation: fadeIn 0.3s ease;
        }
        
        .report-modal-content {
            background: var(--card-bg);
            border-radius: 20px;
            max-width: 900px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            padding: 25px;
            border: 1px solid var(--card-border);
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            animation: slideUp 0.3s ease;
        }
        
        .report-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid var(--btn-primary);
        }
        
        .report-modal-header h2 {
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1.3rem;
        }
        
        .close-report-modal {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: var(--text-secondary);
            transition: all 0.2s;
        }
        
        .close-report-modal:hover {
            color: #f44336;
            transform: scale(1.1);
        }
        
        .report-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .report-stat-card {
            background: var(--stat-card-bg, rgba(33, 150, 243, 0.1));
            border: 1px solid var(--card-border);
            border-radius: 12px;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .report-stat-card i {
            font-size: 28px;
            color: var(--btn-primary);
        }
        
        .report-stat-info {
            display: flex;
            flex-direction: column;
        }
        
        .report-stat-label {
            font-size: 12px;
            color: var(--text-secondary);
        }
        
        .report-stat-value {
            font-size: 24px;
            font-weight: bold;
            color: var(--btn-primary);
        }
        
        .report-stat-percent {
            font-size: 14px;
            color: var(--text-secondary);
        }
        
        .report-topic-section {
            margin-bottom: 20px;
            border: 1px solid var(--card-border);
            border-radius: 12px;
            overflow: hidden;
        }
        
        .report-topic-header {
            background: var(--option-bg);
            padding: 12px 15px;
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            transition: all 0.2s;
            flex-wrap: wrap;
        }
        
        .report-topic-header:hover {
            background: var(--option-hover);
        }
        
        .report-topic-header i {
            font-size: 20px;
            color: var(--btn-primary);
        }
        
        .report-topic-header h3 {
            flex: 1;
            margin: 0;
            color: var(--text-primary);
            font-size: 16px;
        }
        
        .report-topic-score {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .report-topic-score span {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .report-topic-score .mastered {
            background: #4caf50;
            color: white;
        }
        
        .report-topic-score .partial {
            background: #ff9800;
            color: white;
        }
        
        .skipped-badge {
            background: #ff9800;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }
        
        .toggle-icon {
            transition: transform 0.3s ease;
        }
        
        .report-topic-details {
            padding: 15px;
            background: var(--card-bg);
        }
        
        .report-question-item {
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 10px;
            border-left: 4px solid;
        }
        
        .report-question-item.correct {
            border-left-color: #4caf50;
            background: var(--feedback-correct-bg, rgba(76, 175, 80, 0.1));
        }
        
        .report-question-item.incorrect {
            border-left-color: #f44336;
            background: var(--feedback-wrong-bg, rgba(244, 67, 54, 0.1));
        }
        
        .report-question-item.skipped {
            border-left-color: #ff9800;
            background: rgba(255, 152, 0, 0.1);
        }
        
        .report-question-item.not-answered {
            border-left-color: #757575;
            background: rgba(117, 117, 117, 0.1);
        }
        
        .report-question-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
        }
        
        .question-number {
            font-weight: bold;
            color: var(--btn-primary);
        }
        
        .question-status {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .question-status.correct i {
            color: #4caf50;
        }
        
        .question-status.incorrect i {
            color: #f44336;
        }
        
        .question-status.skipped i {
            color: #ff9800;
        }
        
        .report-question-text {
            font-weight: 500;
            margin-bottom: 10px;
            color: var(--text-primary);
        }
        
        .report-answer-details {
            margin: 10px 0;
            padding: 10px;
            background: rgba(0,0,0,0.05);
            border-radius: 8px;
            color: var(--text-primary);
        }
        
        .report-options {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid var(--card-border);
        }
        
        .report-options ul {
            list-style: none;
            padding-left: 0;
            margin-top: 8px;
        }
        
        .report-options li {
            padding: 4px 0;
            color: var(--text-primary);
        }
        
        .correct-option {
            color: #4caf50;
            font-weight: bold;
        }
        
        .report-actions {
            margin-top: 25px;
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .report-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        .print-report-btn {
            background: linear-gradient(135deg, #2196f3, #1976d2);
            color: white;
        }
        
        .print-report-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
        }
        
        .download-report-btn {
            background: linear-gradient(135deg, #4caf50, #45a049);
            color: white;
        }
        
        .download-report-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
        }
        
        .close-report-btn {
            background: linear-gradient(135deg, #f44336, #d32f2f);
            color: white;
        }
        
        .close-report-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
        }
        
        /* Action Buttons Group */
        .action-buttons-group {
            display: flex;
            gap: 1rem;
            margin-top: 20px;
        }
        
        .action-buttons-group .submit-btn,
        .action-buttons-group .skip-btn {
            flex: 1;
            margin-top: 0;
        }
        
        /* Skip Button */
        .skip-btn {
            background: linear-gradient(135deg, #ff9800, #f57c00);
            color: white;
            border: none;
            padding: 12px 28px;
            font-size: 1rem;
            font-weight: 600;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            font-family: 'Inter', sans-serif;
        }
        
        .skip-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
            background: linear-gradient(135deg, #f57c00, #ef6c00);
        }
        
        .skip-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }
        
        .feedback-skipped {
            background: rgba(255, 152, 0, 0.1);
            color: #ff9800;
            border-left: 4px solid #ff9800;
        }
        
        .skipped-info {
            margin-top: 10px;
            padding: 8px 12px;
            background: rgba(255, 152, 0, 0.1);
            border-radius: 8px;
            color: #ff9800;
            font-size: 12px;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
            .action-buttons-group {
                flex-direction: column;
                gap: 0.8rem;
            }
            
            .action-buttons-group .submit-btn,
            .action-buttons-group .skip-btn {
                width: 100%;
            }
        }
    `;
    document.head.appendChild(style);
}

// ==================== THEME FUNCTIONS ====================

function loadTheme() {
    const saved = localStorage.getItem('mathTheme') || 'dark';
    document.body.setAttribute('data-theme', saved);
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        if (btn.dataset.theme === saved) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    applyThemeColors(saved);
}

function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('mathTheme', theme);
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    const modal = document.getElementById('themeModal');
    if (modal) {
        modal.classList.remove('show');
    }
    
    applyThemeColors(theme);
    showThemeToast(theme);
}

function applyThemeColors(theme) {
    console.log(`Theme changed to: ${theme}`);
}

function showThemeToast(theme) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<i class="fas fa-${theme === 'dark' ? 'moon' : 'sun'}"></i> ${theme === 'dark' ? 'Dark' : 'Light'} theme applied!`;
    toast.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#2196f3; color:white; padding:12px 20px; border-radius:8px; z-index:9999; animation:fadeOut 3s forwards;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ==================== EVENT LISTENERS ====================

document.addEventListener('DOMContentLoaded', () => {
    addReportStyles();
    
    const reportBtn = document.getElementById('pdfReportBtn');
    if (reportBtn) reportBtn.addEventListener('click', generateDetailedReport);
    
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
    
    const modal = document.getElementById('themeModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }
    
    initGame();
});