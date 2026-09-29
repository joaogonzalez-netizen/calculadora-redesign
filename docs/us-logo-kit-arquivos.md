# User Story — Kit de arquivos da logo (Gerador de logo)

**US-01
Baixar o kit completo da logo, com cada arquivo pronto para o lugar onde vai ser usado**

## Contexto

No Gerador de logo (Marketing → Gerador de logo), depois de criar as opções e escolher uma, o maker só consegue baixar **um PNG** da logo. Esse arquivo não resolve os usos reais do dia a dia: foto de perfil da loja no marketplace e no Instagram (onde o texto fica ilegível e a transparência vira fundo preto), fundos escuros (onde a logo colorida ou preta some), etiquetas e cartões mandados para gráfica (que pedem arquivo vetorial) e peças impressas em 3D com a marca (chaveiro, plaquinha, carimbo). Hoje o maker precisa de um designer ou de outra ferramenta para montar essas versões.

## Objetivo

Sair do Gerador de logo com todos os arquivos da marca prontos, sabendo qual usar em cada lugar, sem precisar de designer nem de outra ferramenta.

## User Story

Como maker que acabou de criar a logo no STLSeller, quero baixar um kit com as versões e os formatos da minha logo organizados por uso, para aplicar a marca na loja, nas redes, nas embalagens e nas minhas peças impressas em 3D sem depender de ninguém.

## Critérios de Aceite

### 1. Botões de download

- Na seção de resultado do Gerador de logo, depois que o maker escolhe uma opção, aparecem 3 botões:
  - **"Baixar kit da marca (.zip)"**: botão principal, com o kit completo (seção 3);
  - **"PNG transparente"**: baixa só o arquivo `{slug}-horizontal-colorida.png`;
  - **"Foto de perfil"**: baixa só o arquivo `{slug}-perfil-fundo-branco.png`.
- Sem opção escolhida, os 3 botões ficam desabilitados, com o texto "Escolha uma opção para baixar".
- O botão "Baixar PNG" de hoje é substituído por esses 3.
- Enquanto o kit é montado, o botão principal mostra "Preparando kit…" e fica desabilitado. O download começa sozinho quando o arquivo fica pronto.
- Baixar o kit ou os arquivos avulsos **não consome créditos** e pode ser repetido quantas vezes o maker quiser.
- Os arquivos usam a opção escolhida: forma, cores, nome e slogan dela. Quando o maker não tinha nome, vale o nome que veio com a opção escolhida.
- Se a montagem do kit falhar, aparece "Não foi possível preparar o kit. Tente de novo." e o botão volta ao normal.

### 2. Nome dos arquivos (slug)

- Todos os arquivos usam o **slug** do nome da loja:
  - letras minúsculas, sem acento, espaços trocados por hífen;
  - só `a-z`, `0-9` e `-`, sem hífens repetidos nem hífen no começo ou no fim;
  - no máximo 40 caracteres;
  - se sobrar vazio, usa `minha-marca`.
- Exemplos: "Casa 3D" → `casa-3d`; "Lenda & Dado Prints!" → `lenda-dado-prints`; "Ação 3D" → `acao-3d`.

### 3. Output: estrutura do kit

O kit é um arquivo **`kit-logo-{slug}.zip`** com esta estrutura exata (exemplo para "Casa 3D"):

```text
kit-logo-casa-3d.zip
└── kit-logo-casa-3d/
    ├── LEIA-ME.txt
    ├── 01-colorida/
    │   ├── casa-3d-horizontal-colorida.svg
    │   ├── casa-3d-horizontal-colorida.png
    │   ├── casa-3d-vertical-colorida.svg
    │   ├── casa-3d-vertical-colorida.png
    │   ├── casa-3d-simbolo-colorida.svg
    │   └── casa-3d-simbolo-colorida.png
    ├── 02-preta/
    │   ├── casa-3d-horizontal-preta.svg
    │   ├── casa-3d-horizontal-preta.png
    │   ├── casa-3d-vertical-preta.svg
    │   ├── casa-3d-vertical-preta.png
    │   ├── casa-3d-simbolo-preta.svg
    │   └── casa-3d-simbolo-preta.png
    ├── 03-branca/
    │   ├── casa-3d-horizontal-branca.svg
    │   ├── casa-3d-horizontal-branca.png
    │   ├── casa-3d-vertical-branca.svg
    │   ├── casa-3d-vertical-branca.png
    │   ├── casa-3d-simbolo-branca.svg
    │   └── casa-3d-simbolo-branca.png
    ├── 04-fundo-branco/
    │   ├── casa-3d-horizontal-fundo-branco.png
    │   ├── casa-3d-horizontal-fundo-branco.jpg
    │   ├── casa-3d-vertical-fundo-branco.png
    │   └── casa-3d-vertical-fundo-branco.jpg
    ├── 05-redes-sociais/
    │   ├── casa-3d-perfil-fundo-branco.png
    │   └── casa-3d-perfil-fundo-cor.png
    ├── 06-impressao/
    │   ├── casa-3d-horizontal-colorida.pdf
    │   ├── casa-3d-vertical-colorida.pdf
    │   └── casa-3d-vertical-preta.pdf
    └── 07-impressao-3d/
        ├── casa-3d-simbolo-relevo.stl
        ├── casa-3d-simbolo-relevo.3mf
        └── casa-3d-horizontal-relevo.3mf
```

- São **31 arquivos** no total: 1 `LEIA-ME.txt` + 30 arquivos de logo.
- Nenhuma pasta pode estar vazia, e não pode haver arquivo fora dessa lista.
- O ZIP inteiro tem no máximo **15 MB**.

### 4. Output: as 3 versões de layout

