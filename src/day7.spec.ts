import { lines } from "./util";

interface File {
    size: number;
    name: string;
}

class Directory {
    constructor(
        readonly name: string,
        readonly parent: Directory | undefined,
        readonly directories: Directory[] = [],
        readonly files: File[] = []
    ) {}
}

interface DirectoryWithSize extends Directory {
    directories: DirectoryWithSize[];
    size: number;
}

function parseFileSystem(input: string[]): Directory {
    const rootDir = new Directory("/", undefined);

    let currentDir = rootDir;
    for (let currentPos = 0; currentPos < input.length; currentPos++) {
        const currentInstruction = input[currentPos];
        if (currentInstruction === "$ ls") {
            const nextInstruction = input.findIndex(
                (x, b) => b > currentPos && x.startsWith("$")
            );
            const lsOutput = input.slice(
                currentPos + 1,
                nextInstruction > 0 ? nextInstruction : undefined
            );

            // parse list output
            for (const currentLine of lsOutput) {
                const fileMatch = currentLine.match(/(\d+) (.+)/);
                if (fileMatch) {
                    currentDir.files.push({
                        name: fileMatch[2],
                        size: Number(fileMatch[1]),
                    });
                }

                const dirMatch = currentLine.match(/dir (.+)/);
                if (dirMatch) {
                    currentDir.directories.push(
                        new Directory(dirMatch[1], currentDir)
                    );
                }
            }

            currentPos += lsOutput.length;
        } else {
            const cdMatch = currentInstruction.match(/\$ cd (.*)/);
            if (cdMatch) {
                if (cdMatch[1] === "..") {
                    // traverse up
                    if (currentDir.parent) {
                        currentDir = currentDir.parent;
                    } else {
                        console.log("Can't traverse up, no further parent");
                    }
                } else {
                    // traverse down
                    let childDir = currentDir.directories.find(
                        (d) => d.name === cdMatch[1]
                    );

                    if (!childDir) {
                        childDir = new Directory(cdMatch[1], currentDir);
                        currentDir.directories.push(childDir);
                    }

                    currentDir = childDir;
                }
            }
        }
    }

    return rootDir;
}

function enhanceDirectoriesWithSizes(
    dir: DirectoryWithSize
): DirectoryWithSize {
    let directorySize = (dir as DirectoryWithSize).size;

    if (!directorySize) {
        const fileSizes = dir.files.reduce((acc, cur) => acc + cur.size, 0);

        for (const d of dir.directories) {
            (d as DirectoryWithSize).size = enhanceDirectoriesWithSizes(d).size;
        }

        directorySize =
            fileSizes +
            (dir.directories as DirectoryWithSize[]).reduce(
                (acc, cur) => acc + cur.size,
                0
            );
    }

    return { ...dir, size: directorySize };
}

function flatMapDirectories(
    dir: DirectoryWithSize,
    predicate: (size: number) => boolean
) {
    return [
        predicate(dir.size) ? dir : undefined,
        ...dir.directories.reduce(
            (acc, cur) => [...acc, ...flatMapDirectories(cur, predicate)],
            [] as DirectoryWithSize[]
        ),
    ].filter((x) => x) as DirectoryWithSize[];
}

test.each`
    inputFile                | part1      | part2
    ${"src/day7_sample.txt"} | ${95437}   | ${24933642}
    ${"src/day7.txt"}        | ${1490523} | ${12390492}
`("day7", async ({ inputFile, part1, part2 }) => {
    const input = await lines(inputFile);

    expect(input[0]).toBe("$ cd /");

    const fileSystem = parseFileSystem(input.slice(1));
    const fileSystemWithSizes = enhanceDirectoriesWithSizes(
        fileSystem as DirectoryWithSize
    );

    // part 1: sum of directories <= size 100000
    const directoriesSmallerThan10000 = flatMapDirectories(
        fileSystemWithSizes,
        (s) => s <= 100000
    );
    expect(
        directoriesSmallerThan10000.reduce((acc, cur) => acc + cur.size, 0)
    ).toBe(part1);

    // part2: have 30000000 free space (total 70000000)
    const candidatesToDelete = flatMapDirectories(
        fileSystemWithSizes,
        (s) => s >= 30000000 - (70000000 - fileSystemWithSizes.size)
    );
    expect(candidatesToDelete.sort((a, b) => a.size - b.size)[0].size).toBe(
        part2
    );
});
