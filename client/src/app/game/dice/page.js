// client/src/app/game/dice/page.js
'use client'

import { useState } from 'react'
import useApi from '../../../hooks/useApi'
import { useUser } from '../../../context/UserContext'
import useExperienceSync from '@/hooks/useExperienceSync'
import { toast } from 'react-hot-toast'
import RequireAuth from '@/components/RequireAuth'

const ALLOWED_SIDES = [4, 6, 8, 10, 12, 20]
const MULTIPLIERS = { 4: 2, 6: 3, 8: 4, 10: 5, 12: 6, 20: 10 }
const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

function DicePage() {
  const [betAmount, setBetAmount] = useState(10)
  const [sides, setSides] = useState(6)
  const [guess, setGuess] = useState(3)
  const [result, setResult] = useState(null)
  const [isRolling, setIsRolling] = useState(false)
  const { post } = useApi()
  const { balance, updateBalance } = useUser()
  const syncExperience = useExperienceSync()

  const handleRoll = async () => {
    if (betAmount <= 0) return toast.error('Bet must be > 0')
    if (guess < 1 || guess > sides) return toast.error(`Guess must be 1..${sides}`)

    setIsRolling(true)
    setResult(null)

    setTimeout(async () => {
      try {
        const data = await post('/game/dice', { betAmount, sides, guess })
        setResult({
          result: data.result,
          win: data.win,
          payout: data.payout,
          balance: data.balance,
          sides: data.sides,
        })
        updateBalance(data.balance)
        syncExperience(data)
        data.win
          ? toast.success(`🎉 You win! Rolled ${data.result} on d${data.sides}`)
          : toast.error(`😢 You lose. Rolled ${data.result} on d${data.sides}`)
      } catch (err) {
        toast.error(err.message || 'Roll failed')
      } finally {
        setIsRolling(false)
      }
    }, 1000)
  }

  const renderDice = (value) => {
    if (sides === 6 && value >= 1 && value <= 6) {
      return DICE_FACES[value - 1]
    }
    return value
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎲 Dice Game</h1>
          <p className="text-gray-300">Roll to match — simple odds, quick rounds!</p>
          <div className="mt-4 text-xl text-yellow-400">Balance: {balance} coins</div>
        </div>

        {/* Bet Amount */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
          <label className="block text-white font-semibold mb-2">Bet Amount:</label>
          <input
            type="number"
            min="1"
            value={betAmount}
            onChange={(e) => setBetAmount(+e.target.value)}
            className="w-full px-4 py-3 rounded bg-white/20 text-white text-lg font-bold border-2 border-white/30"
            disabled={isRolling}
          />
        </div>

        {/* Dice Type Selection */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
          <label className="block text-white font-semibold mb-4">Choose Dice Type:</label>
          <div className="grid grid-cols-3 gap-3">
            {ALLOWED_SIDES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSides(s)
                  if (guess > s) setGuess(1)
                }}
                disabled={isRolling}
                className={`p-4 rounded-lg border-2 transition-all ${
                  sides === s
                    ? 'bg-cyan-500/30 border-cyan-400 ring-2 ring-cyan-400'
                    : 'bg-white/10 border-white/30 hover:border-white/50'
                }`}
              >
                <div className="text-white font-bold text-xl">d{s}</div>
                <div className="text-cyan-400 text-sm">{MULTIPLIERS[s]}x</div>
              </button>
            ))}
          </div>
        </div>

        {/* Guess Input */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
          <label className="block text-white font-semibold mb-2">Your Guess (1 - {sides}):</label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="1"
              max={sides}
              value={guess}
              onChange={(e) => setGuess(+e.target.value)}
              className="flex-1 px-4 py-3 rounded bg-white/20 text-white text-lg font-bold border-2 border-white/30"
              disabled={isRolling}
            />
            <button
              onClick={handleRoll}
              disabled={isRolling}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-bold text-lg"
            >
              {isRolling ? 'ROLLING...' : 'ROLL DICE'}
            </button>
          </div>
        </div>

        {/* Dice Display */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-6">
          <div className="flex flex-col items-center">
            <div
              className={`w-32 h-32 bg-white rounded-xl shadow-2xl flex items-center justify-center text-7xl font-bold border-4 border-gray-300 ${
                isRolling ? 'animate-bounce' : ''
              }`}
            >
              {isRolling ? '?' : result ? renderDice(result.result) : '🎲'}
            </div>
            <div className="mt-4 text-white text-2xl font-bold">
              {isRolling ? 'Rolling...' : result ? `Rolled: ${result.result}` : 'Ready to roll!'}
            </div>
          </div>
        </div>

        {/* Result */}
        {result && !isRolling && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
            <div className={`text-center p-6 rounded-lg ${result.win ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
              <p className="text-white text-lg font-semibold mb-2">
                {result.win ? '🎉 YOU WON!' : '😢 YOU LOST'}
              </p>
              <p className="text-white text-4xl font-bold">
                {result.win ? `+${result.payout}` : `-${betAmount}`} coins
              </p>
              <p className="text-gray-200 text-sm mt-2">
                You guessed <strong>{guess}</strong> and rolled <strong>{result.result}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Multiplier Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-white font-bold text-lg mb-4">Win Multipliers:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ALLOWED_SIDES.map((s) => (
              <div
                key={s}
                className={`p-4 rounded-lg ${
                  sides === s ? 'bg-cyan-500/30 ring-2 ring-cyan-400' : 'bg-white/5'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">d{s}</span>
                  <span className="text-cyan-400 font-bold">{MULTIPLIERS[s]}x</span>
                </div>
                <div className="text-gray-300 text-xs mt-1">1 in {s} chance</div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-sm text-gray-300 space-y-2">
            <p>• Choose your dice type (d4 to d20)</p>
            <p>• Pick a number to guess</p>
            <p>• Match the roll to win!</p>
            <p>• Higher dice = higher multiplier but lower chance</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequireAuth(DicePage)
