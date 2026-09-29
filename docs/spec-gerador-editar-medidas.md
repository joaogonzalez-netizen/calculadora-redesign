# Spec Técnica — Editor da imagem de medidas (Gerador de Anúncios)

**Produto:** STLSeller — Gerador de Anúncios, passo 5 "Imagens"
**Versão:** 2.0 — medidas livres, diâmetro e unidade cm/pol
**Audiência:** Time de desenvolvimento
**US de referência:** [us-gerador-editar-medidas.md](us-gerador-editar-medidas.md)
**Protótipo:** `src/components/gerador/MedidasModal.tsx` (modal + overlay SVG) e `src/components/gerador/ImagensStep.tsx` (card "Medidas")

---

## Escopo desta spec

Esta versão muda o modal "Editar imagem de medidas" em três pontos:

1. **Seleção de unidade:** a imagem inteira passa a poder estar em centímetros ou polegadas, com conversão dos valores.
2. **Medidas livres:** o maker adiciona, renomeia e remove medidas, sem limite, e edita o texto de cada uma.
3. **Diâmetro:** novo tipo de medida para peças redondas, com o símbolo "Ø".

O restante do editor (abrir pelo card, arrastar alças, Aprovar, Cancelar) já existia na v1 e só é descrito aqui quando a mudança afeta.

---

## 1. Estado anterior (v1) — referência

- O modal tinha 3 medidas fixas (largura, altura e comprimento), sempre em cm.
- Os valores vinham de 3 campos fixos no topo do painel: Largura (X), Profund. (Y) e Altura (Z).
- Cada medida podia ser ligada/desligada e ter o texto editado, mas não podia ser removida, renomeada nem duplicada.
- Não existia medida de diâmetro.

Os campos X/Y/Z foram removidos na v2: cada medida agora tem o próprio valor.

---

## 2. Modelo de dados

A configuração da imagem de medidas é um objeto único por anúncio:

```ts
type Unidade = 'cm' | 'in';

interface Ponto { x: number; y: number }   // coordenadas no canvas 1000×1000

interface Medida {
  id: string;             // único e estável (ver 3.6)
  tipo: 'reta' | 'diametro';
  nome: string;           // título na lista ("Altura com controle")
  prefixo: string;        // início do texto automático ("Comp.", "Ø")
  valor: string;          // na unidade da config; texto livre, aceita "," ou "."
  texto: string;          // o que é desenhado na imagem
  textoManual: boolean;   // true depois que o maker edita o texto à mão
  visivel: boolean;       // liga/desliga
  a: Ponto;               // ponta 1 da linha
  b: Ponto;               // ponta 2 da linha
}

interface MedidasConfig {
  unidade: Unidade;
  medidas: Medida[];      // ordem = ordem da lista no painel
}
```

| Campo | Tipo | Default | Observação |
|---|---|---|---|
| `unidade` | `'cm' \| 'in'` | `'in'` na versão EN, `'cm'` em PT e ES | Vale para todas as medidas |
| `medidas` | `Medida[]` | 3 medidas retas (ver 3.1) | Sem limite de itens; pode ficar vazio |
| `Medida.tipo` | enum | `'reta'` | Diâmetro usa a mesma geometria da reta (ver 3.5) |
| `Medida.valor` | string | ver 3.1 e 3.3 | Guardado como texto para não perder o que o maker digitou |
| `Medida.textoManual` | boolean | `false` | Controla se o texto é recalculado |

**Sistema de coordenadas:** todos os pontos estão num canvas quadrado de 1000×1000. A foto do produto ocupa o quadrado `x=60, y=30, lado=880` dentro dele. Isso deixa uma margem para textos fora da foto e faz a mesma config renderizar igual em qualquer tamanho (modal, miniatura do card, imagem final).

---

## 3. Regras de negócio

### 3.1 Medidas padrão

Ao abrir o editor pela primeira vez, ou ao clicar em "Restaurar padrão":

| Nome | Prefixo | Valor (cm) | Ponta `a` | Ponta `b` |
|---|---|---|---|---|
| Largura | Largura | 6 | (150, 905) | (850, 905) |
| Altura | Altura | 6 | (95, 130) | (95, 840) |
| Comprimento | Comp. | 11 | (330, 870) | (860, 560) |

- Na versão EN a config nasce em polegadas, com os valores já convertidos (2.36 / 2.36 / 4.33).
- "Restaurar padrão" descarta todas as medidas adicionadas, volta a unidade para o padrão do idioma e recria as 3 medidas acima, com ids novos.

### 3.2 Texto automático

```
textoAuto(prefixo, valor, simbolo) = trim(`${trim(prefixo)} ${trim(valor) || '0'} ${simbolo}`)
```

