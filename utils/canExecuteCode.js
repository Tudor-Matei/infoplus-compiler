import readline from "readline";

export default function canExecuteCode() {
  const input = readline.createInterface({ input: process.stdin, output: process.stdout });

  return new Promise((resolve) => {
    input.question("Execute code? (d/n) ", async (answer) => {
      if (answer === "d") resolve(true);
      else resolve(false);
      input.close();
    });
  });
}
