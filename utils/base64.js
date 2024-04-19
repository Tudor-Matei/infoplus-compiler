export function decode(string) {
    return Buffer.from(string, "base64").toString("utf8");
}

export function encode(string) {
    return Buffer.from(string).toString("base64");
}
