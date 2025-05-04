export default defineNuxtRouteMiddleware((to) => {
  if (to.name !== "strategy-preview" && to.name !== "strategy-stages") return;
  const store = useBattleStore();
  if (store.teams.length) return;
  return navigateTo("/strategy/pick");
});
