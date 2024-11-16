import { useQuery } from "@tanstack/vue-query";

export function useStudents() {
    const { data: students } = useQuery({
        queryKey: ["students"],
        queryFn: () => SchaleDbClient
            .get<StudentDTO[]>("students.json")
            .then(data => data.map(({ Id, Name, PathName, School }) => ({
                Id, Name, PathName, School: mapSchool(School)
            })))
    })

    return { students }
}