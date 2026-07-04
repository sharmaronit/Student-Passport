import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import { WagmiProvider } from 'wagmi'
import { polygonAmoy, hardhat } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'

// 1. Get projectId from WalletConnect (free fallback placeholder)
const projectId = '3fcc6b19d20c5d7d3d2c8846c4f24302'

// 2. Create wagmiConfig
const metadata = {
  name: 'Student Skill Passport',
  description: 'Verifiable Soulbound Credentials',
  url: 'http://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [polygonAmoy, hardhat]
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})

// 3. Create Web3Modal with matching colors
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false,
  themeVariables: {
    '--w3m-accent': '#9d4edd',
    '--w3m-background-color': '#0a0714',
    '--w3m-border-radius-master': '10px',
    '--w3m-font-family': 'Outfit, sans-serif'
  }
})

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
