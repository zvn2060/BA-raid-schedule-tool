import { keyBy } from "lodash-es";
import { IndexDBClient } from "~/shared";

type UploadAvatarData = Array<File>;

export function uploadStudentAvatars() {
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