
// ttl to ms parser
// ttl format examples: 7d, 12h, 30m, 45s
export function parseTtlToMs(ttl) {
    const regex = /^(\d+)([dhms])$/;
    const match = ttl.match(regex);
    if (!match) {
        throw new Error('Invalid TTL format');
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers = {
        d: 24 * 60 * 60 * 1000,
        h: 60 * 60 * 1000,
        m: 60 * 1000,
        s: 1000,
    };
    return value * multipliers[unit];
}

// add ms to current time and return the resulting timestamp
export function addMsToCurrentTime(ms) {
    return Date.now() + ms;
}
