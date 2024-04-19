import { execFile } from "child_process";
import perfHooks from "perf_hooks";
const LEEWAY_TIME = 100;
const LEEWAY_MEMORY = 8;

export default function getProgramResult({
  pathToProgram,
  limits: { maxExecutionTime = 100, maxMemory = 4 } = {},
  currentTestInputOutput: { input = "", expectedOutput = "" } = {},
}) {
  return new Promise((resolve, reject) => {
    let memoryUsed;

    const memoryUsageCheckId = setInterval(() => {
      memoryUsed = Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;
      if (memoryUsed - LEEWAY_MEMORY > maxMemory) {
        executeProcess.kill("SIGTERM");
        clearInterval(memoryUsageCheckId);
        reject({ code: -2 });
        console.log("Memorie ocupata:", memoryUsed, "MB | limita:", maxMemory, "MB");
      }
    }, 10);

    const programStartTime = perfHooks.performance.now();
    const executeProcess = execFile(
      pathToProgram,
      { timeout: maxExecutionTime + LEEWAY_TIME },
      (err, stdout, stderr) => {
        const programEndTime = perfHooks.performance.now();
        clearInterval(memoryUsageCheckId);

        if (err || stderr) {
          console.error(err ? `_err_: ${err}` : `_stderr_: ${stderr}`);
          return reject(err || stderr);
        }

        return resolve({
          isCorrect: stdout === expectedOutput,
          executionTime: parseFloat(Math.abs(programEndTime - programStartTime - LEEWAY_TIME).toPrecision(3)),
          memoryUsed: parseFloat(Math.abs(memoryUsed - LEEWAY_MEMORY).toPrecision(3)),
        });
      }
    );

    if (input) executeProcess.stdin.end(input); // introduce in std::cin si incheie stream-ul de data
  });
}
