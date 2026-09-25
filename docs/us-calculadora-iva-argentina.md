# User Story — IVA padrão na Calculadora (versão ES)

**US-01
Calcular o preço já considerando o IVA argentino de 21%**

## Contexto

Na versão em espanhol do STLSeller, voltada ao maker que vende para o público argentino, o campo "Impuesto (%)" do card Precificação da calculadora vinha zerado, e a dica abaixo dele citava o Simples Nacional, que é um regime brasileiro. Na Argentina, o IVA de 21% incide sobre a venda. Se o maker não souber disso ou esquecer de preencher o campo, a calculadora sugere um preço sem o imposto e mostra uma margem maior do que a real. O menu Configurações (onde fica o imposto padrão das Preferências) não aparece na versão ES, então o maker não tem como definir esse padrão sozinho.

## Objetivo

Chegar a um preço e a uma margem que já considerem o imposto argentino desde o primeiro cálculo, entendendo o que o campo representa e que ele pode ser ajustado.

## User Story

Como maker que usa o STLSeller em espanhol para vender na Argentina, quero que a calculadora já venha com o IVA de 21% preenchido e explique o que posso colocar nesse campo, para não subprecificar minhas peças por esquecer o imposto sobre a venda.

## Critérios de Aceite

- Com o app em espanhol, toda calculadora nova abre com "Impuesto (%)" = 21.
- A dica abaixo do campo, em espanhol, é "Ej: IVA 21% (Argentina)" e não menciona o Simples Nacional.
- Em espanhol, o label "Impuesto (%)" tem um ícone de informação cujo tooltip, ao passar o mouse, explica o campo e usa o IVA de 21% como exemplo.
- O valor de 21% é só um padrão: o maker pode editá-lo, e o cálculo usa o valor editado.
- O imposto entra no preço e na margem do mesmo jeito que em PT: é descontado do lucro no modo "preço alvo" e embutido no preço no modo "margem mínima".
- Trocar o idioma para espanhol com a calculadora aberta aplica os 21%. Trocar para português ou inglês volta ao imposto das Preferências (0% por padrão).
- Limpar a calculadora em espanhol volta o imposto para 21%.
- Nas versões em português e inglês nada muda: o imposto segue o padrão das Preferências, sem o tooltip do IVA, e a dica em português continua citando o Simples Nacional.
- Ao reabrir um cálculo salvo no Histórico, vale o imposto salvo nele, e não o padrão de 21%.