| Versão | O que tem | Proporção |
|---|---|---|
| **horizontal** | Símbolo à esquerda + nome da loja à direita, centralizados na vertical. **Sem slogan.** | Livre (largura > altura) |
| **vertical** | Símbolo em cima, nome embaixo e, se existir, o slogan abaixo do nome, tudo centralizado. | Livre (altura ≥ largura) |
| **simbolo** | Só o símbolo (forma + iniciais), sem nome e sem slogan. | Quadrada, 1:1 |

- **Área de respiro:** margem livre de 8% do lado maior da arte em volta de todo o desenho, em todos os arquivos (exceto os de impressão 3D).
- O slogan só aparece na versão vertical. Sem slogan, a vertical tem só símbolo e nome.

### 5. Output: as variações de cor

| Pasta | Símbolo | Nome e slogan | Fundo |
|---|---|---|---|
| `01-colorida` | Cores da opção escolhida (forma na cor principal, iniciais em branco) | Nome na cor principal; slogan em `#5F6368` | Transparente |
| `02-preta` | Tudo em `#000000` (iniciais vazadas, transparentes) | `#000000` | Transparente |
| `03-branca` | Tudo em `#FFFFFF` (iniciais vazadas, transparentes) | `#FFFFFF` | Transparente |
| `04-fundo-branco` | Igual à colorida | Igual à colorida | `#FFFFFF` sólido |

- Nas versões preta e branca, as iniciais dentro do símbolo são **vazadas**: o fundo aparece através delas, em vez de ficarem desenhadas em outra cor.

### 6. Output: especificação por formato

| Formato | Especificação |
|---|---|
| **SVG** | Vetorial puro: sem imagem raster embutida. Textos **convertidos em contorno** (paths), para não depender da fonte instalada. Cores em hexadecimal. `viewBox` definido e sem `width`/`height` fixos. Até 200 KB por arquivo. |
| **PNG** (transparente, pastas 01 a 03) | Lado maior com **2000 px**. Fundo transparente (canal alfa). Perfil de cor sRGB. |
| **PNG / JPG** (fundo branco, pasta 04) | Lado maior com **2000 px**. Fundo `#FFFFFF`. JPG com qualidade 90. sRGB. |
| **PNG de perfil** (pasta 05) | **1000 × 1000 px**, quadrado, fundo sólido (sem transparência). Símbolo centralizado ocupando **60%** da largura. `perfil-fundo-branco`: símbolo colorido sobre `#FFFFFF`. `perfil-fundo-cor`: símbolo branco sobre a cor principal. |
| **PDF** (pasta 06) | Vetorial, 1 página, textos em contorno. Página do tamanho da arte + 5 mm de margem em cada lado. Arte com **100 mm** no lado maior. Cores em RGB. |
| **STL** (pasta 07) | Malha fechada (*watertight*), unidade **mm**, pronta para fatiar. Detalhes na seção 7. |
| **3MF** (pasta 07) | Mesma geometria do STL, unidade **mm**, com **um objeto por cor** (base e relevo separados) para impressão multicolor ou troca de filamento. |

### 7. Output: arquivos de impressão 3D

| Arquivo | Geometria |
|---|---|
| `{slug}-simbolo-relevo.stl` e `.3mf` | Base com o contorno do símbolo, **40 mm** no lado maior e **2,0 mm** de espessura. Iniciais em relevo de **1,0 mm** sobre a base. |
| `{slug}-horizontal-relevo.3mf` | Placa retangular de **80 mm** de largura, cantos arredondados de 3 mm e **2,0 mm** de espessura. Símbolo e nome em relevo de **1,0 mm**. |

- Os arquivos já vêm deitados na mesa: base na altura Z = 0, sem precisar girar no fatiador.
- Nenhum traço ou vão pode ter menos de **0,8 mm**, para imprimir com bico de 0,4 mm. Detalhes menores que isso são engrossados ou removidos na conversão.
- No 3MF, a base usa a cor principal e o relevo usa branco. Os nomes dos objetos são "Base" e "Relevo".

### 8. Output: LEIA-ME.txt

- Arquivo de texto UTF-8, no idioma atual do app, explicando em linguagem simples **qual arquivo usar em cada lugar**, com este conteúdo mínimo:

```text
KIT DA MARCA — Casa 3D
Criado no STLSeller em 29/09/2026

QUAL ARQUIVO USAR
- Foto de perfil (loja no marketplace, Instagram, WhatsApp): 05-redes-sociais/casa-3d-perfil-fundo-branco.png
- Banner, capa da loja, posts: 01-colorida/casa-3d-horizontal-colorida.png
- Sobre foto ou fundo escuro: 03-branca/
- Etiqueta, carimbo, impressão em uma cor: 02-preta/
- Cadastro que não aceita fundo transparente: 04-fundo-branco/
- Mandar para gráfica (etiqueta, adesivo, cartão): 06-impressao/
- Imprimir a logo em 3D (chaveiro, plaquinha): 07-impressao-3d/
- Editar ou aumentar sem perder qualidade: arquivos .svg

CORES DA MARCA
- Principal: #7A3BD4
- Apoio: #C58A00
```

- A seção "CORES DA MARCA" lista as cores da opção escolhida, em hexadecimal, na ordem principal → apoio.

### 9. Idiomas

- Botões, mensagens e o `LEIA-ME.txt` existem em português, espanhol e inglês.
- **Nomes de pastas e arquivos não são traduzidos**: são sempre os da seção 3, em qualquer idioma.

## Fora de escopo

- Conversão para CMYK e perfis de cor de gráfica: os PDFs saem em RGB.
- Favicon (`.ico`) e manual de marca completo (tipografia, usos proibidos).
- Mockups (logo aplicada em caneca, camiseta, caixa).
- Escolher quais arquivos entram no kit: o kit é sempre completo.
