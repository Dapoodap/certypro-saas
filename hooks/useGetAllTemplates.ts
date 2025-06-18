import { Certificate } from "@/app/types/response_certifates.dto";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";

export function useGetAllTemplates() {
    const { data, error,isLoading,mutate,isValidating } = useSWR<any[]>("/templates", fetcher,{
        
    });
   
    return { data, error,isLoading,mutate,isValidating };
}