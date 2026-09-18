# PRD — Gerador de Imagens de Decoração de Loja (Shopee)

**Data:** 18/09/2026
**Módulo:** Dedicado (não faz parte do My Ads)
**Marketplace alvo (V1):** Shopee

---

## Problema

O seller do STLSeller precisa entregar imagens de decoração de loja (capa e carrossel) que respeitem as especificações técnicas exatas da Shopee para serem aceitas no editor da plataforma. Hoje ele monta isso manualmente (Canva, designer externo ou tentativa e erro), sem garantia de que o arquivo final vai passar nos limites de dimensão, peso e formato exigidos — gerando retrabalho e uploads rejeitados.

## Objetivos

- Gerar imagem de Capa da Loja dentro da especificação exata da Shopee, sem necessidade de ajuste manual de dimensão/peso pelo seller
- Gerar imagens de Carrossel nas proporções aceitas pela Shopee, prontas para upload direto no editor
- Permitir que o seller combine fotos reais do produto com um prompt de estilo/tema para compor a peça
- Reduzir o tempo entre "quero decorar minha loja" e "tenho o arquivo pronto pra subir" — hoje medido em minutos/horas gastos em ferramenta externa

## Não-Objetivos

- **Publicação automática via API da Shopee** — este PRD cobre apenas geração de imagem; upload é manual pelo seller no editor da Shopee (integração de publicação é iniciativa separada, mesmo padrão do `PRD_Publicacao_Shopee_MyAds.md`)
- **Geração de vídeo para o carrossel** — Shopee aceita vídeo no carrossel (MP4, até 30MB, 10-60s), mas o V1 cobre apenas imagem estática; vídeo fica como consideração futura (P2), alinhado ao fato de que geração de vídeo no My Ads também ainda está em construção
- **Outros componentes do editor de decoração** (Banner com tag, Vitrine de áreas clicáveis, Destaques de produto, Texto, Múltiplas imagens) — fora do escopo do V1, mas o formato de output deve ser desenhado de forma extensível para cobri-los depois
- **Outros marketplaces** (Mercado Livre não tem "decoração de loja" no mesmo formato; Etsy tem banner de loja com specs próprias) — V1 é Shopee-only
- **Edição manual pós-geração dentro do STLSeller** (crop, texto sobreposto, ajuste fino) — seller baixa o arquivo e ajusta fora da plataforma se necessário

## Histórias de Usuário

*Persona: Seller do STLSeller decorando a loja na Shopee*
- US-01 — Geração de imagem de Capa da Loja a partir de fotos de produto + prompt de estilo
- US-02 — Geração de conjunto de imagens de Carrossel (múltiplas seções) a partir de fotos de produto + prompt de estilo
- US-03 — Seleção da proporção do Carrossel (2:1, 16:9, 1:1, Livre) antes da geração
- US-04 — Download do arquivo já validado contra as specs técnicas da Shopee (dimensão, peso, formato)
- US-05 — Regeneração de uma peça específica sem precisar refazer o conjunto inteiro

## Requisitos

### Essencial (P0)

**Especificação técnica — Imagem de Capa da Loja**
| Atributo | Valor |
|---|---|
| Dimensão de saída | 1200 × 518 px |
| Peso máximo do arquivo | 2.0 MB |
| Formatos aceitos | JPG, JPEG, PNG |
| Quantidade | 1 imagem por loja |

**Especificação técnica — Carrossel (banner rotativo)**
| Atributo | Valor |
|---|---|
| Proporções disponíveis | 2:1 · 16:9 · 1:1 · Livre |
| Peso máximo (imagem) | 2 MB |
| Resolução máxima (imagem) | 2000 × 2000 px |
| Formatos aceitos (imagem) | JPG, PNG, GIF |
| Seções por carrossel | até 6 |

