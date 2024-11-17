import { useQuery } from "@tanstack/vue-query";
import type { Ref } from "vue";
export function useStudents(nameFilter: Ref<string>) {
    const { data: students } = useQuery({
        queryKey: ["students", { filter: nameFilter }],
        queryFn: () => {
            if (nameFilter.value)
                return IndexDBClient.students
                    .filter(students => students.alias.includes(nameFilter.value) || students.name.includes(nameFilter.value))
                    .toArray()
            else
                return IndexDBClient.students.toArray()
        }
    })

    return { students }
}

function DTOtoStudent({ Id, Name, SquadType, School, StarGrade }: StudentDTO): Student {
    return {
        id: Id,
        name: Name,
        squad: SquadType === "Main" ? "striker" : "special",
        school: mapSchool(School),
        alias: Name,
        star: StarGrade,
        level: 1,
        weapon_level: null,
        gear_1: 0, gear_2: 0, gear_3: 0, gear_unique: null,
        skill_ex: 1, skill_n: 1, skill_p: 1, skill_sub: 1,
        release_atk: null, release_heal: null, release_hp: null
    }
}


export async function fetchStudents() {
    const data = await SchaleDbClient.get<StudentDTO[]>("students.json")
    const exists = await IndexDBClient.students.toArray()
    const existIds = new Set(exists.map(it => it.id))
    await IndexDBClient.students.bulkPut(
        data
            .filter(it => !existIds.has(it.Id))
            .map((dto) => DTOtoStudent(dto))
    )
}