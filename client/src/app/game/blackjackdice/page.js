// client/src/app/game/blackjackdice/page.js
'use client'

import { useCallback, useEffect, useState } from 'react'
import useApi from '../../../hooks/useApi'
import { useUser } from '../../../context/UserContext'
import useExperienceSync from '@/hooks/useExperienceSync'
import RequireAuth from '../../../components/RequireAuth'
import Loading from '../../../components/Loading'
import { toast } from 'react-hot-toast'

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
const renderDice = (value) => DICE_FACES[value - 1] || value

function BlackjackDicePage() {
  const [betAmount, setBetAmount] = useState(10)
  const [state, setState] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasPendingGame, setHasPendingGame] = useState(false)
  const { post } = useApi()
  const { balance, updateBalance } = useUser()
  const syncExperience = useExperienceSync()
  
  const checkGame = useCallback(async () => {
    try {
      const data = await post('/game/blackjackdice/check')
      if (data.active) {
        setHasPendingGame(true)
        setState(data.state)
      }
    } catch (err) {
      console.error(err)
    }
  }, [post])

  useEffect(() => {
    void checkGame()
  }, [checkGame])

  const handleStart = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await post('/game/blackjackdice/start', { betAmount })
      setState({
        playerDice: data.playerDice,
        playerSum: data.playerSum,
        dealerVisible: data.dealerVisible,
        dealerDice: null,
        dealerSum: null,
        outcome: null,
        payout: null,
        balance: data.balance,
      })
      updateBalance(data.balance)
      setIsActive(true)
      setHasPendingGame(false)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResume = async () => {
    try {
      const data = await post('/game/blackjackdice/resume')
      setState({
        playerDice: data.playerDice,
        playerSum: data.playerSum,
        dealerVisible: data.dealerVisible,
        dealerDice: null,
        dealerSum: null,
        outcome: null,
        payout: null,
        balance: data.balance,
      })
      updateBalance(data.balance)
      setIsActive(true)
      setHasPendingGame(false)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleAbandon = async () => {
    try {
      await post('/game/blackjackdice/abandon')
      toast('Game abandoned')
      setHasPendingGame(false)
      setState(null)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleHit = async () => {
    setLoading(true)
    try {
      const data = await post('/game/blackjackdice/hit')
      if (data.outcome) {
        setState({
          ...state,
          playerDice: data.playerDice,
          playerSum: data.playerSum,
          dealerDice: data.dealerDice,
          dealerSum: data.dealerSum,
          outcome: data.outcome,
          payout: data.payout,
          balance: data.balance,
        })
  updateBalance(data.balance)
  syncExperience(data)
        setIsActive(false)
        if (data.outcome === 'win') toast.success(`🎉 You win! Payout: ${data.payout}`)
        else if (data.outcome === 'lose') toast.error('😢 You lose.')
        else if (data.outcome === 'tie') toast(`😐 It's a tie. Refund: ${data.payout}`, { icon: 'ℹ️' })
      } else {
        setState({
          ...state,
          playerDice: data.playerDice,
          playerSum: data.playerSum,
          dealerVisible: data.dealerVisible,
          balance: data.balance,
        })
        updateBalance(data.balance)
        syncExperience(data)
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStand = async () => {
    setLoading(true)
    try {
      const data = await post('/game/blackjackdice/stand')
      setState({
        ...state,
        playerDice: data.playerDice,
        playerSum: data.playerSum,
        dealerDice: data.dealerDice,
        dealerSum: data.dealerSum,
        outcome: data.outcome,
        payout: data.payout,
        balance: data.balance,
      })
  updateBalance(data.balance)
  syncExperience(data)
      setIsActive(false)
      if (data.outcome === 'win') toast.success(`🎉 You win! Payout: ${data.payout}`)
      else if (data.outcome === 'lose') toast.error('😢 You lose.')
      else if (data.outcome === 'tie') toast(`😐 It's a tie. Refund: ${data.payout}`, { icon: 'ℹ️' })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const dealerToShow = !isActive && state?.dealerDice
    ? state.dealerDice
    : state?.dealerVisible || []

  if (loading) return <Loading text="Loading Blackjack Dice..." />

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🃏 Blackjack Dice</h1>
          <p className="text-gray-300">Hit or stand — beat the dealer!</p>
          <div className="mt-4 text-xl text-yellow-400">Balance: {balance} coins</div>
        </div>

        {/* Start Game Form */}
        {!isActive && !hasPendingGame && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
            <form onSubmit={handleStart} className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Bet Amount:</label>
                <input
                  type="number"
                  min="1"
                  value={betAmount}
                  onChange={(e) => setBetAmount(+e.target.value)}
                  className="w-full px-4 py-3 rounded bg-white/20 text-white text-lg font-bold border-2 border-white/30"
                />
              </div>
              <button type="submit" className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white rounded-lg font-bold text-xl">
                START GAME
              </button>
            </form>
          </div>
        )}

        {/* Resume/Abandon Pending Game */}
        {!isActive && hasPendingGame && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
            <div className="text-white text-center mb-4">
              <p className="text-xl font-semibold">⚠️ You have a pending game!</p>
              <p className="text-gray-300 mt-2">Continue your game or abandon it to start a new one.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleResume} className="px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg">
                CONTINUE
              </button>
              <button onClick={handleAbandon} className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-lg">
                ABANDON
              </button>
            </div>
          </div>
        )}

        {/* Game State */}
        {state && (
          <div className="space-y-6">
            {/* Player Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white text-xl font-bold">👤 YOUR HAND</h2>
                <div className="text-2xl font-bold text-green-400">Sum: {state.playerSum}</div>
              </div>
              <div className="flex gap-3 flex-wrap">
                {state.playerDice.map((d, i) => (
                  <div key={i} className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-5xl font-bold shadow-lg">
                    {renderDice(d)}
                  </div>
                ))}
              </div>
            </div>

            {/* Dealer Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white text-xl font-bold">🎰 DEALER HAND</h2>
                {!isActive && state.dealerSum != null && (
                  <div className="text-2xl font-bold text-red-400">Sum: {state.dealerSum}</div>
                )}
              </div>
              <div className="flex gap-3 flex-wrap">
                {dealerToShow.map((d, i) => (
                  <div
                    key={i}
                    className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center text-5xl font-bold text-white shadow-lg border-2 border-gray-600"
                  >
                    {d === null ? '❓' : renderDice(d)}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            {isActive && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={handleHit} className="px-8 py-6 bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white rounded-lg font-bold text-xl">
                    🎲 HIT
                  </button>
                  <button onClick={handleStand} className="px-8 py-6 bg-gradient-to-br from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-white rounded-lg font-bold text-xl">
                    ✋ STAND
                  </button>
                </div>
              </div>
            )}

            {/* Outcome Display */}
            {!isActive && state.outcome && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div className={`text-center p-6 rounded-lg ${state.outcome === 'win' ? 'bg-green-500/30' : state.outcome === 'lose' ? 'bg-red-500/30' : 'bg-gray-500/30'}`}>
                  <p className="text-white text-2xl font-bold mb-2">
                    {state.outcome === 'win' ? '🎉 YOU WIN!' : state.outcome === 'lose' ? '😢 YOU LOSE' : '🤝 TIE'}
                  </p>
                  <p className="text-white text-4xl font-bold">
                    {state.outcome === 'win' ? `+${state.payout}` : state.outcome === 'lose' ? `-${betAmount}` : `${state.payout}`} coins
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rules */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mt-6">
          <h3 className="text-white font-bold text-lg mb-4">📖 Rules:</h3>
          <div className="text-gray-300 space-y-2">
            <p>• Roll dice to get as close to <strong className="text-yellow-400">21</strong> as possible without going over</p>
            <p>• <strong className="text-green-400">Hit</strong>: Roll another die and add to your total</p>
            <p>• <strong className="text-yellow-400">Stand</strong>: Keep your current total and let dealer play</p>
            <p>• Dealer must hit until reaching <strong>17 or higher</strong></p>
            <p>• Win by getting closer to 21 than the dealer without busting!</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequireAuth(BlackjackDicePage)
