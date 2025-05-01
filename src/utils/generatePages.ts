export type StageInfo = {
  comment: string | undefined;
  commentWidth: number;
  actions: Array<{ actor: number | null }>;
  y: number;
  avatarsY: number;
};
export type Column = { data: StageInfo[]; width: number; x: number };
export type Page = Column[];

const canvas = new OffscreenCanvas(1000, 1000);
const context = canvas.getContext("2d");
if (context) context.font = "40px 'Microsoft YaHei'";

function estimateStage(stage: Stage) {
  const avatarRows = Math.ceil(stage.actions.length / 4);
  const avatarCols = Math.min(stage.actions.length, 4);
  const commentOnelineWidth = context?.measureText(stage.comment ?? "").width ?? 0;
  const commentHeight = Math.ceil(commentOnelineWidth / 630) * 40;
  const commentWidth = Math.min(commentOnelineWidth, 630);
  const avatarsHeight = avatarRows < 2 ? avatarRows * 150 : avatarRows * 160 - 10;
  const avatarsWidth = avatarCols < 2 ? avatarCols * 150 : avatarCols * 160 - 10;
  const totalHeight = commentHeight + (commentHeight && avatarsHeight ? 20 : 0) + avatarsHeight;
  const totalWidth = Math.max(avatarsWidth, commentWidth);
  return {
    comment: { width: commentWidth, height: commentHeight },
    avatars: { width: avatarsWidth, height: avatarsHeight },
    total: { width: totalWidth, height: totalHeight },
  };
}

export function calculateStagePages(battle: ReturnType<Battle["toObject"]>, gap: { col: number; row: number }) {
  const pages = new Array<Page>([]);
  battle.teams.forEach((team) => {
    const columns = new Array<Omit<Column, "x">>({ data: [], width: 0 });
    let y = 0;
    team.stages.forEach((stage) => {
      const metrics = estimateStage(stage);
      const lastColumn = columns.at(-1)!;
      const data = {
        comment: stage.comment,
        commentWidth: metrics.comment.width,
        actions: stage.actions.map(({ actor }) => ({ actor })),
        y,
        avatarsY: metrics.comment.height + 20,
      };
      if (lastColumn.data.length < 4 && y + metrics.total.height <= 1020) {
        y += metrics.total.height + gap.row;
        lastColumn.width = Math.max(lastColumn.width, metrics.total.width);
        lastColumn.data.push(data);
      } else {
        columns.push({ data: [{ ...data, y: 0 }], width: metrics.total.width });
        y = metrics.total.height + gap.row;
      }
    });

    let x = 0;
    columns.forEach((column) => {
      if (x + column.width <= 1760) {
        pages.at(-1)?.push({ ...column, x });
        x += column.width + gap.col;
      } else {
        pages.push([{ ...column, x: 0 }]);
        x = column.width + gap.col;
      }
    });
    pages.push([]);
  });
  return pages.filter(it => it.length);
}
