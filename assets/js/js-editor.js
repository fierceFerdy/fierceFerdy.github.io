//=================================================
// ------------JS Editor
// @version 21/04/2026
// @author Ferdy <ferdy.fiers@gmail.com>
//=================================================

import {EditorView, basicSetup} from "https://esm.sh/codemirror";
import {javascript} 			from "https://esm.sh/@codemirror/lang-javascript";
import {html} 					from "https://esm.sh/@codemirror/lang-html";
import {autocompletion, 
		completeFromList} 		from "https://esm.sh/@codemirror/autocomplete";
import {keymap} 				from "https://esm.sh/@codemirror/view";
import {defaultKeymap, 
		historyKeymap, 
		indentWithTab} 			from "https://esm.sh/@codemirror/commands";
import {EditorState} 			from "https://esm.sh/@codemirror/state";
import {indentUnit, syntaxHighlighting, HighlightStyle} from "https://esm.sh/@codemirror/language";
import {tags} from "https://esm.sh/@lezer/highlight";
import {parse} 					from "https://esm.sh/acorn";


var STUDENT_LINE_OFFSET = 3;
var globalCompletions = completeFromList([
    {label: "console", 		type: "variable"},
    {label: "console.log", 	type: "function", apply: insertWithCursor("console.log();", 12)},
    {label: "document",		type: "variable"},
    {label: "document.querySelector", type: "function", apply: insertWithCursor("document.querySelector('')", 24)},
    {label: "document.getElementById", type: "function", apply: insertWithCursor("document.getElementById('')", 25)},
    {label: "window", 		type: "variable"},
    {label: "setTimeout", 	type: "function", apply: insertWithCursor("setTimeout(()=>{},1000)", 16)}
]);
var darkModernSurface = EditorView.theme({
    "&": { backgroundColor: "#1f1f1f", color: "#d4d4d4" },
    ".cm-scroller": { backgroundColor: "#1f1f1f" },
    ".cm-content": { caretColor: "#d4d4d4" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#d4d4d4" },
    ".cm-selectionBackground, .cm-selectionLayer .cm-selectionBackground, &.cm-focused .cm-selectionBackground": { backgroundColor: "#264f78" },
    ".cm-gutters": { backgroundColor: "#181818", color: "#858585", border: "none" },
    ".cm-activeLine": { backgroundColor: "#2d2d2d" },
    ".cm-activeLineGutter": { backgroundColor: "#2d2d2d" },
    ".cm-tooltip": { backgroundColor: "#252526", color: "#d4d4d4", border: "1px solid #3c3c3c" }
}, {dark: true});

var darkModernSyntax = syntaxHighlighting(HighlightStyle.define([
    {tag: tags.keyword, color: "#569cd6"},
    {tag: [tags.atom, tags.bool, tags.null], color: "#569cd6"},
    {tag: [tags.number, tags.integer, tags.float], color: "#b5cea8"},
    {tag: [tags.string, tags.special(tags.string)], color: "#ce9178"},
    {tag: [tags.comment, tags.lineComment, tags.blockComment], color: "#6a9955"},
    {tag: [tags.variableName, tags.propertyName], color: "#9cdcfe"},
    {tag: tags.function(tags.variableName), color: "#dcdcaa"},
    {tag: [tags.tagName, tags.typeName], color: "#569cd6"},
    {tag: tags.attributeName, color: "#9cdcfe"},
    {tag: tags.attributeValue, color: "#ce9178"},
    {tag: [tags.punctuation, tags.bracket], color: "#d4d4d4"},
    {tag: tags.angleBracket, color: "#8b949e"}
]));

var baseExtensions = [
    basicSetup,
    darkModernSurface,
    darkModernSyntax,
    EditorState.tabSize.of(4),
    indentUnit.of("    "),
    EditorView.lineWrapping,
    keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab])
];


// Init all editors on the page
document.querySelectorAll(".js-editor").forEach(createEditor);
document.querySelectorAll('editorlite').forEach(createLiteEditor);



