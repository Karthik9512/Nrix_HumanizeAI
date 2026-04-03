import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workerPath = path.resolve(__dirname, "../../python/humanizer_worker.py");

const runPythonWorker = (payload) =>
  new Promise((resolve, reject) => {
    const pythonCommand = process.env.PYTHON_PATH || "python";
    const child = spawn(pythonCommand, [workerPath], {
      stdio: ["pipe", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(stderr || stdout || "Local model worker failed."));
      }

      try {
        const parsed = JSON.parse(stdout);
        if (!parsed.success) {
          return reject(new Error(parsed.message || "Local model worker failed."));
        }
        resolve(parsed);
      } catch (error) {
        reject(new Error(`Could not parse local model response: ${error.message}`));
      }
    });

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });

export const generateHumanizedTextWithLocalModel = async (payload) => {
  return runPythonWorker(payload);
};
