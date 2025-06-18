import axios from "./axios";

export const fetcher = (url: string) =>
  axios.get(url).then((res) => res.data);

export const poster = <T = any>(url: string, data: any) =>
  axios.post<T>(url, data).then((res) => res.data);

export const putter = <T = any>(url: string, data: any) =>
  axios.put<T>(url, data).then((res) => res.data);

export const deleter = <T = any>(url: string, data: any) =>
  axios.delete<T>(url, { data }).then((res) => res.data);
