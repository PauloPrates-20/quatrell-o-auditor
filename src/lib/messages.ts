import { Character, Player } from './classes';
import { Gems, Actions, Item } from './definitions';

// Builds the messages used for the logs in the channel #banco
export function goldLogBuilder(player: Player, action: Actions, amount: number, source: string) {
    const actionText = { retira: 'Retira', deposita: 'Deposita' };
    const message = `Jogador: <@${player.id}>\n${actionText[action]}: ${amount} PO\nOuro Total: ${player.gold} PO\nOrigem: ${source}`;

    return message;
}

// Builds the messages used for the logs in the channel #fonte-da-experiência
export function xpLogBuilder(player: Player, character: Character, amount: number, source: string) {
    const message = `Jogador: <@${player.id}>\nPersonagem: ${character.name}\nGanho de Experiência: ${amount} XP\nExperiência Acumulada: ${character.xp} XP\nNível Atual: ${character.level}\nTier Atual: ${character.tier}\nOrigem: ${source}`;

    return message;
}

// Builds the messages used for the logs in the channel #tesouros-e-gemas
export function gemLogBuilder(player: Player, type: keyof Gems, amount: number, action: Actions, source: string) {
    const types = { comum: 'Comum', transmutacao: 'da Transmutação', ressureicao: 'da Ressureição' };
    const actions = { retira: 'Retira', deposita: 'Deposita' };
    const actionType = actions[action];
    const gemType = types[type];
    const message = `Jogador: <@${player.id}>\n${actionType}: ${amount} Gema(s) ${gemType}\nTotal: ${player.gems.comum} Gema(s) Comum, ${player.gems.transmutacao} Gema(s) da Transmutação, ${player.gems.ressureicao} Gema(s) da Ressureição\nOrigem: ${source}`;

    return message;
}

// Builds the messages for logs used in the channel #transferências-entre-jogadores
export function transferencyLogBuilder(type: string, targets: string[], amount: number, gemType?: keyof Gems) {
    const gemTypes = { comum: 'Comum', transmutacao: 'da Transmutação', ressureicao: 'da Ressureição' };
    let currencyText = 'PO';

    if (type === 'gema') {
        const gem = gemTypes[gemType!];
        currencyText = `Gema(s) ${gem}`;
    }

    const message = `Jogador: <@${targets[0]}>\nTransfere: ${amount} ${currencyText}\nPara: <@${targets[1]}>`;

    return message;
}

export function purchaseLogBuilder(target: string, character: Character, item: string, amount: number, price: number) {
    const message = `Jogador: <@${target}>\nPersonagem: ${character.name}\nCompra: ${amount}x ${item}\nValor: ${price} PO`;

    return message;
}

export function vendingLogBuilder(target: string, character: Character, item: string, amount: number, price: number) {
    const message = `Jogador: <@${target}>\nPersonagem: ${character.name}\nVende: ${amount}x ${item}\nValor: ${price} PO`;

    return message;
}

export function inventoryLogBuilder(target: string, action: 'retira' | 'deposita', character: Character, item: Item, source: string) {
    const actionText = action.charAt(0).toUpperCase() + action.slice(1);
    let itemList = '';

    for(const it of character.inventory) {
        itemList += `- ${it.count}x ${it.name}\n`;
    }

    const message = `Jogador: <@${target}>\nPersonagem: ${character.name}\n${actionText}: ${item.count}x ${item.name}\nOrigem: ${source}\nItens no báu:\n${itemList}`;

    return message
}

export function attuneLogBuilder(target: string, action: 'sintoniza' | 'dessintoniza', character: Character, item: Item) {
    const actionText = action.charAt(0).toUpperCase() + action.slice(1);
    const startDate = new Date();
    
    const startDay = String(startDate.getDate()).padStart(2, '0');
    const startMonth = String(startDate.getMonth() + 1).padStart(2, '0');
    const startYear = String(startDate.getFullYear());

    const startHour = String(startDate.getHours()).padStart(2, '0');
    const startMinute = String(startDate.getMinutes()).padStart(2, '0');

    startDate.setHours(startDate.getHours() + 1);

    const endDate = startDate;

    const endDay = String(endDate.getDate()).padStart(2, '0');
    const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
    const endYear = String(endDate.getFullYear());

    const endHour = String(endDate.getHours()).padStart(2, '0');
    const endMinute = String(endDate.getMinutes()).padStart(2, '0');

    const startString = `${startDay}/${startMonth}/${startYear} ${startHour}:${startMinute}`;
    const endString = `${endDay}/${endMonth}/${endYear} ${endHour}:${endMinute}`;

    const message = `Jogador: <@${target}>\nPersonagem: ${character.name}\n${actionText}: ${item.name}\nData e Hora de Início: ${startString}\nData e Hora de Témino: ${endString}\nItens Sintonizados: ${character.attunements}/3`;

    return message;
}