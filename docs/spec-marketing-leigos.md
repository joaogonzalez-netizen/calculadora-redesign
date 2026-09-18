# Spec Técnica — Menu Marketing (Logo, Banners e Etiquetas de Agradecimento)

**Produto:** STLSeller
**Versão:** 0.1 — v1 greenfield, as 3 sub-features numa fase única
**Audiência:** Time de desenvolvimento
**Complementa:** PRD — Menu Marketing (Logo, Banners e Etiquetas de Agradecimento)

---

## 0. Contexto técnico importante antes de implementar

Este app é um protótipo front-end (sem backend real): todo dado vem de mock/localStorage, e o Gerador de anúncios (`CriarAnuncioView`) — a feature mais parecida com o que vamos construir — **não chama nenhuma IA de verdade**. Ele simula upload de imagem com swatches de cor (`CORES_MOCK`) e mostra sugestões de texto pré-escritas. Créditos (`CREDITOS` em `dashboardMock.ts`) também são só um número estático exibido na Topbar — não existe hoje nenhum lugar do código que decremente crédito de verdade.

Esta spec segue a mesma fidelidade: **v1 é a UX completa, com geração mockada** (mesmo padrão do Gerador de anúncios) — não integra IA real nem um backend de créditos real. Onde a saída final precisa ser um arquivo baixável de verdade (PNG da logo, PDF das etiquetas), a spec usa geração 100% client-side (canvas/SVG + impressão do navegador), que já é factível sem nenhuma dependência nova — só a *entrada* (o desenho gerado "pela IA") é mockada, o *arquivo de saída* é real e funcional.

---

## 1. Escopo desta spec

Cobre as 3 sub-features como fase única (v1), a estrutura de navegação nova, e o mecanismo de consumo de créditos mockado.

**Fora do escopo desta spec** (ver Perguntas em Aberto do PRD, ainda sem decisão):
- Geração por IA de verdade (depende de integração de backend, fora do que este protótipo faz hoje).
- Consumo de créditos real (depende de sistema de billing, que não existe no app).
- Histórico de gerações anteriores (P1 do PRD).
- Dimensões oficiais exatas de capa Shopee/Mercado Livre — usar valores de referência abaixo como placeholder até validação de Design.

---

## 2. Estrutura de navegação

### 2.1 Sidebar — novo grupo com submenu

Sidebar hoje tem 2 grupos com submenu (`GrupoId = 'gerador' | 'calculadora'`, ver `src/components/Sidebar.tsx`). Este trabalho adiciona um terceiro, seguindo exatamente o mesmo padrão:

```ts
type GrupoId = 'gerador' | 'calculadora' | 'marketing';

const VIEWS_DO_MARKETING: View[] = ['marketing-logo', 'marketing-banners', 'marketing-etiquetas'];

const GRUPOS: { id: GrupoId; label: string; icon: IconName }[] = [
  { id: 'gerador', label: t('nav.geradorAnuncios'), icon: 'gerador' },
  { id: 'calculadora', label: t('nav.calculadoraPrecos'), icon: 'calculadora' },
  { id: 'marketing', label: t('nav.marketing'), icon: 'box' }, // ícone placeholder — Design escolhe o definitivo
];
```

Sub-itens (mesmo padrão de `nav-sub` usado por `calculadora`/`gerador`):

```tsx
{g.id === 'marketing' && aberto === 'marketing' && !collapsed && (
  <div className="nav-sub">
    <div className={view === 'marketing-logo' ? 'active' : ''} onClick={() => onNavigate('marketing-logo')}>{t('nav.geradorLogo')}</div>
    <div className={view === 'marketing-banners' ? 'active' : ''} onClick={() => onNavigate('marketing-banners')}>{t('nav.geradorBanners')}</div>
    <div className={view === 'marketing-etiquetas' ? 'active' : ''} onClick={() => onNavigate('marketing-etiquetas')}>{t('nav.etiquetasAgradecimento')}</div>
  </div>
)}
```

Posição na sidebar: dentro de "Ferramentas", depois de "Calculadora de preços" (mesma seção dos outros dois grupos).

### 2.2 `View` (App.tsx) e roteamento

```ts
export type View = /* ...existentes... */
  | 'marketing-logo' | 'marketing-banners' | 'marketing-etiquetas';
```

As 3 views entram na lista de `content-wide` (mesma classe usada por Dashboard/Gerador/Buscador) — telas de geração precisam de mais largura que o formulário estreito da Calculadora.

### 2.3 Topbar — títulos

```ts
'marketing-logo': 'topbar.title.marketing-logo',
'marketing-banners': 'topbar.title.marketing-banners',
'marketing-etiquetas': 'topbar.title.marketing-etiquetas',
```

### 2.4 Novos arquivos

