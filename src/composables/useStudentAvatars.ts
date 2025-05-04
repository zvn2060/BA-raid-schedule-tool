import { useQuery } from "@tanstack/vue-query";
import type { MaybeRefOrGetter } from "vue";

export function useStudentAvatar(member: MaybeRefOrGetter<Member>) {
  const memberRef = toRef(member);
  const enabled = computed(() => !!memberRef.value);
  const { data: avatar } = useQuery({
    queryKey: ["students", memberRef],
    enabled,
    queryFn: () => IndexDBClient.students.get(memberRef.value!),
    select: (data) => {
      if (!data) return undefined;
      if (!data.image) return `https://schaledb.com/images/student/icon/${data.id}.webp`;
      return URL.createObjectURL(data.image);
    },
  });

  return { avatar };
}
