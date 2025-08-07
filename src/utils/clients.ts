import Dexie, { type EntityTable } from "dexie";
import { uniq } from "lodash-es";

type SchaleDbStudentDTO = {
  Id: number;
  School: string;
  StarGrade: number;
  Name: string;
  SquadType: "Main" | "Support";
  FavorAlts: number[];
};

export const IndexDBClient = new Dexie("ba-strategy-tool") as Dexie & {
  students: EntityTable<Student, "id">;
};

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

IndexDBClient
  .version(4)
  .stores({ students: ["&id", "name", "*keywords", "*skin"].join(",") })
  .upgrade(trans => trans
    .table("students")
    .toCollection()
    .modify((student) => {
      student.skin = [];
    }),
  );

const HALF_DAY_IN_MS = 43200000;

IndexDBClient.on("ready", async (_db) => {
  const lastUpdate = localStorage.getItem("db.last-updated");
  const now = new Date();
  if (lastUpdate && now.getTime() - new Date(lastUpdate).getTime() <= HALF_DAY_IN_MS) return;
  localStorage.setItem("db.last-updated", now.toISOString());
  console.log("start update db");
  const db = _db as typeof IndexDBClient;
  const existIds = new Set((await db.students.toArray()).map(it => it.id));
  const response = await fetch("https://schaledb.com/data/tw/students.min.json");
  const data = await response.json() as Record<number, SchaleDbStudentDTO>;
  const nonExistData = Object.values(data).filter(it => !existIds.has(it.Id));
  console.log("新增：\n", nonExistData);
  await db.students.bulkAdd(nonExistData.map(dto => DTOtoStudent(dto)));
});

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

function DTOtoStudent({ Id, Name, SquadType, School, StarGrade, FavorAlts }: SchaleDbStudentDTO): Student {
  const data: Student = {
    id: Id,
    name: Name,
    keywords: [],
    squad: SquadType === "Main" ? "striker" : "special",
    school: SchoolMap[School] ?? School,
    aliases: [],
    skin: FavorAlts ?? [],
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
