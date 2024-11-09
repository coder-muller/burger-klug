import { toast } from "sonner";
import { db } from "./firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

const keysToBackup = ["pedidos", "produtos"];

export async function migrateDataToFirebase() {
    try {
        for (const key of keysToBackup) {
            const dataFromLocalStorage = localStorage.getItem(key);
            if (!dataFromLocalStorage) continue; 

            const parsedData = JSON.parse(dataFromLocalStorage);
            const docRef = doc(db, key, `backup_${key}`);

            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                await setDoc(docRef, { [key]: parsedData }, { merge: true });
                toast.success(`Backup de ${key} atualizado com sucesso!`);
                console.log(`Backup de ${key} atualizado com sucesso!`);
            } else {
                await setDoc(docRef, { [key]: parsedData });
                toast.success(`Backup de ${key} criado com sucesso!`);
                console.log(`Backup de ${key} criado com sucesso!`);
            }
        }
        toast.success("Backup de todos os dados atualizado com sucesso!");
        console.log("Backup de todos os dados atualizado com sucesso!");
    } catch (error) {
        toast.error("Erro ao migrar dados!");
        console.error("Erro ao migrar dados:", error);
    }
}

export async function restoreDataFromFirebase() {
    try {
        for (const key of keysToBackup) {
            const docRef = doc(db, key, `backup_${key}`);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data && data[key]) {
                    localStorage.setItem(key, JSON.stringify(data[key]));
                    toast.success(`Dados de ${key} restaurados com sucesso!`);
                    console.log(`Dados de ${key} restaurados com sucesso!`);
                } else {
                    toast.error(`Nenhum dado encontrado para ${key}.`);
                    console.warn(`Nenhum dado encontrado para ${key}.`);
                }
            } else {
                toast.error(`Documento de backup para ${key} não encontrado.`);
                console.warn(`Documento de backup para ${key} não encontrado.`);
            }
        }
        toast.success("Dados restaurados com sucesso!");
        console.log("Dados restaurados com sucesso!");
    } catch (error) {
        toast.error("Erro ao restaurar dados!");
        console.error("Erro ao restaurar dados:", error);
    }
}
