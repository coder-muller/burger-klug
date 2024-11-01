import { Separator } from "./components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Vendas from "./tabs/vendas";
import Produtos from "./tabs/produtos";
import { ModeToggle } from "./components/mode-toggle";

export default function App() {
  return (
    <div className="flex flex-col items-center justify-start w-screen p-3">
      <div className="w-full flex items-center justify-center">
        <div className="fixed top-4 right-4">
          <ModeToggle />
        </div>
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyOl89nc8Kbd_khdQfhd7Cu0nnoBJkmACYuQ&s" alt="logo" className="w-20 h-20  rounded-full" />
      </div>
      <Separator className="my-4 border-2" />
      <Tabs defaultValue="vendas">
        <div className="flex items-center justify-center">  
          <TabsList>
            <TabsTrigger value="vendas">Vendas</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="vendas" className="w-screen px-10 py-3">
          <Vendas />
        </TabsContent>
        <TabsContent value="produtos" className="w-screen px-10 py-3">
          <Produtos />
        </TabsContent>
      </Tabs>
    </div>
  )
}
