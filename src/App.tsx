import { Separator } from "./components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Vendas from "./tabs/vendas";
import Produtos from "./tabs/produtos";
import { ModeToggle } from "./components/mode-toggle";
import Pedidos from "./tabs/pedidos";
import { Button } from "./components/ui/button";
import { migrateDataToFirebase, restoreDataFromFirebase } from "./migrate";
import { CloudDownload, CloudUpload } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogDescription, DialogFooter, DialogTitle } from "./components/ui/dialog";
import { useState } from "react";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import Analise from "./tabs/analise";

export default function App() {

  const [uploadConexao, setUploadConexao] = useState<boolean>(false)
  const [password, setPassword] = useState<string>('')
  const [isPasswordOpen, setIsPasswordOpen] = useState<boolean>(false)

  async function passwordHandler() {
    if (password === "santanao330") {
      setIsPasswordOpen(false)
      if (uploadConexao) { await migrateDataToFirebase() } else { await restoreDataFromFirebase() }
      window.location.reload();
    } else {
      toast.error("Senha incorreta!")
    }
  }

  return (
    <div className="flex flex-col items-center justify-start w-screen p-3">
      <div className="w-full flex items-center justify-center">
        <div className="flex items-center justify-center gap-2 fixed top-4 right-4">
          <Button variant={"secondary"} onClick={() => {
            setUploadConexao(true)
            setIsPasswordOpen(true)
          }}>
            <CloudUpload />
            Salvar Dados
          </Button>
          <Button variant={"secondary"} onClick={() => {
            setUploadConexao(false)
            setIsPasswordOpen(true)
          }}>
            <CloudDownload />
            Restaurar Dados
          </Button>
          <ModeToggle />
        </div>
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyOl89nc8Kbd_khdQfhd7Cu0nnoBJkmACYuQ&s" alt="logo" className="w-20 h-20  rounded-full" />
      </div>
      <Separator className="my-4 border-2" />
      <Tabs defaultValue="vendas">
        <div className="flex items-center justify-center">
          <TabsList>
            <TabsTrigger value="vendas">Vendas</TabsTrigger>
            <TabsTrigger value="analise">Análise</TabsTrigger>
            <TabsTrigger value="pedidos">Histórico de Pedidos</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="vendas" className="w-screen px-10 py-3">
          <Vendas />
        </TabsContent>
        <TabsContent value="analise" className="w-screen px-10 py-3">
          <Analise />
        </TabsContent>
        <TabsContent value="produtos" className="w-screen px-10 py-3">
          <Produtos />
        </TabsContent>
        <TabsContent value="pedidos" className="w-screen px-10 py-3">
          <Pedidos />
        </TabsContent>
      </Tabs>

      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent>
          <DialogTitle>Segurança</DialogTitle>
          <DialogDescription>
            Você precisa de uma senha para ter acesso a todas as funcionalidades do Banco de Dados!
          </DialogDescription>
          <div>
            <Label>Senha</Label>
            <Input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <DialogFooter>
            <Button onClick={() => passwordHandler()}>Confirmar</Button>
            <Button variant={"secondary"} onClick={() => setIsPasswordOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
