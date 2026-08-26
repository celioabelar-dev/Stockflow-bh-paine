# Ministério de Louvor - IBPaz

App de gestão do ministério de louvor: escalas, grupos, integrantes, repertório musical, agendamento de estúdio e avisos na home. Rodando como Google Apps Script Web App, com banco de dados em uma planilha do Google Sheets.

## Arquivos deste repositório

- `Index.html` — front-end (interface do usuário)
- `Code.gs` — back-end (lógica de negócio e acesso à planilha)
- `appsscript.json` — manifesto do projeto Apps Script

## Novidade desta versão: atualização automática

Foi adicionado um controle de versão (`APP_VERSION` em `Code.gs`) que resolve o problema de quem instala o app (PWA ou APK) ficar preso numa versão antiga em cache. A cada abertura, o app pergunta ao servidor qual é a versão publicada e, se for diferente da salva no aparelho, recarrega sozinho pegando o código mais recente.

**Isso só funciona se você seguir o fluxo de deploy corretamente — veja abaixo.**

## Como publicar (todas as vezes, sem exceção)

1. Suba o número da constante `APP_VERSION` no topo de `Code.gs` (ex: `"1.0.1"` → `"1.0.2"`).
2. No editor do Apps Script: **Implantar → Gerenciar implantações**.
3. Clique no ícone de lápis na implantação **já existente** (a que gerou a URL que todo mundo já usa).
4. No campo "Versão", selecione **Nova versão**, escreva uma descrição curta e clique em **Implantar**.
5. Confirme que a URL exibida é a mesma de sempre — **nunca clique em "Nova implantação"** para publicar uma atualização, isso gera uma URL diferente e quebra o app de quem já instalou.

Feito isso, na próxima vez que qualquer pessoa abrir o app instalado, ele detecta a mudança de versão e se atualiza sozinho, sem precisar desinstalar nada.

## Subindo para o GitHub

O GitHub aqui serve como controle de versão do código-fonte (histórico, backup, colaboração) — o Google Apps Script continua sendo onde o app efetivamente roda e é publicado. Duas formas de manter os dois sincronizados:

**Manual (mais simples):** sempre que editar o código no Apps Script, copie os arquivos atualizados para a pasta local do seu repositório Git e faça `git add . && git commit -m "..." && git push`.

**Automatizada (opcional, mais robusta):** use a ferramenta `clasp` da própria Google (`npm install -g @google/clasp`) para versionar e até fazer push do GitHub diretamente para o Apps Script. Se quiser, posso te preparar o passo a passo do clasp depois.

## Empacotando como app instalável

### Android (APK)
Como você já tem esse fluxo funcionando, a única regra nova é: sempre que você publicar uma atualização seguindo os passos acima, **não precisa gerar um APK novo** — o APK é só um "invólucro" que abre a URL do Apps Script dentro de uma WebView. Como a URL não muda e o app agora se auto-atualiza, o mesmo APK instalado continua funcionando com o conteúdo mais recente.

### iOS (IPA)
Aqui preciso ser direto: não existe forma de gerar um instalador iOS sem passar por uma dessas rotas — não é algo que eu consiga produzir neste ambiente:

- **Xcode em um Mac** — o caminho tradicional. Ferramentas como o [PWABuilder](https://www.pwabuilder.com/) conseguem gerar o projeto Xcode pronto a partir da URL do seu app, mas alguém ainda precisa abrir esse projeto num Mac com Xcode instalado para compilar e assinar.
- **Conta de desenvolvedor Apple** (US$ 99/ano) — obrigatória tanto para instalar em iPhones de terceiros quanto para publicar na App Store.
- **Serviços de build na nuvem** (ex: Codemagic, Ionic Appflow) — compilam o `.ipa` sem você precisar ter um Mac, mas ainda exigem a conta de desenvolvedor Apple para assinar o app.

Se seu grupo usa iPhone, a alternativa mais simples e sem custo é continuar como PWA: a pessoa abre a URL no Safari e usa **Compartilhar → Adicionar à Tela de Início**. Fica com ícone próprio e tela cheia, sem barra do navegador — só não passa pela App Store.
