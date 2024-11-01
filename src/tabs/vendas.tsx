import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import IMask from 'imask'
import { v4 as uuidv4 } from 'uuid';

interface Produto {
    id: string,
    nome: string,
    categoria: string,
    valor: number
    adicionais: Adicionais[]
}

interface Adicionais {
    nome: string,
    valor: number
}

export default function Vendas() {

    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [isDialogAdicionaisOpen, setIsDialogAdicionaisOpen] = useState<boolean>(false)

    const [selectedItem, setSelectedItem] = useState<Produto | null>(null)

    const [nomeAdicional, setNomeAdicional] = useState<string>('')
    const [valorAdicional, setValorAdicional] = useState<string>('')
    const valorAdicionalRef = useRef<HTMLInputElement>(null)

    const [Hamburgueres, setHamburgueres] = useState<Produto[]>([])
    const [Batatas, setBatatas] = useState<Produto[]>([])
    const [Bebidas, setBebidas] = useState<Produto[]>([])
    const [Adicionais, setAdicionais] = useState<Produto[]>([])
    const valorTeleRef = useRef<HTMLInputElement>(null)

    const [nomeCliente, setNomeCliente] = useState<string>('')
    const [enderecoCliente, setEnderecoCliente] = useState<string>('')
    const [valorTele, setValorTele] = useState<string>('')

    const [itensVenda, setItensVenda] = useState<Produto[]>([])
    const [quantidades, setQuantidades] = useState<{ [key: string]: number }>({})

    useEffect(() => {
        const storedProdutos: Produto[] = JSON.parse(localStorage.getItem("produtos") || "[]")
        setHamburgueres(storedProdutos.filter(p => p.categoria === "Hamburgueres"))
        setBatatas(storedProdutos.filter(p => p.categoria === "Batatas"))
        setBebidas(storedProdutos.filter(p => p.categoria === "Bebidas"))
        setAdicionais(storedProdutos.filter(p => p.categoria === "Adicionais"))
    }, [])

    useEffect(() => {
        if (isDialogAdicionaisOpen && valorAdicionalRef.current) {
            const maskOptions = {
                mask: Number,
                thousandsSeparator: ".",
                radix: ",",
                mapToRadix: [","],
            };
            const maskInstance = IMask(valorAdicionalRef.current, maskOptions);
            maskInstance.on("accept", () => {
                setValorAdicional(maskInstance.value);
            });
            return () => {
                maskInstance.destroy();
            };
        }
    }, [isDialogAdicionaisOpen]);

    useEffect(() => {
        if (isOpen && valorTeleRef.current) {
            const maskOptions = {
                mask: Number,
                thousandsSeparator: ".",
                radix: ",",
                mapToRadix: [","],
            };
            const maskInstance = IMask(valorTeleRef.current, maskOptions);
            maskInstance.on("accept", () => {
                setValorTele(maskInstance.value);
            });
            return () => {
                maskInstance.destroy();
            };
        }
    }, [isOpen]);

    const handleAddItem = (produto: Produto) => {
        const item = {
            id: uuidv4(),
            nome: produto.nome,
            categoria: produto.categoria,
            valor: produto.valor,
            adicionais: []
        }
        setItensVenda([...itensVenda, item])
        setQuantidades(prev => ({ ...prev, [produto.nome]: (prev[produto.nome] || 0) + 1 }))
        //toast.info("Item adicionado com sucesso!", { description: `${produto.nome} valor: ${(produto.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}` })
    }

    const limparPedido = () => {
        setItensVenda([]);
        setQuantidades({});
        toast.info("Pedido limpo com sucesso!");
    };


    const handleRemoveItem = (e: React.MouseEvent, produto: Produto) => {
        e.stopPropagation();

        const novaQuantidade = (quantidades[produto.nome] || 0) - 1;

        if (novaQuantidade > 0) {
            setQuantidades(prev => ({ ...prev, [produto.nome]: novaQuantidade }));
        } else {
            setQuantidades(prev => {
                const newQuantidades = { ...prev };
                delete newQuantidades[produto.nome];
                return newQuantidades;
            });
        }

        setItensVenda(prevItens => {
            const index = prevItens.findIndex(p => p.nome === produto.nome);
            if (index !== -1) {
                const newItens = [...prevItens];
                newItens.splice(index, 1)
                return newItens;
            }
            return prevItens;
        });

        toast.info("Item removido com sucesso!", {
            description: `${produto.nome} valor: ${(produto.valor).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`
        });
    };

    const handleAddAdicionais = () => {
        const valorFormatado = valorAdicional.toString().replace(".", "").replace(",", ".")
        if (!selectedItem) {
            toast.error('Nenhum Item pré-selecionado!')
            return
        }
        if (!nomeAdicional || !valorAdicional) {
            toast.error('Preencha todos os campos!')
            return
        }

        const index = itensVenda.findIndex(p => p.id === selectedItem.id)
        const item = itensVenda[index]
        item.adicionais = item.adicionais || []

        item.adicionais = [
            ...item.adicionais,
            {
                nome: nomeAdicional.trim(),
                valor: Number(valorFormatado.trim())
            }
        ];

        toast.success('Adicionado com sucesso!')
        setIsDialogAdicionaisOpen(false)
        setSelectedItem(null)
    }

    function calcularTotalPedido(pedido: Array<{ valor: number; adicionais: Array<{ valor: number }> }>): string {

        const total = pedido.reduce((acumulador, item) =>
            acumulador + item.valor + item.adicionais.reduce((acc, adicional) => acc + adicional.valor, 0), 0);

        const valorTotal = total + Number((valorTele).replace(",", "."));
        return valorTotal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    return (
        <div className="flex flex-col items-center justify-center w-11/12 m-auto gap-2">
            <div className="flex items-end justify-between w-full">
                <div className="flex items-center justify-center gap-6" >
                    <h1 className="font-bold text-lg" >Total: {calcularTotalPedido(itensVenda)}</h1>
                </div>
                <div className="flex items-center justify-end gap-2">
                    <Button variant={"ghost"} onClick={limparPedido}>Limpar Pedido</Button>
                    <Button variant={"default"} onClick={() => {
                        if (itensVenda.length === 0) {
                            toast.error("Você precisa adicionar pelo menos um item para finalizar o pedido!");
                            return;
                        }
                        setIsOpen(true)
                    }}>Resumo</Button>
                </div>
            </div>
            <div className="w-full p-3 flex items-start justify-center gap-3">
                <Card className="w-1/4">
                    <CardHeader>
                        <CardTitle>Hamburgueres</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 max-h-[430px] overflow-y-auto p-3">
                        {Hamburgueres.map((produto) => (
                            <div className="flex items-center justify-between w-full border rounded-md px-5 py-2 cursor-pointer" onClick={() => handleAddItem(produto)}>
                                <div className="flex items-center justify-between w-full">
                                    <h1>{produto.nome}</h1>
                                    <div className="flex items-center gap-4">
                                        {quantidades[produto.nome] > 0 && (
                                            <>
                                                <span>{quantidades[produto.nome]}</span>
                                                <MinusCircle className="cursor-pointer" onClick={(e) => handleRemoveItem(e, produto)} />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Card className="w-1/4">
                    <CardHeader>
                        <CardTitle>Batatas</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 max-h-[430px] overflow-y-auto">
                        {Batatas.map((produto) => (
                            <div className="flex items-center justify-between w-full border rounded-md px-5 py-2 cursor-pointer" onClick={() => handleAddItem(produto)}>
                                <div className="flex items-center justify-between w-full">
                                    <h1>{produto.nome}</h1>
                                    <div className="flex items-center gap-4">
                                        {quantidades[produto.nome] > 0 && (
                                            <>
                                                <span>{quantidades[produto.nome]}</span>
                                                <MinusCircle className="cursor-pointer" onClick={(e) => handleRemoveItem(e, produto)} />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card><Card className="w-1/4">
                    <CardHeader>
                        <CardTitle>Bebidas</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 max-h-[430px] overflow-y-auto">
                        {Bebidas.map((produto) => (
                            <div className="flex items-center justify-between w-full border rounded-md px-5 py-2 cursor-pointer" onClick={() => handleAddItem(produto)}>
                                <div className="flex items-center justify-between w-full">
                                    <h1>{produto.nome}</h1>
                                    <div className="flex items-center gap-4">
                                        {quantidades[produto.nome] > 0 && (
                                            <>
                                                <span>{quantidades[produto.nome]}</span>
                                                <MinusCircle className="cursor-pointer" onClick={(e) => handleRemoveItem(e, produto)} />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card><Card className="w-1/4">
                    <CardHeader>
                        <CardTitle>Adicionais</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 max-h-[430px] overflow-y-auto">
                        {Adicionais.map((produto) => (
                            <div className="flex items-center justify-between w-full border rounded-md px-5 py-2 cursor-pointer" onClick={() => handleAddItem(produto)}>
                                <div className="flex items-center justify-between w-full">
                                    <h1>{produto.nome}</h1>
                                    <div className="flex items-center gap-4">
                                        {quantidades[produto.nome] > 0 && (
                                            <>
                                                <span>{quantidades[produto.nome]}</span>
                                                <MinusCircle className="cursor-pointer" onClick={(e) => handleRemoveItem(e, produto)} />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetContent>
                        <SheetHeader>
                            <SheetTitle>Resumo do Pedido</SheetTitle>
                        </SheetHeader>
                        <div className="flex flex-col gap-2 w-full max-h-[620px] overflow-y-auto my-4">
                            {itensVenda.map((produto) => (
                                <>
                                    <div
                                        key={produto.nome}
                                        className="flex flex-col items-center justify-start w-full border rounded-md px-5 py-2"
                                    >
                                        <div className="w-full flex items-center justify-between">
                                            <h1>{produto.categoria} | {produto.nome}</h1>
                                            <PlusCircle className="cursor-pointer" onClick={() => {
                                                setSelectedItem(produto)
                                                setNomeAdicional('')
                                                setValorAdicional('')
                                                setIsDialogAdicionaisOpen(true)
                                            }} />
                                        </div>

                                        {produto.adicionais && produto.adicionais.map((adicional) => (
                                            <div className="flex items-center justify-between w-full px-2">
                                                <h1>- {adicional.nome}</h1>
                                                <h1>{(adicional.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
                                            </div>
                                        )
                                        )}

                                    </div>
                                </>
                            ))}
                            <h1 className="my-4 text-right"><span className="font-bold"> Total: R$ {calcularTotalPedido(itensVenda)}</span></h1>

                            <div className="flex flex-col">
                                <div>
                                    <Label>Nome do Cliente</Label>
                                    <Input placeholder="Nome do cliente" value={nomeCliente} onChange={e => setNomeCliente(e.target.value)} />
                                </div>
                                <div>
                                    <Label>Endereço do Cliente</Label>
                                    <Input placeholder="Endereço do cliente" value={enderecoCliente} onChange={e => setEnderecoCliente(e.target.value)} />
                                </div>
                                <div>
                                    <Label>Valor da Tele</Label>
                                    <Input placeholder="Valor da tele" ref={valorTeleRef} value={valorTele} onChange={e => setValorTele(e.target.value)} />
                                </div>
                            </div>


                        </div>
                        <SheetFooter>
                            <Button variant={"default"} onClick={() => toast.info("Ainda em Desenvolvimento...")}>
                                Finalizar Pedido
                            </Button>
                            <SheetClose asChild>
                                <Button variant={"secondary"}>Cancelar</Button>
                            </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
                <Dialog open={isDialogAdicionaisOpen} onOpenChange={setIsDialogAdicionaisOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Adicionais do item</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                                <Label>Nome do Adicional</Label>
                                <Input placeholder="Nome do adicional" value={nomeAdicional} onChange={e => setNomeAdicional(e.target.value)} />
                            </div>
                            <div className="col-span-1">
                                <Label>Valor do Adicional</Label>
                                <Input placeholder="Valor do adicional" ref={valorAdicionalRef} value={valorAdicional} onChange={e => setValorAdicional(e.target.value)} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddAdicionais}>Adicionar</Button>
                            <DialogClose asChild>
                                <Button variant={"secondary"}>Cancelar</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
