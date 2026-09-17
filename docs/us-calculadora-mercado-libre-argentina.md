# User Story — Calculadora Mercado Libre Argentina

**US-01
Calcular o repasse líquido do Mercado Libre Argentina a partir do peso da peça**

## Contexto

O maker que vende (ou quer testar vender) pro público argentino via Mercado Libre hoje tem um canal dedicado na calculadora de preços do STLSeller — estruturado igual ao canal Mercado Livre Brasil (tipo de anúncio, categoria, frete), e definido como canal padrão ao abrir uma calculadora nova. Antes disso, o único caminho era aplicar a tabela argentina manualmente fora da ferramenta, ou usar a tabela brasileira como aproximação — risco de subprecificação, já que a estrutura de taxas dos dois países é diferente.

## Objetivo

Simular corretamente o preço e a margem líquida de uma peça vendida no Mercado Libre Argentina, sem precisar aplicar a tabela de frete ou a comissão por categoria manualmente fora da ferramenta.

## User Story

Como maker que vende (ou quer testar vender) pro Mercado Libre Argentina, quero que a calculadora aplique automaticamente a comissão da categoria do anúncio e o custo de envio pela faixa de peso do produto, para saber o preço mínimo e a margem real sem fazer essa conta na mão.

## Gherkin

```gherkin
Cenário 1: Calcular preço sugerido informando peso e categoria
Dado que o maker abre uma calculadora nova (canal Mercado Libre Argentina já vem selecionado)
E preenche os dados de custo do modelo (material, energia, tempo de impressão)
Quando ele escolhe a categoria do anúncio e informa o peso da embalagem
Então a calculadora aplica a comissão da categoria escolhida (Clásica ou Premium) e o custo de envio da faixa de peso e faixa de preço corretas
E exibe a faixa de peso, a faixa de preço e o custo de envio estimado usados no cálculo

Cenário 2: Peso muda a faixa de frete depois do cálculo
Dado que o maker já tem um cálculo pronto pro Mercado Libre Argentina
Quando ele altera o peso da embalagem pra uma faixa diferente
Então o custo de envio estimado e o preço sugerido são recalculados pela nova faixa
E a "faixa de peso" exibida reflete a mudança
```

## Critérios de Aceite

- O canal "Mercado Libre Argentina" vem pré-selecionado (default) sempre que o maker abre uma calculadora nova.
- O nome do canal aparece como "Mercado Libre Argentina" (com B, grafia correta da marca no país) em qualquer idioma do app — inclusive em português.
- A comissão muda corretamente entre Clásica e Premium pra mesma categoria escolhida.
- O custo de envio é determinado pela combinação peso da embalagem × faixa de preço, usando a tabela oficial vigente (mercadolibre.com.ar).
- Preços a partir de $33.000 (faixa sem tabela oficial confirmada) usam a faixa "$24.000 a $32.999" como aproximação, sem quebrar o cálculo nem travar a tela.
- O maker consegue editar manualmente a comissão da categoria quando necessário, e restaurar o valor automático depois.
