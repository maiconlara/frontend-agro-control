import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import GetMaquina from "@/types/get-maquina";

const getMachinesRequest = async (id_empresa: number | null, codigo: string | null, status: string | null) => {
    const { data } = await api.get<GetMaquina>("/maquinas", {
        params: {
            id_empresa: id_empresa,
            codigo: codigo,
            status: status,
        },
    });
    return data;
};

export const useGetMachines = (enableFlag: boolean, id_empresa: number | null, status: string | null, codigo: string | null) => {
    return useQuery({
        queryKey: ["machines", id_empresa, codigo, status],
        queryFn: () => getMachinesRequest(id_empresa, codigo, status),
        enabled: enableFlag,
        retry: (failureCount, error) => {

            if (error instanceof Error && error.message.includes("404")) {
                if (failureCount == 3)
                    return false;
            }

            return true;
        },
    });
};