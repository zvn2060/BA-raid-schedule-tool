export { };
declare global {
  type Action = { actor: Member; target?: Member };
  type Stage = { actions: Action[]; comment?: string };
  type StudentId = number;
  type StudentMap = Map<StudentId, Student>;
  type Member = StudentId | null;
  type Stat = { special: number; striker: number };
  type Student = {
    readonly id: StudentId;
    readonly name: string;
    prefer_name?: string;
    image?: File;
    keywords: string[];
    aliases: string[];
    squad: "striker" | "special";
    school: string;
    star: number;
    level: number;
    kizuna: number;
    weapon_level: number | null;
    gear_1: number;
    gear_2: number;
    gear_3: number;
    gear_unique: number | null;
    skill_ex: number;
    skill_n: number;
    skill_p: number;
    skill_sub: number;
    release_hp: number | null;
    release_atk: number | null;
    release_heal: number | null;
  };

  /**
   * @description
   * normal       : 一般
   *
   * unrestrict   : 制約解除作戰
   */
  type TeamStructure = "normal" | "unrestrict";
  interface Serializable<T> {
    toObject(): T;
  }

  export type BattleObject = ReturnType<Battle["toObject"]>;
  export type TeamObject = ReturnType<Team["toObject"]>;
}
