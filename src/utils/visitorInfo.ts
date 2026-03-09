// hooks/useVisitorInfo.ts
import { useEffect, useState } from 'react';
import logger from './logger';

export const useVisitorInfo = () => {
  const [info, setInfo] = useState<null | {
    ip: string;
    userAgent: string;
  }>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();

        setInfo({
          ip: ipData.ip,
          userAgent: navigator.userAgent,
        });
      } catch (error) {
        logger.error('Error fetching visitor info:', error);
      }
    };

    fetchInfo();
  }, []);

  return info;
};
