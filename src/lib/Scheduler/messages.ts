import fs from 'node:fs';
import path from 'node:path';

const fantasyList = [
    "💥 O **Caos** chegou aos multiversos da **Terra Sagrada**, durante este período de instabilidade cósmica as realidades se cruzam e colidem, e o que parecia um se torna vários. Aproveite a entropia para estar em vários lugares ao mesmo tempo - os esforços de um único aventureiro parecem ser de vários.",
];

export function buildMessage(): string {
    let fpath = "";
    let idx = 0;

    try {
        fpath = path.join(__dirname, "messageList.txt");
        const f = fs.readFileSync(fpath, 'utf-8');
        const lines = f.split(/\r?\n/).filter(line => line.trim() !== "");

        for(const line of lines) {
            fantasyList.push(line);
        }

    } catch(e: any) {
        console.warn("[WARNING] Failed to retrieve message list. Falling back to single message.", e.message)
    }

    try {
        fpath = path.join(__dirname, "stats.json");
        const f = fs.readFileSync(fpath, 'utf-8');
        const data = JSON.parse(f) as { lastIndex: number };
        idx = (data.lastIndex + 1)%fantasyList.length;
    } catch(e: any) {
        console.warn("[WARNING] Failed to read stats.json at " + fpath + ". Initializing message index with 0.");
        console.error("[ERROR]", e.message);
    }
    

    const header = "**EVENTO ESPECIAL DO FINAL DE SEMANA**\n\n"
    const fantasy = fantasyList[idx] + "\n\n";

    const now = new Date();

    const start = "**Horário de Início do Evento:** " + now.getDate().toString().padStart(2, '0') + "/" + (now.getMonth() + 1).toString().padStart(2, '0') + "/" + now.getFullYear().toString() + " 18:00hs\n"; 
    now.setDate(now.getDate() + 2);
    const end = "**Horário de Término do Evento:** " + now.getDate().toString().padStart(2, '0') + "/" + (now.getMonth() + 1).toString().padStart(2, '0') + "/" + now.getFullYear().toString() + " 23:59hs\n\n";

    const body = "**Benefícios:**\nDurante o período de evento, os aventureiros contarão com:\n\n🔹 Cooldown/prioridade mínima dispensados;\n\n🔹Recompensa adicional de 💰 100% mais ouro 💰 ao término da missão, somente para a primeira aventura concluída com sucesso durante o período de evento.\n\n🔹Recompensa adicional de uma <:safira:1071032909374423110> gema <:safira:1071032909374423110> ao término da missão, somente para a primeira aventura concluída com sucesso durante o período do evento.\n\n🔹Recompensa adicional de 🏆 01 XP 🏆 ao término da missão, somente para a primeira aventura concluída com sucesso durante o período de evento\n\n🔹 **Aproveitem, divirtam-se e Participem!**\n\n<@&1010727826888073297> <@&1010727876498301008> <@&1010727993578098829> <@&1010728032346066964> <@&1010728219261022278> <@&1010730570730446981>"

    const msg = header + fantasy + start + end + body;

    try {
        const fpath = path.join(__dirname, "stats.json");
        const data = JSON.stringify({ lastIndex: idx });

        fs.writeFileSync(fpath, data);
    } catch(e: any) {
        console.error("[ERROR] Saving event message index:", e.message);
    }

    return msg;
}