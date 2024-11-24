import Dexie, { EntityTable } from "dexie"
import { uniq } from "lodash-es"

export const SchaleDbClient = new AxiosClient({
    baseURL: "https://raw.githubusercontent.com/SchaleDB/SchaleDB/refs/heads/main/data/tw"
})

export const IndexDBClient = new Dexie("ba-strategy-tool") as Dexie & {
    students: EntityTable<Student, "id">
}

export function calculateKeywords(student: Student) {
    return uniq([...student.name, ...student.aliases.join("")]).filter(it => !("()（）＊".includes(it)))
}

IndexDBClient
    .version(1)
    .stores({ students: ["&id", "name", "aliases"].join(","), })

IndexDBClient
    .version(2)
    .stores({ students: ["&id", "name", "*keywords"].join(",") })
    .upgrade(trans => trans
        .table("students")
        .toCollection()
        .modify(student => {
            student.keywords = calculateKeywords(student)
        })
    )

type StudentDTO = {
    Id: number
    School: string,
    StarGrade: number,
    Name: string,
    SquadType: "Main" | "Support"
}

function DTOtoStudent({ Id, Name, SquadType, School, StarGrade }: StudentDTO): Student {
    const data: Student = {
        id: Id,
        name: Name,
        keywords: [],
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

    data.keywords = calculateKeywords(data)
    return data;
}

IndexDBClient.on("ready", async (_db) => {
    const db = _db as typeof IndexDBClient;
    const data = await SchaleDbClient.get<StudentDTO[]>("students.json")
    const exists = await db.students.toArray()
    const existIds = new Set(exists.map(it => it.id))
    await db.students.bulkPut(
        data
            .filter(it => !existIds.has(it.Id))
            .map((dto) => DTOtoStudent(dto))
    )
})