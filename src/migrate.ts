import { toast } from "sonner";
import { db } from "./firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export async function migrateDataToFirebase() {
    const dataFromLocalStorage = localStorage.getItem("produtos");
    if (!dataFromLocalStorage) return;

    const parsedData = JSON.parse(dataFromLocalStorage);

    try {
        const docRef = doc(db, "produtos", "backup_produtos");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            await setDoc(docRef, { produtos: parsedData }, { merge: true });
            console.log("Backup atualizado com sucesso!");
            toast.success("Backup atualizado com sucesso!");
        } else {
            await setDoc(docRef, { produtos: parsedData });
            console.log("Backup criado com sucesso!");
            toast.success("Backup criado com sucesso!");
        }
    } catch (error) {
        console.error("Erro ao migrar dados:", error);
        toast.error("Erro ao migrar dados!");
    }
}

export async function restoreDataFromFirebase() {
    try {
        const docRef = doc(db, "produtos", "backup_produtos");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data && data.produtos) {
                localStorage.setItem("produtos", JSON.stringify(data.produtos));
                console.log("Dados restaurados com sucesso!");
                toast.success("Dados restaurados com sucesso!");
            } else {
                console.warn("Nenhum dado encontrado para restaurar.");
                toast.error("Nenhum dado encontrado para restaurar.");
            }
        } else {
            console.warn("Documento de backup não encontrado.");
            toast.error("Documento de backup não encontrado.");
        }
    } catch (error) {
        console.error("Erro ao restaurar dados:", error);
        toast.error("Erro ao restaurar dados!");
    }
}

