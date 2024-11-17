import Dexie, { EntityTable } from "dexie"

export const SchaleDbClient = new AxiosClient({
    baseURL: "https://raw.githubusercontent.com/SchaleDB/SchaleDB/refs/heads/main/data/tw"
})

export const IndexDBClient = new Dexie("ba-strategy-tool") as Dexie & {
    students: EntityTable<Student, "id">
}


IndexDBClient.version(1).stores({
    students: [
        "&id",
        "name",
        "aliases",
    ].join(",")
})