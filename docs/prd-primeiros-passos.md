# PRD — Primeiros Passos (Onboarding STLSeller)

**Produto:** STLSeller
**Iniciativa:** Checklist de ativação "Primeiros Passos"
**Autor:** João (Product)
**Status:** Rascunho para revisão
**Versão:** 1.0 — documenta o v1 já shipado e escopa o fechamento dos gaps conhecidos

---

## Problema

Um maker que acaba de entrar no STLSeller não sabe por onde começar: a plataforma tem quatro fluxos centrais (buscar produtos, calcular preço, gerar anúncio com IA, conectar marketplace) e nenhum deles é óbvio sozinho. Sem um ponto de partida guiado, o risco é o usuário abrir o Painel vazio, não entender o valor da ferramenta e abandonar antes da primeira ação real.

A tela "Primeiros Passos" já existe e resolve parte disso: centraliza um vídeo de boas-vindas e um checklist de 4 ações, com progresso visível. Mas hoje 2 dos 4 passos (Buscador e Gerador) são placeholders — o clique só mostra um alerta "Em breve" — e o vídeo não tem player de verdade, só um botão que também mostra alerta. Isso significa que metade do checklist não consegue, de fato, levar o usuário à ação que promete.

## Objetivos

- Levar o maker novo a completar pelo menos 1 ação de valor real (cálculo salvo, marketplace conectado) na primeira sessão.
- Reduzir o tempo até a "primeira ação de valor" (aha moment) comparado a não ter checklist algum.
- Dar visibilidade clara de progresso pra incentivar a conclusão do checklist (barra de progresso + estado completo/pendente por passo).
- Fechar os passos que hoje são apenas placeholder, pra que os 5 itens do checklist correspondam a 5 ações reais e verificáveis.

## Não-objetivos

- Não é um tutorial interativo dentro de cada tela (tooltips guiados, spotlight) — é um hub central único, fora do fluxo normal de trabalho.
- Não substitui onboarding por e-mail/CRM ou qualquer comunicação fora do produto.
- Construir a tela de Buscador de produtos do zero **não é objetivo deste documento** — hoje ela nem existe (sidebar mostra "Em breve por aqui"). Fechar o passo "Buscador" do checklist depende dessa tela existir primeiro; aqui só registramos essa dependência, não a resolvemos.
- Granularidade por persona (checklist diferente pra quem já vende vs. quem é novo) fica de fora — v1 e v2 tratam todo usuário novo igual.

## Histórias de Usuário

*Persona: Maker recém-cadastrado no STLSeller*

- US-01 — Ver o progresso geral do checklist de boas-vindas
- US-02 — Assistir o vídeo de boas-vindas dentro da própria tela, sem sair pra outro lugar
- US-03 — Calcular o preço de uma peça a partir do checklist e ver o passo marcado como concluído
- US-04 — Conectar um marketplace a partir do checklist e ver o passo marcado como concluído
- US-05 — Gerar um anúncio com IA a partir do checklist e ver o passo marcado como concluído
- US-06 — Favoritar um produto no Buscador a partir do checklist (bloqueado até a tela de Buscador existir)
- US-07 — Deixar de ver o item "Primeiros passos" no menu depois de completar os 5 passos

## Requisitos

### Essencial (P0) — já shipado, registrado aqui como baseline

- Hero de boas-vindas com o primeiro nome do usuário.
- Barra de progresso "N de 5 concluídos" (4 passos + vídeo).
- Card de vídeo com duração (2:47), título, descrição e checkbox manual "Marcar como assistido".
- Grid de 4 passos numerados — Buscador, Calculadora, Gerador de anúncios, Conectar marketplace — cada um com ícone, título, descrição e CTA ou selo de concluído.
- Passo "Calculadora" só completa quando o usuário salva um cálculo de verdade — os 10 cálculos de exemplo que vêm no seed **não contam**, evitando que o passo já nasça "feito".
- Passo "Marketplace" completa ao conectar de verdade em Configurações.
- Persistência local por flag manual (não deriva de dado mock pré-carregado), então o progresso é sempre uma ação deliberada do usuário.
- Item "Primeiros passos" no menu, dentro da seção "Comece por aqui", visível só enquanto o checklist não está 100% completo.

