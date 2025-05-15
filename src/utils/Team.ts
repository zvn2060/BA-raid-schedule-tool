import { compact } from "lodash-es";

function skillTranscript(level: number) {
  return level === 10 ? "M" : `${level}`;
}

type TeamProps = Partial<{ text: string | null; members: Member[] | null }>;

export class Team {
  private _members: Member[];
  private membersMap: Map<StudentId, number> = new Map();
  private readonly _structure: TeamStructure;
  private stat: Stat = { special: 0, striker: 0 };

  stages: Stage[] = [];
  text: string = "";

  constructor(structure: TeamStructure, teamProps?: TeamProps) {
    this._structure = structure;
    if (teamProps?.text) this.text = teamProps.text;
    if (teamProps?.members) {
      const bound = this._structure === "normal" ? 4 : 6;
      let i = 0;
      for (; i < bound; i++) {
        const studentId = teamProps.members[i];
        if (studentId === undefined) continue;
        this.membersMap.set(studentId, i);
        this.stat.striker++;
      }
      for (; i < teamProps.members.length; i++) {
        const studentId = teamProps.members[i];
        if (studentId === undefined) continue;
        this.membersMap.set(studentId, i);
        this.stat.special++;
      }
      this._members = teamProps?.members;
    } else {
      this._members = new Array(structure === "normal" ? 6 : 10).fill(undefined);
    }
  }

  get members(): Readonly<Member[]> {
    return this._members;
  }

  get struture() {
    return this._structure;
  }

  private checkStruture(student: Student) {
    if (this._structure === "normal") {
      if (student.squad === "striker") return this.stat.striker < 4;
      else return this.stat.special < 2;
    } else {
      if (student.squad === "striker") return this.stat.striker < 6;
      else return this.stat.special < 4;
    }
  }

  toogleMember(student: Student) {
    if (this.hasMember(student.id)) this.removeMember(student.id);
    else this.addMember(student);
  }

  addMember(student: Student) {
    if (!this.checkStruture(student)) return;
    this.stat[student.squad]++;
    const bound = this._structure === "normal" ? 4 : 6;
    let i = student.squad === "striker" ? 0 : bound;
    const max = student.squad === "striker" ? bound : this._members.length;
    for (; i < max; i++) {
      if (this._members[i] !== undefined) continue;
      this.membersMap.set(student.id, i);
      this._members[i] = student.id;
      break;
    }
  }

  removeMember(studentId: StudentId) {
    const index = this.membersMap.get(studentId);
    if (index === undefined || this._members.length === this.membersMap.size) return;
    if (this._structure === "normal") this.stat[index < 4 ? "striker" : "special"]--;
    else this.stat[index < 6 ? "striker" : "special"]--;
    this._members[index] = undefined;
    this.membersMap.delete(studentId);
  }

  hasMember(studentId: StudentId) {
    return this.membersMap.has(studentId);
  }

  moveStage(index: number, pop: "front" | "back") {
    if (index === 0 && this.stages[index].actions.length === 1 && pop === "front") return;
    else if (index === this.stages.length - 1 && this.stages[index].actions.length === 1 && pop === "back") return;
    const action = this.stages[index].actions[pop === "front" ? "shift" : "pop"]();
    if (action === undefined) return;
    const empted = this.stages[index].actions.length === 0;
    if (pop === "front") {
      if (index === 0) this.stages.unshift({ actions: [action] });
      else this.stages[index - 1].actions.push(action);
    } else {
      if (index === this.stages.length - 1) this.stages.push({ actions: [action] });
      else this.stages[index + 1].actions.unshift(action);
    }
    if (empted) {
      const [stage] = this.stages.splice(index, 1);
      if (pop === "front") {
        const appendStage = this.stages.at(index - 1);
        if (appendStage) appendStage.comment = joinComment(appendStage.comment, stage?.comment);
      } else {
        const appendStage = this.stages.at(index);
        if (appendStage) appendStage.comment = joinComment(stage?.comment, appendStage.comment);
      }
    }
  }

  insertStage(index: number, direction: "front" | "back") {
    this.stages.splice(direction === "front" ? index : index + 1, 0, { actions: [], comment: "新組" });
  }

  deleteStage(index: number) {
    this.stages.splice(index, 1);
  }

  toObject() {
    return {
      text: this.text,
      members: this._members,
      stages: this.stages,
    };
  }

  generateDescription(studentMap: Record<StudentId, Student>) {
    return this.members.map((id) => {
      if (!id) return "空格";
      const member = studentMap[id];
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
        releases.some(it => it) ? releases.join(" ") : null,
      ]).join(" ");
    }).join("\n");
  }
}
