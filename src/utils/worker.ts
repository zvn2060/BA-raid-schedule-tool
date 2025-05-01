import download from "downloadjs";
import workerpool from "workerpool";
import WorkerScriptsURL from "./workerScripts?url";

const pool = workerpool.pool(WorkerScriptsURL, { workerOpts: { type: "module" } });

export function workerDownload(name: string, files: Array<{ blob: Blob; name: string }>) {
  pool
    .exec("zipFiles", [files])
    .then(promise => promise)
    .then(blob => download(blob, `${name}.zip`));
}

export function workerCreateScene(name: string, battle: object) {
  pool
    .exec("createProject", [battle])
    .then(promise => promise)
    .then(blob => download(blob, `${name}.zip`));
}
