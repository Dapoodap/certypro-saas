import { deleter, poster, putter } from "@/lib/fetcher"
import useSWRMutation from "swr/mutation"
type TemplatePayload = {
  id : string
}

export function useDeleteTemplate() {
  const mutation = useSWRMutation(
    `/templates`, // adjust endpoint
    (url, { arg }: { arg: TemplatePayload }) => deleter(url, arg)
  )

  return mutation
}