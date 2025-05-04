import { compact, isNil } from "lodash-es";
import { z } from "zod";

const Pattern = {
  Action: /(?<student1>[^\s()]+)(\((?<comment>[^()]+)\))?/,
};

function skillTranscript(level: number) {
  return level === 10 ? "M" : `${level}`;
}

export class Team {
  private _stages: Stage[] = [];
  private _members: Member[];
  private membersMap: Map<StudentId, number> = new Map();
  private readonly _structure: TeamStructure;
  private stats = { special: 0, striker: 0, empty: 0 };

  text: string = "";

  static schema = z.object({
    text: z.string().nullish(),
    members: z.array(z.number().nullable().transform(it => it ?? undefined)).nullish(),
    stages: z.object({
      actions: z.object({
        actor: z.number().nullish(),
        target: z.number().nullish(),
      }).array(),
      comment: z.string().optional(),
    }).array().nullish(),
    skillTargetMap: z.tuple([z.number(), z.number()]).array().nullish(),
  });

  constructor(
    structure: TeamStructure,
    supporterCount: number = 0,
    strikerCount: number = 0,
    teamProps?: z.infer<typeof Team.schema>,
  ) {
    this._structure = structure;
    this.stats.special = supporterCount;
    this.stats.striker = strikerCount;
    this._members = teamProps?.members ?? new Array(structure === "normal" ? 6 : 10).fill(undefined);
    this._members.forEach((member, index) => {
      if (member) this.membersMap.set(member, index);
      else this.stats.empty++;
    });
    if (teamProps?.text) this.text = teamProps.text;
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
    if (this.stats.empty === 0) return false;
    if (this._structure === "normal") {
      if (student.squad === "striker") return this.stats.striker < 4;
      else return this.stats.special < 2;
    } else {
      if (student.squad === "striker") return this.stats.striker < 6;
      else return this.stats.special < 4;
    }
  }

  toogleMember(student: Student) {
    if (this.hasMember(student.id)) this.removeMember(student.id);
    else this.addMember(student);
  }

  addMember(student: Student) {
    if (!this.checkStruture(student)) return;
    this.stats[student.squad]++;
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
    if (index === undefined) return;
    this.stats["empty"]++;
    if (this._structure === "normal") this.stats[index < 4 ? "striker" : "special"]--;
    else this.stats[index < 6 ? "striker" : "special"]--;
    this._members[index] = undefined;
    this.membersMap.delete(studentId);
  }

  hasMember(studentId: StudentId) {
    return this.membersMap.has(studentId);
  }

  private static joinComment(commentA: string | undefined, commentB: string | undefined): string {
    return [commentA, commentB].filter(it => Boolean(it)).join("，");
  }

  // FLOW     := STAGE [ → FLOW]
  // STAGE    := ACTION [+STAGE] | COMMENT
  // ACTION   := STUDENT[(COMMENT)]
  // STUDENT  := [^\s]
  // COMMENT  := [^()]
  parse(studentMap: Record<StudentId, Student>) {
    if (!this.text) return;
    const stageTexts = this.text.split(/\n+/).filter(it => it.trim().length).flatMap(line => line.split(" → "));
    const searchStudentByNameMap = new Map(
      this._members
        .filter(member => !isNil(member))
        .map(member => studentMap[member])
        .flatMap(student => [...student.aliases, student.name].map(key => [key, student])),
    );
    const aggregateStage = new Array<Stage>();
    stageTexts.forEach((stageText) => {
      const actions = new Array<Action>();
      const comments = new Array<string>();
      stageText.split("+").forEach((action) => {
        const match = action.match(Pattern.Action);
        if (match?.groups) {
          const { student1, comment } = match.groups;
          const action: Action = { actor: searchStudentByNameMap.get(student1)?.id };
          actions.push(action);
          if (comment) comments.push(comment);
        } else {
          comments.push(action);
        }
      });

      const stage = { actions, comment: comments.join(", ") };
      const previous = aggregateStage.at(-1)!;
      if (stage.comment || aggregateStage.length === 0) {
        if (previous) previous.comment = previous.comment || "順著費用放";
        aggregateStage.push(stage);
      } else {
        previous.comment = Team.joinComment(previous.comment, stage.comment);
        previous.actions = [...previous.actions, ...stage.actions];
      }
    });
    this._stages = aggregateStage;
  }

  moveStage(index: number, pop: "front" | "back") {
    if (index === 0 && this._stages[index].actions.length === 1 && pop === "front") return;
    else if (index === this._stages.length - 1 && this._stages[index].actions.length === 1 && pop === "back") return;
    const action = this._stages[index].actions[pop === "front" ? "shift" : "pop"]();
    if (action === undefined) return;
    const empted = this._stages[index].actions.length === 0;
    if (pop === "front") {
      if (index === 0) this._stages.unshift({ actions: [action] });
      else this._stages[index - 1].actions.push(action);
    } else {
      if (index === this._stages.length - 1) this._stages.push({ actions: [action] });
      else this._stages[index + 1].actions.unshift(action);
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
    this._stages.splice(direction === "front" ? index : index + 1, 0, { actions: [], comment: "新組" });
  }

  deleteStage(index: number) {
    this._stages.splice(index, 1);
  }

  toObject() {
    return {
      text: this.text,
      members: this._members,
      stages: this._stages,
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
