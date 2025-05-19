type MeasureSizeContext = {
  width: number;
  height: number;
  fontStyle?: string;
  fontVariant?: string;
  fontFamily?: string;
};

export function measureTextSize(text: string, config: MeasureSizeContext) {
  // fontSize * length * coeff = width
  // coeff = width / fontSize / length
  // width / coeff = fontSize;
  if (!text.trim()) return 12;
  const context = new OffscreenCanvas(config.width, config.height).getContext("2d");
  if (!context) return 12;
  context.save();
  context.font = [config.fontStyle, config.fontVariant, "64px", config.fontFamily].filter(Boolean).join(" ");
  const { width } = context.measureText(text);
  context.restore();
  const coeff = width / (text.length << 6);
  return Math.min(Math.floor(config.width / (text.length * coeff)), config.height);
}
