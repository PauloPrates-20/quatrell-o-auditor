export class Log {
  type;
  targets;
  channels
  content;

	constructor(type: string, targets: string[] | string, channels: string[] | string, content: string) {
		this.type = type;
		this.targets = targets;
		this.channels = channels;
		this.content = content;
	}
}