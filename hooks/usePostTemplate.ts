import { poster } from "@/lib/fetcher"
import useSWRMutation from "swr/mutation"
type TemplatePayload = {
  name : string,
  data : any,
}

export function usePostTemplate() {
  const mutation = useSWRMutation(
    '/templates', // adjust endpoint
    (url, { arg }: { arg: TemplatePayload }) => poster(url, arg)
  )

  return mutation
}