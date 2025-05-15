const pattern = /(?<student1>[^\s()]+)(\((?<comment>[^()]+)\))?/;

export function joinComment(commentA: string | undefined, commentB: string | undefined): string {
  return [commentA, commentB].filter(Boolean).join("，");
}

// FLOW     := STAGE [ → FLOW]
// STAGE    := ACTION [+STAGE] | COMMENT
// ACTION   := STUDENT[(COMMENT)]
// STUDENT  := [^\s]
// COMMENT  := [^()]
export function parseTextToStages(text: string, studentMap: StudentMap): Array<Stage> {
  if (!text) return [];
  const stageTexts = text.split(/\n+/).filter(it => it.trim().length).flatMap(line => line.split(" → "));
  const searchStudentByNameMap = new Map(
    Array.from(studentMap.values())
      .flatMap(student => [...student.aliases, student.name].map(key => [key, student])),
  );

  const aggregateStage = new Array<Stage>();
  stageTexts.forEach((stageText) => {
    const actions = new Array<Action>();
    const comments = new Array<string>();
    stageText.split("+").forEach((action) => {
      const match = action.match(pattern);
      if (match?.groups) {
        const { student1, comment } = match.groups;
        const actor = searchStudentByNameMap.get(student1)?.id;
        if (actor) actions.push({ actor });
        else comments.push(student1);
        if (comment) comments.push(comment);
      } else {
        comments.push(action);
      }
    });

    const stage = { actions, comment: comments.join(", ") };
    const previous = aggregateStage.at(-1)!;
    if (stage.comment || aggregateStage.length === 0) {
      if (previous) previous.comment = previous.comment || "順著費用放";
      aggregateStage.push(stage);
    } else {
      previous.comment = joinComment(previous.comment, stage.comment);
      previous.actions = [...previous.actions, ...stage.actions];
    }
  });
  return aggregateStage;
}
