import { BlobWriter, Data64URIReader, ZipWriter } from "@zip.js/zip.js";
import workerpool from "workerpool";

export async function zipFiles(files: Array<{ dataUrl: string; name: string }>) {
  const writer = new ZipWriter(new BlobWriter("application/zip"));
  await Promise.all(
    files.map(({ dataUrl, name }) => {
      writer.add(name, new Data64URIReader(dataUrl));
    }),
  );
  return writer.close();
};

workerpool.worker({
  zipFiles: zipFiles,
});
