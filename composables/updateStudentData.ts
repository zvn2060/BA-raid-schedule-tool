import { calculateKeywords, IndexDBClient } from "#shared";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { isNil, keyBy, merge } from "lodash-es";
import { initParser } from "udsv";

type StudentCsvDTO = {
    "名稱": string
    "別名": string | null
    "星等": number | null
    "等級": number | null
    "EX": number | null
    "技一": number | null
    "技二": number | null
    "技三": number | null
    "extra": number | null
    "固有等級": number | null
    "裝備一": number | null
    "裝備二": number | null
    "裝備三": number | null
    "愛用品": number | null
    "絆": number | null
    "生命": number | null
    "攻擊": number | null
    "治癒": number | null
}

const repl = { null: null, empty: null, NaN: null } as const

const parser = initParser({
    col: ",",
    row: "\n",
    encl: "",
    esc: "",
    trim: true,
    cols: [
        { name: "名稱", type: "s", repl },
        { name: "別名", type: "s", repl },
        { name: "星等", type: "n", repl },
        { name: "等級", type: 'n', repl },
        { name: "EX", type: 'n', repl },
        { name: "技一", type: 'n', repl },
        { name: "技二", type: 'n', repl },
        { name: "技三", type: 'n', repl },
        { name: "extra", type: 'n', repl: { ...repl, empty: 0 } },
        { name: "固有等級", type: 'n', repl },
        { name: "裝備一", type: 'n', repl },
        { name: "裝備二", type: 'n', repl },
        { name: "裝備三", type: 'n', repl },
        { name: "愛用品", type: 'n', repl },
        { name: "絆", type: 'n', repl },
        { name: "生命", type: 'n', repl },
        { name: "攻擊", type: 'n', repl },
        { name: "治癒", type: 'n', repl },
    ]
})


const keyMap: Record<Exclude<keyof StudentCsvDTO, "名稱">, { key: keyof Student, fn?: (data: StudentCsvDTO) => any }> = {
    "EX": { key: "skill_ex" },
    "extra": { key: "star", fn: data => (data.星等 !== null && data.extra !== null) ? (data.星等 + data.extra) : null },
    "別名": { key: "aliases", fn: data => data.別名?.split("|") ?? null },
    "固有等級": { key: "weapon_level" },
    "愛用品": { key: "gear_unique" },
    "技一": { key: "skill_n" },
    "技二": { key: "skill_p" },
    "技三": { key: "skill_sub" },
    "攻擊": { key: "release_atk" },
    "星等": { key: "star", fn: data => (data.星等 !== null && data.extra !== null) ? (data.星等 + data.extra) : null },
    "治癒": { key: "release_heal" },
    "生命": { key: "release_hp" },
    "等級": { key: "level" },
    "絆": { key: "kizuna" },
    '裝備一': { key: "gear_1" },
    "裝備三": { key: "gear_3" },
    "裝備二": { key: "gear_2" },
}

function parseCsvStudentData(text: string): Record<string, { data: Partial<Student>, index: number, name: string }> {
    const lines = text.split("\n");
    const assureNoHeader = lines[0].startsWith("名稱") ? lines.slice(1).join("\n") : text;
    const studentsData = parser.typedObjs<StudentCsvDTO>(assureNoHeader).map((item, index) => {
        const baseObj: Partial<Student> = {}
        for (const key in keyMap) {
            const castKey = key as Exclude<keyof StudentCsvDTO, "名稱">
            const val = keyMap[castKey]
            if (isNil(item[castKey])) continue;
            const injectVal = val.fn ? val.fn(item) : item[castKey];
            if (isNil(injectVal)) continue;
            // @ts-expect-error key always to be key of item
            baseObj[val.key] = injectVal;
        }
        return { data: baseObj, index, name: item.名稱 };
    })
    return keyBy(studentsData, it => it.name);
}


export function updateStudentData() {
    const queryClient = useQueryClient()
    const { mutateAsync: update } = useMutation({
        async mutationFn(file: File) {
            const updateMap = parseCsvStudentData(await file.text());
            const names = Object.keys(updateMap);
            const notInDatabase = new Map(Object.entries(updateMap))

            await IndexDBClient.transaction("readwrite", IndexDBClient.students, async () => {
                await IndexDBClient.students
                    .where("name")
                    .anyOf(names)
                    .modify(student => {
                        merge(student, updateMap[student.name].data);
                        notInDatabase.delete(student.name);
                        student.keywords = calculateKeywords(student)
                    })

                if (notInDatabase.size) throw Error([
                    `以下資料不在資料庫中，請確認名字是否一致：`,
                    ...Array.from(notInDatabase.values()).map(it => `第 ${it.index + 2} 筆：${it.name} `)
                ].join("\n"))

                await queryClient.invalidateQueries({ queryKey: ["students"] })
            })
        }
    })

    return { update }
}