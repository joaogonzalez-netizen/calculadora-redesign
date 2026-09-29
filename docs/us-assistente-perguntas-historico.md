# User Story — UX do Assistente: tela inicial, conversa por pergunta e histórico

**US-01
Navegar pelo Assistente com sugestões prontas, conversas fáceis de ler e acesso às conversas recentes**

## Contexto

O Assistente do STLSeller abria sempre na última conversa e mostrava a pergunta do maker como um balão pequeno no canto, enquanto a resposta ocupava a tela inteira. Numa resposta longa, o maker perdia de vista o que tinha perguntado. Não havia um jeito claro de começar uma conversa nova, nem de voltar a uma conversa anterior. A tela inicial tinha 6 sugestões, algumas repetindo o mesmo tema.

## Objetivo

Usar o Assistente sem esforço: começar rápido com uma pergunta pronta, saber sempre a qual pergunta cada resposta se refere e voltar a conversas anteriores quando precisar.

## User Story

Como maker que acompanha as vendas no STLSeller, quero começar pelo Assistente com perguntas prontas, ler cada resposta sem perder de vista a minha pergunta e reabrir as minhas conversas recentes, para tirar dúvidas sobre a operação sem me perder na tela.

## Critérios de Aceite

### 1. Tela inicial

- Ao entrar no Assistente, a tela mostra, centralizados de cima para baixo:
  1. o título "Como posso ajudar você hoje?";
  2. a caixa de pergunta;
  3. as perguntas sugeridas;
  4. as conversas recentes.
- A caixa de pergunta tem 3 linhas de altura, já vem com o cursor dentro e mostra o texto de apoio "Pergunte sobre suas vendas, custos ou anúncios...".
- O botão de enviar (seta, dentro da caixa, no canto inferior direito) fica cinza e desabilitado enquanto a caixa estiver vazia, e verde quando há texto.
- Enter envia a pergunta. Shift+Enter quebra a linha.
- São exibidas 4 perguntas sugeridas, em grade 2×2 (1 coluna em telas com até 640px), cada uma com um ícone à esquerda, nesta ordem:
  1. "Como está minha operação este mês?"
  2. "Como ficou meu DRE deste mês?"
  3. "Quanto estou pagando de taxas em cada marketplace?"
  4. "Quais produtos estão perto de faltar ou parados?"
- Ao passar o mouse, a sugestão ganha borda e fundo verdes.
- Clicar numa sugestão envia a pergunta na hora, sem precisar digitar.

### 2. Conversa organizada por pergunta

- Cada pergunta abre um bloco próprio:
  - a **pergunta** vem primeiro, num cartão branco com borda verde à esquerda, o avatar do maker (iniciais) e o rótulo "Você perguntou" acima do texto;
  - a **resposta** vem logo abaixo, com o avatar do Assistente à esquerda.
- Blocos de perguntas diferentes são separados por uma linha horizontal.
- Enquanto o maker rola uma resposta longa, o cartão da pergunta daquele bloco fica **preso no topo da tela**, logo abaixo da barra superior. Ao chegar no bloco seguinte, a nova pergunta ocupa o lugar dela.
- Ao enviar uma pergunta, a tela rola até o início do bloco dela (o cartão da pergunta no topo), e não até o fim da resposta.
- A conversa fica numa coluna centralizada de no máximo 820px, para leitura confortável em telas largas.
- A caixa de pergunta fica presa na parte de baixo da tela durante a conversa, com 1 linha de altura.

### 3. Apresentação da resposta

- Antes de cada resposta aparece a animação de "digitando" (3 pontos piscando) no lugar da resposta, por cerca de 1 segundo.
- Enquanto o Assistente está "digitando", o botão de enviar e as sugestões ficam desabilitados.
- A resposta pode combinar:
  - parágrafos, com os trechos importantes em **negrito**;
  - tabelas de valores, com o nome à esquerda e o valor à direita, podendo ter um detalhe menor embaixo do valor (ex.: variação ou %);
  - listas com marcadores.
- Nas tabelas, linhas de subtotal ficam com fundo cinza claro e a linha de resultado final com fundo verde claro.
- Quando existe uma tela relacionada, a resposta termina com um botão de ação com seta (ex.: "Ver DRE no Painel", "Ver em Produtos", "Abrir Calculadora de preços"). O botão leva para a tela. Se a tela não existe na versão do idioma, o botão não aparece.
- Ao fim da **última** resposta aparece o rótulo "Continue perguntando", com as outras perguntas sugeridas como atalhos em formato de pílula, sem repetir a que acabou de ser respondida.
- Quando o Assistente não entende a pergunta, ele diz isso e mostra as 4 perguntas sugeridas como atalho, com o rótulo "Experimente perguntar".

### 4. Nova conversa

- Assim que a conversa tem pelo menos uma pergunta, aparece na barra superior, ao lado do título "Assistente", o botão verde "Nova conversa", com ícone de lápis.
- Na tela inicial (sem conversa aberta), esse botão não aparece.
- Clicar em "Nova conversa" volta para a tela inicial, com a caixa de pergunta vazia. A conversa anterior vai para as conversas recentes.
- Clicar em "Assistente" no menu lateral sempre abre a tela inicial com uma conversa nova, mesmo que o maker já esteja no Assistente com uma conversa aberta.

### 5. Conversas recentes

- A seção "Conversas recentes" aparece abaixo das perguntas sugeridas, com até 5 conversas, da mais recente para a mais antiga.
- Cada conversa da lista mostra:
  - a primeira pergunta como título, em uma linha, cortada com reticências se for longa;
  - abaixo, em texto menor, quantas perguntas a conversa tem ("1 pergunta" / "3 perguntas") e quando foi a última atividade, em tempo relativo ("há 3 horas", "ontem", "há 4 dias").
- Ao passar o mouse numa conversa, o título fica verde e aparece uma lixeira à direita.
- Clicar numa conversa reabre todas as perguntas e respostas dela, com a mesma organização por pergunta, e o maker pode continuar perguntando.
- Continuar uma conversa reaberta a leva para o topo da lista. Só reabrir para ler não muda a posição dela.
- Com 5 conversas na lista, começar uma sexta tira a mais antiga.
- Clicar na lixeira remove a conversa da lista na hora, sem confirmação.
- Sem nenhuma conversa, a seção "Conversas recentes" não aparece.
- No primeiro acesso, a lista já vem com 3 conversas de exemplo, para a tela não nascer vazia.

### 6. Idiomas

- Todos os textos da tela (título, texto de apoio, perguntas sugeridas, rótulos da conversa, botão "Nova conversa", "Continue perguntando", "Conversas recentes" e tempo relativo) existem em português, espanhol e inglês.

## Fora de escopo

- **Conteúdo e cálculo das respostas:** quais dados cada resposta traz e como são calculados ficam em documento próprio.
- **IA de verdade:** hoje o Assistente só entende os temas das 4 perguntas sugeridas.
- **Histórico entre aparelhos:** as conversas recentes ficam salvas só no navegador.
- **Renomear, fixar ou buscar conversas.**
