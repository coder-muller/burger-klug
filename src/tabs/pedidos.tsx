import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Pedido } from "./vendas";
import { useEffect, useRef, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import { toast } from "sonner";

export default function Pedidos() {
    const [pedidos, setPedidos] = useState<Pedido[]>([])
    const [intervalo, setIntervalo] = useState<string>("Hoje")
    const [pedidosFiltrados, setPedidosFiltrados] = useState<Pedido[]>([])
    const [valorTotalPedidos, setValorTotalPedidos] = useState<number>(0);
    const [totalPedidos, setTotalPedidos] = useState<number>(0);
    const [dataInicio, setDataInicio] = useState<string>("")
    const [dataFim, setDataFim] = useState<string>("")
    const dataInicioRef = useRef<HTMLInputElement>(null)
    const dataFimRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const storedPedidos: Pedido[] = JSON.parse(localStorage.getItem("pedidos") || "[]").map((pedido: Pedido) => ({
            ...pedido,
            data: new Date(pedido.data)
        }));
        setPedidos(storedPedidos.reverse())
    }, [])

    useEffect(() => {
        handleFilter()
    }, [intervalo, pedidos])

    function parseDate(dateString: string): Date | null {
        const [day, month, year] = dateString.split("/").map(Number);
        if (!day || !month || !year) return null;
        return new Date(year, month - 1, day);
    }

    function handleFilter() {
        const now = new Date();
        let startDate: Date | null = null;
        let endDate: Date | null = null;

        switch (intervalo) {
            case "Ontem": {
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 1);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(now);
                endDate.setDate(now.getDate() - 1);
                endDate.setHours(23, 59, 59, 999);
                break;
            }
            case "Semana": {
                const dayOfWeek = now.getDay();
                const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                startDate = new Date(now);
                startDate.setDate(now.getDate() - daysToSubtract);
                startDate.setHours(0, 0, 0, 0);
                break;
            }
            case "Mês":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case "Ano":
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case "Periodo": {
                startDate = parseDate(dataInicio);
                endDate = parseDate(dataFim);
                if (endDate) {
                    endDate.setHours(23, 59, 59, 999);
                }
                break;
            }
            default:
                startDate = new Date(now);
                startDate.setHours(0, 0, 0, 0);
                break;
        }

        const filteredPedidos = pedidos.filter((pedido) => {
            if (startDate && endDate) {
                return pedido.data >= startDate && pedido.data <= endDate;
            } else if (startDate) {
                return pedido.data >= startDate;
            }
            return true;
        });

        setPedidosFiltrados(filteredPedidos);

        const totalValue = filteredPedidos.reduce((total, pedido) =>
            total + pedido.valorTeleEntrega + pedido.produtos.reduce((produtoTotal, { item, quantidade }) =>
                produtoTotal + quantidade * (item.valor + item.adicionais.reduce((soma, adicional) => soma + adicional.valor, 0)), 0
            ), 0
        );

        setValorTotalPedidos(totalValue);
        setTotalPedidos(filteredPedidos.length);
    }

    function handleDelete(pedido: Pedido) {
        const updatedPedidos = pedidos.filter(p => p !== pedido);
        setPedidos(updatedPedidos);
        localStorage.setItem("pedidos", JSON.stringify(updatedPedidos));
        toast.success("Pedido excluído com sucesso!");
    }

    return (
        <>
            <div className="w-11/12 m-auto flex items-center justify-between mb-4">
                <div className="flex items-end justify-start gap-2 w-full">
                    <div className="w-1/6">
                        <Select defaultValue={intervalo} onValueChange={(e) => setIntervalo(e)} value={intervalo}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione um intervalo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="Hoje">Hoje</SelectItem>
                                    <SelectItem value="Ontem">Ontem</SelectItem>
                                    <SelectItem value="Semana">Semana</SelectItem>
                                    <SelectItem value="Mês">Mês</SelectItem>
                                    <SelectItem value="Ano">Ano</SelectItem>
                                    <SelectItem value="Periodo">Período</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    {intervalo === "Periodo" && (
                        <>
                            <div>
                                <Label className="font-normal">Data Início</Label>
                                <Input type="text" placeholder="Data Início" ref={dataInicioRef} value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                            </div>
                            <div>
                                <Label className="font-normal">Data Fim</Label>
                                <Input type="text" placeholder="Data Fim" ref={dataFimRef} value={dataFim} onChange={e => setDataFim(e.target.value)} />
                            </div>
                            <Button variant={"secondary"} onClick={() => handleFilter()}><SearchIcon /></Button>
                        </>
                    )}
                </div>

                <div className="flex items-center justify-end">
                    <Label className="text-xl whitespace-nowrap">Total: R$ {valorTotalPedidos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })} | {totalPedidos} Pedidos</Label>
                </div>
            </div>

            <div className="w-11/12 m-auto grid grid-cols-2 gap-4 max-h-[430px] overflow-y-auto">
                {pedidosFiltrados.map((pedido: Pedido) => (
                    <Card key={pedido.id}>
                        <CardContent>
                            <CardHeader>
                                <CardTitle>{pedido.cliente.nome}</CardTitle>
                                <CardDescription>
                                    {pedido.data.toLocaleDateString('pt-BR')} às {pedido.data.toLocaleTimeString('pt-BR')}
                                </CardDescription>
                            </CardHeader>
                            <div className="w-full px-8 py-2 flex flex-col gap-2 border rounded-lg shadow-sm">
                                {pedido.produtos.map(({ item, quantidade }) => (
                                    <div key={item.id} className="flex items-start justify-between w-full">
                                        <div className="flex flex-col items-start justify-start gap-1">
                                            <Label>{quantidade}x - {item.categoria} | {item.nome}</Label>
                                            {item.adicionais.map((adicional) => (
                                                <Label key={adicional.valor} className="opacity-60 ml-2">
                                                    - {adicional.nome} | R$ {adicional.valor.toFixed(0)}
                                                </Label>
                                            ))}
                                        </div>
                                        <Label>R$ {(item.valor + item.adicionais.reduce((total, adicional) => total + adicional.valor, 0)).toFixed(0)}</Label>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-2 text-sm text-center">{pedido.cliente.endereco}</p>
                            {pedido.observacao && <p className="text-sm text-center">Observações: {pedido.observacao}</p>}
                            <div className="flex items-end justify-between mt-2 px-2">
                                <div>
                                    <Button variant={"outline"} onClick={() => toast.warning("Você tem certeza que deseja excluir esse pedido?", {action: {label: "Sim", onClick: () => handleDelete(pedido)}})}>Excluir</Button>
                                </div>
                                <div className="flex flex-col items-end justify-end">
                                    <p>Tele: R$ {pedido.valorTeleEntrega ? pedido.valorTeleEntrega.toFixed(0) : 0}</p>
                                    <p className="font-bold">
                                        Total: R$ {(pedido.valorTeleEntrega + pedido.produtos.reduce((total, { item, quantidade }) =>
                                            total + quantidade * (item.valor + item.adicionais.reduce((soma, adicional) => soma + adicional.valor, 0)), 0)).toFixed(0)} - {pedido.formaPagamento}
                                    </p>
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
