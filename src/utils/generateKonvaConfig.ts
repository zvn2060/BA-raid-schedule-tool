import type { TextConfig } from "konva/lib/shapes/Text";
import { measureTextSize } from "@/utils/measureTextSize";

type AvatarMap = Record<number, ImageBitmap>;
type MemberAvatarProps = {
  side: number;
  x: number;
  y: number;
  image: ImageBitmap;
  stroke?: string;
  strokeWidth?: number;
};

const IMAGE_WIDTH = 1920;
const IMAGE_HEIGHT = 1080;

function optionalElement(show: boolean, element: unknown) {
  return show ? [element] : [];
}

function createMemberAvatar(member: Member, props: MemberAvatarProps) {
  if (member === null) return [];
  const { stroke, image, strokeWidth, side, ...commons } = props;
  return [
    { className: "Image", attrs: { ...commons, image, width: side, height: side } },
    { className: "Rect", attrs: { ...commons, stroke, strokeWidth, width: side, height: side } },
  ];
}

export function generateVideoCover(battle: BattleObject, teams: TeamObject[], avatarMap: AvatarMap): object {
  const teamCount = teams.length;
  const showFooter = teamCount <= 2;
  const showComment = teamCount <= 2;
  const showScore = teamCount === 1;
  const isNormal = battle.mode !== BattleMode.Unrestrict;

  const titleFontSize = measureTextSize(battle.title, {
    width: 1800,
    height: 150,
    fontFamily: "wanhanzon",
  });

  const scoreFontSize = measureTextSize(battle.score, isNormal
    ? { width: 840, height: 160, fontFamily: "wanhanzon" }
    : { width: 240, height: 160, fontFamily: "wanhanzon" },
  );

  const commonTextStyle: TextConfig = {
    fontFamily: "wanhanzon",
    fill: "#ffffff",
    strokeWidth: 24,
    fillAfterStrokeEnabled: true,
  };

  const strokeColorMap = {
    [BattleMode.Raid]: "#0088FC",
    [BattleMode.Elimination]: "#E6212A",
    [BattleMode.Test]: "#FF914D",
    [BattleMode.Unrestrict]: "#808080",
    [BattleMode.JpRaid]: "#5E17EB",
  };

  const strokeColor = strokeColorMap[battle.mode];

  const teamsGroups = [];
  if (teams.length === 1) {
    const avatars = teams[0].members.flatMap((member, index) => createMemberAvatar(member, { x: 20 + index * 150, y: 20, side: 150, image: avatarMap[member ?? 0] }));
    teamsGroups.push({
      attrs: { x: 40, y: 895 },
      className: "Group",
      children: avatars,
    });
  } else if (teams.length === 2) {
    for (let teamId = 0; teamId < teams.length; teamId++) {
      const avatarsOffset = teamId ? 40 : 20;
      const children: unknown[] = teams[teamId].members.flatMap((member, index) => createMemberAvatar(member, { x: avatarsOffset + index * 150, y: 20, side: 150, image: avatarMap[member ?? 0] }));
      if (teamId) children.unshift({ className: "Rect", attrs: { width: 20, height: 150, x: 0, y: 20, fill: "#FFFFFF" } });
      teamsGroups.push({
        attrs: { x: 10 + 940 * teamId, y: 895 },
        className: "Group",
        children,
      });
    }
  } else {
    const offsetX = battle.mode === BattleMode.Test ? 1055 : 25;
    const offsetY = teams.length === 3 ? 315 : 205;
    for (let teamId = 0; teamId < teams.length; teamId++) {
      const children: unknown[] = teams[teamId].members.flatMap((member, index) => createMemberAvatar(member, { x: 35 + index * 120, y: 35, side: 120, stroke: "#000000", image: avatarMap[member ?? 0] }));
      children.unshift({ className: "Rect", attrs: { width: 790, height: 190, fill: "#000000", stroke: "#FFFFFF", strokeWidth: 10 } });
      teamsGroups.push({
        attrs: { x: offsetX, y: offsetY + teamId * 220 },
        className: "Group",
        children,
      });
    }
  }
  return {
    attrs: { },
    className: "Layer",
    children: [
      {
        attrs: { name: "export", width: IMAGE_WIDTH, height: IMAGE_HEIGHT },
        className: "Group",
        children: [
          // { className: "Image", attrs: { image: bgImage } },
          { className: "Rect", attrs: { width: IMAGE_WIDTH, height: 180, fill: "black" } },
          {
            attrs: {
              ...commonTextStyle,
              x: 60,
              wrap: "none",
              align: "center",
              verticalAlign: "middle",
              stroke: strokeColor,
              y: 10,
              width: 1800,
              height: 160,
              fontSize: titleFontSize,
              text: battle.title,
            },
            className: "Text",
          },
          ...optionalElement(showComment, {
            attrs: {
              ...commonTextStyle,
              x: 60,
              stroke: "#ff3131",
              y: 210,
              width: 1800,
              fontSize: titleFontSize,
              text: battle.comment,
            },
            className: "Text",
          },
          ),
          ...optionalElement(showFooter, {
            attrs: {
              y: 900,
              width: IMAGE_WIDTH,
              height: 180,
              fill: "black",
            },
            className: "Rect",
          }),
          ...optionalElement(showScore, {
            attrs: {
              ...commonTextStyle,
              x: isNormal ? 1020 : 1620,
              align: "center",
              verticalAlign: "middle",
              stroke: strokeColor,
              y: 910,
              width: isNormal ? 840 : 240,
              height: 160,
              fontSize: scoreFontSize,
              text: battle.score,
            },
            className: "Text",
          }),
          ...teamsGroups,
        ],
      },
    ],
  };
}

