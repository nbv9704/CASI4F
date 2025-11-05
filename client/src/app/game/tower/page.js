'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import useApi from '@/hooks/useApi'
import { useUser } from '@/context/UserContext'
import useExperienceSync from '@/hooks/useExperienceSync'
import RequireAuth from '@/components/RequireAuth'

const MAX_LEVEL = 15
const SUCCESS_PROB = 0.5

const LEVEL_MULTIPLIERS = [
  1, 1.5, 2, 2.5, 3, 4, 5, 6.5, 8, 10,
  13, 16, 20, 30, 40, 50
]

function TowerPage() {
  const { post } = useApi()
  const { balance, updateBalance } = useUser()
  const syncExperience = useExperienceSync()
  
  const [betAmount, setBetAmount] = useState(10)
  const [gameActive, setGameActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentLevel, setCurrentLevel] = useState(0)
  const [gameEnded, setGameEnded] = useState(false)
  const [wonLevel, setWonLevel] = useState(false)

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
      await post('/game/tower/start', { betAmount })
      
      setGameActive(true)
      setGameEnded(false)
      setCurrentLevel(0)
      setWonLevel(false)
      toast.success('Game started! Climb the tower')
    } catch (err) {
      toast.error(err.message || 'Failed to start game')
    } finally {
      setLoading(false)
    }
  }

  const handleAscend = async () => {
    if (!gameActive || currentLevel >= MAX_LEVEL) return

    setLoading(true)
    setWonLevel(false)
    
    try {
      const res = await post('/game/tower/ascend', {})
      
      // Check response type
      if (res.win === false) {
        // Busted! Game over, lost bet
        setGameActive(false)
        setGameEnded(true)
        setWonLevel(false)
        updateBalance(res.balance)
        syncExperience(res)
        toast.error(`💥 BUSTED at level ${res.bustedLevel || currentLevel + 1}! Lost ${betAmount} coins`)
      } else if (res.win === true) {
        // Reached max level! Game over, won big
        setGameActive(false)
        setGameEnded(true)
        setCurrentLevel(res.level)
        updateBalance(res.balance)
        syncExperience(res)
        toast.success(`🎉 Reached level ${res.level}! Won ${res.payout} coins (${res.multiplier}x)`)
      } else if (res.success === true) {
        // Successfully climbed one level, game continues
        setCurrentLevel(res.level)
        setWonLevel(true)
        toast.success(`Level ${res.level}! Multiplier: ${res.multiplier}x`, { duration: 2000 })
      }
    } catch (err) {
      toast.error(err.message || 'Failed to ascend')
      // If error, might be "no active game", reset state
      setGameActive(false)
      setGameEnded(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCashout = async () => {
    if (!gameActive || currentLevel === 0) {
      toast.error('No progress to cashout')
      return
    }

    setLoading(true)
    try {
      const res = await post('/game/tower/cashout', {})
      
  setGameActive(false)
  setGameEnded(true)
  updateBalance(res.balance)
  syncExperience(res)
      toast.success(`Cashed out at level ${res.level}! Won ${res.payout} coins (${res.multiplier}x)`)
    } catch (err) {
      toast.error(err.message || 'Failed to cashout')
    } finally {
      setLoading(false)
    }
  }

  const currentMultiplier = LEVEL_MULTIPLIERS[currentLevel]
  const potentialWin = Math.floor(betAmount * currentMultiplier)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">🏰 Tower</h1>
          <p className="text-gray-300">Climb {MAX_LEVEL} levels with {SUCCESS_PROB * 100}% success rate per level!</p>
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
                    <span className="text-gray-300">Current Level:</span>
                    <span className="text-white font-bold text-xl">{currentLevel} / {MAX_LEVEL}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Multiplier:</span>
                    <span className="text-yellow-400 font-bold text-2xl">{currentMultiplier}x</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Potential Win:</span>
                    <span className="text-green-400 font-bold text-xl">
                      {potentialWin} coins
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Success Rate:</span>
                    <span className="text-blue-400 font-bold">{SUCCESS_PROB * 100}%</span>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <button
                    onClick={handleAscend}
                    disabled={loading || currentLevel >= MAX_LEVEL}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-bold text-lg"
                  >
                    {loading ? '...' : currentLevel >= MAX_LEVEL ? 'MAX LEVEL' : '⬆️ ASCEND'}
                  </button>
                  
                  {currentLevel > 0 && (
                    <button
                      onClick={handleCashout}
                      disabled={loading}
                      className="w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white rounded-lg font-bold text-lg"
                    >
                      {loading ? 'Processing...' : '💰 CASHOUT'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Multiplier Table */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-h-96 overflow-y-auto">
              <h3 className="text-white font-bold mb-3">Level Multipliers:</h3>
              <div className="space-y-1 text-sm">
                {LEVEL_MULTIPLIERS.map((mult, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between items-center p-2 rounded ${
                      currentLevel === idx && gameActive
                        ? 'bg-yellow-500/30 ring-2 ring-yellow-400'
                        : 'bg-white/5'
                    }`}
                  >
                    <span className="text-gray-300">Level {idx}:</span>
                    <span className={`font-bold ${currentLevel === idx && gameActive ? 'text-yellow-400' : 'text-white'}`}>
                      {mult}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Tower Visualization */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <div className="flex flex-col-reverse gap-2">
              {LEVEL_MULTIPLIERS.map((mult, idx) => {
                const isCurrentLevel = currentLevel === idx && gameActive
                const isPassed = currentLevel > idx && gameActive
                const isNext = currentLevel === idx - 1 && gameActive
                
                return (
                  <div
                    key={idx}
                    className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                      isCurrentLevel
                        ? 'bg-yellow-500/30 border-yellow-400 scale-105 shadow-lg shadow-yellow-400/50'
                        : isPassed
                        ? 'bg-green-500/20 border-green-400'
                        : isNext
                        ? 'bg-blue-500/20 border-blue-400 animate-pulse'
                        : 'bg-white/5 border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-2xl font-bold ${
                          isCurrentLevel ? 'text-yellow-400' : isPassed ? 'text-green-400' : 'text-white'
                        }`}>
                          Level {idx}
                        </span>
                        {isPassed && <span className="text-xl">✅</span>}
                        {isCurrentLevel && <span className="text-xl animate-bounce">👤</span>}
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-xl font-bold ${
                          isCurrentLevel ? 'text-yellow-400' : isPassed ? 'text-green-400' : 'text-white'
                        }`}>
                          {mult}x
                        </div>
                        {(isCurrentLevel || isPassed) && (
                          <div className="text-sm text-gray-300">
                            {Math.floor(betAmount * mult)} coins
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {idx === MAX_LEVEL && (
                      <div className="absolute -top-8 left-0 right-0 text-center text-2xl">
                        👑
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Game End Message */}
            {gameEnded && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    // Reset all game state completely
                    setGameActive(false)
                    setGameEnded(false)
                    setCurrentLevel(0)
                    setWonLevel(false)
                    setResult(null)
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
            <li>Click ASCEND to climb to the next level ({SUCCESS_PROB * 100}% success rate)</li>
            <li>Each successful ascend increases your multiplier</li>
            <li>Cashout anytime to secure your winnings</li>
            <li>Fail an ascend and you lose your bet!</li>
            <li>Reach level {MAX_LEVEL} for {LEVEL_MULTIPLIERS[MAX_LEVEL]}x multiplier!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default RequireAuth(TowerPage)
