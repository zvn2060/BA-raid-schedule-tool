export function hashCode(str: string) {
    const len = str.length;
    let hash = 0;

    for (let i = 0; i < len; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash &= hash; // Convert to 32bit integer
    }

    return hash;
};