export function generateTeam(battleMode: BattleMode, team: TeamObject, avatarMap: AvatarMap): object {
  if (battleMode === BattleMode.Unrestrict) {
    const strikes = team.members.slice(0, 6).flatMap((member, index) => createMemberAvatar(member, { x: 25 + index * 105, y: 47.5, side: 105, image: avatarMap[member ?? 0] }));
    const supporter = team.members.slice(6).flatMap((member, index) => createMemberAvatar(member, { x: 675 + index * 75, y: 62.5, side: 75, image: avatarMap[member ?? 0] }));
    const children: unknown[] = strikes.concat(supporter);
    children.unshift({ className: "Rect", attrs: { fill: "#000000", width: 1000, height: 200 } });
    return {
      attrs: { },
      className: "Layer",
      children,
    };
  } else {
    const children: unknown[] = team.members.flatMap((member, index) => createMemberAvatar(member, { x: 35 + index * 155, y: 22.5, side: 155, image: avatarMap[member ?? 0] }));
    children.unshift({ className: "Rect", attrs: { fill: "#000000", width: 1000, height: 200 } });
    return {
      attrs: { },
      className: "Layer",
      children,
    };
  }
}

export function generatePage(page: Page, avatarMap: AvatarMap): object {
  const children = page.map(column => ({
    className: "Group",
    attrs: { x: 80 + column.x, y: 45 },
    children: column.data.map(group => ({
      className: "Group",
      attrs: { y: group.y },
      children: [
        {
          className: "Text",
          attrs: {
            text: group.comment,
            fontSize: 40,
            fill: "#FFFFFF",
            fillAfterStrokeEnabled: true,
            strokeWidth: 6,
            stroke: "#000000",
            width: group.commentWidth,
            height: 120,
            fontFamily: "Microsoft YaHei",
          },
        },
        {
          className: "Group",
          attrs: { y: group.avatarsY },
          children: group.actions.flatMap((action, index) => createMemberAvatar(action.actor, { side: 148, stroke: "#000000", strokeWidth: 2, x: (index % 4) * 150 + 10 * (index % 4) + 1, y: Math.floor(index / 4) * 160 + 1, image: avatarMap[action.actor ?? -1] })),
        },
      ],
    })) }));
  return {
    attrs: { },
    className: "Layer",
    children,
  };
}
