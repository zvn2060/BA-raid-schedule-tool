import { XMLBuilder, XMLParser } from "fast-xml-parser";
import JSZip from "JSZip";
import Konva from "konva";
import { keyBy, mapValues, range, uniq } from "lodash-es";
import workerpool from "workerpool";
import template from "@/assets/template.xml?raw";

export async function zipFiles(files: Array<{ blob: Blob; name: string }>) {
  const zip = new JSZip();
  files.forEach(({ blob, name }) => {
    zip.file(name, blob);
  });
  return zip.generateAsync({ type: "blob" });
};

// @ts-expect-error monkeypatch
Konva.Util.createCanvasElement = () => {
  const canvas = new OffscreenCanvas(1920, 1080);
  Object.assign(canvas, { style: {} });
  return canvas;
};

const fontUrl = new URL("@/assets/王漢宗特黑體繁.ttf?url", import.meta.url).href;

async function fetchToImageBitmap(src: string): Promise<ImageBitmap> {
  const res = await fetch(src);
  const blob = await res.blob();
  return createImageBitmap(blob);
}

function choiceVideoCoverBackground(battle: ReturnType<Battle["toObject"]>) {
  const teamCount = battle.teams.length;
  switch (battle.mode) {
    case BattleMode.Raid:
      return teamCount <= 2
        ? BackgroundImage.總力戰底圖1
        : BackgroundImage.總力戰底圖2;
    case BattleMode.Elimination:
      return teamCount <= 2
        ? BackgroundImage.大決戰底圖1
        : BackgroundImage.大決戰底圖2;
    case BattleMode.Test:
      return BackgroundImage.考試底圖1;
    case BattleMode.Unrestrict:
      return BackgroundImage.賽特底圖1;
    case BattleMode.JpRaid:
      return BackgroundImage.日版底圖1;
    default:
      return BackgroundImage.總力戰底圖1;
  }
}

export async function createProject(battle: ReturnType<Battle["toObject"]>) {
  // #region 前置作業
  const font = new FontFace("wanhanzon", `url(${fontUrl})`);
  await font.load();
  self.fonts.add(font);
  const avatars = await Promise.all(
    uniq(battle.teams.flatMap(it => it.members).filter(Boolean))
      .map(async (memberId) => {
        const data = await IndexDBClient.students.get(memberId!);
        const image = data?.image ?? await fetch(`https://schaledb.com/images/student/icon/${memberId}.webp`).then(res => res.blob());
        return { memberId, bitmap: await createImageBitmap(image!) };
      }));
  const avatarMap = mapValues(keyBy(avatars, "memberId"), "bitmap");
  const videoCoverImage = await fetchToImageBitmap(choiceVideoCoverBackground(battle).href);
  const imageFlowImage = await fetchToImageBitmap(BackgroundImage.圖片軸底圖1.href);
  // #endregion

  const outputImages: { VideoCover?: Blob; Teams?: Blob[]; ImageFlow?: Blob[] } = {};

  // #region 影片封面
  {
    const config = generateVideoCover(battle, avatarMap);
    outputImages.VideoCover = await exportToBlob(1920, 1080, config, videoCoverImage);
  }
  // #endregion

  // #region 網站隊伍
  outputImages.Teams = await Promise.all(battle.teams.map(team => exportToBlob(1000, 200, generateTeam(battle.mode, team, avatarMap))));
  // #endregion

  // #region 圖片軸
  const pages = calculateStagePages(battle, { col: 80, row: 20 });
  outputImages.ImageFlow = await Promise.all(
    pages.map(page => exportToBlob(1920, 1080, generatePage(page, avatarMap), imageFlowImage)),
  );
  // #endregion

  const xmlContent = await generateFinalCutXml(pages.length);

  const zip = new JSZip();
  zip.file("影片封面.png", outputImages.VideoCover);
  zip.file("project.xml", xmlContent);
  const teamsFolder = zip.folder("網站隊伍");
  if (teamsFolder) {
    outputImages.Teams.forEach((blob, index) => {
      teamsFolder.file(`網站隊伍-${index + 1}.png`, blob);
    });
  }
  const imageFlowFolder = zip.folder("圖片軸");
  if (imageFlowFolder) {
    outputImages.ImageFlow.forEach((blob, index) => {
      imageFlowFolder.file(`圖片軸-${index + 1}.png`, blob);
    });
  }
  return zip.generateAsync({ type: "blob" });
}

function exportToBlob(width: number, height: number, config: object, bgImage?: ImageBitmap) {
  const stage = new Konva.Stage({ width: 1920, height: 1080 });
  const canvas = new OffscreenCanvas(width, height);
  const layer = Konva.Node.create(config);
  stage.add(layer);
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (bgImage) ctx.drawImage(bgImage, 0, 0);
  ctx.drawImage(layer.getCanvas()._canvas, 0, 0);
  return canvas.convertToBlob();
}

