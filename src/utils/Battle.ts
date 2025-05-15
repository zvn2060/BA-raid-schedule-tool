export enum BattleMode {
  Raid = "總力戰",
  Elimination = "大決戰",
  Test = "綜合戰術考試",
  JpRaid = "日服總力戰",
  Unrestrict = "制約解除",
}

export const BattleModeOptions = Object.values(BattleMode);
type BattleProps = Partial<{
  name: string | null;
  title: string | null;
  comment: string | null;
  score: string | null;
  mode: BattleMode | null;
}>;

export class Battle {
  name: string = "總力軸";
  title: string = "";
  comment: string = "※註解";
  score: string = "0";
  mode: BattleMode = BattleMode.Raid;

  constructor(battleProps?: BattleProps) {
    if (battleProps?.name) this.name = battleProps.name;
    if (battleProps?.comment) this.comment = battleProps.comment;
    if (battleProps?.score) this.score = battleProps.score;
    if (battleProps?.mode) this.mode = battleProps.mode;
    this.title = battleProps?.title ?? `蔚藍檔案 ${this.mode}`;
  }

  get teamStruture() {
    return this.mode === BattleMode.Unrestrict ? "unrestrict" : "normal";
  }

  toObject() {
    return {
      name: this.name,
      mode: this.mode,
      score: this.score,
      comment: this.comment,
      title: this.title,
    };
  }
}
