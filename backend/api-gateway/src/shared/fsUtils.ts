import { exec } from "child_process";
import fs from "fs/promises";
import getAudioDurationInSeconds from "get-audio-duration";
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

export const generateWaveFormJsonAndDuration = async (
  rawFile: RawFile,
  objectKey: string,
  fileType: string
): Promise<{ waveform: string; durationInSeconds: number }> => {
  const tmpDir = os.tmpdir();
  const outAudioName = `${objectKey}.${fileType}`;
  const tarPath = path.join(tmpDir, outAudioName);
  await fs.writeFile(tarPath, rawFile.data);

  const outJsoName = `${objectKey}.json`;
  const outPath = path.join(tmpDir, outJsoName);
  const cmd = `audiowaveform -i ${tarPath} -o ${outPath} --pixels-per-second 100 --bits 8`;
  await execCommand(cmd);

  const waveform = await readJsonFile(outPath);

  const durationInSeconds = await getAudioDurationInSeconds(tarPath);

  await removeTempFiles([outAudioName, outJsoName]);

  return { waveform, durationInSeconds };
};
