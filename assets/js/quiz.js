document.querySelectorAll(".quiz").forEach(initQuizBlock);

function initQuizBlock(block) {
    const dataScript = block.querySelector(".quiz-data");
    if (!dataScript) return;
    var quizData;

    try {
        quizData = JSON.parse(dataScript.textContent);
    } catch (error) {
        block.innerHTML = "<p>Quiz data is invalid.</p>";
        return;
    }

    const state = {
        currentIndex: 0,
        answeredCount: 0,
        correctCount: 0,
		questions: quizData.questions || [],
		quizName: quizData.name || "Unnamed Quiz"
    };

    renderQuiz(block, quizData, state);
}

function renderQuiz(block, quizData, state) {
    block.innerHTML = "";

    const section = document.createElement("section");
    block.appendChild(section);

    const footer = document.createElement("footer");
    block.appendChild(footer);

    renderCurrentQuestion(section, footer, state);
}

function renderCurrentQuestion(body, footer, state) {
    body.innerHTML = "";
    footer.innerHTML = "";
	body.parentElement.classList.remove("correct", "wrong");

    if (state.currentIndex >= state.questions.length) {
        renderFinishedState(body, footer, state);
        return;
    }

    const questionData = state.questions[state.currentIndex];

	// Show question
    const questionText = document.createElement("p");
    questionText.className = "quiz-question";

	if(state.questions.length > 1){
		questionText.innerHTML = `${state.currentIndex + 1}. ${questionData.question}`;
	} else {
		questionText.innerHTML = questionData.question;
	}
    body.appendChild(questionText);

	// Show options
    const optionsWrap = document.createElement("div");
    optionsWrap.className = "quiz-options";
    body.appendChild(optionsWrap);

    questionData.options.forEach((option, optionIndex) => {
        const button = document.createElement("button");
        button.textContent = option;

        button.addEventListener("click", () => {
            const isCorrect = optionIndex === questionData.answer;
            state.answeredCount++;

			// Show explanation
			body.innerHTML = "";
            const title = document.createElement("h2");
            const explanation = document.createElement("p");

			if (isCorrect) {
				state.correctCount++;

				body.parentElement.classList.add("correct");
				title.textContent = "Correct! 🎉";
				explanation.textContent = questionData.explanation;

			} else {
				body.parentElement.classList.add("wrong");
				title.textContent = "No, you dummy! 😭";
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

function renderFooter(footer, state, showNextButton) {
	footer.innerHTML = "";

	// Next button
    if (showNextButton) {
		const nextButton = document.createElement("button");
		nextButton.className = "quiz-next";
		nextButton.textContent = state.currentIndex === state.questions.length - 1 ? "Finish quiz" : "Next question";
		footer.appendChild(nextButton);

		nextButton.addEventListener("click", () => {
			state.currentIndex++;
			renderCurrentQuestion(
				footer.parentElement.querySelector("section"),
				footer,
				state
			);
		});
	}

	// Show progress
    const progress = document.createElement("div");
    progress.className = "quiz-progress";
    progress.textContent = `Answered: ${state.answeredCount}/${state.questions.length} · Correct: ${state.correctCount}`;
    footer.appendChild(progress);

	// Show a line which fills up more and more based on the progress
	const progressBar = document.createElement("div");
	progressBar.className = "quiz-progress-bar";
	const progressFill = document.createElement("div");
	progressFill.className = "quiz-progress-fill";
	progressFill.style.width = `${(state.answeredCount / state.questions.length) * 100}%`;
	progressBar.appendChild(progressFill);
	footer.appendChild(progressBar);
}

function renderFinishedState(body, footer, state) {
    const message = document.createElement("p");
    message.className = "quiz-question";
    message.textContent = `Finished. Score: ${state.correctCount}/${state.questions.length}`;
	if(state.correctCount === state.questions.length) message.textContent += " 🎉";
    body.appendChild(message);

	saveQuizAttempt(state.quizName, state.correctCount, state.questions.length);

	// Show visual result
	if(state.correctCount === state.questions.length){
		body.parentElement.classList.add("correct");

		// Show party GIF
		var randomNum = Math.floor(Math.random() * 31) + 1;
		const partyImage = document.createElement("img");
		partyImage.src = `/assets/img/party${randomNum}.gif`;
		partyImage.className = "party";
		body.appendChild(partyImage);
		
	} else{
		body.parentElement.classList.add("wrong");
	}

	// Add retry button
	const retryButton = document.createElement("button");
	retryButton.textContent = "Retry quiz";
	retryButton.className = "quiz-retry";
	footer.appendChild(retryButton);

	retryButton.addEventListener("click", () => {
		state.currentIndex = 0;
		state.answeredCount = 0;
		state.correctCount = 0;
		renderQuiz(footer.parentElement, { questions: state.questions }, state);
	});
}

function saveQuizAttempt(quizName, correctCount, totalQuestions) {
	const storageKey = "manual.quizAttempts";
	const records = readRecords(storageKey);
	const tries = records.filter(record => record.quizName === quizName).length + 1;
	const now = new Date();

	records.push({
		quizName,
		score: `${correctCount}/${totalQuestions}`,
		correctCount,
		totalQuestions,
		tries,
		date: now.toLocaleDateString(),
		time: now.toLocaleTimeString()
	});

	try {
		localStorage.setItem(storageKey, JSON.stringify(records));
	} catch (error) {
		console.warn("Could not save quiz attempt.", error);
	}
}

function readRecords(storageKey) {
	try {
		const raw = localStorage.getItem(storageKey);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch (error) {
		console.warn("Could not read saved records.", error);
		return [];
	}
}