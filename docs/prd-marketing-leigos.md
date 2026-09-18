# PRD — Menu Marketing (Logo, Banners e Etiquetas de Agradecimento)

**Produto:** STLSeller
**Iniciativa:** Menu "Marketing" — geração de materiais de identidade visual pro maker leigo em design
**Autor:** João (Product)
**Status:** Rascunho para revisão — antes de qualquer implementação
**Versão:** 0.1

---

## Problema

O maker que vende peças 3D normalmente não tem background de design — não sabe criar uma logo, não sabe montar um banner de capa pra loja no Shopee ou no Mercado Livre, e não tem tempo (nem ferramenta) pra fazer algo simples como uma etiqueta de agradecimento pra colar na embalagem do cliente. Hoje, pra resolver isso, ele either paga um designer freelancer, usa uma ferramenta genérica (Canva) que exige conhecimento de composição visual, ou simplesmente não faz — vende sem identidade visual nenhuma e sem nenhum toque de pós-venda.

O STLSeller já resolve o problema equivalente pra fotos de produto (Gerador de anúncios com IA). Falta o mesmo tipo de solução guiada pra identidade de loja (logo, banner) e pra relacionamento com quem já comprou (etiqueta de agradecimento) — hoje esse maker simplesmente não tem esses materiais.

## Objetivos

- Permitir que um maker sem nenhuma experiência de design saia com uma logo usável em menos de 5 minutos.
- Permitir que ele gere um banner de capa pronto, já no tamanho correto, pra Shopee e/ou Mercado Livre, sem precisar saber a dimensão oficial de cada plataforma.
- Permitir que ele gere e imprima etiquetas de agradecimento pros pedidos que já vendeu, sem digitar nome de cliente/produto na mão.
- Aumentar a percepção de valor do plano pago (essas gerações consomem créditos, no mesmo modelo do Gerador de anúncios), dando mais um motivo de uso recorrente da ferramenta.

## Não-objetivos

- Não é um editor de design completo (sem canvas livre, sem upload de fontes/elementos próprios, sem arrastar-e-soltar) — é geração guiada por IA a partir de uma descrição, não uma ferramenta profissional de design. Editor visual mais robusto fica pra uma fase futura (ver P2).
- Não inclui impressão física nem envio das etiquetas — o produto só gera o PDF pronto pra o usuário imprimir por conta própria.
- Não substitui o Gerador de anúncios existente — aquele é focado em foto/copy de produto pro anúncio; este menu é focado em identidade de marca da loja (logo, banner) e em pós-venda (etiqueta), propósitos diferentes.
- Suporte a outros marketplaces além de Shopee e Mercado Livre nos banners fica de fora do v1 — são os dois marketplaces com canal próprio na Calculadora hoje.
- Tradução/disponibilidade em ES/EN não é objetivo deste documento — ver Pergunta em Aberto sobre isso, já que o padrão do app hoje é gatear certos menus por idioma/mercado (ver `versoes.ts`).

## Histórias de Usuário

*Persona: Maker leigo em design, sem identidade visual pronta pra loja*

- US-01 — Gerar uma logo pra minha loja a partir de uma descrição curta (nicho, estilo, cores)
- US-02 — Ver mais de uma opção de logo gerada e escolher a que mais gostei
- US-03 — Baixar a logo escolhida em PNG com fundo transparente
- US-04 — Gerar um banner de capa pra minha loja no Shopee, já no tamanho oficial da plataforma
- US-05 — Gerar um banner de capa pra minha loja no Mercado Livre, já no tamanho oficial da plataforma
- US-06 — Reaproveitar a logo que já gerei como base visual do banner, pra manter a marca consistente

*Persona: Maker que quer fidelizar quem já comprou dele*

- US-07 — Gerar uma etiqueta de agradecimento pra um pedido que já vendi, sem digitar nome do cliente ou do produto na mão
- US-08 — Escolher vários pedidos de uma vez e gerar todas as etiquetas juntas
- US-09 — Baixar um PDF pronto pra impressão, com 4 etiquetas por folha A4
- US-10 — Editar a mensagem padrão da etiqueta antes de gerar o PDF final

## Requisitos

### Essencial (P0)

- Novo grupo "Marketing" na sidebar (mesmo padrão visual do grupo "Gerador de anúncios"/"Calculadora de preços"), com 3 sub-itens: Gerador de Logo, Gerador de Banners, Etiquetas de Agradecimento.
- **Gerador de Logo**: wizard guiado — usuário descreve a loja (nicho, estilo, paleta de cor opcional), a IA gera pelo menos 1 opção de logo; usuário escolhe e baixa em PNG com fundo transparente.
- **Gerador de Banners**: usuário escolhe a plataforma (Shopee ou Mercado Livre), descreve o que quer (pode reaproveitar a logo já gerada, se existir) e a IA gera o banner já nas dimensões oficiais de capa de loja daquela plataforma; download em PNG.
- **Etiquetas de Agradecimento**: usuário seleciona 1 ou mais pedidos do Histórico/Pedidos; nome do comprador e nome do produto são preenchidos automaticamente a partir do pedido selecionado; usuário pode editar a mensagem antes de gerar; saída é um PDF com 4 etiquetas por folha A4, pronto pra impressão.
- Cada geração (logo, banner ou lote de etiquetas) consome créditos do plano do usuário, seguindo a mesma lógica de cobrança já usada pelo Gerador de anúncios.
- Estado vazio claro em cada uma das 3 telas quando o usuário ainda não gerou nada (mesmo padrão dos outros estados vazios do app).

