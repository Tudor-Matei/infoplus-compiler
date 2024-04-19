import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";

import { encode } from "./base64.js";
import getProgramResult from "./getProgramResult.js";

const executeCommand = promisify(exec);

export default async function compile({ code, limits = {}, tests = [] }) {
    const { fileNameWithCode, fileNameCompiled } = prepareFileNames();
    const compileCommand = `g++ -o ${fileNameCompiled} ${fileNameWithCode}`;

    try {
        await fs.writeFile(fileNameWithCode, code);
        await executeCommand(compileCommand, { timeout: 10000 });
    } catch (err) {
        deleteFile(fileNameWithCode, `Nu am putut șterge fila cu cod ${fileNameWithCode}`);

        if (err?.stderr)
            return {
                data: [{ syntaxError: encode(err.stderr), errorCode: null }],
                err: null,
            };

        console.error("eroare la scriere/compilare:", err);
        return {
            data: null,
            err: "A apărut o eroare internă, iar compilarea nu s-a putut efectua.",
        };
    }

    const programResults = await Promise.allSettled(
        tests.map((currentTestInputOutput) =>
            getProgramResult({
                pathToProgram: fileNameCompiled,
                limits,
                currentTestInputOutput,
            })
        )
    );

    deleteFile(fileNameWithCode, `Nu am putut șterge fila cu cod ${fileNameWithCode}.`);
    deleteFile(fileNameCompiled + ".exe", `Nu am putut șterge fila compilata ${fileNameCompiled}.`);
    let seenSyntaxError = false;
    return {
        data: programResults.map(({ status, value, reason = null }) => {
            if (status === "fulfilled") return { ...value, errorCode: null };
            if (reason?.stderr && !seenSyntaxError) {
                seenSyntaxError = true;
                return { syntaxError: encode(reason.stderr), errorCode: null };
            }

            return { errorCode: decideErrorCode(reason) };
        }),
        err: null,
    };
}

function generateFileId() {
    return Math.floor(Math.random() * 1000);
}

function prepareFileNames() {
    const fileId = generateFileId();
    const compsDirectory = `${process.cwd()}\\comps`;

    return {
        fileNameWithCode: `${compsDirectory}\\codefile-${fileId}.cpp`,
        fileNameCompiled: `${compsDirectory}\\compiledfile-${fileId}`,
    };
}

function decideErrorCode(err) {
    if (err?.code === null && err?.signal === "SIGTERM") return -1;
    if (err?.code === -2) return -2;

    console.error(err);
    return -3;
}

export function deleteFile(file, messageOnFail) {
    return fs.unlink(file).catch((err) => console.error(messageOnFail, `\nEroare: ${err}`));
}
