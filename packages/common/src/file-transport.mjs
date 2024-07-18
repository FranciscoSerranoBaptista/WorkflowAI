import { createWriteStream } from "node:fs";
import { once } from "node:events";

export default async function (options) {
  const stream = createWriteStream(options.destination, { flags: "a" });
  await once(stream, "open");
  return stream;
}
