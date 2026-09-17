# User Story — Versões do app por idioma

**US-01
Ver apenas os menus, canais e funcionalidades relevantes pro idioma/mercado selecionado**

## Contexto

O STLSeller hoje atende, além do maker brasileiro, makers que vendem (ou querem testar vender) em mercados de língua espanhola e inglesa. Esses mercados não têm as mesmas integrações do mercado brasileiro (sem dado real de vendas/pedidos, sem conexão de marketplace, com um conjunto diferente de canais de venda e de marketplaces suportados pelo gerador de anúncios). Mostrar os mesmos menus e funcionalidades pra todo mundo cria telas vazias, funcionalidades sem função (como um menu "Configurações" que só serve pra conectar um marketplace inexistente) e confusão sobre o que de fato está disponível em cada mercado.

**Importante:** neste MVP, a troca de idioma na sidebar é só um atalho de visualização rápida — serve pra qualquer pessoa do time (ou o próprio João) ver rapidamente como ficam os menus e funcionalidades de cada versão, sem precisar de um usuário real logado em cada mercado. Ela **não** é o mecanismo definitivo de segmentação: no futuro, quais menus e funcionalidades um usuário vê será definido pelo **plano/oferta** contratado por ele, não pela língua selecionada na sidebar. A troca de idioma continua existindo pra tradução de textos, mas deixa de decidir sozinha o que aparece.

## Objetivo

Fazer com que cada versão do app (PT/ES/EN) mostre só os menus, canais de venda, marketplaces e passos de onboarding que fazem sentido pro mercado daquele idioma — e que a troca de idioma na sidebar sirva, no MVP, como prévia rápida dessas três versões.

## User Story

Como pessoa avaliando o STLSeller (time interno, no MVP), quero trocar o idioma na sidebar e ver instantaneamente os menus, canais e passos de onboarding específicos daquela versão (PT, ES ou EN), para validar rapidamente como cada mercado vai se comportar sem precisar simular um usuário real de cada plano.

## Gherkin

```gherkin
Entrega 1: Alternância de idioma atualiza a sidebar instantaneamente
Cenário: Trocar idioma sem recarregar a página
Dado que o usuário está em qualquer tela do app
Quando ele troca o idioma selecionado (PT, ES ou EN)
Então a sidebar, os menus e os textos da tela atual são atualizados na hora, sem precisar recarregar a página

Entrega 2: Menus principais (Painel/Pedidos/Produtos) só em PT
Cenário: Versões ES/EN não mostram dado de vendas real
Dado que o idioma selecionado é ES ou EN
Quando o usuário olha a sidebar
Então os menus "Painel", "Pedidos" e "Produtos" não aparecem
Cenário: Versão PT mostra os três menus normalmente
Dado que o idioma selecionado é PT
Então os menus "Painel", "Pedidos" e "Produtos" aparecem normalmente

Entrega 3: Canais de venda da calculadora por idioma
Cenário: Canais mostrados na calculadora mudam com o idioma
Dado que o idioma selecionado é ES ou EN
Quando o usuário abre a calculadora de preços
Então os únicos canais disponíveis são "Venda direta" e "Mercado Libre Argentina"
Dado que o idioma selecionado é PT
Então os canais disponíveis são "Venda direta", "Mercado Livre", "Shopee" e "TikTok Shop"

Entrega 4: Marketplaces do gerador de anúncios por idioma
Cenário: Opções de marketplace do wizard mudam com o idioma
Dado que o idioma selecionado é PT
Quando o usuário chega no passo "Marketplace" do gerador de anúncios
Então as opções são Mercado Livre, Shopee e Outros
Dado que o idioma selecionado é ES
Então as opções são Mercado Libre e Outros
Dado que o idioma selecionado é EN
Então as opções são Etsy e Outros

Entrega 5: Menu "Configurações" só em PT
Cenário: ES/EN não têm conexão de marketplace pra configurar
Dado que o idioma selecionado é ES ou EN
Quando o usuário olha o grupo "Sistema" da sidebar
Então o menu "Configurações" não aparece
Dado que o idioma selecionado é PT
Então o menu "Configurações" aparece normalmente

Entrega 6: Passo "Conectar marketplace" do onboarding só em PT
Cenário: Checklist de Primeiros Passos sem o passo de marketplace em ES/EN
Dado que o idioma selecionado é ES ou EN
Quando o usuário abre a tela "Primeiros passos"
Então o checklist mostra só os passos Buscador, Calculadora e Gerador (sem "Conectar marketplace")
E o contador "N de X concluídos" considera só os passos visíveis nessa versão
Cenário: Checklist completo em ES/EN não deixa "Primeiros passos" preso na sidebar
Dado que o idioma selecionado é ES ou EN
E o usuário já completou todos os passos visíveis (Buscador, Calculadora, Gerador e vídeo)
Então o menu "Primeiros passos" some da sidebar, mesmo sem existir o passo de marketplace pra completar

Entrega 7: Conteúdo da tela "Primeiros passos" traduzido
Cenário: Textos da tela em inglês
Dado que o idioma selecionado é EN
Quando o usuário abre a tela "Primeiros passos"
Então todos os textos da tela (título, descrições, botões) aparecem em inglês, sem cair no fallback em português
```

## Critérios de Aceite

### PT (Brasil)

- Menus "Painel", "Pedidos" e "Produtos" visíveis.
- Menu "Configurações" visível.
- Canais de venda da calculadora: Venda direta, Mercado Livre, Shopee, TikTok Shop.
- Marketplaces do gerador de anúncios: Mercado Livre, Shopee, Outros.
- Checklist de Primeiros Passos com 4 passos (Buscador, Calculadora, Gerador, Conectar marketplace) + vídeo.

### ES

- Menus "Painel", "Pedidos" e "Produtos" ocultos.
- Menu "Configurações" oculto.
- Canais de venda da calculadora: Venda direta, Mercado Libre Argentina.
- Marketplaces do gerador de anúncios: Mercado Libre, Outros.
- Checklist de Primeiros Passos com 3 passos (Buscador, Calculadora, Gerador) + vídeo — sem "Conectar marketplace".
- Todos os textos das telas cobertas (sidebar, calculadora, primeiros passos) em espanhol, sem fallback pro português.

### EN

- Menus "Painel", "Pedidos" e "Produtos" ocultos.
- Menu "Configurações" oculto.
- Canais de venda da calculadora: Venda direta, Mercado Libre Argentina.
- Marketplaces do gerador de anúncios: Etsy, Outros.
- Checklist de Primeiros Passos com 3 passos (Buscador, Calculadora, Gerador) + vídeo — sem "Conectar marketplace".
- Todos os textos das telas cobertas (sidebar, calculadora, primeiros passos) em inglês, sem fallback pro português.

### Todos os idiomas

- Trocar o idioma na sidebar reflete a mudança imediatamente, sem recarregar a página.
- A troca de idioma é só uma prévia de visualização do MVP — não é o mecanismo definitivo de liberação de menus/funcionalidades. O mecanismo definitivo será o plano/oferta do usuário, numa entrega futura.
