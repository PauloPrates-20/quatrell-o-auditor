import fs from 'node:fs';
import path from 'node:path';

const fantasyList = [
    "💥 O **Caos** chegou aos multiversos da **Terra Sagrada**, durante este período de instabilidade cósmica as realidades se cruzam e colidem, e o que parecia um se torna vários. Aproveite a entropia para estar em vários lugares ao mesmo tempo - os esforços de um único aventureiro parecem ser de vários.",
    "🌑 O **Véu entre os Planos** foi rasgado! Uma força ancestral corrói as fronteiras da **Terra Sagrada**, e as sombras de outras realidades se projetam sobre a nossa. Neste momento frágil, a presença de um aventureiro ecoa além de si mesmo — como se mil versões suas agissem em uníssono.",
    "✨ A **Grande Convergência** se inicia! Os planos de existência se aproximam da **Terra Sagrada** como marés inevitáveis, e a fronteira entre o que é e o que poderia ser desaparece. Por um breve e glorioso momento, um único herói pode pisar em múltiplos destinos — sua lenda multiplicada pelo próprio tecido da realidade.",
    "⚡ Uma **Fenda no Tempo** se abriu sobre a **Terra Sagrada**! Os fios do destino se embaralharam — passado, presente e futuros possíveis coexistem num único e caótico instante. Aventureiros ágeis o suficiente para navegar esse turbilhão descobrirão que suas ações ressoam muito além do esperado.",
];

export function buildMessage(): string {
    const fpath = path.join(__dirname, "stats.json");
    let idx = 0;

    try {
        const f = fs.readFileSync(fpath, 'utf-8');
        const data = JSON.parse(f) as { lastIndex: number };
        idx = (data.lastIndex + 1)%4;
    } catch(e: any) {
        console.warn("[WARNING] Failed to read stats.json at " + fpath + ". Initializing message index with 0.");
        console.error("[ERROR]", e.message);
    }
    

    const header = "**EVENTO ESPECIAL DO FINAL DE SEMANA**\n\n"
    const fantasy = fantasyList[idx] + "\n\n";

    const now = new Date();

    const start = "**Horário de Início do Evento:** " + now.getDate().toString().padStart(2, '0') + "/" + (now.getMonth() + 1).toString().padStart(2, '0') + "/" + now.getFullYear().toString() + "\n"; 
    now.setDate(now.getDate() + 2);
    const end = "**Horário de Término do Evento:** " + now.getDate().toString().padStart(2, '0') + "/" + (now.getMonth() + 1).toString().padStart(2, '0') + "/" + now.getFullYear().toString() + "\n\n";

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