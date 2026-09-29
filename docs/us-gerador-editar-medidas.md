# User Story — Mais medidas, diâmetro e cm/pol na imagem de medidas

**US-01
Adicionar medidas, diâmetros e escolher a unidade na imagem de medidas do Gerador de Anúncios**

## Contexto

No passo "Imagens" do Gerador de Anúncios, o modal "Editar imagem de medidas" permite ajustar as setas da imagem fixa "Medidas". Mas ele vinha sempre com exatamente 3 medidas (largura, altura e comprimento), só em centímetros e sem medida de diâmetro. Isso não atende kits com mais de uma peça, peças que pedem duas alturas (como um porta-controle sozinho e com o controle encaixado), peças redondas, em que a medida que importa é o diâmetro, nem o maker que vende para quem pensa em polegadas.

## Objetivo

Mostrar na imagem de medidas todas as medidas que ajudam o comprador a entender o tamanho do produto, na unidade que ele usa.

## User Story

Como maker gerando um anúncio no STLSeller, quero adicionar medidas e diâmetros, editar os nomes e textos delas e escolher entre centímetros e polegadas, para que o comprador veja exatamente as dimensões que importam no meu produto.

## Critérios de Aceite

### Seleção de unidade (cm / pol)

- Ao lado do título "Textos das medidas" há um seletor com duas opções: "cm" e "pol" ("pulg" em espanhol, "in" em inglês).
- A unidade vale para todas as medidas da imagem.
- Nas versões PT e ES o modal abre em cm. Na versão EN abre em polegadas.
- Trocar a unidade converte o valor de todas as medidas (1 pol = 2,54 cm), com 1 casa decimal em cm e 2 em polegadas, sem zeros sobrando (ex.: 6 cm vira 2,36 pol; 11 cm vira 4,33 pol).
- Os textos automáticos passam a usar a nova unidade (ex.: "Largura 6 cm" vira "Largura 2,36 pol").
- Textos editados à mão não mudam na troca de unidade.
- Voltar para a unidade anterior volta aos valores originais (ex.: 2,36 pol volta a 6 cm).
- O campo de valor de cada medida mostra a unidade escolhida como sufixo.
- O valor aceita vírgula ou ponto. Nas versões PT e ES a conversão exibe vírgula; na versão EN, ponto.

### Adicionar medidas e editar textos

- Abaixo da lista de medidas há os botões "+ Medida reta" e "+ Diâmetro".
- "+ Medida reta" adiciona uma seta no meio da foto, com o nome "Medida" e valor 10 cm (ou 4 pol). Ela entra no fim da lista, já selecionada, e a lista rola até ela.
- Não há limite de medidas. Cada nova medida aparece um pouco deslocada da anterior, para não ficar em cima de outra.
- Com isso, o maker consegue, por exemplo, mostrar "Altura 6 cm" e "Altura com controle 14 cm" na mesma imagem.
- Cada medida da lista tem: ícone do tipo (↔ para reta, Ø para diâmetro), nome, liga/desliga, lixeira, valor e texto que aparece na imagem.
- O nome é um campo com borda visível e ícone de lápis. Ao clicar, o maker pode digitar um novo nome (ex.: "Altura com controle").
- O texto na imagem é montado sozinho no formato "[nome] [valor] [unidade]" e se atualiza quando o nome, o valor ou a unidade mudam.
- O maker pode editar o texto à mão. Depois disso, mudar nome, valor ou unidade não altera mais o texto daquela medida.
- A lixeira remove a medida na hora, da lista e da imagem.
- Sem nenhuma medida, a lista mostra "Nenhuma medida. Adicione uma medida reta ou um diâmetro." e a imagem mostra só a foto.
- Cada medida é independente: editar uma nunca altera outra.
- "Restaurar padrão" volta às 3 medidas iniciais (Largura, Altura e Comprimento), na unidade padrão do idioma, e descarta as medidas adicionadas.

### Adicionar diâmetro

- "+ Diâmetro" adiciona uma medida chamada "Diâmetro", com valor 10 cm (ou 4 pol) e o texto "Ø 10 cm".
- O diâmetro é uma linha de ponta a ponta com o texto centralizado sobre ela, sem elipse nem contorno tracejado.
- As alças das pontas e o arraste da linha funcionam igual à medida reta, e a linha pode ficar inclinada para acompanhar a perspectiva da peça.
- O texto automático do diâmetro sempre começa com "Ø", mesmo que a medida seja renomeada (ex.: "Diâmetro da base" continua mostrando "Ø 10 cm"). O nome serve para o maker identificar a medida na lista.

## Fora de escopo

- **Milímetros:** o seletor tem só cm e polegadas.
- **Integração com o passo Informações:** o modal ainda não puxa as medidas preenchidas lá.
