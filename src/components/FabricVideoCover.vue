<script setup lang="ts">
import { FabricImage, FabricObject, FabricText, Group, Rect } from "fabric";
import { compact } from "lodash-es";
import { Battle } from "../libs";

const store = useBattleStore();
const { battle } = storeToRefs(store);
const header = new Rect({
  width: 1920,
  height: 180,
  left: 0,
  hasControls: false,
  selectable: false,
  top: 0,
  fill: "black",
});

const footer = new Rect({
  width: 1920,
  height: 180,
  left: 0,
  hasControls: false,
  selectable: false,
  top: 900,
  fill: "black",
});

const editor = useTemplateRef("editor");
function estimateFontSize(
  text: string,
  desiredWidth: number,
  averageCharWidth: number
) {
  const textLength = text.length;
  const totalTextWidth = textLength * averageCharWidth;
  const scaleFactor = desiredWidth / totalTextWidth;
  const baseFontSize = 1; // Assume a base font size of 16px
  const estimatedFontSize = baseFontSize * scaleFactor;
  return estimatedFontSize;
}

const titleFontSize = estimateFontSize(battle.value.name, 1800, 2);

const title = new FabricText(battle.value.name, {
  fontFamily: "wanhanzon",
  left: 60,
  top: 10,
  width: 1800,
  height: 160,
  fontSize: titleFontSize,
  stroke: "#0088FC",
  strokeWidth: 3,
  strokeLineJoin: "bevel",
  textAlign: "center",
  fill: "#FFFFFF",
});

const comment = new FabricText("※註解", {
  fontFamily: "wanhanzon",
  left: 60,
  top: 210,
  fontSize: titleFontSize,
  fill: "#FFFFFF",
  stroke: "#FF3131",
  strokeWidth: 3,
  strokeLineJoin: "bevel",
});

async function createTeamGroup(battle: Battle) {
  if (battle.teams.length <= 2) {
    const seperators = new Array<FabricObject>();
    const images = await Promise.all(
      compact(
        battle.teams.flatMap((team, teamIndex) => {
          if (teamIndex > 0)
            seperators.push(
              new Rect({
                width: 20,
                height: 150,
                top: 915,
                left: 30 + teamIndex * 920,
                fill: "#FFFFFF",
              })
            );
          return team.members.flatMap((member, memberIndex) =>
            member
              ? FabricImage.fromURL(
                  `https://schaledb.com/images/student/icon/${member.id}.webp`,
                  {},
                  {
                    left: 30 + memberIndex * 150 + teamIndex * 960,
                    top: 915,
                    scaleX: 1.25,
                    scaleY: 1.25,
                    centeredScaling: true,
                  }
                )
              : null
          );
        })
      )
    );
    return new Group([...images, ...seperators]);
  } else {
    return new Group();
  }
}

const teamsPromise = createTeamGroup(battle.value as Battle);

onMounted(async () => {
  const teams = await teamsPromise;
  const objects = [
    header,
    footer,
    title,
    teams,
    new Rect({ width: 2, height: 2, left: 60, top: 915, fill: "red" }),
    new Rect({ width: 2, height: 2, left: 0, top: 1080, fill: "red" }),
  ];
  if (battle.value.teams.length < 3) objects.push(comment);
  editor.value?.addObjects(...objects);
});
</script>

<template>
  <FabricImageEditor ref="editor" :width="1920" :height="1080" class="h-full" />
</template>
