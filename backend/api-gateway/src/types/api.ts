export interface FileInfoResponse {
  name: string;
  fileType: string;
  durationInSeconds: number;
  libraryName: string;
  parentName: string | undefined;
  hasMidi: boolean;
  hasTranscription: boolean;
  isVocal: boolean;
  createdAt: string;
  updatedAt: string;
}
