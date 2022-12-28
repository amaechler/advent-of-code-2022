import { lines } from "./util";

class Position {
    constructor(readonly x: number, readonly y: number) {}

    toString() {
        return `${this.x},${this.y}`;
    }
}

function normalizeInput(input: string[]) {
    const map: number[][] = Array.from(
        Array(input.length),
        () => new Array(input[0].length)
    );

    for (let i = 0; i < input.length; i++) {
        for (let j = 0; j < input[0].length; j++) {
            const currentCharCode = input[i][j].charCodeAt(0);
            const translatedCode =
                currentCharCode === 83 /* S */
                    ? 97 /* a */
                    : currentCharCode === 69 /* E */
                    ? 122 /* z */
                    : currentCharCode;

            map[i][j] = translatedCode - 97; // normalize to 0-offset
        }
    }

    return map;
}

function bfs(
    input: number[][],
    startPosition: Position,
    condition: (
        heightMap: number[][],
        currentNode: Position,
        parentNode: Position
    ) => boolean
) {
    // queue to manage the nodes that have yet to be visited, and add start
    const queue: Position[] = [startPosition];
    // set indicating whether we have already visited a node (start node is already visited)
    const visited = new Set(startPosition.toString());

    // distances (the distance to the start node is 0))
    const distances = {};
    distances[startPosition.toString()] = 0;

    // while there are nodes left to visit...
    while (queue.length > 0) {
        const node = queue.shift();
        if (!node) {
            throw new Error("There should always be an item in the queue.");
        }

        // find neighboring nodes
        const neighboringPositions = [
            new Position(node.x + 1, node.y),
            new Position(node.x - 1, node.y),
            new Position(node.x, node.y + 1),
            new Position(node.x, node.y - 1),
        ];

        //...for all neighboring nodes that haven't been visited yet....
        for (const n of neighboringPositions) {
            // out of bounds?
            if (
                n.x < 0 ||
                n.y < 0 ||
                n.x >= input[0].length ||
                n.y >= input.length
            ) {
                continue;
            }

            // have we been here before?
            if (visited.has(n.toString())) {
                continue;
            }

            // can we go there?
            if (!condition(input, n, node)) {
                continue;
            }

            // visit the node, set the distance and add it to the queue
            visited.add(n.toString());
            distances[n.toString()] = distances[node.toString()] + 1;
            queue.push(n);
        }
    }

    return distances;
}

test.each`
    inputFile                 | part1  | part2
    ${"src/day12_sample.txt"} | ${31}  | ${29}
    ${"src/day12.txt"}        | ${468} | ${459}
`("day12", async ({ inputFile, part1, part2 }) => {
    const input = await lines(inputFile);

    // normalize height map
    const heightMap = normalizeInput(input);

    // part1
    let startPosition: Position = new Position(-1, -1);
    let endPosition: Position = new Position(-1, -1);
    for (const [index, line] of input.entries()) {
        const start = line.indexOf("S");
        const end = line.indexOf("E");
        if (start >= 0) {
            startPosition = new Position(start, index);
        }
        if (end >= 0) {
            endPosition = new Position(end, index);
        }
    }

    const distancesPart1 = bfs(
        heightMap,
        startPosition,
        (heightMap, nodeToVisit, parentNode) =>
            heightMap[nodeToVisit.y][nodeToVisit.x] <=
            heightMap[parentNode.y][parentNode.x] + 1
    );
    expect(distancesPart1[endPosition.toString()]).toBe(part1);

    // part 2 - let's calculate the distances from the end and change the condition to descend by 1
    const distancesPart2 = bfs(
        heightMap,
        endPosition,
        (heightMap, nodeToVisit, parentNode) =>
            heightMap[nodeToVisit.y][nodeToVisit.x] >=
            heightMap[parentNode.y][parentNode.x] - 1
    );

    const endPositions: Position[] = [];
    for (const [index, line] of heightMap.entries()) {
        const end = line.indexOf(0);
        if (end >= 0) {
            endPositions.push(new Position(end, index));
        }
    }

    expect(
        endPositions.reduce(
            (acc, cur) => Math.min(distancesPart2[cur.toString()], acc),
            Infinity
        )
    ).toBe(part2);
});
