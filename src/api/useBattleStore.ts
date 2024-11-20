import {isNull, keyBy} from "lodash-es";
import {ZodError} from "zod";

export const useBattleStore = defineStore("軸", () => {
    const battle = ref(new Battle())

    async function loadFromJsonFile(content: string) {
        try {
            const data = JSON.parse(content)
            const battleData = Battle.schema.parse(data)
            const members = battleData.teams?.flatMap(it => it.members ?? []).filter(member => !isNull(member));
            const students = members ? await IndexDBClient.students.where("id").anyOf(members).toArray() : []
            const studentMap = keyBy(students, it => it.id)
            const { teams, ...otherBattleData } = battleData;

            battle.value = new Battle({
                ...otherBattleData,
                teams: teams?.map(({ members, stages, ...otherTeamData }) => ({
                    members: members?.map(member => member === null ? null : studentMap[member]),
                    stages: stages?.map(({ members, ...otherStageData }) =>
                        ({ members: members.map(member => member ? studentMap[member] : null), ...otherStageData })
                    ),
                    ...otherTeamData
                }))
            })
        } catch (error) {
            if (error instanceof SyntaxError) throw Error(error.message)
            else if (error instanceof ZodError) throw Error(error.format()._errors.join("\n"))
            else if (error instanceof Error) throw Error;
            else throw Error(`${error}`)
        }
    }

    return { battle, loadFromJsonFile }
})