//=================================================
// ------------ Quiz
// @version 02/05/2026
// @author Ferdy <ferdy.fiers@gmail.com>
//=================================================

var QUIZ_TARGET_SECONDS_PER_QUESTION = 15;
var QUIZ_SCORE_API_URL = `${window.location.protocol}//${window.location.hostname}:3030/api/quiz-scores`;
var QUIZ_LOCAL_ATTEMPTS_KEY = "manual.quizAttempts";
var QUIZ_ACCURACY_WEIGHT_POWER = 8;

document.querySelectorAll(".quiz").forEach(initQuizBlock);



//=================================================
// ------------ Init
//=================================================

function initQuizBlock(block) {
	var dataScript = block.querySelector(".quiz-data");
	if (!dataScript) return;

	var quizData;
	try {
		quizData = JSON.parse(dataScript.textContent);
	} catch {
		block.innerHTML = "<p>Quiz data is invalid.</p>";
		return;
	}

	var state = {
		currentIndex:    0,
		answeredCount:   0,
		correctCount:    0,
		started:         false,
		startedAt:       null,
		finishedAt:      null,
		elapsedMs:       0,
		timeMultiplier:  1,
		finalScore:      0,
		playerName:      "",
		savedAttemptId:  null,
		questions:       quizData.questions || [],
		quizName:        quizData.name || "Unnamed Quiz"
	};

	// Prevent quiz clicks from bubbling outside the block
	block.addEventListener("click", (e) => e.stopPropagation());

	renderQuiz(block, state);
}



//=================================================
// ------------ Render
//=================================================

function renderQuiz(block, state) {
	block.innerHTML = "";

	var section = document.createElement("section");
	var footer  = document.createElement("footer");
	block.appendChild(section);
	block.appendChild(footer);

	if (!state.started) {
		renderStartState(section, footer, state);
	} else {
		renderCurrentQuestion(section, footer, state);
	}
}



function renderStartState(body, footer, state) {
	body.parentElement.classList.remove("correct", "wrong");

	var intro = document.createElement("p");
	intro.className = "quiz-question";
	intro.textContent = `Ready? This quiz has ${state.questions.length} question${state.questions.length === 1 ? "" : "s"}.`;
	body.appendChild(intro);

	var startButton = document.createElement("button");
	startButton.className = "quiz-start";
	startButton.type = "button";
	startButton.textContent = "Start quiz";
	body.appendChild(startButton);

	startButton.addEventListener("click", (e) => {
		e.preventDefault();
		state.playerName = String(localStorage.getItem("visitorName") || "").trim();
		state.started    = true;
		state.startedAt  = Date.now();
		renderCurrentQuestion(body, footer, state);
	});

	renderFooter(footer, state, false, true);
}



function renderCurrentQuestion(body, footer, state) {
	body.innerHTML   = "";
	footer.innerHTML = "";
	body.parentElement.classList.remove("correct", "wrong");

	if (state.currentIndex >= state.questions.length) {
		renderFinishedState(body, footer, state);
		return;
	}

	var questionData = state.questions[state.currentIndex];

	// Question text
	var questionText = document.createElement("p");
	questionText.className = "quiz-question";
	questionText.innerHTML = state.questions.length > 1
		? `${state.currentIndex + 1}. ${questionData.question}`
		: questionData.question;
	body.appendChild(questionText);

	// Answer options
	var optionsWrap = document.createElement("div");
	optionsWrap.className = "quiz-options";
	body.appendChild(optionsWrap);

	questionData.options.forEach((option, optionIndex) => {
		var button = document.createElement("button");
		button.type = "button";
		button.textContent = option;

		button.addEventListener("click", (e) => {
			e.preventDefault();
			var isCorrect = optionIndex === questionData.answer;
			state.answeredCount++;

			body.innerHTML = "";

			var title       = document.createElement("h2");
			var explanation = document.createElement("p");

			if (isCorrect) {
				state.correctCount++;
				body.parentElement.classList.add("correct");
				title.textContent       = "Correct! 🎉";
				explanation.textContent = questionData.explanation;
			} else {
				body.parentElement.classList.add("wrong");
				title.textContent       = "No, you dummy! 😭";
				explanation.textContent = questionData.explanation;
			}

			body.appendChild(title);
			body.appendChild(explanation);
			renderFooter(footer, state, true);
		});

		optionsWrap.appendChild(button);
	});

	renderFooter(footer, state, false);
}



