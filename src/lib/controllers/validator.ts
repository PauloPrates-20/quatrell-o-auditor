import { ChatInputCommandInteraction } from "discord.js";
import { Player } from "../classes/player";
import { CharacterDef } from "../definitions";

interface Inputs {
  type: 'source' | 'player' | 'currency' | 'character';
  value: any;
}

export class Validator {
  static source(source: string): boolean {
    return /https:\/\/discord.com\/channels\/\d{18,}\/\d{18,}\/\d{18,}/.test(source);
  }

  static player(player: Player | undefined): boolean {
    return !!player?.id;
  }

  static currency(amount: number): boolean {
    return amount >= 0;
  }

  static character(character: CharacterDef): boolean {
    return !!character?.name;
  }

  static async inputs(inputs: Inputs[], interaction: ChatInputCommandInteraction): Promise<boolean> {
    inputs.forEach(async (input) => {
      switch (input.type) {
        case 'currency':
          if (!this.currency(input.value as number)) {
            await interaction.editReply(`Valor não pode ser negativo!`);
            return false;
          }
          break;
        case 'player':
          if (!this.player(input.value as Player | undefined)) {
            await interaction.editReply('Jogador não encontrado. Utilize `/registrar` para se cadastrar.');
            return false;
          }
          break;
        case 'source':
          if (!this.source(input.value as string)) {
            await interaction.editReply('Origem inválida!');
            return false;
          }
          break;
        case 'character':
          if (!this.character(input.value as CharacterDef)) {
            await interaction.editReply('Personagem não encontrado. Utilize o comando `/personagem adicionar para cadastrá-lo.`')
            return false;
          }
      }
    });

    return true;
  }
}