// client/src/app/game/coinflip/page.js
'use client'

import { useState } from 'react'
import useApi from '../../../hooks/useApi'
import { useUser } from '../../../context/UserContext'
import useExperienceSync from '@/hooks/useExperienceSync'
import { toast } from 'react-hot-toast'
import RequireAuth from '@/components/RequireAuth'

function CoinflipPage() {
  const [betAmount, setBetAmount] = useState(10)
  const [side, setSide] = useState('heads')
  const [result, setResult] = useState(null)
  const [isFlipping, setIsFlipping] = useState(false)

  const { post } = useApi()
  const { balance, updateBalance } = useUser()
  const syncExperience = useExperienceSync()

  const handleFlip = async (e) => {
    e.preventDefault()
    if (betAmount <= 0) {
      toast.error('Bet must be > 0')
      return
    }
    setIsFlipping(true)
    setResult(null)

    try {
      // Không gửi clientSeed — server vẫn chạy fair RNG với seed/nonce của nó
      const data = await post('/game/coinflip', { betAmount, side })

      setTimeout(() => {
        setResult({
          result: data.result,
          win: data.win,
          payout: data.payout,   // ✅ tin server
          balance: data.balance,
        })
        updateBalance(data.balance)
        syncExperience(data)
        setIsFlipping(false)

        if (data.win) {
          toast.success(`🎉 You win! The coin showed ${data.result}`)
        } else {
          toast.error(`😢 You lose. The coin showed ${data.result}`)
        }
      }, 1500)
    } catch (err) {
      toast.error(err.message || 'Flip failed')
      setIsFlipping(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🪙 Coinflip</h1>
          <p className="text-gray-300">Double-or-nothing! Pick heads or tails</p>
          <div className="mt-4 text-xl text-yellow-400">Balance: {balance} coins</div>
        </div>

        {/* Bet Amount */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
          <label className="block text-white font-semibold mb-2">Bet Amount:</label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="1"
              value={betAmount}
              onChange={(e) => setBetAmount(+e.target.value)}
              className="flex-1 px-4 py-3 rounded bg-white/20 text-white text-lg font-bold border-2 border-white/30"
              disabled={isFlipping}
            />
          </div>
        </div>

        {/* Side Selection */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
          <label className="block text-white font-semibold mb-4">Choose Your Side:</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSide('heads')}
              disabled={isFlipping}
              className={`p-6 rounded-lg border-4 transition-all ${
                side === 'heads'
                  ? 'bg-yellow-500/30 border-yellow-400 ring-4 ring-yellow-400/50'
                  : 'bg-white/10 border-white/30 hover:border-white/50'
              }`}
            >
              <div className="text-6xl mb-2">👑</div>
              <div className="text-white font-bold text-xl">HEADS</div>
            </button>
            <button
              onClick={() => setSide('tails')}
              disabled={isFlipping}
              className={`p-6 rounded-lg border-4 transition-all ${
                side === 'tails'
                  ? 'bg-yellow-500/30 border-yellow-400 ring-4 ring-yellow-400/50'
                  : 'bg-white/10 border-white/30 hover:border-white/50'
              }`}
            >
              <div className="text-6xl mb-2">⚡</div>
              <div className="text-white font-bold text-xl">TAILS</div>
            </button>
          </div>
          
          <button
            onClick={handleFlip}
            disabled={isFlipping}
            className="w-full mt-6 px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-bold text-xl"
          >
            {isFlipping ? 'FLIPPING...' : 'FLIP COIN'}
          </button>
        </div>

        {/* Coin Animation */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-6">
          <div className="flex flex-col items-center">
            <div
              className={`w-40 h-40 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 border-8 border-yellow-200 shadow-2xl flex items-center justify-center text-4xl font-bold text-white ${
                isFlipping ? 'animate-spin' : ''
              }`}
            >
              {isFlipping ? '?' : result?.result === 'heads' ? '👑' : result?.result === 'tails' ? '⚡' : '🪙'}
            </div>
            <div className="mt-4 text-white text-2xl font-bold">
              {isFlipping ? 'Flipping...' : result ? result.result.toUpperCase() : 'Ready to flip!'}
            </div>
          </div>
        </div>

        {/* Result */}
        {result && !isFlipping && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
            <div className={`text-center p-6 rounded-lg ${result.win ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
              <p className="text-white text-lg font-semibold mb-2">
                {result.win ? '🎉 YOU WON!' : '😢 YOU LOST'}
              </p>
              <p className="text-white text-4xl font-bold">
                {result.win ? `+${result.payout}` : `-${betAmount}`} coins
              </p>
              <p className="text-gray-200 text-sm mt-2">
                The coin landed on <strong>{result.result.toUpperCase()}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Payout Table */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h3 className="text-white font-bold text-lg mb-4">How to Play:</h3>
          <div className="space-y-2 text-gray-300 text-sm">
            <p>• Choose Heads (👑) or Tails (⚡)</p>
            <p>• Set your bet amount</p>
            <p>• Flip the coin!</p>
            <p>• Win <strong className="text-yellow-400">2x</strong> your bet if you guess correctly</p>
            <p>• <strong className="text-green-400">Provably Fair</strong> - Every flip is verifiable</p>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-500/20 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">Win Multiplier:</span>
              <span className="text-yellow-400 font-bold text-xl">2x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequireAuth(CoinflipPage)
