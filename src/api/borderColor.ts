const colors = ["red", "blue", "green", "orange", "yellow"]

export function useBorderColor() {

    const memory = new Map();
    let pointer = 0;
    function getColor(id: string) {
        let cache = memory.get(id);
        if (!cache) {
            cache = colors[pointer]
            memory.set(id, cache)
            pointer = (pointer + 1) % colors.length;
        }
        return cache;
    }


    return { getColor }
}