import { lines } from "./util";

type Direction = "up" | "down" | "left" | "right";

interface Motion {
    direction: Direction;
    steps: number;
}

interface Position {
    x: number;
    y: number;
}

function parseMotions(input: string[]) {
    return input.map<Motion>((i) => {
        const match = i.match(/(\S) (\d+)/);
        if (!match) {
            throw new Error("Illegal motion");
        }

        return {
            direction:
                match[1] === "U"
                    ? "up"
                    : match[1] === "D"
                    ? "down"
                    : match[1] === "L"
                    ? "left"
                    : "right",
            steps: Number(match[2]),
        };
    });
}

function movePosition(pos: Position, dir: Direction): Position {
    switch (dir) {
        case "up":
            return { ...pos, y: pos.y - 1 };
        case "down":
            return { ...pos, y: pos.y + 1 };
        case "left":
            return { ...pos, x: pos.x - 1 };
        case "right":
            return { ...pos, x: pos.x + 1 };
    }
}

function makeTailFollowHead(head: Position, tail: Position): Position {
    const adjacent =
        Math.abs(head.x - tail.x) <= 1 && Math.abs(head.y - tail.y) <= 1;

    if (adjacent) {
        // no movement required
        return tail;
    }

    // move tail towards the head
    if (head.x - tail.x > 1 && head.y - tail.y > 1) {
        // head is off to the right top
        return { x: tail.x + 1, y: tail.y + 1 };
    } else if (head.x - tail.x < -1 && head.y - tail.y < -1) {
        // head is off to the left bottom
        return { x: tail.x - 1, y: tail.y - 1 };
    } else if (head.x - tail.x < -1 && head.y - tail.y > 1) {
        // head is off to the left top
        return { x: tail.x - 1, y: tail.y + 1 };
    } else if (head.x - tail.x > 1 && head.y - tail.y < -1) {
        // head is off to the right bottom
        return { x: tail.x + 1, y: tail.y - 1 };
    } else if (head.x - tail.x > 1) {
        // head is off to the right
        return { x: head.x - 1, y: head.y };
    } else if (head.x - tail.x < -1) {
        // head is off to the left
        return { x: head.x + 1, y: head.y };
    } else if (head.y - tail.y > 1) {
        // head is off to the top
        return { x: head.x, y: head.y - 1 };
    } else if (head.y - tail.y < -1) {
        // head is off to the bottom
        return { x: head.x, y: head.y + 1 };
    }

    throw new Error("Not adjacent and no movement, should never happen");
}

function countUniqueTailPositionsAdvanced(
    motions: Motion[],
    numberOfKnots: number
): number {
    // use a primitive type for Set value equality
    const uniqueTailPositions = new Set<string>();

    const currentPositions: Position[] = [...Array(numberOfKnots)].map(() => ({
        x: 0,
        y: 0,
    }));

    // perform movements
    for (const motion of motions) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const _ of Array(motion.steps).keys()) {
            // move head
            currentPositions[0] = movePosition(
                currentPositions[0],
                motion.direction
            );

            // make knots follow
            for (let k = 1; k < numberOfKnots; k++) {
                currentPositions[k] = makeTailFollowHead(
                    currentPositions[k - 1],
                    currentPositions[k]
                );
            }

            uniqueTailPositions.add(
                `${currentPositions[numberOfKnots - 1].x},${
                    currentPositions[numberOfKnots - 1].y
                }`
            );
        }
    }

    return uniqueTailPositions.size;
}

function visualizeKnots(knots: Position[]) {
    for (let i = -20; i < 20; i++) {
        let line = "";
        for (let j = -20; j < 20; j++) {
            let indicator = ".";

            for (const [kIndex, k] of knots.entries()) {
                if (k.y === i && k.x === j) {
                    indicator = `${kIndex}`;
                }
            }

            line += indicator;
        }

        console.log(line);
    }
}

test.each`
    inputFile                 | part1   | part2
    ${"src/day9_sample.txt"}  | ${13}   | ${1}
    ${"src/day9_sample2.txt"} | ${88}   | ${36}
    ${"src/day9.txt"}         | ${5874} | ${2467}
`("day9", async ({ inputFile, part1, part2 }) => {
    const input = await lines(inputFile);

    const motions = parseMotions(input);
    expect(countUniqueTailPositionsAdvanced(motions, 2)).toBe(part1);
    expect(countUniqueTailPositionsAdvanced(motions, 10)).toBe(part2);
});
