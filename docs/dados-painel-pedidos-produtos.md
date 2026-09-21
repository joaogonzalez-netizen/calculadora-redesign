# Dicionário de Dados — Painel, Pedidos e Produtos

**Objetivo deste documento:** listar todo dado hoje exibido nas telas Painel (Dashboard), Pedidos e Produtos do STLSeller, pra servir de referência ao time de desenvolvimento na hora de replicar esse conteúdo pra versão em espanhol.

**Importante — contexto atual:** este protótipo não tem backend; todo dado abaixo é mock estático, vindo de `src/lib/dashboardMock.ts`, `src/lib/pedidosMock.ts` e `src/lib/produtosMock.ts`. Hoje esses 3 menus (Painel/Pedidos/Produtos) só aparecem na versão **PT** do app — em ES/EN eles ficam ocultos (`MOSTRAR_MENUS_PRINCIPAIS` em `src/lib/versoes.ts`), porque ainda não existe dado real de vendas pro mercado internacional. Este documento é o levantamento do que precisa ganhar um equivalente em espanhol pra esses 3 menus poderem ser habilitados também em ES.

---

## 1. Painel (Dashboard)

### 1.1 Marketplaces conectados (barra de sincronização)
Fonte: `MARKETPLACES`, `ULTIMA_SINCRONIZACAO`

| Campo | Exemplo | Observação |
|---|---|---|
| Sigla do marketplace | Ml, a, S, M | Mercado Livre, Amazon, Shopee, Magalu |
| Cor de fundo / texto do badge | `#ffd400` / `#3d3000` | Cor de marca de cada marketplace |
| Texto de última sincronização | "Última sincronização há 2 minuto" | Texto livre, tem erro de concordância no original ("minuto" sem s) |

**Pra ES:** decidir quais marketplaces existem nesse mercado (hoje a Calculadora só habilita Mercado Libre Argentina pra ES) — a lista de conectados aqui devia refletir isso, não os 4 marketplaces brasileiros.

### 1.2 KPIs do topo (4 cards)
Fonte: `KPIS`

| Campo | Chave | Exemplo |
|---|---|---|
| Rótulo | `label` | Faturamento, Pedidos, Lucro líquido, Ticket médio |
| Texto de ajuda (tooltip) | `tooltip` | "Soma do valor bruto de todos os pedidos pagos no período, antes de taxas e custos." |
| Prefixo | `prefixo` | R$ (ausente no card "Pedidos") |
| Parte inteira | `inteiro` | 29.376 / 176 / 7.962 / 166 |
| Parte decimal | `decimal` | ,00 / ,90 |
| Variação percentual | `deltaPct` | +9,8% |
| Variação positiva? | `deltaPositivo` | true |
| Texto comparativo | `comparativo` | "vs. 30 dias anteriores", "margem 27,1%", "vs. R$ 162,15 anterior" |

**Pra ES:** formato numérico (separador de milhar/decimal) e moeda mudam por país — ex. Argentina usa `$` e também separador `.`/`,` mas com convenção própria; confirmar com o time local antes de só trocar "R$" por "$".

### 1.3 Insights (3 cards)
Fonte: `INSIGHTS`

| Campo | Exemplo |
|---|---|
| Título | "Melhor dia da semana", "Reputação no Mercado Livre", "Oportunidade de margem" |
| Texto (com trechos em negrito intercalados) | "Quintas-feiras concentram 32% das suas vendas..." |

Um dos 3 insights cita o marketplace nominalmente ("Reputação no Mercado Livre") — em ES isso precisa apontar pro marketplace certo daquele mercado (Mercado Libre Argentina).

### 1.4 Gráfico de lucro (série semanal)
Fonte: `SERIE_LUCRO`, `TICKS_Y`, `MAX_Y`

| Campo | Exemplo |
|---|---|
| Rótulo do ponto | Sem 1, Sem 2, Sem 3, Sem 4, Hoje |
| Período (datas) | "7–14 jan" |
| Faturamento | 1120 |
| Custos | 580 |
| Lucro (= faturamento − custos) | 540 |
| Ticks do eixo Y | 0, 700, 1300, 2000 |

### 1.5 Top produtos
Fonte: `TOP_PRODUTOS`

