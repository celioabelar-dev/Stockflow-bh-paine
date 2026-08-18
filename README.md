# StockFlow BH · Painel Logístico

Painel de armazenagem, expedição e conferência de cargas do CD13, construído a
partir da planilha `Estoque_BH.xlsx`. É um arquivo único (`index.html`) — sem
build, sem servidor, sem dependências para instalar. Basta abrir no navegador.

## Como usar

- **Abrir o painel**: dê duplo clique em `index.html`, ou abra pelo navegador
  (`Arquivo → Abrir`). Também funciona publicado no GitHub Pages, se você
  quiser um link compartilhável (veja a seção *Publicar com GitHub Pages*).
- **Atualizar os dados**: botão **Importar Excel**, no topo do painel. Ele lê
  qualquer planilha no mesmo formato de `Estoque_BH.xlsx` (aba `Estoque` +
  abas `Carga DD-MM-AA` + aba com "SAP" no nome) e recalcula tudo. Os dados
  ficam só na memória do navegador — nada é enviado para fora.
- **Exportar**: botão **Exportar Excel** gera um `.xlsx` com o estado atual
  (útil depois de importar uma planilha e antes de fechar a aba).
- **Voltar ao original**: botão **Dados originais** restaura os dados que
  vieram embutidos neste `index.html` (a última planilha que eu processei).

## Estrutura do arquivo

Tudo mora em `index.html`, em três blocos, nessa ordem:

1. `<style>` — visual (cores, tipografia, layout). Ver `--cd13`, `--quarentena`,
   `--reembalar`, `--descarte` no topo para as cores de cada depósito.
2. `<script type="application/json" id="embedded-data">` — os dados da última
   planilha importada, em JSON puro. Normalmente você não edita isso à mão;
   ele é substituído quando alguém usa "Importar Excel".
3. `<script>` — toda a lógica (cálculos, tabelas, gráficos, textos da tela).

## Como editar uma frase de um card

**Todo texto que aparece na tela existe em português, como string, dentro do
terceiro bloco (`<script>`).** Não é código minificado nem ofuscado — é só
procurar (Ctrl+F / Cmd+F) pelo texto exatamente como ele aparece no painel.

Exemplo: para mudar o título do card "Resumo do período" —

1. Abra `index.html` num editor de texto (ou no editor web do GitHub).
2. Ctrl+F por `Resumo do período`.
3. Você vai cair numa linha como:
   ```html
   <div class="card-head"><h3>Resumo do período</h3></div>
   ```
4. Troque só o texto entre `<h3>` e `</h3>`. Salve.

Outro exemplo, um KPI do topo (esses ficam todos juntos, fáceis de achar
buscando por `kpiCard(`):
```js
kpiCard('Cargas no período', fmtInt(k.cargasCount), `${filteredCargas()...}`, 'truck', 'var(--brand)', 0),
```
O primeiro texto entre aspas (`'Cargas no período'`) é o título do card — pode
trocar à vontade. O texto entre crases (`` ` ``) logo depois é a linha
pequena embaixo do número; tem `${...}` no meio, que são os valores
calculados — não apague essa parte, só o texto ao redor.

### Onde fica cada card (para não precisar catar um por um)

| Card na tela | Procure por | Função |
|---|---|---|
| Os 6 KPIs do topo | `kpiCard(` | `renderKPIs` |
| Nomes/descrições das abas (CD13, Quarentena...) | `const DEP_GROUPS` | topo do arquivo |
| "% de avarias por dia de carga" | `de avarias por dia de carga` | `renderGeral` |
| "SKUs com mais avarias" | `SKUs com mais avarias` | `renderGeral` |
| "Estoque por depósito" | `Estoque por depósito` | `renderGeral` |
| "Ocupação do parque de paletes" | `parque de paletes` | `renderGeral` |
| "Resumo do período" (gráfico de pizza) | `Resumo do período` | `renderGeral` |
| "Mapa de racks..." | `Mapa de racks` | `renderDepPanel` |
| Ranking de validade | `Ranking de validade` | `renderValidadeTab` |
| "Linhas com divergência" | `Linhas com divergência` | `renderDivergenciaTab` |
| "Resumo por código (SKU)" / "Detalhe por lote" | `Resumo por código` | `renderSapTab` |
| Textos dos botões do topo (Importar/Exportar/Dados originais) | `btn-import`, `btn-export`, `btn-reset` | topo do `<body>` |

### O que evitar mexer sem querer

- Qualquer coisa entre `${` e `}` — é código, não texto (calcula um número).
- As crases `` ` `` que abrem e fecham um bloco de texto — se apagar uma sem
  querer, a página para de funcionar. Se isso acontecer, dá pra comparar com
  uma versão anterior no histórico do GitHub e ver o que mudou.
- Nomes como `deposito`, `endereco`, `sku` dentro do código de cálculo — esses
  não aparecem na tela, são a lógica interna.

Se uma edição quebrar a página (ela fica em branco ou trava), abra o
DevTools do navegador (F12 → aba *Console*) para ver o erro, ou simplesmente
reverta o commit no GitHub.

## Publicar com GitHub Pages (opcional)

Se quiser um link público (tipo `https://seuusuario.github.io/stockflow-bh/`)
em vez de abrir o arquivo local:

1. No repositório, vá em **Settings → Pages**.
2. Em "Source", selecione a branch `main` e a pasta `/ (root)`.
3. Salve. Em alguns minutos o link fica disponível.

Como os dados ficam embutidos no próprio `index.html` (não são buscados de
um servidor), o Pages funciona perfeitamente mesmo sendo 100% estático.

## Histórico de mudanças

Ver `CHANGELOG.md`.
