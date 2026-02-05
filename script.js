/* * Active Recall Logic
 * 1. Data Parsing: Reads local file, groups by Surah.
 * 2. Session: Flattens selected Surahs into a single array.
 * 3. Next/Random: Jumps to a random index in that array.
 * 4. Reveal: Slices the array sequentially from the current index.
 */

// Static Data: Surah Names (1-114)
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
    setupPanel: document.getElementById('setup-panel'),
    sessionPanel: document.getElementById('session-panel'),
    surahSelect: document.getElementById('surah-select'),
    verseTrigger: document.getElementById('verse-trigger'),
    revealedContainer: document.getElementById('revealed-container'),
    btnStart: document.getElementById('btn-start'),
    btnReveal: document.getElementById('btn-reveal'),
    btnNext: document.getElementById('btn-next'), // NEW REFERENCE
    btnReset: document.getElementById('btn-reset'),
    prompt: document.getElementById('recall-prompt')
};

async function init() {
    try {
        const response = await fetch('quran.txt');
        if (!response.ok) throw new Error("Could not load quran.txt");
        const text = await response.text();
        parseData(text);
        populateDropdown();
    } catch (error) {
        console.error(error);
        alert("Error: Ensure 'quran.txt' is present and you are using a local server.");
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
    const sortedSurahs = Object.keys(state.surahMap).sort((a, b) => a - b);
    sortedSurahs.forEach(surahNum => {
        const option = document.createElement('option');
        option.value = surahNum;
        const name = SURAH_NAMES[surahNum - 1] || "Unknown";
        option.textContent = `${surahNum}. ${name}`; 
        ui.surahSelect.appendChild(option);
    });
}

// --- Session Logic ---

ui.btnStart.addEventListener('click', () => {
    const selectedOptions = Array.from(ui.surahSelect.selectedOptions);
    if (selectedOptions.length === 0) return alert("Select at least one Surah.");

    // Prepare Queue
    const selectedSurahNums = selectedOptions.map(opt => opt.value);
    
    // Shuffle Surah Order
    for (let i = selectedSurahNums.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [selectedSurahNums[i], selectedSurahNums[j]] = [selectedSurahNums[j], selectedSurahNums[i]];
    }

    // Flatten
    state.sessionQueue = [];
    selectedSurahNums.forEach(num => {
        state.sessionQueue.push(...state.surahMap[num]);
    });

    // Switch View
    ui.setupPanel.classList.add('hidden');
    ui.sessionPanel.classList.remove('hidden');

    // Trigger First Challenge
    nextChallenge();
});

/**
 * NEW: Jumps to a random spot in the existing queue
 */
function nextChallenge() {
    // Reset UI
    ui.revealedContainer.innerHTML = ''; 
    ui.prompt.style.display = 'block';
    ui.btnReveal.disabled = false;

    // Pick Random Index (avoiding very last verse)
    const maxStart = Math.max(0, state.sessionQueue.length - 6); 
    state.currentIndex = Math.floor(Math.random() * (maxStart + 1));

    // Display Trigger
    const verse = state.sessionQueue[state.currentIndex];
    ui.verseTrigger.textContent = verse.content;
    
    // Increment so "Reveal" shows what follows
    state.currentIndex++;
}

// Listen for "Next Challenge" click
ui.btnNext.addEventListener('click', nextChallenge);

ui.btnReveal.addEventListener('click', () => {
    ui.prompt.style.display = 'none';

    const remaining = state.sessionQueue.length - state.currentIndex;
    const batchSize = Math.min(5, remaining);

    if (batchSize <= 0) {
        ui.btnReveal.disabled = true;
        return;
    }

    const batchContainer = document.createElement('div');
    batchContainer.className = 'revealed-block';

    for (let i = 0; i < batchSize; i++) {
        const verse = state.sessionQueue[state.currentIndex];
        const p = document.createElement('p');
        p.className = 'arabic-text';
        p.textContent = verse.content; 
        batchContainer.appendChild(p);
        state.currentIndex++;
    }

    ui.revealedContainer.appendChild(batchContainer);
    batchContainer.scrollIntoView({ behavior: 'smooth' });
});

ui.btnReset.addEventListener('click', () => {
    ui.sessionPanel.classList.add('hidden');
    ui.setupPanel.classList.remove('hidden');
});

init();