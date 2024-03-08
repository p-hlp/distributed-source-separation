import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import { getRandomColor } from "./utils";

export const addMarker = (
  content: string,
  wavesurfer: WaveSurfer | undefined | null,
  regionsPlugin: RegionsPlugin | undefined | null
) => {
  if (!wavesurfer || !regionsPlugin) return;
  return regionsPlugin.addRegion({
    content: content,
    start: wavesurfer.getCurrentTime(),
    color: getRandomColor(),
  });
};

export const addRegion = (
  content: string,
  wavesurfer: WaveSurfer | undefined | null,
  regionsPlugin: RegionsPlugin | undefined | null,
  length = 15
) => {
  if (!wavesurfer || !regionsPlugin) return;
  console.log("length", length);
  return regionsPlugin.addRegion({
    content: content,
    start: wavesurfer.getCurrentTime(),
    end: wavesurfer.getCurrentTime() + length,
    color: getRandomColor(),
  });
};
