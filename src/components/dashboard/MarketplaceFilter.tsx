import { useState } from 'react';
import { MARKETPLACES } from '../../lib/dashboardMock';
import { useI18n } from '../../context/I18nContext';

// Filtro visual: os dados do dashboard são mock, então trocar aqui ainda não
// refiltra nada. Fica pronto pra ligar quando existir API.
export default function MarketplaceFilter() {
  const { t } = useI18n();
  const [valor, setValor] = useState('todos');
  return (
    <div className="mp-filter">
      <label>{t('dashboard.filtrarMarketplace')}</label>
      <select value={valor} onChange={(e) => setValor(e.target.value)}>
        <option value="todos">{t('dashboard.todos')}</option>
        {MARKETPLACES.map((m) => (
          <option key={m.id} value={m.id}>{NOMES[m.id] ?? m.id}</option>
        ))}
      </select>
    </div>
  );
}

const NOMES: Record<string, string> = {
  ml: 'Mercado Livre',
  amazon: 'Amazon',
  shopee: 'Shopee',
  magalu: 'Magalu',
};
