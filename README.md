# Qur'an Active Recall Tool

A minimalist, frontend-only web application designed to support **active recall** memorization techniques for the Qur'an. This tool addresses the cognitive challenge of "positional dependency" in memorization by randomizing verse entry points while strictly preserving the structural integrity of the text.

**[Live Demo](https://quran-recall-system.vercel.app/)**

---

## 🎯 Purpose & Design Philosophy

The core problem this tool solves is **memorization-by-position**, where a learner relies on the physical location of a verse on a page rather than the text itself.

* **Active Recall > Passive Reading:** The interface intentionally withholds verses, displaying only a single "trigger" ayah. The user must mentally retrieve the subsequent verses before clicking "Reveal," forcing cognitive effort before confirmation.
* **Cognitive Load Management:** By revealing verses in small batches (5 ayahs), the tool provides immediate validation without overwhelming the learner.
* **Textual Integrity:** While the starting point is random, the sequence of revelation always respects the fixed order of the Qur'an.

## ⚙️ Core Logic

This application operates entirely in the browser (Client-Side) with no backend dependencies, ensuring privacy, speed, and zero latency.

### 1. Data Structure & Parsing
Instead of relying on external APIs (which introduce latency and dependency risks), the app parses a local raw text file (`quran.txt`) at runtime.

* **Input Format:** `SurahNumber|AyahNumber|ArabicText`
* **Parsing Strategy:** The text file is parsed into a structured JavaScript object map (`{ surah_id: [verses] }`). This provides **O(1)** access time during the session, ensuring instant responsiveness even on low-end mobile devices.

### 2. The Randomization Algorithm
To prevent rote patterns, the "Start Session" and "Next Challenge" features use a two-step randomization process:
1.  **Surah Shuffle:** If multiple Surahs are selected, their order is shuffled using the **Fisher-Yates** algorithm to ensure a uniform distribution.
2.  **Index Selection:** A random starting index is chosen from the flattened session queue.
    * *Constraint Logic:* The algorithm actively calculates `length - 2` boundaries to avoid selecting the very last verse of a Surah as a start point, ensuring there is always subsequent content to reveal.

### 3. State Management
The application maintains a simple state object to track the active session without complex frameworks:
```javascript
const state = {
    surahMap: {},       // Immutable data structure of the Quran text
    sessionQueue: [],   // Flattened array of user-selected Surahs
    currentIndex: 0     // Pointer to the current position in the queue
};