import { useQuery } from "@tanstack/vue-query";
import { BattleMode } from "../libs";

export function useVideoBackground() {
    const { battle } = storeToRefs(useBattleStore())
    const conditions  = computed(() => ({ teamCount: battle.value.teams.length, mode: battle.value.mode }))
    const { data: url } = useQuery({
        queryKey: ["background", conditions],
        queryFn: () => {
            switch (conditions.value.mode) {
                case BattleMode.Raid:
                    return conditions.value.teamCount <= 2
                        ? new URL("../assets/backgrounds/總力戰底圖-1.png?url", import.meta.url)
                        : new URL("../assets/backgrounds/總力戰底圖-2.png?url", import.meta.url)
                case BattleMode.Elimination:
                    return conditions.value.teamCount <= 2
                        ? new URL("../assets/backgrounds/大決戰底圖-1.png?url", import.meta.url)
                        : new URL("../assets/backgrounds/大決戰底圖-2.png?url", import.meta.url)
                case BattleMode.Test:
                    return new URL("../assets/backgrounds/考試底圖-1.png?url", import.meta.url)
                case BattleMode.Unrestrict:
                    return new URL("../assets/backgrounds/賽特底圖-1.png?url", import.meta.url)
            }
        },
        select(data) { return data.href }
    })

    return { url }
}