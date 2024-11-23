import { z } from "zod";
import { Team } from "./Team";


export enum BattleMode {
    Raid = "總力戰",
    Elimination = "大決戰",
    Test = "綜合戰術考試",
    Unrestrict = "制約解除"
}

export const BattleModeOptions = Object.values(BattleMode);

const chineseNum = {
    1: "一",
    2: "二",
    3: "三",
    4: "四",
    5: "五",
    6: "六",
    7: "七",
    8: "八",
    9: "九",
    10: "十",
} as Record<number, string>;

function teamIndexToChinese(index: number): string {
    return chineseNum[index + 1] ?? index;
}

export class Battle implements Serializable<z.infer<typeof Battle.schema>> {
    name: string = "總力軸";
    title: string = ""
    comment: string = "※註解";
    score: string = "0"
    private _teams: Team[] = []
    mode: BattleMode = BattleMode.Raid;
    static schema = z.object({
        name: z.string().nullish(),
        comment: z.string().nullish(),
        mode: z.nativeEnum(BattleMode).nullish(),
        teams: Team.schema.array().nullish()
    })

    get teams(): Readonly<Team[]> {
        return this._teams;
    }

    constructor(battleProps?: Omit<PartialField<Battle>, "teams"> & { teams?: Pick<PartialField<Team>, "members" | "text">[] }) {
        if (battleProps?.name) this.name = battleProps.name;
        if (battleProps?.comment) this.comment = battleProps.comment;
        if (battleProps?.mode) this.mode = battleProps.mode;
        const struture = this.teamStruture;
        if (battleProps?.teams) this._teams = battleProps.teams.map(team => new Team(struture, team));
        this.title = `蔚藍檔案 ${this.mode}`
    }


    private get teamStruture() {
        return this.mode === BattleMode.Unrestrict ? "unrestrict" : "normal"
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

    get description() {
        if (!this._teams.length) return "";
        const teamCount = this._teams.length;
        const isMultipleTeams = teamCount > 1;
        return [
            "<簡述>",
            "",
            isMultipleTeams ? "<時間軸>\n" : null,
            isMultipleTeams
                ? this._teams.map((team, index) => `${teamIndexToChinese(index)}隊：\n${team.description}`).join("\n\n")
                : `隊伍：\n${this._teams[0].description}`,
            "",
            "文字敘述重要時間點：",
            "",
            "※先說凹點：",
            "<凹點>",
            "",
            isMultipleTeams
                ? this._teams.map((team, index) => `${teamIndexToChinese(index)}隊：\n${team.text}`).join("\n\n")
                : this._teams[0].text
        ].filter(it => it !== null).join("\n");
    }
}