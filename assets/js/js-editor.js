//=================================================
// ------------JS Editor
// @version 21/04/2026
// @author Ferdy <ferdy.fiers@gmail.com>
//=================================================

import {EditorView, basicSetup} from "https://esm.sh/codemirror";
import {javascript} from "https://esm.sh/@codemirror/lang-javascript";
import {oneDark} from "https://esm.sh/@codemirror/theme-one-dark";
import {autocompletion, completeFromList} from "https://esm.sh/@codemirror/autocomplete";
import {keymap} from "https://esm.sh/@codemirror/view";
import {defaultKeymap, historyKeymap, indentWithTab} from "https://esm.sh/@codemirror/commands";
import {EditorState} from "https://esm.sh/@codemirror/state";
import {parse} from "https://esm.sh/acorn";

const STUDENT_LINE_OFFSET = 3;
const globalCompletions = completeFromList([
    {label: "console", 		type: "variable"},
    {label: "console.log", 	type: "function", apply: insertWithCursor("console.log();", 12)},
    {label: "document",		type: "variable"},
    {label: "document.querySelector", type: "function", apply: insertWithCursor("document.querySelector('')", 24)},
    {label: "document.getElementById", type: "function", apply: insertWithCursor("document.getElementById('')", 25)},
    {label: "window", 		type: "variable"},
    {label: "setTimeout", 	type: "function", apply: insertWithCursor("setTimeout(()=>{},1000)", 16)}
]);
const extensions = [
	basicSetup,
	javascript({typescript: false, jsx: false}),
	oneDark,
    EditorView.lineWrapping,
	autocompletion({override: [globalCompletions]}),
	keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab])
];

// Init all editors on the page
document.querySelectorAll(".js-editor").forEach(createEditor);
document.querySelectorAll('editorlite').forEach(createLiteEditor);

// Watch for dynamically injected <editorlite> nodes (e.g. quiz questions)
const liteObserver = new MutationObserver((mutations) => {
	for (const mutation of mutations) {
		for (const node of mutation.addedNodes) {
			if (node.nodeType !== Node.ELEMENT_NODE) continue;
			
			if (node.tagName === 'EDITORLITE') {
				createLiteEditor(node);
			} else {
				node.querySelectorAll?.('editorlite').forEach(createLiteEditor);
			}
		}
	}
});
liteObserver.observe(document.body, { childList: true, subtree: true });


// If there's an active task in localStorage, re-activate it (e.g. after page refresh)
const activeTask = localStorage.getItem("activeTask");
if (activeTask) {
	const targetEditor = document.querySelector(`.js-editor[data-task-number="${activeTask}"]`);

	if (targetEditor) {
		targetEditor.parentElement.querySelector(".start")?.remove();
		targetEditor.parentElement.classList.remove("blurChildren");

		targetEditor.parentElement.classList.add("activeTask");
		document.body.classList.add("blur");
		targetEditor.scrollIntoView({behavior: "smooth", block: "center"});
	}
}

// Toggle checkmarks
document.addEventListener("click", (e) => {
	const grandparent = e.target?.parentElement?.parentElement?.parentElement;
	if(grandparent?.classList.contains("js-editor")){
		e.target.classList.toggle("check");
	}
});




//=================================================
// ------------ Functions
//=================================================



function createLiteEditor(container) {
    if (container.dataset.editorliteInit) return;
    container.dataset.editorliteInit = 'true';

    const liteExtensions = [...extensions, EditorState.readOnly.of(true)];
    const content = container.textContent;
    container.innerHTML = '';

    const view = new EditorView({
        doc: content,
        extensions: liteExtensions,
        parent: container
    });

    return view;
}

