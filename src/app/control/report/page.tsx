"use client";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StatusCodeHandler from "@/components/status-code-handler";
import LoadingAnimation from "@/components/loading-animation";
import { useAuth } from "@/utils/hooks/useAuth";
import { useQueryState } from "nuqs";
import { AxiosError } from "axios";
import { useEffect } from "react";
import { useGetEvents } from "@/utils/hooks/useGetEvents";
import Evento from "@/types/evento";
import ReportRow from "@/components/control/report/report-row";
import ReportCard from "@/components/control/report/report-card";

export default function Reports() {
    const auth = useAuth();
    const user = auth.user;
    // Hook que pega os parametros da URL
    const [query] = useQueryState("query"); // query é o nome do parametro que está na URL - Usado paro o campo busca.

    const {
        data: { eventos = [] } = {},
        error,
        isError,
        isLoading,
        refetch,
        isRefetching,
    } = useGetEvents(parseInt(query!));

    const isLoadingData = isLoading || isRefetching;

    useEffect(() => {


    }, [query]);

    console.log('isError:', isError);
    console.log('isLoadingData:', isLoadingData);
    console.log('query:', query);
    console.log('eventos:', eventos);

    return (

        <div className="flex h-screen w-full flex-col items-center justify-start gap-10 px-6 pt-10 text-green-950 ">
            <div className="flex w-full flex-row justify-between items-start ">
                <p className="font-poppins text-4xl font-medium">Relatório de Eventos</p>
                    <ReportCard />
            </div>
            <Table  >
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Data Inicio</TableHead>
                        <TableHead>Data Fim</TableHead>
                        <TableHead>Duração</TableHead>
                    </TableRow>
                </TableHeader>

                {/* Renderiza a lista de empresas SE não houver erro e nem estiver carregando  */}
                <TableBody>
                    {!isError && !isLoadingData && eventos && eventos.length > 0 &&
                        eventos.map((evento: Evento) => {
                            return (
                                <ReportRow key={evento.id} evento={evento} />
                            );
                        })
                    }
                    {/* {!isError && !isLoadingData && eventos && eventos.length === 0 && <div className="flex w-full items-center justify-center font-medium">Ordem encontrada mas sem nenhum evento capturado</div>} */}
                </TableBody>
            </Table>
         
            {/* Renderiza a animação de loading se estiver carregando ou refazendo a requisição */}
            {isLoadingData && <LoadingAnimation />}
            {/* Renderiza o componente com as mensagens de erro se houver erro e não estiver carregando */}
           {eventos.length === 0 && !isLoadingData && <div className="flex w-full items-center justify-center font-medium">Pesquise uma ordem para mostrar os eventos</div>}
            {isError && !isLoadingData && <StatusCodeHandler requisitionType="report" error={error as AxiosError} />}
        </div>
    );
}