- `simbolo` é a unidade traduzida: `cm` em todos os idiomas; `pol` (PT), `pulg` (ES), `in` (EN).
- Enquanto `textoManual = false`, o texto é recalculado sempre que mudam:
  - o **valor** da medida;
  - o **nome** de uma medida reta (o prefixo passa a ser o nome);
  - a **unidade** da config.
- Quando o maker digita no campo de texto, `textoManual` vira `true` e o texto nunca mais é recalculado para aquela medida, mesmo que nome, valor ou unidade mudem.
- "Restaurar padrão" é o único jeito de voltar ao texto automático.

**Exemplos:**

| Situação | Texto |
|---|---|
| Comprimento, valor 11, cm | `Comp. 11 cm` |
| Reta renomeada para "Altura com controle", valor 14, cm | `Altura com controle 14 cm` |
| Diâmetro, valor 10, pol (PT) | `Ø 10 pol` |
| Valor apagado | `Largura 0 cm` |

### 3.3 Unidade e conversão

```
CM_POR_POLEGADA = 2.54

converter(valor, de, para, idioma):
  n = parseFloat(valor com "," trocada por ".")
  se n não é número ou de == para: retorna valor sem mudar
  convertido = para == 'in' ? n / 2.54 : n * 2.54
  casas = para == 'in' ? 2 : 1
  txt = String(Number(convertido.toFixed(casas)))   // remove zeros sobrando
  retorna idioma == 'en' ? txt : txt com "." trocado por ","
```

- A troca de unidade converte **todas** as medidas de uma vez e recalcula os textos automáticos (3.2).
- Valores que não são número (campo vazio, texto) ficam como estão.
- Clicar na unidade que já está ativa não faz nada.
- **Ida e volta (cm → pol → cm):** valores digitados em cm com até 1 casa decimal voltam exatamente ao original (verificado de 0,1 a 500 cm). Ex.: 6 → 2,36 → 6; 11 → 4,33 → 11.
- **Perda por arredondamento (comportamento aceito):**
  - cm com 2 casas perde a segunda casa na primeira conversão (6,25 cm → 2,46 pol → 6,2 cm);
  - valores digitados em polegadas geralmente não voltam exatos, porque cm guarda só 1 casa (2,50 pol → 6,4 cm → 2,52 pol).
  - Se isso for um problema, a alternativa é guardar o valor numérico original e converter só na exibição.
- O sufixo do campo de valor mostra o símbolo da unidade ativa.

**Tabela de exemplos (PT):**

| cm | pol |
|---|---|
| 6 | 2,36 |
| 10 | 3,94 |
| 11 | 4,33 |
| 14 | 5,51 |

### 3.4 Adicionar, renomear e remover medidas

**Adicionar:**

```
novaMedida(tipo, qtdAtual, unidade):
  d = (qtdAtual % 5) * 45          // desloca cada nova medida pra não empilhar
  valor = unidade == 'in' ? '4' : '10'
  reta:     nome = prefixo = "Medida",   a = (300+d, 480+d), b = (700+d, 480+d)
  diametro: nome = "Diâmetro", prefixo = "Ø", a = (310+d, 330+d), b = (690+d, 330+d)
```

- A medida nova entra no **fim** da lista, com `visivel = true` e `textoManual = false`.
- Ela já nasce **selecionada**: fica verde na imagem, com borda verde na lista, e a lista rola até o card dela.
- Não há limite de medidas. A lista tem altura máxima de 360px e rolagem própria.

**Renomear:**

- O nome é um input com borda visível e ícone de lápis, dentro do cabeçalho do card.
- Nome vazio é permitido. Nesse caso o texto automático fica só com valor e unidade (`6 cm`).
- Em medida reta, renomear atualiza o `prefixo` (e o texto, se automático). Em diâmetro, o prefixo continua `Ø`.

**Remover:**

- A lixeira remove a medida da config imediatamente, sem confirmação.
- Com a lista vazia, o painel mostra "Nenhuma medida. Adicione uma medida reta ou um diâmetro." e a imagem mostra só a foto.

### 3.5 Diâmetro

- Mesma geometria da reta: duas pontas (`a`, `b`), duas alças e arraste da linha para mover.
- Desenho: só a linha de ponta a ponta. **Sem elipse e sem tracejado.**
- O texto fica centralizado **sobre** a linha, com contorno branco (ver 3.7), inclusive quando a linha está deitada. A reta, nesse caso, joga o texto para baixo da linha; o diâmetro não.
- A linha pode ser inclinada para acompanhar a perspectiva da boca ou da base da peça.
- O prefixo é sempre `Ø`. O nome só identifica a medida na lista (ex.: "Diâmetro da base").

### 3.6 Identidade das medidas

