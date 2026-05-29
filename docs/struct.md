.
├── docs/
│   ├── diagrams/
│   │   ├── main_process.xml
│   │   └── main_process.png
│   ├── struct.md
│   ├── struct.txt
│   └── req.md
├── Data/
│   └── eventMessages/
│       └── messageControl.json
├── Logs/
│   └── system.txt
├── src/
│   ├── @types/
│   │   └── definitions.d.ts
│   ├── api/
│   │   ├── router.ts
│   │   ├── /buy/
│   │   │   └── buy.ts
│   │   └── /reforge/
│   │       └── reforge.ts
│   ├── commands/
│   │   ├── admin/
│   │   │   ├── ban.ts
│   │   │   ├── ajustar.ts
│   │   │   └── remover.ts
│   │   └── client/
│   │       ├── banco.ts
│   │       ├── tesouro.ts
│   │       ├── personagem.ts
│   │       ├── loja.ts
│   │       ├── bau.ts
│   │       ├── sintonia.ts
│   │       ├── aventura.ts
│   │       ├── forja.ts
│   │       ├── registrar.ts
│   │       ├── listar.ts
│   │       └── cancelar.ts
│   ├── lib/
│   │   ├── Services/
│   │   │   ├── AdventureManager.ts
│   │   │   ├── Scheduler.ts
│   │   │   ├── BankService.ts
│   │   │   ├── TreasureService.ts
│   │   │   ├── CharacterService.ts
│   │   │   ├── BotClientService.ts
│   │   │   ├── InvetoryService.ts
│   │   │   ├── ShopService.ts
│   │   │   ├── Messaging/
│   │   │   │   ├── EventMessager.ts
│   │   │   │   ├── BankMessager.ts
│   │   │   │   ├── TreasureMessager.ts
│   │   │   │   ├── CharacterMessager.ts
│   │   │   │   ├── SintMessager.ts
│   │   │   │   ├── ShopMessager.ts
│   │   │   │   ├── ForgeMessager.ts
│   │   │   │   ├── TransferMessager.ts
│   │   │   │   ├── AdventureMessager.ts
│   │   │   │   └── InventoryMessager.ts
│   │   │   ├── CommandHandler/
│   │   │   │   ├── deployCommands.ts
│   │   │   │   ├── handleAutocomplete.ts
│   │   │   │   ├── handleStandardInteraction.ts
│   │   │   │   └── handleCollection.ts
│   │   │   ├── Logger/
│   │   │   │   ├── Logger.ts
│   │   │   │   └── LogBuilder.ts
│   │   │   └── Database/
│   │   │       └── db.ts
│   │   ├── Entities/
│   │   │   ├── Player.ts
│   │   │   ├── Character.ts
│   │   │   ├── Logs/
│   │   │   │   ├── Log.ts
│   │   │   │   ├── BankLog.ts
│   │   │   │   ├── TreasureLog.ts
│   │   │   │   ├── ShopLog.ts
│   │   │   │   ├── SintLog.ts
│   │   │   │   ├── CharacterLog.ts
│   │   │   │   ├── TransferLog.ts
│   │   │   │   ├── ForgeLog.ts
│   │   │   │   └── AdeventureLog.ts
│   │   │   ├── Gem.ts
│   │   │   └── Adventure.ts
│   │   └── Cache/
│   │       ├── playerList.ts
│   │       └── adventureList.ts
│   ├── main.ts
│   └── config.ts
└── .env