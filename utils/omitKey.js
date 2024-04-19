export default function omitKey(keys = [], sampleObject = {}) {
    if (keys.length === 1) {
        const { [keys]: omittedKey, ...newObject } = sampleObject;
        return newObject;
    }
    const keysToOmit = new Set(keys);
    const newObject = {};

    for (const key of Object.keys(sampleObject)) {
        if (!keysToOmit.has(key)) newObject[key] = sampleObject[key];
    }
    return newObject;
}