### Importante (P1)

- Histórico de gerações — ver logos/banners/etiquetas já criados anteriormente, sem precisar gerar de novo (equivalente ao "Meus Anúncios" do Gerador de anúncios).
- Edição leve pós-geração (trocar texto, ajustar cor) sem precisar gerar tudo de novo do zero.
- Reaproveitamento automático: ao gerar um banner, sugerir usar a última logo gerada como ponto de partida, sem o usuário precisar buscar o arquivo.

### Considerações Futuras (P2)

- Outros formatos de etiqueta (folha com mais/menos unidades por página, adesivo redondo, QR code de avaliação).
- Outros marketplaces nos banners, conforme forem entrando na Calculadora/Gerador de anúncios.
- Editor visual mais livre (tipo Canva) pra quem quiser personalizar além do que a geração por IA entrega.
- Aplicar a mesma identidade (logo + paleta) automaticamente em todos os materiais gerados depois (banner, etiqueta, futuros formatos), sem o usuário reintroduzir a descrição toda vez.

## Métricas de Sucesso

**Indicadores Antecedentes**

- Taxa de adoção do menu Marketing entre usuários elegíveis (abriu pelo menos 1 das 3 telas) nos primeiros 30 dias.
- Taxa de conclusão: % de quem abre cada gerador e efetivamente completa 1 geração com sucesso (sem erro).
- Taxa de download: % de gerações completas que resultam em download do arquivo final (gerar sem baixar é sinal de insatisfação com o resultado).
- Tempo médio até a primeira geração completa, por sub-feature.

**Indicadores Consequentes**

- Redução de tickets de suporte pedindo ajuda com identidade visual de loja.
- Consumo de créditos atribuído a este menu — sinal indireto de valor percebido, e possível gatilho de upgrade de plano.
- NPS / satisfação declarada em pesquisa, específica sobre esse menu.

Metas numéricas específicas (ex: "25% de adoção em 30 dias") ficam pra definição conjunta com dados/growth — não há baseline hoje, já que a feature ainda não existe.

## Perguntas em Aberto

- Quantas variações de logo a IA deve gerar por chamada (1, 3 ou 4)? E isso conta como 1 crédito só ou 1 crédito por variação mostrada? — Responsável: João / Produto. Bloqueante pra modelagem de custo e pro desenho da tela.
- Quais as dimensões oficiais exatas de capa de loja Shopee e Mercado Livre que devem ser usadas como target de geração? — Responsável: Design/Produto. Bloqueante pros requisitos técnicos do Gerador de Banners.
- Quando o usuário não tem nenhum pedido no Histórico/Pedidos (conta nova, ainda sem vendas), a etiqueta fica bloqueada até a primeira venda, ou existe um modo manual de fallback (digitar nome/produto na mão)? — Responsável: João. A escolha de v1 foi "automático a partir do pedido", então esse caso de borda precisa de decisão antes de implementar.
- Os templates de banner e a geração de logo precisam seguir alguma diretriz de marca das próprias plataformas (uso do nome/cores oficiais do Shopee ou Mercado Livre)? — Responsável: Jurídico/Design. Bloqueante antes de ir pra produção, pra evitar problema de uso indevido de marca de terceiros.
- Esse menu deve ser gateado por idioma/mercado como Configurações e o passo de onboarding "Conectar marketplace" já são hoje (`MOSTRAR_CONFIGURACOES`, `MOSTRAR_PASSO_MARKETPLACE` em `versoes.ts`), já que os banners dependem de Shopee/MELI (mercado PT)? — Responsável: João. Não bloqueia o v1 em PT, mas precisa de decisão antes de traduzir o menu pra ES/EN.
- O consumo de crédito deve ser igual entre as 3 features, ou o custo de geração de imagem (logo/banner) deve valer mais créditos do que gerar um PDF de etiqueta (que não depende de geração de imagem por IA)? — Responsável: João / Financeiro.

## Considerações de Timeline

- Nenhum prazo contratual ou evento externo identificado até o momento.
- V1 entra como fase única, com as 3 sub-features juntas (logo, banners, etiquetas), conforme decisão do Produto — sem faseamento entre elas.
- Depende da mesma infraestrutura de geração por IA já usada pelo Gerador de anúncios (reaproveitar, não recriar do zero).
- A qualidade da experiência de Etiquetas de Agradecimento no v1 depende de o usuário já ter Pedidos/Histórico povoados — em conta nova e vazia, a feature tem valor limitado até a primeira venda (ver Pergunta em Aberto correspondente).
