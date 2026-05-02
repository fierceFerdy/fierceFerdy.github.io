import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3030;
const SCORE_FILE = path.join(__dirname, "quiz-scores.json");

async function ensureScoreFile() {
	try {
		await fs.access(SCORE_FILE);
	} catch {
		await fs.writeFile(SCORE_FILE, "[]\n", "utf8");
	}
}

async function readScores() {
	await ensureScoreFile();
	try {
		const raw = await fs.readFile(SCORE_FILE, "utf8");
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

async function writeScores(scores) {
	const content = JSON.stringify(scores, null, 2) + "\n";
	await fs.writeFile(SCORE_FILE, content, "utf8");
}

function sendJson(res, statusCode, payload) {
	res.writeHead(statusCode, {
		"Content-Type": "application/json; charset=utf-8",
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET,POST,OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type"
	});
	res.end(JSON.stringify(payload));
}

function sanitizeText(value, maxLength) {
	const clean = String(value ?? "").trim().replace(/<[^>]*>/g, "");
	return clean.slice(0, maxLength);
}

function toNumber(value, fallback = 0) {
	const num = Number(value);
	return Number.isFinite(num) ? num : fallback;
}

const server = createServer(async (req, res) => {
	if (!req.url) {
		sendJson(res, 400, { success: false, error: "Missing URL." });
		return;
	}

	const url = new URL(req.url, `http://${req.headers.host}`);

	if (req.method === "OPTIONS") {
		sendJson(res, 204, { success: true });
		return;
	}

	if (url.pathname !== "/api/quiz-scores") {
		sendJson(res, 404, { success: false, error: "Not found." });
		return;
	}

	if (req.method === "GET") {
		const quizName = sanitizeText(url.searchParams.get("quizName"), 120);
		const scores = await readScores();
		const filtered = quizName
			? scores.filter((entry) => String(entry.quizName || "") === quizName)
			: scores;

		sendJson(res, 200, { success: true, scores: filtered });
		return;
	}

	if (req.method === "POST") {
		let rawBody = "";

		req.on("data", (chunk) => {
			rawBody += chunk;
			if (rawBody.length > 1_000_000) {
				req.destroy();
			}
		});

		req.on("end", async () => {
			let payload;
			try {
				payload = JSON.parse(rawBody || "{}");
			} catch {
				sendJson(res, 400, { success: false, error: "Invalid JSON payload." });
				return;
			}

			const quizName = sanitizeText(payload.quizName, 120);
			const playerName = sanitizeText(payload.playerName, 40);
			const correctCount = Math.max(0, Math.floor(toNumber(payload.correctCount, 0)));
			const totalQuestions = Math.max(1, Math.floor(toNumber(payload.totalQuestions, 1)));
			const elapsedMs = Math.max(1, Math.floor(toNumber(payload.elapsedMs, 1)));
			const timeMultiplier = toNumber(payload.timeMultiplier, 0);
			const finalScore = toNumber(payload.finalScore, 0);

			if (!quizName) {
				sendJson(res, 400, { success: false, error: "Quiz name is required." });
				return;
			}

			if (!playerName) {
				sendJson(res, 400, { success: false, error: "Player name is required." });
				return;
			}

			const scores = await readScores();
			const attemptNumber = scores.filter((entry) => (
				String(entry.quizName || "") === quizName
				&& String(entry.playerName || "").toLowerCase() === playerName.toLowerCase()
			)).length + 1;

			const now = new Date();
			const record = {
				id: `score_${now.getTime()}_${Math.random().toString(16).slice(2)}`,
				quizName,
				playerName,
				correctCount,
				totalQuestions,
				elapsedMs,
				timeMultiplier,
				finalScore,
				attemptNumber,
				createdAt: now.toISOString(),
				date: now.toLocaleDateString(),
				time: now.toLocaleTimeString()
			};

			scores.push(record);

			try {
				await writeScores(scores);
			} catch {
				sendJson(res, 500, { success: false, error: "Could not save score." });
				return;
			}

			sendJson(res, 201, { success: true, record });
		});

		req.on("error", () => {
			sendJson(res, 500, { success: false, error: "Request error." });
		});

		return;
	}

	sendJson(res, 405, { success: false, error: "Method not allowed." });
});

server.listen(PORT, () => {
	console.log(`Quiz highscore API running at http://localhost:${PORT}/api/quiz-scores`);
});