function createEditor(container) {

    // Build DOM
	// if(container.dataset.height) container.style.minHeight = container.dataset.height + "px";
	if(container.dataset.height) container.style.height = container.dataset.height + "px";
    const header = document.createElement("header");
	const title = container.querySelector(".title");
	if(title && title.value != '') header.innerHTML = title.value;
	else header.innerHTML = "<p>JavaScript Editor <small>by yours truly</small></p>";

    container.appendChild(header);

    const editorHost = document.createElement("div");
    container.appendChild(editorHost);

	if(container.dataset.readonly === "true"){
		extensions.push(EditorState.readOnly.of(true));
	}

    const view = new EditorView({
        doc: getInitialDoc(container),
        extensions,
        parent: editorHost
    });



	// It's a task
	if(container.dataset.taskNumber && container.dataset.taskNumber != ''){

		container.parentElement.classList.add("blurChildren");

		// Show what's allowed
		var allowed = document.createElement('div');
		allowed.className = "allowed";
		allowed.innerHTML = 
			"docs <span class='" + (container.dataset.taskDocs === "true" ? "check" : "xmark") + "'></span> " +
			"internet <span class='" + (container.dataset.taskInternet === "true" ? "check" : "xmark") + "'></span> " +
			"teamwork <span class='" + (container.dataset.taskTeam === "true" ? "check" : "xmark") + "'></span> " +
			"questions <span class='" + (container.dataset.taskQuestions === "true" ? "check" : "xmark") + "'></span>";
		container.parentElement.appendChild(allowed);

		// Add start button
		var startBtn = document.createElement("button");
		startBtn.textContent = "Start assignment" + (container.dataset.taskNumber ? ` ${container.dataset.taskNumber}` : "");
		startBtn.classList.add("start");
		container.parentElement.appendChild(startBtn);

		startBtn.addEventListener("click", () => {
			startBtn.remove();
			container.parentElement.classList.remove("blurChildren");

			if(container.dataset.taskDocs == "false"){
				document.body.classList.add("blur");
				container.parentElement.classList.add("activeTask");
			}

			container.scrollIntoView({behavior: "smooth", block: "center"});

			// Save to localstorage to avoid refreshing the page and losing data.
			if(container.dataset.taskDocs == "false"){
				localStorage.setItem("activeTask", container.dataset.taskNumber);
			}
		});
		

		// add finish btn
		var finishBtn = document.createElement("button");
		finishBtn.textContent = "Finish assignment";
		finishBtn.classList.add("finish");
		container.appendChild(finishBtn);

		finishBtn.addEventListener("click", () => {
			document.body.classList.remove("blur");
			container.parentElement.classList.remove("activeTask");
			finishBtn.remove();
			localStorage.removeItem("activeTask");

			(async () => {
				await runCode(view.state.doc.toString(), terminal, container, 'finish');
			})();
		});
	}



	// Terminal and run button
    if(container.dataset.run === "true"){

		// add terminal
		var terminal = drawTerminal(container);

		// add btn
		var runBtn = document.createElement("button");
		runBtn.textContent = "\\\\ Run";
		runBtn.classList.add("run");
		container.appendChild(runBtn);
		
		// add event listener
        runBtn.addEventListener("click", async () => runCode(view.state.doc.toString(), terminal, container));
		
		// also run on ctrl+shift+enter
		view.dom.addEventListener("keydown", async (e) => {
			if(e.key === "Enter" && e.shiftKey && e.ctrlKey){
				e.preventDefault();
                await runCode(view.state.doc.toString(), terminal, container, 'run');
			}
		});
    }

    return view;
}



async function runCode(code, terminal, container, action = 'run') {
	var logs = [];
	const fakeConsole = { log: (...args) => logs.push( args.join(" ") ) };
    let runStatus = "success";
    let runError = null;

    const syntaxError = getSyntaxErrorWithLocation(code);
    if (syntaxError) {
        runStatus = "error";
        runError = syntaxError;
    }

	try {
        if (!runError) {
            // Execute user code
            const wrapped = `"use strict";\n${code}\n//# sourceURL=student-code.js`;
            new Function("console", wrapped)(fakeConsole);
        }
	} catch (e) {
        runStatus = "error";
        runError = e;
	}

    if (container?.dataset?.store === "true"){
		if(action === 'run' || action === 'finish' && container.dataset.taskNumber && container.dataset.taskNumber != '') {
        	saveEditorAttempt(container, runStatus, code, logs.length);
		}
    }

	

	if (action === 'finish') {
        printLine(terminal, 'Assignment has been submitted. Please ask your teacher for feedback.', 'success');

	} else {

		if (runStatus === "error") {
			await printLine(terminal, formatStudentError(runError), 'error');
			return;
		}
		
		if (logs.length === 0) await printLine(terminal, "Done");
		else for (const entry of logs) await printLine(terminal, entry);
    }

}



function getInitialDoc(container, type = 'normal') {
    const textareaDoc = container.querySelector(".js-editor-doc");
	
	return textareaDoc.value
		.replace(/\r\n/g, "\n")
		.replace(/^\n/, "") // optional: remove first blank line from formatting
		.replace(/\s+$/, ""); // Remove trailing whitespace/newlines if needed:
}



