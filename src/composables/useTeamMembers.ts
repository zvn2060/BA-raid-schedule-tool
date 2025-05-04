import { keepPreviousData } from "@tanstack/vue-query";
import { keyBy } from "lodash-es";

export function useTeamMembers(team: MaybeRefOrGetter<Team>) {
  const teamRef = toRef(team);
  const queries = computed(() =>
    teamRef.value.members.filter(it => !!it).map(id => ({
      queryKey: ["students", id],
      enabled: id !== null,
      placeholderData: keepPreviousData,
      queryFn: () => IndexDBClient.students.get(id!),
    })),
  );
  return useQueries({ queries, combine: results => ({ data: keyBy(results.map(it => it.data), "id") }) });
}
