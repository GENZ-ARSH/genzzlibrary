// Set API base URL based on environment
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/' : 'https://genzzlibrary.vercel.app/';

// Sound Effects (Embedded as Base64)
const clickSoundBase64 = 'data:audio/mp3;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/4QAuRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAAA...'; // Replace with actual base64 string
const notifySoundBase64 = 'data:audio/mp3;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/4QAuRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAAA...'; // Replace with actual base64 string
const switchSoundBase64 = 'data:audio/mp3;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/4QAuRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAAA...'; // Replace with actual base64 string

const clickSound = new Audio(clickSoundBase64);
const notifySound = new Audio(notifySoundBase64);
const switchSound = new Audio(switchSoundBase64);

// CSRF Token
let csrfToken = null;

// Fetch CSRF Token with Retry
async function fetchCsrfToken(attempts = 3, delay = 1000) {
    for (let i = 0; i < attempts; i++) {
        try {
            console.log('Fetching CSRF token from:', `${API_BASE_URL}api/csrf-token`, `Attempt ${i + 1}`);
            const response = await fetch(`${API_BASE_URL}api/csrf-token`, { credentials: 'include' });
            console.log('CSRF token response status:', response.status);
            if (!response.ok) {
                throw new Error(`Failed to fetch CSRF token: ${response.statusText}`);
            }
            const data = await response.json();
            console.log('CSRF token response data:', data);
            if (!data.csrfToken) {
                throw new Error('CSRF token not received from server');
            }
            csrfToken = data.csrfToken;
            const storedCsrfToken = getCookie('csrfToken');
            console.log('Stored CSRF token in cookie:', storedCsrfToken);
            return true;
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
            if (i < attempts - 1) {
                console.log(`Retrying CSRF token fetch in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.warn('Failed to fetch CSRF token after retries. Proceeding without CSRF token.');
                return false;
            }
        }
    }
}

// Theme Toggle with Auto-Detect
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.textContent = document.body.classList.contains('light-mode') ? '🌙' : '☀️';
        localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
        playSound(switchSound);
    }
}

// Play Sound with Error Handling
function playSound(sound) {
    sound.play().catch(error => {
        console.error('Error playing sound:', error);
    });
}

// Load Theme with Auto-Detect
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch CSRF Token on Load
    await fetchCsrfToken();

    // Auto-detect system theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
        if (prefersDark) {
            document.body.classList.add('light-mode');
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) themeToggle.textContent = '🌙';
        }
    } else {
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) themeToggle.textContent = '🌙';
        }
    }

    // Initialize Particles.js (DNA style)
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles', {
            particles: {
                number: { value: 100, density: { enable: true, value_area: 800 } },
                color: { value: ['#1E90FF', '#FF44CC', '#FFD700'] },
                shape: { type: 'circle' },
                opacity: { value: 0.7, random: true },
                size: { value: 4, random: true },
                line_linked: {
                    enable: true,
                    distance: 120,
                    color: '#FF44CC',
                    opacity: 0.6,
                    width: 1.5
                },
                move: {
                    enable: true,
                    speed: 3,
                    direction: 'none',
                    random: true,
                    straight: false,
                    out_mode: 'out',
                    bounce: false
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: { enable: true, mode: 'repulse' },
                    onclick: { enable: true, mode: 'push' },
                    resize: true
                }
            },
            retina_detect: true
        });
    }

    // Load Announcements
    const announcementText = document.getElementById('announcement-text');
    if (announcementText) {
        announcementText.textContent = 'Welcome to GENZZ CODERS! New books added to PDF Library! 📚';
    }

    // Load Profile Name
    if (window.location.pathname.includes('home.html')) {
        const profileName = localStorage.getItem('userName') || 'User';
        const profileNameElement = document.getElementById('profile-name');
        if (profileNameElement) profileNameElement.textContent = profileName;

        const savedProfilePic = localStorage.getItem('profilePic');
        const profilePicElement = document.getElementById('profile-pic');
        if (savedProfilePic && profilePicElement) {
            profilePicElement.src = savedProfilePic;
        }

        updateProgress();

        // Add click handler for Next Topper section
        const nextTopperCard = document.getElementById('next-topper-card');
        if (nextTopperCard) {
            nextTopperCard.onclick = () => {
                window.location.href = 'https://power-study.vercel.app/Batches.html';
            };
        }
    }

    // Add click handler for "How to Generate Key" button on index.html
    if (window.location.pathname.includes('index.html')) {
        const howToGenerateKeyButton = document.getElementById('how-to-generate-key');
        if (howToGenerateKeyButton) {
            howToGenerateKeyButton.onclick = () => {
                window.location.href = 'https://t.me/+Bnq8o97cPBw1MzM0';
            };
        }
    }

    // Easter Egg
    let clickCount = 0;
    const logo = document.getElementById('logo');
    if (logo) {
        logo.addEventListener('click', () => {
            clickCount++;
            if (clickCount === 5) {
                if (typeof confetti !== 'undefined') {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }
                clickCount = 0;
            }
        });
    }

    // Load Books on Books Page
    if (window.location.pathname.includes('books.html')) {
        fetchBooksForBooksPage();
    }

    // Check Access Key on Load
    checkKey();
});

// Cookie Management
function setCookie(name, value, hours) {
    const date = new Date();
    date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name) {
    const nameEQ = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Check Key on Pages (24-hour validity)
function checkKey() {
    const key = getCookie('accessKey');
    const keyTimestamp = localStorage.getItem('keyTimestamp');
    const currentTime = new Date().getTime();
    const hours24 = 24 * 60 * 60 * 1000;

    if (!key || !keyTimestamp || (currentTime - parseInt(keyTimestamp) > hours24)) {
        localStorage.removeItem('accessKey');
        localStorage.removeItem('keyTimestamp');
        setCookie('accessKey', '', -1);
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
        return false;
    }

    if (window.location.pathname.includes('home.html')) {
        fetchBooks();
    }
    return true;
}

// Key Generation
async function generateKey(server, button) {
    const title = button.querySelector('.card-title');
    if (title) title.textContent = 'Generating Your Key...';
    button.classList.add('generating');
    playSound(clickSound);

    try {
        const response = await fetch(`${API_BASE_URL}api/shorten`, {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate key');
        }
        if (data.shortenedUrl) {
            localStorage.setItem('keyTimestamp', new Date().getTime());
            window.location.href = data.shortenedUrl;
        } else {
            throw new Error('No shortened URL received');
        }
    } catch (error) {
        console.error('Error generating key:', error);
        if (title) title.textContent = server === 'server1' ? 'Server 1' : 'Server 2';
        button.classList.remove('generating');
        alert('Failed to generate key. Please try again.');
    }
}

// Redirect to Books with Animation
function redirectToBooksWithAnimation() {
    document.body.classList.add('transition-to-books');
    setTimeout(() => {
        window.location.href = 'books.html';
    }, 1000);
}

// Sample Books (5 books for simulation)
const sampleBooks = [
    {
        name: "Physics for JEE",
        author: "H.C. Verma",
        coverImage: "https://via.placeholder.com/150?text=Physics+for+JEE",
        downloadLink: "https://example.com/physics-for-jee.pdf",
        tag: "exam-jee",
        badges: ["HOT 🔥"]
    },
    {
        name: "Chemistry NCERT Class 12",
        author: "NCERT",
        coverImage: "https://via.placeholder.com/150?text=Chemistry+NCERT",
        downloadLink: "https://example.com/chemistry-ncert.pdf",
        tag: "class-12",
        badges: ["NEW 📖"]
    },
    {
        name: "Biology for NEET",
        author: "Trueman",
        coverImage: "https://via.placeholder.com/150?text=Biology+for+NEET",
        downloadLink: "https://example.com/biology-for-neet.pdf",
        tag: "exam-neet",
        badges: ["TOP ⭐"]
    },
    {
        name: "Mathematics for IIT-JEE",
        author: "R.D. Sharma",
        coverImage: "https://via.placeholder.com/150?text=Maths+IIT-JEE",
        downloadLink: "https://example.com/maths-iit-jee.pdf",
        tag: "exam-jee",
        badges: ["BEST 📘"]
    },
    {
        name: "English Grammar for Class 10",
        author: "Wren & Martin",
        coverImage: "https://via.placeholder.com/150?text=English+Grammar",
        downloadLink: "https://example.com/english-grammar.pdf",
        tag: "class-10",
        badges: ["CLASSIC 📖"]
    }
];

// Fetch Books for Books Page
async function fetchBooksForBooksPage() {
    try {
        const response = await fetch(`${API_BASE_URL}api/books`, { credentials: 'include' });
        console.log('Fetch books response status:', response.status);
        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }
        const books = await response.json();
        console.log('Fetched books:', books);
        renderBooksForBooksPage(books.length ? books : sampleBooks);
    } catch (error) {
        console.error('Error fetching books for books page:', error);
        renderBooksForBooksPage(sampleBooks);
    }
}

function renderBooksForBooksPage(books) {
    const booksSection = document.getElementById('books-section');
    if (booksSection) {
        booksSection.innerHTML = books.map(book => `
            <div class="book-card">
                ${book.badges && book.badges.length ? `<span class="badge">${book.badges.join(' ')}</span>` : ''}
                <img src="${book.coverImage || 'https://via.placeholder.com/150?text=No+Image'}" alt="${book.name}">
                <h4>${book.name}</h4>
                <p>${book.author}</p>
                <span class="tag">${book.tag || 'No Tag'}</span>
                <button onclick="downloadBook('${book.name}', '${book.downloadLink}')">Download</button>
            </div>
        `).join('');
    } else {
        console.error('books-section element not found');
    }
}

// Fetch Books for Home Page
let downloadedBooks = JSON.parse(localStorage.getItem('downloadedBooks')) || [];
async function fetchBooks() {
    try {
        const response = await fetch(`${API_BASE_URL}api/books`, { credentials: 'include' });
        if (!response.ok) {
            throw new Error('Failed to fetch books');
        }
        const books = await response.json();
        renderBooks(books.length ? books : sampleBooks);
    } catch (error) {
        console.error('Error fetching books:', error);
        renderBooks(sampleBooks);
    } finally {
        loadQuiz();
    }
}

function renderBooks(books) {
    const booksSection = document.getElementById('books-section');
    if (booksSection) {
        booksSection.classList.remove('hidden');
        const booksCard = document.getElementById('books-card');
        if (booksCard) booksCard.onclick = redirectToBooksWithAnimation;
        booksSection.innerHTML = books.map(book => `
            <div class="book-card">
                ${book.badges && book.badges.length ? `<span class="badge">${book.badges.join(' ')}</span>` : ''}
                <img src="${book.coverImage || 'https://via.placeholder.com/150?text=No+Image'}" alt="${book.name}">
                <h4>${book.name}</h4>
                <p>${book.author}</p>
                <span class="tag">${book.tag || 'No Tag'}</span>
                <button onclick="downloadBook('${book.name}', '${book.downloadLink}')">Download</button>
            </div>
        `).join('');
    }
}

function downloadBook(bookName, link) {
    downloadedBooks.push(bookName);
    localStorage.setItem('downloadedBooks', JSON.stringify(downloadedBooks));
    updateProgress(20);
    if (downloadedBooks.length >= 3 && !localStorage.getItem('bookCollectorBadge')) {
        localStorage.setItem('bookCollectorBadge', 'Book Collector 📚');
        alert('Badge Unlocked: Book Collector 📚');
    }
    window.location.href = link;
}

function showDownloads() {
    const sections = ['books-section', 'quiz-section', 'leaderboard-section'];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) element.classList.add('hidden');
    });
    const downloadsSection = document.getElementById('downloads-section');
    if (downloadsSection) {
        downloadsSection.classList.remove('hidden');
        downloadsSection.scrollIntoView({ behavior: 'smooth' });
        const downloadsList = document.getElementById('downloads-list');
        if (downloadsList) {
            downloadsList.innerHTML = downloadedBooks.length ? downloadedBooks.map(book => `<li>${book}</li>`).join('') : '<li>No downloads yet.</li>';
        }
    }
}

// Update Progress
function updateProgress(points = 0) {
    let progress = parseInt(localStorage.getItem('progress')) || 0;
    progress += points;
    if (progress > 100) progress = 100;
    localStorage.setItem('progress', progress);

    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const badgesList = document.getElementById('badges-list');
    
    if (progressFill) progressFill.style.width = `${progress}%`;
    
    const badges = [
        { threshold: 25, name: 'Beginner 📖', key: 'beginnerBadge' },
        { threshold: 50, name: 'Book Worm 🐛', key: 'bookWormBadge' },
        { threshold: 75, name: 'Scholar 📖', key: 'scholarBadge' },
        { threshold: 100, name: 'GenZZ Master 🌟', key: 'genzzMasterBadge' }
    ];

    let currentBadge = 'No Badges';
    for (const badge of badges) {
        if (progress >= badge.threshold) {
            currentBadge = badge.name;
            if (!localStorage.getItem(badge.key)) {
                localStorage.setItem(badge.key, badge.name);
                alert(`Badge Unlocked: ${badge.name}`);
            }
        }
    }

    if (progressText) progressText.textContent = `${progress}% - ${currentBadge}`;

    const allBadges = [
        'beginnerBadge', 'bookWormBadge', 'scholarBadge', 'genzzMasterBadge',
        'socialStar', 'quizMasterBadge', 'bookCollectorBadge'
    ].map(key => localStorage.getItem(key)).filter(Boolean);
    if (badgesList) {
        badgesList.innerHTML = allBadges.length ? allBadges.map(b => `<span>${b}</span>`).join(', ') : 'No badges yet.';
    }
}

// Admin Verification
async function verifyAdminOnLoad() {
    if (!window.location.pathname.includes('admin.html')) return;

    const password = prompt('Enter Admin Password:');
    if (!password) {
        window.location.href = 'home.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}api/auth/verify-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken || ''
            },
            body: JSON.stringify({ password }),
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to verify admin');
        }
        if (!data.success) {
            alert('Invalid password.');
            window.location.href = 'home.html';
        }
    } catch (error) {
        console.error('Error verifying admin:', error);
        alert('Error verifying admin. Please try again.');
        window.location.href = 'home.html';
    }
}

// Add Book
async function addBook() {
    const book = {
        name: document.getElementById('book-name')?.value || '',
        author: document.getElementById('book-author')?.value || '',
        coverImage: document.getElementById('book-cover')?.value || '',
        downloadLink: document.getElementById('book-link')?.value || '',
        tag: document.getElementById('book-tag')?.value || ''
    };

    try {
        const response = await fetch(`${API_BASE_URL}api/books`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken || ''
            },
            body: JSON.stringify(book),
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('Failed to add book');
        }
        alert('Book added successfully!');
    } catch (error) {
        console.error('Error adding book:', error);
        alert('Failed to add book. Please try again.');
    }
}

// Add Badge
async function addBadge() {
    const badge = {
        badgeName: document.getElementById('badge-name')?.value || '',
        emoji: document.getElementById('badge-emoji')?.value || ''
    };

    try {
        const response = await fetch(`${API_BASE_URL}api/auth/add-badge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken || ''
            },
            body: JSON.stringify(badge),
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('Failed to add badge');
        }
        alert('Badge added successfully!');
    } catch (error) {
        console.error('Error adding badge:', error);
        alert('Failed to add badge. Please try again.');
    }
}

// Referral Link
function copyReferralLink() {
    const referralLink = 'https://genzz-coders.com/invite?ref=user123';
    navigator.clipboard.writeText(referralLink).then(() => {
        alert('Referral link copied: ' + referralLink);
        updateProgress(15);
        if (!localStorage.getItem('socialStar')) {
            localStorage.setItem('socialStar', 'Social Star 🌟');
            alert('Badge Unlocked: Social Star 🌟');
        }
    }).catch(error => {
        console.error('Error copying referral link:', error);
        alert('Failed to copy referral link.');
    });
}

// Quiz Section
const quizQuestions = [
    {
        question: "What is the capital of India?",
        options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
        answer: "Delhi"
    },
    {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        answer: "4"
    }
];

function loadQuiz() {
    const quizSection = document.getElementById('quiz-section');
    const quizCard = document.getElementById('quiz-card');
    if (quizSection && quizCard) {
        quizCard.onclick = () => {
            document.getElementById('books-section')?.classList.add('hidden');
            document.getElementById('downloads-section')?.classList.add('hidden');
            document.getElementById('leaderboard-section')?.classList.remove('hidden');
            quizSection.classList.remove('hidden');
            quizSection.scrollIntoView({ behavior: 'smooth' });
        };
        const quizContent = document.getElementById('quiz-content');
        if (quizContent) {
            quizContent.innerHTML = quizQuestions.map((q, index) => `
                <div class="question">
                    <p>${index + 1}. ${q.question}</p>
                    ${q.options.map((option, i) => `
                        <label><input type="radio" name="q${index}" value="${option}"> ${option}</label>
                    `).join('')}
                </div>
            `).join('');
        }
        loadLeaderboard();
    }
}

function submitQuiz() {
    let score = 0;
    quizQuestions.forEach((q, index) => {
        const selected = document.querySelector(`input[name="q${index}"]:checked`);
        if (selected && selected.value === q.answer) {
            score++;
        }
    });
    alert(`Your score: ${score}/${quizQuestions.length}`);
    updateProgress(score * 10);
    if (score === quizQuestions.length && !localStorage.getItem('quizMasterBadge')) {
        localStorage.setItem('quizMasterBadge', 'Quiz Master 🧠');
        alert('Badge Unlocked: Quiz Master 🧠');
    }
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    const userName = localStorage.getItem('userName') || 'User';
    leaderboard.push({ name: userName, score });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    loadLeaderboard();
}

function loadLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    if (leaderboardList) {
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        leaderboardList.innerHTML = leaderboard.length ? leaderboard.map(entry => `<li>${entry.name}: ${entry.score}</li>`).join('') : '<li>No scores yet.</li>';
    }
}

