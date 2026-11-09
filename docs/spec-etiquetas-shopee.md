# Spec de UX — Impressão e reimpressão de etiquetas Shopee

**Produto:** STLSeller — Pedidos
**Versão:** 0.1 (proposta, em discussão)
**Audiência:** Produto, design e desenvolvimento
**Protótipo atual:** `src/views/PedidosView.tsx` (tabela), `src/components/pedidos/PedidoDrawer.tsx` (detalhe), `src/lib/pedidosMock.ts` (dados)

---

## Escopo

O vendedor imprime, em lote ou uma a uma, a **etiqueta oficial da Shopee** dos pedidos da conta Shopee, sem sair do STLSeller. Reimprimir é o mesmo fluxo, aplicado a um pedido que já teve etiqueta.

Fora do escopo:

- Gerar etiqueta própria (layout, campos, logo). A Shopee pede que a etiqueta não seja alterada nem coberta.
- Mercado Livre, Etsy e TikTok Shop.
- Emitir a nota fiscal. A etiqueta real traz a DANFE simplificada impressa no rodapé (seção 1), mas a nota vem pronta de quem a emite; o STLSeller só mostra e imprime o arquivo.
- Organizar envio (agendar coleta ou postagem). Esta spec assume que o código de envio já existe.

Premissa do protótipo (PRODUCT.md): não há integração real. O PDF da etiqueta é simulado. A seção 7 lista o que o contrato real precisará entregar.

---

## 1. Como é a etiqueta padrão

Fonte: guias de terceiros (Bling, UpSeller, Ginee). **Não há especificação oficial da Shopee Brasil nesta pesquisa.** Validar com a Central do Vendedor antes de fechar o preview.

| Item | Padrão |
|---|---|
| Formato | A6 (cerca de 10×15 cm) em térmica, ou A4 |
| Papel | Adesivo resistente a água e borrão |
| Regra de integridade | Nenhuma área coberta, nenhum texto adicionado, formato não alterado |
| Elemento crítico | Código de barras legível |
| Conteúdo | Ver a anatomia abaixo, conferida em uma etiqueta térmica real de exemplo (03/11/2026) |
| Impressora térmica | Opção na Central do Vendedor que pode quebrar integradores sem ZPL |

**Anatomia da etiqueta térmica real (10×15 cm, de cima para baixo)**

1. **Destinatário:** tarja preta "DESTINATÁRIO", nome em negrito, endereço, bairro, CEP e número do pedido. À direita, a marca Shopee, um QR e uma caixa preta com "R".
2. **Rota de triagem:** QR com o nome da cidade de destino embaixo, e duas caixas pretas grandes com os códigos de rota (por exemplo "SP18 -2" e "LMS-03").
3. **Coleta:** código de barras com o código de rastreio embaixo e a palavra "COLETA" ao lado.
4. **Remetente:** tarja "REMETENTE", nome da loja, endereço, CEP e "Envio previsto". À direita, um QR e uma caixa com a sigla do hub (por exemplo "SOC PR1").
5. **DANFE simplificada:** título "DANFE SIMPLIFICADO - ETIQUETA", linha com saída, NF, série e emissão, chave de acesso de 44 dígitos, código de barras e a descrição do item com a quantidade.

O preview do protótipo segue essa ordem (`src/components/pedidos/EtiquetaShopee.tsx`). Nome, endereço, rota, NF e chave do preview são inventados e estáveis por pedido (`dadosDaEtiqueta`, em `src/lib/etiquetasShopee.ts`). O arquivo real vem pronto da Shopee.

Consequência de UX: o app **não desenha** a etiqueta. Mostra um preview do arquivo oficial, escolhe formato e ajuda a imprimir.

---

## 2. Estado atual de Pedidos

- A tabela não tem seleção de linhas. A coluna de ações tem só o ícone de olho (ver pedido).
- O drawer mostra a timeline com a etapa "Etiqueta gerada", mas sem ação.
- O mock traz `envioMetodo`, `envioCodigo`, `destinoCidade`, `destinoCep`, `rastreio` e `itens`.
- O filtro de conta já separa contas do mesmo marketplace.

---

## 3. Proposta de fluxo

