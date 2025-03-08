class ChallengeGenerator {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.deepseek.com/v1';
        this.ranks = {
            'Novice': { minLevel: 1, maxLevel: 5, xpRequired: 1000 },
            'Apprentice': { minLevel: 6, maxLevel: 10, xpRequired: 2500 },
            'Scholar': { minLevel: 11, maxLevel: 15, xpRequired: 5000 },
            'Master': { minLevel: 16, maxLevel: 20, xpRequired: 10000 },
            'Grandmaster': { minLevel: 21, maxLevel: 25, xpRequired: 20000 }
        };
    }

    async generateDailyChallenge(userLevel, subjects) {
        try {
            const prompt = `Generate a detailed study challenge with the following format:
            {
                "task": "Main task title",
                "chapter": "Chapter X: Topic",
                "objectives": ["objective1", "objective2", "objective3"],
                "time": "45 mins",
                "studyContent": "Detailed study content with key concepts and examples",
                "questions": [
                    {
                        "question": "A challenging question about the topic",
                        "options": ["option1", "option2", "option3", "option4"],
                        "correct": 0,
                        "explanation": "Detailed step-by-step explanation"
                    },
                    {
                        "question": "Another question testing understanding",
                        "options": ["option1", "option2", "option3", "option4"],
                        "correct": 0,
                        "explanation": "Detailed explanation with reasoning"
                    }
                ],
                "xp": ${userLevel * 15},
                "coins": ${userLevel * 5},
                "unlockCost": ${userLevel * 10}
            }

            Consider the following:
            - User Level: ${userLevel}
            - Subject: ${subjects.join(', ')}
            - Make content appropriately challenging for the level
            - Include practical examples and real-world applications
            - Ensure questions test different aspects of understanding
            - Provide detailed, educational explanations`;

            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert educational content creator specializing in creating engaging and informative study challenges.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            const challenge = JSON.parse(data.choices[0].message.content);
            
            // Add additional metadata
            challenge.id = Date.now();
            challenge.dateCreated = new Date().toISOString();
            challenge.difficulty = this.calculateDifficulty(userLevel);
            
            return challenge;
        } catch (error) {
            console.error('Error generating challenge:', error);
            return this.getFallbackChallenge(userLevel, subjects[0]);
        }
    }

    calculateDifficulty(userLevel) {
        if (userLevel <= 5) return "Beginner";
        if (userLevel <= 10) return "Intermediate";
        if (userLevel <= 15) return "Advanced";
        return "Expert";
    }

    getFallbackChallenge(userLevel, subject) {
        const templates = challengeTemplates[subject.toLowerCase()] || challengeTemplates['mathematics'];
        const challenge = templates[Math.floor(Math.random() * templates.length)];
        return {
            task: challenge.task,
            objectives: challenge.objectives,
            estimatedTime: challenge.time,
            xpReward: challenge.xp,
            coinReward: challenge.coins
        };
    }

    async generateSpecialChallenge(userLevel, subject, classContent) {
        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a study assistant that creates specialized learning challenges based on class content.'
                        },
                        {
                            role: 'user',
                            content: `Generate a special challenge for a level ${userLevel} student studying ${subject}.
                            Class content: ${classContent}
                            Include:
                            1. A challenging task based on the class content
                            2. Specific learning objectives
                            3. Required materials/resources
                            4. XP reward (between ${userLevel * 20} and ${userLevel * 40})
                            Format as JSON.`
                        }
                    ]
                })
            });

            const data = await response.json();
            return JSON.parse(data.choices[0].message.content);
        } catch (error) {
            console.error('Error generating special challenge:', error);
            return null;
        }
    }

    calculateRank(userLevel, experience) {
        for (const [rank, requirements] of Object.entries(this.ranks)) {
            if (userLevel >= requirements.minLevel && userLevel <= requirements.maxLevel) {
                const progress = (experience / requirements.xpRequired) * 100;
                return {
                    rank,
                    progress: Math.min(progress, 100),
                    nextRank: this.getNextRank(rank)
                };
            }
        }
        return {
            rank: 'Grandmaster',
            progress: 100,
            nextRank: null
        };
    }

    getNextRank(currentRank) {
        const ranks = Object.keys(this.ranks);
        const currentIndex = ranks.indexOf(currentRank);
        return currentIndex < ranks.length - 1 ? ranks[currentIndex + 1] : null;
    }
}

// Initialize challenge generator with the API key
const challengeGen = new ChallengeGenerator('sk-5374cbbfb8a140ee8071f4b5f2f83a7c');

