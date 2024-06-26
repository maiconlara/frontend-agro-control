"use client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CreateFieldModal from "@/components/control/field/create-field-modal";
import StatusCodeHandler from "@/components/status-code-handler";
import LoadingAnimation from "@/components/loading-animation";
import FieldRow from "@/components/control/field/field-row";
import FilterInformation from "@/types/filter-information";
import { useGetFields } from "@/utils/hooks/useGetFields";
import SearchBar from "@/components/control/search-bar";
import Filter from "@/components/control/filter";
import FilterInformationLabel from "@/types/filter-information-label";
import FilterWithLabel from "@/components/control/filter-with-label";
import { Button } from "@/components/ui/button";
import Talhao from "@/types/talhao";
import { AxiosError } from "axios";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useAuth } from "@/utils/hooks/useAuth";
import { useGetCompanies } from "@/utils/hooks/useGetCompanies";
import { useGetUnits } from "@/utils/hooks/useGetUnits";
import Unidade from "@/types/unidade";
import Empresa from "@/types/empresa";



const statusFilter: FilterInformation = {
    filterItem: [
        { value: "A" },
        {
            value: "I",
        },
    ],
};

export default function Field() {
    const [query] = useQueryState("query");
    const [status] = useQueryState("status");
    const [unidade] = useQueryState("Unidades");
    const [empresa] = useQueryState("Empresas");
    const [enableFlag, setEnableFlag] = useState(false);
    const auth = useAuth();
    const user = auth.user;
    const isAdmin = user?.tipo === "D";

    const {
        data: { empresas = [] } = {}, // Objeto contendo a lista de empresas
        isError: isCompanyError,
        refetch: refetchCompanies,
    } = useGetCompanies(isAdmin ? true : false, isAdmin ? user?.grupo_id : null, null, null, null, false);

    const {
        data: { unidades = [] } = {},
        isLoading: isLoadingUnits, // Booleano que indica se está carregando
        refetch: refetchUnits, // Função que faz a requisição novamente
    } = useGetUnits(!isAdmin ? true : enableFlag, !isAdmin ? user?.empresa_id! : (isNaN(parseInt(empresa!)) ? null : parseInt(empresa!)), isAdmin ? user.grupo_id : null, null, null);



    const {
        data: { talhoes = [] } = {},
        error, // Erro retornado pela Api
        isError, // Booleano que indica se houve erro
        isLoading, // Booleano que indica se está carregando
        refetch: refetchFields, // Função que faz a requisição novamente
        isRefetching, // Booleano que indica se está fazendo a requisição novamente
    } = useGetFields(true, unidade != "Todas" ? null : user?.empresa_id!, isNaN(parseInt(unidade!)) ? null : parseInt(unidade!), status, query);

    const companyFilter: FilterInformationLabel = {
        filterItem: [
            { value: "all", label: "Todas" },
            ...empresas.map((empresa: Empresa) => ({
                value: empresa.id?.toString()!,
                label: empresa.nome!,
            })),
        ],
    };

    const unitFilter: FilterInformationLabel = {
        filterItem: [
            { value: "all", label: "Todas" },
            ...unidades.map((unit: Unidade) => ({
                value: unit.id?.toString()!,
                label: unit.nome!,
            })),
        ],
    };
    // Variavel que indica se está carregando ou refazendo a requisição
    const isLoadingData = isLoading || isRefetching;

    useEffect(() => {
        console.log(enableFlag);
        if (isCompanyError)
            refetchCompanies();
        if (empresa != null && empresa != "" && empresa != undefined) {
            setEnableFlag(true);
            refetchUnits();
        } else if (unidade != null && unidade != "" && unidade != undefined) {
            setEnableFlag(true);
            refetchFields();
        } else {
            setEnableFlag(false);
        }
    }, [empresa, unidade, query, status]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-start gap-10 px-6 pt-10 text-green-950 ">
            <div className="flex w-full flex-row ">
                <p className="font-poppins text-4xl font-medium">Talhões</p>
            </div>
            <div className="flex w-full flex-row items-start justify-start gap-4 ">
                <SearchBar text="Digite o nome para pesquisar..." />
                <Filter filter={statusFilter} paramType="status" />
                {isAdmin && <FilterWithLabel filter={companyFilter} paramType="Empresas" />}
                <FilterWithLabel filter={unitFilter} paramType="Unidades" />
                <CreateFieldModal refetchFields={refetchFields}>
                    <Button
                        type="button"
                        className="font-regular rounded-xl bg-green-500 py-5 font-poppins text-green-950 ring-0 transition-colors hover:bg-green-600"
                    >
                        Criar
                    </Button>
                </CreateFieldModal>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Código Talhao</TableHead>
                        <TableHead>Tamanho</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                    </TableRow>
                </TableHeader>


                {!isError &&
                    !isLoadingData &&
                    talhoes.map((talhao: Talhao) => {
                        return (
                            <TableBody>
                                <FieldRow key={talhao.id} talhao={talhao} refetchFields={refetchFields}/>
                            </TableBody>
                        );
                    })}
            </Table>
            {/* Renderiza a animação de loading se estiver carregando ou refazendo a requisição */}
            {isLoadingData && <LoadingAnimation />}
            {isAdmin && !enableFlag && <div className="flex w-full items-center justify-center font-medium">Filtre as empresas e unidades para exibir os talhões</div>}
            {/* Renderiza o componente com as mensagens de erro se houver erro e não estiver carregando */}
            {isError && !isLoadingData && <StatusCodeHandler requisitionType="field" error={error as AxiosError} />}
        </div>
    );
}
