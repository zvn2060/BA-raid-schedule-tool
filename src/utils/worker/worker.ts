import download from "downloadjs";
import workerpool from "workerpool";
import WorkerScriptsURL from "./scripts?url";

const pool = workerpool.pool(WorkerScriptsURL, { workerOpts: { type: "module" } });

export function workerDownload(name: string, files: Array<{ dataUrl: string; name: string }>) {
  pool
    .exec("zipFiles", [files])
    .then(promise => promise)
    .then(blob => download(blob, `${name}.zip`));
}
