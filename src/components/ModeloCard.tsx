import { useState, type ChangeEvent } from 'react';
import { useCalculadora, novoFilamentoItem } from '../context/CalculadoraContext';
import Card from './Card';

export default function ModeloCard() {
  const { state, set, errorIds } = useCalculadora();
  const [status, setStatus] = useState('Carregue o G-code para preencher tempo e peso');

  function handleGcode(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('Lendo arquivo…');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || '');
      const timeMatch = text.match(/;\s*estimated printing time.*?(\d+)h\s*(\d+)m/i) || text.match(/;\s*estimated printing time.*?(\d+)m/i);
      const filMatch = text.match(/;\s*filament used\s*\[g\]\s*=\s*([\d.]+)/i) || text.match(/;\s*filament used.*?=\s*([\d.]+)\s*g/i);
      let found = false;
      if (timeMatch) {
        if (timeMatch.length === 3) {
          set('horasImpressao', parseInt(timeMatch[1], 10));
          set('minutosImpressao', parseInt(timeMatch[2], 10));
        } else {
          set('horasImpressao', 0);
          set('minutosImpressao', parseInt(timeMatch[1], 10));
        }
        found = true;
      }
      if (filMatch) {
        const pesoExtraido = parseFloat(filMatch[1]);
        if (state.filamentoItems.length) {
          const copia = [...state.filamentoItems];
          copia[0] = { ...copia[0], pesoG: pesoExtraido };
          set('filamentoItems', copia);
        } else {
          set('filamentoItems', [novoFilamentoItem('', '', 0, pesoExtraido)]);
        }
        found = true;
      }
      setStatus(found ? '✓ Tempo e peso extraídos do G-code' : 'Não encontramos os dados, preencha manualmente');
    };
    reader.onerror = () => setStatus('Erro ao ler o arquivo, tente novamente');
    reader.readAsText(file);
  }

  return (
    <Card icon="◆" title="Modelo">
      <div className="field">
        <label>Nome do STL</label>
        <input
          type="text"
          placeholder="Ex: dragao_miniatura.stl"
          value={state.nomePeca}
          onChange={(e) => set('nomePeca', e.target.value)}
          className={errorIds.has('nomePeca') ? 'input-error' : ''}
        />
      </div>

      <div className="divider-label">Adicione uma fonte para o modelo</div>

      <div className="field">
        <label>Link da biblioteca</label>
        <input type="url" placeholder="stlflix.com, makerworld.com, printables.com..." value={state.stlLink} onChange={(e) => set('stlLink', e.target.value)} />
      </div>
      <div className="field">
        <label>Referência concorrente</label>
        <input type="url" placeholder="Mercado Livre, Shopee, Amazon... cole o link do concorrente" value={state.concorrenteLink} onChange={(e) => set('concorrenteLink', e.target.value)} />
      </div>

      <div className="divider-label">Ou carregue o G-code</div>

      <div className="dropzone">
        <div className="dz-ic">⇪</div>
        <div className="dz-text">
          <b>{status}</b>
          <span>Arraste aqui ou clique para escolher · .gcode, .bgcode</span>
        </div>
        <button type="button" onClick={() => document.getElementById('gcodeInput')?.click()}>Escolher arquivo</button>
        <input type="file" id="gcodeInput" accept=".gcode,.bgcode,.gco,.nc" className="hidden" onChange={handleGcode} />
      </div>
    </Card>
  );
}
