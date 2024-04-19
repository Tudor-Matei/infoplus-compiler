import express from "express";
import ExecutionQueue from "./utils/ExecutionQueue.js";
import { decode } from "./utils/base64.js";
import canExecuteCode from "./utils/canExecuteCode.js";
import compile from "./utils/compile.js";

const app = express();
app.use(express.json());

const ALLOWED_URL = "http://localhost:3000";
const PORT = 3001;

//cors
app.use((_, res, next) => {
  res.header("Access-Control-Allow-Origin", ALLOWED_URL);
  res.header("Access-Control-Allow-Methods", "POST");
  res.header("Access-Control-Allow-Headers", "Content-type");
  next();
});

const executionQueue = new ExecutionQueue();

app.post("/compile", async (req, res) => {
  if (!req.body || !req.body.maxExecutionTime || !req.body.maxMemory || !req.body.tests)
    return res.status(400).json({ ok: false, wasAllowed: false });

  executionQueue.enqueue({ currentRequest: req, currentResponse: res });
  if (!executionQueue.isExecuting()) {
    executionQueue.setExecuting(true);

    await executionQueue.execute(async ({ currentRequest, currentResponse }) => {
      const decodedCode = decode(currentRequest.body.code);
      console.log(`\n${"-".repeat(10)}NEW CODE${"-".repeat(10)}\n${decodedCode}`);

      if (await canExecuteCode()) {
        const compilationResults = await compile({
          code: decodedCode,
          limits: currentRequest.body,
          tests: currentRequest.body.tests,
        });

        return currentResponse.status(200).json({ ok: true, wasAllowed: true, ...compilationResults });
      }

      return currentResponse.status(200).json({ ok: true, wasAllowed: false });
    });
  }
});

app.listen(PORT, () => {
  console.log(`Started listening on port ${PORT}!`);
});
