# User Story — Novos destinos em "Outros" no Gerador de Anúncios

**US-01
Adicionar eBay e separar Facebook Marketplace de Facebook nos destinos de "Outros"**

## Contexto

No passo "Marketplace e plano" do Gerador de Anúncios, ao escolher o destino "Outros", o maker conta pra onde quer gerar o anúncio — a IA ajusta o conteúdo conforme os destinos marcados. Hoje essa lista cobre Amazon e AliExpress como marketplaces, e Instagram, Facebook, TikTok e Pinterest como redes sociais. Faltava um destino relevante pro maker americano (eBay, forte pra colecionáveis e miniaturas impressas em 3D nos EUA) e o "Facebook" da lista era ambíguo: não deixava claro se o maker queria gerar conteúdo pra um post social ou pra um anúncio de venda no Facebook Marketplace — canal de venda forte tanto nos EUA quanto, principalmente, na Argentina.

## Objetivo

Dar ao maker americano e argentino destinos que realmente existem no mercado dele, e deixar claro a diferença entre postar no Facebook (rede social) e vender pelo Facebook Marketplace (canal de venda) — sem obrigar a escolher só um dos dois quando os dois fazem sentido.

## User Story

Como maker gerando um anúncio pra um destino fora do marketplace principal (Mercado Livre/Shopee/Etsy), quero poder marcar eBay e Facebook Marketplace como destinos, separados de uma postagem social no Facebook, para que a IA gere o conteúdo certo pro canal certo.

## Gherkin

```gherkin
Cenário: eBay aparece como opção de marketplace
Dado que o maker escolheu o marketplace "Outros" no passo 2 do Gerador
Quando ele olha o grupo "Outros marketplaces"
Então vê Amazon, AliExpress, eBay e Facebook Marketplace como opções

Cenário: Facebook Marketplace e Facebook são destinos distintos
Dado que o maker está no grupo de destinos de "Outros"
Então "Facebook Marketplace" aparece no grupo "Outros marketplaces"
E "Facebook" aparece separadamente no grupo "Redes sociais"
Quando ele marca os dois ao mesmo tempo
Então ambos ficam selecionados, sem se excluir

Cenário: eBay e Facebook Marketplace contam pro total de destinos
Dado que o maker marcou eBay e/ou Facebook Marketplace
Então esses destinos entram na contagem "X destinos selecionados"
E o botão "Continuar" libera do mesmo jeito que com qualquer outro destino marcado
```

## Critérios de Aceite

- O grupo "Outros marketplaces" (dentro de "Outros") mostra: Amazon, AliExpress, eBay e Facebook Marketplace.
- O grupo "Redes sociais" mostra: Instagram, Facebook, TikTok e Pinterest — Facebook continua existindo aqui, separado do Facebook Marketplace.
- Facebook Marketplace e Facebook podem ser selecionados juntos, cada um contando como um destino independente.
- eBay e Facebook Marketplace seguem a mesma regra dos demais destinos de "Outros": pelo menos 1 destino (entre marketplaces, redes sociais ou "outro" digitado) precisa estar marcado pra habilitar o "Continuar".
- Nenhuma mudança nos destinos já existentes (Amazon, AliExpress, Instagram, TikTok, Pinterest) nem no campo de destino customizado ("Não é nenhum desses").