### 3.1 Um pedido (reimpressão)

1. Na tabela, a coluna de ações ganha o ícone de etiqueta, só nas linhas Shopee. O ícone tem `title` e `aria-label` "Imprimir etiqueta".
2. No drawer, a etapa "Etiqueta gerada" da timeline ganha o botão "Imprimir etiqueta" (ou "Reimprimir" quando já foi impressa). O drawer também ganha um botão no rodapé, visível sem rolar.
3. Ambos abrem o **modal de impressão** (3.3) com um pedido.

### 3.2 Vários pedidos (lote)

1. A tabela ganha uma coluna de checkbox. O cabeçalho seleciona os pedidos elegíveis da página.
2. Com ao menos um selecionado, aparece uma **barra de ação** fixa no topo da tabela: "N selecionados · Imprimir etiquetas · Limpar".
3. Pedidos Shopee não elegíveis ficam com checkbox desabilitado e o motivo em texto visível, não só em tooltip. Pedidos de outro marketplace não mostram checkbox (célula vazia), para não repetir "Só etiquetas Shopee" em toda linha. A coluna só existe quando a página tem algum pedido Shopee.
4. O botão abre o mesmo modal de impressão, com N pedidos.

Quem pode ser selecionado:

| Condição | Elegível | Motivo mostrado se não |
|---|---|---|
| Marketplace Shopee | Sim | Sem checkbox (não mostra motivo) |
| Status Pago ou Enviado | Sim | Pendente: "Aguardando pagamento". Cancelado: "Pedido cancelado" |
| Código de envio existe | Sim | "Código de envio ainda não gerado" |
| Entregue | Não | "Pedido já entregue" |
| Nota fiscal enviada à Shopee | Sim | Status "Emitir nota fiscal": "Emita a nota fiscal na Shopee para liberar a etiqueta" |

### 3.3 Modal de impressão

Uma tela só, três blocos, de cima para baixo:

1. **Resumo.** "3 etiquetas · conta gonzalez.3d". Se algum pedido do lote tiver sido impresso antes, aviso discreto: "2 já foram impressas. Reimprimir não gera novo código."
2. **Formato.** Dois cartões selecionáveis: "Térmica A6 (10×15 cm)" e "A4". O padrão é o último usado, guardado por vendedor. Texto de apoio curto sob cada um: térmica para etiqueta adesiva, A4 para impressora comum. Se A4 for escolhido, o preview mostra a folha com 4 etiquetas A6 (2×2, 105×148 mm cada) e a navegação passa a ser por folha ("Folha 1 de 2"). Um lote de 7 etiquetas vira 2 folhas, a última com células vazias. O arranjo de 4 por folha é decisão do protótipo, a confirmar com a A4 que a Central da Shopee gera.
3. **Preview.** Primeira etiqueta do lote, com navegação "1 de 3". O preview é o arquivo oficial, sem edição.

Rodapé: "Cancelar" e o botão primário "Imprimir 3 etiquetas". Alternativa secundária: "Baixar PDF".

Depois de imprimir, o modal mostra confirmação com a lista e a ação "Marcar como impressas" já feita por padrão. Não há segundo passo obrigatório.

---

## 4. Estados

| Estado | Comportamento |
|---|---|
| Carregando preview | Esqueleto no tamanho da etiqueta. O botão de imprimir fica desabilitado |
| Lote parcial | Gera as válidas e lista as que falharam, com motivo e botão "Tentar de novo" só nelas |
| Código ainda não gerado | Mensagem "A Shopee ainda está gerando o código deste pedido. Tente de novo em alguns minutos." Sem erro vermelho, é espera |
| Falha ao gerar | "Não foi possível gerar a etiqueta. Tente de novo." Não oferecer imprimir |
| Nenhum elegível no lote | Modal não abre. Aviso na barra de ação com o motivo |
| Já impressa | Selo "Impressa em dd/mm" na linha e no drawer. Reimprimir continua disponível |
| Sem conta Shopee conectada | Botão ausente. Nenhuma mensagem nova em Pedidos |

Limite do lote: definir após validar o contrato real. No protótipo, 50 por vez, com aviso claro ao passar.

---

## 5. Texto (PT)