### Importante (P1) — gap a fechar

- **Gerador de anúncios**: hoje é `alert('Em breve')`. Trocar por navegação real pro Gerador (a tela já existe — `CriarAnuncioView`/`MeusAnunciosView`) e completar o passo quando o usuário efetivamente gerar 1 anúncio, no mesmo padrão de "ação real" já usado pela Calculadora — não basta clicar no CTA.
- **Vídeo de boas-vindas**: trocar o botão que hoje só mostra alerta por um player embutido de verdade (nativo ou embed). Decisão em aberto: manter "marcar como assistido" manual ou automatizar ao ver X% do vídeo (ver Perguntas em Aberto).
- **Bug de texto**: o hero mostra "Bem-vindo,, João" (vírgula duplicada) — a chave de tradução já vem com vírgula e o componente adiciona outra. Corrigir nos 3 idiomas (PT/EN/ES).

### Considerações Futuras (P2)

- **Buscador de produtos**: fechar esse passo do checklist depende da tela de Buscador existir — hoje é só "Em breve por aqui" na navegação, sem nenhuma implementação. Construir a tela é pré-requisito, não parte deste documento.
- Checklist mais granular por persona (quem já vende vs. quem é novo).
- Permitir dispensar/pular o checklist sem completar tudo.
- Notificação/toast ao completar um passo (hoje o único feedback é o selo "Concluído" no próprio card).

## Métricas de Sucesso

**Indicadores Antecedentes**

- % de usuários novos que assistem o vídeo (clique em "Assistir vídeo" ou checkbox marcado).
- % de conclusão de cada passo individualmente (funil: vídeo → calculadora → marketplace → gerador → buscador).
- Tempo médio até completar os 5 itens do checklist.
- Taxa de clique em cada CTA do grid vs. taxa de conclusão real (mede se o CTA está levando a uma ação completada, não só a um clique).

**Indicadores Consequentes**

- Retenção D7 de usuários que completam o checklist vs. os que não completam.
- % de usuários que salvam pelo menos 1 cálculo real na primeira semana.
- Número médio de marketplaces conectados por usuário nos primeiros 7 dias.

Meta específica e janela de medição ficam para definição conjunta com dados/growth — hoje não há baseline, já que os passos de Gerador e Buscador nunca completaram de verdade (eram placeholder).

## Perguntas em Aberto

- O item "Primeiros passos" deve sumir de vez do menu ao completar os 5 passos, ou ficar acessível em outro lugar (ex: dentro de Configurações), pra quem quiser rever o vídeo depois? — Responsável: João.
- Com o player de vídeo embutido, "assistido" deve continuar sendo uma marcação manual (checkbox) ou passa a ser automático ao atingir X% de reprodução? — Responsável: João / Design.
- O passo "Gerador de anúncios" deve completar no clique do CTA (like o passo Marketplace hoje) ou só quando o usuário efetivamente gerar um anúncio (like a Calculadora)? Recomendação deste documento é seguir o padrão da Calculadora (ação real), mas fica como decisão formal. — Responsável: João.
- Quando a tela de Buscador for priorizada, o critério de conclusão desse passo deve ser "favoritou 1 produto" (como descrito hoje na copy) ou outro? — Responsável: João, junto com o PRD da própria tela de Buscador.

## Considerações de Timeline

- Nenhum prazo contratual ou evento externo identificado.
- Faseamento sugerido:
  - **V1 (shipado)**: estrutura do checklist, vídeo com alerta placeholder, Calculadora e Marketplace com conclusão real, Gerador e Buscador com alerta placeholder.
  - **V1.1 (este PRD, P1)**: Gerador com navegação e conclusão real, player de vídeo embutido, correção do bug de texto.
  - **V2 (P2)**: Buscador de produtos (depende de PRD e build própria), refinamentos de UX (dispensar checklist, notificações).
