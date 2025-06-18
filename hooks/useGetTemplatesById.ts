import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";

export function useGetTemplateById(id?: string) {
  const shouldFetch = !!id; // hanya fetch kalau ada id

  const { data, error, isLoading, mutate, isValidating } = useSWR(
    shouldFetch ? `/templates/${id}` : null,
    fetcher
  );

  return { data, error, isLoading, mutate, isValidating };
}
