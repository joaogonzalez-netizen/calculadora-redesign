# 001 — Termo de responsabilidade na cópia de anúncios

- Status: aceita
- Data: 2026-11-16

## Contexto
A extensão do Finder copia anúncios inteiros (fotos, descrições, atributos). Isso pode banir contas de
mentorados na Shopee e no Mercado Livre (origem: weekly Seller de 12/11/2026).

## Decisão
- A extensão é só "copiar": um clique, importa e abre o Seller. Sem termo, sem escolha de modo.
- O Seller recebe o anúncio em "Revisar cópia" (`RevisarCopia.tsx`), um stepper no estilo da criação de
  anúncio: 1 Como seguir, 2 Imagens, 3 Informações, 4 Publicar.
- O passo 1 oferece duas saídas, em cartões selecionáveis: "Gerar com IA" (recomendado, conteúdo novo,
  caminho mais seguro) e "Copiar como está". Gerar com IA vai direto pro Gerador completo, sem termo.
  Copiar como está abre um modal com o termo; sem marcar o checkbox não há como confirmar, e só depois
  do aceite os passos 2 a 4 (Imagens, Informações, Publicar) liberam.
- O aceite vai pro log `stlseller_log_aceite_copia` (`src/lib/termoCopia.ts`) ao confirmar o modal:
  usuário, data/hora ISO, versão do termo, idioma, título e URL do anúncio. O rascunho guarda `aceiteId`
  e o aceite não é pedido de novo naquele rascunho.
- Texto do termo em PT/ES/EN em `copia.*` e `rv.*` (i18n.ts).

## Consequências
- O log é localStorage (protótipo). Com a extensão real vira POST pra API; `AceiteCopia` é o contrato.
- O texto do termo (`TERMO_COPIA_VERSAO = 2026-11-v1`) precisa de revisão jurídica; mudar o texto exige subir a versão.
- A Revisar cópia do protótipo cobre Imagens, Informações e Atributos; Vídeo e Variações da produção não estão no protótipo.
