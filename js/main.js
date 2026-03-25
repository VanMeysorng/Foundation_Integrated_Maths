// main.js - Main application logic

// Global variables
let topicsState = {};
let globalStreak = 0;
let totalPossible = 0;
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
    let masteredCount = 0;
    for (let tid of TOPIC_ORDER) {
        const state = topicsState[tid];
        if (state) {
            const correct = state.answers.filter(a => a.correct).length;
            totalCorrect += correct;
            // Topic is considered mastered only if ALL answers are correct
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
        const totalQs = topic.questions.length;
        const isMastered = correctCount === totalQs;
        const progressPercent = (correctCount / totalQs) * 100;
        
        const card = document.createElement('div');
        card.className = `topic-card`; // No locked class anymore
        card.onclick = () => openTopic(tid); // All topics are clickable
        
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
            icon = 'fa-trophy';
        } else if (percentage >= 60) {
            message = 'Good job! Review the questions you missed to improve.';
            icon = 'fa-thumbs-up';
        } else if (percentage >= 40) {
            message = 'Keep practicing! Review the material and try again.';
            icon = 'fa-book';
        } else {
            message = 'Don\'t give up! Study the material and try this topic again.';
            icon = 'fa-heart';
        }
        
        container.innerHTML = `
            <div class="victory-screen">
                <i class="fas fa-chart-line"></i>
                <h2>Topic Completed!</h2>
                <div class="score-display">
                    <div class="score-circle">
                        <span class="score-number">${score}</span>
                        <span class="score-total">/${totalQs}</span>
                    </div>
                    <div class="score-percentage">${percentage}%</div>
                </div>
                <p><i class="fas ${icon}"></i> ${message}</p>
                <div class="completion-buttons">
                    <button class="next-btn" onclick="retryTopic('${currentTopic}')">
                        <i class="fas fa-redo"></i> Retry Topic
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

// Add this global variable at the top with other global variables
let currentReportData = null; // Store report data for detailed view

// Add this function to generate detailed report
function generateDetailedReport() {
    if (!userId) return;
    
    // Collect all question results
    const reportData = [];
    let totalCorrect = 0;
    let totalQuestions = 0;
    
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
            totalCount: topic.questions.length
        };
        
        for (let i = 0; i < topic.questions.length; i++) {
            const question = topic.questions[i];
            const answer = state.answers[i];
            const isCorrect = answer.answered && answer.correct;
            
            if (isCorrect) totalCorrect++;
            totalQuestions++;
            if (isCorrect) topicData.correctCount++;
            
            topicData.questions.push({
                number: i + 1,
                text: question.text,
                correctAnswer: question.correct,
                userAnswer: answer.answered ? (answer.correct ? question.correct : "Incorrect/Not answered correctly") : "Not answered",
                isCorrect: isCorrect,
                hint: question.hint,
                options: question.options
            });
        }
        
        reportData.push(topicData);
    }
    
    currentReportData = reportData;
    
    const percentage = Math.round((totalCorrect / totalQuestions) * 100);
    const masteredTopics = reportData.filter(t => t.correctCount === t.totalCount).length;
    
    // Create report modal
    const reportModal = document.createElement('div');
    reportModal.className = 'report-modal';
    reportModal.innerHTML = `
        <div class="report-modal-content">
            <div class="report-modal-header">
                <h2><i class="fas fa-chart-line"></i> Detailed Progress Report</h2>
                <button class="close-report-modal">&times;</button>
            </div>
            <div class="report-stats">
                <div class="report-stat-card">
                    <i class="fas fa-user-graduate"></i>
                    <div class="report-stat-info">
                        <span class="report-stat-label">Student</span>
                        <span class="report-stat-value">${userId}</span>
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
                            <h3>${topic.topicName}</h3>
                            <div class="report-topic-score">
                                <span class="${topic.correctCount === topic.totalCount ? 'mastered' : topic.correctCount > 0 ? 'partial' : 'none'}">
                                    ${topic.correctCount}/${topic.totalCount} correct
                                </span>
                                <i class="fas fa-chevron-down toggle-icon"></i>
                            </div>
                        </div>
                        <div class="report-topic-details" id="report-topic-${topic.topicId}" style="display: none;">
                            ${topic.questions.map(q => `
                                <div class="report-question-item ${q.isCorrect ? 'correct' : 'incorrect'}">
                                    <div class="report-question-header">
                                        <span class="question-number">Q${q.number}</span>
                                        <span class="question-status">
                                            <i class="fas ${q.isCorrect ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                                            ${q.isCorrect ? 'Correct' : 'Incorrect'}
                                        </span>
                                    </div>
                                    <div class="report-question-text">${q.text}</div>
                                    <div class="report-answer-details">
                                        <div class="report-correct-answer">
                                            <strong>Correct answer:</strong> ${q.correctAnswer}
                                        </div>
                                        ${!q.isCorrect ? `
                                            <div class="report-user-answer">
                                                <strong>Your answer:</strong> ${q.userAnswer}
                                            </div>
                                            <div class="report-hint">
                                                <strong>Hint:</strong> ${q.hint}
                                            </div>
                                        ` : ''}
                                    </div>
                                    <div class="report-options">
                                        <strong>Options:</strong>
                                        <ul>
                                            ${q.options.map(opt => `
                                                <li class="${opt === q.correctAnswer ? 'correct-option' : ''}">
                                                    ${opt === q.correctAnswer ? '✓ ' : '○ '}${opt}
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
                <button class="report-btn print-report-btn" onclick="printReport()">
                    <i class="fas fa-print"></i> Print Report
                </button>
                <button class="report-btn download-report-btn" onclick="downloadReport()">
                    <i class="fas fa-download"></i> Download Report (JSON)
                </button>
                <button class="report-btn close-report-btn" onclick="closeReportModal()">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(reportModal);
    
    // Add event listener to close button
    const closeBtn = reportModal.querySelector('.close-report-modal');
    closeBtn.onclick = () => closeReportModal();
    
    // Click outside to close
    reportModal.onclick = (e) => {
        if (e.target === reportModal) {
            closeReportModal();
        }
    };
}

function toggleTopicReport(topicId) {
    const details = document.getElementById(`report-topic-${topicId}`);
    const toggleIcon = document.querySelector(`#report-topic-${topicId}`).previousElementSibling.querySelector('.toggle-icon');
    
    if (details.style.display === 'none') {
        details.style.display = 'block';
        toggleIcon.style.transform = 'rotate(180deg)';
    } else {
        details.style.display = 'none';
        toggleIcon.style.transform = 'rotate(0deg)';
    }
}

function closeReportModal() {
    const modal = document.querySelector('.report-modal');
    if (modal) {
        modal.remove();
    }
}

function printReport() {
    const reportContent = document.querySelector('.report-modal-content').cloneNode(true);
    const printWindow = window.open('', '_blank');
    
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Math Master Report - ${userId}</title>
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
                    cursor: pointer;
                }
                .report-topic-header i {
                    font-size: 24px;
                    color: #2196f3;
                }
                .report-topic-header h3 {
                    flex: 1;
                    margin: 0;
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
                .report-question-item {
                    padding: 20px;
                    border-bottom: 1px solid #e0e0e0;
                }
                .report-question-item.correct {
                    background: #e8f5e9;
                }
                .report-question-item.incorrect {
                    background: #ffebee;
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
                }
                .question-status i.fa-check-circle {
                    color: #4caf50;
                }
                .question-status i.fa-times-circle {
                    color: #f44336;
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
            ${reportContent.outerHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

function downloadReport() {
    if (!currentReportData) return;
    
    const reportData = {
        student: userId,
        date: new Date().toISOString(),
        globalStreak: globalStreak,
        totalScore: {
            correct: Object.values(topicsState).reduce((sum, state) => 
                sum + state.answers.filter(a => a.correct).length, 0),
            total: totalPossible
        },
        topics: currentReportData.map(topic => ({
            name: topic.topicName,
            id: topic.topicId,
            correctCount: topic.correctCount,
            totalCount: topic.totalCount,
            questions: topic.questions.map(q => ({
                number: q.number,
                text: q.text,
                correctAnswer: q.correctAnswer,
                userAnswer: q.userAnswer,
                isCorrect: q.isCorrect,
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

// Add this CSS for the report modal
function addReportStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .report-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow-y: auto;
            padding: 20px;
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
            box-shadow: 0 8px 32px var(--shadow);
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
            background: var(--stat-card-bg);
            border: 1px solid var(--stat-card-border);
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
        
        .report-topic-score .none {
            background: #f44336;
            color: white;
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
            background: var(--feedback-correct-bg);
        }
        
        .report-question-item.incorrect {
            border-left-color: #f44336;
            background: var(--feedback-wrong-bg);
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
        
        .question-status i.fa-check-circle {
            color: #4caf50;
        }
        
        .question-status i.fa-times-circle {
            color: #f44336;
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
            background: #2196f3;
            color: white;
        }
        
        .print-report-btn:hover {
            background: #1976d2;
            transform: translateY(-2px);
        }
        
        .download-report-btn {
            background: #4caf50;
            color: white;
        }
        
        .download-report-btn:hover {
            background: #45a049;
            transform: translateY(-2px);
        }
        
        .close-report-btn {
            background: #f44336;
            color: white;
        }
        
        .close-report-btn:hover {
            background: #d32f2f;
            transform: translateY(-2px);
        }
    `;
    document.head.appendChild(style);
}

// Update the generateReport function to use the detailed report
function generateReport() {
    generateDetailedReport();
}

// Add this to DOMContentLoaded to add report styles
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
    
    initGame();
});

function loadTheme() {
    const saved = localStorage.getItem('mathTheme') || 'dark';
    document.body.setAttribute('data-theme', saved);
    
    // Update theme buttons active state
    document.querySelectorAll('.theme-btn').forEach(btn => {
        if (btn.dataset.theme === saved) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Apply theme-specific styles if needed
    applyThemeColors(saved);
}

function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('mathTheme', theme);
    
    // Update theme buttons active state
    document.querySelectorAll('.theme-btn').forEach(btn => {
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Close modal after theme selection
    const modal = document.getElementById('themeModal');
    if (modal) {
        modal.classList.remove('show');
    }
    
    // Apply theme-specific colors
    applyThemeColors(theme);
    
    // Show confirmation toast
    showThemeToast(theme);
}

function applyThemeColors(theme) {
    // Optional: Add any additional theme-specific JavaScript adjustments
    // This is mostly handled by CSS variables now
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

// Update your event listeners in DOMContentLoaded
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
    
    // Click outside modal to close
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