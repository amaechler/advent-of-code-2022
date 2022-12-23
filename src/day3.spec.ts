import { chunk, lines } from "./util";

function priority(item: string) {
    return item.charCodeAt(0) - (/[a-z]/.test(item) ? 96 : 38);
}

function prioritiesPerRucksack(lines: string[]) {
    const priorities = lines.map((l) => {
        const comp1 = l.slice(0, l.length / 2);
        const comp2 = l.slice(l.length / 2);

        const duplicateItem = [...comp1].filter((value) =>
            comp2.includes(value)
        )[0];

        return priority(duplicateItem);
    });

    return priorities;
}

function prioritiesOfBadges(lines: string[]) {
    const badges = chunk(lines, 3).map(
        (c) =>
            c.reduce((acc, cur) =>
                [...acc].filter((x) => cur.includes(x)).join()
            )[0]
    );

    return badges.map((b) => priority(b));
}

test.each`
    inputFile                | part1   | part2
    ${"src/day3_sample.txt"} | ${157}  | ${70}
    ${"src/day3.txt"}        | ${8298} | ${2708}
`("day3", async ({ inputFile, part1, part2 }) => {
    const input = await lines(inputFile);

    const priorities1 = prioritiesPerRucksack(input);
    expect(priorities1.reduce((acc, cur) => acc + cur, 0)).toEqual(part1);

    const priorities2 = prioritiesOfBadges(input);
    expect(priorities2.reduce((acc, cur) => acc + cur, 0)).toEqual(part2);
});
