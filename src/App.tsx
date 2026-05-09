import { useProjectStore } from './store/projectStore';
import { useExportActions } from './hooks/useExportActions';
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

  const ActivePanel = PANELS[activePanel] ?? UploadPanel;

  return (
    <div className="app-layout">
      {/* Header */}
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon">🎬</div>
          <span>VideoRender</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400, fontFamily: 'Inter' }}>
            Editor de Configurações
          </span>
        </div>

        <div className="header-actions">
          <button className="btn btn-ghost btn-sm" onClick={exportJSON} title="Salvar projeto como JSON">
            💾 Salvar JSON
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => useProjectStore.getState().setActivePanel('export')}
          >
            📦 Exportar
          </button>
        </div>
      </header>

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