function renderFooter(footer, state, showNextButton, hideProgress = false) {
	footer.innerHTML = "";

	if (showNextButton) {
		var nextButton = document.createElement("button");
		nextButton.className   = "quiz-next";
		nextButton.type        = "button";
		nextButton.textContent = state.currentIndex === state.questions.length - 1 ? "Finish quiz" : "Next question";
		footer.appendChild(nextButton);

		nextButton.addEventListener("click", (e) => {
			e.preventDefault();
			e.stopPropagation();
			state.currentIndex++;
			renderCurrentQuestion(footer.parentElement.querySelector("section"), footer, state);
		});
	}

	if (hideProgress) return;

	var progress = document.createElement("div");
	progress.className   = "quiz-progress";
	progress.textContent = `Answered: ${state.answeredCount}/${state.questions.length} · Correct: ${state.correctCount}`;
	footer.appendChild(progress);

	var progressBar  = document.createElement("div");
	var progressFill = document.createElement("div");
	progressBar.className    = "quiz-progress-bar";
	progressFill.className   = "quiz-progress-fill";
	progressFill.style.width = `${(state.answeredCount / state.questions.length) * 100}%`;
	progressBar.appendChild(progressFill);
	footer.appendChild(progressBar);
}



function renderFinishedState(body, footer, state) {
	state.finishedAt     = Date.now();
	state.elapsedMs      = Math.max(0, state.finishedAt - (state.startedAt ?? state.finishedAt));
	state.timeMultiplier = roundScore(getTimeMultiplier(state.elapsedMs, state.questions.length));
	var accuracyWeight   = getAccuracyWeight(state.correctCount, state.questions.length);
	state.finalScore     = roundScore(state.correctCount * state.timeMultiplier * accuracyWeight);

	// Result summary
	var message = document.createElement("p");
	message.className   = "quiz-question";
	message.textContent = `Finished. Correct answers: ${state.correctCount}/${state.questions.length}`;
	if (state.correctCount === state.questions.length) message.textContent += " 🎉";
	body.appendChild(message);

	// var scoreMeta = document.createElement("p");
	// scoreMeta.className   = "quiz-result-meta";
	// scoreMeta.textContent = `Time: ${formatDuration(state.elapsedMs)} · Multiplier: x${state.timeMultiplier.toFixed(4)} · Final score: ${state.finalScore.toFixed(4)}`;
	// body.appendChild(scoreMeta);

	// Correct/wrong border + party GIF
	if (state.correctCount === state.questions.length) {
		body.parentElement.classList.add("correct");
		var partyImage = document.createElement("img");
		partyImage.src       = `/assets/img/party${Math.floor(Math.random() * 31) + 1}.gif`;
		partyImage.className = "party";
		body.appendChild(partyImage);
	} else {
		body.parentElement.classList.add("wrong");
	}

	// Leaderboard (loaded async)
	var leaderboardWrap = document.createElement("div");
	leaderboardWrap.className = "quiz-highscores";
	body.appendChild(leaderboardWrap);
	renderHighscoreLoading(leaderboardWrap);

	// Retry button
	var retryButton = document.createElement("button");
	retryButton.textContent = "Retry quiz";
	retryButton.className   = "quiz-retry";
	retryButton.type        = "button";
	footer.appendChild(retryButton);

	retryButton.addEventListener("click", (e) => {
		e.preventDefault();
		Object.assign(state, {
			currentIndex: 0, answeredCount: 0, correctCount: 0,
			started: false, startedAt: null, finishedAt: null,
			elapsedMs: 0, timeMultiplier: 1, finalScore: 0, savedAttemptId: null
		});
		renderQuiz(footer.parentElement, state);
	});

	// Keep per-user history for exports and offline fallback
	saveQuizAttemptLocal(state);

	saveAndLoadHighscores(leaderboardWrap, state);
}





