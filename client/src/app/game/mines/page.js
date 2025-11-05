'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import useApi from '@/hooks/useApi'
import { useUser } from '@/context/UserContext'
import useExperienceSync from '@/hooks/useExperienceSync'
import RequireAuth from '@/components/RequireAuth'

const ROWS = 15
const COLS = 15
const MINE_COUNT = 40
const MAX_PICKS = 10

const MULTIPLIERS = [0, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]

function MinesPage() {
  const { post } = useApi()
  const { balance, updateBalance } = useUser()
  const syncExperience = useExperienceSync()
  
  const [betAmount, setBetAmount] = useState(10)
  const [gameActive, setGameActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [picks, setPicks] = useState([])
  const [revealedTiles, setRevealedTiles] = useState({})
  const [currentMultiplier, setCurrentMultiplier] = useState(0)
  const [gameEnded, setGameEnded] = useState(false)

  const handleStart = async () => {
    if (betAmount <= 0) {
      toast.error('Bet amount must be positive')
      return
    }
    if (balance < betAmount) {
      toast.error('Insufficient balance')
      return
    }

    setLoading(true)
    try {
      await post('/game/mines/start', { betAmount })
      
      setGameActive(true)
      setGameEnded(false)
      setPicks([])
      setRevealedTiles({})
      setCurrentMultiplier(0)
      toast.success('Game started! Pick safe tiles')
    } catch (err) {
      toast.error(err.message || 'Failed to start game')
    } finally {
      setLoading(false)
    }
  }

  const handlePick = async (row, col) => {
    if (!gameActive || gameEnded || loading) return
    
    const tileKey = `${row}-${col}`
    if (revealedTiles[tileKey]) return // Already picked
    
    if (picks.length >= MAX_PICKS) {
      toast.error('Maximum picks reached! Please cashout')
      return
    }

    setLoading(true)
    try {
      // Convert row, col to index (0-224)
      const index = row * COLS + col
      const res = await post('/game/mines/pick', { index })
      
      setPicks(prev => [...prev, { row, col }])
      setRevealedTiles(prev => ({ ...prev, [tileKey]: res.safe || res.mined === false ? 'safe' : 'mine' }))
      
      if (res.mined === true) {
        // Hit a mine! Game over
        setGameActive(false)
        setGameEnded(true)
        updateBalance(res.balance)
        syncExperience(res)
        toast.error(`💣 BOOM! You hit a mine. Lost ${betAmount} coins`)
      } else if (res.win === true) {
        // Completed all picks! Won
        setGameActive(false)
        setGameEnded(true)
        setCurrentMultiplier(res.multiplier)
        updateBalance(res.balance)
        syncExperience(res)
        toast.success(`🎉 Cleared ${res.pickCount} picks! Won ${res.payout} coins (${res.multiplier}x)`)
      } else {
        // Safe pick, continue game
        setCurrentMultiplier(res.multiplier)
        toast.success(`💎 Safe! Multiplier: ${res.multiplier}x`)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to pick tile')
    } finally {
      setLoading(false)
    }
  }

  const handleCashout = async () => {
    if (!gameActive || picks.length === 0) {
      toast.error('No picks to cashout')
      return
    }

    setLoading(true)
    try {
      const res = await post('/game/mines/cashout', {})
      
  setGameActive(false)
  setGameEnded(true)
  updateBalance(res.balance)
  syncExperience(res)
      toast.success(`Cashed out! Won ${res.payout} coins (${res.multiplier}x)`)
    } catch (err) {
      toast.error(err.message || 'Failed to cashout')
    } finally {
      setLoading(false)
    }
  }

  const renderTile = (row, col) => {
    const tileKey = `${row}-${col}`
    const revealed = revealedTiles[tileKey]
    
    if (revealed === 'mine') {
      return (
        <div className="w-full h-full bg-red-600 rounded flex items-center justify-center text-3xl animate-pulse">
          💣
        </div>
      )
    }
    
    if (revealed === 'safe') {
      return (
        <div className="w-full h-full bg-green-600 rounded flex items-center justify-center text-2xl">
          💎
        </div>
      )
    }
    
    return (
      <button
        onClick={() => handlePick(row, col)}
        disabled={!gameActive || gameEnded || loading}
        className="w-full h-full bg-gray-700 hover:bg-gray-600 disabled:hover:bg-gray-700 rounded transition-colors flex items-center justify-center text-white font-bold text-xs"
      >
        ?
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">💣 Mines</h1>
          <p className="text-gray-300">Find safe tiles and avoid {MINE_COUNT} mines! (Max {MAX_PICKS} picks)</p>
          <div className="mt-4 text-xl text-yellow-400">Balance: {balance} coins</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Bet Amount */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <label className="block text-white font-semibold mb-2">Bet Amount:</label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(+e.target.value)}
                className="w-full px-4 py-3 rounded bg-white/20 text-white text-lg font-bold border-2 border-white/30"
                min="1"
                disabled={gameActive || loading}
              />
              {!gameActive && (
                <button
                  onClick={handleStart}
                  disabled={loading}
                  className="w-full mt-3 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-bold text-lg"
                >
                  {loading ? 'Starting...' : 'START GAME'}
                </button>
              )}
            </div>

            {/* Game Status */}
            {gameActive && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Picks:</span>
                    <span className="text-white font-bold text-lg">{picks.length} / {MAX_PICKS}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Multiplier:</span>
                    <span className="text-yellow-400 font-bold text-xl">{currentMultiplier.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Potential Win:</span>
                    <span className="text-green-400 font-bold text-xl">
                      {Math.floor(betAmount * currentMultiplier)} coins
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleCashout}
                  disabled={loading || picks.length === 0}
                  className="w-full mt-4 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded-lg font-bold text-lg"
                >
                  {loading ? 'Processing...' : 'CASHOUT'}
                </button>
              </div>
            )}

            {/* Multiplier Table */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-white font-bold mb-3">Multiplier Table:</h3>
              <div className="space-y-1 text-sm">
                {MULTIPLIERS.map((mult, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between items-center p-2 rounded ${
                      picks.length === idx ? 'bg-yellow-500/30 ring-2 ring-yellow-400' : 'bg-white/5'
                    }`}
                  >
                    <span className="text-gray-300">{idx} picks:</span>
                    <span className={`font-bold ${picks.length === idx ? 'text-yellow-400' : 'text-white'}`}>
                      {mult}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Panel - Grid */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div 
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`
              }}
            >
              {Array.from({ length: ROWS * COLS }).map((_, idx) => {
                const row = Math.floor(idx / COLS)
                const col = idx % COLS
                return (
                  <div key={idx} className="aspect-square">
                    {renderTile(row, col)}
                  </div>
                )
              })}
            </div>

            {/* Game End Message */}
            {gameEnded && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setGameActive(false)
                    setGameEnded(false)
                    setPicks([])
                    setRevealedTiles({})
                    setCurrentMultiplier(0)
                  }}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 text-sm text-gray-300">
          <h3 className="text-white font-bold mb-2">How to Play:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Set your bet amount and click START GAME</li>
            <li>Click tiles to reveal them - avoid the {MINE_COUNT} hidden mines 💣</li>
            <li>Each safe tile 💎 increases your multiplier</li>
            <li>You can make up to {MAX_PICKS} picks maximum</li>
            <li>Cashout anytime to secure your winnings</li>
            <li>Hit a mine and you lose your bet!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default RequireAuth(MinesPage)
