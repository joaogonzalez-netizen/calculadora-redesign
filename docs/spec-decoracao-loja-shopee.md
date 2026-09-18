# Spec Técnica — Decoração de Loja (Shopee)

**Produto:** STLSeller
**Versão:** 0.1 — V1 (P0 do PRD): Capa da Loja + Carrossel estático
**Audiência:** Time de desenvolvimento
**Complementa:** PRD — Gerador de Imagens de Decoração de Loja (Shopee)

---

## 0. Contexto técnico

Mesma base do resto do menu Marketing: sem IA/backend real, geração determinística no client (canvas), consumo de créditos mockado local. As 3 perguntas bloqueantes do PRD foram resolvidas como decisão de prototipagem (ver seção "Notas de implementação" do PRD), não como definição de produto final.

Diferencial desta feature em relação a Logo/Banners: precisa de **validação programática real** contra peso/dimensão (requisito P0 explícito do PRD) — isso é implementado de verdade (não só um selo visual), via compressão JPEG progressiva até caber no limite.

---

## 1. Escopo

Cobre apenas P0 do PRD: Capa da Loja (peça única) e Carrossel (até 6 seções, 4 proporções). P1 (múltiplas variações, biblioteca de estilos, histórico) e P2 (vídeo, outros componentes/marketplaces) ficam de fora.

**Módulo dedicado** — não faz parte do Gerador de Anúncios (My Ads). Entra como 4º item do grupo "Marketing" na sidebar, ao lado de Logo/Banners/Etiquetas (mesma família de "materiais visuais pra loja"), mas com tela própria.

---

## 2. Navegação

- `View` (`App.tsx`) ganha `'marketing-decoracao'`.
- `Sidebar.tsx`: `VIEWS_DO_MARKETING` ganha `'marketing-decoracao'`; novo item no `nav-sub` do grupo Marketing.
- `Topbar.tsx`: `'marketing-decoracao': 'topbar.title.marketing-decoracao'`.
- Novo arquivo: `src/views/MarketingDecoracaoLojaView.tsx`.
- Adiciona-se ao `CUSTO_CREDITOS` e a novos helpers em `src/lib/marketing.ts` (mesmo arquivo das outras 3 features — evita fragmentar o módulo).

---

## 3. Especificações técnicas (fonte: PRD)

```ts
export const SPEC_CAPA_LOJA = {
  largura: 1200,
  altura: 518,
  pesoMaximoBytes: 2 * 1024 * 1024, // 2.0 MB
};

export type Proporcao = '2:1' | '16:9' | '1:1' | 'livre';

export const RATIO_CARROSSEL: Record<Exclude<Proporcao, 'livre'>, number> = {
  '2:1': 2,
  '16:9': 16 / 9,
  '1:1': 1,
};

export const SPEC_CARROSSEL = {
  pesoMaximoBytes: 2 * 1024 * 1024, // 2 MB por imagem
  resolucaoMaxima: 2000,            // 2000×2000 px máximo (imagem)
  maxSecoes: 6,
};
```

Modo "Livre": usuário informa largura/altura em px; ambas clampadas a `SPEC_CARROSSEL.resolucaoMaxima` (2000) antes de gerar — nunca deixamos passar um valor acima do teto pro canvas.

---

## 4. Fluxo — Capa da Loja

1. Dropzone mockada (reaproveita o padrão visual de `UploadStep.tsx`/`.ger-dropzone`, `.ger-thumbs-grid`): clicar adiciona uma "foto" mock (swatch de cor, mesmo esquema do Gerador de Anúncios), até 5. Mínimo 1 pra habilitar geração.
2. Prompt guiado: chips de estilo (reaproveita `Estilo` já existente: Minimalista/Divertido/Elegante/Colorido) + textarea livre pra tema/paleta.
3. Botão "Gerar capa da loja" — mostra custo em créditos antes do clique (`CUSTO_CREDITOS.capaLoja`, placeholder).
4. Geração: canvas fixo em 1200×518, composição mock (fundo gradiente determinístico a partir do prompt + swatches das fotos "enviadas" dispostos em colagem — ver `desenharDecoracaoNoCanvas`).
5. **Validação real**: canvas exportado via `gerarJpegValidado()`, que tenta `canvas.toBlob(..., 'image/jpeg', qualidade)` começando em 0.92 e reduzindo em passos de 0.1 até o blob couber em `pesoMaximoBytes` ou a qualidade mínima (0.4) ser atingida. Resultado exibido ao usuário: "✓ 1200×518 px · JPG · 184 KB" ou aviso se não coube mesmo na qualidade mínima (caso de borda raro dado o tamanho da peça, mas o código cobre).
6. Download do blob validado (`baixarBlob`).
7. "Regenerar" — repete o passo 4 sem precisar preencher tudo de novo (US-05).

---

## 5. Fluxo — Carrossel

