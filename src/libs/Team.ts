import { compact, isNil } from "lodash-es";
import { z } from "zod";

declare global {
    export type Action = { actor: StudentId | null, target?: StudentId | null };
    export type Stage = { actions: Action[], comment?: string }
    export type StudentId = number;
    export type Student = {
        readonly id: StudentId;
        readonly name: string;
        image?: File
        keywords: string[];
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


const Pattern = {
    Action: /(?<student1>[^()EX]+?)EX(?<student2>[^()EX]+)?(\((?<comment>[^()]+)\))?/
};


/*
     normal       : 一般
     unrestrict   : 制約解除作戰
  */
type TeamStructure = "normal" | "unrestrict"

function skillTranscript(level: number) {
    return level === 10 ? 'M' : `${level}`;
}


export class Team implements Serializable<z.infer<typeof Team.schema>> {
    private _stages: Stage[] = [];
    private _members: Member[];
    private _skillTargetMap: Map<StudentId, number> = new Map();
    private membersMap: Map<StudentId, number> = new Map();
    private readonly _structure: TeamStructure;

    static schema = z.object({
        text: z.string().nullish(),
        members: z.array(z.number().nullable()).nullish(),
        stages: z.object({
            actions: z.object({
                actor: z.number().nullable(),
                target: z.number().nullish()
            }).array(),
            comment: z.string().optional()
        }).array().nullish(),
        skillTargetMap: z.tuple([z.number(), z.number()]).array().nullish(),
    });

    text: string = "";

    constructor(structure: TeamStructure, teamProps?: PartialField<Team>) {
        this._structure = structure;
        this._members = teamProps?.members
            ? teamProps.members.map(member => member ?? null)
            : new Array(structure === "normal" ? 6 : 10).fill(null);

        this._members.forEach((member, index) => {
            if (member) this.membersMap.set(member.id, index)
        });

        if (teamProps?.text) this.text = teamProps.text;
        if (teamProps?.stages) {
            this._stages = teamProps.stages as Stage[];
            if (teamProps.skillTargetMap) this._skillTargetMap = new Map(teamProps.skillTargetMap);
        } else this.parse()
    }


    get stages(): Readonly<Stage[]> {
        return this._stages;
    }

    get skillTargetMap() {
        return this._skillTargetMap
    }

    get members(): Readonly<Member[]> {
        return this._members;
    }

    getMember(studentId: StudentId | null): Member {
        if (studentId === null) return null;
        const index = this.membersMap.get(studentId);
        return index === undefined ? null : this._members[index];
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

    private registerSkillTarget(studentId: StudentId) {
        if (this._skillTargetMap.has(studentId)) return;
        this._skillTargetMap.set(studentId, this._skillTargetMap.size);
    }

    addMember(student: Student) {
        if (!this.checkStruture(student)) return;
        let offset: number = 0;
        if (student.squad === "special") {
            offset = this._structure === "normal" ? 4 : 6
        }

        const nextIndex = this._members.slice(offset).findIndex(it => it === null);
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
        this._members[index] = null;
        this.membersMap.delete(studentId)
    }

    hasMember(studentId: StudentId) {
        return this.membersMap.has(studentId)
    }

    private static joinComment(commentA: string | undefined, commentB: string | undefined): string {
        return [commentA, commentB].filter(it => Boolean(it)).join("，")
    }

    // FLOW     := STAGE [ → FLOW]
    // STAGE    := ACTION [+STAGE] | COMMENT
    // ACTION   := STUDENTEX[STUDENT][(COMMENT)]
    // STUDENT  := [^EX\s]
    // COMMENT  := [^()]
    parse() {
        if (!this.text) return;
        const stageTexts = this.text.split(/\n+/).filter(it => it.includes("→")).flatMap(line => line.split(" → "));
        const searchStudentByNameMap = new Map(
            this._members
                .filter(member => !isNil(member))
                .flatMap(student => [...student.aliases, student.name].map(key => [key, student]))
        );
        const aggregateStage = new Array<Stage>();
        this.skillTargetMap.clear();
        stageTexts.forEach(stageText => {
            const actions = new Array<Action>();
            const comments = new Array<string>();
            stageText.split("+").forEach(action => {
                const match = action.match(Pattern.Action);
                if (match?.groups) {
                    const { student1, student2, comment } = match.groups;
                    const action: Action = { actor: searchStudentByNameMap.get(student1)?.id ?? null };
                    if (student2) {
                        action.target = searchStudentByNameMap.get(student2)?.id ?? null;
                        if (action.target) this.registerSkillTarget(action.target);
                    }
                    actions.push(action);
                    if (comment) comments.push(comment);
                } else {
                    comments.push(action)
                }
            });

            const stage = { actions, comment: comments.join(", ") };
            const previous = aggregateStage.at(-1)!;
            if (stage.comment || aggregateStage.length === 0) {
                if (previous) previous.comment = previous.comment || "順著費用放";
                aggregateStage.push(stage)
            } else {
                previous.comment = Team.joinComment(previous.comment, stage.comment);
                previous.actions = [...previous.actions, ...stage.actions];
            }
        });
        this._stages = aggregateStage;
    }

    moveStage(index: number, pop: "front" | "back") {
        if (index === 0 && this._stages[index].actions.length === 1 && pop === "front") return;
        else if (index === this._stages.length - 1 && this._stages[index].actions.length === 1 && pop === 'back') return;
        const action = this._stages[index].actions[pop === "front" ? "shift" : "pop"]();
        if (action === undefined) return;
        const empted = this._stages[index].actions.length === 0;
        if (pop === "front") {
            if (index === 0) this._stages.unshift({ actions: [action] });
            else this._stages[index - 1].actions.push(action);
        } else {
            if (index === this._stages.length - 1) this._stages.push({ actions: [action] });
            else this._stages[index + 1].actions.unshift(action)
        }
        if (empted) {
            const [stage] = this._stages.splice(index, 1);
            if (pop === "front") {
                const appendStage = this._stages.at(index - 1);
                if (appendStage) appendStage.comment = Team.joinComment(appendStage.comment, stage?.comment);
            } else {
                const appendStage = this._stages.at(index);
                if (appendStage) appendStage.comment = Team.joinComment(stage?.comment, appendStage.comment);
            }
        }
    }

    insertStage(index: number, direction: "front" | "back") {
        this._stages.splice(direction === "front" ? index : index + 1, 0, { actions: [], comment: "新組" })
    }

    deleteStage(index: number) {
        this._stages.splice(index, 1)
    }

    toObject() {
        return {
            text: this.text,
            members: this.members.map(it => it?.id ?? null),
            stages: this._stages,
            skillTargetMap: Array.from(this.skillTargetMap.entries()),
        }
    }


    get description() {
        return this.members.map(member => {
            if (!member) return "空格";
            const releases = [member.release_hp ?? 0, member.release_atk ?? 0, member.release_heal ?? 0];
            return compact([
                member.name.replace("（", "(").replace("）", ")"),
                `☆${Math.min(member.star, 5)}`,
                `LV${member.level}`,
                `${member.skill_ex}${skillTranscript(member.skill_n)}${skillTranscript(member.skill_p)}${skillTranscript(member.skill_sub)}`,
                member.star > 5 ? `固有${member.star - 5}` : null,
                member.weapon_level,
                `T${member.gear_1}T${member.gear_2}T${member.gear_3}`,
                member.gear_unique ? `愛用品T${member.gear_unique}` : null,
                releases.some(it => it) ? releases.join(" ") : null
            ]).join(" ")
        }).join("\n");
    }
}