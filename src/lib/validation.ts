import { Character, Player } from './classes';

// Validates the source for the transactions within the bot.
// Source must be an url pointing to a discord message
export function sourceValidation(source: string): boolean | string {
	const pattern = /^https:\/\/discord.com\/channels\/\d{18,}\/\d{18,}\/\d{18,}$/m;

	if (!pattern.test(source)) return 'Jogador não encontrado! Utilize o comando `/registrar` para se cadastrar';

  return true;
}

// Validates if a valid player object was passed
export function playerValidation(player: Player | undefined): boolean | string {
  if (typeof player !== typeof Player) return 'Jogador não encontrado! Utilize o comando `/registrar` para se cadastrar';

  return true;
}

export function assertPositive(amount: number): boolean | string {
  if (amount < 0) return 'Valor não pode ser negativo!';

  return true;
}

export function characterValidation(character: Character | undefined): boolean | string {
  if (typeof character !== typeof Character) return 'Personagem não encontrado! Utilize o comando `/personagem adicionar` para criar o personagem.';

  return true;
}

export function enoughCurrencyValidation(currentAmount: number, amount: number): boolean | string {
  if (currentAmount - amount < 0) return 'O valor final não pode ser negativo!';

  return true;
}

export function targetValidation(player: Player | undefined): boolean | string {
  if (typeof player !== typeof Player) return 'Jogador alvo não encontrado!';

  return true;
}

export function runValidations(...validations: (boolean | string)[]) {
  for (const result of validations) {
    if (typeof result === 'string') throw new Error(result);
  }
}
