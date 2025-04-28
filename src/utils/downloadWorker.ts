import { BlobWriter, Data64URIReader, ZipWriter } from "@zip.js/zip.js";

addEventListener("message", async (e) => {
  const writer = new ZipWriter(new BlobWriter("application/zip"));
  if (!e.data.files) return;
  await Promise.all(e.data.files.map(({ dataUrl, name }: { dataUrl: string; name: string }) => {
    writer.add(name, new Data64URIReader(dataUrl));
  }));
  const blob = await writer.close();
  postMessage({ data: blob, name: e.data.name });
});
