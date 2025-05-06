export function getVideoCover(mode: BattleMode, teamCount: number) {
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
