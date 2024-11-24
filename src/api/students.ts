import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { Collection, InsertType } from "dexie";
import { set, uniqBy } from "lodash-es";
import type { Ref } from "vue";


type StudentsQueryParams = {
    name: string,
}

type Pagination = {
    first: number,
    itemPerPage: number
}

function hasQuery(param: StudentsQueryParams) {
    return param.name;
}

type StudentWriteModel = Omit<Student, "id" | "name" | "keywords">

type UpdateStudentVariables<T> = { id: number, field: string, value: T[keyof T] }

export function useStudents(params: Ref<StudentsQueryParams>, pagination?: Ref<Pagination>) {
    const queryClient = useQueryClient()
    const { data: students } = useQuery({
        queryKey: ["students", params, pagination],
        queryFn: () => {
            let query = IndexDBClient.students;
            let collection: Collection<Student, number, InsertType<Student, "id">>
            if (hasQuery(params.value))
                collection = query.where("keywords").equals(params.value.name)
            else
                collection = query.toCollection()
            if (pagination)
                collection = collection
                    .offset(pagination.value.first)
                    .limit(pagination.value.itemPerPage)

            return collection.toArray().then(data => uniqBy(data, it => it.id))
        },
        placeholderData: old => old ?? []
    })

    const { data: total } = useQuery({
        queryKey: ["students-total", params],
        queryFn: () => hasQuery(params.value)
            ? IndexDBClient.students
                .where("keywords")
                .equals(params.value.name)
                .count()
            : IndexDBClient.students
                .count()
    })

    const { mutateAsync: update } = useMutation({
        mutationFn: (data: UpdateStudentVariables<StudentWriteModel>) =>
            IndexDBClient.students
                .where("id")
                .equals(data.id)
                .modify(student => {
                    if (data.field === "aliases") {
                        student.aliases.length = 0;
                        student.aliases.push(...(data.value as string[]));
                        student.keywords = calculateKeywords(student)
                    } else {
                        set(student, data.field, data.value);
                    }
                }),
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: ["students"], exact: true })
            queryClient.invalidateQueries({ queryKey: ["students", params, pagination], exact: true })
        }
    })

    return { students, total, update }
}