Todo texto novo precisa de entrada PT/ES/EN em `src/lib/i18n.ts`. Na versão atual, Shopee só aparece na versão PT do mock. Confirmar se ES recebe o fluxo.

| Chave sugerida | PT |
|---|---|
| `pedidos.etiqueta.imprimir` | Imprimir etiqueta |
| `pedidos.etiqueta.reimprimir` | Reimprimir etiqueta |
| `pedidos.etiqueta.imprimirLote` | Imprimir {n} etiquetas |
| `pedidos.etiqueta.selecionados` | {n} selecionados |
| `pedidos.etiqueta.formatoTermica` | Térmica A6 (10×15 cm) |
| `pedidos.etiqueta.formatoA4` | A4 |
| `pedidos.etiqueta.jaImpressas` | {n} já foram impressas. Reimprimir não gera novo código. |
| `pedidos.etiqueta.aguardandoCodigo` | A Shopee ainda está gerando o código deste pedido. Tente de novo em alguns minutos. |

---

## 6. Acessibilidade (WCAG 2.1 AA)

- Checkbox da linha com nome acessível "Selecionar pedido {número}". O do cabeçalho com "Selecionar todos desta página".
- A barra de ação anuncia a contagem com `aria-live="polite"`.
- O motivo de não elegível é texto visível, não só tooltip.
- Cartões de formato são `radio` reais, com foco visível.
- O modal prende o foco, fecha com Esc e devolve o foco ao botão de origem.
- Operável a uma mão no balcão de embalagem: alvos de ao menos 44 px e o botão primário sempre no mesmo lugar.

---

## 7. Onde o mock vira contrato real

| Ponto | O que o backend precisa entregar |
|---|---|
| Arquivo da etiqueta | PDF (ou ZPL) por pedido e em lote, no formato escolhido |
| Elegibilidade | Status do envio, se o código já foi gerado e **se a nota fiscal já foi enviada à Shopee**, por pedido |
| Marcar impressa | Registro de data e usuário, para o selo e o aviso de reimpressão |
| Limite do lote | Limite da API da Shopee, para trocar o 50 do protótipo |
| Impressora térmica | Se o formato é ZPL, e como lidar com a opção da Central |

### Referência de integração (relato de Leonardo Donadel, 03/11/2026)

Relato de quem já emite etiquetas pela Open Platform v2 da Shopee (stack Node/Express, React e Postgres com Prisma). Não foi verificado por nós: conferir na documentação oficial antes de implementar.

**Assinatura:** HMAC-SHA256 com o `crypto` nativo do Node, sem SDK.

**Sequência para gerar a etiqueta**

1. `/api/v2/order/get_order_detail`: devolve o `package_number`.
2. `/api/v2/logistics/get_tracking_number`: rastreio, só para quem ainda não tem.
3. `/api/v2/logistics/create_shipping_document`: pede a etiqueta, tipo `THERMAL_AIR_WAYBILL`.
4. `/api/v2/logistics/get_shipping_document_result`: consulta repetida até o status ficar `READY`.
5. `/api/v2/logistics/download_shipping_document`: baixa o arquivo.

Cuidado: às vezes o resultado vem `READY` e o download ainda falha, então o passo 5 precisa de nova tentativa com espera. Isso casa com o estado "código ainda não gerado" do protótipo.

**Formato:** a térmica vem em ZPL, mas na prática é uma imagem só (bitmap de 816×1218 pixels, 10×15 cm a 203 dpi) comprimida em Z64.

**Conversão de ZPL para PDF, dois caminhos**

- Labelary (`api.labelary.com`): API gratuita com limite de cerca de 3 requisições por segundo. Em lote, com nova tentativa no erro 429.
- Local: extrai o bitmap do ZPL e coloca direto numa página de PDF com `pdf-lib`. Sem rede e sem limite, e é o caminho mais usado por eles. Se o ZPL vier num formato diferente, volta para o Labelary.

**Bibliotecas citadas:** `pdf-lib` (monta e junta PDFs, várias lojas viram um PDF só), `node-fetch`, e no front `html5-qrcode` ou `qr-scanner` para bipar com a câmera na conferência.

**Impressão**

