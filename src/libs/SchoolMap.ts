const schoolMap = {
    "Gehenna": "格黑娜",
    "Millennium": "千年",
    "Trinity": "三一",
    "Abydos": "阿拜多斯",
    "Shanhaijing": "山海經",
    "Hyakkiyako": "百鬼夜行",
    "RedWinter": "赤冬",
    "Valkyrie": "女武神",
    "ETC": "其他",
    "SRT": "SRT",
    "Arius": "奧利斯",
    "Tokiwadai": "其他",
    "Sakugawa": "其他"
} as Record<string, string>

export function mapSchool(text: string) {
    return schoolMap[text] ?? text;
}