//=================================================
// ------------ Highscores
//=================================================

async function saveAndLoadHighscores(container, state) {
	try {
		var saved = await saveQuizAttempt(state);
		state.savedAttemptId = saved.id ?? null;

		var scores = await getQuizScores(state.quizName);
		renderHighscores(container, scores, state);
	} catch (error) {
		console.warn("Highscore error:", error);
		renderHighscoreError(container, error);
	}
}

async function saveQuizAttempt(state) {
	var response = await fetch(QUIZ_SCORE_API_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			quizName:       state.quizName,
			playerName:     state.playerName,
			correctCount:   state.correctCount,
			totalQuestions: state.questions.length,
			elapsedMs:      state.elapsedMs,
			timeMultiplier: state.timeMultiplier,
			finalScore:     state.finalScore
		})
	});

	if (!response.ok) throw new Error(`Save failed (${response.status})`);
	var data = await response.json();
	if (!data?.success || !data?.record) throw new Error("Invalid save response");
	return data.record;
}

async function getQuizScores(quizName) {
	var response = await fetch(`${QUIZ_SCORE_API_URL}?quizName=${encodeURIComponent(quizName)}`);
	if (!response.ok) throw new Error(`Load failed (${response.status})`);
	var data = await response.json();
	if (!data?.success || !Array.isArray(data?.scores)) throw new Error("Invalid scores response");
	return data.scores;
}

function renderHighscoreLoading(container) {
	container.innerHTML = `<p class="quiz-result-meta">Saving score and loading highscores...</p>`;
}

function renderHighscoreError(container, error) {
	container.innerHTML = `
		<p class="quiz-result-meta">Could not load highscores. ${error?.message ?? ""}</p>
		<p class="quiz-result-meta">Make sure the highscore server is running at ${QUIZ_SCORE_API_URL}.</p>
	`;
}

function renderHighscores(container, scores, state) {
	var filters = { firstTriesOnly: false, perfectOnly: false };

	var draw = () => {
		container.innerHTML = "";

		var title = document.createElement("h3");
		title.textContent = "Top 10 Highscores";
		container.appendChild(title);

		var filterRow = document.createElement("div");
		filterRow.className = "quiz-highscores-filters";
		filterRow.appendChild(makeCheckbox("First tries only", filters.firstTriesOnly, (v) => { 
			filters.firstTriesOnly = v; draw(); 
		}));
		filterRow.appendChild(makeCheckbox("Perfect scores only", filters.perfectOnly, (v) => { 
			filters.perfectOnly = v; draw(); 
		}));
		container.appendChild(filterRow);

		var top10 = scores
			.filter((e) => !filters.firstTriesOnly || Number(e.attemptNumber) === 1)
			.filter((e) => !filters.perfectOnly    || Number(e.correctCount) === Number(e.totalQuestions))
			.sort((a, b) => {
				if (Number(b.finalScore) !== Number(a.finalScore)) return Number(b.finalScore) - Number(a.finalScore);
				if (Number(a.elapsedMs)  !== Number(b.elapsedMs))  return Number(a.elapsedMs)  - Number(b.elapsedMs);
				return String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? ""));
			})
			.slice(0, 10);

		if (top10.length === 0) {
			var empty = document.createElement("p");
			empty.className   = "quiz-result-meta";
			empty.textContent = "No highscores found for this filter.";
			container.appendChild(empty);
			return;
		}

		var list = document.createElement("ol");
		list.className = "quiz-highscores-list";

		var madeTop10 = false;

		top10.forEach((entry) => {
			var isCurrent = state.savedAttemptId && entry.id === state.savedAttemptId;
			if (isCurrent) madeTop10 = true;

			var item = document.createElement("li");
			item.className = isCurrent ? "current" : "";
			item.append(`${entry.playerName} · score ${Number(entry.finalScore || 0).toFixed(4)} · ${entry.correctCount}/${entry.totalQuestions} · ${formatDuration(entry.elapsedMs)} · try #${entry.attemptNumber}`);
			list.appendChild(item);
		});

		container.appendChild(list);

		// If the current attempt didn't make the top 10, show it separately at the bottom with its rank
		if (state.savedAttemptId && !madeTop10) {
			var cEntry = scores.find((e) => e.id === state.savedAttemptId); //currentEntry
			if (cEntry) {
				var rank = scores
					.filter((e) => Number(e.finalScore) > Number(cEntry.finalScore))
					.filter((e) => !(filters.firstTriesOnly && Number(e.attemptNumber) !== 1))
					.filter((e) => !(filters.perfectOnly    && Number(e.correctCount) !== Number(e.totalQuestions)))
					.length + 1;

				var current = document.createElement("p");
				current.className = "quiz-highscores-current";
				current.textContent = `${rank}. ${cEntry.playerName} · score ${Number(cEntry.finalScore || 0).toFixed(4)} · ${cEntry.correctCount}/${cEntry.totalQuestions} · ${formatDuration(cEntry.elapsedMs)} · try #${cEntry.attemptNumber}`;
				container.appendChild(current);
			}

		}
	};

	draw();
}



