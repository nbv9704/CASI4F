'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ShieldCheck, Sparkles, History, Menu, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

import { useLocale } from '@/context/LocaleContext'
import useApi from '@/hooks/useApi'

const CHECK_FORM_DEFAULT = Object.freeze({
  serverSeed: '',
  clientSeed: '',
  nonce: '',
})

const hmacKeyCache = new Map()

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, '0')).join('')
}

async function sha256Hex(value) {
  if (!globalThis.crypto?.subtle) throw new Error('CRYPTO_UNAVAILABLE')
  const encoder = new TextEncoder()
  const data = encoder.encode(String(value))
  const digest = await crypto.subtle.digest('SHA-256', data)
  return bufferToHex(digest)
}

async function hmacSha256Hex(key, message) {
  if (!globalThis.crypto?.subtle) throw new Error('CRYPTO_UNAVAILABLE')
  const encoder = new TextEncoder()
  const secret = String(key)
  const payload = String(message)

  let cryptoKey = hmacKeyCache.get(secret)
  if (!cryptoKey) {
    cryptoKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: { name: 'SHA-256' } },
      false,
      ['sign'],
    )
    hmacKeyCache.set(secret, cryptoKey)
  }

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(payload))
  return bufferToHex(signature)
}

function formatFloat(value) {
  const fixed = value.toFixed(10)
  const trimmed = fixed.replace(/0+$/, '').replace(/\.$/, '')
  return trimmed.length ? trimmed : '0'
}

function formatPercentile(value) {
  const pct = Math.floor(value * 10000) / 100
  return pct.toFixed(2)
}

