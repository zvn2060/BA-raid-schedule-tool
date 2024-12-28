import download from "downloadjs";
import Worker from "web-worker";
import workerBase64 from "./downloadWorker?worker&url";

const worker = new Worker(workerBase64, { type: "module" });

worker.addEventListener('message', e => {
    download(e.data.data, `${e.data.name}.zip`)
});

export function workerDownload(data: { files: Array<{ dataUrl: string, name: string }>, name: string }) {
    worker.postMessage(data)
}