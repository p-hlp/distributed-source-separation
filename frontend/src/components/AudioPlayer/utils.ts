import { Region } from "wavesurfer.js/dist/plugins/regions.js";
import { ExportedRegion } from "./types";

const random = (min: number, max: number) => Math.random() * (max - min) + min;

export const getRandomColor = () =>
  `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;

export const extractTextFromContent = (element: HTMLElement | undefined) => {
  if (!element) return "NO_CONTENT";
  return element.textContent ?? "NO_CONTENT";
};

export const mapToExportedRegions = (regions: Region[]): ExportedRegion[] => {
  return regions.map((region: Region) => {
    const name = extractTextFromContent(region.content);
    return {
      name: name,
      start: region.start,
      end: region.end,
    };
  });
};

export const durationToMaxZoom = (durationInSeconds: number): number => {
  const baselineDuration = 180; // 2:30min is avarage track length
  const baselineMaxZoom = 300;
  const scalingFactor = 10; // can be adjusted

  const durationRatio = durationInSeconds / baselineDuration;

  const maxZoom =
    baselineMaxZoom / durationRatio + scalingFactor * (1 - durationRatio);

  return maxZoom;
};
