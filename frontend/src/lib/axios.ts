import axios, { AxiosRequestConfig } from "axios";

const separationConfig: AxiosRequestConfig = {
  baseURL: "http://127.0.0.1:8000",
};

export const separationAxiosInstance = axios.create(separationConfig);

const audioToMidiConfig: AxiosRequestConfig = {
  baseURL: "http://127.0.0.1:9090",
};
export const audioToMidiAxiosInstance = axios.create(audioToMidiConfig);
