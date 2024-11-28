import { useMutation } from "@tanstack/vue-query";

type UploadAvatarData = Array<{ name: string, data: Blob }>;

export function uploadAvatars() {
    const { mutateAsync } = useMutation({
        // mutationFn: (data: UploadAvatarData) => ()
    })
}