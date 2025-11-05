'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'
import useApi from '@/hooks/useApi'
import { useUser } from '@/context/UserContext'
import useExperienceSync from '@/hooks/useExperienceSync'
import RequireAuth from '@/components/RequireAuth'

const ALLOWED_COLORS = ['red', 'orange', 'yellow', 'green', 'blue']
const COLOR_CLASSES = {
  red: 'bg-red-500 hover:bg-red-600 border-red-700',
  orange: 'bg-orange-500 hover:bg-orange-600 border-orange-700',
  yellow: 'bg-yellow-500 hover:bg-yellow-600 border-yellow-700',
  green: 'bg-green-500 hover:bg-green-600 border-green-700',
  blue: 'bg-blue-500 hover:bg-blue-600 border-blue-700'
}

const NUMBER_MULTIPLIERS = { 1:1, 2:2, 3:4, 4:8, 5:16 }
const COLOR_MULTIPLIERS = { 0:0, 1:0.5, 2:1, 3:2, 4:4, 5:8 }

function LuckyFivePage() {
  const { post } = useApi()
  const { balance, updateBalance } = useUser()
  const syncExperience = useExperienceSync()
  
  const [betAmount, setBetAmount] = useState(10)
  const [loading, setLoading] = useState(false)
  
  // User selections (5 numbers and 5 colors)
  const [selectedNumbers, setSelectedNumbers] = useState([0, 5, 10, 15, 20])
  const [selectedColors, setSelectedColors] = useState(['red', 'orange', 'yellow', 'green', 'blue'])
  
  // Result
  const [result, setResult] = useState(null)

  const handleNumberChange = (index, value) => {
    const num = parseInt(value) || 1
    const clamped = Math.min(Math.max(num, 1), 100)
    const newNumbers = [...selectedNumbers]
    newNumbers[index] = clamped
    setSelectedNumbers(newNumbers)
  }

  const handleColorChange = (index, color) => {
    const newColors = [...selectedColors]
    newColors[index] = color
    setSelectedColors(newColors)
  }

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
    setResult(null)

    try {
      const res = await post('/game/luckyfive', {
        betAmount,
        numbers: selectedNumbers,
        colors: selectedColors
      })
      
  setResult(res)
  updateBalance(res.balance)
  syncExperience(res)
      
      if (res.win) {
        const totalPayout = res.payouts?.totalPayout || 0
        toast.success(`You won ${totalPayout} coins!`)
      } else {
        toast.error(`You lost ${betAmount} coins`)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to play')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickPick = () => {
    // Random numbers (0-30)
    const nums = []
    while (nums.length < 5) {
      const n = Math.floor(Math.random() * 31) // 0 to 30
      if (!nums.includes(n)) nums.push(n)
    }
    setSelectedNumbers(nums)
    
    // Random colors
    const cols = []
    for (let i = 0; i < 5; i++) {
      cols.push(ALLOWED_COLORS[Math.floor(Math.random() * ALLOWED_COLORS.length)])
    }
    setSelectedColors(cols)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎰 Lucky Five</h1>
          <p className="text-gray-300">Pick 5 numbers (0-30) and 5 colors to win!</p>
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
              onClick={handleQuickPick}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded font-semibold"
              disabled={loading}
            >
              Quick Pick
            </button>
            <button
              onClick={handlePlay}
              disabled={loading}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-bold text-lg"
            >
              {loading ? 'Playing...' : 'PLAY'}
            </button>
          </div>
        </div>

        {/* Selections */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
          <h3 className="text-white font-bold text-xl mb-4">Your Selections:</h3>
          
          <div className="grid grid-cols-5 gap-4 mb-6">
            {selectedNumbers.map((num, i) => (
              <div key={i} className="flex flex-col items-center">
                <label className="text-white text-sm mb-2">Number {i + 1}</label>
                <input
                  type="number"
                  value={num}
                  onChange={(e) => handleNumberChange(i, e.target.value)}
                  className="w-full px-3 py-2 rounded bg-white/20 text-white text-center font-bold border-2 border-white/30"
                  min="0"
                  max="30"
                  disabled={loading}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-4">
            {selectedColors.map((color, i) => (
              <div key={i} className="flex flex-col items-center">
                <label className="text-white text-sm mb-2">Color {i + 1}</label>
                <div className="flex flex-wrap gap-1">
                  {ALLOWED_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => handleColorChange(i, c)}
                      className={`w-8 h-8 rounded border-2 ${COLOR_CLASSES[c]} ${
                        selectedColors[i] === c ? 'ring-4 ring-white' : ''
                      }`}
                      disabled={loading}
                      title={c}
                    />
                  ))}
                </div>
                <div className={`mt-2 px-3 py-1 rounded text-white text-xs font-semibold ${COLOR_CLASSES[color]}`}>
                  {color}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
            <h3 className="text-white font-bold text-xl mb-4">Result:</h3>
            
            {/* Drawn Numbers */}
            <div className="mb-6">
              <p className="text-white text-sm mb-2">Drawn Numbers:</p>
              <div className="flex gap-2">
                {result.result.numbers.map((num, i) => (
                  <div
                    key={i}
                    className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold ${
                      selectedNumbers.includes(num)
                        ? 'bg-green-500 text-white ring-4 ring-green-300'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>

            {/* Drawn Colors */}
            <div className="mb-6">
              <p className="text-white text-sm mb-2">Drawn Colors:</p>
              <div className="flex gap-2">
                {result.result.colors.map((color, i) => (
                  <div
                    key={i}
                    className={`w-16 h-16 rounded-lg border-4 ${COLOR_CLASSES[color]} ${
                      selectedColors[i] === color ? 'ring-4 ring-white' : ''
                    }`}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Matches */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-500/30 rounded-lg p-4">
                <p className="text-white text-sm">Number Matches:</p>
                <p className="text-white text-3xl font-bold">{result.matches.numberMatches}/5</p>
                <p className="text-gray-300 text-sm">
                  Multiplier: {NUMBER_MULTIPLIERS[result.matches.numberMatches]}x
                </p>
              </div>
              <div className="bg-purple-500/30 rounded-lg p-4">
                <p className="text-white text-sm">Color Matches:</p>
                <p className="text-white text-3xl font-bold">{result.matches.colorMatches}/5</p>
                <p className="text-gray-300 text-sm">
                  Multiplier: {COLOR_MULTIPLIERS[result.matches.colorMatches]}x
                </p>
              </div>
            </div>

            {/* Payout */}
            <div className={`text-center p-6 rounded-lg ${result.win ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
              <p className="text-white text-lg font-semibold mb-2">
                {result.win ? '🎉 YOU WON!' : '😢 YOU LOST'}
              </p>
              <p className="text-white text-4xl font-bold">
                {result.win ? `+${result.payouts?.totalPayout || 0}` : `-${betAmount}`} coins
              </p>
              <p className="text-gray-200 text-sm mt-2">
                You won! Numbers matched: {result.matches.numberMatches} (+{result.payouts?.payoutNumber || 0}), 
                Colors matched: {result.matches.colorMatches} (+{result.payouts?.payoutColor || 0}), 
                total {result.payouts?.totalPayout || 0}.
              </p>
            </div>
          </div>
        )}

        {/* Multiplier Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-white font-bold text-lg mb-4">Payout Multipliers:</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white font-semibold mb-2">Number Matches:</p>
              <div className="space-y-1 text-sm">
                {Object.entries(NUMBER_MULTIPLIERS).map(([matches, mult]) => (
                  <div key={matches} className="flex justify-between text-gray-300">
                    <span>{matches} matches:</span>
                    <span className="text-yellow-400">{mult}x</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white font-semibold mb-2">Color Matches:</p>
              <div className="space-y-1 text-sm">
                {Object.entries(COLOR_MULTIPLIERS).map(([matches, mult]) => (
                  <div key={matches} className="flex justify-between text-gray-300">
                    <span>{matches} matches:</span>
                    <span className="text-yellow-400">{mult}x</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequireAuth(LuckyFivePage)
