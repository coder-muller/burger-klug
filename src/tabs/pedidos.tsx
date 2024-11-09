import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Pedido } from "./vendas";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Pedidos() {
    const [pedidos, setPedidos] = useState<Pedido[]>([])
    const [intervalo, setIntervalo] = useState<string>("Hoje")
    const [pedidosFiltrados, setPedidosFiltrados] = useState<Pedido[]>([])
    const [valorTotalPedidos, setValorTotalPedidos] = useState<number>(0);
    const [totalPedidos, setTotalPedidos] = useState<number>(0);

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

    function handleFilter() {
        const now = new Date()
        let startDate: Date

        switch (intervalo) {
            case "Semana":
                startDate = new Date(now)
                startDate.setDate(now.getDate() - now.getDay() + 1)
                break
            case "Mês":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1)
                break
            case "Ano":
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now)
                startDate.setHours(0, 0, 0, 0)
                break
        }

        const filteredPedidos = pedidos.filter(pedido => pedido.data >= startDate)

        setPedidosFiltrados(filteredPedidos)

        const totalValue = filteredPedidos.reduce((total, pedido) =>
            total + pedido.valorTeleEntrega + pedido.produtos.reduce((produtoTotal, { item, quantidade }) =>
                produtoTotal + quantidade * (item.valor + item.adicionais.reduce((soma, adicional) => soma + adicional.valor, 0)), 0
            ), 0
        );

        setValorTotalPedidos(totalValue);
        setTotalPedidos(filteredPedidos.length);
    }

    return (
        <>
            <div className="w-11/12 m-auto flex items-center justify-between mb-4">
                <div className="w-1/6">
                    <Select defaultValue={intervalo} onValueChange={(e) => setIntervalo(e)} value={intervalo}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione um intervalo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="Hoje">Hoje</SelectItem>
                                <SelectItem value="Semana">Semana</SelectItem>
                                <SelectItem value="Mês">Mês</SelectItem>
                                <SelectItem value="Ano">Ano</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center justify-end">
                    <Label className="text-xl">Total: R$ {valorTotalPedidos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })} | {totalPedidos} Pedidos</Label>
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
                                                <Label key={adicional.nome} className="opacity-60 ml-2">
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
                            <div className="flex flex-col items-end justify-start mt-2 px-2">
                                <p>Tele: R$ {pedido.valorTeleEntrega.toFixed(0)}</p>
                                <p className="font-bold">
                                    Total: R$ {(pedido.valorTeleEntrega + pedido.produtos.reduce((total, { item, quantidade }) =>
                                        total + quantidade * (item.valor + item.adicionais.reduce((soma, adicional) => soma + adicional.valor, 0)), 0)).toFixed(0)} - {pedido.formaPagamento}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </>
    );
}
