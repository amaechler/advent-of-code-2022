import { lines } from "./util";

function visibleTreeCountNaive(trees: number[][]) {
    const visibleTrees: { i: number; j: number }[] = [];

    for (let i = 1; i < trees.length - 1; i++) {
        for (let j = 1; j < trees[0].length - 1; j++) {
            const currentTreeHeight = trees[i][j];
            let currentTreeVisible = false;

            // check to the left
            for (let k = j - 1; k >= 0; k--) {
                if (trees[i][k] >= currentTreeHeight) {
                    // not visible, stop
                    break;
                }

                if (k === 0) {
                    // we made it
                    currentTreeVisible = true;
                    break;
                }
            }

            if (currentTreeVisible) {
                // add tree to visible list and get out of here
                visibleTrees.push({ i, j });
                continue;
            }

            // check to the right
            for (let k = j + 1; k < trees[0].length; k++) {
                if (trees[i][k] >= currentTreeHeight) {
                    // not visible, stop
                    break;
                }

                if (k === trees[0].length - 1) {
                    // we made it
                    currentTreeVisible = true;
                    break;
                }
            }

            if (currentTreeVisible) {
                // add tree to visible list and get out of here
                visibleTrees.push({ i, j });
                continue;
            }

            // check to the top
            for (let k = i - 1; k >= 0; k--) {
                if (trees[k][j] >= currentTreeHeight) {
                    // not visible, stop
                    break;
                }

                if (k === 0) {
                    // we made it
                    currentTreeVisible = true;
                    break;
                }
            }

            if (currentTreeVisible) {
                // add tree to visible list and get out of here
                visibleTrees.push({ i, j });
                continue;
            }

            // check to the bottom
            for (let k = i + 1; k < trees.length; k++) {
                if (trees[k][j] >= currentTreeHeight) {
                    // not visible, stop
                    break;
                }

                if (k === trees.length - 1) {
                    // we made it
                    currentTreeVisible = true;
                    break;
                }
            }

            if (currentTreeVisible) {
                // add tree to visible list and get out of here
                visibleTrees.push({ i, j });
                continue;
            }
        }
    }

    return visibleTrees.length + 2 * (trees.length + trees[0].length - 2);
}

function scenicScoreNaive(trees: number[][]) {
    let highestScenicScore = -1;

    for (let i = 3; i < trees.length - 1; i++) {
        for (let j = 2; j < trees[0].length - 1; j++) {
            const currentTreeHeight = trees[i][j]; /*?*/
            const viewingDistances: number[] = [];
            let k: number;

            // check to the left
            for (k = j - 1; k >= 0; k--) {
                if (trees[i][k] >= currentTreeHeight || k === 0) {
                    break;
                }
            }
            viewingDistances.push(j - k);

            // check to the right
            for (k = j + 1; k < trees[0].length; k++) {
                if (
                    trees[i][k] >= currentTreeHeight ||
                    k === trees[0].length - 1
                ) {
                    break;
                }
            }
            viewingDistances.push(k - j);

            // check to the up
            for (k = i - 1; k >= 0; k--) {
                if (trees[k][j] >= currentTreeHeight || k === 0) {
                    break;
                }
            }
            viewingDistances.push(i - k);

            // check to the down
            for (k = i + 1; k < trees.length; k++) {
                if (
                    trees[k][j] >= currentTreeHeight ||
                    k === trees.length - 1
                ) {
                    break;
                }
            }
            viewingDistances.push(k - i);

            highestScenicScore = Math.max(
                viewingDistances.reduce((acc, cur) => acc * cur, 1),
                highestScenicScore
            );
        }
    }

    return highestScenicScore;
}

test.each`
    inputFile                | part1   | part2
    ${"src/day8_sample.txt"} | ${21}   | ${8}
    ${"src/day8.txt"}        | ${1782} | ${474606}
`("day8", async ({ inputFile, part1, part2 }) => {
    const input = await lines(inputFile);

    const trees = input.map((l) => [...l].map((t) => Number(t)));
    expect(visibleTreeCountNaive(trees)).toBe(part1);
    expect(scenicScoreNaive(trees)).toBe(part2);
});
