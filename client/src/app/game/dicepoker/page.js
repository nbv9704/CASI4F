'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import useApi from '@/hooks/useApi'
import { useUser } from '@/context/UserContext'
import useExperienceSync from '@/hooks/useExperienceSync'
import RequireAuth from '@/components/RequireAuth'

const HAND_MULTIPLIERS = {
  'Five of a Kind': 20,
  'Four of a Kind': 10,
  'Full House': 8,
  'Straight': 5,
  'Three of a Kind': 3,
  'Two Pair': 2,
  'One Pair': 1,
  'High Card': 0
}

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

function DicePokerPage() {
  const { post } = useApi()
  const { balance, updateBalance } = useUser()
  const syncExperience = useExperienceSync()
  
  const [betAmount, setBetAmount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [rolling, setRolling] = useState(false)

  const handlePlay = async () => {
    if (betAmount <= 0) {
      toast.error('Bet amount must be positive')
      return
    }
    if (balance < betAmount) {
      toast.error('Insufficient balance')
      return
    }

    setLoading(true)
    setRolling(true)
    setResult(null)

    // Animate rolling
    setTimeout(() => setRolling(false), 1000)

    try {
      const res = await post('/game/dicepoker', { betAmount })
      
  setResult(res)
  updateBalance(res.balance)
  syncExperience(res)
      
      if (res.win) {
        toast.success(`${res.hand}! You won ${res.payout} coins!`)
      } else {
        toast.error(`${res.hand}. You lost ${betAmount} coins`)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to play')
      setRolling(false)
    } finally {
      setLoading(false)
    }
  }

  const renderDice = (value) => {
    return DICE_FACES[value - 1] || '?'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-orange-900 to-yellow-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎲 Dice Poker</h1>
          <p className="text-gray-300">Roll 5 dice and make poker hands!</p>
          <div className="mt-4 text-xl text-yellow-400">Balance: {balance} coins</div>
        </div>

        {/* Bet Amount */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
          <label className="block text-white font-semibold mb-2">Bet Amount:</label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(+e.target.value)}
              className="flex-1 px-4 py-3 rounded bg-white/20 text-white text-lg font-bold border-2 border-white/30"
              min="1"
              disabled={loading}
            />
            <button
              onClick={handlePlay}
              disabled={loading}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-bold text-lg"
            >
              {loading ? 'Rolling...' : 'ROLL DICE'}
            </button>
          </div>
        </div>

        {/* Dice Display */}
        {result && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-6">
            <h3 className="text-white font-bold text-xl mb-6 text-center">Your Roll:</h3>
            
            <div className="flex justify-center gap-4 mb-8">
              {result.dice.map((value, i) => (
                <div
                  key={i}
                  className={`w-24 h-24 bg-white rounded-lg shadow-lg flex items-center justify-center text-6xl transform transition-all duration-300 ${
                    rolling ? 'animate-bounce' : 'hover:scale-110'
                  }`}
                >
                  {renderDice(value)}
                </div>
              ))}
            </div>

            {/* Hand Result */}
            <div className="text-center mb-6">
              <p className="text-gray-300 text-sm mb-2">Hand:</p>
              <p className="text-white text-3xl font-bold mb-2">{result.hand}</p>
              <p className="text-yellow-400 text-xl">Multiplier: {result.multiplier}x</p>
            </div>

            {/* Payout */}
            <div className={`text-center p-6 rounded-lg ${result.win ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
              <p className="text-white text-lg font-semibold mb-2">
                {result.win ? '🎉 YOU WON!' : '😢 NO WIN'}
              </p>
              <p className="text-white text-4xl font-bold">
                {result.win ? `+${result.payout}` : `0`} coins
              </p>
              {result.win && (
                <p className="text-gray-200 text-sm mt-2">
                  {betAmount} × {result.multiplier} = {result.payout}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Hand Rankings */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-white font-bold text-lg mb-4">Poker Hands & Payouts:</h3>
          <div className="space-y-2">
            {Object.entries(HAND_MULTIPLIERS)
              .sort((a, b) => b[1] - a[1])
              .map(([hand, multiplier]) => (
                <div
                  key={hand}
                  className={`flex justify-between items-center p-3 rounded ${
                    result?.hand === hand ? 'bg-yellow-500/30 ring-2 ring-yellow-400' : 'bg-white/5'
                  }`}
                >
                  <span className="text-white font-semibold">{hand}</span>
                  <span className={`font-bold ${multiplier > 0 ? 'text-yellow-400' : 'text-gray-400'}`}>
                    {multiplier > 0 ? `${multiplier}x` : 'No Win'}
                  </span>
                </div>
              ))}
          </div>

          {/* Hand Descriptions */}
          <div className="mt-6 text-sm text-gray-300 space-y-2">
            <p><strong className="text-white">Five of a Kind:</strong> All 5 dice show the same number (e.g., 🎲🎲🎲🎲🎲)</p>
            <p><strong className="text-white">Four of a Kind:</strong> 4 dice show the same number</p>
            <p><strong className="text-white">Full House:</strong> 3 of one number + 2 of another (e.g., 🎲🎲🎲🎯🎯)</p>
            <p><strong className="text-white">Straight:</strong> 5 consecutive numbers (1-2-3-4-5 or 2-3-4-5-6)</p>
            <p><strong className="text-white">Three of a Kind:</strong> 3 dice show the same number</p>
            <p><strong className="text-white">Two Pair:</strong> 2 pairs of matching numbers</p>
            <p><strong className="text-white">One Pair:</strong> 2 dice show the same number</p>
            <p><strong className="text-white">High Card:</strong> No matching pattern (no win)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequireAuth(DicePokerPage)
