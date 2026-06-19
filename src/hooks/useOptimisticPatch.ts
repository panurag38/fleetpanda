import { useOptimistic } from 'react';

interface PatchAction<T extends { id: string }> {
  id: string;
  patch: Partial<T>;
}

export const useOptimisticPatch = <T extends { id: string }>(items: T[]) => {
  const [optimisticItems, applyPatch] = useOptimistic(items, (current: T[], action: PatchAction<T>) =>
    current.map((item) => (item.id === action.id ? { ...item, ...action.patch } : item))
  );

  return { optimisticItems, applyPatch };
};