const CONTENT = {
  en: {
    hero: {
      eyebrow: 'Provably Fair',
      badge: 'Transparency Lab',
      title: 'Proving every CASI4F result is fair',
      description:
        'CASI4F uses a dual-seed SHA-256 hashing system to guarantee that every spin, match-up, and roll is created with verifiable randomness. Review how seeds are generated, how their hashes are exposed, and how you can replay any outcome independently.',
    },
    nav: ['Seed settings', 'Check roll', 'Fairness FAQ'],
    seedsTitle: 'Current seed state',
    tableHeaders: {
      type: 'Type',
      value: 'Value',
      actions: 'Actions',
    },
    rows: {
      clientSeed: 'Client seed',
      serverSeedActive: 'Active server seed',
      serverSeedHash: 'Server seed hash (commit)',
      lastServerSeed: 'Last revealed server seed',
      lastServerSeedEmpty: 'Rotate to reveal the previous server seed.',
      hashLabel: 'Hash',
      nonce: 'Nonce',
    },
    hiddenServerSeed: 'Hidden until rotation',
    seedsHint:
      'Reveal the previous server seed whenever you rotate to a new pair. Use the hash commit and nonce log to recompute every wager independently.',
    actions: {
      copy: 'Copy',
      copyHash: 'Copy hash',
      refresh: 'Refresh',
      refreshing: 'Refreshing...',
      rotateServerSeed: 'Reveal & rotate',
      rotating: 'Rotating...',
      changeClientSeed: 'Change client seed',
      updatingClientSeed: 'Updating...',
    },
    messages: {
      fetchError: 'Unable to load provably fair data. Please refresh.',
      rotated: 'Server seed rotated. The previous seed is now revealed.',
      clientSeedUpdated: 'Client seed updated successfully.',
      copied: 'Copied to clipboard.',
      copyFailed: 'Clipboard is not available on this device.',
      promptClientSeed: 'Enter a new client seed (min 3 characters):',
      invalidClientSeed: 'Client seed must be at least 3 characters.',
    },
    timestamps: {
      clientSeedUpdated: 'Client seed updated',
      serverSeedRotated: 'Server seed rotated',
      lastReveal: 'Last server seed revealed',
      notAvailable: 'Not available',
    },
    checklist: [
      {
        icon: ShieldCheck,
        title: 'Tamper-proof randomness',
        description:
          'Every match combines your client seed with our encrypted server seed. Once a seed pair is used, the server seed is published so you can verify the outcome independently.',
      },
      {
        icon: Sparkles,
        title: 'Change seeds any time',
        description:
          'Rotate your personal client seed before a roll or match to generate a brand-new sequence. Previous seeds remain available so you can audit historical games later.',
      },
      {
        icon: History,
        title: 'Audit past rolls',
        description:
          'Use the check-roll tool to replay any nonce. Paste the revealed server seed, your client seed, and the nonce to confirm we calculated the same result you saw in-game.',
      },
    ],
    checkRoll: {
      title: 'Check a roll yourself',
      subtitle:
        'Recreate a finished wager by combining the revealed server seed with your client seed and the nonce that was consumed.',
      helper: 'The nonce increases after every bet while the seed pair stays active.',
      fields: {
        serverSeed: 'Revealed server seed',
        clientSeed: 'Client seed',
        nonce: 'Nonce',
      },
      buttons: {
        run: 'Run check',
        running: 'Checking...',
        fill: 'Use revealed seed',
        clear: 'Clear',
      },
      messages: {
        missingFields: 'Enter the revealed server seed, client seed, and nonce.',
        invalidNonce: 'Nonce must be a whole number (0, 1, 2 ...).',
        cryptoUnavailable: 'Your browser does not support the verification tool (WebCrypto API missing).',
        noReveal: 'Rotate your seeds to reveal the previous server seed, then try again.',
        prefilled: 'Form prefilled with your last revealed server seed.',
      },
      results: {
        heading: 'Result breakdown',
        commit: 'Server seed hash (commit)',
        commitNote: 'Match this with the hash you saw before the game.',
        hmac: 'HMAC result',
        hmacNote: 'HMAC-SHA256(serverSeed, `${clientSeed}:${nonce}`)',
        firstBytes: 'First 4 bytes',
        firstBytesNote: 'Interpreted as 32-bit integer: {value}',
        float: 'Random float (0-1)',
        floatNote: 'Used to derive all in-game outcomes.',
        coinflip: 'Coin flip',
        coinHeads: 'Heads',
        coinTails: 'Tails',
        dice: 'Dice roll (1-6)',
        percentile: 'Percentile (0-99.99)',
        percentileNote: 'Compare this percentile to crash or jackpot thresholds.',
      },
    },
    faq: {
      title: 'Fairness FAQ',
      items: [
        {
          question: 'Why is the active server seed hidden?',
          answer:
            'Publishing the active seed would let anyone predict upcoming rolls. We only reveal it after rotation so completed wagers stay auditable while future wagers remain random.',
        },
        {
          question: 'When should I rotate my seeds?',
          answer:
            'Rotate whenever you want a fresh commitment: after a big win, before a high-stakes match, or any time you want to reset the nonce counter.',
        },
        {
          question: 'What if I forget my client seed?',
          answer:
            'You can set a new client seed at any point. The previous value stays recorded alongside its revealed server seeds so past wagers still verify.',
        },
        {
          question: 'How do I audit a past wager?',
          answer:
            'Locate the revealed server seed for that session, note the nonce that was used, then enter both values with your client seed in the check-roll tool. The reproduced HMAC should match the hash stored for that game.',
        },
      ],
    },
    verify: {
      title: 'Need help verifying?',
      description:
        'Paste a revealed server seed, your client seed, and the nonce into our verification widget to recreate the hash and outcome. Each mix of seeds maps to a single immutable hash, so if the numbers do not match your in-game result, let us know at fair@casi4f.com.',
      placeholders: {
        serverSeed: 'Enter revealed server seed',
        clientSeed: 'Enter your client seed',
        nonce: 'Nonce',
      },
      button: 'Run verification',
    },
  },
  vi: {
    hero: {
      eyebrow: 'Chứng minh công bằng',
      badge: 'Phòng thí nghiệm minh bạch',
      title: 'Chứng minh mọi kết quả CASI4F đều công bằng',
      description:
        'CASI4F sử dụng hệ thống băm SHA-256 với hai seed để đảm bảo mọi vòng quay, trận đấu và lượt gieo đều có tính ngẫu nhiên có thể kiểm chứng. Hãy xem cách chúng tôi tạo seed, công bố hash và cách bạn có thể tự phát lại bất kỳ kết quả nào.',
    },
    nav: ['Thiết lập seed', 'Kiểm tra lượt gieo', 'Câu hỏi thường gặp'],
    seedsTitle: 'Trạng thái seed hiện tại',
    tableHeaders: {
      type: 'Loại',
      value: 'Giá trị',
      actions: 'Thao tác',
    },
    rows: {
      clientSeed: 'Client seed',
      serverSeedActive: 'Server seed đang dùng',
      serverSeedHash: 'Hash server seed (cam kết)',
      lastServerSeed: 'Server seed đã công bố gần nhất',
      lastServerSeedEmpty: 'Hãy xoay seed để nhận lại server seed trước.',
      hashLabel: 'Hash',
      nonce: 'Nonce',
    },
    hiddenServerSeed: 'Ẩn cho đến khi xoay seed',
    seedsHint:
      'Mỗi lần xoay seed, server seed cũ sẽ được công bố để bạn kiểm chứng. Hãy dùng hash cam kết và nonce để tự tái tạo mỗi ván cược.',
    actions: {
      copy: 'Sao chép',
      copyHash: 'Sao chép hash',
      refresh: 'Làm mới',
      refreshing: 'Đang làm mới...',
      rotateServerSeed: 'Công bố & xoay seed',
      rotating: 'Đang xoay...',
      changeClientSeed: 'Đổi client seed',
      updatingClientSeed: 'Đang cập nhật...',
    },
    messages: {
      fetchError: 'Không thể tải dữ liệu provably fair. Vui lòng thử lại.',
      rotated: 'Đã xoay server seed và công bố seed trước.',
      clientSeedUpdated: 'Đã cập nhật client seed.',
      copied: 'Đã sao chép vào clipboard.',
      copyFailed: 'Trình duyệt không hỗ trợ sao chép.',
      promptClientSeed: 'Nhập client seed mới (tối thiểu 3 ký tự):',
      invalidClientSeed: 'Client seed phải có ít nhất 3 ký tự.',
    },
    timestamps: {
      clientSeedUpdated: 'Client seed cập nhật',
      serverSeedRotated: 'Server seed xoay',
      lastReveal: 'Thời điểm công bố server seed',
      notAvailable: 'Chưa có',
    },
    checklist: [
      {
        icon: ShieldCheck,
        title: 'Ngẫu nhiên chống can thiệp',
        description:
          'Mỗi trận đấu kết hợp client seed của bạn với server seed được mã hoá. Sau khi sử dụng cặp seed, server seed sẽ được công bố để bạn tự kiểm chứng kết quả.',
      },
      {
        icon: Sparkles,
        title: 'Đổi seed bất cứ lúc nào',
        description:
          'Bạn có thể xoay client seed cá nhân trước mỗi lượt gieo để tạo chuỗi hoàn toàn mới. Seed cũ vẫn được lưu lại để bạn kiểm toán kết quả lịch sử.',
      },
      {
        icon: History,
        title: 'Kiểm toán lượt gieo cũ',
        description:
          'Dùng công cụ kiểm tra lượt gieo để phát lại bất kỳ nonce nào. Dán server seed đã công bố, client seed của bạn và nonce để xác nhận kết quả khớp với trong game.',
      },
    ],
    checkRoll: {
      title: 'Tự kiểm tra lượt gieo',
      subtitle:
        'Khôi phục lại một ván cược đã kết thúc bằng cách kết hợp server seed đã công bố với client seed và nonce mà bạn đã sử dụng.',
      helper: 'Nonce sẽ tăng sau mỗi lần cược trong khi cặp seed vẫn được giữ nguyên.',
      fields: {
        serverSeed: 'Server seed đã công bố',
        clientSeed: 'Client seed',
        nonce: 'Nonce',
      },
      buttons: {
        run: 'Thực hiện kiểm tra',
        running: 'Đang kiểm tra...',
        fill: 'Dùng seed đã công bố',
        clear: 'Xoá',
      },
      messages: {
        missingFields: 'Nhập server seed đã công bố, client seed và nonce.',
        invalidNonce: 'Nonce phải là số nguyên không âm (0, 1, 2 ...).',
        cryptoUnavailable: 'Trình duyệt của bạn không hỗ trợ công cụ xác minh (thiếu WebCrypto API).',
        noReveal: 'Hãy xoay seed để công bố server seed trước đó rồi thử lại.',
        prefilled: 'Đã điền sẵn dữ liệu từ server seed được công bố gần nhất.',
      },
      results: {
        heading: 'Kết quả chi tiết',
        commit: 'Hash server seed (cam kết)',
        commitNote: 'So khớp với hash mà bạn thấy trước khi chơi.',
        hmac: 'Kết quả HMAC',
        hmacNote: 'HMAC-SHA256(serverSeed, `${clientSeed}:${nonce}`)',
        firstBytes: '4 byte đầu',
        firstBytesNote: 'Diễn giải thành số 32-bit: {value}',
        float: 'Số ngẫu nhiên (0-1)',
        floatNote: 'Được dùng để sinh mọi kết quả trong game.',
        coinflip: 'Kết quả tung xu',
        coinHeads: 'Ngửa',
        coinTails: 'Sấp',
        dice: 'Xúc xắc (1-6)',
        percentile: 'Phần trăm (0-99,99)',
        percentileNote: 'So sánh phần trăm này với các ngưỡng crash hoặc jackpot.',
      },
    },
    faq: {
      title: 'Câu hỏi thường gặp',
      items: [
        {
          question: 'Vì sao server seed đang dùng được ẩn?',
          answer:
            'Nếu công bố server seed đang hoạt động, bất kỳ ai cũng có thể dự đoán các lượt gieo sắp tới. Chúng tôi chỉ công bố sau khi xoay để đảm bảo ván cược đã kết thúc vẫn kiểm chứng được trong khi ván mới vẫn ngẫu nhiên.',
        },
        {
          question: 'Khi nào tôi nên xoay seed?',
          answer:
            'Xoay seed khi bạn muốn một cam kết mới: sau khi thắng lớn, trước trận cược quan trọng, hoặc bất cứ lúc nào bạn muốn đặt lại bộ đếm nonce.',
        },
        {
          question: 'Nếu quên client seed thì sao?',
          answer:
            'Bạn có thể đặt client seed mới bất cứ lúc nào. Giá trị trước đó vẫn được lưu cùng với các server seed đã công bố để những ván cược đã kết thúc vẫn kiểm chứng được.',
        },
        {
          question: 'Làm sao để kiểm toán một ván cược cũ?',
          answer:
            'Tìm server seed đã công bố của phiên chơi đó, ghi lại nonce bạn đã dùng, sau đó nhập cả hai cùng client seed vào công cụ kiểm tra. HMAC thu được phải khớp với hash đã lưu cho ván đấu.',
        },
      ],
    },
    verify: {
      title: 'Cần hỗ trợ thêm?',
      description:
        'Dán server seed đã công khai, client seed của bạn và nonce vào tiện ích xác minh để tái tạo hash và kết quả. Mỗi tổ hợp seed tương ứng với một hash bất biến; nếu số liệu không khớp với kết quả trong game, hãy liên hệ fair@casi4f.com.',
      placeholders: {
        serverSeed: 'Nhập server seed đã công khai',
        clientSeed: 'Nhập client seed của bạn',
        nonce: 'Nonce',
      },
      button: 'Thực hiện kiểm tra',
    },
  },
}

