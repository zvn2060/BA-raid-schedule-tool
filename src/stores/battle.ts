import download from "downloadjs";
import { isNil, keyBy, partition } from "lodash-es";
import { ZodError } from "zod";

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

function numberToChinese(index: number): string {
  return chineseNum[index + 1] ?? index;
}

export const useBattleStore = defineStore("battleStore", () => {
  const battle = ref(new Battle()) as Ref<Battle>;
  const teams = ref<Team[]>([]) as Ref<Team[]>;

  function addTeam() {
    teams.value.push(new Team(battle.value.teamStruture));
  }

  function deleteTeam(index: number) {
    teams.value.splice(index, 1);
  }

  async function loadFromJsonFile(content: string) {
    try {
      const { teams: teamsData, ...battleData } = JSON.parse(content);
      const parsedBattleData = Battle.schema.parse(battleData);
      const parsedTeamsData = Team.schema.array().nullish().parse(teamsData);
      const allStudents = parsedTeamsData?.flatMap(it => it.members ?? []).filter(member => !isNil(member));
      const students = allStudents ? await IndexDBClient.students.where("id").anyOf(allStudents).toArray() : [];
      const studentMap = keyBy(students, it => it.id);

      battle.value = new Battle(parsedBattleData);
      const structure = battle.value.teamStruture;
      if (!parsedTeamsData) return;
      teams.value = parsedTeamsData.map((data) => {
        const [strikers, special] = partition(data.members?.filter(Boolean).map(id => studentMap[id!]), it => it.squad === "striker");
        return new Team(structure, special.length, strikers.length, data);
      });
    } catch (error) {
      if (error instanceof SyntaxError) throw Error(error.message);
      else if (error instanceof ZodError) throw Error(error.format()._errors.join("\n"));
      else if (error instanceof Error) throw Error;
      else throw Error(`${error}`);
    }
  }

  async function generateDescription() {
    const teamCount = teams.value.length;
    if (!teamCount) return "";

    const allStudents = teams.value?.flatMap(it => it.members ?? []).filter(member => !isNil(member));
    const students = allStudents ? await IndexDBClient.students.where("id").anyOf(allStudents).toArray() : [];
    const studentMap = keyBy(students, it => it.id);

    const isMultipleTeams = teamCount > 1;
    return [
      "<簡述>",
      "",
      isMultipleTeams ? "<時間軸>\n" : null,
      isMultipleTeams
        ? teams.value.map((team, index) => `${numberToChinese(index)}隊：\n${team.generateDescription(studentMap)}`).join("\n\n")
        : `隊伍：\n${teams.value[0].generateDescription(studentMap)}`,
      "",
      "文字敘述重要時間點：",
      "",
      "※先說凹點：",
      "<凹點>",
      "",
      isMultipleTeams
        ? teams.value.map((team, index) => `${numberToChinese(index)}隊：\n${team.text}`).join("\n\n")
        : teams.value[0].text,
    ].filter(it => it !== null).join("\n");
  }

  async function exportProject(format: "xml" | "json") {
    if (format === "xml") workerCreateScene(battle.value.name, toRaw(battle.value), toRaw(teams.value).map(it => it.toObject()));
    else download(JSON.stringify({
      ...battle.value.toObject(),
      teams: teams.value.map(it => it.toObject()),
    }, null, 2), `${battle.value.name}.json`);
  }

  return { battle, teams, loadFromJsonFile, addTeam, deleteTeam, generateDescription, exportProject };
});
