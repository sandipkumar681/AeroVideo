import { exec } from "child_process";

export const getVideoDuration = (filePath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    exec(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`,
      (error, stdout) => {
        if (error) return reject(error);
        resolve(Math.floor(Number(stdout)));
      }
    );
  });
};
