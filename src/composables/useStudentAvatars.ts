import { useQuery } from "@tanstack/vue-query";
import type { MaybeRefOrGetter } from "vue";

export function useStudentAvatar(idRef: MaybeRefOrGetter<number | undefined>) {
    const id = toRef(idRef)
    const enabled = computed(() => id.value !== undefined)
    const { data: avatar } = useQuery({
        queryKey: ["avatars", { id }],
        enabled,
        queryFn: async () => IndexDBClient.students.get(id.value!),
        select: (data) => {
            if (!data) return undefined;
            if (!data.image) return `https://schaledb.com/images/student/icon/${data.id}.webp`;
            return URL.createObjectURL(data.image)
        }
    })

    return { avatar }
}