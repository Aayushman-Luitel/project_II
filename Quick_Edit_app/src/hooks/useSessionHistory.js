import { useCallback } from 'react';
import { sessionApi } from '../utils/api';

export function useSessionHistory() {
  const recordTool = useCallback(async (toolName) => {
    try {
      
      let session;
      try {
        session = await sessionApi.get();
      } catch {
        session = await sessionApi.create('editor');
      }
      const history = session.history || [];
      if (history[history.length - 1] !== toolName) {
        history.push(toolName);
        await sessionApi.update({ history });
      }
    } catch (err) {
      console.error('Failed to record tool usage:', err);
    }
  }, []);
  return { recordTool };
}