// Challenge Templates with chapters and questions
const challengeTemplates = {
    mathematics: [
        {
            task: "Study Linear Equations",
            chapter: "Chapter 1: Linear Equations and Inequalities",
            objectives: ["Understand basic linear equations", "Solve word problems"],
            time: "45 mins",
            studyContent: "Read pages 10-15 in your textbook about linear equations",
            questions: [
                {
                    question: "Solve for x: 2x + 5 = 15",
                    options: ["x = 5", "x = 10", "x = 8", "x = 6"],
                    correct: 0,
                    explanation: "2x + 5 = 15\n2x = 15 - 5\n2x = 10\nx = 5"
                },
                {
                    question: "If 3x - 7 = 14, what is x?",
                    options: ["x = 7", "x = 8", "x = 6", "x = 9"],
                    correct: 0,
                    explanation: "3x - 7 = 14\n3x = 14 + 7\n3x = 21\nx = 7"
                }
            ],
            xp: 30,
            coins: 15,
            unlockCost: 20
        },
        {
            task: "Master Geometry Basics",
            chapter: "Chapter 2: Basic Geometry",
            objectives: ["Learn about angles", "Understand triangles"],
            time: "2 mins",
            studyContent: "Study the properties of triangles and angles on pages 25-28",
            questions: [
                {
                    question: "What is the sum of angles in a triangle?",
                    options: ["180°", "360°", "90°", "270°"],
                    correct: 0,
                    explanation: "The sum of angles in a triangle is always 180 degrees. This is a fundamental property of triangles."
                }
            ],
            xp: 25,
            coins: 12,
            unlockCost: 15
        }
    ],
    science: [
        {
            task: "Explore Ecosystems",
            chapter: "Chapter 3: Ecosystems and Habitats",
            objectives: ["Understand food chains", "Learn about habitats"],
            time: "50 mins",
            studyContent: "Read about different types of ecosystems in Chapter 3",
            questions: [
                {
                    question: "What is the primary producer in a food chain?",
                    options: ["Plants", "Herbivores", "Carnivores", "Decomposers"],
                    correct: 0,
                    explanation: "Plants are primary producers as they make their own food through photosynthesis."
                }
            ],
            xp: 35,
            coins: 18,
            unlockCost: 25
        }
    ]
};

// Special Challenge Templates (more difficult, higher rewards)
const specialChallengeTemplates = {
    mathematics: [
        { 
            task: "Solve an advanced math puzzle", 
            objectives: ["Critical thinking", "Problem-solving"], 
            time: "60 mins", 
            xp: 50, 
            coins: 25,
            answer: "Detailed solution steps...",
            unlockCost: 30
        }
    ],
    science: [
        {
            task: "Design and conduct an experiment", 
            objectives: ["Hypothesis testing", "Data analysis"], 
            time: "90 mins", 
            xp: 60, 
            coins: 30,
            answer: "Experiment methodology and results...",
            unlockCost: 35
        }
    ],
    english: [
        {
            task: "Write a research essay", 
            objectives: ["Research skills", "Academic writing"], 
            time: "120 mins", 
            xp: 70, 
            coins: 35,
            answer: "Essay structure and guidelines...",
            unlockCost: 40
        }
    ]
};

// Timer functionality
let studyTimer = null;
let remainingTime = 0;

function startStudyTimer(duration, challengeId) {
    clearInterval(studyTimer);
    remainingTime = duration * 60; // Convert minutes to seconds
    
    const timerDisplay = document.getElementById(`timer-${challengeId}`);
    const questionsSection = document.getElementById(`questions-${challengeId}`);
    const startBtn = document.getElementById(`start-btn-${challengeId}`);
    const studyContent = document.getElementById(`study-content-${challengeId}`);
    
    // Show study content and hide start button
    if (studyContent) {
        studyContent.style.display = 'block';
        studyContent.classList.remove('hidden');
    }
    if (startBtn) startBtn.style.display = 'none';
    if (questionsSection) questionsSection.style.display = 'none';
    
    studyTimer = setInterval(() => {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        
        if (timerDisplay) {
            timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Add warning class when less than 1 minute remains
            if (remainingTime <= 60) {
                timerDisplay.classList.add('ending');
            }
        }
        
        if (remainingTime <= 0) {
            clearInterval(studyTimer);
            if (timerDisplay) timerDisplay.textContent = "Time's Up!";
            if (studyContent) {
                studyContent.style.display = 'none';
                studyContent.classList.add('hidden');
            }
            if (questionsSection) {
                questionsSection.style.display = 'block';
                questionsSection.classList.add('visible');
                showQuestions(challengeId);
            }
        }
        
        remainingTime--;
    }, 1000);
}