// Chatbot Logic
let chatState = 'askName';
let userName = '';

function toggleChatbot() {
    const chatbot = document.getElementById('chatbot');
    if (chatbot) {
        chatbot.style.display = chatbot.style.display === 'block' ? 'none' : 'block';
        if (chatState === 'askName') {
            addBotMessage('Hey, what\'s your name?');
        }
    }
}

function addBotMessage(message) {
    const messages = document.getElementById('chatbot-messages');
    if (messages) {
        messages.innerHTML += `<p class="typing"></p>`;
        messages.scrollTop = messages.scrollHeight;
        setTimeout(() => {
            messages.lastChild.remove();
            messages.innerHTML += `<p class="bot-message">${message}</p>`;
            messages.scrollTop = messages.scrollHeight;
        }, 1000);
    }
}

function addUserMessage(message) {
    const messages = document.getElementById('chatbot-messages');
    if (messages) {
        messages.innerHTML += `<p class="user-message">${message}</p>`;
        messages.scrollTop = messages.scrollHeight;
        playSound(notifySound);
    }
}

async function handleChatbotInput(event) {
    if (event.key !== 'Enter') return;
    const input = document.getElementById('chatbot-input');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;

    addUserMessage(message);
    input.value = '';

    if (chatState === 'askName') {
        userName = message;
        localStorage.setItem('userName', userName);
        chatState = 'askReview';
        addBotMessage(`Nice to meet you, ${userName}! Please share your review.`);
    } else if (chatState === 'askReview') {
        try {
            const response = await fetch(`${API_BASE_URL}api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken || ''
                },
                body: JSON.stringify({ name: userName, message }),
                credentials: 'include'
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit review');
            }
            addBotMessage(`${data.message} Here's the shortened link: ${data.shortenedUrl}`);
            updateProgress(10);
            chatState = 'idle';
        } catch (error) {
            console.error('Error submitting review:', error);
            addBotMessage('Failed to submit review. Please try again.');
        }
    } else if (chatState === 'askPassword') {
        try {
            const response = await fetch(`${API_BASE_URL}api/auth/verify-admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken || ''
                },
                body: JSON.stringify({ password: message }),
                credentials: 'include'
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to verify password');
            }
            if (data.success) {
                addBotMessage('Password verified! Redirecting...');
                setTimeout(() => {
                    window.location.href = window.location.pathname.includes('home.html') ? 'admin.html' : 'home.html';
                }, 1000);
            } else {
                addBotMessage('Invalid password. Try again.');
                chatState = 'idle';
            }
        } catch (error) {
            console.error('Error verifying password:', error);
            addBotMessage('Error verifying password.');
            chatState = 'idle';
        }
    } else {
        if (message === '/admin') {
            chatState = 'askPassword';
            addBotMessage('Please enter the admin password:');
        } else if (message === '/links') {
            addBotMessage('Join our Telegram: https://t.me/+Bnq8o97cPBw1MzM0');
        } else {
            addBotMessage('I\'m here to collect reviews! Please share your review.');
            chatState = 'askReview';
        }
    }
}

// Profile Picture Update
function updateProfilePic(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const src = e.target.result;
            const profilePicElement = document.getElementById('profile-pic');
            if (profilePicElement) {
                profilePicElement.src = src;
                localStorage.setItem('profilePic', src);
            }
        };
        reader.readAsDataURL(file);
    }
}

// Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}
