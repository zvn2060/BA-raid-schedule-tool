import { keepPreviousData } from "@tanstack/vue-query";

export function useStudents(studentIds: MaybeRefOrGetter<StudentId[]>) {
  const studentIdsRef = toRef(studentIds);
  const queries = computed(() =>
    studentIdsRef.value.map(id => ({
      queryKey: ["students", id],
      placeholderData: keepPreviousData,
      queryFn: () => IndexDBClient.students.get(id!),
    })),
  );
  return useQueries({ queries, combine: results => new Map(results.filter(it => it.data).map(it => [it.data!.id, it.data!])) });
}
