import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { keyBy } from "lodash-es";
import type { MaybeRefOrGetter } from "vue";

type UploadAvatarData = Array<File>;

export function uploadStudentAvatar() {
    const queryClient = useQueryClient()
    const { mutateAsync: upload } = useMutation({
        async mutationFn(data: UploadAvatarData) {
            const updateMap = keyBy(data, it => it.name.replace(/\.[^/.]+$/, ""));
            const names = Object.keys(updateMap);
            const notInDatabase = new Set(names)
            const success = new Set<string>()
            await IndexDBClient.students
                .where("name")
                .anyOf(names)
                .modify(student => {
                    student.image = updateMap[student.name];
                    notInDatabase.delete(student.name);
                    success.add(student.name)
                })
            await queryClient.invalidateQueries({ queryKey: ["avatars"] })
        }
    })

    return { upload }
}

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