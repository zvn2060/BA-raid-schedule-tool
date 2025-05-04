export const BackgroundImage = {
  總力戰底圖1: new URL("@/assets/backgrounds/總力戰底圖-1.png?url", import.meta.url),
  總力戰底圖2: new URL("@/assets/backgrounds/總力戰底圖-2.png?url", import.meta.url),
  大決戰底圖1: new URL("@/assets/backgrounds/大決戰底圖-1.png?url", import.meta.url),
  大決戰底圖2: new URL("@/assets/backgrounds/大決戰底圖-2.png?url", import.meta.url),
  考試底圖1: new URL("@/assets/backgrounds/考試底圖-1.png?url", import.meta.url),
  賽特底圖1: new URL("@/assets/backgrounds/賽特底圖-1.png?url", import.meta.url),
  日版底圖1: new URL("@/assets/backgrounds/日版底圖-1.png?url", import.meta.url),
  圖片軸底圖1: new URL("@/assets/backgrounds/圖片軸底圖-1.png?url", import.meta.url),
};

export const ImageFlowBgUrl = new URL("@/assets/backgrounds/圖片軸底圖-1.png?url", import.meta.url).href;

export function choiceVideoCoverBackground(mode: BattleMode, teamCount: number) {
  switch (mode) {
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
