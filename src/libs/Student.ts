declare global {
    type StudentDTO = {
        Id: number
        School: string,
        StarGrade: number,
        Name: string,
        SquadType: "Main" | "Support"
    }
}