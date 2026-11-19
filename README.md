# Projeto de Automação QA — Giovani Araujo

Automação dos principais fluxos de uma loja virtual de demonstração usando Selenium WebDriver, Cucumber/Gherkin, Postman e Newman.

## 🚀 Tecnologias utilizadas

- Node.js 24 (necessário para a versão do Cucumber usada)
- JavaScript (CommonJS)
- Selenium WebDriver
- Cucumber.js com cenários Gherkin em português
- Chai para asserções
- Postman para testes de API
- Newman para executar a collection via linha de comando e CI
- GitHub Actions para integração contínua
- Apache JMeter (exemplo de baseline local não executado contra a loja)

## 📋 Pré-requisitos

- Node.js 24 e npm
- Git
- Google Chrome
- Postman, para execução visual/importação da collection
- Apache JMeter, apenas para abrir o exemplo opcional em `performance/jmeter/`

## 🔧 Configuração e instalação

Clone o repositório privado após receber acesso:

```powershell
git clone https://github.com/SEU_USUARIO/giovani-araujo-qa-automation.git
cd giovani-araujo-qa-automation
npm ci
```

Substitua `SEU_USUARIO` pela conta do GitHub que hospeda o repositório.

Para a entrega, use um repositório **privado** com um nome pessoal, por exemplo `giovani-araujo-qa-automation`, e convide individualmente as pessoas recrutadoras conforme as instruções recebidas. O README, collection e environment já estão incluídos no projeto.

## 🧪 Como executar os testes

### Testes de UI (Selenium + BDD)

```powershell
npm test
```

O Chrome abre em modo visível. Para modo headless:

```powershell
$env:HEADLESS = "true"
npm test
```

Os cenários ficam em `features/loja.feature`; os Page Objects ficam em `pages/`.

### Testes de API (Postman)

1. Importe `postman/demoblaze-api.collection.json` no Postman.
2. Importe `postman/demoblaze-api.environment.json`.
3. Selecione o ambiente **Demoblaze - QA**.
4. Execute a collection em sequência pelo **Collection Runner**, com uma iteração.

### Testes de API (Newman)

```powershell
npm run test:api
```

O comando gera o relatório JUnit em `reports/newman-results.xml`.

> A collection cria uma conta de teste e altera itens no carrinho do serviço público Demoblaze. O ambiente usa credenciais de teste; não use senhas pessoais ou reutilizadas.

### Testes de API com mock local

```powershell
npm run test:api:mock
```

Esse comando executa a mesma collection Newman contra uma API mock local em `127.0.0.1`, sem enviar requisições ao serviço Demoblaze. O servidor mock mantém usuários, tokens e carrinhos em memória, usa os IDs de produtos da massa de teste e é encerrado ao final da execução. A collection continua gerando username exclusivo para cada execução. O relatório JUnit fica em `reports/newman-mock-results.xml`.

O mock também é executado em um job independente da GitHub Actions e permite validar os contratos e dados dinâmicos da collection sem depender do serviço externo.

### Validação local sem executar os fluxos externos

```powershell
npm run validate:ci
```

Valida os arquivos JSON da collection/ambiente, a configuração do mock e algumas premissas do exemplo JMeter, além de descobrir os passos BDD em dry-run. Não executa operações na loja.

## 📊 Relatórios e evidências

- `reports/cucumber-report.html`: relatório HTML dos cenários de UI.
- `reports/failures/`: screenshot e log do navegador para cenários de UI que falharem.
- `reports/newman-results.xml`: relatório JUnit da execução da API.
- `reports/newman-mock-results.xml`: relatório JUnit da execução da API contra mock local.
- Na GitHub Actions, os relatórios ficam disponíveis como artefatos da execução por 7 dias.

## 🤖 Integração contínua

O workflow `.github/workflows/ui-tests.yml` roda a validação, os testes de UI em Chrome headless, a collection contra a API Demoblaze e a collection contra o mock local em jobs independentes a cada push e pull request. Também pode ser iniciado manualmente pela aba **Actions**.

## ✅ Cobertura

| Requisito | UI (Gherkin) | API (Postman/Newman) |
|---|---|---|
| Criar conta com sucesso | `Cadastro de uma nova conta` | `01 - Criar conta` |
| Rejeitar cadastro duplicado | `Tentativa de cadastro com usuário já existente` | `02 - Rejeitar cadastro duplicado` |
| Validar erros de autenticação | — | `03 - Rejeitar login com senha inválida`; `04 - Rejeitar login com usuário inexistente` |
| Adicionar celular, monitor e computador | `Remoção de monitor com persistência do carrinho` | Requisições `06`–`08` |
| Remover monitor e validar carrinho | `Remoção de monitor com persistência do carrinho` | Requisições `09`–`11` |
| Massa de teste dinâmica e mock | Username exclusivo por execução | Mock local com estado isolado em memória e IDs de produtos de teste |

### Observação sobre cadastro

O enunciado menciona e-mail; a loja de demonstração oferece cadastro por nome de usuário e senha, sem campo ou validação de e-mail. Os testes cobrem cadastro e duplicidade com o identificador aceito pela aplicação.

## 📈 Extensão de performance

`performance/` contém uma proposta de evolução e um exemplo JMeter de baseline local. O exemplo **não foi executado para não comprometer o ambiente da loja** e não representa um resultado de teste de carga. Consulte `performance/README.md`.

## 📁 Estrutura do projeto

```text
.github/workflows/       Pipeline CI
features/                Cenários Gherkin e step definitions
pages/                   Page Objects Selenium
postman/                 Collection e environment exportados
mocks/                   API mock local para os testes Newman
performance/             Proposta e baseline local JMeter
scripts/                 Validação de configuração para CI
```

Classificação: Confidencial
