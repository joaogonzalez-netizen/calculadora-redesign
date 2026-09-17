# Spec Técnica — Canal Mercado Libre Argentina (Calculadora de Preços)

**Produto:** STLSeller — Calculadora de Preços
**Versão:** 2.0 — estado atual (simplificado, alinhado à estrutura do canal Brasil)
**Audiência:** Time de desenvolvimento
**Status dos dados:** tabela de frete capturada em 16/09/2026 de `mercadolibre.com.ar/knowledge-hub/42400` — Mercado Livre revisa esses valores periodicamente, tratar como config editável, nunca assumir como permanente.

---

## 1. Visão geral

O Mercado Libre Argentina é um canal de venda próprio na calculadora (não é um sub-modo do canal Mercado Livre Brasil — são duas opções distintas no seletor de canal). A estrutura segue exatamente o mesmo padrão do canal Brasil: **Tipo de anúncio → Categoria → Frete**, sem os campos de cuotas (parcelamento) ou regime tributário/IVA que uma versão anterior deste canal chegou a ter — removidos por decisão de produto, pra manter a experiência simples e consistente com o Brasil.

**É o canal padrão** ao abrir uma calculadora nova (`canalAtivo: 'Mercado Livre Argentina'` no estado inicial).

**Nome de exibição:** "Mercado Libre Argentina" (com B) — grafia correta da marca no país, mantida em qualquer idioma do app (inclusive em português), pelo mesmo motivo que "Mercado Livre" (com V) é mantido como está no texto em espanhol quando se refere ao Brasil: são nomes de marca por país, não palavras a traduzir.

---

## 2. Campos

| Campo | Estado | Tipo | Obrigatório | Default | Observação |
|---|---|---|---|---|---|
| Tipo de anúncio | `mlArTipo` | toggle | ✅ | `classico` | Clásica / Premium — mesmo tipo `MlTipo` compartilhado com o canal Brasil |
| Categoria | `mlArCategoria` | select | ✅ | `''` | 20 categorias pré-cadastradas + "Outra categoria" |
| Comissão (%) | `mlArComissao` | number | — | auto | Preenchida pela tabela de categoria; editável via "Editar" / "↩ Restaurar automático" |
| Comissão manual? | `mlArComissaoManual` | boolean | — | `false` | Controla se o campo de comissão está em modo edição |
| Peso da embalagem (kg) | `mlArPesoEmbalagem` | number | — | `0.3` | Define a faixa de peso da tabela de frete |

Removidos nesta versão (existiam numa iteração anterior, não fazem mais parte do canal): `mlArCuotas`, `mlArRegime`, `mlArCustoFrete` (campo manual de custo de envio adicional).

---

## 3. Regras de negócio

### 3.1 Categoria → comissão automática

Cada opção de categoria carrega o par `(comissaoClasica, comissaoPremium)`. Trocar `mlArTipo` recalcula `mlArComissao` a partir do par da categoria selecionada — **exceto** quando `mlArComissaoManual = true`.

**Tabela de comissão por categoria (%), fonte terceira (SpomBridge), sujeita a validação oficial:**

| Categoria | Clásica | Premium |
|---|---|---|
| Alimentos y Bebidas | 11,8 | 14,80 |
| Supermercado | 11,8 | 14,80 |
| Celulares y Telefonía | 13,0 | 16,50 |
| Electrodomésticos | 13,0 | 16,50 |
| Hogar, Muebles y Jardín | 13,0 | 16,50 |
| Bebés | 13,5 | 17,14 |
| Deportes y Fitness | 13,5 | 17,14 |
| Herramientas | 13,5 | 17,14 |
| Indumentaria y Accesorios | 13,5 | 17,14 |
| Juegos y Juguetes | 13,5 | 17,14 |
| Accesorios para Vehículos | 14,0 | 17,14 |
| Belleza y Cuidado Personal | 14,0 | 17,14 |
| Consolas y Videojuegos | 14,0 | 17,14 |
| Industrias y Oficinas | 14,0 | 17,14 |
| Música, Películas y Series | 14,0 | 17,14 |
| Salud y Equipamiento Médico | 14,0 | 17,14 |
| Servicios | 14,0 | 17,14 |
| Libros, Revistas y Cómics | 14,5 | 17,14 |
| Computación | 15,0 | 17,14 |
| Electrónica, Audio y Video | 15,0 | 17,14 |
| **Outra categoria** | — (libera edição manual) | — |

### 3.2 Confirmar / editar comissão

Ao escolher uma categoria real (≠ "Outra"), a comissão aparece como uma linha de confirmação somente leitura — **"Comissão ML · X% · Editar"** — em vez de já abrir um campo editável. Clicar em "Editar" libera o input numérico com o valor atual pré-preenchido. Com o campo editável aberto, aparece "↩ Restaurar automático", que recalcula a comissão a partir da categoria/tipo atual e volta ao modo confirmação. Selecionar "Outra categoria" pula direto pro modo manual, sem valor pré-preenchido.

