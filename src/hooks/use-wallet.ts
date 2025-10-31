import { useCallback, useEffect, useState } from "react";

export interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
}

export const useWallet = () => {
  const [state, setState] = useState<WalletState>({ isConnected: false, isConnecting: false, address: null });

  const setAccounts = useCallback((accounts: string[]) => {
    const addr = accounts && accounts.length > 0 ? accounts[0] : null;
    setState((s) => ({ ...s, address: addr, isConnected: !!addr }));
  }, []);

  // Initialize and subscribe to account changes
  useEffect(() => {
    const eth = window.ethereum;
    if (!eth) return;

    // Get current accounts if already connected
    eth
      .request({ method: "eth_accounts" })
      .then((accounts) => setAccounts(accounts))
      .catch((e) => console.error("eth_accounts error", e));

    const onAccountsChanged = (accounts: string[]) => setAccounts(accounts);

    // Subscribe to account changes
    eth.on?.("accountsChanged", onAccountsChanged);

    return () => {
      eth.removeListener?.("accountsChanged", onAccountsChanged);
    };
  }, [setAccounts]);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to connect your wallet");
      return null;
    }
    try {
      setState((s) => ({ ...s, isConnecting: true }));
      const accounts: string[] = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccounts(accounts);
      return accounts?.[0] ?? null;
    } catch (e) {
      console.error("MetaMask connection failed:", e);
      return null;
    } finally {
      setState((s) => ({ ...s, isConnecting: false }));
    }
  }, [setAccounts]);

  const switchAccount = useCallback(async () => {
    // Re-trigger the MetaMask account selection popup
    return connect();
  }, [connect]);

  return {
    ...state,
    connect,
    switchAccount,
  };
};