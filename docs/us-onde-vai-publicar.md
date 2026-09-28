# User Story — Implantação completa do passo "Onde você vai publicar?"

**US-01
Implantar o passo "Onde você vai publicar?" completo, com paridade nos 3 idiomas (PT/ES/EN)**

## Contexto

"Onde você vai publicar?" é o passo 2 do wizard do Gerador de Anúncios (`MarketplaceStep.tsx`). Ele decide o marketplace de destino, o modelo de geração (créditos) e, quando o destino é "Outros", detalha pra quais marketplaces e redes sociais o maker quer gerar o conteúdo. Hoje esse passo já funciona em português, mas boa parte do texto (títulos, nomes de marketplace, rótulos do sub-fluxo "Outros", avisos de validação) não tem tradução em inglês — cai de volta pro português sem o maker perceber. Em espanhol a tradução existe. Essa US documenta a implantação completa do passo, com critério de aceite próprio por idioma, pra fechar esse gap.

## Objetivo

Ter o passo "Onde você vai publicar?" funcionando de ponta a ponta — seleção de marketplace, modelo de geração e sub-fluxo "Outros" — com todo o texto traduzido de verdade nos 3 idiomas do app, sem nenhum fallback silencioso pro português em ES ou EN.

## User Story

Como maker usando o Gerador de Anúncios em qualquer um dos 3 idiomas do STLSeller, quero escolher onde vou publicar meu anúncio — com as opções de marketplace certas pro meu mercado e todo o texto no meu idioma — para seguir o wizard sem me deparar com um pedaço da tela em português.

## Requisitos

### Essencial (P0)

- Cada idioma mostra só os marketplaces relevantes pro mercado dele (já implementado via `GERADOR_MARKETPLACES_VISIVEIS`, ver Critérios de Aceite por idioma abaixo).
- Modelo de geração (Core/Premium) com nome, itens inclusos/não inclusos e custo em créditos, igual nos 3 idiomas.
- Sub-fluxo "Outros": ao marcar o marketplace "Outros", abre a seção "Pra onde vamos gerar esse anúncio?" com 3 grupos — Outros marketplaces (Amazon, AliExpress, eBay, Facebook Marketplace), Redes sociais (Instagram, Facebook, TikTok, Pinterest) e um campo de destino customizado ("Não é nenhum desses?").
- Todo o texto do passo — título, descrição, nomes de marketplace, rótulos do sub-fluxo, contagem de destinos selecionados e aviso de validação — traduzido de verdade em PT, ES e EN, sem fallback.
- Validação: com "Outros" selecionado, precisa de pelo menos 1 destino (marketplace, rede social ou customizado) marcado pra liberar o "Continuar" — igual nos 3 idiomas.

### Considerações Futuras (P2)

- Filtrar os destinos de "Outros" (marketplaces/redes) por idioma também, caso surjam destinos que só fazem sentido num mercado específico (hoje a lista é igual nos 3 idiomas, ver Pergunta em Aberto).

## Critérios de Aceite

### PT (Brasil)

- Marketplaces disponíveis: Mercado Livre, Shopee, Outros.
- Título "Onde você vai publicar?" e descrição abaixo, em português.
- Cards de marketplace com nome e descrição em português (ex.: "Maior marketplace da América Latina...").
- Seção "Escolha o modelo de geração" com Core e Premium, textos em português.
- Ao marcar "Outros": título "Pra onde vamos gerar esse anúncio?", grupos "Outros marketplaces" e "Redes sociais" com esses rótulos, campo "Não é nenhum desses?" em português.
- Contagem de destinos ("X destino(s) selecionado(s)") e aviso de validação em português.

### ES (Argentina/espanhol)

- Marketplaces disponíveis: Mercado Libre, Outros — **sem Shopee**.
- Título "¿Dónde vas a publicar?" e descrição, em espanhol.
- Card "Mercado Libre" com a grafia correta da marca (com B).
- Seção "Elige el modelo de generación" com Core e Premium, textos em espanhol.
- Ao marcar "Otros": título "¿Para dónde vamos a generar este anuncio?", grupos "Otros marketplaces" e "Redes sociales", campo "¿No es ninguno de estos?" — tudo em espanhol.
- Contagem de destinos e aviso de validação ("Selecciona al menos 1 destino para continuar.") em espanhol.
- Nenhum texto desse passo cai de volta pro português.

### EN (Estados Unidos/inglês)

- Marketplaces disponíveis: Etsy, Outros — **sem Mercado Livre nem Shopee**.
- Título e descrição do passo traduzidos pro inglês (hoje ausente — cai pro português; precisa ganhar tradução).
- Card "Etsy" com nome e descrição em inglês.
- Seção "Choose the generation model" (ou equivalente) com Core e Premium, todos os itens da lista (imagens geradas, variações de título, descrição, vídeo) traduzidos.
- Ao marcar "Others": título, grupos "Other marketplaces" e "Social media", campo de destino customizado — tudo traduzido pro inglês (hoje ausente).
- Contagem de destinos e aviso de validação traduzidos pro inglês (hoje ausentes).
- Nenhum texto desse passo cai de volta pro português — esse é o gap principal a fechar nesta US.

### Geral (todos os idiomas)

- eBay e Facebook Marketplace aparecem no grupo "Outros marketplaces" nos 3 idiomas (não são específicos de um mercado).
- Facebook (rede social) e Facebook Marketplace continuam sendo destinos independentes, podendo ser marcados juntos.
- A navegação do wizard (Voltar, Continuar, Pular para o resumo) funciona e está traduzida nos 3 idiomas.

## Perguntas em Aberto

- Os destinos de "Outros" (Amazon, AliExpress, eBay, Facebook Marketplace, Instagram, Facebook, TikTok, Pinterest) devem ser os mesmos pros 3 idiomas, ou faz sentido restringir por mercado (ex.: eBay só fazer sentido aparecer em EN)? Hoje a lista é fixa pros 3 — decisão de produto em aberto.
- Quem faz a tradução real do inglês (não é uma tarefa de engenharia só) — precisa de revisão de um falante nativo antes de ir pra produção, ou a tradução literal já resolve pro V1?
