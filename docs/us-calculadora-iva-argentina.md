# User Story — IVA e peso argentino na Calculadora (versão ES)

**US-01
Calcular o preço já com o IVA de 21% e em pesos argentinos**

## Contexto

A versão em espanhol do STLSeller é voltada ao maker que vende para o público argentino, mas a calculadora de preços ainda vinha com os padrões brasileiros. O campo "Impuesto (%)" da calculadora e o "Impuesto predeterminado (%)" das Preferencias vinham zerados, com dicas que citavam o Simples Nacional e o MEI, que são regimes brasileiros. A moeda vinha em reais (R$). Na Argentina, o IVA de 21% incide sobre a venda. Se o maker não souber disso ou esquecer de preencher o campo, a calculadora sugere um preço sem o imposto e mostra uma margem maior do que a real. Ver os valores em R$ também confunde quem pensa o preço em pesos.

## Objetivo

Chegar a um preço e a uma margem que já considerem o imposto argentino desde o primeiro cálculo, vendo os valores em pesos argentinos e entendendo que o imposto pode ser ajustado.

## User Story

Como maker que usa o STLSeller em espanhol para vender na Argentina, quero que a calculadora e as Preferencias já venham com o IVA de 21% e com a moeda em pesos argentinos, para não subprecificar minhas peças por esquecer o imposto nem precisar converter mentalmente de reais.

## Critérios de Aceite

### 1. Calculadora

- Com o app em espanhol, toda calculadora nova abre com "Impuesto (%)", no card Fijación de precio, preenchido com o imposto predeterminado das Preferencias (21% por padrão).
- A dica abaixo do campo é "Ej: IVA 21% (Argentina)" e não menciona o Simples Nacional.
- O label "Impuesto (%)" tem um ícone de informação. Ao passar o mouse, o tooltip explica que ali se adiciona o imposto sobre a venda e usa como exemplo o IVA, imposto argentino de 21%.
- O valor do campo pode ser editado, e o cálculo usa o valor editado.
- O imposto entra no preço e na margem do mesmo jeito que em PT: é descontado do lucro no modo "preço alvo" e embutido no preço no modo "margem mínima".
- Limpar a calculadora em espanhol volta o imposto para o predeterminado das Preferencias.
- Ao reabrir um cálculo salvo no Histórico, vale o imposto salvo nele, e não o predeterminado.

### 2. Preferencias → Fijación de precio

- Na versão em espanhol, o campo "Impuesto predeterminado (%)" da aba Fijación de precio vem com 21% por padrão.
- A dica abaixo do campo cita o IVA de 21% (Argentina) e não menciona Simples Nacional nem MEI.
- Se o maker alterar e salvar outro valor, toda calculadora nova em espanhol passa a abrir com esse valor.

### 3. Moeda em pesos argentinos

- Na versão em espanhol, a moeda de visualização padrão é o peso argentino (AR$), tanto nas Preferencias (aba Moneda) quanto no seletor de moeda da calculadora.
- Os campos de valor da calculadora e das Preferencias (preço de venda, custo de energia, preço do filamento, frete, custos extras) mostram o símbolo AR$, e não R$.
- Os resultados do cálculo (custo, preço sugerido, lucro e barra fixa inferior) são exibidos em AR$.
- A moeda muda só o símbolo, sem conversão de valor, como já acontece hoje na troca de moeda.
- O maker pode escolher outra moeda nas Preferencias ou no seletor da calculadora, e a escolha é respeitada.

### Versões PT e EN

- Nas versões em português e inglês nada muda: imposto de 0% por padrão, moeda em R$, dicas citando Simples Nacional e MEI e nenhum tooltip de IVA.
