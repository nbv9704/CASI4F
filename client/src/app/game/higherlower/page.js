// client/src/app/game/higherlower/page.js
'use client'

import RequireAuth from '@/components/RequireAuth'
import { useCallback, useEffect, useState } from 'react'
import useApi from '@/hooks/useApi'
import { useUser } from '@/context/UserContext'
import useExperienceSync from '@/hooks/useExperienceSync'
import { toast } from 'react-hot-toast'

function HigherLowerPage() {
  const { post } = useApi()
  const { balance, updateBalance } = useUser()
  const syncExperience = useExperienceSync()

  const [betAmount, setBetAmount] = useState(1)
  const [currentNumber, setCurrentNumber] = useState(10)
  const [nextNumber, setNextNumber] = useState(null)
  const [streak, setStreak] = useState(0)
  const [history, setHistory] = useState([])
  const [guessing, setGuessing] = useState(false)
  const [showResult, setShowResult] = useState(false)

  // Load initial state from server
  const loadState = useCallback(async () => {
    try {
      const data = await post('/game/higherlower/state')
      if (data.lastNumber !== undefined) {
        setCurrentNumber(data.lastNumber)
      }
      if (data.streak !== undefined) {
        setStreak(data.streak)
      }
    } catch (err) {
      console.error('Failed to load Higher/Lower state:', err)
    }
  }, [post])

  useEffect(() => {
    void loadState()
  }, [loadState])

  const handleGuess = async (guess) => {
    if (betAmount <= 0) {
      toast.error('Bet must be > 0')
      return
    }

    setGuessing(true)
    setShowResult(false)

    try {
      const data = await post('/game/higherlower', { betAmount, guess })

      // Animate number reveal
      setTimeout(() => {
        setNextNumber(data.result)
        setShowResult(true)
  updateBalance(data.balance)
  syncExperience(data)

        if (data.tie) {
          toast(`🤝 It's a tie! Both were ${data.initial}`, { icon: 'ℹ️' })
          setStreak(0)
          setHistory(prev => [...prev, { from: data.initial, to: data.result, guess, outcome: 'tie' }].slice(-10))
        } else if (data.win) {
          toast.success(`🎉 Correct! ${data.initial} → ${data.result}`)
          setStreak(data.streak)
          setHistory(prev => [...prev, { from: data.initial, to: data.result, guess, outcome: 'win' }].slice(-10))
        } else {
          toast.error(`😢 Wrong! ${data.initial} → ${data.result}`)
          setStreak(0)
          setHistory(prev => [...prev, { from: data.initial, to: data.result, guess, outcome: 'lose' }].slice(-10))
        }

        // Prepare for next round
        setTimeout(() => {
          setCurrentNumber(data.result)
          setNextNumber(null)
          setShowResult(false)
          setGuessing(false)
        }, 2000)
      }, 1500)
    } catch (err) {
      setGuessing(false)
      setShowResult(false)
      // Error toast handled by useApi
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">⬆️⬇️ Higher or Lower</h1>
          <p className="text-gray-300">Predict the trend — ride the streak!</p>
          <div className="mt-4 text-xl text-yellow-400">Balance: {balance} coins</div>
        </div>

        {/* Streak Display */}
        {streak > 0 && (
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-6 mb-6 text-center shadow-2xl">
            <div className="text-3xl font-bold text-white mb-2">
              🔥 {streak} WIN STREAK! 🔥
            </div>
            <div className="text-white text-lg">
              Current multiplier: <span className="font-bold">{(0.5 + streak * 0.5).toFixed(1)}x</span>
            </div>
          </div>
        )}

        {/* Game Board */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
          {/* Numbers Display */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Current Number */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl p-8 shadow-xl">
              <div className="text-sm text-white/70 mb-2 text-center">CURRENT</div>
              <div className="text-8xl font-bold text-white text-center">
                {currentNumber}
              </div>
            </div>

            {/* Next Number */}
            <div className={`bg-gradient-to-br from-green-500 to-blue-500 rounded-xl p-8 shadow-xl ${showResult ? 'animate-pulse' : ''}`}>
              <div className="text-sm text-white/70 mb-2 text-center">NEXT</div>
              <div className="text-8xl font-bold text-white text-center">
                {showResult && nextNumber !== null ? nextNumber : '?'}
              </div>
            </div>
          </div>

          {/* Bet Amount */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">Bet Amount:</label>
            <input
              type="number"
              min="1"
              value={betAmount}
              onChange={(e) => setBetAmount(+e.target.value)}
              className="w-full px-4 py-3 rounded bg-white/20 text-white text-lg font-bold border-2 border-white/30"
              disabled={guessing}
            />
          </div>

          {/* Guess Buttons */}
          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => handleGuess('lower')}
              disabled={guessing}
              className="px-8 py-8 bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-xl font-bold text-3xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              ⬇️ LOWER
            </button>
            <button
              onClick={() => handleGuess('higher')}
              disabled={guessing}
              className="px-8 py-8 bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white rounded-xl font-bold text-3xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              ⬆️ HIGHER
            </button>
          </div>

          {guessing && (
            <div className="mt-6 text-center text-white text-xl font-semibold animate-pulse">
              🎲 Revealing next number...
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
            <h2 className="text-white text-xl font-bold mb-4">📜 Recent History</h2>
            <div className="space-y-3">
              {[...history].reverse().map((h, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    h.outcome === 'win'
                      ? 'bg-green-500/30 border-2 border-green-400'
                      : h.outcome === 'lose'
                      ? 'bg-red-500/30 border-2 border-red-400'
                      : 'bg-gray-500/30 border-2 border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-white">{h.from}</span>
                    <span className="text-2xl">
                      {h.guess === 'higher' ? '⬆️' : '⬇️'}
                    </span>
                    <span className="text-3xl font-bold text-white">{h.to}</span>
                  </div>
                  <div className="text-2xl">
                    {h.outcome === 'win' ? '✅' : h.outcome === 'lose' ? '❌' : '🤝'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rules */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-white font-bold text-lg mb-4">📖 How to Play:</h3>
          <div className="text-gray-300 space-y-2">
            <p>• Numbers range from <strong>1 to 20</strong></p>
            <p>• Guess if the next number will be <strong className="text-green-400">HIGHER</strong> or <strong className="text-red-400">LOWER</strong></p>
            <p>• Build a win streak for bonus multipliers (<strong className="text-yellow-400">+0.5x per win</strong>)</p>
            <p>• Ties reset your streak but <strong>refund your bet</strong></p>
            <p>• Keep streaking for bigger wins! 🔥</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequireAuth(HigherLowerPage)