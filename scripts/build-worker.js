import { mkdir } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";

const projectRoot = process.cwd();
const entryFile = path.join(projectRoot, "src", "be", "workers", "worker.js");
const outDir = path.join(projectRoot, "dist", "worker");
const outFile = path.join(outDir, "worker.cjs");

const buildWorker = async () => {
  await mkdir(outDir, { recursive: true });

  await build({
    entryPoints: [entryFile],
    outfile: outFile,
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node18",
    sourcemap: true,
    minify: true,
  });

  console.log("Worker build complete:", outFile);
};

buildWorker().catch((err) => {
  console.error("Worker build failed:", err);
  process.exitCode = 1;
});
