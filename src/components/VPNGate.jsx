import React, { useEffect } from 'react';

// VPN detection stub
function VPNGate({ setVpnStatus }) {
  useEffect(() => {
    // Simulate VPN check: always assume VPN is active for now
    setVpnStatus('ok'); // or 'dummy' for non-VPN
  }, [setVpnStatus]);
  return null;
}

export default VPNGate;
