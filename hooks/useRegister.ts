// hooks/useRegister.ts
import useSWRMutation from 'swr/mutation';
import { poster } from '@/lib/fetcher';

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};
// E:\Kuliah\project\certypro\app\api\auth\register\route.ts
export const useRegister = () =>
  useSWRMutation(
    '/auth/register',
    async (key: string, { arg }: { arg: RegisterInput }) => {
      return poster(key, arg);
    }
  );
