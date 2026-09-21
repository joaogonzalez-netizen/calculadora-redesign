# User Stories — Melhorias em Meus Anúncios

**Contexto geral:** a tela "Meus Anúncios" (listagem de anúncios criados pelo Gerador) passou por uma rodada de ajustes de UX: layout do grid, ações disponíveis por anúncio, organização dos filtros, simplificação dos status, cor padronizada de marketplace em todo o produto, e suporte a anúncio publicado em mais de um marketplace. Documentado como 5 User Stories separadas por já estarem implementadas em commits distintos.

---

## US-01 — Grid de cards com tamanho uniforme

### Contexto

O grid de "Meus Anúncios" usava colunas de largura automática (`auto-fill`), o que deixava o número de cards por linha inconsistente dependendo da largura da tela, e o card "Criar novo anúncio" tinha um formato próprio (caixa centralizada), diferente dos cards de anúncio de verdade. Além disso, quando um card tinha mais conteúdo (ex: duas tags de marketplace), ele ficava mais alto que os vizinhos na mesma linha, com os botões de ação em alturas diferentes.

### Objetivo

Ter um grid prático de escanear, com todos os cards do mesmo tamanho e os botões de ação sempre na mesma posição, independente de quanto conteúdo cada card tem.

### User Story

Como usuário navegando pela lista de anúncios, quero que todos os cards tenham o mesmo tamanho e os botões sempre alinhados, para escanear a lista rapidamente sem estranhar cards de tamanhos diferentes.

### Gherkin

```gherkin
Cenário: 5 cards por linha em tela larga
Dado que o usuário abre Meus Anúncios em modo Cards numa tela larga
Então a primeira linha mostra exatamente 5 cards, sendo o primeiro "Criar novo anúncio"

Cenário: Card "Criar novo anúncio" no mesmo formato dos demais
Dado que o usuário olha o card "Criar novo anúncio"
Então ele tem a mesma proporção (área quadrada + corpo) dos cards de anúncio reais, só com borda tracejada e ícone de "+"

Cenário: Cards da mesma linha com a mesma altura
Dado que um anúncio tem mais conteúdo no card (ex: duas tags de marketplace) que os vizinhos da mesma linha
Então todos os cards dessa linha continuam com a mesma altura
E os botões de ação (Continuar/Baixar/Excluir) ficam alinhados na mesma posição em todos eles
```

### Critérios de Aceite

- Grid fixo de 5 colunas em telas largas, reduzindo (4 → 2 → 1) conforme a tela estreita.
- Card "Criar novo anúncio" sempre aparece primeiro, independente de filtro/busca aplicado.
- Card "Criar novo anúncio" usa a mesma estrutura visual (media quadrada + corpo) dos cards de anúncio.
- Botões de ação (Continuar/Baixar/Excluir) sempre ficam colados na base do card, mesmo quando o conteúdo acima varia de tamanho entre cards da mesma linha.
- Botões de ação não vazam pra fora da borda do card em nenhuma largura de coluna.

---

## US-02 — Trocar "Duplicar" por "Baixar" nas ações do anúncio

### Contexto

A ação "Duplicar" num anúncio da lista não é uma necessidade real hoje — o que o usuário precisa é poder baixar os arquivos do anúncio já gerado.

### Objetivo

Substituir a ação de duplicar por uma de baixar, mantendo as duas ações que já faziam sentido (Continuar/Ver anúncio e Excluir).

### User Story

Como usuário com um anúncio pronto (baixado ou publicado), quero baixar os arquivos desse anúncio direto da lista, para não depender de duplicar ou refazer o processo.

### Gherkin

```gherkin
Cenário: Baixar disponível em qualquer anúncio
Dado que o usuário está na lista de anúncios, em modo Cards ou Lista
Então cada anúncio mostra os botões Continuar/Ver anúncio, Baixar e Excluir
E não existe mais a ação "Duplicar"

Cenário: Baixar não fica limitado a um status específico
Dado qualquer anúncio, independente do status (Gerando, Baixado ou Publicado)
Quando o usuário clica em Baixar
Então a ação funciona normalmente
```