```
src/views/MarketingLogoView.tsx
src/views/MarketingBannersView.tsx
src/views/MarketingEtiquetasView.tsx
src/lib/marketing.ts        // persistência localStorage + helpers de geração mock
```

---

## 3. Gerador de Logo

### 3.1 Fluxo (mesmo esqueleto de wizard do `CriarAnuncioView`, sem os passos irrelevantes)

1. **Formulário**: nome da loja (texto, obrigatório), nicho (select curto — mesma lista de categorias já usada em algum lugar do app, ou lista nova simples), estilo (chips: Minimalista / Divertido / Elegante / Colorido), paleta de cor opcional (color picker simples, 1 cor base).
2. **Gerar** → estado `gerando: true` por ~1.2s (mesmo padrão de delay artificial do resto do app) → mostra grid de **4 variações mockadas**.
3. **Variações mockadas**: cada card é um SVG gerado no client a partir do nome da loja (iniciais) + a cor escolhida (ou uma de 5 cores padrão do design system se o usuário não escolher) + uma de 4 formas de moldura (círculo, hexágono, quadrado arredondado, escudo). Isso substitui a "IA de verdade" por algo determinístico, mas visualmente plausível — mesmo espírito do `CORES_MOCK` do Gerador de anúncios, só que gera algo utilizável de verdade.
4. Usuário clica numa variação → ela fica marcada como selecionada → botão "Baixar PNG" habilita.
5. **Baixar PNG**: renderiza o SVG selecionado num `<canvas>` (2000×2000px, fundo transparente) e dispara download via `canvas.toBlob()` + link temporário — 100% client-side, sem backend.

### 3.2 Estado

```ts
interface LogoVariacao { id: string; iniciais: string; cor: string; forma: 'circulo' | 'hexagono' | 'quadrado' | 'escudo'; }

const [nomeLoja, setNomeLoja] = useState('');
const [nicho, setNicho] = useState('');
const [estilo, setEstilo] = useState<'minimalista' | 'divertido' | 'elegante' | 'colorido'>('minimalista');
const [corBase, setCorBase] = useState<string | null>(null);
const [gerando, setGerando] = useState(false);
const [variacoes, setVariacoes] = useState<LogoVariacao[]>([]);
const [selecionada, setSelecionada] = useState<string | null>(null);
```

### 3.3 Consumo de créditos (mock)

Cada clique em "Gerar" desconta um valor fixo mockado (placeholder: 10 créditos — **valor real a definir**, ver Perguntas em Aberto do PRD) de um contador local (`src/lib/marketing.ts`, chave `stlseller_creditos_mock`), reaproveitando o mesmo número hoje estático da Topbar. **Não altera `CREDITOS` de `dashboardMock.ts`** nesta fase — criar um valor mockado próprio e mutável, já que o da Topbar é uma constante estática compartilhada por todo o app (mexer nela teria efeito colateral em todas as telas).

---

## 4. Gerador de Banners

### 4.1 Fluxo

1. **Escolha de plataforma**: dois cards grandes — Shopee / Mercado Livre — cada um já mostrando a proporção/dimensão de referência.
2. **Formulário**: nome da loja (pré-preenchido se já veio do Gerador de Logo na mesma sessão), texto de destaque opcional (ex.: "Frete grátis"), reaproveitar logo já gerada (checkbox, só aparece se existir uma logo salva em `stlseller_marketing_logo_atual`).
3. **Gerar** → mesmo delay mockado → **1 preview** do banner já na proporção oficial da plataforma escolhida (ver dimensões abaixo), composto por: cor de fundo (derivada da paleta escolhida no Logo, ou uma cor default), nome da loja centralizado, e a logo sobreposta (se o usuário marcou reaproveitar).
4. **Baixar PNG**: mesmo mecanismo do Logo (canvas → blob → download), já exportado nas dimensões oficiais em pixels.

### 4.2 Dimensões de referência (placeholder — validar com Design antes de codar, ver PRD)

| Plataforma | Peça | Dimensão (placeholder) |
|---|---|---|
| Shopee | Capa da loja | 2020 × 500 px |
| Mercado Livre | Capa da loja | 1140 × 220 px |

> ⚠️ Valores de referência de mercado, **não confirmados oficialmente** — mesma ressalva já usada na spec do canal Mercado Libre Argentina para tabelas de terceiros. Não implementar em produção sem validação.

### 4.3 Estado

```ts
type Plataforma = 'shopee' | 'mercado-livre';
const [plataforma, setPlataforma] = useState<Plataforma | null>(null);
const [nomeLoja, setNomeLoja] = useState('');
const [textoDestaque, setTextoDestaque] = useState('');
const [reaproveitarLogo, setReaproveitarLogo] = useState(false);
const [gerando, setGerando] = useState(false);
const [bannerGerado, setBannerGerado] = useState<{ dataUrl: string; largura: number; altura: number } | null>(null);
```

