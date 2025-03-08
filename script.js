
document.addEventListener("DOMContentLoaded", function () {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (userData) {
        // Update username display
        document.getElementById("username-display").textContent = `Hi, ${userData.username}`;
        
        // Update avatar if it exists
        if (userData.avatar) {
            const avatarImg = document.getElementById("user-avatar");
            avatarImg.src = userData.avatar;
            avatarImg.onerror = function() {
                this.src = "theme/avatars/default.png";
            };
        }
        
        // Update level and experience
        document.getElementById("level-number").textContent = userData.level || 1;
        document.getElementById("experience").textContent = userData.experience || 0;
        document.getElementById("next-level").textContent = (userData.level || 1) * 100;
        
        // Update experience bar
        updateExperienceBar(userData.experience || 0, userData.level || 1);
        
        // Update rank display
        updateRankDisplay(userData.level || 1, userData.experience || 0);
        
        // Show logout button
        document.getElementById("logout").style.display = "inline-block";
    } else {
        // Redirect to login if no user data
        window.location.href = 'log.html';
    }
});
   
    // Logout functionality
    document.getElementById('logout').addEventListener('click', () => {
      localStorage.removeItem('userData');
      window.location.href = 'log.html';
  });

// Experience System
function gainExperience(exp) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) return;

    userData.experience += exp;
    const maxExperience = userData.level * 100;

    if (userData.experience >= maxExperience) {
        levelUp(userData);
  }

    localStorage.setItem('userData', JSON.stringify(userData));
    updateDisplay(userData);
}

function levelUp(userData) {
    userData.level += 1;
    userData.experience = 0;
    showLevelUpNotification(userData.level);
}

function updateDisplay(userData) {
    document.getElementById("level-number").textContent = userData.level;
    document.getElementById("experience").textContent = userData.experience;
    document.getElementById("next-level").textContent = userData.level * 100;
    updateExperienceBar(userData.experience, userData.level);
    updateRankDisplay(userData.level, userData.experience);
}

function updateExperienceBar(experience, level) {
    const maxExperience = level * 100;
    const progress = (experience / maxExperience) * 100;
    document.getElementById("experience-fill").style.width = `${progress}%`;
}

function updateRankDisplay(level, experience) {
    const rankInfo = calculateRank(level, experience);
    document.getElementById("rank-image").src = `theme/ranks/${rankInfo.rank.toLowerCase()}.png`;
    document.getElementById("rank-name").textContent = rankInfo.rank;
    document.getElementById("rank-progress-fill").style.width = `${rankInfo.progress}%`;
    document.getElementById("rank-progress-text").textContent = `${Math.round(rankInfo.progress)}%`;
}

function calculateRank(level, experience) {
    const ranks = {
        'Novice': { minLevel: 1, maxLevel: 5, xpRequired: 1000 },
        'Apprentice': { minLevel: 6, maxLevel: 10, xpRequired: 2500 },
        'Scholar': { minLevel: 11, maxLevel: 15, xpRequired: 5000 },
        'Master': { minLevel: 16, maxLevel: 20, xpRequired: 10000 },
        'Grandmaster': { minLevel: 21, maxLevel: 25, xpRequired: 20000 }
    };

    for (const [rank, requirements] of Object.entries(ranks)) {
        if (level >= requirements.minLevel && level <= requirements.maxLevel) {
            const progress = (experience / requirements.xpRequired) * 100;
            return {
                rank,
                progress: Math.min(progress, 100),
                nextRank: getNextRank(rank)
            };
        }
    }

    return {
        rank: 'Grandmaster',
        progress: 100,
        nextRank: null
    };
}

function getNextRank(currentRank) {
    const ranks = ['Novice', 'Apprentice', 'Scholar', 'Master', 'Grandmaster'];
    const currentIndex = ranks.indexOf(currentRank);
    return currentIndex < ranks.length - 1 ? ranks[currentIndex + 1] : null;
}

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

// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'dark';
body.setAttribute('data-theme', savedTheme);
themeToggle.checked = savedTheme === 'dark';

// Theme toggle event listener
themeToggle.addEventListener('change', () => {
    const theme = themeToggle.checked ? 'dark' : 'light';
    body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update navbar background based on theme
    const navbar = document.querySelector('.navbar');
    navbar.style.background = theme === 'dark' ? 
        'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)';
});