### Critérios de Aceite

- Ação "Duplicar" removida de ambos os modos (Cards e Lista).
- Ação "Baixar" (ícone de download) presente em todo anúncio, em qualquer status.
- Ação "Excluir" continua pedindo confirmação antes de remover o anúncio da lista.

---

## US-03 — Simplificar os status do anúncio, com explicação de cada um

### Contexto

O status "Rascunho" não refletia bem o que realmente acontece: hoje o usuário gera um anúncio, pode finalizá-lo sem publicar, e a única ação disponível pra esse anúncio não publicado é baixá-lo. Ter um status "Rascunho" separado de "ação de baixar" criava uma categoria sem função clara.

### Objetivo

Ter só 3 status, cobrindo o ciclo real do anúncio, com cada um explicado por um tooltip pra quem não conhece o fluxo.

### User Story

Como usuário olhando a lista de anúncios, quero entender rapidamente o que cada status significa, para saber em que estágio cada anúncio está sem precisar perguntar pra ninguém.

### Gherkin

```gherkin
Cenário: Só 3 status existem
Dado que o usuário filtra ou olha o status de qualquer anúncio
Então os únicos status possíveis são Gerando, Baixado e Publicado

Cenário: Tooltip explica o status
Dado que o usuário passa o mouse sobre a tag de status de um anúncio
Então aparece um texto explicando o que aquele status significa

Cenário: Baixar promove Gerando/Baixado, mas não rebaixa Publicado
Dado um anúncio com status Gerando
Quando o usuário clica em Baixar
Então o status muda pra Baixado
Dado um anúncio já Publicado
Quando o usuário clica em Baixar (pra ter uma cópia local)
Então o status continua Publicado, sem retroceder
```

### Critérios de Aceite

- Status possíveis: Gerando, Baixado, Publicado — "Rascunho" não existe mais.
- Cada tag de status tem um tooltip (title) explicando o que ele significa.
- Baixar um anúncio Gerando ou já Baixado define/mantém o status como Baixado.
- Baixar um anúncio Publicado não altera o status — publicado é um estado mais forte que não regride.
- Filtro de status (chips Todos/Gerando/Baixado/Publicado) reflete exatamente essas 3 opções.

---

## US-04 — Reorganizar os filtros de Meus Anúncios em 2 linhas

### Contexto

Busca, filtro de status, toggle Cards/Lista, filtro de marketplace, ordenação e o botão de novo anúncio estavam todos numa linha só, disputando espaço e difíceis de escanear — e o filtro de status (uma fileira de chips cinza) não deixava claro que era um filtro.

### Objetivo

Separar os controles em 2 linhas por função (navegação/visualização vs. filtro/ordenação/ação), e deixar o filtro de status com a mesma linguagem visual dos outros filtros da tela.

### User Story

Como usuário organizando minha lista de anúncios, quero que os controles de busca, filtro e ordenação fiquem organizados e óbvios, para não perder tempo procurando onde filtrar.

### Gherkin

```gherkin
Cenário: Primeira linha é visualização
Dado que o usuário abre Meus Anúncios
Então a primeira linha mostra o toggle Cards/Lista e a busca por nome

Cenário: Segunda linha é filtro e ordenação
Então a segunda linha mostra o filtro de Status, o filtro de Marketplace, a ordenação e o botão "Novo anúncio"

Cenário: Filtro de status parece um filtro
Dado que o usuário olha o filtro de Status
Então ele tem um rótulo "Status:", fundo branco e borda — igual aos filtros de Marketplace e ordenação ao lado
E tem a mesma altura que o filtro de Marketplace
```

### Critérios de Aceite