---

## 5. Etiquetas de Agradecimento

### 5.1 Origem do dado — importante

O PRD fala em "Histórico/Pedidos", mas só **Pedidos** (`src/lib/pedidosMock.ts`, interface `Pedido`) tem o campo `comprador` — `HistoricoEntry` (Histórico da Calculadora) não guarda nome de cliente, só nome do produto calculado. **A etiqueta usa `PEDIDOS` como fonte, não o Histórico da Calculadora.**

Campos usados do `Pedido`: `comprador`, `produto`, `marketplace`, `id` (ou `codigoMlb`).

Dependência de escopo: a tela de Pedidos (e portanto os dados de `Pedido`) hoje só é visível na versão PT (`MOSTRAR_MENUS_PRINCIPAIS`, ver `versoes.ts`) — mesmo que o usuário não veja o menu "Pedidos", os dados mock de `pedidosMock.ts` continuam acessíveis via import direto, então a feature funciona tecnicamente em qualquer idioma. Se isso é desejável ou se Etiquetas também deveria ser gateada por idioma é a mesma pergunta em aberto já registrada no PRD.

### 5.2 Fluxo

1. **Seleção de pedidos**: tabela com checkbox (reaproveitar o componente de listagem de `PedidosView`, ou uma versão simplificada só com Produto / Comprador / Marketplace / Data), multi-seleção.
2. **Mensagem**: textarea com uma mensagem padrão pré-preenchida (ex.: *"Obrigado por comprar com a gente, {comprador}! Esperamos que você ame o(a) {produto}. 💚"*), com `{comprador}` e `{produto}` como placeholders substituídos por pedido no momento de gerar — usuário pode editar o texto base livremente, mas os placeholders continuam funcionando por pedido.
3. **Preview**: grid mostrando como fica 1 etiqueta (com o primeiro pedido selecionado, pra conferência), antes de gerar o PDF final.
4. **Gerar PDF**: consome créditos (1× por lote, não por etiqueta — mockado, valor placeholder a definir) e abre a visualização de impressão.

### 5.3 Layout 4-por-A4 — geração via impressão do navegador (sem nova dependência)

Em vez de uma lib de PDF (nenhuma está instalada hoje), a spec usa `window.print()` com uma folha de estilo `@media print` dedicada — abordagem 100% nativa do navegador, o usuário salva como PDF pelo próprio diálogo de impressão (`Salvar como PDF`), já com margens e tamanho corretos:

```css
@media print {
  body * { visibility: hidden; }
  .etiquetas-print-sheet, .etiquetas-print-sheet * { visibility: visible; }
  .etiquetas-print-sheet {
    position: absolute; top: 0; left: 0;
    width: 210mm; height: 297mm; /* A4 */
    display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;
    gap: 4mm; padding: 10mm;
  }
  .etiqueta-print-item { border: 1px dashed #999; padding: 8mm; }
  @page { size: A4; margin: 0; }
}
```

- Grid 2×2 = 4 etiquetas por folha, repetindo a cada 4 pedidos selecionados (mais de 4 pedidos → múltiplas folhas, o navegador quebra página sozinho pelo fluxo normal do grid/`page-break`).
- Cada `.etiqueta-print-item` renderiza: nome da loja (se cadastrado/gerado no Logo), a mensagem com os placeholders já substituídos, e o nome do produto.
- Fluxo do usuário: clica "Gerar etiquetas" → app monta o grid oculto com `.etiquetas-print-sheet` → chama `window.print()` → diálogo nativo do navegador abre já no layout A4 correto → usuário escolhe "Salvar como PDF" (ou imprime direto).

### 5.4 Estado

```ts
interface EtiquetaSelecao { pedidoId: string; }

const [pedidosSelecionados, setPedidosSelecionados] = useState<Set<string>>(new Set());
const [mensagemBase, setMensagemBase] = useState(t('marketing.etiquetaMensagemPadrao'));
```

---

## 6. Créditos (mock)

Não existe sistema de créditos real no app — `CREDITOS` (`dashboardMock.ts`) é uma string estática exibida na Topbar, nunca decrementada. Pra esta feature:

- Criar `stlseller_creditos_mock` em `localStorage` (helpers em `src/lib/marketing.ts`: `getCreditosMock()`, `descontarCreditosMock(qtd)`), inicializado com o mesmo valor de `CREDITOS` na primeira leitura.
- Cada geração (Logo, Banner, lote de Etiquetas) desconta um valor fixo placeholder — **os valores exatos por feature são uma Pergunta em Aberto do PRD**, não decidir sozinho no código.
- Se o saldo mock ficar insuficiente, mostrar estado de bloqueio simples (mesmo padrão visual de estado vazio já usado no app) — sem fluxo de compra de créditos nesta fase (fora de escopo).
- **Não** mexer na constante `CREDITOS` da Topbar nesta versão — ela é compartilhada globalmente e alterá-la teria efeito colateral em todas as telas que a exibem hoje.

