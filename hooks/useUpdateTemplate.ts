import { poster, putter } from "@/lib/fetcher"
import useSWRMutation from "swr/mutation"
type TemplatePayload = {
  id : string,
  name? : string,
  data? : any,
}

export function useUpdateTemplate() {
  const mutation = useSWRMutation(
    `/templates`, // adjust endpoint
    (url, { arg }: { arg: TemplatePayload }) => putter(url, arg)
  )

  return mutation
}