| Campo | Exemplo |
|---|---|
| Posição (rank) | 1–5 |
| Nome do produto | "Lorem ipsum" (placeholder, nunca foi preenchido de verdade) |
| Vendas | 12 |
| Margem (%) | 28 |
| Valor | "R$ 4.198" |
| Largura da barra (0–100) | 100, 94, 88, 82, 76 |

### 1.6 Pedidos recentes
Fonte: `PEDIDOS_RECENTES`

| Campo | Exemplo |
|---|---|
| Sigla do canal | ML |
| Produto | "Lorem ipsum" (placeholder) |
| Quando | "há 8 minutos" |
| Código | "#ML-8472913" |
| Comprador | "Carla M." |
| Valor | "R$ 289,90" |
| Status | "Pago" |

### 1.7 DRE (Demonstrativo de Resultado do mês)
Fonte: `DRE_MES`, `DRE_LINHAS`, `DRE_MARGEM_LIQUIDA`

| Linha | Valor | Tipo | % | Observação |
|---|---|---|---|---|
| Receita bruta | R$ 29.376,00 | receita | — | Igual ao KPI "Faturamento" |
| Impostos sobre vendas | -R$ 1.175,00 | dedução | 4,0% | |
| Taxas de marketplace | -R$ 4.406,00 | dedução | 15,0% | Com sub-itens por marketplace: Mercado Livre -R$ 2.850, Shopee -R$ 1.020, Amazon -R$ 536 |
| Receita líquida | R$ 23.795,00 | subtotal | — | |
| Custo de produção | -R$ 13.483,00 | dedução | — | Depende do vínculo de custo em Produtos |
| Lucro bruto | R$ 10.312,00 | subtotal | — | |
| Despesas operacionais | -R$ 2.350,00 | dedução | — | Ads/tráfego pago e outras despesas |
| Lucro líquido | R$ 7.962,00 | resultado | — | Igual ao KPI "Lucro líquido"; margem 27,1% |

**Pra ES:** essa DRE fecha matematicamente com os KPIs do topo — qualquer versão em espanhol precisa manter essa mesma consistência interna (Receita bruta = Faturamento do KPI, Lucro líquido = KPI de lucro), só trocando os valores/moeda/nomes de marketplace.

---

## 2. Pedidos

### 2.1 KPIs do topo
Fonte: `PEDIDOS_KPIS`

| Campo | Exemplo |
|---|---|
| Total de pedidos | 176 |
| Faturamento | 29376 |
| Aguardando envio | 6 |
| Taxas estimadas | 3231 |

### 2.2 Tabela de pedidos
Fonte: `Pedido` (interface completa), gerada por `gerarPedidos()`

| Campo | Chave | Exemplo | Observação |
|---|---|---|---|
| ID | `id` | 2000012345678901 | |
| Código Mercado Livre | `codigoMlb` | MLB-2000012345678901 | Formato específico do ML — não existe em outros marketplaces |
| Produto | `produto` | "Suporte articulado para celular" | 7 produtos fixos, ciclados |
| Quantidade | `qtd` | 2 | |
| Data | `data` | formatada `pt-BR` | |
| Marketplace | `marketplace` | "Mercado Livre" ou "Shopee" | Só esses 2 hoje |
| Comprador (nome) | `comprador` | "João Gonzalez" | 8 nomes fixos, ciclados |
| Comprador (handle) | `compradorHandle` | "@joaog" | |
| Comprador (nº de compras) | `compradorCompras` | 12 | |
| Status do pedido | `status` | Pago / Enviado / Pendente / Cancelado / Entregue | |
| Status do pagamento | `pagamento` | Aprovado / Pendente / Reembolsado | |
| Data do pagamento | `pagamentoData` | formatada `pt-BR` | |
| Valor total | `valorTotal` | preço × qtd | |
| Preço unitário | `precoUnit` | 39.9 | Todos os 7 produtos custam o mesmo (R$ 39,90) |
| Frete | `frete` | 18.5 | Fixo pra todos os pedidos |
| Taxa (%) | `taxaPct` | 0.1 (10%) | Fixo |
| Método de envio | `envioMetodo` | "Mercado Envios Flex" / "Shopee Xpress" | Depende do marketplace |
| Código de envio | `envioCodigo` | "BR1234567890XX" | |
| Cidade de destino | `destinoCidade` | "São Paulo, SP" | 5 cidades brasileiras fixas, cicladas |
| CEP de destino | `destinoCep` | "01310-100" | Formato de CEP brasileiro |
| Rastreio | `rastreio` | mesmo valor de `envioCodigo` | |
| Itens do pedido | `itens[]` | nome, qtd, preço, cor | Cor sempre "Preto" no mock |
| Timeline do pedido | `timeline[]` | 5 etapas: Pedido criado → Pagamento aprovado → Etiqueta gerada → Pedido despachado → Entrega prevista/Pedido entregue | Datas relativas à criação do pedido |