// Watch for dynamically injected <editorlite> nodes (e.g. quiz questions)
var liteObserver = new MutationObserver((mutations) => {
	for (var mutation of mutations) {
		for (var node of mutation.addedNodes) {
			if (node.nodeType !== Node.ELEMENT_NODE) continue;
			
			if (node.tagName === 'EDITORLITE') {
				createLiteEditor(node);
			} else {
				node.querySelectorAll?.('editorlite').forEach(createLiteEditor);
			}
		}
	}
});
liteObserver.observe(document.body || document.documentElement, { childList: true, subtree: true });


// If there's an active task in localStorage, re-activate it (e.g. after page refresh)
var activeTask = localStorage.getItem("activeTask");
if (activeTask) {
	var targetEditor = document.querySelector(`.js-editor[data-task-number="${activeTask}"]`);

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
	var grandparent = e.target?.parentElement?.parentElement?.parentElement;
	if(grandparent?.classList.contains("js-editor")) e.target.classList.toggle("check");
});




//=================================================
// ------------ Functions
//=================================================



function createLiteEditor(container) {
    if (container.dataset.editorliteInit) return;
    container.dataset.editorliteInit = 'true';

    var rawContent = String(container.textContent ?? "");
    var language = getEditorLiteLanguage(container, rawContent);
    var content = normalizeEditorSource(rawContent, language);
    container.innerHTML = '';

    var view = createCodeMirrorEditor(container, content, getEditorExtensions(language, true));

    applyEditorSelectionStyles(view);

    return view;
}

function getEditorLiteLanguage(container, source) {
    if (container?.dataset?.language) return getEditorLanguage(container);

    // Infer HTML when snippet contains tags; otherwise keep JavaScript default.
    if (/<\s*\/?\s*!?[a-z][^>]*>/i.test(String(source ?? ""))) {
        return "html";
    }

    return "javascript";
}

function createEditor(container) {
	var language = getEditorLanguage(container);
    var editorExtensions = getEditorExtensions(language, container.dataset.readonly === "true");
    var pasteAllowed = container.dataset.paste !== "false";

    // Build DOM
	// if(container.dataset.height) container.style.minHeight = container.dataset.height + "px";
	if(container.dataset.height) container.style.height = container.dataset.height + "px";
    var header = document.createElement("header");
	var title = container.querySelector(".title");
	if(title && title.value != '') header.innerHTML = title.value;
	else header.innerHTML = "<p>JavaScript Editor <small>by yours truly</small></p>";

    container.appendChild(header);

    var editorHost = document.createElement("div");
    container.appendChild(editorHost);

    var view = createCodeMirrorEditor(editorHost, getInitialDoc(container), editorExtensions);

    applyEditorSelectionStyles(view);



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
		if(container.dataset.paste === "false"){
			allowed.innerHTML += " paste <span class='xmark'></span>";
		}
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

            addShowSolutionButton(container, editorHost);

			(async () => {
				await runCode(view.state.doc.toString(), terminal, container, 'finish');
			})();
		});
	}

    // Manually blurred editor (same unlock pattern as tasks, without task state tracking)
    if((!container.dataset.taskNumber || container.dataset.taskNumber === '') && container.dataset.blurred === "true"){
        container.parentElement.classList.add("blurChildren");

        var revealBtn = document.createElement("button");
        revealBtn.textContent = "Reveal code";
        revealBtn.classList.add("start");
        container.parentElement.appendChild(revealBtn);

        revealBtn.addEventListener("click", () => {
            revealBtn.remove();
            container.parentElement.classList.remove("blurChildren");
            container.scrollIntoView({behavior: "smooth", block: "center"});
        });
    }



	// Terminal and run button
    if(container.dataset.run === "true"){
		// add width class
		container.classList.add("w-3/5");

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
    }else{
		// add width class
		if(!container.classList.contains("w-1/2")){
			container.classList.add("w-full");
		}
	}

    if (!pasteAllowed) {
        var blockInsert = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        // Block browser/context-menu paste and drop for this editor instance.
        view.dom.addEventListener("paste", blockInsert, true);
        view.contentDOM.addEventListener("paste", blockInsert, true);
        view.dom.addEventListener("drop", blockInsert, true);
        view.contentDOM.addEventListener("drop", blockInsert, true);

        // Block IME/input pipeline paste events used by some browsers.
        view.dom.addEventListener("beforeinput", (e) => {
            if (e.inputType === "insertFromPaste" || e.inputType === "insertFromDrop") {
                blockInsert(e);
            }
        }, true);

        // Block keyboard shortcuts that can trigger paste.
        view.dom.addEventListener("keydown", (e) => {
            var isPasteShortcut = (e.ctrlKey || e.metaKey) && (e.key === "v" || e.key === "V");
            var isShiftInsert = e.shiftKey && e.key === "Insert";
            if (isPasteShortcut || isShiftInsert) {
                blockInsert(e);
            }
        }, true);
    }

    return view;
}

