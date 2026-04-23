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




//=================================================
// ------------ Functions
//=================================================

function createEditor(container) {

    // Build DOM
	container.style.minHeight = container.dataset.height + "px";
    const header = document.createElement("header");
    header.innerHTML = container.dataset.title;
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

	// Terminal and run button
    if(container.dataset.run === "true"){

		// add terminal
		var terminal = drawTerminal(container);

		// add btn
		var runBtn = document.createElement("button");
		runBtn.textContent = "\\\\ Run";
		container.appendChild(runBtn);
		
		// add event listener
        runBtn.addEventListener("click", async () => runCode(view.state.doc.toString(), terminal, container));
		
		// also run on ctrl+shift+enter
		view.dom.addEventListener("keydown", async (e) => {
			if(e.key === "Enter" && e.shiftKey && e.ctrlKey){
				e.preventDefault();
                await runCode(view.state.doc.toString(), terminal, container);
			}
		});
    }

    return view;
}

async function runCode(code, terminal, container) {
	var logs = [];
	const fakeConsole = { log: (...args) => logs.push( args.join(" ") ) };
    let runStatus = "success";
    let runError = null;

	try {
		// Execute user code
		const wrapped = `"use strict";\n${code}\n//# sourceURL=student-code.js`;
		new Function("console", wrapped)(fakeConsole);
	} catch (e) {
        runStatus = "error";
        runError = e;
	}

    if (container?.dataset?.store === "true") {
        saveEditorAttempt(container, runStatus, code, logs.length);
    }

    if (runStatus === "error") {
        await printLine(terminal, formatStudentError(runError));
        return;
    }

    if (logs.length === 0) await printLine(terminal, "Done");
    else for (const entry of logs) await printLine(terminal, entry);
}

function getInitialDoc(container) {
    const textareaDoc = container.querySelector(".js-editor-doc");
	
	return textareaDoc.value
		.replace(/\r\n/g, "\n")
		.replace(/^\n/, ""); // optional: remove first blank line from formatting
}

function drawTerminal(container) {
    var terminal = document.createElement("pre");
    terminal.style.minHeight = container.dataset.height + "px";
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
    const stack = String(error?.stack || "");
    const match = stack.match(/student-code\.js:(\d+):(\d+)/);
    if (!match) return message;
    const line = Math.max(1, Number(match[1]) - STUDENT_LINE_OFFSET);

    return `${message}\n    at student-code.js:${line}:${match[2]}`;
}

function printLine(terminal, text, speed = 70) {
    return new Promise(resolve => {
        const line = document.createElement("div");
        line.className = "terminal-line";
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