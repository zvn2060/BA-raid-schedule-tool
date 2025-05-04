export { };
declare global {
  export type Action = { actor: Member; target?: Member };
  export type Stage = { actions: Action[]; comment?: string };
  export type StudentId = number;
  export type Member = StudentId | undefined;
  export type Student = {
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
  export type TeamStructure = "normal" | "unrestrict";
  export interface Serializable<T> {
    toObject(): T;
  }

  export type BattleObject = ReturnType<Battle["toObject"]>;
  export type TeamObject = ReturnType<Team["toObject"]>;
}
