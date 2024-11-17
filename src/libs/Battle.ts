import { isNil, isUndefined, keyBy } from "lodash-es";

declare global {
    export type Action = { students: Student[], comment: string }
    export type Stage = Action[]
    export type StudentId = number;
    export type Student = {
        readonly id: StudentId;
        readonly name: string;
        alias: string;
        squad: "striker" | "special";
        school: string,
        "star": number,
        "level": number,
        "weapon_level": number | null,
        "gear_1": number,
        "gear_2": number,
        "gear_3": number,
        "gear_unique": number | null,
        "skill_ex": number,
        "skill_n": number,
        "skill_p": number,
        "skill_sub": number,
        "release_hp": number | null,
        "release_atk": number | null,
        "release_heal": number | null
    }

    export type Member = Student | undefined;
}


const Pattern = {
    Flow: /●[^●：]*：(?<flow>[^●]*)/gm,
    Stage: /(?<actions>.*?)(\((?<comment>.*?)\))?$/
}


export class Team {
    private _stages: Stage[] = []
    private _members: Member[] = new Array(6)
    private membersMap: Map<StudentId, number> = new Map()
    text: string = ""

    constructor(data?: object) {
        if (data) {
            // if ("members" in data) this.membersMap = new Map((data.members as Array<{ id: number, name: string }>).map(({ id, name }) => [id, name]));
            if ("stages" in data) this._stages = data.stages as Stage[];
            if ("text" in data) this.text = data.text as string;
        }
    }

    get stages(): Readonly<Stage[]> {
        return this._stages;
    }

    get members(): Readonly<Member[]> {
        return this._members;
    }


    addMember(student: Student) {
        const nextIndex = this._members.findIndex(it => it === undefined)
        if (nextIndex === -1) return;
        this.membersMap.set(student.id, nextIndex);
        this._members[nextIndex] = student;
    }

    toogleMember(student: Student) {
        if (this.hasMember(student.id)) this.removeMember(student.id)
        else this.addMember(student);
    }

    removeMember(studentId: StudentId) {
        const index = this.membersMap.get(studentId)
        if (index === undefined) return;
        delete this._members[index];
        this.membersMap.delete(studentId)
    }

    hasMember(studentId: StudentId) {
        return this.membersMap.has(studentId)
    }


    parse() {
        const matches = this.text.matchAll(Pattern.Flow)
        if (!matches) throw Error("no flow detect");
        const stages = Array.from(matches).flatMap(flow => flow.groups?.["flow"].trim().replaceAll(/\n+/g, " → ").split(" → ")).filter(it => !isUndefined(it))
        const memberInverseMap = keyBy(this._members.filter(member => !isNil(member)), it => it.name)
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
                        const student = memberInverseMap[name] ?? null
                        return student
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

    toObject() {
        return {
            text: this.text,
            stages: this.stages,
            members: Array.from(this.members.entries()).map(([id, name]) => ({ id, name }))
        }
    }
}


export class Battle {
    name: string = "總力軸";
    private _teams: Team[] = []

    get teams(): Readonly<Team[]> {
        return this._teams;
    }

    constructor(data?: any) {
        if (data) {
            if ("name" in data) this.name = data.name as string;
            if ("teams" in data) this._teams = (data.teams as Team[]).map(team => new Team(team))
        }
    }

    addTeam() {
        this._teams.push(new Team())
    }

    deleteTeam(index: number) {
        this._teams.splice(index, 1)
    }

    toObject() {
        return {
            name: this.name,
            teams: this.teams.map(it => it.toObject()),
        }
    }
}