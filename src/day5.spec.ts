import { jsonDeepCopy, lines } from "./util";

interface Instruction {
    numberOfCratesToMove: number;
    from: number;
    to: number;
}

function parseStacks(input: string[]) {
    const crateEnd = input.findIndex((i) => i === ""); /*?*/
    const numberOfStacks = Math.max(
        ...input[crateEnd - 1]
            .split(" ")
            .filter((x) => x)
            .map((s) => Number(s))
    );

    const stacks = new Array(numberOfStacks);
    for (let i = crateEnd - 2; i >= 0; i--) {
        for (let j = 0; j < numberOfStacks; j++) {
            const cur = input[i].charAt(4 * j + 1);
            if (cur !== " ") {
                if (!stacks[j]) {
                    stacks[j] = [];
                }

                stacks[j].push(cur);
            }
        }
    }

    return stacks;
}

function parseInstructions(input: string[]) {
    const crateEnd = input.findIndex((i) => i === ""); /*?*/
    return input.splice(crateEnd + 1).map((l) => {
        const match = l.match(/move (\d+) from (\d+) to (\d+)/);
        return {
            numberOfCratesToMove: Number(match?.[1]),
            from: Number(match?.[2]),
            to: Number(match?.[3]),
        } as Instruction;
    });
}

test.each`
    inputFile                | part1          | part2
    ${"src/day5_sample.txt"} | ${"CMZ"}       | ${"MCD"}
    ${"src/day5.txt"}        | ${"QMBMJDFTD"} | ${"NBTVTJNFJ"}
`("day5", async ({ inputFile, part1, part2 }) => {
    const input = await lines(inputFile);

    const stacks = parseStacks(input);
    const instructions = parseInstructions(input);

    const finalStacks = instructions.reduce((acc, cur) => {
        for (let i = 0; i < cur.numberOfCratesToMove; i++) {
            const box = acc[cur.from - 1].pop();
            acc[cur.to - 1].push(box);
        }
        return acc;
    }, jsonDeepCopy(stacks));

    expect(
        finalStacks.reduce((acc, cur) => acc + cur[cur.length - 1], "")
    ).toBe(part1);

    const finalStacks2 = instructions.reduce((acc, cur) => {
        const boxes = acc[cur.from - 1].splice(
            -cur.numberOfCratesToMove,
            cur.numberOfCratesToMove
        );
        acc[cur.to - 1] = [...acc[cur.to - 1], ...boxes];

        return acc;
    }, jsonDeepCopy(stacks));

    expect(
        finalStacks2.reduce((acc, cur) => acc + cur[cur.length - 1], "")
    ).toBe(part2);
});
