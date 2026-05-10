import { useProjectStore } from './store/projectStore';
import { useExportActions } from './hooks/useExportActions';
import { useSession } from './hooks/useSession';
import { Sidebar } from './components/Sidebar';
import { PreviewPanel } from './components/PreviewPanel';
import { UploadPanel } from './panels/UploadPanel';
import { FormatPanel } from './panels/FormatPanel';
import { CropZoomPanel } from './panels/CropZoomPanel';
import { BlurBandPanel } from './panels/BlurBandPanel';
import { ColorGradePanel } from './panels/ColorGradePanel';
import { SubtitleEditor } from './panels/SubtitleEditor';
import { OverlayPanel } from './panels/OverlayPanel';
import { WatermarkPanel } from './panels/WatermarkPanel';
import { ExportPanel } from './panels/ExportPanel';
import './index.css';

const PANELS: Record<string, React.FC> = {
  upload: UploadPanel,
  format: FormatPanel,
  cropzoom: CropZoomPanel,
  blurband: BlurBandPanel,
  colorgrade: ColorGradePanel,
  subtitles: SubtitleEditor,
  overlays: OverlayPanel,
  watermark: WatermarkPanel,
  export: ExportPanel,
};

function App() {
  const activePanel = useProjectStore((s) => s.activePanel);
  const { exportJSON } = useExportActions();
  const { session, loading, saving, saveResult, saveToePipeline, isSessionMode } = useSession();

  const ActivePanel = PANELS[activePanel] ?? UploadPanel;

  // Loading
  if (loading && new URLSearchParams(window.location.search).has('session')) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg-primary, #0a0a0a)',
        color: 'var(--text-primary, #fff)', fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
          <div style={{ fontSize: 18 }}>Validando sessão...</div>
        </div>
      </div>
    );
  }

  // Sessão inválida
  if (session && !session.valid) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg-primary, #0a0a0a)',
        color: 'var(--text-primary, #fff)', fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          textAlign: 'center', padding: 40,
          background: 'var(--bg-secondary, #1a1a2e)',
          borderRadius: 16, border: '1px solid var(--border, #333)',
          maxWidth: 400,
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🔒</div>
          <h2 style={{ margin: '0 0 8px' }}>Sessão Inválida</h2>
          <p style={{ color: 'var(--text-muted, #888)', margin: 0 }}>
            Esta sessão expirou ou é inválida.<br />
            Gere uma nova pelo Telegram com <code>/sessao</code>
          </p>
        </div>
      </div>
    );
  }

  const handleSavePipeline = async () => {
    const config = useProjectStore.getState().exportProject();
    // TODO: Se tiver ASS gerado, passar como segundo argumento
    await saveToePipeline(config);
  };

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon">🎬</div>
          <span>VideoRender</span>
          {isSessionMode && (
            <span style={{
              fontSize: 11, color: '#4ade80', fontWeight: 600,
              background: 'rgba(74,222,128,0.1)', padding: '2px 8px',
              borderRadius: 4, marginLeft: 8,
            }}>
              Pipeline Mode
            </span>
          )}
          {!isSessionMode && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400, fontFamily: 'Inter' }}>
              Editor de Configurações
            </span>
          )}
        </div>

        <div className="header-actions">
          <button className="btn btn-ghost btn-sm" onClick={exportJSON} title="Salvar projeto como JSON">
            💾 Salvar JSON
          </button>

          {isSessionMode && (
            <button
              className="btn btn-sm"
              onClick={handleSavePipeline}
              disabled={saving}
              style={{
                background: saving ? '#555' : 'linear-gradient(135deg, #4ade80, #22c55e)',
                color: '#000', fontWeight: 700, border: 'none',
                cursor: saving ? 'wait' : 'pointer',
              }}
            >
              {saving ? '⏳ Salvando...' : '🚀 Salvar no Pipeline'}
            </button>
          )}

          <button
            className="btn btn-primary btn-sm"
            onClick={() => useProjectStore.getState().setActivePanel('export')}
          >
            📦 Exportar
          </button>
        </div>
      </header>

      {/* Toast de resultado */}
      {saveResult && (
        <div style={{
          position: 'fixed', top: 16, right: 16, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10,
          background: saveResult === 'success' ? '#166534' : '#7f1d1d',
          color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 14,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.3s ease',
        }}>
          {saveResult === 'success'
            ? '✅ Config salva no Drive! Use /config no Telegram.'
            : `❌ ${saveResult}`}
        </div>
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="app-main">
        <ActivePanel />
      </main>

      {/* Right panel */}
      <PreviewPanel />
    </div>
  );
}

export default App;
