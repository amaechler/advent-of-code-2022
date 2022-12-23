import { readFile } from "fs/promises";

import { lines } from "./util";

function calculateRegister(input: string[]) {
    const xRegisterLimit = 240;

    const xRegister = Array<number>(xRegisterLimit);
    xRegister[0] = 1;

    let cycle = 0;
    for (const instruction of input) {
        const match = instruction.match(/addx (-?\d+)/);
        if (match) {
            cycle += 2;
            xRegister[cycle] = xRegister[cycle - 2] + Number(match[1]);
            xRegister[cycle - 1] = xRegister[cycle - 2];
        } else {
            cycle++;
            xRegister[cycle] = xRegister[cycle - 1];
        }
    }

    return xRegister.slice(0, xRegisterLimit);
}

function calculateSignalStrengths(xRegister: number[]) {
    let sumOfSignalStrengths = 0;
    for (let i = 0; i < 6; i++) {
        const cycle = 20 + i * 40;
        sumOfSignalStrengths += xRegister[cycle - 1] * cycle;
    }

    return sumOfSignalStrengths;
}

function drawCrt(xRegister: number[]): string {
    let crt = "";

    for (const [index, spriteCenter] of xRegister.entries()) {
        const wrappedIndex = index % 40;

        if (index > 0 && wrappedIndex === 0) {
            crt += "\n";
        }

        const pixel =
            spriteCenter >= wrappedIndex - 1 && spriteCenter <= wrappedIndex + 1
                ? "#"
                : ".";
        crt += pixel;
    }

    return crt;
}

test.each`
    inputFile                 | part1    | part2
    ${"src/day10_sample.txt"} | ${13140} | ${"src/day10_sample_output.txt"}
    ${"src/day10.txt"}        | ${13720} | ${"src/day10_output.txt"}
`("day10", async ({ inputFile, part1, part2 }) => {
    const input = await lines(inputFile);

    const xRegister = calculateRegister(input);

    // part1
    expect(calculateSignalStrengths(xRegister)).toBe(part1);

    // part2
    const expectedOutput = await readFile(part2, "utf8");
    expect(drawCrt(xRegister)).toBe(expectedOutput); // FBURHZCH
});
