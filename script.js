/*
    Hifz Pro
 */

const SURAH_NAMES = [
    "Al-Fatiha", "Al-Baqarah", "Ali 'Imran", "An-Nisa", "Al-Ma'idah", "Al-An'am", "Al-A'raf", "Al-Anfal", "At-Tawbah", "Yunus",
    "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim", "Al-Hijr", "An-Nahl", "Al-Isra", "Al-Kahf", "Maryam", "Ta-Ha",
    "Al-Anbiya", "Al-Hajj", "Al-Mu'minun", "An-Nur", "Al-Furqan", "Ash-Shu'ara", "An-Naml", "Al-Qasas", "Al-Ankabut", "Ar-Rum",
    "Luqman", "As-Sajdah", "Al-Ahzab", "Saba", "Fatir", "Ya-Sin", "As-Saffat", "Sad", "Az-Zumar", "Ghafir",
    "Fussilat", "Ash-Shura", "Az-Zukhruf", "Ad-Dukhan", "Al-Jathiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf",
    "Adh-Dhariyat", "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadila", "Al-Hashr", "Al-Mumtahanah",
    "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Taghabun", "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij",
    "Nuh", "Al-Jinn", "Al-Muzzammil", "Al-Muddaththir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat", "An-Naba", "An-Nazi'at", "Abasa",
    "At-Takwir", "Al-Infitar", "Al-Mutaffifin", "Al-Inshiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Ghashiyah", "Al-Fajr", "Al-Balad",
    "Ash-Shams", "Al-Layl", "Ad-Duhaa", "Ash-Sharh", "At-Tin", "Al-Alaq", "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-Adiyat",
    "Al-Qari'ah", "At-Takathur", "Al-Asr", "Al-Humazah", "Al-Fil", "Quraysh", "Al-Ma'un", "Al-Kawthar", "Al-Kafirun", "An-Nasr",
    "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

const state = {
    surahMap: {},
    sessionQueue: [],
    currentIndex: 0
};

const ui = {
    sidebar: document.querySelector('.sidebar'),
    setupPanel: document.getElementById('setup-panel'),
    sessionPanel: document.getElementById('session-panel'),
    emptyState: document.getElementById('empty-state'),
    surahSelect: document.getElementById('surah-select'),
    verseTrigger: document.getElementById('verse-trigger'),
    revealedContainer: document.getElementById('revealed-container'),
    btnStart: document.getElementById('btn-start'),
    btnReveal: document.getElementById('btn-reveal'),
    btnNext: document.getElementById('btn-next'),
    btnReset: document.getElementById('btn-reset'),
    sessionInfo: document.getElementById('session-info'),
    currentSurahDisplay: document.getElementById('current-surah-display'),
    ayahDisplay: document.getElementById('ayah-number-display'),
    menuToggle: document.getElementById('mobile-menu-toggle')
};

async function init() {
    try {
        const response = await fetch('quran.txt');
        if (!response.ok) throw new Error("File not found");
        const text = await response.text();
        parseData(text);
        populateDropdown();
    } catch (error) {
        console.error(error);
        ui.btnStart.textContent = "Data Error";
        alert("Make sure 'quran.txt' is loaded via a local server.");
    }
}

function parseData(text) {
    const lines = text.trim().split('\n');
    lines.forEach(line => {
        if (!line) return;
        const [surah, ayah, content] = line.split('|');
        if (!state.surahMap[surah]) state.surahMap[surah] = [];
        state.surahMap[surah].push({ surah, ayah, content: content.trim() });
    });
}

function populateDropdown() {
    ui.surahSelect.innerHTML = ''; 
    Object.keys(state.surahMap).sort((a, b) => a - b).forEach(num => {
        const opt = document.createElement('option');
        opt.value = num;
        opt.textContent = `${num}. ${SURAH_NAMES[num - 1]}`; 
        ui.surahSelect.appendChild(opt);
    });
}

// Mobile Nav Toggle
if (ui.menuToggle) {
    ui.menuToggle.addEventListener('click', () => {
        ui.sidebar.classList.toggle('active');
        ui.menuToggle.innerHTML = ui.sidebar.classList.contains('active') ? 
            '<span class="material-symbols-rounded">close</span>' : 
            '<span class="material-symbols-rounded">menu</span>';
    });
}

// Start Session
ui.btnStart.addEventListener('click', () => {
    const selected = Array.from(ui.surahSelect.selectedOptions).map(o => o.value);
    if (selected.length === 0) return alert("Select at least one Surah.");

    ui.btnStart.textContent = "Preparing...";
    
    setTimeout(() => {
        state.sessionQueue = [];
        selected.sort(() => Math.random() - 0.5).forEach(num => {
            state.sessionQueue.push(...state.surahMap[num]);
        });

        ui.emptyState.classList.add('hidden'); 
        ui.setupPanel.classList.add('hidden');
        ui.sessionPanel.classList.remove('hidden');
        ui.sessionInfo.classList.remove('hidden');
        ui.sidebar.classList.remove('active');
        
        ui.menuToggle.innerHTML = '<span class="material-symbols-rounded">menu</span>';
        ui.btnStart.textContent = "Start Session"; 

        nextChallenge();
    }, 400);
});

function nextChallenge() {
    ui.revealedContainer.innerHTML = ''; 
    ui.btnReveal.disabled = false;
    ui.btnReveal.style.opacity = "1";
    ui.btnReveal.innerHTML = '<span class="material-symbols-rounded">visibility</span>';

    const maxStart = Math.max(0, state.sessionQueue.length - 6); 
    state.currentIndex = Math.floor(Math.random() * (maxStart + 1));

    const v = state.sessionQueue[state.currentIndex];
    ui.verseTrigger.textContent = v.content;
    ui.currentSurahDisplay.textContent = SURAH_NAMES[v.surah - 1];
    ui.ayahDisplay.textContent = `Ayah ${v.ayah}`;
    
    state.currentIndex++;
}

ui.btnNext.addEventListener('click', nextChallenge);

ui.btnReveal.addEventListener('click', () => {
    const remaining = state.sessionQueue.length - state.currentIndex;
    const batchSize = Math.min(5, remaining);
    if (batchSize <= 0) return;

    const block = document.createElement('div');
    block.className = 'revealed-block';

    for (let i = 0; i < batchSize; i++) {
        const v = state.sessionQueue[state.currentIndex];
        const p = document.createElement('p');
        p.className = 'arabic-text';
        p.textContent = v.content; 
        block.appendChild(p);
        state.currentIndex++;
    }

    ui.revealedContainer.appendChild(block);
    
    if (state.sessionQueue.length - state.currentIndex <= 0 || batchSize < 5) {
        ui.btnReveal.disabled = true;
        ui.btnReveal.style.opacity = "0.3";
        ui.btnReveal.innerHTML = '<span class="material-symbols-rounded">done_all</span>';
    }

    setTimeout(() => block.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100);
});

// End Session & Trigger Feedback
ui.btnReset.addEventListener('click', () => {
    if(!confirm("Exit session?")) return;
    ui.sessionPanel.classList.add('hidden');
    ui.sessionInfo.classList.add('hidden');
    ui.emptyState.classList.remove('hidden'); 
    ui.setupPanel.classList.remove('hidden');
    ui.sidebar.classList.remove('active');
    
    checkFirstTimeFeedback();
});

// --- Feedback Modal Logic ---
const fbModal = document.getElementById('feedback-modal');
const fbForm = document.getElementById('feedback-form');

function checkFirstTimeFeedback() {
    const hasSubmitted = localStorage.getItem("hifzFeedbackSubmitted");
    if (!hasSubmitted) {
        fbModal.classList.remove('hidden');
    }
}

document.getElementById('close-modal').addEventListener('click', () => {
    fbModal.classList.add('hidden');
});

fbForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const data = new FormData(fbForm);

    try {
        const response = await fetch(fbForm.action, {
            method: fbForm.method,
            body: data,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            fbForm.classList.add('hidden');
            document.getElementById('fb-success').classList.remove('hidden');
            localStorage.setItem("hifzFeedbackSubmitted", "true");
            
            setTimeout(() => {
                fbModal.classList.add('hidden');
            }, 2000);
        } else {
            alert("Oops! There was a problem submitting your feedback. Please try again.");
        }
    } catch (error) {
        alert("Oops! Network error. Please check your connection.");
    }
});

init();