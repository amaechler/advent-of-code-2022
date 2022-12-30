import { chunk, lines } from "./util";

type Packet = (number | Packet)[];

class PacketPair {
    constructor(readonly left: Packet, readonly right: Packet) {}
}

function isPacket(data: number | Packet): data is Packet {
    return !Number.isInteger(data);
}

function parsePacket(input: string) {
    const nestedArray = JSON.parse(input);
    return nestedArray as Packet;
}

function comparePacketData(
    left: number | Packet,
    right: number | Packet
): boolean | undefined {
    // both are numbers
    if (typeof left === "number" && typeof right === "number") {
        return left === right ? undefined : left < right;
    }

    const wrappedLeft = isPacket(left) ? left : [left];
    const wrappedRight = isPacket(right) ? right : [right];
    return comparePair(new PacketPair(wrappedLeft, wrappedRight));
}

function comparePair(pair: PacketPair): boolean | undefined {
    let correct: boolean | undefined = undefined;

    for (let i = 0; correct === undefined; i++) {
        if (pair.left[i] === undefined && pair.right[i] !== undefined) {
            // left side ran out of data, correct
            return true;
        } else if (pair.left[i] !== undefined && pair.right[i] === undefined) {
            // right side ran out of data, not correct
            return false;
        } else if (pair.left[i] === undefined && pair.right[i] === undefined) {
            // both sides ran out of data, continue comparison
            return undefined;
        }

        correct = comparePacketData(pair.left[i], pair.right[i]);
    }

    return correct;
}

function calculateSumOfCorrectPairs(input: string[]) {
    const pairs = chunk(
        input.filter((s) => s !== ""),
        2
    ).map((p) => new PacketPair(parsePacket(p[0]), parsePacket(p[1])));

    let sum = 0;
    for (const [index, pair] of pairs.entries()) {
        const isOrderCorrect = comparePair(pair);
        if (isOrderCorrect) {
            sum += index + 1;
        }
    }

    return sum;
}

function calculateDecoderKey(input: string[]) {
    const dividerPackets = [[[2]] as Packet, [[6]] as Packet];
    const allPackets = [
        ...input.filter((s) => s !== "").map((s) => parsePacket(s)),
        ...dividerPackets,
    ];

    // sort in place
    allPackets.sort((a, b) => {
        const compare = comparePair(new PacketPair(a, b));
        return compare === true ? -1 : compare === false ? 1 : 0;
    });

    // multiply divider packet positions
    return dividerPackets.reduce(
        (acc, cur) => acc * (allPackets.indexOf(cur) + 1),
        1
    );
}

test.each`
    inputFile                 | part1   | part2
    ${"src/day13_sample.txt"} | ${13}   | ${140}
    ${"src/day13.txt"}        | ${6076} | ${24805}
`("day13", async ({ inputFile, part1, part2 }) => {
    const input = await lines(inputFile);

    // part 1
    const sumOfCorrectPairs = calculateSumOfCorrectPairs(input);
    expect(sumOfCorrectPairs).toBe(part1);

    // part 2
    const decoderKey = calculateDecoderKey(input);
    expect(decoderKey).toBe(part2);
});
