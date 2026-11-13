import { stdin, stdout } from "node:process";

const CTRL_C = 3;
const BACKSPACE = 8;
const LF = 10;
const CR = 13;
const DEL = 127;
const SPACE = 32;

export function readSecret(prompt: string): Promise<string> {
  stdout.write(prompt);

  if (!stdin.isTTY) {
    return readPipedLine();
  }

  return new Promise((resolve, reject) => {
    const chars: string[] = [];

    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
    };

    const onData = (chunk: string) => {
      for (const ch of chunk) {
        const code = ch.codePointAt(0)!;

        if (code === CR || code === LF) {
          cleanup();
          stdout.write("\n");
          resolve(chars.join(""));
          return;
        }

        if (code === CTRL_C) {
          cleanup();
          stdout.write("\n");
          reject(new Error("Cancelled"));
          return;
        }

        if (code === DEL || code === BACKSPACE) {
          chars.pop();
          continue;
        }

        if (code >= SPACE) chars.push(ch);
      }
    };

    stdin.on("data", onData);
  });
}

function readPipedLine(): Promise<string> {
  return new Promise((resolve, reject) => {
    let buffer = "";
    stdin.setEncoding("utf8");
    stdin.on("data", (chunk: string) => {
      buffer += chunk;
      const nl = buffer.indexOf("\n");
      if (nl !== -1) {
        stdin.pause();
        resolve(buffer.slice(0, nl).replace(/\r$/, ""));
      }
    });
    stdin.on("end", () => resolve(buffer.replace(/\r?\n$/, "")));
    stdin.on("error", reject);
  });
}
