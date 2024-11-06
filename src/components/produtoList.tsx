import { MinusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import React from "react";

interface cardComponentProps {
    title: string
    itens: Produto[]
    quantidades: Record<string, number>
    onAdd: (produto: Produto) => void;
    onRemove: (e: React.MouseEvent, produto: Produto) => void;
}

interface Produto {
    id: string;
    nome: string;
    categoria: string;
    valor: number;
    adicionais: Adicionais[];
}

interface Adicionais {
    nome: string;
    valor: number;
}

export function CardComponent({ title, itens, quantidades, onAdd, onRemove }: cardComponentProps) {

    return (
        <Card className="w-1/4">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 max-h-[430px] overflow-y-auto p-3">
                {itens.map((produto) => (
                    <div className="flex items-center justify-between w-full border rounded-md px-5 py-2 cursor-pointer" onClick={() => onAdd(produto)}>
                        <div className="flex items-center justify-between w-full">
                            <h1>{produto.nome}</h1>
                            <div className="flex items-center gap-4">
                                {quantidades[produto.nome] > 0 && (
                                    <>
                                        <span>{quantidades[produto.nome]}</span>
                                        <MinusCircle className="cursor-pointer" onClick={(e) => onRemove(e, produto)} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}