import { useEffect, useRef, useCallback } from 'react';
import { useFraudStore } from '@/lib/store';
import { generateSingleTransaction } from '@/lib/liveFeedSimulator';

export function useLiveFeed(enabled: boolean, intervalMs: number = 5000) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { addTransactions, runFraudDetection } = useFraudStore();

  const processTransaction = useCallback(() => {
    const newTransaction = generateSingleTransaction();
    addTransactions([newTransaction]);
    runFraudDetection([newTransaction]);
  }, [addTransactions, runFraudDetection]);

  useEffect(() => {
    if (enabled) {
      // Start the interval
      intervalRef.current = setInterval(processTransaction, intervalMs);
      
      // Generate an initial transaction immediately
      processTransaction();
    } else {
      // Clear the interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, intervalMs, processTransaction]);

  return { isRunning: enabled };
}
