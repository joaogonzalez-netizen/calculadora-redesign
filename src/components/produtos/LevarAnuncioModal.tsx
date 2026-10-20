import { useState } from 'react';
import type { Produto } from '../../lib/produtosMock';
import { destinoDaCopia } from '../../lib/copiarAnuncio';
import { MARKETPLACES_CONECTADOS_KEY } from '../../lib/onboarding';
import { readJson } from '../../lib/storage';
import { useI18n } from '../../context/I18nContext';
import Icon from '../Icon';

type Modo = 'copia' | 'reescrever';

interface Props {
  produto: Produto;
  onClose: () => void;
  onIrParaConfiguracoes?: () => void;
}

// Leva um anúncio de um marketplace para o outro. Duas formas: copiar como está
// (só revisa e publica) ou reescrever com o Seller (consome créditos como um
// anúncio novo). Mockado: nada é publicado nem gravado, o modal só mostra o
// aviso certo pro destino e confirma a escolha.
export default function LevarAnuncioModal({ produto, onClose, onIrParaConfiguracoes }: Props) {
  const { t } = useI18n();
  const destino = destinoDaCopia(produto);
  const [escolha, setEscolha] = useState<Modo | null>(null);
  // Mesmo mapa que Configurações grava; Mercado Livre começa conectado e Shopee não.
  const conectados = readJson<Record<string, boolean>>(MARKETPLACES_CONECTADOS_KEY, {});
  const destinoConectado = conectados[destino.id] ?? destino.id === 'ml';
  const temVariacoes = produto.variacoes.length > 1;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="modal-center modal-levar" role="dialog" aria-modal="true">
        <button type="button" className="modal-levar-x" onClick={onClose} aria-label={t('produtos.levarFechar')}><Icon name="close" size={16} /></button>

        {escolha === null ? (
          <>
            <h4>{t('produtos.levarTitulo' + destino.sufixo)}</h4>
            <p>{t('produtos.levarIntro')}</p>

            <div className="levar-produto">
              <div className="levar-thumb"><Icon name="box" size={22} /></div>
              <div>
                <div className="levar-produto-nome">{produto.nome}</div>
                <div className="levar-produto-preco">{produto.preco}</div>
                <small>{produto.imagensQtd} {t('produtos.levarFotos')} · {produto.variacoes.length} {t('produtos.levarVariacoes')}</small>
              </div>
            </div>

            {!destinoConectado && (
              <div className="alert levar-aviso">
                <Icon name="alert" size={16} />
                <div>
                  {t('produtos.levarConectar' + destino.sufixo)}
                  {onIrParaConfiguracoes && (
                    <button type="button" className="levar-link" onClick={onIrParaConfiguracoes}>{t('produtos.levarConectarLink' + destino.sufixo)}</button>
                  )}
                </div>
              </div>
            )}
            {temVariacoes && (
              <div className="alert levar-aviso">
                <Icon name="alert" size={16} />
                <div>{t('produtos.levarAvisoVar1')} {produto.variacoes.length} {t('produtos.levarAvisoVar2')}</div>
              </div>
            )}
            <div className="alert levar-aviso">
              <Icon name="alert" size={16} />
              <div>{t('produtos.levarFotos' + destino.sufixo + 'Aviso')}</div>
            </div>

            <div className="levar-pergunta">{t('produtos.levarPergunta')}</div>
            <div className="levar-opcoes">
              <button type="button" className="levar-opcao" onClick={() => setEscolha('copia')}>
                <b><Icon name="copy" size={16} /> {t('produtos.levarCopiarTitulo')}</b>
                <span>{t('produtos.levarCopiarDesc')}</span>
              </button>
              <button type="button" className="levar-opcao" onClick={() => setEscolha('reescrever')}>
                <b><Icon name="pencil" size={16} /> {t('produtos.levarReescreverTitulo')}</b>
                <span>{t('produtos.levarReescreverDesc')}</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <h4>{t('produtos.levarConfirmaTitulo')}</h4>
            <p>{t(escolha === 'copia' ? 'produtos.levarConfirmaCopia' : 'produtos.levarConfirmaReescrever')}</p>
            <div className="cl-footer" style={{ marginTop: 22 }}>
              <button type="button" className="btn-outline" onClick={() => setEscolha(null)}>{t('produtos.levarVoltar')}</button>
              <button type="button" className="btn-dark cl-btn-sm" onClick={onClose}>{t('produtos.levarFechar')}</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