- Cada medida tem um `id` aleatório (`'med_' + 8 caracteres base36`), gerado na criação.
- **Não usar contador sequencial em memória.** No protótipo, um contador reiniciado (hot reload) gerou ids repetidos e fez duas medidas passarem a editar o mesmo estado. Em produção, usar UUID ou id do backend.
- Todas as operações (editar, arrastar, remover) são por `id`. Editar uma medida nunca altera outra.

### 3.7 Posição e estilo do texto na imagem

Regra para cada medida, a partir do ângulo da linha normalizado para (-90°, 90°]:

| Condição | Posição do texto | Rotação | Contorno branco |
|---|---|---|---|
| Reta deitada (\|ângulo\| < 20°) | 40 unidades para fora da linha (abaixo) | 0° | Não |
| Reta em pé (\|ângulo\| > 60°) | 40 unidades para fora da linha (à esquerda) | ±90°, acompanhando a linha | Não |
| Reta diagonal | Sobre o meio da linha | 0° | Sim |
| Diâmetro (qualquer ângulo) | Sobre o meio da linha | 0°, ou ±90° se \|ângulo\| > 60° | Sim |

- Fonte: 26 unidades do canvas, peso 700, cor `#14181a`. O contorno branco tem 7 unidades, desenhado atrás do texto.
- Linha: 2,5 unidades (modal) ou 3 (miniatura), cor `#14181a`. Medida selecionada no modal: cor primária.
- Alças: círculo de raio 11, cor primária, borda branca de 4. Só aparecem no modal.

### 3.8 Limites de arraste

- Arrastar uma alça move só aquela ponta, limitada a 12 unidades da borda do canvas.
- Arrastar a linha move a medida inteira; o deslocamento é limitado para que nenhuma das duas pontas saia da margem de 12 unidades.
- Coordenadas de tela são convertidas para o canvas com `svg.getScreenCTM().inverse()`, então o arraste funciona em qualquer tamanho do modal.

### 3.9 Miniatura do card "Medidas"

- Depois de "Aprovar", o card renderiza a mesma `MedidasConfig`, sem alças e com os textos dentro de etiquetas brancas (fundo `#fff`, borda `rgba(0,0,0,.12)`, raio 6).
- Medidas com `visivel = false` não aparecem nem no modal nem na miniatura.
- "Cancelar", o X e o clique fora do modal descartam o rascunho: o card continua com a última config aprovada.

---

## 4. Componentes

| Componente | Arquivo | Responsabilidade |
|---|---|---|
| `MedidasModal` | `src/components/gerador/MedidasModal.tsx` | Estado de rascunho da config, painel da lista, seletor de unidade, adicionar/remover, Aprovar/Cancelar/Restaurar |
| `MedidasOverlay` | mesmo arquivo | SVG 1000×1000 com foto, linhas, textos e alças. Recebe `miniatura` para o card |
| `medidasPadrao(t, idioma)` | mesmo arquivo | Config inicial (3.1) |
| `ImagensStep` | `src/components/gerador/ImagensStep.tsx` | Guarda a config aprovada, abre o modal e renderiza a miniatura no card |

**Estado:** a config aprovada fica em `ImagensStep` (`useState<MedidasConfig>`). O modal recebe essa config como `inicial` e trabalha numa cópia; só chama `onAprovar(cfg)` no botão "Aprovar".

**Estilos:** classes `ger-med-*` em `src/index.css` (canvas, lista, card de medida, nome com lápis, seletor de unidade, botões de adicionar, rodapé).

---

## 5. Textos (i18n)

Chaves novas em `src/lib/i18n.ts`, nos 3 idiomas:

| Chave | PT | ES | EN |
|---|---|---|---|
| `gerador.unidadeCm` | cm | cm | cm |
| `gerador.unidadeIn` | pol | pulg | in |
| `gerador.unidadeDeMedida` | Unidade de medida | Unidad de medida | Unit of measurement |
| `gerador.adicionarMedidaReta` | Medida reta | Medida recta | Straight |
| `gerador.adicionarDiametro` | Diâmetro | Diámetro | Diameter |
| `gerador.novaMedida` | Medida | Medida | Measurement |
| `gerador.medidaDiametro` | Diâmetro | Diámetro | Diameter |
| `gerador.medidaReta` | Medida reta | Medida recta | Straight measurement |
| `gerador.nomeDaMedida` | Nome da medida | Nombre de la medida | Measurement name |
| `gerador.editarNomeMedida` | Clique para renomear a medida | Hacé clic para renombrar la medida | Click to rename the measurement |
| `gerador.valorDaMedida` | Valor | Valor | Value |
| `gerador.textoDaMedida` | Texto na imagem | Texto en la imagen | Text on image |
| `gerador.removerMedida` | Remover medida | Quitar medida | Remove measurement |
| `gerador.mostrarMedida` | Mostrar na imagem | Mostrar en la imagen | Show on image |
| `gerador.semMedidas` | Nenhuma medida. Adicione uma medida reta ou um diâmetro. | Ninguna medida. Agregá una medida recta o un diámetro. | No measurements. Add a straight measurement or a diameter. |
| `gerador.arrasteAlcasHint` | Arraste as alças para ajustar cada medida e a linha para movê-la. | Arrastrá los controles para ajustar cada medida y la línea para moverla. | Drag the handles to adjust each measurement and the line to move it. |

