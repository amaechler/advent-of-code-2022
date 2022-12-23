import { lines } from "./util/file";

function caloriesPerElf(lines: string[]) {
    const { calories: caloriesPerElf } = lines.reduce(
        ({ calories, i }, cur) => {
            if (cur === "") {
                return { calories, i: i + 1 };
            }

            calories[i] = calories[i] ? calories[i] + Number(cur) : Number(cur);

            return { calories, i };
        },
        { i: 0, calories: [] as number[] }
    );

    return caloriesPerElf;
}

test.each`
    inputFile                | part1                              | part2
    ${"src/day1_sample.txt"} | ${{ currentMax: 24000, elf: 4 }}   | ${45000}
    ${"src/day1.txt"}        | ${{ currentMax: 71471, elf: 150 }} | ${211189}
`("day1", async ({ inputFile, part1, part2 }) => {
    const input = await lines(inputFile);

    const calories = caloriesPerElf(input);

    expect(
        calories.reduce(
            ({ currentMax, elf }, cur, i) =>
                cur > currentMax
                    ? { currentMax: cur, elf: i + 1 }
                    : { currentMax, elf },
            { currentMax: 0, elf: 0 }
        )
    ).toEqual(part1);

    expect(
        calories
            .sort((a, b) => a - b)
            .slice(-3)
            .reduce((acc, cur) => acc + cur, 0)
    ).toEqual(part2);
});