function showQuestions(challengeId) {
    const challenge = findChallengeById(challengeId);
    const questionContainer = document.getElementById(`questions-${challengeId}`);
    
    if (!challenge || !questionContainer) {
        console.error('Challenge or question container not found:', { challengeId, challenge, questionContainer });
        return;
    }
    
    console.log('Showing questions for challenge:', challengeId);
    
    // Make sure the questions section is visible
    questionContainer.style.display = 'block';
    questionContainer.classList.add('visible');
    
    if (!challenge.questions || challenge.questions.length === 0) {
        console.error('No questions found for challenge:', challengeId);
        questionContainer.innerHTML = '<p>No questions available for this challenge.</p>';
        return;
    }
    
    questionContainer.innerHTML = challenge.questions.map((q, qIndex) => `
        <div class="question-card" id="question-${challengeId}-${qIndex}">
            <h4>Question ${qIndex + 1}:</h4>
            <p>${q.question}</p>
            <div class="options">
                ${q.options.map((opt, optIndex) => `
                    <button onclick="checkAnswer(${challengeId}, ${qIndex}, ${optIndex})" 
                            class="option-btn" 
                            id="option-${challengeId}-${qIndex}-${optIndex}">
                        ${opt}
                    </button>
                `).join('')}
            </div>
            <div id="explanation-${challengeId}-${qIndex}" class="explanation" style="display: none;">
                <p>${q.explanation}</p>
            </div>
            <div class="feedback" id="feedback-${challengeId}-${qIndex}"></div>
            <button onclick="unlockExplanation(${challengeId}, ${qIndex}, ${challenge.unlockCost})" 
                    class="unlock-btn" 
                    id="unlock-btn-${challengeId}-${qIndex}">
                Unlock Explanation (${challenge.unlockCost} coins)
            </button>
        </div>
    `).join('');
    
    console.log('Questions rendered for challenge:', challengeId);
}

function checkAnswer(challengeId, questionIndex, selectedOption) {
    const challenge = findChallengeById(challengeId);
    const question = challenge.questions[questionIndex];
    const feedbackDiv = document.getElementById(`feedback-${challengeId}-${questionIndex}`);
    const optionButtons = document.querySelectorAll(`#question-${challengeId}-${questionIndex} .option-btn`);
    
    // Disable all options after selection
    optionButtons.forEach(btn => btn.disabled = true);
    
    if (selectedOption === question.correct) {
        // Correct answer
        const userData = JSON.parse(localStorage.getItem('userData'));
        userData.coins += challenge.coins;
        userData.experience += challenge.xp;
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Show success feedback
        feedbackDiv.innerHTML = `
            <div class="success-feedback">
                <p>✅ Correct! You earned ${challenge.coins} coins and ${challenge.xp} XP!</p>
            </div>
        `;
        
        // Highlight correct answer
        document.getElementById(`option-${challengeId}-${questionIndex}-${selectedOption}`).classList.add('correct');
        
        updateDisplay(userData);
        
        // Check if all questions are answered correctly
        const allQuestionsAnswered = checkAllQuestionsAnswered(challengeId);
        if (allQuestionsAnswered) {
            completeChallenge(challenge.xp * 2, challenge.coins * 2); // Bonus for completing all questions
        }
    } else {
        // Incorrect answer
        feedbackDiv.innerHTML = `
            <div class="error-feedback">
                <p>❌ Incorrect. Try reviewing the material and try again!</p>
            </div>
        `;
        document.getElementById(`option-${challengeId}-${questionIndex}-${selectedOption}`).classList.add('incorrect');
    }
}

function checkAllQuestionsAnswered(challengeId) {
    const challenge = findChallengeById(challengeId);
    const feedbackDivs = document.querySelectorAll(`[id^="feedback-${challengeId}"]`);
    let correctCount = 0;
    
    feedbackDivs.forEach(div => {
        if (div.querySelector('.success-feedback')) {
            correctCount++;
        }
    });
    
    return correctCount === challenge.questions.length;
}

function unlockExplanation(challengeId, questionIndex, cost) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (userData.coins >= cost) {
        userData.coins -= cost;
        localStorage.setItem('userData', JSON.stringify(userData));
        
        document.getElementById(`explanation-${challengeId}-${questionIndex}`).style.display = 'block';
        document.getElementById(`unlock-btn-${challengeId}-${questionIndex}`).style.display = 'none';
        
        updateDisplay(userData);
    } else {
        alert('Not enough coins! Complete more challenges to earn coins.');
    }
}

