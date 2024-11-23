import { useQuery } from "@tanstack/vue-query";
import { Collection, InsertType } from "dexie";
import type { Ref } from "vue";


type StudentsQueryParams = {
    name: string,
}

type Pagination = {
    first: number,
    itemPerPage: number
}

function hasQuery(param: StudentsQueryParams) {
    return param.name;
}


export function useStudents(params: Ref<StudentsQueryParams>, pagination?: Ref<Pagination>) {
    const { data: students } = useQuery({
        queryKey: ["students", params, pagination],
        queryFn: () => {
            let query = IndexDBClient.students;
            let collection: Collection<Student, number, InsertType<Student, "id">>
            if (hasQuery(params.value))
                collection = query
                    .filter(students => [students.name, ...students.aliases].join(",").includes(params.value.name))
            else
                collection = query.toCollection()
            if (pagination)
                collection = collection
                    .offset(pagination.value.first)
                    .limit(pagination.value.itemPerPage)

            return collection.toArray()
        },
        placeholderData: old => old ?? []
    })

    const { data: total } = useQuery({
        queryKey: ["students-total", params],
        queryFn: () => hasQuery(params.value)
            ? IndexDBClient.students
                .filter(students => [students.name, ...students.aliases].join(",").includes(params.value.name))
                .count()
            : IndexDBClient.students
                .count()
    })

    return { students, total }
}

type StudentDTO = {
    Id: number
    School: string,
    StarGrade: number,
    Name: string,
    SquadType: "Main" | "Support"
}

function DTOtoStudent({ Id, Name, SquadType, School, StarGrade }: StudentDTO): Student {
    return {
        id: Id,
        name: Name,
        squad: SquadType === "Main" ? "striker" : "special",
        school: mapSchool(School),
        aliases: [],
        star: StarGrade,
        kizuna: 1,
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