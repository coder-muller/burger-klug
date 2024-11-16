import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select } from "@radix-ui/react-select";
import { Pencil, PlusCircle, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Produto {
    nome: string,
    categoria: string,
    valor: number
}

export default function Produtos() {
    const [produtos, setProdutos] = useState<Produto[]>([])

    const [produto, setProduto] = useState<string>("")
    const [categoria, setCategoria] = useState<string>("")
    const [valor, setValor] = useState<string>("")

    const [produtoSearch, setProdutoSearch] = useState<string>("")
    const [categoriaSearch, setCategoriaSearch] = useState<string>("Todas")

    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [selectedItem, setSelectedItem] = useState<Produto | null>(null)

    useEffect(() => {
        const storedProdutos: Produto[] = JSON.parse(localStorage.getItem("produtos") || "[]")
        storedProdutos.sort((b, a) => a.categoria.localeCompare(b.categoria))
        setProdutos(storedProdutos)
    }, [])

    useEffect(() => {
        handleFilter()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [produtoSearch, categoriaSearch])


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const produtosDatabase: Produto[] = JSON.parse(localStorage.getItem("produtos") || "[]");

        const newProduto: Produto = {
            nome: produto,
            categoria: categoria,
            valor: parseFloat(valor),
        };

        let updatedProdutos = [...produtosDatabase];

        if (selectedItem) {
            updatedProdutos = updatedProdutos.map((item) =>
                item.nome === selectedItem.nome &&
                    item.valor === selectedItem.valor &&
                    item.categoria === selectedItem.categoria
                    ? newProduto
                    : item
            );
        } else {
            updatedProdutos.push(newProduto);
        }

        localStorage.setItem("produtos", JSON.stringify(updatedProdutos));
        setProdutos(updatedProdutos.sort((b, a) => a.categoria.localeCompare(b.categoria)));

        setIsOpen(false);
        toast.success(selectedItem ? "Produto editado com sucesso!" : "Produto adicionado com sucesso!");
    };



    const handleOpenNew = () => {
        setProduto("")
        setCategoria("")
        setValor("")
        setSelectedItem(null)
        setIsOpen(true)
    }

    const handleOpenEdit = (produto: Produto) => {
        setProduto(produto.nome)
        setCategoria(produto.categoria)
        setValor(produto.valor.toString())
        setSelectedItem(produto)
        setIsOpen(true)
    }

    const handleDelete = (produto: Produto) => {
        const updatedProdutos = produtos.filter(p => p !== produto)
        setProdutos(updatedProdutos)
        localStorage.setItem("produtos", JSON.stringify(updatedProdutos))
        toast.success("Produto removido com sucesso!")
    }

    const handleFilter = () => {
        const produtosDatabase: Produto[] = JSON.parse(localStorage.getItem("produtos") || "[]");
    
        const filteredProdutos = produtosDatabase.filter((produto) => {
            const matchesNome = produto.nome.toLowerCase().includes(produtoSearch.toLowerCase());
            const matchesCategoria = categoriaSearch === "Todas" || produto.categoria === categoriaSearch;
            return matchesNome && matchesCategoria;
        });
    
        setProdutos(filteredProdutos.sort((b, a) => a.categoria.localeCompare(b.categoria)));
    };
    


    return (
        <div className="flex flex-col items-center justify-center w-11/12 m-auto gap-2">
            <div className="flex items-end justify-between w-full">
                <div className="flex items-end justify-start gap-2 w-full">
                    <div className="w-1/6">
                    <Label className="font-normal">Pesquisar produto</Label>
                    <Input placeholder="Pesquisar produto" className="w-full" value={produtoSearch} onChange={(e) => setProdutoSearch(e.target.value)} />
                    </div>
                    <div className="w-1/6">
                        <Label className="font-normal">Categoria</Label>
                        <Select onValueChange={(e) => setCategoriaSearch(e)} value={categoriaSearch}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="Todas">Todas</SelectItem>
                                    <SelectItem value="Hamburgueres">Hamburgueres</SelectItem>
                                    <SelectItem value="Batatas">Batatas</SelectItem>
                                    <SelectItem value="Bebidas">Bebidas</SelectItem>
                                    <SelectItem value="Adicionais">Adicionais</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                </div>
                <Button variant={"default"} onClick={() => handleOpenNew()}>
                    <PlusCircle />
                    Adicionar
                </Button>
            </div>
            <div className="w-full border rounded-md max-h-[420px] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead></TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {produtos.map((produto) => (
                            <TableRow key={produto.nome}>
                                <TableCell>{produto.nome}</TableCell>
                                <TableCell>{produto.categoria}</TableCell>
                                <TableCell>{produto.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                <TableCell><Pencil className="w-4 h-4 cursor-pointer" onClick={() => handleOpenEdit(produto)} /></TableCell>
                                <TableCell><Trash className="w-4 h-4 cursor-pointer" onClick={() => toast.warning("Você tem certeza que deseja remover esse produto?", {action: {label: "Sim", onClick: () => handleDelete(produto)}})} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedItem ? "Editar Produto" : "Novo Produto"}</DialogTitle>
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
                            <Button type="submit">{selectedItem ? "Editar" : "Adicionar"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
