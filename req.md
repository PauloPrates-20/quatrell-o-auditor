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

#### Mensageria

- Automação das mensagens de log
- Automação dos anúncios de evento

#### Scheduler

- Agendamento de tarefas para dias da semana

### Bot

#### Comandos

##### Cliente

| Comando | Subcomandos | Argumentos |
| ------- | ----------- | ---------- |
| Banco   | Depositar, retirar, transferir | quantidade, origem, alvo? |
| Tesouro | Depositar, retirar, transferir | quantidade, origem, alvo? |
| Personagem | Adicionar, remover, renomear, add-xp, sub-xp | nome, novo-nome?, quantidade? |
| Loja | Comprar, vender | nome, quantidade, valor? |
| Baú  | Depositar, retirar, transferir | nome, quantidade, alvo? |
| Sintonia | Sintonizar, dessintonizar | nome, inicio |
| Forja | Reforjar | base, novo, valor |
| Listar | - | - |
| Registrar | - | - |
| Cancelar | - | lançamento |

##### Admin

| Comando | Subcomandos | Argumentos |
| ------- | ----------- | ---------- |
| Banir   | - | alvo |
| ajustar | ouro, gemas, xp | alvo, quantidade, personagem? |
| remover | - | alvo |

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