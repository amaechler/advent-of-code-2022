import { lines } from "./util";

interface Section {
    lower: number;
    upper: number;
}

function parseSections(input: string[]) {
    return input.map((l) => {
        const matches = [...l.matchAll(/(\d+)-(\d+),(\d+)-(\d+)/g)][0];
        return [
            {
                lower: Number(matches[1]),
                upper: Number(matches[2]),
            } as Section,
            {
                lower: Number(matches[3]),
                upper: Number(matches[4]),
            } as Section,
        ];
    });
}

test.each`
    inputFile                | part1  | part2
    ${"src/day4_sample.txt"} | ${2}   | ${4}
    ${"src/day4.txt"}        | ${487} | ${849}
`("day4", async ({ inputFile, part1, part2 }) => {
    const input = await lines(inputFile);

    const sections = parseSections(input);

    expect(
        sections.reduce((acc, cur) => {
            const fullyOverlap =
                (cur[0].lower <= cur[1].lower &&
                    cur[0].upper >= cur[1].upper) ||
                (cur[1].lower <= cur[0].lower && cur[1].upper >= cur[0].upper);

            return acc + (fullyOverlap ? 1 : 0);
        }, 0)
    ).toEqual(part1);

    expect(
        sections.reduce((acc, cur) => {
            const overlap =
                Math.max(cur[0].lower, cur[1].lower) <=
                Math.min(cur[0].upper, cur[1].upper);
            return acc + (overlap ? 1 : 0);
        }, 0)
    ).toEqual(part2);
});