function addShowSolutionButton(container, editorHost) {
    var solutionTextarea = container.querySelector("textarea.solution");
    if (!solutionTextarea) return;

    var solutionCode = normalizeEditorSource(solutionTextarea.value, getEditorLanguage(container))
        .replace(/\r\n/g, "\n")
        .replace(/^\n/, "")
        .replace(/\s+$/, "");

    if (solutionCode === "") return;
    if (container.querySelector(".show-solution")) return;

    var showSolutionBtn = document.createElement("button");
    showSolutionBtn.textContent = "Show solution";
    showSolutionBtn.classList.add("showSolution");
    container.appendChild(showSolutionBtn);

    showSolutionBtn.addEventListener("click", () => {
        renderSolutionEditor(container, editorHost, solutionCode);
        showSolutionBtn.remove();
    });
}

function renderSolutionEditor(container, editorHost, solutionCode) {
    if (container.querySelector(".solution-view")) return;
    var language = getEditorLanguage(container);

    var solutionView = document.createElement("div");
    solutionView.className = "solution-view";

    var label = document.createElement("p");
    label.textContent = "Solution";
    solutionView.appendChild(label);

    var solutionHost = document.createElement("div");
    solutionView.appendChild(solutionHost);

    editorHost.after(solutionView);

    var solutionViewInstance = new EditorView({
        doc: solutionCode,
		extensions: getEditorExtensions(language, true),
        parent: solutionHost
    });

    applyEditorSelectionStyles(solutionViewInstance);
}



async function runCode(code, terminal, container, action = 'run') {
	var logs = [];
    var outputQueue = Promise.resolve();
    var printedCount = 0;
    var shouldStreamOutput = action !== 'finish';

    function queueOutput(text, type = "default") {
        logs.push(text);
        if (!shouldStreamOutput) return;

        printedCount++;
        outputQueue = outputQueue.then(() => printLine(terminal, text, type));
    }

    var fakeConsole = {
        log: (...args) => queueOutput(formatConsoleArgs(args)),
        info: (...args) => queueOutput(formatConsoleArgs(args)),
        warn: (...args) => queueOutput(formatConsoleArgs(args)),
        error: (...args) => queueOutput(formatConsoleArgs(args), "error")
    };
    let runStatus = "success";
    let runError = null;
    var executionResult = null;
    var asyncTracker = createAsyncTracker();

    var syntaxError = getSyntaxErrorWithLocation(code);
    if (syntaxError) {
        runStatus = "error";
        runError = syntaxError;
    }

	try {
        if (!runError) {
            // Execute user code
            executionResult = executeUserCode(code, fakeConsole, asyncTracker);
            await waitForAsyncLogs(executionResult, logs, asyncTracker);
        }
	} catch (e) {
        runStatus = "error";
        runError = e;
	} finally {
        asyncTracker.restore();
	}

    var hasTaskNumber = !!container?.dataset?.taskNumber;
    var shouldStoreRunAttempt = container?.dataset?.store === "true" && action === "run";
    var shouldStoreFinishedTask = action === "finish" && hasTaskNumber;

    if (shouldStoreRunAttempt || shouldStoreFinishedTask) {
        saveEditorAttempt(container, runStatus, code, logs.length);
    }

	

	if (action === 'finish') {
        await printLine(terminal, 'Assignment has been submitted. Please ask your teacher for feedback.', 'success');

	} else {
        await outputQueue;

		if (runStatus === "error") {
			await printLine(terminal, formatStudentError(runError), 'error');
			return;
		}
		
        if (printedCount === 0) await printLine(terminal, "Done");
    }

}



function getInitialDoc(container, type = 'normal') {
    var textareaDoc = container.querySelector(".js-editor-doc");
	var language = getEditorLanguage(container);
	
    return normalizeEditorSource(textareaDoc.value, language)
		.replace(/\r\n/g, "\n")
		.replace(/^\n/, "") // optional: remove first blank line from formatting
		.replace(/\s+$/, ""); // Remove trailing whitespace/newlines if needed:
}



