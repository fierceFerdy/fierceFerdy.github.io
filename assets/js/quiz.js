//=================================================
// ------------ Quiz
// @version 02/05/2026
// @author Ferdy <ferdy.fiers@gmail.com>
//=================================================

var QUIZ_TARGET_SECONDS_PER_QUESTION = 15;
var QUIZ_SCORE_API_URL = `${window.location.protocol}//${window.location.hostname}:3030/api/quiz-scores`;
var QUIZ_LOCAL_ATTEMPTS_KEY = "manual.quizAttempts";
var QUIZ_ACTIVE_STATE_KEY = "manual.activeQuiz";
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
		quizName:        quizData.name || "Unnamed Quiz",
		quizInstanceId:  getQuizInstanceId(block, quizData),
		blurPage:        isTrueValue(block.dataset.blur) || isTrueValue(block.dataset.blurPage) || isTrueValue(quizData.blur) || isTrueValue(quizData.blurPage)
	};

	if (shouldRestoreActiveQuiz(state)) {
		state.started = true;
		state.startedAt = Date.now();
		setQuizPageBlur(block, state, true);
	}

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
	if(state.questions.length >= 40){
		intro.innerHTML = `Ready? This quiz has <span class="vibrate two">a ginormous</span> ${state.questions.length} question${state.questions.length === 1 ? "" : "s"}.`;
	}else if(state.questions.length >= 12){
		intro.innerHTML = `Ready? This quiz has <span class="vibrate">a whopping</span> ${state.questions.length} question${state.questions.length === 1 ? "" : "s"}.`;
	}else {
		intro.textContent = `Ready? This quiz has ${state.questions.length} question${state.questions.length === 1 ? "" : "s"}.`;
	}
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
		setQuizPageBlur(body.parentElement, state, true);
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

	if (hasMultipleChoiceOptions(questionData)) {
		// Question text
		var questionText = document.createElement("p");
		questionText.className = "quiz-question";
		setAllowedMarkup(
			questionText,
			getQuestionPrompt(state, questionData.question),
			{ allowEditorLite: true }
		);
		body.appendChild(questionText);

		// Multiple-choice mode
		var optionsWrap = document.createElement("div");
		optionsWrap.className = "quiz-options";
		body.appendChild(optionsWrap);

		questionData.options.forEach((option, optionIndex) => {
			var button = document.createElement("button");
			button.type = "button";
			setAllowedMarkup(button, option);

			button.addEventListener("click", (e) => {
				e.preventDefault();
				var isCorrect = optionIndex === questionData.answer;
				handleQuestionResult(body, footer, state, questionData, isCorrect);
			});

			optionsWrap.appendChild(button);
		});

		renderFooter(footer, state, false);
		appendSkipButton(footer, body, footer, state, questionData);
	} else {
		// Fill-in mode (one or more input fields + check button)
		renderTextInputQuestion(body, footer, state, questionData, getQuestionPrompt(state, questionData.question));
		renderFooter(footer, state, false);
	}
}