//=================================================
// ------------ Helpers
//=================================================

function makeCheckbox(label, checked, onChange) {
	var labelEl = document.createElement("label");
	var input   = document.createElement("input");
	input.type    = "checkbox";
	input.checked = checked;
	input.addEventListener("change", () => onChange(input.checked));
	labelEl.appendChild(input);
	labelEl.append(` ${label}`);
	return labelEl;
}

function getTimeMultiplier(elapsedMs, questionCount) {
	var targetMs = Math.max(1, questionCount) * QUIZ_TARGET_SECONDS_PER_QUESTION * 1000;
	return targetMs / Math.max(1, elapsedMs);
}

function formatDuration(ms) {
	var total   = Math.max(0, Math.floor(ms || 0));
	var minutes = Math.floor(total / 60000);
	var seconds = Math.floor((total % 60000) / 1000);
	var millis  = total % 1000;
	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

function roundScore(value, decimals = 6) {
	var factor = 10 ** decimals;
	return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
}

function getAccuracyWeight(correctCount, totalQuestions) {
	var safeTotal = Math.max(1, Number(totalQuestions) || 1);
	var accuracy = Math.max(0, Math.min(1, (Number(correctCount) || 0) / safeTotal));
	return accuracy ** QUIZ_ACCURACY_WEIGHT_POWER;
}

function saveQuizAttemptLocal(state) {
	try {
		var raw = localStorage.getItem(QUIZ_LOCAL_ATTEMPTS_KEY);
		var records = raw ? JSON.parse(raw) : [];
		if (!Array.isArray(records)) records = [];

		var tries = records
			.filter((record) => record && record.quizName === state.quizName)
			.length + 1;

		records.push({
			quizName: state.quizName,
			playerName: state.playerName || "",
			score: `${state.correctCount}/${state.questions.length}`,
			finalScore: state.finalScore,
			correctCount: state.correctCount,
			totalQuestions: state.questions.length,
			timeMultiplier: state.timeMultiplier,
			elapsedMs: state.elapsedMs,
			duration: formatDuration(state.elapsedMs),
			tries: tries,
			date: new Date().toLocaleDateString(),
			time: new Date().toLocaleTimeString()
		});

		localStorage.setItem(QUIZ_LOCAL_ATTEMPTS_KEY, JSON.stringify(records));
	} catch (error) {
		console.warn("Could not save quiz attempt locally.", error);
	}
}
