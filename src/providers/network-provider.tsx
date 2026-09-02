import NetInfo from '@react-native-community/netinfo';
import { type ReactNode, useCallback, useEffect, useState } from 'react';

import { NoInternetModal } from '@/components/error/no-internet-modal';
import { isNetworkOffline } from '@/utils/network';

type NetworkProviderProps = {
  children: ReactNode;
};

export function NetworkProvider({ children }: NetworkProviderProps) {
  const [isOffline, setIsOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = isNetworkOffline(state);
      setIsOffline(offline);
      if (offline) {
        setDismissed(false);
      }
    });

    void NetInfo.fetch().then((state) => {
      setIsOffline(isNetworkOffline(state));
    });

    return unsubscribe;
  }, []);

  const handleTryAgain = useCallback(() => {
    setIsRetrying(true);
    void NetInfo.fetch()
      .then((state) => {
        const offline = isNetworkOffline(state);
        setIsOffline(offline);
        if (!offline) {
          setDismissed(true);
        }
      })
      .finally(() => {
        setIsRetrying(false);
      });
  }, []);

  return (
    <>
      {children}
      <NoInternetModal
        visible={isOffline && !dismissed}
        isRetrying={isRetrying}
        onTryAgain={handleTryAgain}
      />
    </>
  );
}
