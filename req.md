# Quatrell, o Auditor

## Requisitos funcionais

### Geral

- Bot do discord para gerenciamento de dados internos do servidor
- Banco de dados para armazenar jogadores, personagens, registros, etc
- API para integração com o site

### Serviços

- Banco
- Loja
- Tesouro
- Baú
- Sintonia
- XP
- Personagens
- Aventuras
- Forja
- Logging
- Mensageria
- Scheduler

#### Banco

- Depositar ouro
- Remover ouro
- Transferir ouro

#### Loja

- Comprar item
- Vender item

#### Tesouro

- Remover gema
- Depositar gema
- Transferir gema

#### Baú

- Depositar item
- Remover item
- Transferir item

#### Sintonia

- Sintonizar item
- Dessintonizar item

#### XP

- Adicionar XP
- Remover XP

#### Personagem

- Criar personagem
- Renomear personagem
- Excluir personagem

#### Aventuras

- Criar aventura
- Adicionar personagem
- Remover personagem
- Registrar gema
- Cancelar aventura
- Encerrar aventura

#### Forja

- Reforjar item

#### Logging

- Registros detalhadas das transações
- Recuperação dos dados das transações
- Registro de aventuras
- Registros locais do sistema

#### Mensageria

- Automação das mensagens de log
- Automação dos anúncios de evento

#### Scheduler

- Agendamento de tarefas para dias da semana

### Bot

#### Comandos

##### Cliente

| Comando | Subcomandos | Argumentos | Descrição |
| ------- | ----------- | ---------- | --------- |
| Banco   | Depositar, retirar, transferir | quantidade, origem, alvo? | Gerencia as operações de depósito, retirada e transferência de ouro do jogador |
| Tesouro | Depositar, retirar, transferir | quantidade, origem, tipo, alvo? | Gerencia as operações de depósito, retirada e transferência de gemas do jogador |
| Personagem | Adicionar, remover, renomear, add-xp, sub-xp, listar | nome, novo-nome?, quantidade? | Gerenciamento de personagens do jogador |
| Loja | Comprar, vender | nome, quantidade, valor? | Gerencia a compra e venda de itens do jogador |
| Baú  | Depositar, retirar, transferir | nome, quantidade, alvo? | Gerencia o inventário do jogador |
| Sintonia | Sintonizar, dessintonizar | nome, inicio | Gerencia a sintonização de itens do jogador |
| Forja | Reforjar | base, novo, valor | Gerencia upgrades e alterações de itens do jogador |
| Registrar | - | - | Cadastra um jogador na base de dados |
| Cancelar | - | lançamento | Cancela uma operação realizada pelo jogador |

##### Admin

| Comando | Subcomandos | Argumentos | Descrição |
| ------- | ----------- | ---------- | --------- |
| Banir   | - | alvo | Bane o jogador alvo |
| ajustar | ouro, gemas, xp | alvo, quantidade, tipo?, personagem? | Ajusta a quantidade de ouro, gemas ou xp de um jogador |
| remover | - | alvo | Remove os dados de um jogador da base de dados |

### API

#### Rotas

##### /buy

| method | body |
| ------ | ---- |
| POST | token, item, personagem |

#### /reforge

| method | body |
| ------ | ---- |
| POST | token, item, itemBase, personagem |