import Dexie, { type EntityTable } from "dexie";
import { uniq } from "lodash-es";

export const IndexDBClient = new Dexie("ba-strategy-tool") as Dexie & {
  students: EntityTable<Student, "id">;
};

export function calculateKeywords(student: Student) {
  const keywords = [student.name, ...student.aliases]
    .flatMap((it) => {
      const match = it.match(/(?<name>[^()（）]+)([(（](?<skin>[^()（）]+)[)）])?/);
      if (!match || !match.groups) return [it];
      const { name, skin } = match.groups;
      const keywords = name === "白子＊恐怖"
        ? ["白子", "恐怖", ..."白子", ..."恐怖"]
        : [name, ...name];
      if (skin) keywords.push(skin, ...skin);
      return keywords;
    });
  return uniq(keywords);
}

IndexDBClient
  .version(1)
  .stores({ students: ["&id", "name", "aliases"].join(",") });

IndexDBClient
  .version(2)
  .stores({ students: ["&id", "name", "*keywords"].join(",") })
  .upgrade(trans => trans
    .table("students")
    .toCollection()
    .modify((student) => {
      student.keywords = calculateKeywords(student);
    }),
  );

IndexDBClient
  .version(3)
  .stores({ students: ["&id", "name", "*keywords"].join(",") })
  .upgrade(trans => trans
    .table("students")
    .toCollection()
    .modify((student) => {
      if (!student.aliases?.length) return;
      student.prefer_name = student.aliases[0];
    }),
  );

type StudentDTO = {
  Id: number;
  School: string;
  StarGrade: number;
  Name: string;
  SquadType: "Main" | "Support";
};

const SchoolMap = {
  Gehenna: "格黑娜",
  Millennium: "千年",
  Trinity: "三一",
  Abydos: "阿拜多斯",
  Shanhaijing: "山海經",
  Hyakkiyako: "百鬼夜行",
  RedWinter: "赤冬",
  Valkyrie: "女武神",
  ETC: "其他",
  SRT: "SRT",
  Arius: "奧利斯",
  Tokiwadai: "其他",
  Sakugawa: "其他",
} as Record<string, string>;

function DTOtoStudent({ Id, Name, SquadType, School, StarGrade }: StudentDTO): Student {
  const data: Student = {
    id: Id,
    name: Name,
    keywords: [],
    squad: SquadType === "Main" ? "striker" : "special",
    school: SchoolMap[School] ?? School,
    aliases: [],
    star: StarGrade,
    kizuna: 1,
    level: 1,
    weapon_level: null,
    gear_1: 0, gear_2: 0, gear_3: 0, gear_unique: null,
    skill_ex: 1, skill_n: 1, skill_p: 1, skill_sub: 1,
    release_atk: null, release_heal: null, release_hp: null,
  };

  data.keywords = calculateKeywords(data);
  return data;
}

IndexDBClient.on("ready", async (_db) => {
  const db = _db as typeof IndexDBClient;
  const response = await fetch("https://schaledb.com/data/tw/students.min.json");
  const data = await response.json() as Record<number, StudentDTO>;
  const exists = await db.students.toArray();
  const existIds = new Set(exists.map(it => it.id));
  await db.students.bulkPut(
    Object.values(data)
      .filter(it => !existIds.has(it.Id))
      .map(dto => DTOtoStudent(dto)),
  );
});