**Pra ES:** os pontos que precisam de equivalente local são: formato de CEP (Argentina usa outro padrão), cidades de destino, nome do método de envio (não existe "Mercado Envios Flex"/"Shopee Xpress" da mesma forma em todo país), formato de data/hora, e nomes de compradores.

---

## 3. Produtos

### 3.1 KPIs do topo
Fonte: `PRODUTOS_KPIS`

| Campo | Exemplo |
|---|---|
| Vendas acumuladas | 4819 |
| Produtos ativos | 176 (de 190 publicados no total) |
| Em estoque | 128 (somando as variações) |
| Estoque baixo | 23 (repor antes de zerar) |
| Sem estoque | 6 (ação imediata necessária) |

### 3.2 Tabela de produtos
Fonte: `Produto` (interface completa)

| Campo | Chave | Exemplo | Observação |
|---|---|---|---|
| Nome | `nome` | "Letreiro decorativo - resina 12cm" | 10 produtos fixos |
| SKU | `sku` | "MLB-2093012345678901" | Formato de anúncio do Mercado Livre |
| Qtd. de imagens | `imagensQtd` | 6 | |
| Marketplace | `marketplace` | "Mercado Livre" ou "Shopee" | |
| Status | `status` | Ativo / Pausado / Esgotado | |
| Estoque | `estoque` | 47 | |
| Situação do estoque | `estoqueSituacao` | Saudável / Estoque baixo / Sem estoque | |
| Vendidos | `vendidos` | 32 | |
| Preço | `preco` | "R$ 269,90" | |
| Categoria | `categoria` | "Suportes", "Decoração", "Brinquedos", "Organização" | |
| Subcategoria | `categoriaSub` | "Acessórios para Celular" | |
| Controlado pelo catálogo ML | `controladoCatalogoMl` | false | Flag específica do Mercado Livre |
| Inventário ML | `inventarioMl` | false | Flag específica do Mercado Livre |
| Link público | `linkPublico` | true | |
| Variações (cor) | `variacoes[]` | Preto / Branco, cada uma com SKU, preço, estoque, vendidos, % de participação | |

**Pra ES:** `sku` e as duas flags `controladoCatalogoMl`/`inventarioMl` são conceitos específicos do Mercado Livre Brasil — se o marketplace de referência em ES for Mercado Libre Argentina, confirmar se esses mesmos conceitos existem lá com o mesmo nome, ou se precisam de adaptação.

---

## Resumo — o que muda pra uma versão em espanhol

1. **Moeda e formato numérico** — troca de R$ por moeda local, e confirmar separador decimal/milhar do país.
2. **Marketplace(s) de referência** — hoje é Mercado Livre + Shopee (+ Amazon/Magalu só no Painel). Em ES, alinhar com o que já existe na Calculadora/Gerador de anúncios (Mercado Libre Argentina).
3. **Dados de localização** — cidades, CEP, método de envio, nomes de compradores.
4. **Formato de data/hora** — hoje fixo em `pt-BR` nas funções que geram os mocks (`toLocaleDateString('pt-BR')`, `toLocaleString('pt-BR', ...)`).
5. **Terminologia específica de marketplace** — SKU, "controlado pelo catálogo", "inventário ML" são conceitos do Mercado Livre Brasil que podem não ter equivalente direto.
6. **Consistência interna** — o DRE do Painel precisa fechar matematicamente com os KPIs do topo, como já é hoje em PT.

Todo esse dado vive hoje em 3 arquivos só, que são o ponto único de edição:
- `src/lib/dashboardMock.ts`
- `src/lib/pedidosMock.ts`
- `src/lib/produtosMock.ts`
