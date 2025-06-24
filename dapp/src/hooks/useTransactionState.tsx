import { useEffect, useState } from "react";

export function useTransactionState() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [txHash, setTxHash] = useState<string>();

  useEffect(() => {
    if (loading) {
      setError(undefined);
      setTxHash(undefined);
    }
  }, [loading]);

  return { loading, setLoading, error, setError, txHash, setTxHash };
}
