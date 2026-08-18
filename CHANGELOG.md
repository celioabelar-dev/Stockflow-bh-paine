# Changelog

Registro das versões do painel StockFlow BH.

## v6 — confronto SAP, ranking de validade, correções de reconciliação
- Nova aba **Confronto SAP**: cruza estoque físico × SAP por código (SKU) e
  por lote. Separa divergência real de "só o lote está gravado errado" (o
  total do SKU bate, só a rastreabilidade por lote diverge).
- Nova aba **Validade**: ranking completo por proximidade de vencimento
  (FEFO), com status Vencido/Crítico/Atenção/OK.
- Nova aba **Divergência**: todas as linhas de conferência com diferença de
  quantidade, com sinalização de "não reconciliado".
- Correção conceitual importante: Avaria, Reembalar e Quarentena **não são
  causa de divergência de quantidade** — são o depósito para onde o item vai
  quando chega em determinada condição, mas ele chegou. Só "Não veio /
  Faltando" representa item que não chegou. A lógica de reconciliação e os
  textos da tela foram corrigidos para refletir isso (antes geravam alertas
  falsos em linhas que estavam corretas).
- Gráfico de pizza no card "Resumo do período", com o previsto dividido em
  Recebido OK / Avaria / Reembalar / Quarentena / Não veio / Não reconciliado
  — sem contar nenhuma caixa duas vezes.
- KPI "Estoque real (faturável)" = soma apenas do depósito CD13. Quarentena,
  Reembalar e Avariar ficam marcados como "fora do saldo faturável" em toda a
  interface.
- Paletes estimados (1 por linha de estoque) para as áreas a granel
  (Quarentena, Reembalar, Avariar), já que não têm endereço fixo por posição.
- Mapa de racks do CD13 passou a **detectar as ruas automaticamente** a
  partir dos endereços cadastrados (antes só reconhecia A/B/C/PJ; hoje
  reconhece qualquer letra, incluindo a rua D que foi adicionada).
- Leitor de planilha (import) e exportador ajustados para o formato real de
  colunas da conferência de carga (`AVARIA`, `REEMBALAR`, `OBS`) — colunas
  antigas (`NÃO VEIO / FALTANDO`, `QUARENTENA` na conferência) removidas da
  exportação por não existirem mais no fluxo real.

## v5 — coluna de validade, cargas dinâmicas
- Aba Estoque passou a trazer `VALIDADE` por lote; leitor de planilha
  (import) e cabeçalhos passaram a ser detectados pelo **título da coluna**,
  não pela posição fixa — resiste a reordenação de colunas.
- Detecção de novas cargas (`Carga DD-MM-AA`) automática ao importar.

## v4 — confronto por colunas estruturadas
- Migração do parser de ocorrências de texto livre (regex) para colunas
  numéricas dedicadas (`AVARIA`, `REEMBALAR`, `OBS`).
- Correção de bug: comparação de depósito (`CD13`, `Quarentena` etc.) virou
  case-insensitive — grafias inconsistentes na planilha paravam de bater com
  o filtro e zeravam abas inteiras.
- Bloco de resumo de paletes (Em Uso / Vazios / Total) passou a ser
  localizado dinamicamente pelo rótulo "PALETES", em vez de posição fixa de
  célula — corrigia importações que não atualizavam o card de paletes.

## v1–v3 — versão inicial
- Painel com 4 depósitos (CD13, Quarentena, Reembalar, Avariar/Descarte),
  mapa de racks do CD13, KPIs gerais, gráficos de avarias por carga e SKUs
  com mais avarias, importação/exportação de Excel.
