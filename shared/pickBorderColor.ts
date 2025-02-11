const colors = ["red", "blue", "green", "orange", "yellow"]

export function pickBorderColor(index?: number) {
    return (index === undefined || index < 0)
        ? "black"
        : colors[index % colors.length]
}