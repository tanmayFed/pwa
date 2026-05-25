import { useEffect, useState } from "react";

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  async function checkConnection() {
    try {
      await fetch("https://www.google.com/favicon.ico", {
        mode: "no-cors",
        cache: "no-cache",
      });
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  }

  useEffect(() => {
    checkConnection();
    const handleOnline = () => checkConnection();
    const handleOffline = () => {
      return setIsOnline(false);
    };

    window.addEventListener("online", () => handleOnline);
    window.addEventListener("offline", () => handleOffline);

    return () => {
      window.removeEventListener("online", () => handleOnline);
      window.removeEventListener("offline", () => handleOffline);
    };
  }, []);

  return isOnline;
};