function renderFooter(footer, state, showNextButton, hideProgress = false) {
	footer.innerHTML = "";

	if (showNextButton) {
		var nextButton = document.createElement("button");
		nextButton.className   = "quiz-next";
		nextButton.type        = "button";
		nextButton.textContent = state.currentIndex === state.questions.length - 1 ? "Finish quiz" : "Next question";
		footer.appendChild(nextButton);

		var handleEnterNext = (event) => {
			if (!nextButton.isConnected) {
				document.removeEventListener("keydown", handleEnterNext, true);
				return;
			}

			if (event.key !== "Enter") return;
			if (event.defaultPrevented) return;

			var tagName = String(event.target?.tagName || "").toLowerCase();
			if (tagName === "input" || tagName === "textarea" || tagName === "select") return;
			if (event.target?.isContentEditable) return;

			event.preventDefault();
			nextButton.click();
		};

		document.addEventListener("keydown", handleEnterNext, true);

		nextButton.addEventListener("click", (e) => {
			e.preventDefault();
			e.stopPropagation();
			document.removeEventListener("keydown", handleEnterNext, true);
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

function getQuestionPrompt(state, questionText) {
	return state.questions.length > 1
		? `${state.currentIndex + 1}. ${questionText}`
		: questionText;
}

function hasMultipleChoiceOptions(questionData) {
	return Array.isArray(questionData?.options) && questionData.options.length > 0;
}

function appendSkipButton(container, body, footer, state, questionData) {
	var skipButton = document.createElement("button");
	skipButton.type = "button";
	skipButton.className = "quiz-skip";
	skipButton.textContent = "Skip question";
	container.appendChild(skipButton);

	skipButton.addEventListener("click", (e) => {
		e.preventDefault();
		e.stopPropagation();
		handleSkippedQuestion(body, footer, state, questionData);
	});
}

function handleQuestionResult(body, footer, state, questionData, isCorrect) {
	state.answeredCount++;
	body.innerHTML = "";
	body.parentElement.classList.remove("correct", "wrong");

	var title       = document.createElement("h2");
	var explanation = document.createElement("p");

	if (isCorrect) {
		state.correctCount++;
		body.parentElement.classList.add("correct");
		title.textContent       = "Correct! 🎉";
		setAllowedMarkup(explanation, questionData.explanation);
	} else {
		body.parentElement.classList.add("wrong");
		title.textContent       = "No, you dummy! 😭";
		setAllowedMarkup(explanation, questionData.explanation);
	}

	body.appendChild(title);
	body.appendChild(explanation);
	renderFooter(footer, state, true);
}

function handleSkippedQuestion(body, footer, state, questionData) {
	state.answeredCount++;
	body.innerHTML = "";
	body.parentElement.classList.remove("correct", "wrong");
	body.parentElement.classList.add("wrong");

	var title = document.createElement("h2");
	title.textContent = "Skipped ⏭️";

	var explanation = document.createElement("p");
	setAllowedMarkup(explanation, questionData.explanation || "No explanation provided.");

	body.appendChild(title);
	body.appendChild(explanation);
	renderFooter(footer, state, true);
}

function renderTextInputQuestion(body, footer, state, questionData, questionPromptText) {
	var questionText = document.createElement("p");
	questionText.className = "quiz-question";
	body.appendChild(questionText);

	var gapTemplate = parseGapTemplate(questionPromptText);
	var fields = gapTemplate ? gapTemplate.fields : getInputFields(questionData);
	var inputElements = [];

	var inputsWrap = document.createElement("div");
	inputsWrap.className = "quiz-options quiz-input-options";
	body.appendChild(inputsWrap);

	if (fields.length === 0) {
		setAllowedMarkup(questionText, questionPromptText, { allowEditorLite: true });
		var msg = document.createElement("p");
		msg.textContent = "This question has no valid answer configuration.";
		inputsWrap.appendChild(msg);
		renderFooter(footer, state, false);
		return;
	}

	if (gapTemplate) {
		renderGapTemplatePrompt(questionText, gapTemplate, inputElements, state.currentIndex);
	} else {
		setAllowedMarkup(questionText, questionPromptText, { allowEditorLite: true });
	}

	fields.forEach((field, index) => {
		if (gapTemplate) return;

		var row = document.createElement("div");
		row.className = "quiz-input-row";

		if (field.label) {
			var label = document.createElement("label");
			label.textContent = field.label;
			label.setAttribute("for", `quiz-answer-${state.currentIndex}-${index}`);
			row.appendChild(label);
		}

		var input = document.createElement("input");
		input.type = "text";
		input.className = "quiz-input";
		input.autocomplete = "off";
		input.id = `quiz-answer-${state.currentIndex}-${index}`;
		if (field.placeholder) input.placeholder = field.placeholder;

		row.appendChild(input);
		inputsWrap.appendChild(row);
		inputElements.push(input);
	});

	var checkButton = document.createElement("button");
	checkButton.type = "button";
	checkButton.className = "quiz-check";
	checkButton.textContent = "Check answer";
	inputsWrap.appendChild(checkButton);
	appendSkipButton(inputsWrap, body, footer, state, questionData);

	var feedback = document.createElement("p");
	feedback.className = "quiz-input-feedback";
	inputsWrap.appendChild(feedback);

	var checkAnswers = () => {
		var allCorrect = true;

		fields.forEach((field, index) => {
			var input = inputElements[index];
			var isCorrect = field.answers.some((answer) => isTextAnswerMatch(input.value, answer));

			input.classList.toggle("correct", isCorrect);
			input.classList.toggle("incorrect", !isCorrect);
			if (!isCorrect) allCorrect = false;
		});

		if (!allCorrect) {
			body.parentElement.classList.remove("correct");
			body.parentElement.classList.add("wrong");
			feedback.textContent = "Some answers are incorrect. Try again.";
			return;
		}

		feedback.textContent = "";
		handleQuestionResult(body, footer, state, questionData, true);
	};

	checkButton.addEventListener("click", (e) => {
		e.preventDefault();
		checkAnswers();
	});

	inputElements.forEach((input) => {
		input.addEventListener("keydown", (event) => {
			if (event.key !== "Enter") return;
			event.preventDefault();
			checkAnswers();
		});

		input.addEventListener("input", () => {
			input.classList.remove("incorrect");
			if (feedback.textContent) feedback.textContent = "";
		});
	});

	if (inputElements[0]) inputElements[0].focus();
}

function renderGapTemplatePrompt(questionText, template, inputElements, questionIndex) {
	questionText.textContent = "";

	template.items.forEach((item) => {
		if (item.type === "text") {
			questionText.appendChild(document.createTextNode(item.value));
			return;
		}

		var field = template.fields[item.fieldIndex];
		if (!field) return;

		var input = document.createElement("input");
		input.type = "text";
		input.className = "quiz-input quiz-gap-input";
		input.autocomplete = "off";
		input.id = `quiz-answer-${questionIndex}-${item.fieldIndex}`;
		input.setAttribute("aria-label", `Gap ${item.fieldIndex + 1}`);
		input.size = getInputSizeForAnswers(field.answers);
		input.style.width = `${getInputSizeForAnswers(field.answers) * .8}rem`;

		questionText.appendChild(input);
		inputElements[item.fieldIndex] = input;
	});
}

function parseGapTemplate(text) {
	var source = String(text ?? "");
	var regex = /_([^_]+)_/g;
	var fields = [];
	var items = [];
	var lastIndex = 0;
	var match;

	while ((match = regex.exec(source))) {
		var before = source.slice(lastIndex, match.index);
		if (before) items.push({ type: "text", value: before });

		var gapToken = String(match[1] ?? "").trim();
		var alternatives = splitGapAlternatives(gapToken);

		if (alternatives.length > 1) {
			fields.push({ answers: alternatives, label: "", placeholder: "" });
			items.push({ type: "field", fieldIndex: fields.length - 1 });
		} else {
			// Plain gaps (e.g. _href_) should be input-only.
			if (!/^<[^<>]+>$/.test(gapToken)) {
				fields.push({ answers: [gapToken], label: "", placeholder: "" });
				items.push({ type: "field", fieldIndex: fields.length - 1 });
				lastIndex = regex.lastIndex;
				continue;
			}

			var pieces = splitGapToken(gapToken);

			if (pieces.left) {
				fields.push({ answers: [pieces.left], label: "", placeholder: "" });
				items.push({ type: "field", fieldIndex: fields.length - 1 });
			}

			if (pieces.middle) items.push({ type: "text", value: pieces.middle });

			if (pieces.right) {
				fields.push({ answers: [pieces.right], label: "", placeholder: "" });
				items.push({ type: "field", fieldIndex: fields.length - 1 });
			}

			if (!pieces.left && !pieces.right) {
				fields.push({ answers: [pieces.middle], label: "", placeholder: "" });
				items.push({ type: "field", fieldIndex: fields.length - 1 });
			}
		}

		lastIndex = regex.lastIndex;
	}

	if (fields.length === 0) return null;

	var after = source.slice(lastIndex);
	if (after) items.push({ type: "text", value: after });
	return { items, fields };
}

function splitGapToken(value) {
	var token = String(value ?? "").trim();
	if (!token) return { left: "", middle: "", right: "" };

	if (!/^<[^<>]+>$/.test(token)) {
		return { left: "", middle: token, right: "" };
	}

	var match = token.match(/^(<)([^<>]+)(>)$/);
	if (!match) {
		return { left: "", middle: token, right: "" };
	}

	return {
		left: match[1] || "",
		middle: String(match[2] || "").trim(),
		right: match[3] || ""
	};
}

function splitGapAlternatives(token) {
	var source = String(token ?? "").trim();
	if (!source) return [];

	var options = [];
	var current = "";
	var insideAngle = false;

	for (var char of source) {
		if (char === "<") insideAngle = true;

		if (char === "/" && !insideAngle) {
			options.push(current.trim());
			current = "";
			continue;
		}

		current += char;

		if (char === ">") insideAngle = false;
	}

	options.push(current.trim());
	options = options.filter((value) => value.length > 0);

	if (options.length <= 1) return [source];

	return [...new Set(options.map((value) => value.trim()))];
}

function getInputSizeForAnswer(answer) {
	var length = String(answer ?? "").trim().length;
	return Math.max(3, Math.min(24, length + 1));
}

function getInputSizeForAnswers(answers) {
	var list = Array.isArray(answers) ? answers : [];
	var longest = list.reduce((maxLength, answer) => {
		return Math.max(maxLength, String(answer ?? "").trim().length);
	}, 0);
	return getInputSizeForAnswer("x".repeat(longest));
}

function getInputFields(questionData) {
	if (Array.isArray(questionData?.fields) && questionData.fields.length > 0) {
		return questionData.fields
			.map((field) => normalizeField(field))
			.filter(Boolean);
	}

	var fallbackField = normalizeField(questionData);
	return fallbackField ? [fallbackField] : [];
}

function normalizeField(field) {
	if (!field || typeof field !== "object") return null;

	var answers = [];

	if (Array.isArray(field.answers)) answers = field.answers;
	else if (Array.isArray(field.accept)) answers = field.accept;
	else if (field.answerText != null) answers = [field.answerText];
	else if (field.answer != null && typeof field.answer !== "number") answers = [field.answer];

	answers = answers
		.map((value) => String(value ?? "").trim())
		.filter((value) => value.length > 0);

	if (answers.length === 0) return null;

	return {
		label: String(field.label ?? "").trim(),
		placeholder: String(field.placeholder ?? "").trim(),
		answers: answers
	};
}

function isTextAnswerMatch(inputValue, expectedValue) {
	return normalizeAnswerText(inputValue) === normalizeAnswerText(expectedValue);
}

function normalizeAnswerText(value) {
	return String(value ?? "")
		.trim()
		.toLowerCase()
		.replace(/\s+/g, " ");
}

function setAllowedMarkup(target, rawText, options = {}) {
	var decoded = decodeHtmlEntities(String(rawText ?? ""));
	var parserContainer = document.createElement("div");
	parserContainer.innerHTML = decoded;

	target.textContent = "";
	appendAllowedNodes(parserContainer, target, options);

	// If the safe parser stripped everything (e.g. literal tags like <html> or <!doctype html>),
	// fall back to plain text so escaped code snippets are still visible.
	if (!target.hasChildNodes() && decoded.trim().length > 0) {
		target.textContent = decoded;
	}
}

function appendAllowedNodes(sourceNode, targetNode, options) {
	for (var child of sourceNode.childNodes) {
		if (child.nodeType === Node.TEXT_NODE) {
			targetNode.appendChild(document.createTextNode(child.textContent || ""));
			continue;
		}

		if (child.nodeType === Node.ELEMENT_NODE && child.tagName === "CODE") {
			var code = document.createElement("code");
			code.textContent = child.textContent || "";
			targetNode.appendChild(code);
			continue;
		}

		if (options.allowEditorLite && child.nodeType === Node.ELEMENT_NODE && child.tagName === "EDITORLITE") {
			var editorLite = document.createElement("editorlite");
			editorLite.textContent = child.textContent || "";
			targetNode.appendChild(editorLite);
			continue;
		}

		if (child.nodeType === Node.ELEMENT_NODE) {
			appendAllowedNodes(child, targetNode, options);
		}
	}
}

function decodeHtmlEntities(value) {
	var decoded = String(value ?? "");
	var textarea = document.createElement("textarea");

	// Decode repeatedly to support content that was escaped more than once.
	for (var i = 0; i < 5; i++) {
		textarea.innerHTML = decoded;
		var next = textarea.value;
		if (next === decoded) break;
		decoded = next;
	}

	return decoded;
}

function renderFinishedState(body, footer, state) {
	setQuizPageBlur(body.parentElement, state, false);

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
		partyImage.src       = `/assets/img/party/party${Math.floor(Math.random() * 31) + 1}.gif`;
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

function isTrueValue(value) {
	if (typeof value === "boolean") return value;
	if (typeof value !== "string") return false;
	return value.trim().toLowerCase() === "true";
}

function setQuizPageBlur(quizBlock, state, enabled) {
	if (!state?.blurPage || !quizBlock) return;

	quizBlock.classList.toggle("activeTask", !!enabled);
	quizBlock.classList.toggle("quiz-active-task", !!enabled);

	if (enabled) {
		setActiveQuizId(state.quizInstanceId);
		document.body.classList.add("blur-quiz");
		return;
	}

	clearActiveQuizId(state.quizInstanceId);

	var hasActiveQuiz = document.querySelector(".quiz.quiz-active-task");
	if (!hasActiveQuiz) {
		document.body.classList.remove("blur-quiz");
	}
}

function getQuizInstanceId(block, quizData) {
	var pagePath = window.location.pathname || "";
	if (block?.id) return `${pagePath}#${block.id}`;

	var allQuizzes = Array.from(document.querySelectorAll(".quiz"));
	var index = allQuizzes.indexOf(block);
	var safeIndex = index >= 0 ? index : 0;
	return `${pagePath}::${String(quizData?.name || "Unnamed Quiz")}::${safeIndex}`;
}

function shouldRestoreActiveQuiz(state) {
	if (!state?.blurPage || !state?.quizInstanceId) return false;
	return getActiveQuizId() === state.quizInstanceId;
}

function getActiveQuizId() {
	try {
		return String(localStorage.getItem(QUIZ_ACTIVE_STATE_KEY) || "").trim();
	} catch {
		return "";
	}
}

function setActiveQuizId(quizInstanceId) {
	if (!quizInstanceId) return;
	try {
		localStorage.setItem(QUIZ_ACTIVE_STATE_KEY, quizInstanceId);
	} catch {
		// Ignore storage failures.
	}
}

function clearActiveQuizId(quizInstanceId) {
	if (!quizInstanceId) return;
	try {
		if (getActiveQuizId() !== quizInstanceId) return;
		localStorage.removeItem(QUIZ_ACTIVE_STATE_KEY);
	} catch {
		// Ignore storage failures.
	}
}
