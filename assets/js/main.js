document.addEventListener("DOMContentLoaded", async function() {

	// Save visitor's name in localStorage
	if(!localStorage.getItem("visitorName")){
		let name = await customPrompt("<strong>Welcome, Human!</strong><br>  Please enter your full (and real) name:", "Use your actual name - this will be used for scoring");
		
		if(name){
			name = name.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim(); // basic sanitization
			localStorage.setItem("visitorName", name);
			alert(`Thanks! ${name} will get all the points you're scoring today!`);
		}else{
			// redo
		}
	}

	// Inject visitor's name here and there
	const visitorName = localStorage.getItem("visitorName").split(" ")[0] || "Boo";
	document.querySelectorAll(".yourname").forEach(el => el.textContent = visitorName);



	// button.toggle handler
	document.querySelectorAll("button.toggle").forEach(button => {
		button.addEventListener("click", function() {
			this.classList.toggle("active");
			const content = this.parentElement.parentElement.querySelector(".advancedContent");
			content.classList.toggle("active");
		});
	});



	async function customPrompt(message, defaultValue = "") {
		return new Promise((resolve) => {
			document.body.classList.add("blur");

			const overlay = document.createElement("div");
			overlay.className = "customPromptOverlay";
			
			const promptBox = document.createElement("div");
			promptBox.className = "customPromptBox";
			promptBox.innerHTML = `
				<p>${message}</p>
				<input type="text" placeholder="${defaultValue}">
				<button id="ok">Here, you can have it!</button>
			`;
			overlay.appendChild(promptBox);
			document.body.appendChild(overlay);

			const input = promptBox.querySelector("input");
			const okBtn = promptBox.querySelector("#ok");
			const cancelBtn = promptBox.querySelector("#customPromptCancel");

			okBtn.addEventListener("click", () => closePrompt(input.value));
			input.addEventListener("keydown", (event) => {
				if (event.key === "Enter") closePrompt(input.value);
				if (event.key === "Escape") closePrompt(null);
			});

			function closePrompt(value) {
				if(!input.value.trim() || !input.value.includes(" ")){
					promptBox.classList.add("shake", "error");
					// promptBox.classList.add("error");
					setTimeout(() => promptBox.classList.remove("shake"), 500);
				}else{
					document.body.classList.remove("blur");
					overlay.remove();
					resolve(value);
				}
			}
		});
	}
	

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
				<a class="nested" href="/pages/js/finding-information.html">Finding information</a>
				<a class="nested" href="/pages/js/data.html">Data</a>
				<a class="nested" href="/pages/js/common-errors.html">Common Errors</a>
				<a class="nested" href="/pages/js/math.html">Math</a>
				<a class="nested" href="/pages/js/loops.html">Loops</a>
				<a class="nested" href="/pages/js/if-else.html">If...Else</a>
				<a class="nested" href="/pages/js/functions.html">Functions</a>
				<a class="nested" href="/pages/js/arrays.html">Arrays (complete)</a>
				<a class="nested" href="/pages/js/recap.html">Recap 1</a>
				<a class="nested" href="/pages/js/visualisation.html">Visualisation (todo)</a>
				<a class="nested" href="/pages/js/event-listeners.html">Event Listeners (todo)</a>
				<a class="nested" href="/pages/js/objects.html">Objects</a>
				<a class="nested" href="/pages/js/json.html">JSON (todo)</a>
				<a class="nested" href="/pages/js/neutralino.html">Neutralino (todo)</a>
				<a class="nested" href="/pages/js/websockets-api.html">Websockets and APIs</a>
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

		<button id="downloadUserData"><i class="fa-solid fa-user"></i></button>
		<button id="reportBug"><i class="fa-solid fa-bug"></i></button>
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
		item.addEventListener("click", function(e) {
			e.preventDefault();
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
	// check if nav is hidden in localStorage
	if(localStorage.getItem("navHidden") === "true"){
		document.body.classList.add("hiddenNav");
	}
	hideNavButton.addEventListener("click", function() {
		if(document.body.classList.contains("hiddenNav")){
			localStorage.setItem("navHidden", "false");
		}else{
			localStorage.setItem("navHidden", "true");
		}
		document.body.classList.toggle("hiddenNav");
	});


	const downloadUserDataButton = document.getElementById("downloadUserData");
	if (downloadUserDataButton) {
		downloadUserDataButton.addEventListener("click", function() {
			const exportData = getAllLocalStorageData();
			const stamp = new Date().toISOString().replace(/[:.]/g, "-");
			const fileName = `manual-user-data-${stamp}.json`;
			downloadJsonFile(exportData, fileName);
		});
	}



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

	function getAllLocalStorageData() {
		const data = {};

		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			const rawValue = localStorage.getItem(key);
			data[key] = tryParseJson(rawValue);
		}

		const groupedAttempts = groupAttemptsByType(data);
		const userName = localStorage.getItem("visitorName") || "Unknown visitor";

		return {
			exportedAt: new Date().toISOString(),
			page: window.location.href,
			userName,
			groupedAttempts
		};
	}

	function groupAttemptsByType(data) {
		const grouped = {
			quizzes: {},
			editors: {}
		};
		const quizAttempts = Array.isArray(data["manual.quizAttempts"]) ? data["manual.quizAttempts"] : [];
		const editorAttempts = Array.isArray(data["manual.editorAttempts"]) ? data["manual.editorAttempts"] : [];

		quizAttempts.forEach((attempt) => {
			const quizName = attempt?.quizName || "Unnamed Quiz";
			if (!grouped.quizzes[quizName]) grouped.quizzes[quizName] = [];
			grouped.quizzes[quizName].push(stripVisitorName(attempt));
		});

		editorAttempts.forEach((attempt) => {
			const editorName = attempt?.editorName || "Unnamed Editor";
			if (!grouped.editors[editorName]) grouped.editors[editorName] = [];
			grouped.editors[editorName].push(stripVisitorName(attempt));
		});

		return grouped;
	}

	function stripVisitorName(attempt) {
		if (!attempt || typeof attempt !== "object") return attempt;
		const sanitizedAttempt = { ...attempt };
		delete sanitizedAttempt.visitorName;
		return sanitizedAttempt;
	}

	function tryParseJson(value) {
		if (typeof value !== "string") return value;

		try {
			return JSON.parse(value);
		} catch (error) {
			return value;
		}
	}

	function downloadJsonFile(payload, fileName) {
		const json = JSON.stringify(payload, null, 2);
		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download = fileName;
		document.body.appendChild(link);
		link.click();
		link.remove();

		URL.revokeObjectURL(url);
	}



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


	
});