//=================================================
// ------------ Keyboard Shortcuts page
// @version 21/04/2026
// @author Ferdy <ferdy.fiers@gmail.com>
//=================================================

if(document.body.id === "keyboardShortcutsPage"){
    const basicShortcutPool = [
        { keys: ["CTRL", "C"], 			description: "Copy" },
        { keys: ["CTRL", "V"], 			description: "Paste" },
        { keys: ["CTRL", "X"], 			description: "Cut" },
        { keys: ["CTRL", "Z"], 			description: "Undo" },
        { keys: ["CTRL", "A"], 			description: "Select all" },
        { keys: ["CTRL", "S"], 			description: "Save" },
        { keys: ["CTRL", "F"], 			description: "Find/search" },
        { keys: ["CTRL", "+"], 			description: "Zoom in" }, // the plus key is "Shift" + "=" on qwerty keyboards, so it might not work on all layouts. You can also try <kbd>CTRL</kbd> + <kbd>SHIFT</kbd> + <kbd>=</kbd>
        { keys: ["CTRL", "-"], 			description: "Zoom out" },
        // { keys: ["F11"], 				description: "Fullscreen" },

        // { keys: ["ALT", "TAB"], 		description: "Switch application" },
        // { keys: ["ALT", "F4"], 		description: "Cheat mode" },
        { keys: ["CTRL", "TAB"],		description: "Go to next tab" },
        { keys: ["CTRL","SHIFT","TAB"], description: "Go to previous tab" },
        { keys: ["CTRL", "T"], 			description: "Open new tab" },
        { keys: ["CTRL", "W"], 			description: "Close current tab" },
        { keys: ["CTRL", "SHIFT", "T"], description: "Reopen closed tab" },
        // { keys: ["WIN", "V"], 			description: "Paste from history" },
        // { keys: ["WIN", "S"], 			description: "Search for program" },
        // { keys: ["WIN", "D"], 			description: "Switch to/from desktop" },
        // { keys: ["WIN", "L"], 			description: "Lock screen" },

        { keys: ["CTRL", "RIGHT"], 		description: "To end of word" },
        { keys: ["CTRL", "LEFT"], 		description: "To start of word" },

        { keys: ["HOME"], 				description: "To line start" },
        { keys: ["END"], 				description: "To line end" },
        { keys: ["CTRL", "HOME"], 		description: "To document start" },
        { keys: ["CTRL", "END"], 		description: "To document end" },

        { keys: ["CTRL", "R"], 			description: "Refresh" },
        { keys: ["CTRL", "SHIFT", "R"], description: "Hard refresh (clears cache)" },
        { keys: ["CTRL", "SHIFT", "N"], description: "Create new folder (in explorer)" },
        { keys: ["F2"], 				description: "Rename file" },
        { keys: ["F12"], 				description: "Open Dev Tools (in browser)" },
        { keys: ["ENTER"], 				description: "Open file (in explorer)" },
        { keys: ["DEL"], 				description: "Delete file" },
    ];

    const advancedShortcutPool = [
        { keys: ["CTRL", "L"], 			description: "Focus address bar (in browser)" },
        { keys: ["ALT", "UP"], 			description: "Move line up (in VSC)" },
        { keys: ["ALT", "DOWN"], 		description: "Move line down (in VSC)" },
        { keys: ["ALT", "Z"], 		description: "Toggle word wrap (in VSC)" },
        // { keys: ["CTRL", "SHIFT", "K"], description: "Delete line (in VSC)" },
        // { keys: ["CTRL", "N"], 			description: "New file (in VSC)" },
        { keys: ["CTRL", "B"], 			description: "Toggle sidebar (in VSC)" },
        { keys: ["CTRL", "P"], 			description: "Navigate to file (in VSC)" },
        { keys: ["CTRL", "SHIFT", "P"], description: "Command palette (in VSC)" },
        { keys: ["CTRL", "SHIFT", "`"], description: "Terminal (in VSC)" },
        { keys: ["CTRL", "/"], 			description: "Toggle comment (in VSC)" },
        { keys: ["CTRL", "H"], 			description: "Find & replace (in VSC)" },
        { keys: ["CTRL", "SHIFT", "D"], description: "Duplicate line (in VSC)" },
        { keys: ["CTRL", "ENTER"], 		description: "Go to new line (in VSC)" },
    ];

    var score = 0;
    var attempts = 0;
    var redoList = [];
    var round = 1;
    var currentShortcut = null;
    var locked = false;
    var time = 0;
    var timerInterval = null;

    const activeKeys = new Set();
    const quizBox = document.getElementById("shortcutQuiz");
    const questionEl = document.getElementById("quizQuestion");
    const pressedEl = document.getElementById("quizPressed");
    const scoreEl = document.getElementById("quizScore");
    const attemptsEl = document.getElementById("quizAttempts");
    const feedbackEl = document.getElementById("quizFeedback");
    const startButton = document.getElementById("startQuiz");
    const quizIntro = document.getElementById("quizIntro");
    const quizContent = document.getElementById("quizContent");
    const modifierOrder = ["CTRL", "SHIFT", "ALT", "WIN"];
    const amntShortcutsEl = document.getElementById("amntShortcuts");
    const shortcutsToHide = document.getElementById("shortcutsToHide");
    const quizTime = document.getElementById("quizTime"); 
    // I just learned that you can access quizTime even without declaring it O.o;
    // Any HTML element with an id attribute is automatically available as a global variable in JavaScript by that same name.

    amntShortcutsEl.innerHTML = basicShortcutPool.length + advancedShortcutPool.length;


    // Start the quiz after clicking 'start'
    startButton.addEventListener("click", () => {
        
        const difficulty = document.getElementById("quizDifficulty").value;
        if(difficulty === "easy") shortcuts = basicShortcutPool;
        else if(difficulty === "advanced") shortcuts = advancedShortcutPool;
        else if(difficulty === "all") shortcuts = [...basicShortcutPool, ...advancedShortcutPool]; // ... means "spread operator". It creates a shallow copy of the array, so we can modify "shortcuts" without affecting "basicShortcutPool"

        shortcutsToHide.style.opacity = "0.01";
        quizIntro.style.display = "none";
        quizContent.style.display = "block";

        window.addEventListener("keydown", onKeyDown, true);
        window.addEventListener("keyup", onKeyUp, true);
        window.addEventListener("blur", clearPressedKeys);

        quizBox.focus(); // Might not be needed, but just in case

        startTimer();
        updateStats();
        loadNextShortcut();
    });

    function normalizeKey(key){
        // Look, I'm using a switch!
        switch(key){
            case "Control": return "CTRL";
            case "Shift": return "SHIFT";
            case "Alt": return "ALT";
            case "Meta":
            case "OS": return "WIN";
            case " ":
            case "Spacebar": return "SPACE";
            case "Escape": return "ESC";
            case "Delete": return "DEL";
            default:
                if(key.startsWith("Arrow")) return key.replace("Arrow", "").toUpperCase();
                return key.length === 1 ? key.toUpperCase() : key.toUpperCase();
        }
    }

    function sortCombo(keys) {
        return [...new Set(keys)].sort((a, b) => {
            const aIndex = modifierOrder.includes(a) ? modifierOrder.indexOf(a) : 99;
            const bIndex = modifierOrder.includes(b) ? modifierOrder.indexOf(b) : 99;

            if (aIndex !== bIndex) return aIndex - bIndex;

            return a.localeCompare(b);
        });
    }

    function comboToString(keys) {
        //  I want every key to be un <kbr> and separated by " + "
        return sortCombo(keys).map(key => `<kbd>${key}</kbd>`).join(" + ");
    }

    function isModifier(key) {
        return modifierOrder.includes(key);
    }

    function updateStats() {
        scoreEl.innerHTML = String(score);
        attemptsEl.innerHTML = String(attempts);
    }

    function setFeedback(message, type = "neutral") {
        feedbackEl.innerHTML = message;
        feedbackEl.className = "hint small " + type;
    }

    function clearPressedKeys() {
        activeKeys.clear();
        pressedEl.innerHTML = "—";
    }

    function finishQuiz() {
        shortcutsToHide.style.opacity = "1";
        currentShortcut = null;
        questionEl.innerHTML = "Finished";
        setFeedback(`All done. Final score: ${score}/${attempts} in ${countTime(time)} over ${round} round(s).`);
        
        window.clearInterval(timerInterval); // doesnt work rn
        clearPressedKeys();
    }

    function loadNextShortcut() {
        clearPressedKeys();
        locked = false;

        if (shortcuts.length === 0) {
            if (redoList.length > 0) {
                shortcuts = [...redoList];
                redoList = [];
                round++;
                setFeedback(`Round ${round}: retry the shortcuts you missed.`);
            } else {
                finishQuiz();
                return;
            }
        }

        const randomIndex = Math.floor(Math.random() * shortcuts.length);
        currentShortcut = shortcuts.splice(randomIndex, 1)[0];
        questionEl.innerHTML = currentShortcut.description;
    }

    function evaluateAttempt() {
        if(!currentShortcut || locked) return;

        const expected = comboToString(currentShortcut.keys);
        const given = comboToString([...activeKeys]);

        attempts++;
        updateStats();

        if(given === expected){
            score++;
            updateStats();
            setFeedback(`Correct: ${given}`);
        }else{
            redoList.push(currentShortcut);
            setFeedback(`Wrong: ${given || "nothing"}. Expected: ${expected}`, "error");
        }

        locked = true;
        currentShortcut = null;

        window.setTimeout(loadNextShortcut, 700);
    }

    function syncModifiersFromEvent(event) {
        if (event.ctrlKey) activeKeys.add("CTRL"); else activeKeys.delete("CTRL");
        if (event.shiftKey) activeKeys.add("SHIFT"); else activeKeys.delete("SHIFT");
        if (event.altKey) activeKeys.add("ALT"); else activeKeys.delete("ALT");
        if (event.metaKey) activeKeys.add("WIN"); else activeKeys.delete("WIN");
    }

    function blockEvent(event) {
        if(event.cancelable) event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        return false;
    }

    function onKeyDown(event) {
        // Always sync modifiers first
        syncModifiersFromEvent(event);

        const key = normalizeKey(event.key);

        // Hard-block browser tab switching combos
        // (Ctrl+Tab / Ctrl+Shift+Tab)
        if (key === "TAB" && event.ctrlKey) {
            blockEvent(event);
        } else {
            blockEvent(event); // keep blocking all default behavior during quiz
        }

        if (locked || !currentShortcut) return;
        if (event.repeat) return;

        activeKeys.add(key);
        pressedEl.innerHTML = comboToString([...activeKeys]) || "—";

        if(!isModifier(key)) evaluateAttempt();
    }

    function onKeyUp(event) {
        blockEvent(event);

        const key = normalizeKey(event.key);
        activeKeys.delete(key);
        syncModifiersFromEvent(event);
        pressedEl.innerHTML = comboToString([...activeKeys]) || "—";
    }
}



function startTimer() {
    const startTime = Date.now();
    timerInterval = window.setInterval(() => {
        time = Math.floor((Date.now() - startTime) / 100);
        quizTime.innerHTML = countTime(time);
    }, 100);
}

function countTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 10);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const mills = milliseconds % 10;

    return `${mins > 0 ? mins + "m " : ""}${secs}.${mills}s`;
}