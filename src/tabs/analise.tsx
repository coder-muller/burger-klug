import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { Bar, BarChart, XAxis } from "recharts";
import { Pedido } from "./vendas";

export default function Analise() {
    let pedidos: Pedido[] = [];

    const loadPedidos = () => {
        const data = localStorage.getItem('pedidos');
        if (data) {
            pedidos = JSON.parse(data) as Pedido[];
        }
    };

    useEffect(() => {
        loadPedidos();
        realizarAnalise();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const realizarAnalise = () => {
        setDataVendas(filtrarVendasMensais(pedidos));
        setDataDias(filtrarVendasSemanaAtual(pedidos));
        setDataItem(top5ItensMaisVendidos(pedidos));
    }

    const chartConfig = {
        vendas: {
            label: "vendas",
            color: "#2563eb",
        }
    } satisfies ChartConfig

    const filtrarVendasMensais = (pedidos: Pedido[]): { mes: string; vendas: number }[] => {
        const vendasPorMes = Array(12).fill(0);
        pedidos.forEach((pedido) => {
            const mes = new Date(pedido.data).getMonth();
            pedido.produtos.forEach(({ quantidade }) => {
                vendasPorMes[mes] += quantidade;
            });
        });
        return vendasPorMes.map((vendas, index) => ({
            mes: new Date(0, index).toLocaleString('pt-BR', { month: 'long' }),
            vendas,
        }));
    };

    const filtrarVendasSemanaAtual = (pedidos: Pedido[]) => {
        const hoje = new Date();
        const inicioSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay() + 1));
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);

        // Inicializar todos os dias da semana com zero vendas
        const diasDaSemana = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
        const vendasPorDia: { [dia: string]: number } = {};

        diasDaSemana.forEach(dia => {
            vendasPorDia[dia] = 0;
        });
        pedidos.forEach((pedido) => {
            const dataPedido = new Date(pedido.data);
            if (dataPedido >= inicioSemana && dataPedido <= fimSemana) {
                const diaSemana = dataPedido.toLocaleDateString('pt-BR', { weekday: 'long' });
                vendasPorDia[diaSemana] += pedido.produtos.reduce((total, { quantidade }) => total + quantidade, 0);
            }
        });
        return diasDaSemana.map(dia => ({
            dia,
            vendas: vendasPorDia[dia] || 0,
        }));
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


    const [dataVendas, setDataVendas] = useState<{ mes: string; vendas: number }[]>([]);
    const [dataDias, setDataDias] = useState<{ dia: string; vendas: number }[]>([]);
    const [dataItem, setDataItem] = useState<{ item: string; vendas: number }[]>([]);


    return (
        <div className="w-11/12 m-auto flex flex-col items-center justify-center">
            <div className="w-full flex items-end justify-end">
                <Button onClick={realizarAnalise}>Realizar Análise</Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
                <Card>
                    <CardContent>
                        <CardHeader>
                            <CardTitle>Vendas no Ano</CardTitle>
                            <CardDescription>Um gráfico com as vendas durante os meses do ano.</CardDescription>
                        </CardHeader>
                        <ChartContainer config={chartConfig} className="w-auto min-h-[200px]">
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
                        <ChartContainer config={chartConfig} className="w-auto min-h-[200px]">
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
                        <ChartContainer config={chartConfig} className="w-auto min-h-[200px]">
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
    )
}   