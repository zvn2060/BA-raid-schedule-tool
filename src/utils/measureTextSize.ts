import Konva from "konva";

export function measureTextSize(text: string, config: Omit<Konva.TextConfig, "fontSize" | "wrap">) {
  if (!text.length) return 12;
  // fontSize * length * coeff = width
  // coeff = width / fontSize / length
  // width / coeff = fontSize;

  const instance = new Konva.Text({ fontSize: 64, wrap: "none", ...config });
  const width = instance.measureSize(text).width;
  const coeff = width / (text.length << 6);
  return Math.min(Math.floor(config.width / (text.length * coeff)), config.height);
}
