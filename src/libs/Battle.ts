import { JsonObject, } from "type-fest";
import { z } from "zod";
import { Team } from "./Team";
declare global {
    export type Action = { members: Member[], comment?: string }
    export type Stage = Action[]
    export type StudentId = number;
    export type Student = {
        readonly id: StudentId;
        readonly name: string;
        aliases: string[];
        squad: "striker" | "special";
        school: string,
        star: number,
        level: number,
        kizuna: number
        weapon_level: number | null,
        gear_1: number,
        gear_2: number,
        gear_3: number,
        gear_unique: number | null,
        skill_ex: number,
        skill_n: number,
        skill_p: number,
        skill_sub: number,
        release_hp: number | null,
        release_atk: number | null,
        release_heal: number | null
    }

    export type Member = Student | null;
}


export const BattleEvent = {
    Raid: "總力戰",
    Elimination: "大決戰",
    Test: "綜合戰術考試",
    Unrestrict: "制約解除"
} as const;

export const BattleEventOptions = Object.values(BattleEvent);

type BattleEvent = (typeof BattleEvent)[(keyof typeof BattleEvent)];

export class Battle {
    name: string = "總力軸";
    private _teams: Team[] = []
    mode: BattleEvent = BattleEvent.Raid;
    static schema = z.object({
        name: z.string().nullish(),
        mode: z.nativeEnum(BattleEvent).nullish(),
        teams: z.unknown().array().nullish()
    })
    get teams(): Readonly<Team[]> {
        return this._teams;
    }

    constructor() { }

    static fromJson(json: JsonObject) {
        const parseResult = this.schema.safeParse(json)
        const battle = new Battle();
        if (!parseResult.success) return battle;
        const { mode, name, teams } = parseResult.data;
        if (name) battle.name = name;
        if (mode) battle.mode = mode;
        const struture = battle.teamStruture;
        if (teams) battle._teams = teams.map(team => Team.fromJson(struture, team));

        return battle;
    }

    private get teamStruture() {
        return this.mode === BattleEvent.Unrestrict ? "unrestrict" : "normal"
    }

    addTeam() {
        this._teams.push(new Team(this.teamStruture))
    }

    deleteTeam(index: number) {
        this._teams.splice(index, 1)
    }

    toObject() {
        return {
            name: this.name,
            teams: this.teams.map(it => it.toObject()),
            mode: this.mode
        }
    }
}