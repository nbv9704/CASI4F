// client/src/app/game/slots/page.js
'use client'

import RequireAuth from '@/components/RequireAuth'
import { useState } from 'react'
import useApi from '@/hooks/useApi'
import { useUser } from '@/context/UserContext'
import useExperienceSync from '@/hooks/useExperienceSync'
import { toast } from 'react-hot-toast'

// 9 symbols với emoji
const SYMBOLS = [
  { name: 'cherry', emoji: '🍒', multiplier: 1.25 },
  { name: 'lemon', emoji: '🍋', multiplier: 1.5 },
  { name: 'watermelon', emoji: '🍉', multiplier: 2 },
  { name: 'heart', emoji: '❤️', multiplier: 3 },
  { name: 'bell', emoji: '🔔', multiplier: 4 },
  { name: 'diamond', emoji: '💎', multiplier: 5 },
  { name: 'seven', emoji: '7️⃣', multiplier: 8 },
  { name: 'horseshoe', emoji: '🐴', multiplier: 10 },
  { name: 'money', emoji: '💰', multiplier: 20 }
]

function SlotsPage() {
  const { post } = useApi()
  const { balance, updateBalance } = useUser()
  const syncExperience = useExperienceSync()

  const [betAmount, setBetAmount] = useState(1)
  const [spinning, setSpinning] = useState(false)
  const [grid, setGrid] = useState([
    [SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]],
    [SYMBOLS[3], SYMBOLS[4], SYMBOLS[5]],
    [SYMBOLS[6], SYMBOLS[7], SYMBOLS[8]]
  ])
  const [result, setResult] = useState(null)

  const handleSpin = async (e) => {
    e.preventDefault()

    if (betAmount <= 0) {
      toast.error('Bet must be > 0')
      return
    }

    setSpinning(true)
    setResult(null)

    try {
      const data = await post('/game/slots', { betAmount })

      // Animate spinning
      setTimeout(() => {
        // Parse emoji grid từ server response
        const serverGrid = data.grid || []
        const parsedGrid = serverGrid.map(row =>
          row.map(emoji => SYMBOLS.find(s => s.emoji === emoji) || SYMBOLS[0])
        )

  setGrid(parsedGrid)
  setResult(data)
  updateBalance(data.balance)
  syncExperience(data)
  setSpinning(false)

        if (data.win) {
          toast.success(`🎉 You win! ${data.totalMultiplier}x - Payout: ${data.payout}`)
        } else {
          toast.error('😢 No winning lines this time')
        }
      }, 2000) // Match animation duration
    } catch (err) {
      setSpinning(false)
      // Error toast handled by useApi
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎰 Slots</h1>
          <p className="text-gray-300">Spin the reels — match the lines!</p>
          <div className="mt-4 text-xl text-yellow-400">Balance: {balance} coins</div>
        </div>

        {/* Slots Machine */}
        <div className="bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-3xl p-8 shadow-2xl mb-6">
          {/* Display */}
          <div className="bg-gray-900 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-3 gap-4">
              {grid.map((row, r) =>
                row.map((symbol, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={`bg-white rounded-xl h-28 flex items-center justify-center text-6xl shadow-lg ${
                      spinning ? 'animate-bounce' : ''
                    }`}
                    style={{
                      animationDelay: `${c * 0.15}s`,
                      filter: spinning ? 'blur(4px)' : 'none'
                    }}
                  >
                    {spinning ? '❓' : symbol.emoji}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Result Display */}
          {result && !spinning && (
            <div className="bg-gray-900 rounded-xl p-6 text-white text-center mb-6">
              <div className={`text-3xl font-bold mb-2 ${result.win ? 'text-yellow-400' : 'text-gray-400'}`}>
                {result.win ? '🎊 JACKPOT!' : '😢 NO WIN'}
              </div>
              {result.win ? (
                <>
                  <div className="text-lg mt-2">Total Multiplier: <span className="text-yellow-400 font-bold">{result.totalMultiplier}x</span></div>
                  <div className="text-4xl font-bold text-green-400 mt-2">+{result.payout} coins</div>
                  {result.winningLines && result.winningLines.length > 0 && (
                    <div className="text-sm text-gray-300 mt-3">
                      {result.winningLines.length} winning line{result.winningLines.length > 1 ? 's' : ''}! 🎯
                    </div>
                  )}
                </>
              ) : (
                <div className="text-red-400 text-2xl mt-2">-{betAmount} coins</div>
              )}
            </div>
          )}

          {/* Bet Controls */}
          <form onSubmit={handleSpin} className="space-y-4">
            <div className="bg-gray-900 rounded-xl p-4">
              <label className="block mb-2 font-semibold text-white">Bet Amount:</label>
              <input
                type="number"
                min="1"
                value={betAmount}
                onChange={(e) => setBetAmount(+e.target.value)}
                className="w-full px-4 py-3 rounded bg-gray-800 text-white text-lg font-bold border-2 border-gray-700"
                disabled={spinning}
              />
            </div>

            <button
              type="submit"
              className="w-full px-8 py-6 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-2xl font-bold text-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              disabled={spinning}
            >
              {spinning ? '🎰 SPINNING...' : '🎰 SPIN NOW'}
            </button>
          </form>
        </div>

        {/* Paytable */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h2 className="text-white text-xl font-bold mb-4">💎 Paytable (3-of-a-kind)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SYMBOLS.map(s => (
              <div key={s.name} className="bg-white/10 rounded-lg p-4 flex items-center justify-between">
                <span className="text-4xl">{s.emoji}</span>
                <span className="text-yellow-400 font-bold text-xl">{s.multiplier}x</span>
              </div>
            ))}
          </div>
          <div className="mt-6 text-gray-300 space-y-2">
            <p>• Win lines: <strong>3 rows + 3 columns + 2 diagonals = 8 total</strong></p>
            <p>• Match 3 symbols in any line to win!</p>
            <p>• Multiple lines <strong className="text-yellow-400">multiply your payout!</strong></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequireAuth(SlotsPage)