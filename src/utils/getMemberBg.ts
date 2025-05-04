export function getMemberBg(structure: TeamStructure, member: Member, index: number) {
  if (!member) return "bg-empty";
  const boundary = structure === "normal" ? 4 : 6;
  return index < boundary ? "bg-striker" : "bg-special";
}