function normalizeEditorSource(text, language = "javascript") {
    var source = String(text ?? "");
    if (language !== "html") return source;

    return source
        .replace(/<\s*fakehtml(\s|>)/gi, "<html$1")
        .replace(/<\s*\/\s*fakehtml\s*>/gi, "</html>")
        .replace(/<\s*fakehead(\s|>)/gi, "<head$1")
        .replace(/<\s*\/\s*fakehead\s*>/gi, "</head>")
        .replace(/<\s*fakebody(\s|>)/gi, "<body$1")
        .replace(/<\s*\/\s*fakebody\s*>/gi, "</body>");
}



function getEditorLanguage(container) {
	return (container?.dataset?.language || "javascript").toLowerCase();
}



function createCodeMirrorEditor(host, initialDoc, extensions) {
    return new EditorView({
        doc: initialDoc,
        extensions: extensions,
        parent: host
    });
}

function getEditorExtensions(language, isReadOnly = false) {
	var languageExtension = language === "html"
		? html()
		: javascript({typescript: false, jsx: false});

	var completionExtensions = language === "html"
		? []
		: [autocompletion({override: [globalCompletions]})];

	var readOnlyExtensions = isReadOnly ? [EditorState.readOnly.of(true)] : [];
    var baseEditorExtensions = baseExtensions;

	return [
		...baseEditorExtensions,
		languageExtension,
		...completionExtensions,
		...readOnlyExtensions
	];
}

function applyEditorSelectionStyles(view) {
    if (!view?.dom) return;
}



