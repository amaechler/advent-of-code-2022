import { lines } from "./util";

class Monkey {
    constructor(
        readonly items: number[],
        readonly operation: (old: bigint) => bigint,
        readonly test: (item: number) => number,
        readonly testDivisor: number
    ) {}
}

function parseNotes(input: string[]): Monkey[] {
    const monkeys: Monkey[] = [];

    for (let i = 0; i < input.length; i++) {
        const currentLine = input[i];

        if (currentLine.startsWith("Monkey")) {
            // parse monkey items
            const itemMatches = input[++i].match(/(\d+)/g);
            if (!itemMatches) {
                throw new Error("Unexpected starting items");
            }
            const items = itemMatches.map((m) => Number(m));

            // parse monkey operations
            const operationMatch = input[++i].match(/new = (.*)/);
            if (!operationMatch) {
                throw new Error("Unexpected operation");
            }
            const bigIntOperation = operationMatch[1].match(/\d/)
                ? operationMatch[1] + "n"
                : operationMatch[1];
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const operation = (old: bigint) => eval(bigIntOperation);

            // parse monkey tests
            const testMatch = input[++i].match(/(\d+)/);
            if (!testMatch) {
                throw new Error("Unexpected test");
            }
            const testTrueMatch = input[++i].match(/(\d+)/);
            if (!testTrueMatch) {
                throw new Error("Unexpected test true");
            }
            const testFalseMatch = input[++i].match(/(\d+)/);
            if (!testFalseMatch) {
                throw new Error("Unexpected test false");
            }
            const test = (item: number) =>
                item % Number(testMatch[1]) === 0
                    ? Number(testTrueMatch[1])
                    : Number(testFalseMatch[1]);

            monkeys.push(
                new Monkey(items, operation, test, Number(testMatch[1]))
            );
        }
    }

    return monkeys;
}

function playKeepAway(
    monkeys: Monkey[],
    rounds: number,
    showSomeRelief: boolean
) {
    const monkeyInspections = Array(monkeys.length).fill(0);

    const commonMultiple = BigInt(
        monkeys.reduce((acc, cur) => acc * cur.testDivisor, 1)
    );

    for (let i = 0; i < rounds; i++) {
        for (const [index, monkey] of monkeys.entries()) {
            const initialItems = [...monkey.items];
            monkey.items.length = 0;

            for (let item of initialItems) {
                const tempItem = monkey.operation(BigInt(item));

                if (showSomeRelief) {
                    item = Math.floor(Number(tempItem / 3n));
                } else {
                    item = Number(tempItem % commonMultiple);
                }

                const monkeyToSendItemTo = monkey.test(item);
                monkeys[monkeyToSendItemTo].items.push(item);

                monkeyInspections[index]++;
            }
        }
    }

    return { monkeys, monkeyInspections };
}

function calculateMonkeyBusiness(monkeyInspections: number[]) {
    return monkeyInspections
        .sort((a, b) => b - a)
        .splice(0, 2)
        .reduce((acc, cur) => acc * cur);
}

describe("day11", () => {
    test.each`
        inputFile                 | part1
        ${"src/day11_sample.txt"} | ${10605}
        ${"src/day11.txt"}        | ${58794}
    `("part1", async ({ inputFile, part1 }) => {
        const input = await lines(inputFile);
        const monkeys = parseNotes(input);

        expect(
            calculateMonkeyBusiness(
                playKeepAway(monkeys, 20, true).monkeyInspections
            )
        ).toBe(part1);
    });

    test.each`
        inputFile                 | part2
        ${"src/day11_sample.txt"} | ${2713310158}
        ${"src/day11.txt"}        | ${20151213744}
    `("part2", async ({ inputFile, part2 }) => {
        const input = await lines(inputFile);
        const monkeys = parseNotes(input);

        expect(
            calculateMonkeyBusiness(
                playKeepAway(monkeys, 10000, false).monkeyInspections
            )
        ).toBe(part2);
    });
});