### 3.3 Frete por peso × preço

```js
getMlArFreteEstimado(pesoKg, preco):
  faixaPeso = primeira faixa da tabela onde pesoKg <= faixa.max
  se preco < $15.000:        custo = faixaPeso.ate15k
  senão se preco < $24.000:  custo = faixaPeso.de15ka24k
  senão:                     custo = faixaPeso.de24kAcima   // inclui $33.000+, sem tabela oficial pra essa faixa
  retorna { faixaPesoLabel, faixaPrecoLabel, custo }
```

**Tabela oficial de custo por unidade vendida** (Envíos Full/correio/coleta/pontos de despacho), fonte `mercadolibre.com.ar/knowledge-hub/42400`:

| Peso | Até $14.999 | $15.000 a $23.999 | $24.000 ou mais |
|---|---|---|---|
| Até 0,3 kg | $1.330 | $2.740 | $3.320 |
| 0,3–0,5 kg | $1.370 | $2.760 | $3.340 |
| 0,5–1 kg | $1.390 | $2.780 | $3.360 |
| 1–1,5 kg | $1.410 | $2.800 | $3.380 |
| 1,5–2 kg | $1.430 | $2.820 | $3.400 |
| 2–3 kg | $1.450 | $2.860 | $3.470 |
| 3–4 kg | $1.470 | $2.910 | $3.520 |
| 4–5 kg | $1.500 | $3.040 | $3.670 |
| 5–8 kg | $1.520 | $3.130 | $3.760 |
| 8–10 kg | $1.560 | $3.180 | $3.910 |
| 10–13 kg | $1.590 | $3.220 | $4.020 |
| 13–15 kg | $1.620 | $3.280 | $4.060 |
| 15–20 kg | $1.640 | $3.320 | $4.100 |
| 20–25 kg | $1.660 | $3.380 | $4.170 |
| 25–30 kg | $1.680 | $3.410 | $4.210 |
| 30–40 kg | $1.700 | $3.440 | $4.250 |
| 40–50 kg | $1.720 | $3.460 | $4.300 |
| 50–60 kg | $1.740 | $3.480 | $4.320 |
| 60–70 kg | $1.760 | $3.510 | $4.350 |
| 70–80 kg | $1.780 | $3.530 | $4.370 |
| 80–90 kg | $1.800 | $3.560 | $4.400 |
| 90–100 kg | $1.820 | $3.580 | $4.420 |
| 100–120 kg | $1.840 | $3.600 | $4.450 |
| 120–140 kg | $1.860 | $3.620 | $4.470 |
| 140–160 kg | $1.880 | $3.650 | $4.500 |
| 160–180 kg | $1.900 | $3.680 | $4.520 |
| Acima de 180 kg | $1.920 | $3.700 | $4.550 |

> ⚠️ A coluna "$24.000 ou mais" na tabela oficial só cobre até $32.999. Pra qualquer preço ≥ $33.000, a calculadora reaplica esses mesmos valores por decisão de produto — não existe tabela oficial confirmada pra essa faixa ainda.

### 3.4 Fórmula de taxas do canal

```js
taxasDoCanal (Mercado Libre Argentina):
  comissaoPct = mlArComissao / 100
  frete       = getMlArFreteEstimado(mlArPesoEmbalagem, precoConsumidor)
  pct = comissaoPct
  fixo = frete.custo
```

Sem IVA, sem cargo de cuotas — removidos nesta versão (ver Seção 5).

---

## 4. Persistência

Nenhum campo do Mercado Libre Argentina é salvo no histórico de cálculos hoje — segue o mesmo padrão do canal Brasil (categoria/comissão do ML Brasil também não são persistidas). Preferências não têm mais uma aba própria pra este canal (removida junto com cuotas/regime — não havia mais nada específico pra salvar como padrão).

---

## 5. Histórico de versões

- **V1 (removida):** tinha campos de Modalidade de cuotas, Regime tributário e IVA (21% condicional ao regime), custo de envio adicional manual, e um custo fixo de envio por faixa de preço (não por peso). Complexidade alta, sem paridade visual com o canal Brasil.
- **V2 (atual, esta spec):** simplificada pra Tipo de anúncio → Categoria → Frete, espelhando exatamente a estrutura do Brasil. Frete passou a usar tabela oficial por peso × preço (antes era uma tabela de "custo de oferecer frete grátis" errada, usada por engano numa iteração intermediária). Canal renomeado pra grafia correta ("Libre") e definido como default.

---

## 6. Perguntas em aberto

- Validar a tabela de comissão por categoria (fonte terceira, SpomBridge) no simulador oficial do Mercado Libre Argentina.
- Conseguir a tabela oficial de custo de envio pra preços ≥ $33.000, hoje aproximada pela faixa "$24.000 a $32.999".
- Decidir se a lógica de IVA/regime tributário volta em alguma versão futura (v3), ou se fica definitivamente fora de escopo.