**Requisitos funcionais**
- Sistema deve permitir upload de 1 ou mais fotos de produto do seller como input visual
- Sistema deve permitir um prompt de texto livre para definir tema/estilo/paleta da peça
- Geração deve respeitar automaticamente a proporção selecionada pelo seller (2:1, 16:9, 1:1 ou Livre) para o carrossel
- Output final deve ser validado programaticamente contra dimensão e peso antes de disponibilizar para download — nunca entregar um arquivo fora da spec da Shopee
- Custo em créditos deve ser exibido ao seller antes de disparar a geração (padrão já estabelecido no STLSeller)
- Formato de entrega: PNG ou JPG conforme aplicável, já no tamanho final (sem necessidade de redimensionamento pelo seller)

### Importante (P1)

- Geração de múltiplas variações da mesma peça (ex: 2-3 opções de Capa da Loja) para o seller escolher
- Biblioteca de estilos/temas pré-definidos como ponto de partida (o seller pode usar como base em vez de escrever prompt do zero)
- Histórico das últimas peças geradas, com opção de baixar novamente

### Considerações Futuras (P2)

- Geração de vídeo para o Carrossel (MP4, até 30MB, 1280×1280px, 10-60s)
- Cobertura dos demais componentes do editor de decoração (Banner com tag, Vitrine, Destaques de produto)
- Publicação direta via API da Shopee (sem passar por download manual)
- Extensão para outros marketplaces com formato de "loja decorada" (Etsy, por exemplo)

## Métricas de Sucesso

**Indicadores Antecedentes**
- Taxa de adoção: % de sellers ativos no My Ads que também geram ao menos 1 peça de decoração de loja em 30 dias
- Taxa de conclusão: % de gerações que resultam em download do arquivo final
- Taxa de erro de validação técnica: % de outputs que falhariam na spec da Shopee (meta: 0%, já que a validação é automática)
- Tempo médio do fluxo completo (upload de foto + prompt → download do arquivo pronto)

**Indicadores Consequentes**
- Consumo de créditos incremental gerado pela feature (impacto em NMRR)
- Redução de tickets de suporte relacionados a "como decorar minha loja" ou "imagem rejeitada pela Shopee"

## Perguntas em Aberto

- **[Design/Produto]** O prompt de estilo é campo livre ou guiado (ex: seleção de paleta + tom + categoria de nicho)? — bloqueante para design do fluxo
- **[Engenharia]** A geração usa o mesmo motor de imagem do My Ads ou requer avaliação de modelo separado para composição de banner (texto + produto + fundo)? — bloqueante
- **[Produto]** Custo em créditos da Capa da Loja e do Carrossel será igual ao de uma imagem do My Ads, ou terá tabela própria (já que carrossel gera múltiplas peças por seção)? — bloqueante
- **[Dados]** Como isso será instrumentado no Amplitude (`sel_` prefix) — evento próprio ou reaproveita namespace de geração de imagem do My Ads? — não bloqueante, mas precisa de definição antes do lançamento

## Considerações de Timeline

- Sem prazo fixo confirmado até o momento
- Dependência: motor de geração de imagem (mesmo usado ou não pelo My Ads) precisa suportar composição de banner com múltiplas proporções, não apenas imagem quadrada/retrato de anúncio
- Sugestão de faseamento: V1 = Capa da Loja + Carrossel estático (P0) → V1.1 = variações múltiplas + biblioteca de estilos (P1) → V2 = vídeo + demais componentes do editor (P2)

---

## Notas de implementação (v1 mockada, STLSeller protótipo)

Este protótipo não tem motor de IA nem backend real — nenhuma feature do app tem (nem o Gerador de anúncios). As 3 perguntas bloqueantes de engenharia foram resolvidas como decisão de prototipagem, não como resposta definitiva de produto:

- **Prompt**: guiado (chips de estilo) + campo de texto livre complementar — mesmo padrão já usado no Gerador de Logo.
- **Motor de geração**: mockado, determinístico, client-side (canvas) — mesmo padrão do Gerador de Logo/Banners. Sem geração de imagem por IA de verdade.
- **Custo em créditos**: tabela própria por peça (placeholder, a validar com Produto/Financeiro) — Capa da Loja com custo próprio, Carrossel cobrado por seção gerada.

Ver `docs/spec-decoracao-loja-shopee.md` para o detalhamento técnico.
