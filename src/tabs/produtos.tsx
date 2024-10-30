import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, SearchIcon, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogClose, DialogFooter, DialogHeader, DialogTitle, DialogContent } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Produto {
    nome: string,
    categoria: string,
    valor: number
}

export default function Produtos() {
    const [produtos, setProdutos] = useState<Produto[]>([])
    const [allProdutos, setAllProdutos] = useState<Produto[]>([])
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [produto, setProduto] = useState<string>("")
    const [categoria, setCategoria] = useState<string>("")
    const [valor, setValor] = useState<string>("")
    const [produtoSearch, setProdutoSearch] = useState<string>("")

    useEffect(() => {
        const storedProdutos: Produto[] = JSON.parse(localStorage.getItem("produtos") || "[]")
        storedProdutos.sort((b, a) => a.categoria.localeCompare(b.categoria))
        setProdutos(storedProdutos)
        setAllProdutos(storedProdutos)
    }, [])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const newProduto: Produto = {
            nome: produto,
            categoria: categoria,
            valor: parseFloat(valor)
        }
        const updatedProdutos = [...produtos, newProduto]
        setProdutos(updatedProdutos)
        setAllProdutos(updatedProdutos)
        localStorage.setItem("produtos", JSON.stringify(updatedProdutos))
        setProduto("")
        setCategoria("")
        setValor("")
        toast.success("Produto adicionado com sucesso!")
        setIsOpen(false)
    }

    const handleDelete = (produto: Produto) => {
        const updatedProdutos = produtos.filter(p => p !== produto)
        setProdutos(updatedProdutos)
        setAllProdutos(updatedProdutos) 
        localStorage.setItem("produtos", JSON.stringify(updatedProdutos))
        toast.success("Produto removido com sucesso!")
    }

    const handleFilter = () => {
        if (produtoSearch === "") {
            setProdutos(allProdutos)
        } else {
            const filteredProdutos = allProdutos.filter((produto) =>
                produto.nome.toLowerCase().includes(produtoSearch.toLowerCase())
            )
            setProdutos(filteredProdutos)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center w-11/12 m-auto gap-2">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center justify-start gap-2">
                    <Input placeholder="Pesquisar produto" className="w-auto" value={produtoSearch} onChange={(e) => setProdutoSearch(e.target.value)} />
                    <Button variant={"secondary"} onClick={handleFilter}><SearchIcon /></Button>
                </div>
                <Button variant={"default"} onClick={() => setIsOpen(true)}>
                    <PlusCircle />
                    Adicionar
                </Button>
            </div>
            <div className="w-full border rounded-md max-h-[500px] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {produtos.map((produto) => (
                            <TableRow key={produto.nome}>
                                <TableCell>{produto.nome}</TableCell>
                                <TableCell>{produto.categoria}</TableCell>
                                <TableCell>{produto.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                <TableCell><Trash className="w-4 h-4 cursor-pointer" onClick={() => handleDelete(produto)} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo Produto</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <Label>Nome do produto</Label>
                            <Input type="text" placeholder="Nome do Produto" required value={produto} onChange={(e) => setProduto(e.target.value)} />
                        </div>
                        <div>
                            <Label>Categoria</Label>
                            <Select defaultValue={categoria} onValueChange={(e) => setCategoria(e)} value={categoria}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione uma categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="Hamburgueres">Hamburgueres</SelectItem>
                                        <SelectItem value="Batatas">Batatas</SelectItem>    
                                        <SelectItem value="Bebidas">Bebidas</SelectItem>
                                        <SelectItem value="Adicionais">Adicionais</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Valor</Label>
                            <Input type="text" placeholder="Valor" required value={valor} onChange={(e) => setValor(e.target.value)} />
                        </div>
                        <DialogFooter className="mt-3">
                            <DialogClose asChild>
                                <Button type="reset" variant={"secondary"}>Cancelar</Button>
                            </DialogClose>
                            <Button type="submit">Salvar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
