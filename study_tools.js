// Progress Tracking System
class ProgressTracker {
    constructor() {
        this.studyData = JSON.parse(localStorage.getItem('studyData')) || {
            subjects: {},
            studyTime: {},
            weeklyProgress: {},
            monthlyProgress: {},
            notes: [],
            formulas: {},
            citations: []
        };
    }

    // Track study time for a subject
    trackStudyTime(subject, duration) {
        const date = new Date().toISOString().split('T')[0];
        if (!this.studyData.studyTime[date]) {
            this.studyData.studyTime[date] = {};
        }
        if (!this.studyData.studyTime[date][subject]) {
            this.studyData.studyTime[date][subject] = 0;
        }
        this.studyData.studyTime[date][subject] += duration;
        this.saveData();
    }

    // Track chapter completion
    trackChapterCompletion(subject, chapter, score) {
        if (!this.studyData.subjects[subject]) {
            this.studyData.subjects[subject] = {
                chapters: {},
                totalScore: 0,
                completedChapters: 0
            };
        }
        this.studyData.subjects[subject].chapters[chapter] = {
            score,
            completedAt: new Date().toISOString(),
            timeSpent: this.getStudyTimeForChapter(subject, chapter)
        };
        this.updateSubjectProgress(subject);
        this.saveData();
    }

    // Get study analytics
    getAnalytics() {
        return {
            totalStudyTime: this.calculateTotalStudyTime(),
            subjectProgress: this.calculateSubjectProgress(),
            weeklyStats: this.calculateWeeklyStats(),
            monthlyStats: this.calculateMonthlyStats(),
            productivity: this.calculateProductivityMetrics()
        };
    }

    // Generate progress report
    generateReport(timeframe = 'weekly') {
        const report = {
            timeframe,
            generatedAt: new Date().toISOString(),
            stats: timeframe === 'weekly' ? this.calculateWeeklyStats() : this.calculateMonthlyStats(),
            recommendations: this.generateRecommendations()
        };
        return report;
    }

    // Save data to localStorage
    saveData() {
        localStorage.setItem('studyData', JSON.stringify(this.studyData));
    }
}

// Pomodoro Timer
class PomodoroTimer {
    constructor() {
        this.settings = {
            studyDuration: 25,
            shortBreak: 5,
            longBreak: 15,
            sessionsBeforeLongBreak: 4
        };
        this.currentSession = 0;
        this.isRunning = false;
        this.timeLeft = 0;
        this.timer = null;
    }

    startTimer(type = 'study') {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.timeLeft = this.getDuration(type) * 60;
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.completeSession(type);
            }
        }, 1000);
    }

    pauseTimer() {
        if (!this.isRunning) return;
        clearInterval(this.timer);
        this.isRunning = false;
    }

    resetTimer() {
        clearInterval(this.timer);
        this.isRunning = false;
        this.timeLeft = 0;
        this.currentSession = 0;
        this.updateDisplay();
    }

    getDuration(type) {
        switch(type) {
            case 'study': return this.settings.studyDuration;
            case 'short': return this.settings.shortBreak;
            case 'long': return this.settings.longBreak;
            default: return this.settings.studyDuration;
        }
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const display = document.getElementById('pomodoro-timer');
        if (display) {
            display.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    completeSession(type) {
        this.pauseTimer();
        if (type === 'study') {
            this.currentSession++;
            if (this.currentSession % this.settings.sessionsBeforeLongBreak === 0) {
                this.startTimer('long');
            } else {
                this.startTimer('short');
            }
        } else {
            this.startTimer('study');
        }
        this.notifyUser(type);
    }

    notifyUser(type) {
        const notification = new Notification('Pomodoro Timer', {
            body: type === 'study' ? 'Time for a break!' : 'Break is over, back to studying!',
            icon: '/theme/icons/timer.png'
        });
    }
}

// Note Taking System
class NoteSystem {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
    }

    addNote(content, tags = [], subject) {
        const note = {
            id: Date.now(),
            content,
            tags,
            subject,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        this.notes.push(note);
        this.saveNotes();
        return note;
    }

    searchNotes(query, tags = []) {
        return this.notes.filter(note => {
            const contentMatch = note.content.toLowerCase().includes(query.toLowerCase());
            const tagMatch = tags.length === 0 || tags.some(tag => note.tags.includes(tag));
            return contentMatch && tagMatch;
        });
    }

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }
}

