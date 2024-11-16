import { isUndefined } from "lodash-es";

declare global {
    export type Action = { ids: StudentId[], comment: string }
    export type Stage = Action[]
    export type StudentId = number;
}


const Pattern = {
    Flow: /●[^●：]*：(?<flow>[^●]*)/gm,
    Stage: /(?<actions>.*?)(\((?<comment>.*?)\))?$/
}


export class Flow {
    private _stages: Stage[] = []
    private _members: Map<StudentId, string> =
        import.meta.env.DEV
            ? new Map(Object.entries({ "10035": "憂", "10049": "甜點貓", "10073": "水憂", "10084": "露營玉", "20008": "亞子", "20020": "輪椅" }))
            : new Map()
    name: string = "總力軸";

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
        }
    }

    addMember(student: StudentDTO) {
        this._members.set(student.Id, student.Name);
    }

    toogleMember(student: StudentDTO) {
        if (this._members.has(student.Id)) this.removeMember(student.Id)
        else this.addMember(student);
    }

    removeMember(studentId: StudentId) {
        this._members.delete(studentId);
    }

    renameMember(studentId: StudentId, newName: string | undefined) {
        if (newName?.trim()) this._members.set(studentId, newName);
    }


    parse(text: string) {
        const matches = text.matchAll(Pattern.Flow)
        if (!matches) throw Error("no flow detect");
        const stages = Array.from(matches).flatMap(flow => flow.groups?.["flow"].trim().split(" → ")).filter(it => !isUndefined(it))
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
            return [{
                ids: actions.split("+").map(it => memberInverseMap.get(it.replace("EX", "")) ?? -1), comment
            }]
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
            stages: this.stages,
            members: Array.from(this.members.entries()).map(([id, name]) => ({ id, name }))
        }
        return JSON.stringify(data, null, 4); // spacing level = 2
    }
}