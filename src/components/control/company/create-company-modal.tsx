"use client";
import {
    Buildings,
    IdentificationCard,
    Phone,
    MapPin,
    MapTrifold,
    NavigationArrow,
    Factory,
    House,
    Hash,
    Flag,
    User,
    EnvelopeSimple,
    MagnifyingGlass,
    CircleNotch,
} from "@phosphor-icons/react";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {createCompanySchema} from "@/utils/validations/createCompanySchema";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {MaskedInput} from "@/components/ui/masked-input";
import {handleCnpjData} from "@/utils/handleCnpjData";
import {useToast} from "@/components/ui/use-toast";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {useTranslation} from "react-i18next";
import {Input} from "@/components/ui/input";
import {InputMask} from "@react-input/mask";
import {ReactNode, useState} from "react";
import {useForm} from "react-hook-form";
import Empresa from "@/types/empresa";
import { AxiosError } from "axios";
import { api } from "@/lib/api";
import {z} from "zod";

interface CreateCompanyProps {
    children: ReactNode;
}

type Form = z.infer<typeof createCompanySchema>;

const CreateCompanyModal = ({children}: CreateCompanyProps) => {
    // Estado que salva o carregamento da  busca do CNPJ
    const [isLoadingCnpj, setIsLoadingCnpj] = useState(false);
    const [open, setOpen] = useState(false);

    // Hook que inicia a toast 
    const {toast} = useToast();

    const queryClient = useQueryClient();
    const {t} = useTranslation();

    
   

    const form = useForm<Form>({
        resolver: zodResolver(createCompanySchema),
        defaultValues: {
            nome: "",
            cnpj: "",
            telefone: "",
            cep: "",
            estado: "",
            cidade: "",
            bairro: "",
            logradouro: "",
            numero: "",
            complemento: "",
            telefone_responsavel: "",
            email_responsavel: "",
            nome_responsavel: "",
        },
    });

    // Desenstruturando funcões do hook form
    const {getValues, setValue, watch} = form;

    // Variavel usada para monitorar o campo do cnpj
    const watchCnpj = watch("cnpj");
    // Variavel para validar o tamanho do campo do cnpj
    const cnpjValidLength = watchCnpj.length === 18;

    // Função para fazer a busca do cnpj no click
    const onHandleClick = async () => {
        setIsLoadingCnpj(true);
        const {cnpj} = getValues();
        const formattedCnpj = cnpj.replace(/\D/g, "");

        const isLengthValid = formattedCnpj.length === 14;

        if (isLengthValid) {
            const response = await handleCnpjData(formattedCnpj, setValue);
            if (response.error === true) {
                toast({
                    variant: "destructive",
                    title: "Falha ao preencher dados do CNPJ",
                    description:
                        "Ocorreu um erro na busca, ou excedeu o limite de tentativas. Por favor, tente novamente mais tarde.",
                });
            }
        }

        setIsLoadingCnpj(false);
    };
    // Função asincrona para dar o post com os dados formatados da empresa
    const createCompanyRequest = async (postData: Empresa | null) => {
        const {data} = await api.post("/empresas", postData);
        return data;
    };

    // Hook do react query para fazer a validação se foi sucesso ou se a requisição deu problema
    const {mutate, isPending, variables} = useMutation({
        mutationFn: createCompanyRequest,
        onSuccess: () => {
            toast({
                className:"border-green-500 bg-green-500",
                title: "Sucesso!",
                description: "A empresa foi cadastrada no sistema com sucesso.",
            });
            // Refetch na lista de empresas
            queryClient.refetchQueries({queryKey: ["companies"], type: "active", exact: true});
            setOpen(false);
            form.reset();
        },
        onError: (error: AxiosError) => {
            toast({
                variant: "destructive",
                title: "Error!",
                description: "Ocorreu um erro ao cadastrar a empresa.",
            });
        },
    });

    // Função de submit do formulário de criação de empresa
    const onHandleSubmit = (data: Form) => {
        const formattedData = {
            ...data,
            cnpj: data.cnpj.replace(/\D/g, ""),
            telefone: data.telefone.replace(/\D/g, ""),
            cep: data.cep.replace(/\D/g, ""),
            status: "A",
            telefone_responsavel: data.telefone_responsavel.replace(/\D/g, ""),
            gestor_id: 1,
        };
        // Aqui chama a função mutate do reactquery, jogando os dados formatados pra fazer a logica toda
        mutate(formattedData);
    };

    return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>{children}</DialogTrigger>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="font-poppins text-green-950">Criar Empresa</DialogTitle>
                        <DialogDescription>Insira as informações para criar uma empresa.</DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onHandleSubmit)}
                            id="company-form"
                            className="grid grid-cols-2 gap-4 py-4"
                        >
                            <FormField
                                control={form.control}
                                name="cnpj"
                                render={({field}) => (
                                    <FormItem className="col-span-2 flex w-full flex-row items-start justify-center gap-3 space-y-0">
                                        <div className="flex w-full flex-col gap-2">
                                            <FormControl>
                                                <MaskedInput
                                                    Icon={IdentificationCard}
                                                    {...field}
                                                    placeholder="CNPJ"
                                                    maskInput={{input: InputMask, mask: "__.___.___/____-__"}}
                                                />
                                            </FormControl>

                                            <FormMessage />
                                        </div>
                                        <Button
                                            onClick={onHandleClick}
                                            disabled={cnpjValidLength ? false : true}
                                            type="button"
                                            className="font-regular rounded-xl bg-green-500 py-5 font-poppins text-green-950 ring-0 transition-colors hover:bg-green-600"
                                        >
                                            {isLoadingCnpj ? (
                                                <CircleNotch className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <MagnifyingGlass className="h-5 w-5" />
                                            )}
                                        </Button>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="nome"
                                render={({field}) => (
                                    <FormItem className="col-span-1">
                                        <FormControl>
                                            <Input
                                                Icon={Buildings}
                                                id="nome"
                                                placeholder="Nome da Empresa"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="telefone"
                                render={({field}) => (
                                    <FormItem className="col-span-1">
                                        <FormControl>
                                            <MaskedInput
                                                {...field}
                                                Icon={Phone}
                                                placeholder="Telefone da Empresa"
                                                maskInput={{
                                                    input: InputMask,
                                                    mask: "(__) _____-____",
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="cep"
                                render={({field}) => (
                                    <FormItem className="col-span-1 ">
                                        <FormControl>
                                            <MaskedInput
                                                {...field}
                                                Icon={NavigationArrow}
                                                placeholder="CEP"
                                                maskInput={{
                                                    input: InputMask,
                                                    mask: "_____-___",
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="estado"
                                render={({field}) => (
                                    <FormItem className="col-span-1 ">
                                        <FormControl>
                                            <Input
                                                disabled
                                                Icon={MapTrifold}
                                                id="estado"
                                                placeholder={t(field.name)}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="cidade"
                                render={({field}) => (
                                    <FormItem className="col-span-1 ">
                                        <FormControl>
                                            <Input disabled Icon={MapPin} id="cidade" placeholder="Cidade" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="bairro"
                                render={({field}) => (
                                    <FormItem className="col-span-1 ">
                                        <FormControl>
                                            <Input Icon={Factory} id="bairro" placeholder="Bairro" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="logradouro"
                                render={({field}) => (
                                    <FormItem className="col-span-1 ">
                                        <FormControl>
                                            <Input Icon={House} id="logradouro" placeholder="Endereço" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="numero"
                                render={({field}) => (
                                    <FormItem className="col-span-1 ">
                                        <FormControl>
                                            <Input Icon={Hash} id="numero" placeholder="Número" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="complemento"
                                render={({field}) => (
                                    <FormItem className="col-span-1 ">
                                        <FormControl>
                                            <Input Icon={Flag} id="complemento" placeholder="Complemento" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="nome_responsavel"
                                render={({field}) => (
                                    <FormItem className="col-span-1">
                                        <FormControl>
                                            <Input
                                                Icon={User}
                                                id="nome_responsavel"
                                                placeholder="Nome do Responsável"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email_responsavel"
                                render={({field}) => (
                                    <FormItem className="col-span-1">
                                        <FormControl>
                                            <Input
                                                Icon={EnvelopeSimple}
                                                id="email_responsavel"
                                                placeholder="Email do Responsável"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="telefone_responsavel"
                                render={({field}) => (
                                    <FormItem className="col-span-1">
                                        <FormControl>
                                            <MaskedInput
                                                {...field}
                                                Icon={Phone}
                                                placeholder="Telefone do Responsável"
                                                maskInput={{
                                                    input: InputMask,
                                                    mask: "(__) _____-____",
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                    <DialogFooter>
                        <Button
                            type="submit"
                            form="company-form"
                            className="font-regular rounded-xl bg-green-500 py-5 font-poppins text-green-950 ring-0 transition-colors hover:bg-green-600"
                        >
                            Confirmar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

           
    );
};
export default CreateCompanyModal;
