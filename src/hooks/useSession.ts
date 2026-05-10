/**
 * Hook para gerenciar sessão do pipeline.
 * Valida o token da URL e permite salvar config no Drive.
 */
import { useState, useEffect } from 'react';

export interface SessionInfo {
  valid: boolean;
  project_id?: string;
  token?: string;
  apiUrl?: string;
}

export function useSession() {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('session');
    // Se o bot mandar um URL do ngrok no param 'api', usamos ele. Senão cai no .env ou localhost
    const apiUrlParam = params.get('api');
    const apiBase = apiUrlParam || import.meta.env.VITE_API_URL || 'http://localhost:8080';

    if (!token) {
      setSession(null);
      setLoading(false);
      return;
    }

    // Validar sessão
    fetch(`${apiBase}/api/session/validate?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setSession({ valid: true, project_id: data.project_id, token, apiUrl: apiBase });
        } else {
          setSession({ valid: false });
        }
      })
      .catch(() => setSession({ valid: false }))
      .finally(() => setLoading(false));
  }, []);

  const saveToePipeline = async (config: object, assContent?: string, maskDataUrl?: string) => {
    if (!session?.valid || !session.token || !session.apiUrl) return;

    setSaving(true);
    setSaveResult(null);

    try {
      const res = await fetch(`${session.apiUrl}/api/session/save-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: session.token,
          config,
          ass: assContent || null,
          mask: maskDataUrl || null,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setSaveResult('success');
      } else {
        setSaveResult(data.error || 'Erro ao salvar');
      }
    } catch (e) {
      setSaveResult('Erro de conexão');
    } finally {
      setSaving(false);
    }
  };

  return {
    session,
    loading,
    saving,
    saveResult,
    saveToePipeline,
    isSessionMode: !!session?.valid,
  };
}