Removidas da v1: `gerador.medidaLarguraX`, `gerador.medidaProfundY`, `gerador.medidaAlturaZ`.

---

## 6. Integração com a geração real da imagem

No protótipo a foto é um mock (`src/assets/gerador-produto-mock.jpg`) e as medidas existem só no front. Para produção:

- **Persistir** a `MedidasConfig` aprovada junto com o rascunho do anúncio, para que ela sobreviva a sair e voltar do passo "Imagens".
- **Renderizar** a imagem final a partir da foto gerada + `MedidasConfig`, usando as mesmas regras de 3.7 (sem alças, sem etiquetas da miniatura, com contorno branco nos textos sobre a foto). Como as coordenadas estão num canvas 1000×1000, basta escalar para a resolução final da imagem.
- **Posições iniciais:** hoje são fixas (3.1). Com a foto real, o ideal é que a IA sugira as pontas de cada medida a partir do contorno da peça; enquanto isso, as posições fixas servem de ponto de partida editável.
- **Valores iniciais:** hoje são fixos (6 × 6 × 11 cm). Devem vir das medidas preenchidas no passo "Informações" (ver seção 8).

---

## 7. Critérios de Aceite

### CA-01 — Unidade padrão por idioma
Abrir o editor em PT ou ES mostra "cm" ativo; em EN mostra "in" ativo, com os valores padrão já convertidos (2.36 / 2.36 / 4.33).

### CA-02 — Conversão ao trocar a unidade
Em PT, com as medidas padrão, clicar em "pol" muda os valores para 2,36 / 2,36 / 4,33 e os textos para "Largura 2,36 pol", "Altura 2,36 pol" e "Comp. 4,33 pol". Clicar em "cm" volta para 6 / 6 / 11 e "Largura 6 cm" etc.

### CA-03 — Texto manual preservado na troca de unidade
Uma medida com texto editado à mão mantém exatamente o texto digitado depois de trocar a unidade, embora o valor seja convertido.

### CA-04 — Adicionar medida reta
"+ Medida reta" adiciona "Medida 10 cm" (ou "Medida 4 pol") no fim da lista, selecionada, com a lista rolada até ela. Várias adições seguidas não caem exatamente no mesmo lugar.

### CA-05 — Duas alturas no mesmo produto
Adicionar uma medida reta, renomear para "Altura com controle", digitar 14 e arrastar para a vertical resulta na imagem com "Altura 6 cm" e "Altura com controle 14 cm" ao mesmo tempo, e as duas continuam editáveis de forma independente.

### CA-06 — Renomear atualiza o texto automático
Renomear uma medida reta cujo texto nunca foi editado muda o texto para "[novo nome] [valor] [unidade]". Renomear um diâmetro não muda o texto (continua "Ø …").

### CA-07 — Remover e lista vazia
A lixeira remove a medida da lista e da imagem. Removendo todas, aparece a mensagem de lista vazia e a imagem mostra só a foto.

### CA-08 — Diâmetro
"+ Diâmetro" adiciona uma linha sem elipse nem tracejado, com "Ø 10 cm" centralizado sobre ela. As alças e o arraste funcionam, e a linha pode ser inclinada.

### CA-09 — Restaurar padrão
Depois de adicionar medidas e trocar a unidade, "Restaurar padrão" volta às 3 medidas iniciais, na unidade padrão do idioma.

### CA-10 — Aprovar e cancelar
"Aprovar" leva todas as medidas visíveis (retas e diâmetros) para a miniatura do card, com os textos em etiquetas brancas. "Cancelar" descarta tudo o que foi feito desde a abertura do modal.

---

## 8. Fora de escopo / dependências

- **Milímetros:** o seletor tem só cm e polegadas.
- **Integração com o passo Informações:** os valores iniciais ainda não vêm das medidas preenchidas lá. Depende de subir o estado de `InformacoesStep` para `CriarAnuncioView`.
- **Persistência e renderização da imagem final:** dependem do backend de geração de imagens (ver seção 6).
- **Desfazer (undo):** remover uma medida não tem confirmação nem desfazer; "Cancelar" é o caminho para descartar mudanças.
