import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis } from "recharts";
import { Pedido } from "./vendas";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Analise() {
    let pedidos: Pedido[] = [];

    const chartConfig = {
        vendas: {
            label: "Vendas",
            color: "#2563eb",
        }
    } satisfies ChartConfig

    const chartConfigRs = {
        vendas: {
            label: "Valor (R$)",
            color: "#2563eb",
        }
    } satisfies ChartConfig

    const chartConfigQtde = {
        vendas: {
            label: "Quantidade",
            color: "#2563eb",
        }
    } satisfies ChartConfig

    const [tipoVisualizacao, setTipoVisualizacao] = useState<string>("Valores");
    const [dataVendas, setDataVendas] = useState<{ mes: string; vendas: number }[]>([]);
    const [dataDias, setDataDias] = useState<{ dia: string; vendas: number }[]>([]);
    const [dataItem, setDataItem] = useState<{ item: string; vendas: number }[]>([]);

    const loadPedidos = () => {
        const data = localStorage.getItem('pedidos');
        if (data) {
            pedidos = JSON.parse(data) as Pedido[];
        }
    };

    const filtrarVendasMensais = (pedidos: Pedido[], tipoVisualizacao: string): { mes: string; vendas: number }[] => {
        const vendasPorMes = Array(12).fill(0);

        pedidos.forEach((pedido) => {
            const mes = new Date(pedido.data).getMonth();
            if (tipoVisualizacao === "Valores") {
                vendasPorMes[mes] += calcularValorPedido(pedido);
            } else {
                vendasPorMes[mes] += 1;
            }
        });

        return vendasPorMes.map((vendas, index) => ({
            mes: new Date(0, index).toLocaleString('pt-BR', { month: 'long' }),
            vendas,
        }));
    };

    const filtrarVendasSemanaAtual = (pedidos: Pedido[], tipoVisualizacao: string): { dia: string; vendas: number }[] => {
        const hoje = new Date();
        const inicioSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay() + 1));
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);

        const diasDaSemana = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
        const vendasPorDia: { [dia: string]: number } = {};

        diasDaSemana.forEach(dia => {
            vendasPorDia[dia] = 0;
        });

        pedidos.forEach((pedido) => {
            const dataPedido = new Date(pedido.data);
            const diaSemana = dataPedido.toLocaleDateString('pt-BR', { weekday: 'long' });

            if (dataPedido >= inicioSemana && dataPedido <= fimSemana) {
                if (tipoVisualizacao === "Valores") {
                    vendasPorDia[diaSemana] += calcularValorPedido(pedido);
                } else {
                    vendasPorDia[diaSemana] += 1;
                }
            }
        });

        return diasDaSemana.map(dia => ({
            dia,
            vendas: vendasPorDia[dia] || 0,
        }));
    };

    const calcularValorPedido = (pedido: Pedido): number => {
        let total = pedido.valorTeleEntrega || 0;

        pedido.produtos.forEach(({ item, quantidade }) => {
            const valorProduto = item.valor * quantidade;
            const valorAdicionais = item.adicionais.reduce((soma, adicional) => soma + adicional.valor, 0) * quantidade;
            total += valorProduto + valorAdicionais;
        });

        return total;
    };

    const top5ItensMaisVendidos = (pedidos: Pedido[]): { item: string; vendas: number }[] => {
        const contagemItens: { [key: string]: number } = {};

        pedidos.forEach((pedido) => {
            pedido.produtos.forEach(({ item, quantidade }) => {
                if (!contagemItens[item.nome]) {
                    contagemItens[item.nome] = 0;
                }
                contagemItens[item.nome] += quantidade;
            });
        });

        return Object.entries(contagemItens)
            .map(([item, vendas]) => ({ item, vendas }))
    };

    const realizarAnalise = () => {
        const vendasMensais = filtrarVendasMensais(pedidos, tipoVisualizacao);
        const vendasSemana = filtrarVendasSemanaAtual(pedidos, tipoVisualizacao);
        const topItens = top5ItensMaisVendidos(pedidos);

        setDataVendas(vendasMensais);
        setDataDias(vendasSemana);
        setDataItem(topItens);
    };

    useEffect(() => {
        loadPedidos();
        realizarAnalise();
    }, []);

    useEffect(() => {
        loadPedidos()
        realizarAnalise();
    }, [tipoVisualizacao]);

    return (
        <div className="w-11/12 m-auto flex flex-col items-center justify-center">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center justify-start gap-2 w-full">
                    <div className="w-1/6">
                        <Label className="font-normal">Tipo de Visualização</Label>
                        <Select value={tipoVisualizacao} onValueChange={(e) => setTipoVisualizacao(e)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione um período" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="Pedidos">Pedidos</SelectItem>
                                    <SelectItem value="Valores">Valores (R$)</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
                <Card>
                    <CardContent>
                        <CardHeader>
                            <CardTitle>Vendas no Ano</CardTitle>
                            <CardDescription>Um gráfico com as vendas durante os meses do ano.</CardDescription>
                        </CardHeader>
                        <ChartContainer config={tipoVisualizacao === "Pedidos" ? chartConfig : chartConfigRs} className="w-auto min-h-[200px]">
                            <BarChart data={dataVendas}>
                                <XAxis
                                    dataKey="mes"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => value.slice(0, 3)}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="vendas" fill="var(--color-vendas)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <CardHeader>
                            <CardTitle>Vendas por Dia</CardTitle>
                            <CardDescription>Um gráfico com as vendas por dia.</CardDescription>
                        </CardHeader>
                        <ChartContainer config={tipoVisualizacao === "Pedidos" ? chartConfig : chartConfigRs} className="w-auto min-h-[200px]">
                            <BarChart data={dataDias}>
                                <XAxis
                                    dataKey="dia"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => value.slice(0, 3)}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="vendas" fill="var(--color-vendas)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <CardHeader>
                            <CardTitle>Itens mais vendidos</CardTitle>
                            <CardDescription>Um gráfico com os itens mais vendidos.</CardDescription>
                        </CardHeader>
                        <ChartContainer config={chartConfigQtde} className="w-auto min-h-[200px]">
                            <BarChart data={dataItem}>
                                <XAxis
                                    dataKey="item"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    tickFormatter={(value) => value.slice(0, 0)}
                                />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Bar dataKey="vendas" fill="var(--color-vendas)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
