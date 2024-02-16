import { exec } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { promisify } from "util";
import { RawFile } from "./httpUtils";

const execAsync = promisify(exec);

export const execCommand = async (command: string): Promise<string> => {
  const { stdout } = await execAsync(command);
  console.log(stdout);
  return stdout;
};

export const removeDir = async (dir: string) => {
  try {
    await fs.rm(dir, { recursive: true, force: true });
    console.log(`Successfully removed directory: ${dir}`);
  } catch (error) {
    console.error(`Error removing directory: ${error}`);
  }
};

export const removeTempFiles = async (fileNames: string | string[]) => {
  const tempDir = os.tmpdir(); // Get the system temporary directory

  const files = Array.isArray(fileNames) ? fileNames : [fileNames];

  for (const fileName of files) {
    const filePath = path.join(tempDir, fileName); // Construct the full path to the file
    try {
      await fs.unlink(filePath);
      console.log(`Successfully removed file: ${filePath}`);
    } catch (error) {
      console.error(`Error removing file: ${error}`);
    }
  }
};

export const readJsonFile = async (filePath: string) => {
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading file: ${error}`);
  }
};

export const generateWaveFormJson = async (
  rawFile: RawFile,
  objectKey: string,
  fileType: string
): Promise<any> => {
  const tmpDir = os.tmpdir();
  const outAudioName = `${objectKey}.${fileType}`;
  const tarPath = path.join(tmpDir, outAudioName);
  await fs.writeFile(tarPath, rawFile.data);
  console.log("Wrote file to disk at", tarPath);

  // Use audiowave to create the waveform
  const outJsoName = `${objectKey}.json`;
  const outPath = path.join(tmpDir, outJsoName);
  const cmd = `audiowaveform -i ${tarPath} -o ${outPath} --pixels-per-second 20 --bits 8`;
  await execCommand(cmd);

  const jsonObject = await readJsonFile(outPath);

  await removeTempFiles([outAudioName, outJsoName]);

  return jsonObject;
};
