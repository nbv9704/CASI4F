// client/src/app/wallet/page.js
'use client'

import RequireAuth from '@/components/RequireAuth'
import { useState, useEffect, useMemo, useCallback } from 'react'
import useApi from '../../hooks/useApi'
import { useUser } from '../../context/UserContext'
import Loading from '../../components/Loading'
import { toast } from 'react-hot-toast'
import { useLocale } from '../../context/LocaleContext'
import {
	ArrowLeftRight,
	ArrowDownRight,
	ArrowUpRight,
	Home,
	Landmark,
	Loader2,
	PiggyBank,
	Send,
	Wallet2,
	History as HistoryIcon,
} from 'lucide-react'

function WalletPage() {
	const { user, balance, bank, updateBalance, updateBank } = useUser()
	const { post, get } = useApi()
	const { t, locale } = useLocale()

	const [activeTab, setActiveTab] = useState('account')
	const [toId, setToId] = useState('')
	const [transferAmt, setTransferAmt] = useState('')
	const [depositAmt, setDepositAmt] = useState('')
	const [withdrawAmt, setWithdrawAmt] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [transactions, setTransactions] = useState([])
	const [historyLoading, setHistoryLoading] = useState(false)
	const [page, setPage] = useState(1)
	const pageSize = 5

	useEffect(() => {
		if (!user || activeTab !== 'transaction') return

		setHistoryLoading(true)
		get(`/wallet/${user.id}/transactions`)
			.then(async (res) => {
				const enriched = await Promise.all(
					(res.transactions || []).map(async (tx) => {
						if (tx.type !== 'transfer') return tx
						if (tx.toUserId) {
							const toUser = await get(`/user/${tx.toUserId}`)
							return { ...tx, toUsername: toUser.username }
						}
						if (tx.fromUserId) {
							const fromUser = await get(`/user/${tx.fromUserId}`)
							return { ...tx, fromUsername: fromUser.username }
						}
						return tx
					})
				)
				setTransactions(enriched)
			})
			.catch((err) => toast.error(err.message))
			.finally(() => setHistoryLoading(false))
	}, [activeTab, get, user])

	useEffect(() => {
		setPage(1)
	}, [transactions])

	const formatCurrency = useCallback(
		(value) => {
			const numeric = typeof value === 'number' ? value : Number(value)
			if (Number.isFinite(numeric)) {
				return numeric.toLocaleString(locale)
			}
			return value || '0'
		},
		[locale]
	)

	if (!user) return <Loading text={t('common.loginRequiredWallet')} />

	const handleTransfer = async (e) => {
		e.preventDefault()
		const amountValue = Number(transferAmt)
		if (!toId.trim() || amountValue <= 0) {
			toast.error(t('wallet.transfer.validation'))
			return
		}

		setSubmitting(true)
		try {
			const target = await get(`/user/${toId}`)
			const formattedAmount = formatCurrency(amountValue)
			if (
				!window.confirm(
					t('wallet.transfer.confirm', {
						amount: formattedAmount,
						username: target.username,
					})
				)
			) {
				return
			}
			const res = await post(`/wallet/${user.id}/transfer`, {
				toUserId: toId,
				amount: amountValue,
			})
			updateBalance(res.fromBalance)
			toast.success(
				t('wallet.toast.transferSuccess', {
					amount: formattedAmount,
					username: target.username,
				})
			)
			setToId('')
			setTransferAmt('')
			setActiveTab('transaction')
		} catch (err) {
			toast.error(err.message)
		} finally {
			setSubmitting(false)
		}
	}

	const handleDeposit = async (e) => {
		e.preventDefault()
		const amountValue = Number(depositAmt)
		if (amountValue <= 0) {
			toast.error(t('wallet.bank.validation'))
			return
		}

		setSubmitting(true)
		try {
			const res = await post(`/wallet/${user.id}/bank/deposit`, {
				amount: amountValue,
			})
			updateBalance(res.balance)
			updateBank(res.bank)
			toast.success(
				t('wallet.bank.deposit.toastSuccess', {
					amount: formatCurrency(amountValue),
				})
			)
			setDepositAmt('')
			setActiveTab('transaction')
		} catch (err) {
			toast.error(err.message)
		} finally {
			setSubmitting(false)
		}
	}

	const handleWithdraw = async (e) => {
		e.preventDefault()
		const amountValue = Number(withdrawAmt)
		if (amountValue <= 0) {
			toast.error(t('wallet.bank.validation'))
			return
		}

		setSubmitting(true)
		try {
			const res = await post(`/wallet/${user.id}/bank/withdraw`, {
				amount: amountValue,
			})
			updateBalance(res.balance)
			updateBank(res.bank)
			toast.success(
				t('wallet.bank.withdraw.toastSuccess', {
					amount: formatCurrency(amountValue),
				})
			)
			setWithdrawAmt('')
			setActiveTab('transaction')
		} catch (err) {
			toast.error(err.message)
		} finally {
			setSubmitting(false)
		}
	}

	const startIdx = (page - 1) * pageSize
	const pagedTxs = useMemo(
		() => transactions.slice(startIdx, startIdx + pageSize),
		[transactions, startIdx, pageSize]
	)
	const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize))

	const renderTabButton = (value, label, icon) => (
		<button
			type="button"
			onClick={() => setActiveTab(value)}
			className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-400/40 ${
				activeTab === value
					? 'bg-white/90 text-slate-900 shadow-lg shadow-blue-500/20'
					: 'bg-white/10 text-white/70 hover:bg-white/20'
			}`}
		>
			{icon}
			<span>{label}</span>
		</button>
	)

	const transactionSummary = useMemo(() => {
		return pagedTxs.map((tx) => {
			if (tx.type === 'deposit') {
				return {
					title: t('wallet.summary.depositTitle'),
					subtitle: t('wallet.summary.depositSubtitle'),
					badge: `-${formatCurrency(tx.amount)} ${t('common.coins')}`,
					tone: 'emerald',
					icon: ArrowDownRight,
				}
			}
			if (tx.type === 'withdraw') {
				return {
					title: t('wallet.summary.withdrawTitle'),
					subtitle: t('wallet.summary.withdrawSubtitle'),
					badge: `+${formatCurrency(tx.amount)} ${t('common.coins')}`,
					tone: 'amber',
					icon: ArrowUpRight,
				}
			}
			if (tx.type === 'transfer') {
				if (tx.toUsername) {
					return {
						title: t('wallet.summary.transferOutTitle', { username: tx.toUsername }),
						subtitle: t('wallet.summary.transferOutSubtitle'),
						badge: `-${formatCurrency(tx.amount)} ${t('common.coins')}`,
						tone: 'blue',
						icon: Send,
					}
				}
				if (tx.fromUsername) {
					return {
						title: t('wallet.summary.transferInTitle', { username: tx.fromUsername }),
						subtitle: t('wallet.summary.transferInSubtitle'),
						badge: `+${formatCurrency(tx.amount)} ${t('common.coins')}`,
						tone: 'blue',
						icon: ArrowDownRight,
					}
				}
			}
			return {
				title: t('wallet.summary.genericTitle'),
				subtitle: tx.type,
				badge: `${formatCurrency(tx.amount)} ${t('common.coins')}`,
				tone: 'slate',
				icon: HistoryIcon,
			}
		})
	}, [formatCurrency, pagedTxs, t])

	return (
		<div className="space-y-8">
			<section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8 text-white shadow-2xl">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_55%)]" />
				<div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
					<div>
						<p className="text-sm uppercase tracking-[0.2em] text-blue-200">{t('wallet.header.accent')}</p>
						<h1 className="mt-2 text-3xl font-bold md:text-4xl">{t('wallet.header.title')}</h1>
						<p className="mt-3 text-sm text-blue-100/80">{t('wallet.header.subtitle')}</p>
					</div>

				<div className="grid gap-3 sm:grid-cols-2">
					<div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
						<Wallet2 className="h-8 w-8 text-emerald-300" />
						<div>
							<p className="text-xs uppercase tracking-wide text-white/70">
								{t('settings.balance.wallet')}
							</p>
							<p className="text-lg font-semibold" suppressHydrationWarning>
								{formatCurrency(balance)}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
						<PiggyBank className="h-8 w-8 text-amber-300" />
						<div>
							<p className="text-xs uppercase tracking-wide text-white/70">
								{t('settings.balance.bank')}
							</p>
							<p className="text-lg font-semibold" suppressHydrationWarning>
								{formatCurrency(bank)}
							</p>
						</div>
					</div>
				</div>
				</div>

				<div className="relative z-10 mt-6 flex flex-wrap gap-3">
					{renderTabButton('account', t('wallet.tabs.transfer'), <ArrowLeftRight className="h-4 w-4" />)}
					{renderTabButton('transaction', t('wallet.tabs.history'), <HistoryIcon className="h-4 w-4" />)}
					{renderTabButton('bank', t('wallet.tabs.bank'), <Landmark className="h-4 w-4" />)}
				</div>
			</section>

			{activeTab === 'account' && (
				<section className="rounded-3xl border border-white/5 bg-slate-900/70 p-8 shadow-xl backdrop-blur">
					<div className="flex items-center gap-3 text-sm font-semibold text-gray-200">
						<Send className="h-5 w-5 text-blue-300" />
						<span>{t('wallet.transfer.title')}</span>
					</div>
					<p className="mt-2 text-sm text-white/60">{t('wallet.transfer.description')}</p>

					<form onSubmit={handleTransfer} className="mt-6 grid gap-4 sm:grid-cols-2">
						<div className="space-y-2 sm:col-span-2">
							<label className="text-xs font-semibold uppercase tracking-wide text-white/60">
								{t('wallet.transfer.receiverLabel')}
							</label>
							<input
								type="text"
								value={toId}
								onChange={(e) => setToId(e.target.value)}
								className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/40 focus:outline-none transition"
								placeholder="652b3d..."
								required
							/>
						</div>

						<div className="space-y-2">
							<label className="text-xs font-semibold uppercase tracking-wide text-white/60">
								{t('wallet.transfer.amountLabel')}
							</label>
							<input
								type="number"
								min="1"
								value={transferAmt}
								onChange={(e) => setTransferAmt(e.target.value)}
								className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/40 focus:outline-none transition"
								placeholder={t('wallet.transfer.amountLabel')}
								required
							/>
						</div>

						<div className="flex items-end justify-end sm:col-span-2">
							<button
								type="submit"
								disabled={submitting}
								className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
							>
								{submitting ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										<span>{t('wallet.transfer.submitting')}</span>
									</>
								) : (
									<>
										<ArrowLeftRight className="h-4 w-4" />
										<span>{t('wallet.transfer.submit')}</span>
									</>
								)}
							</button>
						</div>
					</form>
				</section>
			)}

			{activeTab === 'bank' && (
				<section className="rounded-3xl border border-white/5 bg-slate-900/70 p-8 shadow-xl backdrop-blur">
					<div className="flex items-center gap-3 text-sm font-semibold text-gray-200">
						<Landmark className="h-5 w-5 text-amber-300" />
						<span>{t('wallet.bank.title')}</span>
					</div>
					<p className="mt-2 text-sm text-white/60">{t('wallet.bank.description')}</p>

					<div className="mt-6 grid gap-6 md:grid-cols-2">
						<div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
							<h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-200">
								<ArrowDownRight className="h-5 w-5" />
								{t('wallet.bank.deposit.title')}
							</h3>
							<p className="mt-1 text-sm text-emerald-100/80">{t('wallet.bank.deposit.description')}</p>
							<form onSubmit={handleDeposit} className="mt-4 space-y-3">
								<input
									type="number"
									min="1"
									value={depositAmt}
									onChange={(e) => setDepositAmt(e.target.value)}
									className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:border-white/70 focus:ring-2 focus:ring-white/40 focus:outline-none transition"
									placeholder={t('wallet.bank.deposit.placeholder')}
									required
								/>
								<button
									type="submit"
									disabled={submitting}
									className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-5 py-3 text-sm font-semibold text-emerald-700 shadow-lg shadow-emerald-500/30 transition hover:bg-white"
								>
									{submitting ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											<span>{t('wallet.bank.deposit.submitting')}</span>
										</>
									) : (
										<>
											<ArrowDownRight className="h-4 w-4" />
											<span>{t('wallet.bank.deposit.submit')}</span>
										</>
									)}
								</button>
							</form>
						</div>

						<div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-6">
							<h3 className="flex items-center gap-2 text-lg font-semibold text-sky-200">
								<ArrowUpRight className="h-5 w-5" />
								{t('wallet.bank.withdraw.title')}
							</h3>
							<p className="mt-1 text-sm text-sky-100/80">{t('wallet.bank.withdraw.description')}</p>
							<form onSubmit={handleWithdraw} className="mt-4 space-y-3">
								<input
									type="number"
									min="1"
									value={withdrawAmt}
									onChange={(e) => setWithdrawAmt(e.target.value)}
									className="w-full rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/60 focus:border-white/70 focus:ring-2 focus:ring-white/40 focus:outline-none transition"
									placeholder={t('wallet.bank.withdraw.placeholder')}
									required
								/>
								<button
									type="submit"
									disabled={submitting}
									className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-5 py-3 text-sm font-semibold text-sky-700 shadow-lg shadow-sky-500/30 transition hover:bg-white"
								>
									{submitting ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											<span>{t('wallet.bank.withdraw.submitting')}</span>
										</>
									) : (
										<>
											<ArrowUpRight className="h-4 w-4" />
											<span>{t('wallet.bank.withdraw.submit')}</span>
										</>
									)}
								</button>
							</form>
						</div>
					</div>
				</section>
			)}

			{activeTab === 'transaction' && (
				<section className="rounded-3xl border border-white/5 bg-slate-900/70 p-8 shadow-xl backdrop-blur">
					<div className="flex items-center gap-3 text-sm font-semibold text-gray-200">
						<Home className="h-5 w-5 text-blue-300" />
						<span>{t('wallet.history.title')}</span>
					</div>
					<p className="mt-2 text-sm text-white/60">
						{t('wallet.history.subtitle', { count: transactions.length, page, total: totalPages })}
					</p>

					{historyLoading ? (
						<div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/70">
							<Loading text={t('wallet.history.loading')} />
						</div>
					) : pagedTxs.length === 0 ? (
						<div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-white/5 p-12 text-center text-white/60">
							{t('wallet.history.empty')}
						</div>
					) : (
						<div className="mt-6 space-y-4">
							{pagedTxs.map((tx, index) => {
								const summary = transactionSummary[index]
								const BadgeIcon = summary.icon
								return (
									<article
										key={tx._id || tx.id}
										className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-white shadow-inner"
									>
										<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
											<div className="flex items-start gap-3">
												<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
													<BadgeIcon className="h-5 w-5" />
												</span>
												<div>
													<p className="text-base font-semibold">{summary.title}</p>
													<p className="text-sm text-white/60">{summary.subtitle}</p>
												</div>
											</div>
											<span
												className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${
													summary.tone === 'emerald'
														? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
														: summary.tone === 'amber'
														? 'border-amber-400/40 bg-amber-400/10 text-amber-200'
														: summary.tone === 'blue'
														? 'border-blue-400/40 bg-blue-400/10 text-blue-200'
														: 'border-slate-400/40 bg-slate-400/10 text-slate-200'
												}`}
											>
												{summary.badge}
											</span>
										</div>
										<div className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/40">
											{new Date(tx.createdAt).toLocaleString(locale, { hour12: false })}
										</div>
									</article>
								)
							})}
						</div>
					)}

					{transactions.length > 0 && (
						<div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 sm:flex-row">
							<button
								type="button"
								onClick={() => setPage((p) => Math.max(p - 1, 1))}
								disabled={page === 1}
								className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{t('wallet.history.prev')}
							</button>
							<span>
								{t('wallet.history.paginationLabel', { page, total: totalPages })}
							</span>
							<button
								type="button"
								onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
								disabled={page >= totalPages}
								className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{t('wallet.history.next')}
							</button>
						</div>
					)}
				</section>
			)}
		</div>
	)
}

export default RequireAuth(WalletPage)