async function generateFinalCutXml(pageCount: number) {
  const parser = new XMLParser({ ignoreAttributes: false });
  const obj = parser.parse(template);
  obj.xmeml.sequence.media.video.track[0].clipitem = [
    {
      masterclipid: "masterclip-1",
      name: "影片封面.png",
      enabled: "TRUE",
      duration: 1294705,
      rate: { timebase: 30, ntsc: "TRUE" },
      start: 0,
      end: 120,
      in: 107892,
      out: 107952,
      pproTicksIn: 914456685542400,
      pproTicksOut: 914965225574400,
      alphatype: "straight",
      pixelaspectratio: "square",
      anamorphic: "FALSE",
      file: {
        name: "影片封面.png",
        pathurl: encodeURI(`file:./影片封面.png`),
        rate: { timebase: 30, ntsc: "TRUE" },
        timecode: {
          rate: { timebase: 30, ntsc: "TRUE" },
          string: "00:00:00:00",
          frame: 0,
          displayformat: "NDF",
        },
        media: {
          video: {
            samplecharacteristics: {
              rate: {
                timebase: 30,
                ntsc: "TRUE",
              },
              width: 1280,
              height: 722,
              anamorphic: "FALSE",
              pixelaspectratio: "square",
              fielddominance: "none",
            },
          },
        },
      },
      filter: {
        effect: {
          name: "Basic Motion",
          effectid: "basic",
          effectcategory: "motion",
          effecttype: "motion",
          mediatype: "video",
          pproBypass: false,
          parameter: [
            {
              parameterid: "scale",
              name: "Scale",
              valuemin: 0,
              valuemax: 1000,
              value: 150,
            },
            {
              parameterid: "rotation",
              name: "Rotation",
              valuemin: -8640,
              valuemax: 8640,
              value: 0,
            },
            {
              parameterid: "center",
              name: "Center",
              value: {
                horiz: 0,
                vert: 0,
              },
            },
            {
              parameterid: "centerOffset",
              name: "Anchor Point",
              value: {
                horiz: 0,
                vert: 0,
              },
            },
            {
              parameterid: "antiflicker",
              name: "Anti-flicker Filter",
              valuemin: 0,
              valuemax: 1,
              value: 0,
            },
          ],
        },
      },
      logginginfo: {
        description: "",
        scene: "",
        shottake: "",
        lognote: "",
        good: "",
        originalvideofilename: "",
        originalaudiofilename: "",
      },
      colorinfo: {
        lut: "",
        lut1: "",
        asc_sop: "",
        asc_sat: "",
        lut2: "",
      },
      labels: "",
    },
    ...range(1, pageCount).map((i) => {
      const filename = `圖片軸-${i}.png`;
      const start = 120 + (i - 1) * 300;
      return {
        masterclipid: `masterclip-${i + 1}`,
        name: filename,
        enabled: "TRUE",
        duration: 1294705,
        rate: { timebase: 30, ntsc: "TRUE" },
        start,
        end: start + 300,
        in: 107892,
        out: 108042,
        pproTicksIn: 914456685542400,
        pproTicksOut: 915728035622400,
        alphatype: "straight",
        pixelaspectratio: "square",
        anamorphic: "FALSE",
        file: {
          name: filename,
          pathurl: encodeURI(`file://./圖片軸/${filename}`),
          rate: { timebase: 30, ntsc: "TRUE" },
          timecode: {
            rate: { timebase: 30, ntsc: "TRUE" },
            string: "00:00:00:00",
            frame: 0,
            displayformat: "NDF",
          },
          media: {
            video: {
              samplecharacteristics: {
                rate: { timebase: 30, ntsc: "TRUE" },
                width: 1920,
                height: 1080,
                anamorphic: "FALSE",
                pixelaspectratio: "square",
                fielddominance: "none",
              },
            },
          },
        },
        logginginfo: {
          description: "",
          scene: "",
          shottake: "",
          lognote: "",
          good: "",
          originalvideofilename: "",
          originalaudiofilename: "",
        },
        colorinfo: {
          lut: "",
          lut1: "",
          asc_sop: "",
          asc_sat: "",
          lut2: "",
        },
        labels: "",
      };
    }),

  ];
  const builder = new XMLBuilder({ ignoreAttributes: false, suppressBooleanAttributes: false, format: true });
  return builder.build(obj);
}

workerpool.worker({
  zipFiles: zipFiles,
  createProject: createProject,
});
