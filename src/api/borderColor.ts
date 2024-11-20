const colors = ["red", "blue", "green", "orange", "yellow"]

export function useBorderColor() {
    function getColor(index: number) {
        return index < 0 ? "black" : colors[index % colors.length]
    }

    return { getColor }
}