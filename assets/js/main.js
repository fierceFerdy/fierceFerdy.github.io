document.addEventListener("DOMContentLoaded", function() {


	

	/**
	* Add navigation to the beginning of the body
	*
	* @version 06/04/2026
	* @author Ferdy <ferdy.fiers@gmail.com>
	*/
	const nav = document.createElement("nav");
	nav.innerHTML = `
		<a href="/index.html">Index</a>

		<div class="dropdownWrapper">
			<a class="navParent" href="#">Intro</a>
			<div class="dropdown">
				<a class="nested" href="/pages/intro/overview.html">Overview</a>
				<a class="nested" href="/pages/intro/klasregels.html">Klasregels</a>
				<a class="nested" href="/pages/intro/initial-configuration.html">Initial configuration</a>
				<a class="nested" href="/pages/intro/typing-lessons.html">Typing lessons</a>
				<a class="nested" href="/pages/intro/keyboard-shortcuts.html">Keyboard Shortcuts</a>
				<a class="nested" href="/pages/intro/productivity.html">Productivity</a>
				<a class="nested" href="/pages/intro/dev-tools.html">Dev tools</a>
				<a class="nested" href="/pages/intro/vsc.html">VSC</a>
				<a class="nested" href="/pages/intro/ai.html">AI</a>
				<a class="nested" href="/pages/intro/git.html">GIT</a>
				<a class="nested" href="/pages/intro/pro-tips.html">Pro tips</a>
				</div>
		</div>

		<div class="dropdownWrapper">
			<a class="navParent" href="#">HTML</a>
			<div class="dropdown">
				<a class="nested" href="/pages/html/overview.html">Overview</a>
				<a class="nested" href="/pages/html/basics.html">Basics</a>
			</div>
		</div>

		<div class="dropdownWrapper">
			<a class="navParent" href="#">CSS</a>
			<div class="dropdown">
				<a class="nested" href="/pages/css/overview.html">Overview</a>
				<a class="nested" href="/pages/css/selectors.html">Selectors</a>
				<a class="nested" href="/pages/css/box-model.html">Box Model</a>
			</div>
		</div>

		<div class="dropdownWrapper">
			<a class="navParent" href="#">JavaScript</a>
			<div class="dropdown">
				<a class="nested" href="/pages/js/overview.html">Overview</a>
				<a class="nested" href="/pages/js/about.html">About</a>
				<a class="nested" href="/pages/js/basics.html">Basics</a>
				<a class="nested" href="/pages/js/common-errors.html">Common Errors</a>
				<a class="nested" href="/pages/js/neutralino.html">Neutralino</a>
			</div>
		</div>

		<div class="dropdownWrapper">
			<a class="navParent" href="#">PHP</a>
			<div class="dropdown">
				<a class="nested" href="/pages/php/overview.html">Overview</a>
				<a class="nested" href="/pages/php/crud.html">CRUD</a>
				<a class="nested" href="/pages/php/local-server.html">Local server</a>
				<a class="nested" href="/pages/php/mvc.html">MVC</a>
			</div>
		</div>

		<button id="plebMode"><i class="fa-solid fa-language"></i></button>
		<button id="lightMode"><i class="fa-regular fa-lightbulb"></i></button>
		<button id="hideNav"><i class="fa-solid fa-chevron-up"></i></button>
	`;
	document.body.insertBefore(nav, document.body.firstChild);



	/**
	* Open nav functionality
	*
	* @version 06/04/2026
	* @author Ferdy <ferdy.fiers@gmail.com>
	*/
	const navItems = document.querySelectorAll(".navParent");
	navItems.forEach(item => {
		item.addEventListener("click", function() {
			// remove all previous open classes from .dropdownWrapper
			const dropdownWrappers = document.querySelectorAll(".dropdownWrapper");
			dropdownWrappers.forEach(wrapper => {
				wrapper.classList.remove("open");
			});

			this.parentElement.classList.toggle("open");
		});
	});



	/**
	* Add .active class to the current page in the nav
	*
	* @version 06/04/2026
	* @author Ferdy <ferdy.fiers@gmail.com>
	*/
	const currentPage = window.location.pathname;
	// console.log(currentPage);
	
	if(currentPage === "") currentPage = "index.html";
	
	const navLinks = document.querySelectorAll("nav a");
	navLinks.forEach(link => {
		if(link.getAttribute("href").endsWith(currentPage)){
			link.classList.add("active");
			link.parentElement.parentElement.classList.add("open");
		}
	});
	// This doesn't work for some pages which are names the same but are in different folders, for example intro.html in the intro folder and intro.html in the html folder. Let's find a new way:
	// navLinks.forEach(link => {
	// 	if(link.href === window.location.href){
	// 		link.classList.add("active");
	// 		link.parentElement.parentElement.classList.add("open");
	// 	}
	// });



	/**
	* Hide the nav when clicking #hideNav
	*
	* @version 06/04/2026
	* @author Ferdy <ferdy.fiers@gmail.com>
	*/
	const hideNavButton = document.getElementById("hideNav");
	hideNavButton.addEventListener("click", function() {
		document.body.classList.toggle("hiddenNav");
	});



	/**
	* Toggle light mode when clicking #lightMode
	*
	* @version 06/04/2026
	* @author Ferdy <ferdy.fiers@gmail.com>
	*/
	const lightModeButton = document.getElementById("lightMode");

	lightModeButton.addEventListener("click", function() {
		const overlay = document.createElement("div");
		overlay.classList.add("lightMode");
		
		// Add images and animate
		for(let i = 1; i <= 7; i++){
			const img = document.createElement("img");

			if(i === 6) img.src = `/assets/img/light1.gif`;
			else if(i === 7) img.src = `/assets/img/light2.gif`;
			else img.src = `/assets/img/light${i}.jpg`;
			
			img.classList.add("lightImg", `light${i}`);
			img.style.top = Math.random() * 90 + "%";
			img.style.left = Math.random() * 90 + "%";
			img.style.transform = `rotate(${Math.random() * 360}deg)`;
			img.style.transition = "all 1.2s linear";

			let interval = 0;
			function moveImage() {
				img.style.top = Math.random() * 90 + "%";
				img.style.left = Math.random() * 90 + "%";
				img.style.transform = `rotate(${Math.random() * 360}deg)`;
				
				interval = 1200;
				img.style.transition = `all ${interval / 1000}s linear`;
				
				setTimeout(moveImage, interval);
			}
			setTimeout(moveImage, interval);

			overlay.appendChild(img);
		}

		var words = ['wow', 'so white', 'much light', 'very mode', 'such pleb', 'much overlay', 'wow', 'close [x]'];
		words.forEach((word, i) => {
			const wordElement = document.createElement("div");
			var wordInterval = 0;

			wordElement.classList.add("lightWord", `lightWord${i}`);
			wordElement.textContent = word;
			wordElement.style.top = Math.random() * 90 + "%";
			wordElement.style.left = Math.random() * 90 + "%";
			wordElement.style.transform = `rotate(${Math.random() * 20}deg)`;
			wordElement.style.transition = `all 1200s linear`;
			wordElement.style.fontFamily = "Comic Sans MS, cursive, sans-serif";
			wordElement.style.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
			
			function moveWord() {
				wordInterval = (i == 7 ? 600 : 2400);
				wordElement.style.transition = `all ${wordInterval / 1000}s linear`;
				wordElement.style.top = Math.random() * 90 + "%";
				wordElement.style.left = Math.random() * 90 + "%";
				wordElement.style.transform = `rotate(${Math.random() * 360}deg)`;
				
				setTimeout(moveWord, wordInterval);
			}
			setTimeout(moveWord, wordInterval);

			overlay.appendChild(wordElement);
		});

		// add text to overlay
		const overlayText = document.createElement("div");
		overlayText.classList.add("lightext");
		overlayText.innerHTML = `wow, so wite, pleb, light mode, get it? I am so funny, I should be a comedian. I will be the next jim carry, watch out world!`;
		overlay.appendChild(overlayText);

		const overlayText2 = document.createElement("div");
		overlayText2.classList.add("lightext2");
		overlayText2.innerHTML = `Rule 1 of light mode: You do not talk about light mode. The second rule: You do NOT talk about light mode.`;
		overlay.appendChild(overlayText2);

		// You there, stop! Als je dit ooit weet uit te schakelen via de console krijg je een lekker pluspunt :))) 

		document.body.appendChild(overlay);

		// refresh the page when clicking .lightWord7
		document.querySelector(".lightWord7").addEventListener("click", function() {
			window.location.reload();
		});


	});



	/**
	* When clicking <txt> elements, copy their content to the clipboard and show a tooltip
	*
	* @version 06/04/2026
	* @author Ferdy <ferdy.fiers@gmail.com>
	*/
	const txtElements = document.querySelectorAll("txt");
	txtElements.forEach(txt => {
		txt.addEventListener("click", function() {
			const textToCopy = this.textContent;
			navigator.clipboard.writeText(textToCopy).then(() => {
				// Show tooltip
				const tooltip = document.createElement("div");
				tooltip.classList.add("tooltip");
				tooltip.textContent = "Copied!";
				this.appendChild(tooltip);
				setTimeout(() => {
					tooltip.remove();
				}, 2000);
			});
		});
	});



	/**
	* When clicking #plebMode, show a new html overlay
	*
	* @version 06/04/2026
	* @author Ferdy <ferdy.fiers@gmail.com>
	*/
	
	const plebModeButton = document.getElementById("plebMode");
	plebModeButton.addEventListener("click", function() {
	});


	




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
			// { keys: ["CTRL", "SHIFT", "K"], description: "Delete line (in VSC)" },
			// { keys: ["CTRL", "N"], 			description: "New file (in VSC)" },
			{ keys: ["CTRL", "P"], 			description: "Navigate to file (in VSC)" },
			{ keys: ["CTRL", "SHIFT", "P"], description: "Command palette (in VSC)" },
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

});