1. Seletor de proporção (chip-row: 2:1 · 16:9 · 1:1 · Livre). "Livre" revela 2 inputs numéricos (largura/altura), clampados a 2000px.
2. Seletor de número de seções (1 a 6, default 3).
3. Mesmo par dropzone + prompt guiado do Capa da Loja, estado independente (cada card do menu tem seu próprio conjunto de fotos/prompt — não compartilha com a Capa da Loja).
4. Botão "Gerar carrossel" — custo mostrado como `seções × CUSTO_CREDITOS.carrosselSecao` antes do clique.
5. Geração: uma seção por vez, todas na mesma proporção escolhida — dimensão real computada a partir de uma largura-base (1600px, ou o valor "Livre" informado) e da razão selecionada, sempre clampada a 2000×2000.
6. Cada seção passa pela mesma validação de peso (`gerarJpegValidado`) e é exibida num grid com selo de validação + botão "Baixar" individual + "Regenerar esta seção" (regenera só aquele item, não o conjunto — US-05).

---

## 6. Geração mock (composição visual)

```ts
export function desenharDecoracaoNoCanvas(
  canvas: HTMLCanvasElement,
  largura: number,
  altura: number,
  promptTexto: string,
  qtdFotos: number,
  estilo: Estilo,
): void
```

- Fundo: gradiente linear entre 2 cores da paleta de `Estilo` (reaproveita a lógica de seed determinística já usada em `desenharBannerNoCanvas`/`gerarVariacoesLogo`), seed a partir de `promptTexto || estilo`.
- Colagem: `qtdFotos` retângulos arredondados (placeholders de "foto real", mesmo espírito do `CORES_MOCK` do Gerador de Anúncios) distribuídos em faixa horizontal, cor derivada do mesmo seed pra variar entre fotos.
- Sem texto sobreposto (fora de escopo — "Texto" é um componente do editor de decoração não coberto neste V1, conforme Não-Objetivos do PRD).

---

## 7. Validação de peso — implementação real

```ts
export function gerarJpegValidado(
  canvas: HTMLCanvasElement,
  pesoMaximoBytes: number,
): Promise<{ blob: Blob; tamanhoBytes: number; dentroDoLimite: boolean; qualidade: number }>
```

Loop de qualidade decrescente (0.92 → 0.4, passo 0.1) via `canvas.toBlob(cb, 'image/jpeg', qualidade)`, parando no primeiro blob que cabe no limite ou ao chegar no piso de qualidade. Nunca lançamos exceção — no pior caso, devolvemos `dentroDoLimite: false` e a UI mostra um aviso em vez de liberar o download, cumprindo o requisito "nunca entregar um arquivo fora da spec".

---

## 8. Créditos

```ts
CUSTO_CREDITOS = {
  ...,
  capaLoja: 15,        // placeholder — pergunta em aberto do PRD
  carrosselSecao: 6,   // placeholder, cobrado por seção gerada
};
```

Mesmo contador mock (`stlseller_creditos_mock`) já usado por Logo/Banners/Etiquetas — sem tabela de billing real.

---

## 9. Critérios de Aceite

### CA-01 — Capa da Loja na dimensão exata
- **Dado** que o usuário gera uma Capa da Loja
- **Então** o arquivo final tem exatamente 1200×518 px

### CA-02 — Capa da Loja sempre ≤ 2MB
- **Dado** qualquer geração de Capa da Loja
- **Então** o blob final baixado nunca excede 2.0 MB (validado programaticamente, não só exibido)

### CA-03 — Carrossel respeita a proporção escolhida
- **Dado** que o usuário escolhe 1:1 (ou 2:1, ou 16:9)
- **Quando** gera as seções do carrossel
- **Então** todas as seções saem exatamente naquela proporção

### CA-04 — Modo Livre nunca excede 2000×2000
- **Dado** que o usuário digita uma largura ou altura acima de 2000px no modo Livre
- **Então** o valor é clampado a 2000px antes da geração, sem travar a tela

### CA-05 — Até 6 seções
- **Dado** o seletor de número de seções do carrossel
- **Então** o valor máximo selecionável é 6

### CA-06 — Regeneração pontual
- **Dado** um carrossel já gerado com N seções
- **Quando** o usuário clica "Regenerar" numa seção específica
- **Então** só aquela seção é refeita — as demais permanecem como estavam

### CA-07 — Créditos exibidos antes de gerar
- **Dado** qualquer uma das duas gerações (Capa ou Carrossel)
- **Então** o custo em créditos aparece antes do clique em "Gerar", e o carrossel mostra o total (seções × custo por seção)

---

## 10. Fora de escopo desta spec

- Geração de vídeo, demais componentes do editor de decoração, publicação via API Shopee, outros marketplaces — todos P2/não-objetivo do PRD.
- Múltiplas variações por geração, biblioteca de estilos pré-definidos, histórico de peças geradas — P1 do PRD, não implementado agora.
- Upload de foto real (arquivo de verdade) — mockado com swatches, mesmo padrão do resto do app.

## 11. Perguntas em aberto (técnicas, complementam o PRD)

- Os valores de `CUSTO_CREDITOS.capaLoja`/`carrosselSecao` são só placeholder — mesma pendência já registrada no PRD (pergunta "[Produto]").
- Quando `gerarJpegValidado` não consegue caber no limite mesmo na qualidade mínima (cenário de borda, praticamente não acontece com composições simples como as daqui), qual deve ser o comportamento exato pro usuário — bloquear o download com mensagem, ou baixar mesmo assim avisando que passou do peso? V1 bloqueia; validar se é o comportamento desejado.
