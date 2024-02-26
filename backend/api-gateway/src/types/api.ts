export interface FileInfoResponse {
  name: string;
  fileType: string;
  durationInSeconds: number;
  libraryName: string;
  parentName: string | undefined;
  slices: number;
  hasMidi: boolean;
  hasTranscription: boolean;
  createdAt: string;
  updatedAt: string;
}