function findChallengeById(challengeId) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) return null;

    const challenges = getDailyChallenges(userData.subjects);
    return challenges[challengeId] || null;
}

// Function to get random challenges for the day
function getDailyChallenges(subjects) {
    console.log('Getting daily challenges for subjects:', subjects);
    const dailyChallenges = [];
    subjects.forEach(subject => {
        const subjectLower = subject.toLowerCase();
        console.log('Processing subject:', subject);
        if (challengeTemplates[subjectLower]) {
            const templates = challengeTemplates[subjectLower];
            const randomChallenge = templates[Math.floor(Math.random() * templates.length)];
            dailyChallenges.push({
                subject,
                ...randomChallenge
            });
            console.log('Added challenge for', subject, randomChallenge);
        } else {
            console.log('No templates found for subject:', subject);
        }
    });
    console.log('Generated daily challenges:', dailyChallenges);
    return dailyChallenges;
}

// Function to get special challenges
function getSpecialChallenges(subjects) {
    console.log('Getting special challenges for subjects:', subjects);
    const specialChallenges = [];
    subjects.forEach(subject => {
        const subjectLower = subject.toLowerCase();
        console.log('Processing subject for special challenge:', subject);
        if (specialChallengeTemplates[subjectLower]) {
            const templates = specialChallengeTemplates[subjectLower];
            const randomChallenge = templates[Math.floor(Math.random() * templates.length)];
            specialChallenges.push({
                subject,
                ...randomChallenge
            });
            console.log('Added special challenge for', subject, randomChallenge);
        } else {
            console.log('No special templates found for subject:', subject);
        }
    });
    console.log('Generated special challenges:', specialChallenges);
    return specialChallenges;
}

// Function to update daily challenges
function updateDailyChallenges() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) return;

    const challenges = getDailyChallenges(userData.subjects);
    const challengeContainer = document.getElementById('challenges-container');
    
    if (!challengeContainer) {
        console.error('Challenge container not found');
        return;
    }

    challengeContainer.innerHTML = challenges.map((challenge, index) => `
        <div class="challenge-card" id="challenge-${index}">
            <h3>${challenge.subject} Challenge</h3>
            <div class="challenge-details">
                <h4>${challenge.task}</h4>
                <p class="chapter-title">${challenge.chapter}</p>
                <h4>Learning Objectives:</h4>
                <ul>
                    ${challenge.objectives.map(obj => `<li>${obj}</li>`).join('')}
                </ul>
                <p><strong>Study Time:</strong> ${challenge.time}</p>
                <p><strong>Rewards:</strong> ${challenge.xp} XP + ${challenge.coins} coins per correct answer</p>
                <div class="study-content" id="study-content-${index}" style="display: none;">
                    <p>${challenge.studyContent}</p>
                </div>
                <div class="timer" id="timer-${index}">Time Remaining: ${challenge.time}</div>
                <button onclick="startStudyTimer(${parseInt(challenge.time)}, ${index})" 
                        class="start-btn" 
                        id="start-btn-${index}">
                    Start Studying
                </button>
            </div>
            <div class="questions-section" id="questions-${index}" style="display: none;">
                <!-- Questions will be populated here when timer ends -->
            </div>
        </div>
    `).join('');
}

// Function to update special challenges
function updateSpecialChallenges() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) return;

    const challenges = getSpecialChallenges(userData.subjects);
    const specialChallengesContainer = document.getElementById('special-challenges-container');
    
    if (!specialChallengesContainer) {
        console.error('Special challenges container not found');
        return;
    }

    specialChallengesContainer.innerHTML = challenges.map(challenge => `
        <div class="challenge-card special">
            <h3>${challenge.subject} Special Challenge</h3>
            <div class="challenge-details">
                <h4>${challenge.task}</h4>
                <h4>Learning Objectives:</h4>
                <ul>
                    ${challenge.objectives.map(obj => `<li>${obj}</li>`).join('')}
                </ul>
                <p><strong>Estimated Time:</strong> ${challenge.time}</p>
                <p><strong>Rewards:</strong> ${challenge.xp} XP + ${challenge.coins} coins</p>
                ${userData.unlockedAnswers.includes(challenge.task) ? 
                    `<div class="answer-section">
                        <h4>Solution:</h4>
                        <p>${challenge.answer}</p>
                    </div>` :
                    `<button onclick="unlockAnswer('${challenge.task}', ${challenge.unlockCost})" class="unlock-btn">
                        Unlock Answer (${challenge.unlockCost} coins)
                    </button>`
                }
            </div>
            <button onclick="completeSpecialChallenge(${challenge.xp}, ${challenge.coins})" class="complete-btn">
                Complete Challenge
            </button>
        </div>
    `).join('');
}

