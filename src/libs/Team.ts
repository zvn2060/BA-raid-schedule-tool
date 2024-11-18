import {isNil, isUndefined, keyBy} from "lodash-es"
import {z} from "zod"

const Pattern = {
    Flow: /●[^●：]*：(?<flow>[^●]*)/gm,
    Stage: /(?<actions>.*?)(\((?<comment>.*?)\))?$/
};

const studentSchema = z.object({
    id: z.number(),
    name: z.string(),
    aliases: z.array(z.string()),
    squad: z.union([z.literal("striker"), z.literal("special")]),
    school: z.string(),
    star: z.number(),
    level: z.number(),
    kizuna: z.number(),
    weapon_level: z.number().nullable(),
    gear_1: z.number(),
    gear_2: z.number(),
    gear_3: z.number(),
    gear_unique: z.number().nullable(),
    skill_ex: z.number(),
    skill_n: z.number(),
    skill_p: z.number(),
    skill_sub: z.number(),
    release_hp: z.number().nullable(),
    release_atk: z.number().nullable(),
    release_heal: z.number().nullable()
});

const actionSchema = z.object({
    students: z.array(studentSchema),
    comment: z.string().optional()
});

const stageSchema = z.array(actionSchema);
const memberSchema = studentSchema.nullable();

/*
     normal       : 一般
     unrestrict   : 制約解除作戰
  */
type TeamStructure = "normal" | "unrestrict"

export class Team {
    private _stages: Stage[] = [];
    private _members: Member[];
    private membersMap: Map<StudentId, number> = new Map();
    private _structure: TeamStructure;

    static schema = z.object({
        text: z.string().nullish(),
        stages: z.array(stageSchema).nullish(),
        members: z.array(memberSchema).nullish()
    });
    text: string = "";

    constructor(structure: TeamStructure) {
        this._structure = structure;
        this._members = new Array(structure === "normal" ? 6 : 10)
    }

    static fromJson(structure: TeamStructure, json: unknown) {
        const parseResult = this.schema.safeParse(json);
        const team = new Team(structure);
        if (!parseResult.success) return team;
        const { stages, text, members } = parseResult.data;
        if (stages) team._stages = stages;
        if (members) {
            team._members = members.map(member => member ?? undefined);
            members.forEach((member, index) => {
                if (member) team.membersMap.set(member.id, index)
            })
        }
        if (text) team.text = text;

        return team;
    }

    get stages(): Readonly<Stage[]> {
        return this._stages;
    }

    get members(): Readonly<Member[]> {
        return this._members;
    }

    get struture() {
        return this._structure;
    }


    private checkStruture(student: Student) {
        const stats = { empty: 0, striker: 0, special: 0 };
        for (const member of this._members) {
            if (member) stats[member.squad]++;
            else stats.empty++;
        }
        if (stats.empty === 0) return false;
        if (this._structure === "normal") {
            if (student.squad === "striker") return stats.striker < 4;
            else return stats.special < 2
        } else {
            if (student.squad === "striker") return stats.striker < 6;
            else return stats.special < 4
        }
    }

    addMember(student: Student) {
        if (!this.checkStruture(student)) return;

        let offset: number = 0;
        if (student.squad === "special") {
            offset = this._structure === "normal" ? 4 : 6
        }

        const nextIndex = this._members.slice(offset).findIndex(it => it === undefined);
        const realIndex = offset + nextIndex;
        this.membersMap.set(student.id, realIndex);
        this._members[realIndex] = student;
    }

    toogleMember(student: Student) {
        if (this.hasMember(student.id)) this.removeMember(student.id);
        else this.addMember(student);
    }

    removeMember(studentId: StudentId) {
        const index = this.membersMap.get(studentId);
        if (index === undefined) return;
        delete this._members[index];
        this.membersMap.delete(studentId)
    }

    hasMember(studentId: StudentId) {
        return this.membersMap.has(studentId)
    }


    parse() {
        const matches = this.text.matchAll(Pattern.Flow);
        if (!matches) throw Error("no flow detect");
        const stages = Array.from(matches).flatMap(flow => flow.groups?.["flow"].trim().replaceAll(/\n+/g, " → ").split(" → ")).filter(it => !isUndefined(it));
        const memberInverseMap = keyBy(this._members.filter(member => !isNil(member)), it => it.name);
        this._stages = stages.map(stage => {
            const stageMatches = stage.match(Pattern.Stage);
            if (!stageMatches) throw Error(`Cannot parse stage: ${stage}`);
            if (!stageMatches.groups) throw Error(`stage invalid: ${stageMatches}`);
            const actions = stageMatches.groups["actions"];
            const comment: string | undefined = stageMatches.groups["comment"];
            if (actions.includes("EX"))
                return [{
                    students: actions.split("+").map(it => {
                        const name = it.replace("EX", "");
                        const student = memberInverseMap[name] ?? null;
                        return student
                    }), comment
                }];
            else
                return [{ students: [], comment: actions }]
        })
    }

    move(index: { stage: number, action: number }, direction: "previous" | "next") {
        if (index.stage === 0 && this._stages[index.stage].length === 1 && direction === "previous") return;
        if (index.stage === this._stages.length - 1 && this._stages[index.stage].length === 1 && direction === 'next') return;

        const action = this._stages.at(index.stage)?.at(index.action);
        if (!action) return;
        this._stages[index.stage].splice(index.action, 1);
        const empted = this._stages[index.stage].length === 0;
        if (direction === "previous") {
            if (index.stage === 0) this._stages.unshift([action]);
            else if (empted) this._stages[index.stage - 1].push(action);
            else this._stages.splice(index.stage, 0, [action])
        } else {
            if (index.stage === this._stages.length - 1) this._stages.push([action]);
            else if (empted) this._stages[index.stage + 1].unshift(action);
            else this._stages.splice(index.stage + 1, 0, [action])
        }
        if (empted) this._stages.splice(index.stage, 1)
    }

    toObject() {
        return {
            text: this.text,
            stages: this.stages,
            members: this.members
        }
    }
}