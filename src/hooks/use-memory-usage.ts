
'use client';

import { useState, useEffect, useCallback } from 'react';

interface PerformanceWithMemory extends Performance {
  memory?: {
    jsHeapSizeLimit: number;
    totalJSHeapSize: number;
    usedJSHeapSize: number;
  };
}

const DEFAULT_THRESHOLD_MB = 1024; // 1 GB
const DEFAULT_MAX_THRESHOLD_MB = 4096; // 4 GB

const getInitialThreshold = () => {
    const envThreshold = process.env.NEXT_PUBLIC_MEMORY_THRESHOLD_MB;
    const thresholdNumber = envThreshold ? parseInt(envThreshold, 10) : NaN;
    if (!isNaN(thresholdNumber)) {
        return thresholdNumber * 1024 * 1024;
    }
    return DEFAULT_THRESHOLD_MB * 1024 * 1024;
};

const getMaxThreshold = () => {
    const envMaxThreshold = process.env.NEXT_PUBLIC_MAX_MEMORY_THRESHOLD_MB;
    const thresholdNumber = envMaxThreshold ? parseInt(envMaxThreshold, 10) : NaN;
    if (!isNaN(thresholdNumber)) {
        return thresholdNumber * 1024 * 1024;
    }
    return DEFAULT_MAX_THRESHOLD_MB * 1024 * 1024;
};


const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export function useMemoryUsage(workbook?: any) {
  const [memoryUsage, setMemoryUsage] = useState({ text: '0 Bytes', bytes: 0, tooltip: 'Initializing...' });
  const [memoryThresholdBytes, setMemoryThresholdBytes] = useState(getInitialThreshold);
  const [maxMemoryThresholdBytes, _] = useState(getMaxThreshold());
  const [isMemoryApiAvailable, setIsMemoryApiAvailable] = useState(false);

  const updateMemoryUsage = useCallback(() => {
    const perf = window.performance as PerformanceWithMemory;
    if (perf.memory) {
      const usedHeap = perf.memory.usedJSHeapSize;
      const totalHeap = perf.memory.totalJSHeapSize;
      setMemoryUsage({
        text: `${formatBytes(usedHeap)}`,
        bytes: usedHeap,
        tooltip: `Live JS Heap Usage: ${formatBytes(usedHeap)} of ${formatBytes(totalHeap)} allocated. (Browser-specific)`,
      });
      setIsMemoryApiAvailable(true);
    } else {
      // Fallback for non-Chromium browsers
      try {
        const sizeInBytes = workbook && workbook.sheets.length > 0 ? new TextEncoder().encode(JSON.stringify(workbook)).length : 0;
        setMemoryUsage({
          text: formatBytes(sizeInBytes),
          bytes: sizeInBytes,
          tooltip: 'Estimated size of the loaded workbook data. Live usage unavailable in this browser.',
        });
      } catch (e) {
        setMemoryUsage({
          text: 'N/A',
          bytes: 0,
          tooltip: 'Could not estimate data size.',
        });
      }
      setIsMemoryApiAvailable(false);
    }
  }, [workbook]);

  useEffect(() => {
    const perf = window.performance as PerformanceWithMemory;
    let intervalId: NodeJS.Timeout | undefined;

    updateMemoryUsage(); // Initial update

    if (perf.memory) {
      intervalId = setInterval(updateMemoryUsage, 2000); // Update every 2 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [updateMemoryUsage]);
  
  const isMemoryLimitExceeded = memoryUsage.bytes > memoryThresholdBytes;

  return {
    memoryUsage,
    memoryThresholdBytes,
    setMemoryThresholdBytes,
    maxMemoryThresholdBytes,
    isMemoryApiAvailable,
    isMemoryLimitExceeded,
    formatBytes
  };
}
