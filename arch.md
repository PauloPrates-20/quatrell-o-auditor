.
├── @types/
├── commands/
│   ├── admin/
│   │   ├── ban.ts
│   │   ├── ajustar.ts
│   │   └── remover.ts
│   └── client/
│       ├── banco.ts
│       ├── tesouro.ts
│       ├── personagem.ts
│       ├── loja.ts
│       ├── bau.ts
│       ├── sintonia.ts
│       ├── aventura.ts
│       ├── forja.ts
│       ├── registrar.ts
│       ├── listar.ts
│       └── cancelar.ts
├── data/
│   └── eventMessages/
│       └── messageControl.json
├── lib/
│   ├── Services/
│   │   ├── Scheduler/
│   │   │   └── scheduler.ts
│   │   ├── Bank/
│   │   │   └── bank.ts
│   │   ├── Treasure/
│   │   │   └── treasure.ts
│   │   ├── CharacterManager/
│   │   │   ├── character.ts
│   │   │   └── xp.ts
│   │   ├── Client/
│   │   │   └── botClient.ts
│   │   ├── Messaging/
│   │   │   ├── Events/
│   │   │   │   ├── eventMessages.ts
│   │   │   │   ├── messageList.txt
│   │   │   │   └── idxControl.json
│   │   │   ├── bankMessages.ts
│   │   │   ├── treasureMessages.ts
│   │   │   └── characterMessages.ts
│   │   └── CommandHandler/
│   │       ├── deploy-commands.ts
│   │       ├── handleAutocomplete.ts
│   │       ├── handleStandard.ts
│   │       └── handleCollection.ts
│   ├── Entities/
│   │   ├── Player.ts
│   │   ├── Character.ts
│   │   ├── Log.ts
│   │   └── Gem.ts
│   └── Cache/
│       ├── playerList.ts
│       └── history.ts
├── main.ts
├── config.ts
└── deploy-commands.ts