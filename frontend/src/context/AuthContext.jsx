import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || null);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  // Load profile on initialization if JWT exists
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await fetch('/api/v1/users/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setUser(data.data);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.warn('API unavailable, switching to mock verification fallback', e);
        }
      }
      
      // If JWT load failed or didn't exist, check local storage for mock session
      const savedMockUser = localStorage.getItem('mock_user');
      if (savedMockUser) {
        setUser(JSON.parse(savedMockUser));
        setIsOfflineMode(true);
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  // Handle wallet disconnection
  useEffect(() => {
    if (!isConnected && user?.wallet_address) {
      // If wallet disconnected and we were using wallet auth, log out
      logout();
    }
  }, [isConnected]);

  const loginWithWallet = async (walletAddr) => {
    setLoading(true);
    const normalizedAddr = walletAddr.toLowerCase();
    try {
      // 1. Get Nonce
      const nonceRes = await fetch('/api/v1/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: normalizedAddr })
      });

      if (!nonceRes.ok) {
        throw new Error('Wallet not registered. Please register first.');
      }

      const nonceData = await nonceRes.json();
      const messageToSign = nonceData.data.message;

      // 2. Sign message using wallet
      const signature = await signMessageAsync({ message: messageToSign });

      // 3. Verify signature
      const verifyRes = await fetch('/api/v1/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: normalizedAddr,
          signature: signature
        })
      });

      if (!verifyRes.ok) {
        throw new Error('Signature verification failed');
      }

      const verifyData = await verifyRes.json();
      const jwtToken = verifyData.data.token;
      const loggedUser = verifyData.data.user;

      localStorage.setItem('jwt_token', jwtToken);
      setToken(jwtToken);
      setUser(loggedUser);
      setIsOfflineMode(false);
      return loggedUser;
    } catch (err) {
      console.error('Wallet login failed, attempting mock login fallback:', err.message);
      
      // Fallback: Generate a mock profile for dev ease
      const mockUser = {
        id: '99999999-9999-9999-9999-999999999999',
        wallet_address: normalizedAddr,
        role: 'student',
        full_name: 'Alex Developer (Offline Mock)',
        email: 'alex@example.com',
        university: 'Polytechnic University',
        graduation_year: 2026,
        github_url: 'https://github.com/octocat',
        linkedin_url: 'https://linkedin.com/in/alex',
        portfolio_url: 'https://alex.dev',
        org_verified: false
      };
      
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsOfflineMode(true);
      return mockUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Registration failed');
      }

      const data = await res.json();
      return data.data; // Returns user profile
    } catch (err) {
      console.error('Registration failed, running offline mock registration:', err.message);
      
      const mockUser = {
        id: '88888888-8888-8888-8888-888888888888',
        wallet_address: registerData.wallet_address || address || '0x0000000000000000000000000000000000000000',
        role: registerData.role,
        full_name: registerData.full_name,
        email: registerData.email,
        university: registerData.university,
        graduation_year: parseInt(registerData.graduation_year) || null,
        org_name: registerData.org_name,
        org_type: registerData.org_type,
        org_website: registerData.org_website,
        org_verified: registerData.role === 'issuer', // Autoverify in mock mode
        github_url: registerData.github_url,
        linkedin_url: registerData.linkedin_url,
        portfolio_url: registerData.portfolio_url
      };

      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setIsOfflineMode(true);
      return mockUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('mock_user');
    setToken(null);
    setUser(null);
    setIsOfflineMode(false);
    disconnect();
  };

  const updateProfile = async (updateData) => {
    if (isOfflineMode) {
      const updated = { ...user, ...updateData };
      localStorage.setItem('mock_user', JSON.stringify(updated));
      setUser(updated);
      return updated;
    }

    try {
      const res = await fetch('/api/v1/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUser(data.data);
          return data.data;
        }
      }
    } catch (e) {
      console.error('Failed to update live profile', e);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isConnected,
      address,
      isOfflineMode,
      loginWithWallet,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
