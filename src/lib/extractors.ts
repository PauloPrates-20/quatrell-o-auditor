
export function getUrlComponents(url: string): string[] {
  const components = url.match(/\d{18,}/g);
  const [guildId, channelId, messageId] = components!;

  return [guildId, channelId, messageId];
}

export function getGemType(input: string) {
  return input.normalize('NFD').replace(/\W/g, '').toLowerCase();
}