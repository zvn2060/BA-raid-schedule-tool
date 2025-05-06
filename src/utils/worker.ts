import download from "downloadjs";
import workerpool from "workerpool";
// @ts-expect-error no-problem
import WorkerScriptsURL from "./workerScripts?url&worker"; // Adjust the path to your worker script

const pool = workerpool.pool(WorkerScriptsURL, { workerOpts: { type: "module" } });

export function workerDownload(name: string, files: Array<{ blob: Blob; name: string }>) {
  pool
    .exec("zipFiles", [files])
    .then(promise => promise)
    .then(blob => download(blob, `${name}.zip`));
}

export function workerCreateScene(name: string, battle: BattleObject, teams: TeamObject[]) {
  pool
    .exec("createProject", [battle, teams])
    .then(promise => promise)
    .then(blob => download(blob, `${name}.zip`));
}
