import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { keyBy } from "lodash-es";
import type { MaybeRefOrGetter } from "vue";

type UploadAvatarData = Array<File>;
/*
    "千紗(樂團)",
    "日和(泳裝)",
    "吹雪(泳裝)",
    "沙織(泳裝)",
    "星野(臨戰)",
    "美禰(偶像)",
    "桃井(女僕)",
    "桐乃(泳裝)",
    "茜香(泳裝)",
    "喜美(樂團)",
    "敦子(泳裝)",
    "智美子",
    "智惠(旗袍)",
    "萌(泳裝)",
    "愛莉(樂團)",
    "瑪麗(偶像)",
    "瑪麗娜(旗袍)",
    "綠(女僕)",
    "環奈(泳裝)",
    "櫻子(偶像)"
*/

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