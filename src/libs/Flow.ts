import { isUndefined } from "lodash-es";

declare global {
    export type Action = { students: Student[], comment: string }
    export type Stage = Action[]
    export type StudentId = number;
    export type Student = { id: StudentId, name: string };
}


const Pattern = {
    Flow: /●[^●：]*：(?<flow>[^●]*)/gm,
    Stage: /(?<actions>.*?)(\((?<comment>.*?)\))?$/
}


export class Flow {
    private _stages: Stage[] = []
    private _members: Map<StudentId, string> = new Map()
    name: string = "總力軸";
    text: string = ""

    get stages(): Readonly<Stage[]> {
        return this._stages;
    }

    get members(): Readonly<Map<StudentId, string>> {
        return this._members;
    }

    constructor(data?: object) {
        if (data) {
            if ("name" in data) this.name = data.name as string;
            if ("members" in data) this._members = new Map((data.members as Array<{ id: number, name: string }>).map(({ id, name }) => [id, name]));
            if ("stages" in data) this._stages = data.stages as Stage[];
            if ("text" in data) this.text = data.text as string;
        }
    }

    addMember(student: Student) {
        this._members.set(student.id, student.name);
    }

    toogleMember(student: Student) {
        if (this._members.has(student.id)) this.removeMember(student.id)
        else this.addMember(student);
    }

    removeMember(studentId: StudentId) {
        this._members.delete(studentId);
    }

    renameMember(studentId: StudentId, newName: string | undefined) {
        if (newName?.trim()) this._members.set(studentId, newName);
    }


    parse() {
        const matches = this.text.matchAll(Pattern.Flow)
        if (!matches) throw Error("no flow detect");
        const stages = Array.from(matches).flatMap(flow => flow.groups?.["flow"].trim().replaceAll(/\n+/g, " → ").split(" → ")).filter(it => !isUndefined(it))
        console.log(stages)
        const memberInverseMap = new Map(
            Array
                .from(this._members.entries())
                .map(([key, value]) => [value, parseInt(`${key}`)])
        )

        this._stages = stages.map(stage => {
            const stageMatches = stage.match(Pattern.Stage)
            if (!stageMatches) throw Error(`Cannot parse stage: ${stage}`)
            if (!stageMatches.groups) throw Error(`stage invalid: ${stageMatches}`)
            const actions = stageMatches.groups["actions"];
            const comment: string | undefined = stageMatches.groups["comment"];
            if (actions.includes("EX"))
                return [{
                    students: actions.split("+").map(it => {
                        const name = it.replace("EX", "");
                        const id = memberInverseMap.get(name) ?? -1
                        return { id, name }
                    }), comment
                }]
            else
                return [{ students: [], comment: actions }]
        })
    }

    move(index: { stage: number, action: number }, direction: "previous" | "next") {
        if (index.stage === 0 && this._stages[index.stage].length === 1 && direction === "previous") return;
        if (index.stage === this._stages.length - 1 && this._stages[index.stage].length === 1 && direction === 'next') return;

        const action = this._stages.at(index.stage)?.at(index.action);
        if (!action) return;
        this._stages[index.stage].splice(index.action, 1)
        const empted = this._stages[index.stage].length === 0;
        if (direction === "previous") {
            if (index.stage === 0) this._stages.unshift([action])
            else if (empted) this._stages[index.stage - 1].push(action)
            else this._stages.splice(index.stage, 0, [action])
        } else {
            if (index.stage === this._stages.length - 1) this._stages.push([action])
            else if (empted) this._stages[index.stage + 1].unshift(action)
            else this._stages.splice(index.stage + 1, 0, [action])
        }
        if (empted) this._stages.splice(index.stage, 1)
    }

    serialize() {
        const data = {
            name: this.name,
            text: this.text,
            stages: this.stages,
            members: Array.from(this.members.entries()).map(([id, name]) => ({ id, name }))
        }
        return JSON.stringify(data, null, 4); // spacing level = 2
    }
}