- Local: PDF em escala 100% pelo CUPS até a térmica USB.
- Remota (sistema na nuvem): uma "ponte" no computador da empresa consulta uma fila a cada 2 segundos e envia o ZPL cru para a impressora na porta 9100 (TCP).

Implicações para esta spec: o PDF de lote (A4 com 4 por folha) é montado por nós a partir dos bitmaps; "Baixar PDF" e "Imprimir" são caminhos diferentes (PDF em escala 100% contra ZPL cru); e a impressão direta na térmica exige a ponte, o que reforça a pergunta em aberto sobre abrir o PDF ou imprimir direto.

---

## 8. Protótipo implementado (desvios desta spec)

Código: `src/views/PedidosView.tsx`, `src/components/pedidos/EtiquetaModal.tsx`, `src/components/pedidos/PedidoDrawer.tsx`, `src/lib/etiquetasShopee.ts`, textos `pedidos.etiqueta.*` em `src/lib/i18n.ts`.

- **Coluna fixa "Etiquetas" (revisão):** primeira coluna da tabela, presa à esquerda, com o checkbox e o status da etiqueta. Fica visível mesmo com filtro em outro canal (pedidos fora da Shopee mostram "—"). Só nos mercados PT/ES. Status:
  - **A emitir:** Shopee elegível, ainda sem emissão.
  - **Emitir nota fiscal:** pedido Shopee pago ou enviado cuja nota fiscal ainda não foi enviada. A Shopee só libera a etiqueta depois da nota, e a nota é emitida **apenas na loja do vendedor na Shopee**: o STLSeller não emite nota fiscal. Checkbox desabilitado, e a tag mostra o tooltip "A nota fiscal é emitida na sua loja da Shopee. A etiqueta libera depois que ela for enviada." No drawer o botão de imprimir fica desabilitado com o mesmo motivo. Quando a nota é enviada na Shopee e o pedido sincroniza, o status passa a A emitir.
  - **Emitida:** tag com a data. O checkbox e o ícone de impressora continuam ativos, então dá para emitir de novo.
  - **Indisponível:** Shopee não elegível, com o motivo em texto abaixo.
- **Filtro "Etiqueta":** Todas, A emitir, Emitida, Indisponível. Combina com os outros filtros e limpa a seleção ao mudar. Os motivos que antes ficavam sob o nome do pedido e o selo sob o status foram para essa coluna.
- **Limite do lote:** a tabela mostra 10 pedidos por página, então o limite de 50 não é atingível e não foi implementado. Entra quando houver seleção entre páginas.
- **Falha simulada:** o pedido com id terminando em 2 devolve "código ainda não gerado" na primeira tentativa. Na nova tentativa passa. É regra de mock.
- **Baixar PDF:** mostra aviso "Em breve".
- **Preview:** a etiqueta simulada fica sempre em português, como a oficial.
- **Persistência:** formato e impressas ficam em `localStorage` (`stlseller_etiqueta_formato`, `stlseller_etiquetas_impressas`). No real, a data de impressão vai para o backend (seção 7).
- **Nota fiscal (mock):** o campo `nfEnviada` do pedido Shopee simula se a nota já foi enviada. Um dos pedidos pagos do mock nasce com a nota pendente. No contrato real, esse dado vem da Shopee (seção 7); a ação de emitir nota nunca fica no STLSeller.
- **Preview da etiqueta:** segue a anatomia da etiqueta real (seção 1), com dados fictícios. QR e códigos de barras são desenhos sem leitura. O preview não traz o PDF de verdade.
- **Fila de produção:** reusa o `PedidoDrawer`, que só mostra a impressão quando recebe o callback.
- **Foco:** ao concluir um lote, o foco cai no `body`, porque o botão de origem some com a barra de ação. A corrigir.

---

## 9. Perguntas em aberto

1. A etiqueta da Shopee Brasil tem A6 e A4 como únicos formatos? Confirmar na Central do Vendedor.
2. O app imprime direto na impressora, ou só abre o PDF para o navegador imprimir? Direto exige ZPL e driver. A proposta acima assume PDF.
3. "Impressa" é só informativo ou bloqueia algo, como o status "Enviado"?
4. O fluxo existe na versão ES?