// Formula Sheet Generator
class FormulaGenerator {
    constructor() {
        this.formulas = {
            mathematics: {
                algebra: [
                    { name: 'Quadratic Formula', formula: 'x = (-b ± √(b² - 4ac)) / 2a' },
                    { name: 'Slope', formula: 'm = (y₂ - y₁) / (x₂ - x₁)' }
                ],
                geometry: [
                    { name: 'Circle Area', formula: 'A = πr²' },
                    { name: 'Triangle Area', formula: 'A = ½bh' }
                ]
            },
            physics: {
                mechanics: [
                    { name: 'Force', formula: 'F = ma' },
                    { name: 'Kinetic Energy', formula: 'KE = ½mv²' }
                ]
            }
        };
    }

    generateSheet(subject, topics = []) {
        if (!this.formulas[subject]) return [];
        
        if (topics.length === 0) {
            return Object.values(this.formulas[subject]).flat();
        }
        
        return topics.reduce((acc, topic) => {
            if (this.formulas[subject][topic]) {
                acc.push(...this.formulas[subject][topic]);
            }
            return acc;
        }, []);
    }
}

// Citation Generator
class CitationGenerator {
    generateCitation(type, data) {
        switch(type) {
            case 'book':
                return this.generateBookCitation(data);
            case 'website':
                return this.generateWebsiteCitation(data);
            case 'journal':
                return this.generateJournalCitation(data);
            default:
                return '';
        }
    }

    generateBookCitation(data) {
        return `${data.authors}. (${data.year}). ${data.title}. ${data.publisher}.`;
    }

    generateWebsiteCitation(data) {
        return `${data.authors}. (${data.year}). ${data.title}. Retrieved from ${data.url}`;
    }

    generateJournalCitation(data) {
        return `${data.authors}. (${data.year}). ${data.title}. ${data.journal}, ${data.volume}(${data.issue}), ${data.pages}.`;
    }
}

// Accessibility Features
class AccessibilityManager {
    constructor() {
        this.settings = JSON.parse(localStorage.getItem('accessibilitySettings')) || {
            highContrast: false,
            dyslexicFont: false,
            textToSpeech: false,
            fontSize: 'medium'
        };
        this.applySettings();
    }

    toggleHighContrast() {
        this.settings.highContrast = !this.settings.highContrast;
        document.body.classList.toggle('high-contrast');
        this.saveSettings();
    }

    toggleDyslexicFont() {
        this.settings.dyslexicFont = !this.settings.dyslexicFont;
        document.body.classList.toggle('dyslexic-font');
        this.saveSettings();
    }

    speak(text) {
        if (!this.settings.textToSpeech) return;
        
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    }

    setFontSize(size) {
        this.settings.fontSize = size;
        document.body.style.fontSize = this.getFontSize(size);
        this.saveSettings();
    }

    getFontSize(size) {
        const sizes = {
            small: '14px',
            medium: '16px',
            large: '18px',
            'extra-large': '20px'
        };
        return sizes[size] || sizes.medium;
    }

    saveSettings() {
        localStorage.setItem('accessibilitySettings', JSON.stringify(this.settings));
    }

    applySettings() {
        if (this.settings.highContrast) {
            document.body.classList.add('high-contrast');
        }
        if (this.settings.dyslexicFont) {
            document.body.classList.add('dyslexic-font');
        }
        document.body.style.fontSize = this.getFontSize(this.settings.fontSize);
    }
}

// Initialize all tools
const progressTracker = new ProgressTracker();
const pomodoroTimer = new PomodoroTimer();
const noteSystem = new NoteSystem();
const formulaGenerator = new FormulaGenerator();
const citationGenerator = new CitationGenerator();
const accessibilityManager = new AccessibilityManager();

// Export all tools
window.studyTools = {
    progressTracker,
    pomodoroTimer,
    noteSystem,
    formulaGenerator,
    citationGenerator,
    accessibilityManager
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize study tools
    const tools = window.studyTools;
    tools.progressTracker.initialize();
    tools.pomodoroTimer.initialize();
    // ... initialize other tools
});