// Function to handle challenge completion
function completeChallenge(xpReward, coinReward) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) return;

    userData.experience += xpReward;
    userData.coins += coinReward;
    
    // Level up if experience threshold is reached
    const experienceThreshold = userData.level * 100;
    if (userData.experience >= experienceThreshold) {
        userData.level += 1;
        userData.experience -= experienceThreshold;
        userData.coins += userData.level * 50; // Bonus coins on level up
        showLevelUpNotification(userData.level, userData.level * 50);
    }

    localStorage.setItem('userData', JSON.stringify(userData));
    updateDisplay(userData);
    updateDailyChallenges();
}

// Function to handle special challenge completion
function completeSpecialChallenge(xpReward, coinReward) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) return;

    userData.experience += xpReward;
    userData.coins += coinReward;
    
    // Level up if experience threshold is reached
    const experienceThreshold = userData.level * 100;
    if (userData.experience >= experienceThreshold) {
        userData.level += 1;
        userData.experience -= experienceThreshold;
        userData.coins += userData.level * 50; // Bonus coins on level up
        showLevelUpNotification(userData.level, userData.level * 50);
    }

    localStorage.setItem('userData', JSON.stringify(userData));
    updateDisplay(userData);
    updateSpecialChallenges();
}

// Function to unlock challenge answers
function unlockAnswer(challengeTask, cost) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) return;

    if (userData.coins >= cost) {
        userData.coins -= cost;
        userData.unlockedAnswers.push(challengeTask);
        localStorage.setItem('userData', JSON.stringify(userData));
        updateDisplay(userData);
        updateSpecialChallenges();
    } else {
        alert('Not enough coins! Complete more challenges to earn coins.');
    }
}

// Function to show level up notification
function showLevelUpNotification(newLevel, coinReward) {
    const notification = document.createElement('div');
    notification.className = 'level-up-notification';
    notification.innerHTML = `
        <h2>🎉 Level Up! 🎉</h2>
        <p>Congratulations! You've reached level ${newLevel}!</p>
        <p>Bonus Reward: ${coinReward} coins! 🪙</p>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Function to update display
function updateDisplay(userData) {
    // Update level and experience
    document.getElementById('level-number').textContent = userData.level;
    document.getElementById('experience').textContent = userData.experience;
    document.getElementById('next-level').textContent = userData.level * 100;
    
    // Update coins display if it exists
    const coinsDisplay = document.getElementById('coins-display');
    if (coinsDisplay) {
        coinsDisplay.textContent = userData.coins;
    }
    
    // Update experience bar
    const experienceThreshold = userData.level * 100;
    const progress = (userData.experience / experienceThreshold) * 100;
    document.getElementById('experience-fill').style.width = `${progress}%`;
    
    // Update rank display
    const rankInfo = challengeGen.calculateRank(userData.level, userData.experience);
    const rankImageContainer = document.getElementById('rank-container');
    if (rankImageContainer) {
        rankImageContainer.innerHTML = `
            <img src="theme/ranks/${rankInfo.rank.toLowerCase()}.png" alt="${rankInfo.rank} Rank" id="rank-image">
            <div class="rank-name" id="rank-name">${rankInfo.rank}</div>
            <div class="rank-progress">
                <div class="rank-progress-bar">
                    <div class="rank-progress-fill" id="rank-progress-fill" style="width: ${rankInfo.progress}%"></div>
                </div>
                <div class="rank-progress-text" id="rank-progress-text">${Math.round(rankInfo.progress)}%</div>
            </div>
        `;
    } else {
        // If container doesn't exist, update individual elements
        document.getElementById('rank-image').src = `theme/ranks/${rankInfo.rank.toLowerCase()}.png`;
        document.getElementById('rank-name').textContent = rankInfo.rank;
        document.getElementById('rank-progress-fill').style.width = `${rankInfo.progress}%`;
        document.getElementById('rank-progress-text').textContent = `${Math.round(rankInfo.progress)}%`;
    }
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing challenges...');
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
        console.log('User data found:', userData);
        updateDisplay(userData);
        updateDailyChallenges();
        updateSpecialChallenges();
    } else {
        console.log('No user data found');
    }
}); 
