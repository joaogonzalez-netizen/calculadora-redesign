# User Story — Versão ES dos menus Painel, Pedidos e Produtos

**US-01
Replicar os dados da versão PT nos menus Painel, Pedidos e Produtos para a versão ES**

## Contexto

Hoje os menus Painel (Dashboard), Pedidos e Produtos só existem na versão PT do STLSeller — na versão ES eles ficam ocultos (`MOSTRAR_MENUS_PRINCIPAIS` em `versoes.ts`), porque não existe ainda nenhum dado equivalente pro mercado de língua espanhola. O usuário ES abre o app e não tem acesso a nenhuma dessas 3 telas, mesmo já tendo canal de venda próprio na Calculadora (Mercado Libre Argentina).

## Objetivo

Ter, na versão ES, os mesmos 3 menus com o mesmo conjunto de informações que já existe na versão PT — mesma estrutura, mesmas seções, mesmos indicadores — só que com dado equivalente ao mercado de língua espanhola (moeda, marketplace, localização, formato de data), permitindo então habilitar os 3 menus também pra esse idioma.

## User Story

Como usuário da versão ES do STLSeller, quero ver o Painel, Pedidos e Produtos com todos os dados e indicadores que já existem na versão PT, para acompanhar minha operação de vendas da mesma forma que o usuário brasileiro acompanha a dele.

## Gherkin

```gherkin
Painel
Cenário: Indicadores do topo aparecem completos
Dado que o usuário abre o Painel na versão ES
Então ele vê os 4 indicadores (Faturamento, Pedidos, Lucro líquido, Ticket médio), cada um com valor, variação percentual e texto comparativo
E vê a barra de marketplaces conectados com a última sincronização
E vê os 3 cards de insight
E vê o gráfico de lucro por semana
E vê a lista "Top produtos"
E vê a lista "Pedidos recentes"
E vê a Demonstrativo de Resultado (DRE) do mês

Cenário: DRE fecha com os indicadores do topo
Dado que o usuário está olhando a DRE do Painel na versão ES
Então a linha "Receita bruta" é igual ao indicador "Faturamento"
E a linha "Lucro líquido" é igual ao indicador "Lucro líquido", com a mesma margem percentual

Pedidos
Cenário: Indicadores e tabela aparecem completos
Dado que o usuário abre Pedidos na versão ES
Então ele vê os 4 indicadores do topo (total de pedidos, faturamento, aguardando envio, taxas estimadas)
E vê a tabela de pedidos com produto, marketplace, comprador, status do pedido, status do pagamento e valor
E consegue filtrar por período, conta/marketplace e status

Cenário: Detalhe do pedido aparece completo
Dado que o usuário abre o detalhe de um pedido na versão ES
Então ele vê os itens comprados, endereço de entrega, método de envio, código de rastreio e a linha do tempo do pedido

Produtos
Cenário: Indicadores e tabela aparecem completos
Dado que o usuário abre Produtos na versão ES
Então ele vê os 5 indicadores do topo (vendas acumuladas, ativos, em estoque, estoque baixo, sem estoque)
E vê a tabela de produtos com nome, marketplace, status, estoque, vendidos, preço e categoria
E consegue filtrar por período e ordenação

Cenário: Variações do produto aparecem completas
Dado que o usuário abre o detalhe de um produto na versão ES
Então ele vê as variações do produto (cor, SKU, preço, estoque, vendidos e % de participação)
```

## Critérios de Aceite

### Painel

- Barra de marketplaces conectados, com ícone/sigla de cada um e texto de última sincronização.
- 4 indicadores no topo (Faturamento, Pedidos, Lucro líquido, Ticket médio), cada um com valor, variação % e texto comparativo, todos em moeda e formato numérico do mercado ES.
- 3 cards de insight com texto equivalente ao da versão PT (melhor dia da semana, reputação no marketplace, oportunidade de margem) — citando o marketplace correto da versão ES.
- Gráfico de lucro por semana, com 5 pontos (período, faturamento, custo, lucro).
- Lista "Top produtos" com nome, vendas, margem %, valor e barra comparativa.
- Lista "Pedidos recentes" com marketplace, produto, tempo decorrido, código, comprador, valor e status.
- Demonstrativo de Resultado (DRE) do mês, com receita bruta, impostos, taxas por marketplace (detalhadas), receita líquida, custo de produção, lucro bruto, despesas operacionais, lucro líquido e margem — **batendo matematicamente com os indicadores do topo**, igual à versão PT.

### Pedidos

- 4 indicadores no topo: total de pedidos, faturamento, pedidos aguardando envio, taxas estimadas.
- Filtros por período, conta/marketplace e status do pedido, funcionando.
- Tabela de pedidos com: produto + código + quantidade + data, marketplace, comprador (nome, usuário, nº de compras anteriores), status do pedido, status do pagamento, valor total + taxa.
- Detalhe do pedido com: itens comprados (nome, quantidade, preço, cor), cidade e código postal de entrega no formato do país, método de envio válido pro mercado ES, código de rastreio, e linha do tempo completa do pedido (criado → pago → etiqueta → despachado → entregue) com datas no formato local.

### Produtos

- 5 indicadores no topo: vendas acumuladas, produtos ativos (de quantos publicados), em estoque, estoque baixo, sem estoque.
- Filtros por período e ordenação, funcionando.
- Tabela de produtos com: nome + SKU + quantidade de imagens, marketplace, status, estoque + situação, vendidos, preço, categoria e subcategoria.
- Detalhe do produto com as variações (cor, SKU próprio, preço, estoque, vendidos, % de participação nas vendas).
- Ações da tabela (ver detalhes, pausar/reativar anúncio) funcionando igual à versão PT.

### Geral (todas as 3 telas)

- Nenhum texto, rótulo ou termo específico de marketplace brasileiro (ex.: "controlado pelo catálogo ML", "Mercado Envios Flex") aparece sem revisão — cada termo precisa ter um equivalente real no marketplace de referência da versão ES, ou ser adaptado/removido.
- Moeda, formato numérico e formato de data/hora seguem o padrão do mercado ES, não o do Brasil.
- Depois de populados, os 3 menus deixam de ficar ocultos pra versão ES (ajuste em `MOSTRAR_MENUS_PRINCIPAIS`).