function drawTerminal(container) {
    var terminal = document.createElement("pre");
    // terminal.style.minHeight = container.dataset.height + "px";
    terminal.className = "terminal w-2/5";
    container.after(terminal);

    var line = document.createElement("div");
    line.className = "terminal-line";
    terminal.appendChild(line);

    // add clear btn	
    var clearTerminal = document.createElement("button");
    clearTerminal.className = "clearTerminal";
    clearTerminal.type = "button";
    clearTerminal.addEventListener("click", () => {
        terminal.innerHTML = "";

        // optional: recreate first line so styling stays consistent
        var freshLine = document.createElement("div");
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



function executeUserCode(code, fakeConsole, asyncTracker = createAsyncTracker()) {
    var wrapped = `"use strict";\n${code}\n//# sourceURL=student-code.js`;
    var restoreNameState = null;

    // In browsers, `name` exists globally (window.name) and can hide real scope errors.
    // Remove it temporarily so `typeof name` is safe and bare `name` throws as expected.
    try {
        var originalNameDescriptor = Object.getOwnPropertyDescriptor(globalThis, "name");

        if (originalNameDescriptor && originalNameDescriptor.configurable) {
            delete globalThis.name;
            restoreNameState = () => {
                Object.defineProperty(globalThis, "name", originalNameDescriptor);
            };
        } else {
            // Fallback if not configurable: avoid false positives for typeof checks.
            var previousNameValue = globalThis.name;
            globalThis.name = undefined;
            restoreNameState = () => {
                globalThis.name = previousNameValue;
            };
        }
    } catch (e) {
        restoreNameState = null;
    }

    try {
        return new Function("console", "setTimeout", "clearTimeout", wrapped)(
            fakeConsole,
            asyncTracker.setTimeout,
            asyncTracker.clearTimeout
        );
    } finally {
        if (restoreNameState) restoreNameState();
    }
}



async function waitForAsyncLogs(executionResult, logs, asyncTracker, maxWaitMs = 4500, idleMs = 180) {
    var start = Date.now();
    var lastChangeAt = Date.now();
    var lastCount = logs.length;

    if (isPromiseLike(executionResult)) {
        try {
            await Promise.race([
                executionResult,
                delay(maxWaitMs)
            ]);
        } catch (error) {
            // Preserve async errors as normal run errors.
            throw error;
        }
    }

    while (Date.now() - start < maxWaitMs) {
        if (logs.length !== lastCount) {
            lastCount = logs.length;
            lastChangeAt = Date.now();
        }

        var hasPendingTimers = asyncTracker && asyncTracker.getPendingCount() > 0;

        if (!hasPendingTimers && Date.now() - lastChangeAt >= idleMs) {
            break;
        }

        await delay(50);
    }
}

function createAsyncTracker() {
    var pendingTimers = new Set();
    var nativeSetTimeout = globalThis.setTimeout.bind(globalThis);
    var nativeClearTimeout = globalThis.clearTimeout.bind(globalThis);

    function trackedSetTimeout(callback, delay, ...args) {
        var timerId = null;

        timerId = nativeSetTimeout(() => {
            pendingTimers.delete(timerId);
            callback(...args);
        }, delay);

        pendingTimers.add(timerId);
        return timerId;
    }

    function trackedClearTimeout(timerId) {
        pendingTimers.delete(timerId);
        nativeClearTimeout(timerId);
    }

    return {
        setTimeout: trackedSetTimeout,
        clearTimeout: trackedClearTimeout,
        getPendingCount: () => pendingTimers.size,
        restore: () => {
            for (var timerId of pendingTimers) {
                nativeClearTimeout(timerId);
            }
            pendingTimers.clear();
        }
    };
}

function isPromiseLike(value) {
    return value && typeof value.then === "function";
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function formatConsoleArgs(args) {
    return args.map(formatConsoleValue).join(" ");
}

function formatConsoleValue(value) {
    if (typeof value === "string") return value;
    if (value === null) return "null";

    var valueType = typeof value;
    if (valueType === "undefined" || valueType === "number" || valueType === "boolean" || valueType === "bigint" || valueType === "symbol") {
        return String(value);
    }

    if (valueType === "function") {
        return value.name ? `[Function: ${value.name}]` : "[Function]";
    }

    if (value instanceof Error) {
        return `${value.name}: ${value.message}`;
    }

    try {
        return JSON.stringify(value, createSafeJsonReplacer(), 2);
    } catch (error) {
        return String(value);
    }
}

function createSafeJsonReplacer() {
    var seen = new WeakSet();

    return (_, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) return "[Circular]";
            seen.add(value);
        }

        return value;
    };
}

function formatStudentError(error) {
    var message = `${error?.name || "Error"}: ${error?.message || String(error)}`;
    var location = extractStudentLocation(error);
    if (!location) return message;

    return `${message}\n    at student-code.js:${location.line}:${location.column}`;
}

function extractStudentLocation(error) {
    var lineNumber = Number(error?.lineNumber);
    var columnNumber = Number(error?.columnNumber);
    if (Number.isFinite(lineNumber) && lineNumber > 0) {
        var lineOffset = error?.studentLineResolved === true ? 0 : STUDENT_LINE_OFFSET;
        return {
            line: Math.max(1, lineNumber - lineOffset),
            column: Number.isFinite(columnNumber) && columnNumber > 0 ? columnNumber : 1
        };
    }

    var stack = String(error?.stack || "");

    var studentMatch = stack.match(/student-code\.js:(\d+):(\d+)/);
    if (studentMatch) {
        return {
            line: Math.max(1, Number(studentMatch[1]) - STUDENT_LINE_OFFSET),
            column: Number(studentMatch[2])
        };
    }

    // Syntax errors from Function(...) often point to <anonymous> instead of sourceURL.
    var anonymousMatch = stack.match(/<anonymous>:(\d+):(\d+)/) || stack.match(/anonymous:(\d+):(\d+)/);
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
            var syntaxError = new SyntaxError(error.message);
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
        var line = document.createElement("div");
        line.className = "terminal-line "+type;
        terminal.appendChild(line);
        let i = 0;

        var interval = setInterval(() => {
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
    var storageKey = "manual.editorAttempts";
    var records = readRecords(storageKey);
    var editorName = getEditorName(container);
    var now = new Date();
    var tries = records.filter(record => record.editorName === editorName).length + 1;

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
    var rawTitle = container.dataset.title || "JavaScript Editor";
    var titleHolder = document.createElement("div");
    titleHolder.innerHTML = rawTitle;
    var titleText = (titleHolder.textContent || "").trim();

    return titleText || "JavaScript Editor";
}

function readRecords(storageKey) {
    try {
        var raw = localStorage.getItem(storageKey);
        if (!raw) return [];
        var parsed = JSON.parse(raw);

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn("Could not read saved records.", error);

        return [];
    }
}