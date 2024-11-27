import Konva from "konva";
import { MaybeRefOrGetter } from "vue";

export function useAutoSizeText(text: MaybeRefOrGetter<string>, config: Omit<Konva.TextConfig, "fontSize" | "wrap">) {
    const instance = new Konva.Text({ fontSize: 64, wrap: "none", ...config })
    // fontSize * length * coeff = width
    // coeff = width / fontSize / length
    // width / coeff = fontSize;
    const fontSize = computed(() => {
        const str = resolveUnref(text);
        if (!str.length) return 12;
        const width = instance.measureSize(str).width
        const coeff = width / (str.length << 6)
        return Math.min(Math.floor(config.width / (str.length * coeff)), config.height)
    })

    return fontSize;
}