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
                            content: 'You are a study assistant that creates personalized learning challenges.'
                        },
                        {
                            role: 'user',
                            content: `Generate a daily study challenge for a level ${userLevel} student studying ${subjects.join(', ')}. 
                            Include: 
                            1. A main task
                            2. Learning objectives
                            3. Estimated time
                            4. XP reward (between ${userLevel * 10} and ${userLevel * 20})
                            Format as JSON.`
                        }
                    ]
                })
            });

            const data = await response.json();
            return JSON.parse(data.choices[0].message.content);
        } catch (error) {
            console.error('Error generating challenge:', error);
            return null;
        }
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

// Initialize challenge generator
const challengeGen = new ChallengeGenerator('YOUR_DEEPSEEK_API_KEY');

// Function to update daily challenges
async function updateDailyChallenges() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) return;

    const challenge = await challengeGen.generateDailyChallenge(userData.level, userData.subjects);
    if (challenge) {
        const challengeContainer = document.getElementById('challenges-container');
        challengeContainer.innerHTML = `
            <div class="challenge-card">
                <h3>${challenge.task}</h3>
                <div class="challenge-details">
                    <h4>Learning Objectives:</h4>
                    <ul>
                        ${challenge.objectives.map(obj => `<li>${obj}</li>`).join('')}
                    </ul>
                    <p><strong>Estimated Time:</strong> ${challenge.estimatedTime}</p>
                    <p><strong>XP Reward:</strong> ${challenge.xpReward}</p>
                </div>
                <button onclick="completeChallenge(${challenge.xpReward})" class="complete-btn">
                    Complete Challenge
                </button>
            </div>
        `;
    }
}

// Function to update special challenges
async function updateSpecialChallenges() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) return;

    const specialChallengesContainer = document.getElementById('special-challenges-container');
    specialChallengesContainer.innerHTML = '';

    for (const subject of userData.subjects) {
        // In a real application, you would get this from your backend
        const classContent = "Sample class content for " + subject;
        
        const challenge = await challengeGen.generateSpecialChallenge(userData.level, subject, classContent);
        if (challenge) {
            const challengeElement = document.createElement('div');
            challengeElement.className = 'challenge-card special';
            challengeElement.innerHTML = `
                <h3>${subject} Special Challenge</h3>
                <div class="challenge-details">
                    <h4>${challenge.task}</h4>
                    <h4>Learning Objectives:</h4>
                    <ul>
                        ${challenge.objectives.map(obj => `<li>${obj}</li>`).join('')}
                    </ul>
                    <p><strong>Required Materials:</strong> ${challenge.materials}</p>
                    <p><strong>XP Reward:</strong> ${challenge.xpReward}</p>
                </div>
                <button onclick="completeSpecialChallenge('${subject}', ${challenge.xpReward})" class="complete-btn">
                    Complete Special Challenge
                </button>
            `;
            specialChallengesContainer.appendChild(challengeElement);
        }
    }
}

// Function to handle challenge completion
function completeChallenge(xpReward) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) return;

    userData.experience += xpReward;
    
    // Level up if experience threshold is reached
    const experienceThreshold = userData.level * 100;
    if (userData.experience >= experienceThreshold) {
        userData.level += 1;
        userData.experience -= experienceThreshold;
        showLevelUpNotification(userData.level);
    }

    // Update rank
    const rankInfo = challengeGen.calculateRank(userData.level, userData.experience);
    userData.rank = rankInfo.rank;

    localStorage.setItem('userData', JSON.stringify(userData));
    updateExperienceBar();
    updateRankDisplay();
    updateDailyChallenges();
}

// Function to handle special challenge completion
function completeSpecialChallenge(subject, xpReward) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) return;

    userData.experience += xpReward;
    
    // Level up if experience threshold is reached
    const experienceThreshold = userData.level * 100;
    if (userData.experience >= experienceThreshold) {
        userData.level += 1;
        userData.experience -= experienceThreshold;
        showLevelUpNotification(userData.level);
    }

    // Update rank
    const rankInfo = challengeGen.calculateRank(userData.level, userData.experience);
    userData.rank = rankInfo.rank;

    localStorage.setItem('userData', JSON.stringify(userData));
    updateExperienceBar();
    updateRankDisplay();
    updateSpecialChallenges();
}

// Function to update experience bar
function updateExperienceBar() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) return;

    const experienceThreshold = userData.level * 100;
    const progress = (userData.experience / experienceThreshold) * 100;

    document.getElementById('experience-fill').style.width = `${progress}%`;
    document.getElementById('experience').textContent = userData.experience;
    document.getElementById('next-level').textContent = experienceThreshold;
    document.getElementById('level').textContent = userData.level;
    document.getElementById('level-number').textContent = userData.level;
}

// Function to update rank display
function updateRankDisplay() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) return;

    const rankInfo = challengeGen.calculateRank(userData.level, userData.experience);
    
    document.getElementById('rank-image').src = `theme/ranks/${rankInfo.rank.toLowerCase()}.png`;
    document.getElementById('rank-name').textContent = rankInfo.rank;
    document.getElementById('rank-progress-fill').style.width = `${rankInfo.progress}%`;
    document.getElementById('rank-progress-text').textContent = `${Math.round(rankInfo.progress)}%`;
}

// Function to show level up notification
function showLevelUpNotification(newLevel) {
    const notification = document.createElement('div');
    notification.className = 'level-up-notification';
    notification.innerHTML = `
        <h2>🎉 Level Up! 🎉</h2>
        <p>Congratulations! You've reached level ${newLevel}!</p>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateDailyChallenges();
    updateSpecialChallenges();
    updateExperienceBar();
    updateRankDisplay();
}); 