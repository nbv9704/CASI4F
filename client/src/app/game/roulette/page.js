// client/src/app/game/roulette/page.js
'use client'

import RequireAuth from '@/components/RequireAuth'
import { useState } from 'react'
import useApi from '@/hooks/useApi'
import { useUser } from '@/context/UserContext'
import useExperienceSync from '@/hooks/useExperienceSync'
import { toast } from 'react-hot-toast'

// Số trên bánh xe (European style: 0-36)
const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

// Màu sắc (0 = green, odd = red, even = black)
const getColor = (num) => {
  if (num === 0) return 'green'
  return num % 2 === 0 ? 'black' : 'red'
}

// Ranges cho betting
const RANGES = ['1-9', '10-18', '19-27', '28-36']

function RoulettePage() {
  const { post } = useApi()
  const { balance, updateBalance } = useUser()
  const syncExperience = useExperienceSync()

  const [betAmount, setBetAmount] = useState(5)
  const [betType, setBetType] = useState('color') // 'zero' | 'range' | 'color' | 'number'
  const [betValue, setBetValue] = useState('red') // red/black | range | number
  
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [spinDegrees, setSpinDegrees] = useState(0)

  const handleSpin = async (e) => {
    e.preventDefault()
    
    if (betAmount <= 0) {
      toast.error('Bet must be > 0')
      return
    }

    // Validate betValue
    if (betType === 'range' && !RANGES.includes(betValue)) {
      toast.error('Invalid range')
      return
    }
    if (betType === 'color' && !['red', 'black'].includes(betValue)) {
      toast.error('Invalid color')
      return
    }
    if (betType === 'number') {
      const num = parseInt(betValue)
      if (isNaN(num) || num < 0 || num > 36) {
        toast.error('Number must be 0-36')
        return
      }
    }

    setSpinning(true)
    setResult(null)

    try {
      const data = await post('/game/roulette', {
        betAmount,
        betType,
        betValue: betType === 'number' ? parseInt(betValue) : betValue
      })

      // Animation: spin wheel
      const resultNum = data.result?.number
      const idx = WHEEL_NUMBERS.indexOf(resultNum)
      const segmentDeg = 360 / WHEEL_NUMBERS.length
      const targetDeg = idx * segmentDeg
      
      // Spin 5 full rotations + target position
      const finalDeg = 360 * 5 + targetDeg
      setSpinDegrees(finalDeg)

      setTimeout(() => {
        setResult(data.result)
        updateBalance(data.balance)
        syncExperience(data)
        setSpinning(false)

        if (data.win) {
          toast.success(`🎉 You win! ${data.result.number} (${data.result.color})`)
        } else {
          toast.error(`😢 You lose. ${data.result.number} (${data.result.color})`)
        }
      }, 3000) // Match animation duration
    } catch (err) {
      setSpinning(false)
      // Error toast handled by useApi
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-green-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎡 Roulette</h1>
          <p className="text-gray-300">Spin the wheel, pick your destiny!</p>
          <div className="mt-4 text-xl text-yellow-400">Balance: {balance} coins</div>
        </div>

        {/* Wheel */}
        <div className="flex justify-center mb-8">
        <div className="relative w-64 h-64">
          {/* Wheel SVG */}
          <svg
            viewBox="0 0 200 200"
            className={`w-full h-full ${spinning ? 'animate-wheel-spin' : ''}`}
            style={{
              transform: `rotate(${spinDegrees}deg)`,
              transition: spinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
            }}
          >
            {WHEEL_NUMBERS.map((num, idx) => {
              const angle = (idx * 360) / WHEEL_NUMBERS.length
              const color = getColor(num)
              const fillColor = color === 'green' ? '#10b981' : color === 'red' ? '#ef4444' : '#1f2937'
              
              return (
                <g key={idx} transform={`rotate(${angle} 100 100)`}>
                  <path
                    d="M 100 100 L 100 10 A 90 90 0 0 1 109.7 10.5 Z"
                    fill={fillColor}
                    stroke="white"
                    strokeWidth="0.5"
                  />
                  <text
                    x="100"
                    y="25"
                    textAnchor="middle"
                    fill="white"
                    fontSize="8"
                    fontWeight="bold"
                  >
                    {num}
                  </text>
                </g>
              )
            })}
            {/* Center circle */}
            <circle cx="100" cy="100" r="20" fill="#fbbf24" stroke="white" strokeWidth="2" />
          </svg>

          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-yellow-400" />
          </div>
        </div>
      </div>

        {/* Result */}
        {result && !spinning && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
            <div className={`text-center p-6 rounded-lg ${result.payout > 0 ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
              <p className="text-white text-lg font-semibold mb-2">
                {result.payout > 0 ? '🎉 YOU WON!' : '😢 YOU LOST'}
              </p>
              <div className="text-6xl font-bold mb-2">
                <span className={`${result.color === 'red' ? 'text-red-500' : result.color === 'black' ? 'text-white' : 'text-green-400'}`}>
                  {result.number}
                </span>
              </div>
              <p className="text-white text-xl font-semibold">
                {result.color.toUpperCase()}
              </p>
              <p className="text-white text-3xl font-bold mt-4">
                {result.payout > 0 ? `+${result.payout}` : `-${betAmount}`} coins
              </p>
            </div>
          </div>
        )}

        {/* Betting Form */}
        <form onSubmit={handleSpin} className="space-y-6">
          {/* Bet Amount */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <label className="block text-white font-semibold mb-2">Bet Amount:</label>
            <input
              type="number"
              min="5"
              value={betAmount}
              onChange={(e) => setBetAmount(+e.target.value)}
              className="w-full px-4 py-3 rounded bg-white/20 text-white text-lg font-bold border-2 border-white/30"
              disabled={spinning}
            />
          </div>

          {/* Bet Type */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <label className="block text-white font-semibold mb-4">Bet Type:</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => { setBetType('zero'); setBetValue('0') }}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${betType === 'zero' ? 'bg-green-500/30 border-green-400 ring-2 ring-green-400' : 'bg-white/10 border-white/30 hover:border-white/50'}`}
                disabled={spinning}
              >
                <div className="text-white font-bold">Zero</div>
                <div className="text-green-400 text-sm">16x</div>
              </button>
              <button
                type="button"
                onClick={() => { setBetType('color'); setBetValue('red') }}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${betType === 'color' ? 'bg-red-500/30 border-red-400 ring-2 ring-red-400' : 'bg-white/10 border-white/30 hover:border-white/50'}`}
                disabled={spinning}
              >
                <div className="text-white font-bold">Color</div>
                <div className="text-red-400 text-sm">2x</div>
              </button>
              <button
                type="button"
                onClick={() => { setBetType('range'); setBetValue('1-9') }}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${betType === 'range' ? 'bg-blue-500/30 border-blue-400 ring-2 ring-blue-400' : 'bg-white/10 border-white/30 hover:border-white/50'}`}
                disabled={spinning}
              >
                <div className="text-white font-bold">Range</div>
                <div className="text-blue-400 text-sm">4x</div>
              </button>
              <button
                type="button"
                onClick={() => { setBetType('number'); setBetValue('7') }}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${betType === 'number' ? 'bg-purple-500/30 border-purple-400 ring-2 ring-purple-400' : 'bg-white/10 border-white/30 hover:border-white/50'}`}
                disabled={spinning}
              >
                <div className="text-white font-bold">Number</div>
                <div className="text-purple-400 text-sm">36x</div>
              </button>
            </div>
          </div>

          {/* Bet Value Selection */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <label className="block text-white font-semibold mb-4">Select Your Bet:</label>
            
            {betType === 'color' && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setBetValue('red')}
                  className={`px-6 py-8 rounded-lg border-2 transition-all ${betValue === 'red' ? 'bg-red-500 border-red-400 ring-2 ring-red-400' : 'bg-red-500/30 border-red-400'}`}
                  disabled={spinning}
                >
                  <div className="text-white font-bold text-2xl">RED</div>
                </button>
                <button
                  type="button"
                  onClick={() => setBetValue('black')}
                  className={`px-6 py-8 rounded-lg border-2 transition-all ${betValue === 'black' ? 'bg-gray-900 border-white ring-2 ring-white' : 'bg-gray-900/80 border-gray-600'}`}
                  disabled={spinning}
                >
                  <div className="text-white font-bold text-2xl">BLACK</div>
                </button>
              </div>
            )}

            {betType === 'range' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {RANGES.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setBetValue(r)}
                    className={`px-4 py-4 rounded-lg border-2 transition-all ${betValue === r ? 'bg-blue-500 border-blue-400 ring-2 ring-blue-400 text-white' : 'bg-white/10 border-white/30 text-white'}`}
                    disabled={spinning}
                  >
                    <div className="font-bold">{r}</div>
                  </button>
                ))}
              </div>
            )}

            {betType === 'number' && (
              <div>
                <input
                  type="number"
                  min="0"
                  max="36"
                  value={betValue}
                  onChange={(e) => setBetValue(e.target.value)}
                  className="w-full px-4 py-3 rounded bg-white/20 text-white text-lg font-bold border-2 border-white/30 mb-3"
                  placeholder="Enter number (0-36)"
                  disabled={spinning}
                />
                <div className="grid grid-cols-6 gap-1">
                  {[...Array(37)].map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setBetValue(String(i))}
                      className={`p-2 rounded border-2 text-sm font-bold ${
                        betValue === String(i) 
                          ? 'border-purple-400 bg-purple-500 text-white ring-2 ring-purple-400' 
                          : getColor(i) === 'red' 
                            ? 'bg-red-500/50 border-red-400 text-white' 
                            : getColor(i) === 'black'
                              ? 'bg-gray-900/80 border-gray-600 text-white'
                              : 'bg-green-500/50 border-green-400 text-white'
                      }`}
                      disabled={spinning}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {betType === 'zero' && (
              <div className="text-center p-8 rounded-lg bg-green-500/30 border-2 border-green-400">
                <div className="text-6xl font-bold text-green-400 mb-2">0</div>
                <div className="text-white text-lg">GREEN</div>
                <div className="text-green-400 text-xl font-bold mt-2">16x multiplier</div>
              </div>
            )}
          </div>

          {/* Spin Button */}
        <button
          type="submit"
          className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-yellow-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          disabled={spinning}
        >
          {spinning ? 'Spinning...' : 'SPIN'}
        </button>
      </form>
      </div>
    </div>
  )
}

export default RequireAuth(RoulettePage)