function drawTerminal(container) {
    var terminal = document.createElement("pre");
    // terminal.style.minHeight = container.dataset.height + "px";
    terminal.className = "terminal w-2/5";
    container.after(terminal);

    const line = document.createElement("div");
    line.className = "terminal-line";
    terminal.appendChild(line);

    // add clear btn	
    const clearTerminal = document.createElement("button");
    clearTerminal.className = "clearTerminal";
    clearTerminal.type = "button";
    clearTerminal.addEventListener("click", () => {
        terminal.innerHTML = "";

        // optional: recreate first line so styling stays consistent
        const freshLine = document.createElement("div");
        freshLine.className = "terminal-line";
        terminal.appendChild(freshLine);

        terminal.appendChild(clearTerminal);
    });
    terminal.appendChild(clearTerminal);

    return terminal;
}



function insertWithCursor(text, cursorOffset) {
    return (view, completion, from, to) => {
        view.dispatch({
            changes: {from, to, insert: text},
            selection: {anchor: from + cursorOffset}
        });
    };
}

// function executeUserCode(code, fakeConsole) {
//     const wrapped = `"use strict";\n${code}\n//# sourceURL=student-code.js`;

//     return new Function("console", wrapped)(fakeConsole);
// }

function formatStudentError(error) {
    const message = `${error?.name || "Error"}: ${error?.message || String(error)}`;
    const location = extractStudentLocation(error);
    if (!location) return message;

    return `${message}\n    at student-code.js:${location.line}:${location.column}`;
}

function extractStudentLocation(error) {
    const lineNumber = Number(error?.lineNumber);
    const columnNumber = Number(error?.columnNumber);
    if (Number.isFinite(lineNumber) && lineNumber > 0) {
        const lineOffset = error?.studentLineResolved === true ? 0 : STUDENT_LINE_OFFSET;
        return {
            line: Math.max(1, lineNumber - lineOffset),
            column: Number.isFinite(columnNumber) && columnNumber > 0 ? columnNumber : 1
        };
    }

    const stack = String(error?.stack || "");

    const studentMatch = stack.match(/student-code\.js:(\d+):(\d+)/);
    if (studentMatch) {
        return {
            line: Math.max(1, Number(studentMatch[1]) - STUDENT_LINE_OFFSET),
            column: Number(studentMatch[2])
        };
    }

    // Syntax errors from Function(...) often point to <anonymous> instead of sourceURL.
    const anonymousMatch = stack.match(/<anonymous>:(\d+):(\d+)/) || stack.match(/anonymous:(\d+):(\d+)/);
    if (anonymousMatch) {
        return {
            line: Math.max(1, Number(anonymousMatch[1]) - STUDENT_LINE_OFFSET),
            column: Number(anonymousMatch[2])
        };
    }

    return null;
}

function getSyntaxErrorWithLocation(code) {
    try {
        parse(code, {ecmaVersion: "latest"});
        return null;
    } catch (error) {
        if (error && error.loc) {
            const syntaxError = new SyntaxError(error.message);
            syntaxError.lineNumber = Number(error.loc.line);
            syntaxError.columnNumber = Number(error.loc.column) + 1;
            syntaxError.studentLineResolved = true;
            return syntaxError;
        }

        return error;
    }
}

function printLine(terminal, text, type = "default", speed = 45) {
    return new Promise(resolve => {
        const line = document.createElement("div");
        line.className = "terminal-line "+type;
        terminal.appendChild(line);
        let i = 0;

        const interval = setInterval(() => {
            line.textContent += text[i] ?? "";
            i++;

            if (i >= text.length) {
                clearInterval(interval);
                resolve();
            }

            terminal.scrollTop = terminal.scrollHeight;
        }, speed);
    });
}

function saveEditorAttempt(container, status, code, logCount) {
    const storageKey = "manual.editorAttempts";
    const records = readRecords(storageKey);
    const editorName = getEditorName(container);
    const now = new Date();
    const tries = records.filter(record => record.editorName === editorName).length + 1;

    records.push({
        editorName,
        score: status === "success" ? "1/1" : "0/1",
        status,
        logCount,
        code,
        tries,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString()
    });

    try {
        localStorage.setItem(storageKey, JSON.stringify(records));
    } catch (error) {
        console.warn("Could not save editor attempt.", error);
    }
}

function getEditorName(container) {
    const rawTitle = container.dataset.title || "JavaScript Editor";
    const titleHolder = document.createElement("div");
    titleHolder.innerHTML = rawTitle;
    const titleText = (titleHolder.textContent || "").trim();
    return titleText || "JavaScript Editor";
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