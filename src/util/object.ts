export function jsonDeepCopy<T>(o: T): T {
    return JSON.parse(JSON.stringify(o));
}
