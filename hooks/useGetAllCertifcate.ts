import { Certificate } from "@/app/types/response_certifates.dto";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";

export function useGetAllCertif() {
    const { data, error,isLoading,mutate,isValidating } = useSWR<Certificate[]>("/certificates", fetcher,{
        
    });
   
    return { data, error,isLoading,mutate,isValidating };
}