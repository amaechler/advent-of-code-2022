import { lines } from "./util/file";

type Shape = "rock" | "paper" | "scissor";

function parseHand(symbol: string): Shape {
    switch (symbol) {
        case "A":
        case "X":
            return "rock";

        case "B":
        case "Y":
            return "paper";

        case "C":
        case "Z":
            return "scissor";

        default:
            throw new Error(`Illegal hand ${symbol}`);
    }
}

function scoreWin(opponent: Shape, myself: Shape) {
    return (opponent === "rock" && myself === "scissor") ||
        (opponent === "paper" && myself === "rock") ||
        (opponent === "scissor" && myself === "paper")
        ? 0
        : opponent === myself
        ? 3
        : 6;
}

function scoreHand(myself: Shape) {
    return myself === "rock" ? 1 : myself === "paper" ? 2 : 3;
}

function scoresPerRoundPart1(lines: string[]) {
    const evaluateRound = (round: string): number => {
        const opponent = parseHand(round[0]);
        const myself = parseHand(round[2]);

        return scoreWin(opponent, myself) + scoreHand(myself);
    };

    const scores = lines.reduce((acc, cur) => {
        acc.push(evaluateRound(cur));
        return acc;
    }, [] as number[]);

    return scores;
}

function scoresPerRoundPart2(lines: string[]) {
    const determineHand = (opponent: Shape, outcome: string): Shape => {
        switch (outcome) {
            case "X": // loose
                return opponent === "paper"
                    ? "rock"
                    : opponent === "rock"
                    ? "scissor"
                    : "paper";

            case "Y": // tie
                return opponent;

            case "Z": // win
                return opponent === "paper"
                    ? "scissor"
                    : opponent === "rock"
                    ? "paper"
                    : "rock";

            default:
                throw new Error(`Illegal outcome ${outcome}`);
        }
    };

    const evaluateRound = (round: string): number => {
        const opponent = parseHand(round[0]);
        const myself = determineHand(opponent, round[2]);

        return scoreWin(opponent, myself) + scoreHand(myself);
    };

    const scores = lines.reduce((acc, cur) => {
        acc.push(evaluateRound(cur));
        return acc;
    }, [] as number[]);

    return scores;
}

test.each`
    inputFile                | part1    | part2
    ${"src/day2_sample.txt"} | ${15}    | ${12}
    ${"src/day2.txt"}        | ${13052} | ${13693}
`("day2", async ({ inputFile, part1, part2 }) => {
    const input = await lines(inputFile);

    const scores = scoresPerRoundPart1(input);
    expect(scores.reduce((acc, cur) => acc + cur, 0)).toEqual(part1);

    const scores2 = scoresPerRoundPart2(input);
    expect(scores2.reduce((acc, cur) => acc + cur, 0)).toEqual(part2);
});
