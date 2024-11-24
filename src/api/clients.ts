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

IndexDBClient.version(1).stores({
    students: ["&id", "name", "aliases",].join(","),
})

IndexDBClient.version(2)
    .stores({ students: ["&id", "name", "*keywords",].join(",") })
    .upgrade(trans => {
        return trans.table("students").toCollection().modify(student => {
            student.keywords = calculateKeywords(student)
        })
    })