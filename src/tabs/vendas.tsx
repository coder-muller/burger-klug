import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MinusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Produto {
    nome: string,
    categoria: string,
    valor: number
}

export default function Vendas() {

    const [isOpen, setIsOpen] = useState<boolean>(false)

    const [Hamburgueres, setHamburgueres] = useState<Produto[]>([])
    const [Batatas, setBatatas] = useState<Produto[]>([])
    const [Bebidas, setBebidas] = useState<Produto[]>([])
    const [Adicionais, setAdicionais] = useState<Produto[]>([])

    const [itensVenda, setItensVenda] = useState<Produto[]>([])
    const [quantidades, setQuantidades] = useState<{ [key: string]: number }>({})

    useEffect(() => {
        const storedProdutos: Produto[] = JSON.parse(localStorage.getItem("produtos") || "[]")
        setHamburgueres(storedProdutos.filter(p => p.categoria === "Hamburgueres"))
        setBatatas(storedProdutos.filter(p => p.categoria === "Batatas"))
        setBebidas(storedProdutos.filter(p => p.categoria === "Bebidas"))
        setAdicionais(storedProdutos.filter(p => p.categoria === "Adicionais"))
    }, [])

    const handleAddItem = (produto: Produto) => {
        setItensVenda([...itensVenda, produto])
        setQuantidades(prev => ({ ...prev, [produto.nome]: (prev[produto.nome] || 0) + 1 }))
        toast.info("Item adicionado com sucesso!", { description: `${produto.nome} valor: ${(produto.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}` })
    }

    const limparPedido = () => {
        setItensVenda([]);
        setQuantidades({});
        toast.info("Pedido limpo com sucesso!");
    };


    const handleRemoveItem = (e: React.MouseEvent, produto: Produto) => {
        e.stopPropagation()
        const novaQuantidade = (quantidades[produto.nome] || 0) - 1
        if (novaQuantidade > 0) {
            setQuantidades(prev => ({ ...prev, [produto.nome]: novaQuantidade }))
        } else {
            setQuantidades(prev => {
                const newQuantidades = { ...prev }
                delete newQuantidades[produto.nome]
                return newQuantidades
            })
        }
        setItensVenda(itensVenda.filter(p => p !== produto))
        toast.info("Item removido com sucesso!", { description: `${produto.nome} valor: ${(produto.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}` })
    }

    return (
        <div className="flex flex-col items-center justify-center w-11/12 m-auto gap-2">
            <div className="flex items-end justify-between w-full">
                <div className="flex items-center justify-center gap-6" >
                    <h1 className="font-bold text-lg" >Total: {itensVenda.reduce((acumulador, produto) => acumulador + produto.valor, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
                </div>
                <div className="flex items-center justify-end gap-2">
                    <Button variant={"ghost"} onClick={limparPedido}>Limpar Pedido</Button>
                    <Button variant={"default"} onClick={() => setIsOpen(true)}>Finalizar Pedido</Button>
                </div>
            </div>
            <div className="w-full p-3 flex items-start justify-center gap-3">
                <Card className="w-1/4">
                    <CardHeader>
                        <CardTitle>Hamburgueres</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
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
                    <CardContent className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
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
                    <CardContent className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
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
                    <CardContent className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
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
                            <SheetTitle>Pedido Completo</SheetTitle>
                        </SheetHeader>
                        <h1>Hello</h1>
                        <SheetFooter>
                            <SheetClose asChild>
                                <Button variant={"secondary"}>Cancelar</Button>
                            </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    )
}
