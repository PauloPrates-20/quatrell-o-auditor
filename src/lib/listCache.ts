import { Player } from "./classes";

let playerList: Player[] = [];

export function getPlayer(id: string): Player {
    const player = playerList.find((p) => p.id === id);

    if(!player) {
        throw new Error('jogador não encontrado');
    }

    return player;
}

export function setPlayerList(data: Player[]) {
    playerList = data;
}

export function getPlayerList() {
    return playerList;
}

export function spliceList(id: string) {
    playerList = playerList.splice(playerList.findIndex((p) => p.id === id), 1);
}

export function appendList(player: Player) {
    playerList.push(player);
}

export function updateList(player: Player) {
    let index = playerList.findIndex((p) => p.id === player.id);
    playerList[index] = player;
}