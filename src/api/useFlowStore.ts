export const useFlowStore = defineStore("軸", () => {
    const flow = ref(new Flow())
    return { flow }
})