import { isNil } from "lodash-es";
import { z } from "zod";

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


const Pattern = {
    Action: /(?<student1>[^()EX]+?)EX(?<student2>[^()EX]+)?(\((?<comment>[^()]+)\))?/
};


/*
     normal       : 一般
     unrestrict   : 制約解除作戰
  */
type TeamStructure = "normal" | "unrestrict"

export class Team implements Serializable<z.infer<typeof Team.schema>> {
    private _stages: Stage[] = [];
    private _members: Member[];
    private membersMap: Map<StudentId, number> = new Map();
    private _structure: TeamStructure;

    static schema = z.object({
        text: z.string().nullish(),
        members: z.array(z.number().nullable()).nullish(),
        stages: z.object({ members: z.number().nullable().array(), comment: z.string().optional() }).array().array().nullish()
    });

    text: string = "";

    constructor(structure: TeamStructure, teamProps?: PartialField<Team>) {
        this._structure = structure;
        this._members = teamProps?.members
            ? teamProps.members.map(member => member ?? null)
            : new Array(structure === "normal" ? 6 : 10).fill(null)

        this._members.forEach((member, index) => {
            if (member) this.membersMap.set(member.id, index)
        })

        if (teamProps?.text) this.text = teamProps.text;
        if (teamProps?.stages) this._stages = teamProps.stages as Stage[];
        else this.parse()
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

    // FLOW     := STAGE [ → FLOW]
    // STAGE    := ACTION [+STAGE] | COMMENT
    // ACTION   := STUDENTEX[STUDENT][(COMMENT)]
    // STUDENT  := [^EX\s]
    // COMMENT  := [^()]
    parse() {
        if (!this.text) return;
        const stages = this.text.split(/\n+/).flatMap(line => line.split(" → "));
        const searchStudentByNameMap = new Map(
            this._members
                .filter(member => !isNil(member))
                .flatMap(student => [...student.aliases, student.name].map(key => [key, student]))
        );
        const aggregateStage = new Array<Stage>()
        stages.forEach(stage => {
            const members = new Array<Member>()
            const comments = new Array<string>()
            stage.split("+").forEach(action => {
                const match = action.match(Pattern.Action)
                if (match?.groups) {
                    const { student1, student2, comment } = match.groups;
                    members.push(searchStudentByNameMap.get(student1) ?? null)
                    if (student2) members.push(searchStudentByNameMap.get(student2) ?? null)
                    if (comment) comments.push(comment);
                } else {
                    comments.push(action)
                }
            })

            const action = { members, comment: comments.join(", ") };
            if (action.comment || aggregateStage.length === 0) {
                const previousAction = aggregateStage.at(-1)?.at(-1);
                if (previousAction) previousAction.comment = previousAction.comment || "順著費用放"
                aggregateStage.push([action])
            } else aggregateStage.at(-1)?.push(action)
        })
        this._stages = aggregateStage;
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
            members: this.members.map(it => it?.id ?? null),
            stages: this.stages.map(stage =>
                stage.map(({ members, ...otherActionData }) =>
                    ({ ...otherActionData, members: members.map(member => member?.id ?? null) })
                )
            )
        }
    }
}