export default function ProvablyFairContent() {
  const { language } = useLocale()
  const content = CONTENT[language] ?? CONTENT.en
  const { get, post } = useApi()

  const {
    hero,
    nav,
    seedsTitle,
    tableHeaders,
    rows,
    hiddenServerSeed,
    seedsHint,
    checklist,
    verify,
    actions,
    messages,
    timestamps,
    checkRoll,
    faq,
  } = content

  const localeCode = language === 'vi' ? 'vi-VN' : 'en-US'

  const seedsRef = useRef(null)
  const checkRef = useRef(null)
  const faqRef = useRef(null)

  const sections = useMemo(
    () => [
      { id: 'seeds', label: nav[0], ref: seedsRef },
      { id: 'check', label: nav[1], ref: checkRef },
      { id: 'faq', label: nav[2], ref: faqRef },
    ],
    [nav],
  )

  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? 'seeds')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const activeSectionLabel = useMemo(() => {
    return sections.find((section) => section.id === activeSection)?.label ?? sections[0]?.label ?? ''
  }, [activeSection, sections])

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev)
  }, [])

  useEffect(() => {
    if (sections.length) {
      setActiveSection((prev) => (sections.some((section) => section.id === prev) ? prev : sections[0].id))
      setIsMenuOpen(false)
    }
  }, [sections, setIsMenuOpen])

  const [seedData, setSeedData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [isUpdatingClientSeed, setIsUpdatingClientSeed] = useState(false)
  const [error, setError] = useState('')

  const [checkForm, setCheckForm] = useState({ ...CHECK_FORM_DEFAULT })
  const [checkError, setCheckError] = useState('')
  const [checkResult, setCheckResult] = useState(null)
  const [isCheckingRoll, setIsCheckingRoll] = useState(false)

  const fetchSeeds = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) setIsRefreshing(true)
        else setIsLoading(true)
        const data = await get('/fair/current')
        setSeedData(data)
        setError('')
      } catch {
        setError(messages.fetchError)
      } finally {
        if (silent) setIsRefreshing(false)
        else setIsLoading(false)
      }
    },
    [get, messages.fetchError],
  )

  useEffect(() => {
    fetchSeeds()
  }, [fetchSeeds])

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible.length) {
          const id = visible[0].target.getAttribute('data-section-id')
          if (id) setActiveSection(id)
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0.25, 0.45] },
    )

    sections.forEach((section) => {
      const node = section.ref.current
      if (node) observer.observe(node)
    })

    return () => observer.disconnect()
  }, [sections])

  const handleRefresh = useCallback(() => {
    fetchSeeds({ silent: !!seedData })
  }, [fetchSeeds, seedData])

  const handleCopy = useCallback(
    async (value) => {
      if (!value) return
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        toast.error(messages.copyFailed)
        return
      }
      try {
        await navigator.clipboard.writeText(value)
        toast.success(messages.copied)
      } catch {
        toast.error(messages.copyFailed)
      }
    },
    [messages.copyFailed, messages.copied],
  )

  const handleRotateServerSeed = useCallback(async () => {
    if (isRotating || isLoading) return
    setIsRotating(true)
    try {
      await post('/fair/rotate', {})
      toast.success(messages.rotated)
      await fetchSeeds({ silent: true })
    } catch {
      // handled by useApi toast mapping
    } finally {
      setIsRotating(false)
    }
  }, [fetchSeeds, isLoading, isRotating, messages.rotated, post])

  const handleChangeClientSeed = useCallback(async () => {
    if (isUpdatingClientSeed || isLoading) return
    const promptValue = window.prompt(messages.promptClientSeed, seedData?.clientSeed ?? '')
    if (promptValue == null) return

    const trimmed = promptValue.trim()
    if (trimmed.length < 3) {
      toast.error(messages.invalidClientSeed)
      return
    }

    setIsUpdatingClientSeed(true)
    try {
      await post('/fair/client-seed', { clientSeed: trimmed })
      toast.success(messages.clientSeedUpdated)
      await fetchSeeds({ silent: true })
    } catch {
      // handled globally by useApi
    } finally {
      setIsUpdatingClientSeed(false)
    }
  }, [fetchSeeds, isLoading, isUpdatingClientSeed, messages.clientSeedUpdated, messages.invalidClientSeed, messages.promptClientSeed, post, seedData?.clientSeed])

  const formatDateTime = useCallback(
    (value) => {
      if (!value) return timestamps.notAvailable
      try {
        const date = value instanceof Date ? value : new Date(value)
        if (Number.isNaN(date.getTime())) return timestamps.notAvailable
        return date.toLocaleString(localeCode, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      } catch {
        return timestamps.notAvailable
      }
    },
    [localeCode, timestamps.notAvailable],
  )

  const handleNav = useCallback(
    (section) => {
      section.ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(section.id)
      setIsMenuOpen(false)
    },
    [setIsMenuOpen],
  )

  const handleCheckChange = useCallback((field) => {
    return (event) => {
      const value = event.target.value
      setCheckForm((prev) => ({ ...prev, [field]: value }))
    }
  }, [])

  const handleCheckReset = useCallback(() => {
    setCheckForm({ ...CHECK_FORM_DEFAULT })
    setCheckResult(null)
    setCheckError('')
  }, [])

  const handlePrefill = useCallback(() => {
    if (!seedData?.lastServerSeed) {
      toast.error(checkRoll.messages.noReveal)
      return
    }

    setCheckForm({
      serverSeed: seedData.lastServerSeed || '',
      clientSeed: seedData.clientSeed || '',
      nonce: '',
    })
    setCheckResult(null)
    setCheckError('')
    toast.success(checkRoll.messages.prefilled)
  }, [checkRoll.messages.noReveal, checkRoll.messages.prefilled, seedData])

  const handleCheckRoll = useCallback(async () => {
    const serverSeedInput = checkForm.serverSeed.trim()
    const clientSeedInput = checkForm.clientSeed.trim()
    const nonceInput = checkForm.nonce.trim()

    if (!serverSeedInput || !clientSeedInput || nonceInput === '') {
      setCheckError(checkRoll.messages.missingFields)
      setCheckResult(null)
      return
    }

    const nonceNumber = Number(nonceInput)
    if (!Number.isFinite(nonceNumber) || nonceNumber < 0 || !Number.isInteger(nonceNumber)) {
      setCheckError(checkRoll.messages.invalidNonce)
      setCheckResult(null)
      return
    }

    if (!globalThis.crypto?.subtle) {
      setCheckError(checkRoll.messages.cryptoUnavailable)
      setCheckResult(null)
      return
    }

    setIsCheckingRoll(true)
    try {
      const commit = await sha256Hex(serverSeedInput)
      const message = `${clientSeedInput}:${nonceNumber}`
      const hmac = await hmacSha256Hex(serverSeedInput, message)
      const firstBytes = hmac.slice(0, 8)
      const intValue = Number.parseInt(firstBytes, 16)
      const randomFloat = intValue / 0xffffffff
      const coinflip = randomFloat < 0.5 ? checkRoll.results.coinHeads : checkRoll.results.coinTails
      const dice = Math.floor(randomFloat * 6) + 1

      setCheckResult({
        commit,
        hmac,
        firstBytes,
        intValue,
        randomFloat,
        coinflip,
        dice,
        percentile: formatPercentile(randomFloat),
      })
      setCheckError('')
    } catch (err) {
      const message = err?.message === 'CRYPTO_UNAVAILABLE' ? checkRoll.messages.cryptoUnavailable : err?.message
      setCheckError(message || checkRoll.messages.cryptoUnavailable)
      setCheckResult(null)
    } finally {
      setIsCheckingRoll(false)
    }
  }, [checkForm.clientSeed, checkForm.nonce, checkForm.serverSeed, checkRoll.messages.cryptoUnavailable, checkRoll.messages.invalidNonce, checkRoll.messages.missingFields, checkRoll.results.coinHeads, checkRoll.results.coinTails])

  const [verifyBeforeEmail, verifyAfterEmail = ''] = useMemo(
    () => verify.description.split('fair@casi4f.com'),
    [verify.description],
  )

  const clientSeedValue = seedData?.clientSeed ?? ''
  const serverSeedHashValue = seedData?.serverSeedHash ?? ''
  const lastSeedValue = seedData?.lastServerSeed ?? ''
  const lastSeedHashValue = seedData?.lastServerSeedHash ?? ''
  const nonceValue = typeof seedData?.nonce === 'number' ? seedData?.nonce : null

  const seedsRows = [
    {
      key: 'clientSeed',
      label: rows.clientSeed,
      value: clientSeedValue ? (
        <code className='block break-all font-mono text-xs text-slate-100/80'>{clientSeedValue}</code>
      ) : (
        <span className='text-xs text-slate-400'>—</span>
      ),
      actions: [
        clientSeedValue
          ? {
              key: 'client-copy',
              label: actions.copy,
              onClick: () => handleCopy(clientSeedValue),
              disabled: isLoading,
            }
          : null,
        {
          key: 'client-change',
          label: isUpdatingClientSeed ? actions.updatingClientSeed : actions.changeClientSeed,
          onClick: handleChangeClientSeed,
          disabled: isUpdatingClientSeed || isLoading,
        },
      ].filter(Boolean),
    },
    {
      key: 'serverSeedActive',
      label: rows.serverSeedActive,
      value: <span className='font-mono text-xs text-slate-400'>{hiddenServerSeed}</span>,
      actions: [
        {
          key: 'server-rotate',
          label: isRotating ? actions.rotating : actions.rotateServerSeed,
          onClick: handleRotateServerSeed,
          disabled: isRotating || isLoading,
        },
      ],
    },
    {
      key: 'serverSeedHash',
      label: rows.serverSeedHash,
      value: serverSeedHashValue ? (
        <code className='block break-all font-mono text-xs text-slate-100/80'>{serverSeedHashValue}</code>
      ) : (
        <span className='text-xs text-slate-400'>—</span>
      ),
      actions: [
        serverSeedHashValue
          ? {
              key: 'hash-copy',
              label: actions.copy,
              onClick: () => handleCopy(serverSeedHashValue),
              disabled: isLoading,
            }
          : null,
      ].filter(Boolean),
    },
    {
      key: 'lastServerSeed',
      label: rows.lastServerSeed,
      value: lastSeedValue ? (
        <div className='space-y-2'>
          <code className='block break-all font-mono text-xs text-slate-100/80'>{lastSeedValue}</code>
          {lastSeedHashValue ? (
            <div className='text-[11px] leading-relaxed text-slate-400'>
              <span className='mr-2 uppercase tracking-[0.2em]'>{rows.hashLabel}</span>
              <code className='break-all font-mono text-[11px] text-slate-300'>{lastSeedHashValue}</code>
            </div>
          ) : null}
        </div>
      ) : (
        <span className='text-xs text-slate-400'>{rows.lastServerSeedEmpty}</span>
      ),
      actions: lastSeedValue
        ? [
            {
              key: 'last-seed-copy',
              label: actions.copy,
              onClick: () => handleCopy(lastSeedValue),
              disabled: isLoading,
            },
            lastSeedHashValue
              ? {
                  key: 'last-hash-copy',
                  label: actions.copyHash,
                  onClick: () => handleCopy(lastSeedHashValue),
                  disabled: isLoading,
                }
              : null,
          ].filter(Boolean)
        : [],
    },
    {
      key: 'nonce',
      label: rows.nonce,
      value:
        nonceValue != null ? (
          <code className='font-mono text-sm text-emerald-200'>{nonceValue}</code>
        ) : isLoading ? (
          <span className='text-xs text-slate-400'>...</span>
        ) : (
          <span className='text-xs text-slate-400'>—</span>
        ),
      actions: [],
    },
  ]

  const metaItems = [
    { key: 'clientSeedUpdated', label: timestamps.clientSeedUpdated, value: seedData?.clientSeedUpdatedAt },
    { key: 'serverSeedRotated', label: timestamps.serverSeedRotated, value: seedData?.serverSeedRotatedAt },
    { key: 'lastReveal', label: timestamps.lastReveal, value: seedData?.lastServerSeedRevealAt },
  ]

  return (
    <section className='relative isolate overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-[#101433] via-[#0b0f29] to-[#060819] text-slate-200 shadow-[0_32px_90px_rgba(7,9,22,0.55)]'>
      <div className='absolute -top-32 left-16 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl' aria-hidden='true' />
      <div className='absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl' aria-hidden='true' />
      <div className='relative mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-16 lg:px-12'>
        <header className='space-y-4'>
          <div className='flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.35em] text-emerald-200/90'>
            <ShieldCheck className='h-4 w-4 text-emerald-300' aria-hidden='true' />
            <span>{hero.eyebrow}</span>
            <span className='rounded-full bg-white/10 px-3 py-1 text-xs text-white/80'>{hero.badge}</span>
          </div>
          <h1 className='text-3xl font-semibold text-white sm:text-4xl lg:text-5xl'>{hero.title}</h1>
          <p className='max-w-3xl text-base leading-relaxed text-slate-300'>{hero.description}</p>
        </header>

        <nav className='w-full'>
          <div className='rounded-2xl border border-white/10 bg-white/5 p-2 text-sm font-medium text-slate-300 backdrop-blur'>
            <div className='flex items-center justify-between md:hidden'>
              <span className='text-xs uppercase tracking-[0.3em] text-white/80'>{activeSectionLabel}</span>
              <button
                type='button'
                onClick={toggleMenu}
                aria-expanded={isMenuOpen}
                aria-label='Toggle provably fair navigation'
                className='rounded-xl border border-white/10 bg-white/10 p-2 text-white/80 transition hover:border-emerald-400/60 hover:text-white'
              >
                {isMenuOpen ? (
                  <X className='h-4 w-4' aria-hidden='true' />
                ) : (
                  <Menu className='h-4 w-4' aria-hidden='true' />
                )}
              </button>
            </div>
            <div
              className={`${
                isMenuOpen ? 'mt-3 flex flex-col gap-2' : 'hidden'
              } md:mt-0 md:flex md:flex-row md:flex-wrap md:items-center md:gap-4`}
            >
              {sections.map((section) => (
                <button
                  key={section.id}
                  type='button'
                  onClick={() => handleNav(section)}
                  className={`w-full rounded-xl px-4 py-2 text-left transition hover:bg-white/10 md:w-auto md:text-center ${
                    activeSection === section.id ? 'bg-emerald-500/20 text-white hover:bg-emerald-500/30' : 'text-slate-300'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div
          ref={seedsRef}
          data-section-id='seeds'
          className='space-y-10 rounded-3xl border border-white/10 bg-[#080b1f]/70 p-6 backdrop-blur'
        >
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <h2 className='text-lg font-semibold text-white'>{seedsTitle}</h2>
            <button
              type='button'
              onClick={handleRefresh}
              disabled={isRefreshing || (isLoading && !seedData)}
              className='rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-wide text-white/80 transition hover:border-emerald-400/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isRefreshing ? actions.refreshing : actions.refresh}
            </button>
          </div>

          {error && (
            <p className='rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs text-red-200'>{error}</p>
          )}

          <div className='overflow-hidden rounded-2xl border border-white/10'>
            <table className='min-w-full divide-y divide-white/10 text-sm'>
              <thead>
                <tr className='bg-white/5 text-left text-xs uppercase tracking-[0.25em] text-slate-200'>
                  <th scope='col' className='px-4 py-3'>{tableHeaders.type}</th>
                  <th scope='col' className='px-4 py-3'>{tableHeaders.value}</th>
                  <th scope='col' className='px-4 py-3'>{tableHeaders.actions}</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-white/5 bg-[#090d23] text-slate-200'>
                {seedsRows.map((row) => (
                  <tr key={row.key} className='align-top'>
                    <td className='px-4 py-3 font-medium uppercase tracking-[0.2em] text-indigo-200'>{row.label}</td>
                    <td className='px-4 py-3'>
                      <div className='space-y-1 text-xs text-slate-100/80'>{row.value}</div>
                    </td>
                    <td className='px-4 py-3'>
                      {row.actions.length ? (
                        <div className='flex flex-wrap gap-2'>
                          {row.actions.map((action) => (
                            <button
                              key={action.key}
                              type='button'
                              onClick={action.onClick}
                              disabled={action.disabled}
                              className='rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-wide text-white/80 transition hover:border-emerald-400/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-50'
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className='text-xs text-slate-400'>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className='rounded-2xl border border-dashed border-white/20 bg-white/5 px-5 py-4 text-xs text-slate-300/80'>{seedsHint}</p>

          <div className='grid gap-4 text-[11px] text-slate-300 sm:grid-cols-3'>
            {metaItems.map((item) => (
              <div key={item.key} className='space-y-1'>
                <div className='uppercase tracking-[0.35em] text-slate-200'>{item.label}</div>
                <div className='font-mono text-xs text-slate-200'>{formatDateTime(item.value)}</div>
              </div>
            ))}
          </div>

          <div className='grid gap-6 lg:grid-cols-3'>
            {checklist.map((item) => (
              <article key={item.title} className='group flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 transition hover:border-emerald-400/40 hover:bg-emerald-500/10'>
                <item.icon className='h-8 w-8 text-emerald-300 group-hover:text-white' aria-hidden='true' />
                <h3 className='text-base font-semibold text-white'>{item.title}</h3>
                <p className='leading-relaxed text-slate-300/90'>{item.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div
          ref={checkRef}
          data-section-id='check'
          className='space-y-6 rounded-3xl border border-white/10 bg-[#090d23]/80 p-6 backdrop-blur'
        >
          <div className='space-y-2'>
            <h2 className='text-lg font-semibold text-white'>{checkRoll.title}</h2>
            <p className='text-sm text-slate-300/90'>{checkRoll.subtitle}</p>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <label className='flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-slate-400'>
              <span>{checkRoll.fields.serverSeed}</span>
              <textarea
                rows={3}
                value={checkForm.serverSeed}
                onChange={handleCheckChange('serverSeed')}
                placeholder={verify.placeholders.serverSeed}
                className='min-h-[96px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/20'
              />
            </label>
            <label className='flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-slate-400'>
              <span>{checkRoll.fields.clientSeed}</span>
              <textarea
                rows={3}
                value={checkForm.clientSeed}
                onChange={handleCheckChange('clientSeed')}
                placeholder={verify.placeholders.clientSeed}
                className='min-h-[96px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/20'
              />
            </label>
            <label className='flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-slate-400'>
              <span>{checkRoll.fields.nonce}</span>
              <input
                type='text'
                inputMode='numeric'
                value={checkForm.nonce}
                onChange={handleCheckChange('nonce')}
                placeholder={verify.placeholders.nonce}
                className='rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400/60 focus:outline-none focus:ring-2 focus:ring-emerald-400/20'
              />
            </label>
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            <button
              type='button'
              onClick={handleCheckRoll}
              disabled={isCheckingRoll}
              className='rounded-2xl bg-emerald-500/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_14px_30px_rgba(16,185,129,0.35)] transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {isCheckingRoll ? checkRoll.buttons.running : checkRoll.buttons.run}
            </button>
            <button
              type='button'
              onClick={handlePrefill}
              className='rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/80 transition hover:border-emerald-400/60 hover:text-white'
            >
              {checkRoll.buttons.fill}
            </button>
            <button
              type='button'
              onClick={handleCheckReset}
              className='rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/60 transition hover:border-red-400/60 hover:text-red-200'
            >
              {checkRoll.buttons.clear}
            </button>
          </div>

          <p className='text-[13px] text-slate-400'>{checkRoll.helper}</p>

          {checkError && (
            <p className='rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs text-red-200'>{checkError}</p>
          )}

          {checkResult && (
            <div className='space-y-4 rounded-2xl border border-white/10 bg-black/20 p-5'>
              <h3 className='text-sm font-semibold uppercase tracking-[0.25em] text-emerald-200'>{checkRoll.results.heading}</h3>
              <dl className='grid gap-4 text-sm text-slate-200 sm:grid-cols-2'>
                <div className='space-y-1'>
                  <dt className='uppercase tracking-[0.2em] text-slate-400'>{checkRoll.results.commit}</dt>
                  <dd>
                    <code className='block break-all rounded bg-white/5 px-3 py-2 font-mono text-xs text-slate-100/80'>{checkResult.commit}</code>
                  </dd>
                  <p className='text-[11px] text-slate-400'>{checkRoll.results.commitNote}</p>
                </div>
                <div className='space-y-1'>
                  <dt className='uppercase tracking-[0.2em] text-slate-400'>{checkRoll.results.hmac}</dt>
                  <dd>
                    <code className='block break-all rounded bg-white/5 px-3 py-2 font-mono text-xs text-slate-100/80'>{checkResult.hmac}</code>
                  </dd>
                  <p className='text-[11px] text-slate-400'>{checkRoll.results.hmacNote}</p>
                </div>
                <div className='space-y-1'>
                  <dt className='uppercase tracking-[0.2em] text-slate-400'>{checkRoll.results.firstBytes}</dt>
                  <dd>
                    <code className='block break-all rounded bg-white/5 px-3 py-2 font-mono text-xs text-slate-100/80'>{checkResult.firstBytes}</code>
                  </dd>
                  <p className='text-[11px] text-slate-400'>
                    {checkRoll.results.firstBytesNote.replace('{value}', String(checkResult.intValue))}
                  </p>
                </div>
                <div className='space-y-1'>
                  <dt className='uppercase tracking-[0.2em] text-slate-400'>{checkRoll.results.float}</dt>
                  <dd>
                    <code className='rounded bg-white/5 px-3 py-2 font-mono text-xs text-emerald-200'>{formatFloat(checkResult.randomFloat)}</code>
                  </dd>
                  <p className='text-[11px] text-slate-400'>{checkRoll.results.floatNote}</p>
                </div>
                <div className='space-y-1'>
                  <dt className='uppercase tracking-[0.2em] text-slate-400'>{checkRoll.results.coinflip}</dt>
                  <dd className='rounded bg-white/5 px-3 py-2 font-semibold uppercase tracking-[0.25em] text-white'>
                    {checkResult.coinflip}
                  </dd>
                </div>
                <div className='space-y-1'>
                  <dt className='uppercase tracking-[0.2em] text-slate-400'>{checkRoll.results.dice}</dt>
                  <dd className='rounded bg-white/5 px-3 py-2 font-mono text-lg text-white'>
                    {checkResult.dice}
                  </dd>
                </div>
                <div className='space-y-1'>
                  <dt className='uppercase tracking-[0.2em] text-slate-400'>{checkRoll.results.percentile}</dt>
                  <dd className='rounded bg-white/5 px-3 py-2 font-mono text-sm text-white'>
                    {checkResult.percentile}
                  </dd>
                  <p className='text-[11px] text-slate-400'>{checkRoll.results.percentileNote}</p>
                </div>
              </dl>
            </div>
          )}

          <div className='rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300/90'>
            <h3 className='text-base font-semibold text-white'>{verify.title}</h3>
            <p className='mt-2'>
              {verifyBeforeEmail}
              <a href='mailto:fair@casi4f.com' className='text-emerald-300 hover:text-emerald-200'>fair@casi4f.com</a>
              {verifyAfterEmail}
            </p>
          </div>
        </div>

        <div
          ref={faqRef}
          data-section-id='faq'
          className='space-y-6 rounded-3xl border border-white/10 bg-[#080b1f]/70 p-6 backdrop-blur'
        >
          <h2 className='text-lg font-semibold text-white'>{faq.title}</h2>
          <div className='space-y-4'>
            {faq.items.map((item) => (
              <article key={item.question} className='rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300'>
                <h3 className='text-base font-semibold text-white'>{item.question}</h3>
                <p className='mt-2 leading-relaxed text-slate-300/90'>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
