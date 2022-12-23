import { readFile } from "fs/promises";

export async function lines(inputFile: string) {
    return (await readFile(inputFile, "utf8")).split(/\n/);
}
