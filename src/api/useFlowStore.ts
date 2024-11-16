export const useBattleStore = defineStore("軸", () => {
    const battle = ref(new Battle())
    return { battle }
})