---

## 7. Persistência (localStorage)

| Chave | Conteúdo |
|---|---|
| `stlseller_marketing_logo_atual` | Última logo gerada/selecionada (SVG serializado + metadados), pra reaproveitar no Banner |
| `stlseller_marketing_banners` | Lista de banners já gerados nesta sessão (não persiste histórico completo nesta fase — P1) |
| `stlseller_creditos_mock` | Saldo de créditos mockado, específico deste menu |

---

## 8. Critérios de Aceite

### CA-01 — Navegação
- **Dado** que o usuário está em qualquer tela
- **Quando** abre o grupo "Marketing" na sidebar
- **Então** vê 3 sub-itens: Gerador de Logo, Gerador de Banners, Etiquetas de Agradecimento

### CA-02 — Logo: geração e seleção
- **Dado** que o usuário preencheu nome da loja e clicou em "Gerar"
- **Então** vê 4 variações de logo após o delay de geração
- **Quando** seleciona uma variação
- **Então** o botão "Baixar PNG" fica habilitado

### CA-03 — Logo: download real
- **Dado** uma variação selecionada
- **Quando** clica em "Baixar PNG"
- **Então** um arquivo PNG é baixado de verdade pelo navegador (não é um alerta/placeholder)

### CA-04 — Banner: dimensão correta por plataforma
- **Dado** que o usuário escolheu "Shopee" ou "Mercado Livre"
- **Quando** gera o banner
- **Então** o PNG exportado tem exatamente a dimensão de referência da plataforma escolhida (Seção 4.2)

### CA-05 — Banner: reaproveita logo
- **Dado** que existe uma logo salva em `stlseller_marketing_logo_atual`
- **Quando** o usuário marca "Reaproveitar logo" no formulário de Banner
- **Então** a logo aparece sobreposta no preview e no PNG final

### CA-06 — Etiqueta: dado automático do pedido
- **Dado** que o usuário selecionou 1 ou mais pedidos
- **Então** o nome do comprador e do produto de cada etiqueta vêm do `Pedido` correspondente, sem digitação manual

### CA-07 — Etiqueta: 4 por folha A4
- **Dado** 4 pedidos selecionados
- **Quando** o usuário clica em "Gerar etiquetas"
- **Então** o diálogo de impressão do navegador abre com uma folha A4 contendo as 4 etiquetas em grid 2×2

### CA-08 — Etiqueta: mais de 4 pedidos quebra página
- **Dado** 5 ou mais pedidos selecionados
- **Quando** gera as etiquetas
- **Então** a 5ª etiqueta em diante aparece numa segunda folha A4, sem cortar conteúdo da primeira

### CA-09 — Créditos mockados descontam
- **Dado** um saldo de créditos mock atual
- **Quando** o usuário completa qualquer uma das 3 gerações
- **Então** o saldo mockado é descontado no valor placeholder daquela feature

---

## 9. Fora de escopo / dependências

- Geração por IA real, integração de backend, sistema de créditos real: nenhum existe hoje no app — tudo aqui é mockado no mesmo espírito do Gerador de anúncios.
- Validação oficial das dimensões de banner Shopee/Mercado Livre: pendência de Design antes de ir pra produção (Seção 4.2).
- Definição dos valores exatos de crédito por geração: pendência de Produto/Financeiro (PRD).
- Histórico de gerações anteriores, edição pós-geração, lote maior de personalização: P1/P2 do PRD, não fazem parte desta spec.
- Qualquer diretriz de marca de terceiros (uso de cores/nome oficial do Shopee/Mercado Livre no banner): pendência jurídica do PRD, não resolvida aqui.

---

## 10. Perguntas em aberto (técnicas, complementam o PRD)

- `window.print()` com `@media print` é suficiente pro "PDF pronto pra impressão", ou o produto quer um PDF de fato gerado (arquivo `.pdf` baixado direto, sem depender do usuário escolher "Salvar como PDF" no diálogo do navegador)? Se for o segundo caso, precisa adicionar uma lib (`jsPDF` ou similar) como nova dependência — mudança de escopo técnico a validar antes de implementar.
- A logo "gerada" via SVG determinístico (iniciais + forma + cor) é aceitável como fidelidade de v1, ou o produto espera algo visualmente mais sofisticado mesmo sem IA real por trás? Isso muda a complexidade de implementação da Seção 3.
- Pedidos com nome de comprador incompleto/anônimo (ex.: `compradorHandle` genérico do marketplace) — a etiqueta deve usar o handle, pedir confirmação manual, ou pular esse pedido da seleção?
