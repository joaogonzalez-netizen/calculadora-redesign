# Spec Técnica — Primeiros Passos (Onboarding STLSeller)

**Produto:** STLSeller
**Versão:** 1.1 — fecha os gaps de P1 do PRD "Primeiros Passos"
**Audiência:** Time de desenvolvimento
**Complementa:** PRD — Primeiros Passos (Onboarding STLSeller)

---

## Escopo desta spec

Cobre o estado atual (v1, já shipado) e as mudanças de P1: navegação e conclusão real do passo "Gerador de anúncios", player de vídeo embutido, e correção do bug de texto duplicado no hero.

**Fora do escopo:** construir a tela de Buscador de produtos (não existe hoje — pré-requisito de outro PRD).

---

## 1. Estado atual (v1) — referência

**Arquivo principal:** `src/views/PrimeirosPassosView.tsx`
**Persistência:** `src/lib/onboarding.ts` — chave localStorage `stlseller_onboarding_manual`

### 1.1 Modelo de dados

```ts
interface OnboardingManual {
  buscador: boolean;
  gerador: boolean;
  calculadora: boolean;
  marketplace: boolean;
  video: boolean;
}
```

Todos os 5 campos começam `false`. Cada um só vira `true` por uma ação deliberada do usuário — nunca por dado de mock/seed pré-carregado (os 10 cálculos de exemplo do histórico não contam, os marketplaces já "conectados" por padrão em Configurações não contam).

### 1.2 Gatilhos de conclusão hoje

| Passo | Gatilho atual | Real ou placeholder? |
|---|---|---|
| Vídeo | Checkbox manual "Marcar como assistido" | Manual, sem player de verdade |
| Calculadora | `marcarOnboardingManual('calculadora')` disparado em `App.tsx` no callback `aoSalvarCalculo`, chamado só quando um cálculo é salvo de verdade (não conta o seed) | Real |
| Marketplace | `marcarOnboardingManual('marketplace')` disparado em `ConfiguracoesView.tsx` ao conectar um marketplace de verdade | Real |
| Gerador | `alert('Em breve: o gerador de anúncios com IA.')` + marca como concluído no clique | **Placeholder** |
| Buscador | `alert('Em breve: buscador de produtos.')` + marca como concluído no clique | **Placeholder** (tela nem existe) |

### 1.3 Regra de exibição no menu

O item "Primeiros passos" (seção "Comece por aqui" na Sidebar) só aparece enquanto `Object.values(passosCompletos).every(Boolean)` for `false` — ver `App.tsx`, variável `todosPassosCompletos`.

---

## 2. Mudanças desta versão (P1)

### 2.1 Passo "Gerador de anúncios" — conclusão real

**Problema:** hoje o clique no CTA já marca como concluído via `alert()`, sem o usuário ter gerado nada.

**Mudança:**
- O CTA do card passa a navegar de verdade para a tela do Gerador (`CriarAnuncioView`), no mesmo padrão que o passo "Calculadora" já usa para `CalculadoraView`.
- A conclusão do passo deixa de acontecer no clique do CTA e passa a acontecer quando o usuário efetivamente chega ao resultado do wizard (`ResultadoStep`, última etapa do fluxo Upload → Marketplace → Informações → Textos → Imagens → Vídeo → Resultado).
- Implementação: `CriarAnuncioView` recebe um novo callback (ex.: `onGerado`), disparado quando `ResultadoStep` é renderizado/alcançado — mesmo padrão de `onSaved` já usado em `CalculadoraView`. Em `App.tsx`, esse callback chama `marcarOnboardingManual('gerador')` e `refreshOnboarding()`.

### 2.2 Vídeo de boas-vindas — player embutido

**Problema:** hoje o botão "Assistir vídeo" e o próprio player (`passo-video-player`) só disparam `alert('Em breve: player de vídeo embutido...')`.

**Mudança:**
- Substituir o botão-placeholder por um elemento de vídeo real (`<video>` nativo com o asset final, ou embed), mantendo a duração exibida (2:47) e a checkbox "Marcar como assistido".
- Comportamento do "assistido" nesta versão: **continua manual** (checkbox), até decisão formal sobre automatizar por % assistido (ver Perguntas em Aberto do PRD). Não implementar auto-marcação nesta fase.

### 2.3 Correção do texto duplicado no hero

**Problema:** o hero mostra "Bem-vindo,, João" — vírgula duplicada.

**Causa raiz:** a chave de i18n `passos.boasVindas` já contém a vírgula (`'Bem-vindo,'`), e o componente adiciona outra vírgula literal no JSX (`{t('passos.boasVindas')}, <span>{nome}</span>`).

**Correção:** remover a vírgula da chave de i18n nos 3 idiomas, mantendo a vírgula só no JSX (fonte única de verdade pro separador).

| Idioma | Valor atual | Valor corrigido |
|---|---|---|
| PT | `Bem-vindo,` | `Bem-vindo` |
| EN | `Welcome,` | `Welcome` |
| ES | `Bienvenido,` | `Bienvenido` |

---

## 3. Critérios de Aceite

### CA-01 — Gerador: navegação real
- **Dado** que o usuário está em Primeiros Passos e o passo "Gerador de anúncios" não está completo
- **Quando** clica no CTA do card
- **Então** é levado para a tela do Gerador de anúncios (não aparece nenhum alerta)

### CA-02 — Gerador: conclusão só na ação real
- **Dado** que o usuário abriu o Gerador a partir do checklist mas ainda não concluiu o wizard
- **Então** o passo "Gerador de anúncios" continua aparecendo como pendente em Primeiros Passos
- **Quando** o usuário chega ao resultado final do wizard (`ResultadoStep`)
- **Então** o passo é marcado como concluído e a barra de progresso é atualizada

### CA-03 — Vídeo: player embutido
- **Dado** que o usuário está no card de vídeo
- **Quando** clica em "Assistir vídeo" ou no player
- **Então** o vídeo reproduz de verdade dentro da própria tela (sem alerta)

### CA-04 — Vídeo: marcação continua manual
- **Dado** que o usuário assistiu o vídeo até o final
- **Então** o passo "Vídeo" **não** é marcado automaticamente como concluído
- **E** só é marcado quando o usuário marca a checkbox "Marcar como assistido" manualmente

### CA-05 — Texto do hero sem vírgula duplicada
- **Dado** qualquer idioma (PT/EN/ES)
- **Então** o hero exibe "Bem-vindo, {nome}" (ou equivalente no idioma), com uma única vírgula

### CA-06 — Buscador permanece placeholder nesta versão
- **Dado** que a tela de Buscador de produtos ainda não existe
- **Quando** o usuário clica no CTA do passo "Buscador de produtos"
- **Então** o comportamento desta versão **não muda** (continua fora de escopo até a tela existir)

---

## 4. Fora de escopo / dependências

- Passo "Buscador de produtos": depende da tela de Buscador ser construída (PRD próprio). Nenhuma mudança de código aqui.
- Automação de "assistido" por % de reprodução do vídeo: decisão de produto em aberto, não implementar nesta versão.
- Notificação/toast ao completar um passo: fica para uma versão futura (P2 do PRD).