- Linha 1: toggle Cards/Lista + busca por nome/produto/tag.
- Linha 2: filtro de Status (chips) + filtro de Marketplace (dropdown) + ordenação (dropdown) + botão "Novo anúncio".
- Filtro de Status envolvido numa caixa com borda, fundo branco e rótulo "Status:", com a mesma altura (33px) do filtro de Marketplace.
- Filtro de Marketplace continua funcionando (Todos/Mercado Livre/Shopee/Etsy/Outros).

---

## US-05 — Cor de marketplace consistente em todo o produto

### Contexto

A tag de marketplace (`.mp-tag`) usada em Produtos, Pedidos, Meus Anúncios e Etiquetas tinha sempre a mesma cor âmbar, não importa o marketplace — não dava pra reconhecer visualmente qual marketplace era só pela cor da tag.

### Objetivo

Cada marketplace ter uma cor fixa e reconhecível, usada em toda tela que mostra uma tag de marketplace.

### User Story

Como usuário navegando por Produtos, Pedidos ou Meus Anúncios, quero reconhecer o marketplace pela cor da tag de relance, para não precisar ler o texto toda vez.

### Gherkin

```gherkin
Cenário: Cor fixa por marketplace
Dado que o usuário vê uma tag de marketplace em qualquer tela do produto
Então Mercado Livre aparece em amarelo, Shopee em tons de vermelho, Etsy em tons de laranja e TikTok em tons de azul

Cenário: Marketplace não mapeado usa cor neutra
Dado um marketplace fora dessa lista (ex: "Outros")
Então a tag aparece num tom neutro (cinza), sem cor de marca específica

Cenário: Mesma regra em todas as telas
Dado que o mesmo marketplace aparece em Produtos, Pedidos, Meus Anúncios e Etiquetas
Então a cor da tag é a mesma nas 4 telas
```

### Critérios de Aceite

- Existe uma função única (`classeTagMarketplace`) que decide a cor a partir do nome/id do marketplace, usada por todas as telas que renderizam uma tag de marketplace.
- Mercado Livre = amarelo, Shopee = vermelho, Etsy = laranja, TikTok = azul, qualquer outro = cinza neutro.
- Nenhuma tela mantém uma cor de marketplace hardcoded fora dessa função.

---

## US-06 — Suportar mais de um marketplace por anúncio

### Contexto

Hoje um anúncio só guarda 1 marketplace, mas na prática o mesmo anúncio pode estar publicado em mais de um marketplace ao mesmo tempo (ex: Shopee e Mercado Livre).

### Objetivo

Um anúncio poder ter vários marketplaces associados, todos exibidos e todos considerados nos filtros.

### User Story

Como usuário que publica o mesmo anúncio em mais de um marketplace, quero ver todos os marketplaces daquele anúncio no card, para não pensar que ele só está em um lugar só.

### Gherkin

```gherkin
Cenário: Card mostra todas as tags de marketplace do anúncio
Dado um anúncio publicado em Mercado Livre e Shopee ao mesmo tempo
Quando o usuário olha o card (ou a linha, no modo Lista) desse anúncio
Então aparecem as duas tags, cada uma com sua cor

Cenário: Filtro de marketplace encontra por qualquer um dos marketplaces do anúncio
Dado o mesmo anúncio (Mercado Livre + Shopee)
Quando o usuário filtra por "Shopee"
Então esse anúncio aparece no resultado
Quando o usuário filtra por "Mercado Livre"
Então esse mesmo anúncio também aparece
```

### Critérios de Aceite

- O dado do anúncio guarda uma lista de marketplaces, não um valor único.
- Card e modo Lista mostram uma tag por marketplace do anúncio, cada uma com a cor certa (US-05).
- O filtro de marketplace considera o anúncio como correspondente se qualquer um dos marketplaces dele bater com o filtro selecionado.
- Ter mais de uma tag não quebra o alinhamento do card (ver US-01).
