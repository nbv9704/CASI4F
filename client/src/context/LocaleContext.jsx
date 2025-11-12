// client/src/context/LocaleContext.jsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const localeMap = {
  en: "en-US",
  vi: "vi-VN",
};

const translations = {
  en: {
    common: {
      wallet: "Wallet",
      bank: "Bank",
      coins: "coins",
      copyUnsupported: "Cannot copy ID on this device.",
      copySuccess: "User ID copied!",
      copyShortSuccess: "ID copied successfully!",
      copyFailure: "Copy failed, please try again.",
      loginRequiredHistory: "Please sign in to view your history.",
      loginRequiredWallet: "Please sign in to view the wallet.",
      confirm: "Confirm",
      cancel: "Cancel",
      previous: "← Previous",
      next: "Next →",
      pageLabel: "Page {{page}} / {{total}}",
    },
    loading: {
      appShell: "Preparing your experience…",
      home: "Loading home page…",
      rankings: "Loading rankings…",
      rewards: "Loading rewards…",
      auth: "Authenticating session…",
      profile: "Loading profile…",
      settings: "Loading settings…",
      history: "Loading history…",
      walletHistory: "Loading transaction history…",
      notifications: "Loading notifications…",
    general: "Loading…",
    },
    navbar: {
      walletButton: {
        label: "Wallet",
        bank: "Bank",
        open: "Open wallet",
      },
      language: {
        label: "Language",
        english: "English",
        vietnamese: "Vietnamese",
      },
      common: {
        back: "Back to games",
      },
      links: {
        game: "Games",
        rewards: "Rewards",
        rankings: "Rankings",
        profile: "Profile",
        collections: "Collections",
        friends: "Friends",
        history: "History",
        settings: "Settings",
      },
      cta: {
        login: "Sign in",
        register: "Create account",
      },
      menu: {
        navigationHeading: "Navigation",
        adminHealth: "Admin health",
        logout: "Sign out",
        playerFallback: "Player",
      },
      level: {
        label: "Level",
        maxShort: "Max level",
        maxMessage: "Max level reached",
      },
    },
    home: {
      news: {
        accent: "Live highlights",
        title: "Stay ahead of the action",
        subtitle:
          "Track tournaments, flash events, and seasonal rewards while they are hot.",
        viewAll: "See all updates",
        items: {
          presence: {
            badge: "Status refresh",
            title: "Auto-expiring statuses keep your crew aligned",
            description:
              "Online, idle, and busy states now sync across your navbar, profile, and Social hub with optional timers.",
            action: "Manage your status",
          },
          social: {
            badge: "Social hub",
            title: "Chat, invite, and manage friends without leaving the lobby",
            description:
              "The refreshed hub bundles DMs, presence indicators, and quick PvP invites for every table.",
            action: "Open Social hub",
          },
          collections: {
            badge: "Progress boost",
            title: "Achievement milestones track every clutch run",
            description:
              "Showcase slots and milestone tiers make it easy to celebrate streaks, jackpots, and rare badges.",
            action: "View collections",
          },
        },
      },
      ctas: {
        heading: "Essential shortcuts",
        play: {
          title: "Play games",
          description: "Browse every solo and PvP arena in one place.",
        },
        rewards: {
          title: "Claim rewards",
          description: "Track hourly, daily, and seasonal bonuses.",
        },
        wallet: {
          title: "Manage wallet",
          description: "Move coins, review transfers, and top up your bank.",
        },
        invite: {
          title: "Invite friends",
          description: "Jump into the Social hub for instant PvP invites and live chat.",
        },
      },
      rankings: {
        accent: "Leaderboard snapshot",
        title: "Competitive leaderboard",
        subtitle: "Updated every 15 minutes across all settled matches.",
        viewAll: "View full rankings",
        periods: {
          daily: "Daily",
          weekly: "Weekly",
          monthly: "Monthly",
        },
    showing: "Showing {{period}} leaderboard",
    empty: "No players have joined the leaderboard yet.",
    loading: "Loading leaderboard…",
        error: "Failed to load the leaderboard. Please try again later.",
        table: {
          rank: "Rank",
          player: "Player",
          games: "Games",
          streak: "Streak",
          profit: "Profit",
        },
        streakSuffix: "win streak",
        summary: {
          players: "Players tracked",
          profit: "Total profit",
          bestStreak: "Best win streak",
        },
      },
    },
    admin: {
      loading: "Loading dashboard…",
      accessDenied: {
        title: "Access denied",
        description: "You don't have permission to access this page.",
      },
      error: {
        title: "Error",
        description: "Failed to load dashboard.",
        retry: "Retry",
      },
      header: {
        title: "Admin dashboard",
        subtitle: "System overview and management",
      },
      stats: {
        totalUsers: {
          label: "Total users",
          subtitle: "{{count}} new today",
        },
        activeRooms: {
          label: "Active PvP rooms",
          subtitle: "Live matches",
        },
        totalBalance: {
          label: "Total balance",
          subtitle: "System coins",
        },
        transactions: {
          label: "Transactions (24h)",
          subtitle: "Last 24 hours",
        },
      },
      management: {
        user: {
          title: "User management",
          description: "Manage users, roles, and permissions.",
        },
        metrics: {
          title: "System metrics",
          description: "Monitor server health and performance.",
        },
        transactions: {
          title: "Transactions",
          description: "View and monitor all transactions.",
        },
        games: {
          title: "Game config",
          description: "Configure game settings and parameters.",
        },
        reports: {
          title: "Reports",
          description: "Generate and view system reports.",
        },
      },
      recentUsers: {
        title: "Recent users",
        empty: "No recent users.",
        joined: "Joined {{date}}",
      },
      topBalances: {
        title: "Top balances",
        empty: "No data available.",
        level: "Level {{level}}",
      },
    },
    footer: {
      brand: {
        tagline: "Online casino",
        description:
          "CASI4F delivers curated PvP arenas, seasonal missions, and provably fair solo games for friends to enjoy together.",
        contact: "Need help? Email {{email}}",
      },
      sections: {
        games: {
          title: "Game",
          links: {
            catalog: "Game catalog",
            solo: "Solo arena",
            battle: "Battle arena",
            rewards: "Rewards hub",
            rankings: "Leaderboard",
          },
        },
        info: {
          title: "Account",
          links: {
            history: "Game history",
            notifications: "Notifications",
            profile: "Profile",
            settings: "Settings",
            wallet: "Wallet & bank",
          },
        },
        support: {
          title: "Support",
          links: {
            terms: "Terms of service",
            provablyFair: "Provably fair",
            security: "Security & privacy",
          },
        },
      },
      social: {
        heading: "Stay connected with CASI4F",
      },
      legal: {
        copyright: "© {{year}} CASI4F. All rights reserved.",
        privacy: "Privacy policy",
        terms: "Terms of service",
        provablyFair: "Provably fair",
      },
    },
    solo: {
      headerAccent: "Solo arena",
      title: "Choose a solo challenge",
      subtitle:
        "Sharpen your skills in single-player modes with instant wagers and provably fair rolls.",
      helper: "Pick any game below to jump straight into its solo lobby.",
      emptyTitle: "No solo games available right now.",
      emptyAction: "Return to games",
    },
    battle: {
      headerAccent: "PvP arena",
      title: "Challenge another player",
      subtitle:
        "Host or join head-to-head matches and settle wagers in real time.",
      helper: "Select a battle-ready game to create or join a PvP room.",
      emptyTitle: "No battle games are available at the moment.",
      emptyAction: "Return to games",
    },
    auth: {
      common: {
        usernameOrEmail: "Username or email",
        username: "Username",
        email: "Email",
        password: "Password",
        noAccount: "Don't have an account yet?",
        haveAccount: "Already have an account?",
        registerLink: "Create account",
        loginLink: "Sign in",
        countdown: "Redirecting in {{seconds}}s…",
      },
      login: {
        headerAccent: "Welcome back",
        title: "Sign in to continue",
        subtitle: "Access your wallet, bonuses, and live games.",
        button: "Sign in",
        processing: "Signing in…",
        countdownButton: "Redirecting in {{seconds}}s…",
        countdownToast: "Signed in successfully. Redirecting in {{seconds}}s…",
        successToast: "Signed in successfully.",
        error: "Sign-in failed. Please try again.",
        heroTitle: "Secure gaming, instant payouts",
        heroSubtitle:
          "Enjoy PvP battles, solo games, and seamless wallet management.",
        heroBullets: [
          "Real-time wallet and bank balance tracking.",
          "Invite friends to PvP rooms instantly.",
          "Unlock daily, hourly, and seasonal rewards.",
        ],
      },
      register: {
  headerAccent: "Join the arena",
  title: "Create your CASI4F account",
        subtitle: "Start competing, earning rewards, and tracking your wins.",
        button: "Create account",
        processing: "Creating account…",
        successToast: "Registration successful. You can now sign in.",
        error: "Registration failed. Please try again.",
        heroTitle: "Build your legacy",
        heroSubtitle:
          "Track every bet, earn rewards, and challenge the community.",
        heroBullets: [
          "Secure wallet with instant bank transfers.",
          "Provably fair games with transparent history.",
          "Personalized profile and notification center.",
        ],
      },
    },
    settings: {
      toast: {
        currentPasswordMissing: "Please enter your current password.",
        profileUpdated: "Profile updated successfully!",
        passwordMismatch: "New passwords do not match.",
        passwordUpdated: "Password changed successfully!",
        avatarInvalidType: "Please upload a supported image file.",
        avatarProcessed: "Avatar ready! Preview updated.",
        avatarProcessFailed:
          "We couldn't process that image. Try another file.",
      },
      header: {
        accent: "Account overview",
        greeting: "Welcome back, {{name}} 👋",
      },
      badges: {
        role: "Role",
        copyButton: "ID: {{id}}",
      },
      balance: {
        wallet: "Wallet balance",
        bank: "Bank balance",
      },
      profileCard: {
        title: "Profile details",
        username: "Username",
        email: "Email",
        avatar: "Avatar",
        avatarUpload: "Add image",
        avatarHint:
          "PNG, JPG or WEBP recommended. We crop to a square and optimise up to 512KB.",
        dateOfBirth: "Date of birth",
        currentPassword: "Current password",
        currentPasswordPlaceholder: "Enter your password to confirm",
        submit: "Save changes",
        submitting: "Saving…",
      },
      passwordCard: {
        title: "Change password",
        oldPassword: "Current password",
        newPassword: "New password",
        confirmPassword: "Confirm new password",
        submit: "Update password",
        submitting: "Updating…",
      },
      logoutCard: {
        title: "Secure sign-out",
        description:
          "If you are using a shared device, sign out when you are done to keep your account safe.",
        button: "Sign out",
      },
    },
    profile: {
      loading: "Loading profile…",
      heroAccent: "Player profile",
      levelProgressValue: "{{current}} / {{total}} XP",
      levelMax: "Max level reached",
      accountInfo: "Account information",
      emailFallback: "Not provided yet",
      birthDate: "Date of birth",
      birthDateFallback: "Not provided yet",
      status: {
        label: "Status",
        states: {
          online: "Online",
          idle: "Idle",
          busy: "Do not disturb",
          offline: "Offline",
        },
        expiresAt: "Auto-clears at {{time}}",
      },
      security: "Security",
      securityValue: "Consider updating your password every 30 days.",
      quickActions: "Quick actions",
      settings: "Account settings",
      history: "Play history",
      safetyTips: "Safety tips",
      tips: [
        "Never share one-time passwords or credentials.",
        "Enable notifications to receive important updates.",
        "Review your transaction history regularly.",
      ],
      bio: {
        heading: "About",
        empty: "You have not added a bio yet.",
      },
      socials: {
        heading: "Social links",
        empty: "Add social profiles so friends can follow your streams and updates.",
        visit: "Open",
        labels: {
          discord: "Discord",
          twitter: "Twitter / X",
          twitch: "Twitch",
          youtube: "YouTube",
        },
      },
      showcase: {
        heading: "Achievement showcase",
        empty: "Select achievements to display them here.",
      },
      achievements: {
        heading: "Achievements",
        summary: "{{completed}} / {{total}} completed",
        completed: "Completed",
        locked: "Locked",
        empty: "You have not unlocked any achievements yet.",
        earnedOn: "Earned on {{date}}",
      },
      collections: {
        heading: "Collections",
        tabs: {
          achievements: "Achievements",
          inventory: "Inventory",
        },
        achievementsSummary: "{{completed}} / {{total}} achievements unlocked",
        achievementNoDescription: "No description provided.",
        achievementCompleted: "Completed",
        achievementLocked: "Locked",
        achievementsEmpty: "You have not unlocked any achievements yet.",
        unlockedAt: "Unlocked on {{date}}",
        badgeReward: "Rewards badge: {{badge}}",
        badgeTier: "Tier: {{tier}}",
        badgeOwned: "Owned",
        badgeOwnedSince: "Owned since {{date}}",
        badgeLocked: "Locked — reach the requirement to unlock.",
        inventoryEmpty: "Your inventory is empty for now.",
        quickAction: "Open collections hub",
      },
      stats: {
        heading: "Profile stats",
        achievements: "Achievements",
        badges: "Badges",
      },
      badges: {
        heading: "Badges",
        active: "Active badge",
        owned: "Owned",
        empty: "You do not own any badges yet.",
        none: "No badge equipped",
      },
      customize: {
        heroAccent: "Profile customization",
        quickAction: "Customize profile",
        heading: "Customize profile",
        description: "Update your profile details, social links, and showcase.",
        identitySection: "Profile identity",
        socialSection: "Social presence",
        optionalLabel: "Optional",
        backToProfile: "Back to profile",
        cancelButton: "Discard",
        bioLabel: "Bio",
        bioPlaceholder: "Share a short introduction about yourself…",
        statusStateLabel: "Status",
        statusStateHint: "Choose how others see your availability.",
        statusMessageLabel: "Status message",
        statusMessagePlaceholder: "Share a quick update…",
        statusMessageHint: "Status messages disappear when their timer runs out.",
        statusDurationLabel: "Auto-clear after",
        statusDuration: {
          options: {
            30: "30 minutes",
            60: "1 hour",
            240: "4 hours",
            1440: "24 hours",
          },
        },
        statusDurationHintActive:
          "Message clears in {{duration}} unless you update it sooner.",
        statusDurationHintDisabled: "Add a status message to enable auto-clear.",
        visibilityLabel: "Profile visibility",
        visibility: {
          public: "Public",
          friends: "Friends only",
          private: "Private",
        },
        activeBadgeLabel: "Active badge",
        activeBadgeNone: "No badge",
        socialLinksLabel: "Social handles & URLs",
        socialLinksHint:
          "Add URLs or @handles. We support Discord, Twitter, Twitch, and YouTube.",
        showcaseLabel: "Achievement showcase",
        showcaseHint: "Select up to {{limit}} achievements to pin.",
        showcaseSelected: "{{count}} / {{limit}} selected",
        showcaseEmpty: "Unlock achievements to pin them here.",
        saveButton: "Save changes",
        saving: "Saving…",
        toastSuccess: "Profile updated successfully!",
        toastShowcaseLimit: "You can only showcase {{limit}} achievements.",
      },
      public: {
        heroLabel: "Player spotlight",
        visibility: "Visibility: {{mode}}",
        memberSince: "Member since {{date}}",
        manageOwn: "Manage your profile",
        metaHeading: "Profile details",
        joinedLabel: "Joined",
        notFound: "Profile not found",
        invalidUsername: "We could not parse that profile URL.",
        private: "This profile is private",
        privateDescription: "The owner only shares their profile with approved viewers.",
        unauthorized: "Authentication required",
        unauthorizedDescription: "Please sign in again to view this profile.",
        errorTitle: "Unable to load profile",
        errorDescription: "Something went wrong while loading the profile.",
        networkError: "Network error. Check your connection and try again.",
        retry: "Retry",
        back: "Back to lobby",
      },
    },
    collections: {
      heading: "Collections hub",
      subtitle: "Review achievements and manage owned rewards in one place.",
      loading: "Loading collections…",
      back: "Back to profile",
      stats: {
        achievements: "{{completed}} / {{total}} achievements unlocked",
        badges: "{{count}} badges owned",
      },
      catalog: {
        achievements: {
          LEVEL_5: {
            name: "Hardened Rookie",
            description: "Reach level 5 and unlock your first perks.",
          },
          LEVEL_10: {
            name: "Seasoned Challenger",
            description: "Push onward to reach level 10.",
          },
          LEVEL_20: {
            name: "4FUN Legend",
            description: "Hit level 20 and become a casino icon.",
          },
          COINFLIP_ROOKIE: {
            name: "Coinflip Rookie",
            description: "Get comfortable with Coinflip by playing 200 rounds.",
          },
          COINFLIP_VETERAN: {
            name: "Coinflip Veteran",
            description: "Conquer 500 Coinflip rounds.",
          },
          COINFLIP_LEGEND: {
            name: "Coinflip Legend",
            description: "Play 1,000 Coinflip rounds to claim the ultimate badge.",
          },
          COINFLIP_CHAMPION: {
            name: "Coinflip Champion",
            description: "Win 250 Coinflip rounds.",
          },
          COINFLIP_CONQUEROR: {
            name: "Coinflip Conqueror",
            description: "Win 750 Coinflip rounds and prove elite mastery.",
          },
          CHECKIN_STARTER: {
            name: "Habit Builder",
            description: "Claim the daily login reward for seven days.",
          },
          CHECKIN_VETERAN: {
            name: "Check-in Veteran",
            description: "Stay consistent with 30 daily login rewards claimed.",
          },
          REWARD_HUNTER: {
            name: "Reward Hunter",
            description: "Grab the daily reward 30 times.",
          },
          REWARD_COLLECTOR: {
            name: "Reward Collector",
            description: "Collect the daily reward 100 times.",
          },
          SOCIAL_STARTER: {
            name: "First Connections",
            description: "Add five players as friends.",
          },
          SOCIAL_BUTTERFLY: {
            name: "4FUN Networker",
            description: "Add 25 players as friends and grow your community.",
          },
        },
        badges: {
          THE_FLIPPER: {
            name: "The Flipper",
            description: "Complete the highest Coinflip milestone to prove your coin mastery.",
          },
          LUCKY_STREAK: {
            name: "Lucky Streak",
            description: "Maintain the longest Coinflip win streak and keep the momentum going.",
          },
          LOYAL_VISITOR: {
            name: "Loyal Visitor",
            description: "Log in for daily rewards long enough to become a club regular.",
          },
          TREASURE_HUNTER: {
            name: "Treasure Hunter",
            description: "Never miss a daily reward and sweep every giveaway.",
          },
          SOCIAL_STAR: {
            name: "Social Star",
            description: "Build your network across the 4FUN lobby and stay in the spotlight.",
          },
        },
      },
    },
    history: {
      loginRequired: "Please sign in to view your history.",
      empty: "You do not have any game history yet. Try a match today! 🎮",
      header: {
        accent: "Overview",
        title: "Game History",
        subtitle: "Showing page {{page}}/{{total}} — {{count}} games in total.",
      },
      error: {
        generic: "Unable to load your history. Please try again later.",
        analytics: "Unable to load analytics right now. Try refreshing in a moment.",
      },
      stats: {
        wins: "Wins (this page)",
        bets: "Wagered (this page)",
        payout: "Payout (this page)",
        winRate: "Win rate",
        netProfit: "Net profit",
        totalXp: "Experience earned",
      },
      pagination: {
        prev: "← Previous page",
        label: "Page {{page}} / {{total}}",
        next: "Next page →",
      },
      entry: {
        bet: "Bet {{amount}} {{unit}}",
        payout: "Payout: {{amount}} {{unit}}",
        stakeLabel: "Stake",
        payoutLabel: "Return",
        performance: "Net result",
        xpGain: "XP gain",
        unknown: "Unknown",
      },
      filters: {
        heading: "Filters",
        from: "From date",
        to: "To date",
        game: "Game",
        allGames: "All games",
        outcome: "Outcome",
        outcomes: {
          all: "All outcomes",
          win: "Wins",
          lose: "Losses",
          tie: "Ties",
        },
        apply: "Apply filters",
        applying: "Applying…",
        reset: "Reset",
      },
      analytics: {
        heading: "Performance overview",
        loading: "Crunching your match data…",
        rounds: "Rounds: {{count}}",
        currentStreak: "Current streak",
        streakWins: "wins",
        streakLosses: "losses",
        noStreak: "No active streak",
        longestWin: "Best win streak",
        longestLose: "Longest losing streak",
        totalRounds: "Total rounds played",
        timelineEmpty: "No timeline data for the selected filters.",
        xp: "XP: {{value}}",
        gamesEmpty: "No games to display yet.",
        gamesHeading: "Top games",
        betTotal: "Bet: {{amount}} {{unit}}",
        profitTotal: "Profit: {{amount}}",
        xpTotal: "XP: {{value}}",
      },
      outcome: {
        win: "Win",
        lose: "Loss",
        tie: "Tie",
      },
    },
    wallet: {
      header: {
        accent: "Financial control",
        title: "Wallet & Bank",
        subtitle:
          "Track your transactions and move coins seamlessly between your wallet and the in-game bank.",
      },
      tabs: {
        transfer: "Transfer",
        history: "History",
        bank: "Bank",
      },
      transfer: {
        title: "Send coins to another player",
        description:
          "Enter the receiver ID and the amount you want to send. We will ask for confirmation before proceeding.",
        receiverLabel: "Receiver ID",
        amountLabel: "Amount (coins)",
        submit: "Confirm transfer",
        submitting: "Processing…",
        confirm: "Send {{amount}} coins to {{username}}?",
        validation: "Receiver ID and amount must be valid (>0).",
      },
      bank: {
        title: "Bank management",
        description:
          "Use the bank to keep your coins safe for high-stakes matches.",
        deposit: {
          title: "Deposit to bank",
          description: "Moves coins from your wallet to the bank.",
          placeholder: "Amount to deposit",
          submit: "Confirm deposit",
          submitting: "Depositing…",
          toastSuccess: "Deposited {{amount}} coins from wallet to bank.",
        },
        withdraw: {
          title: "Withdraw to wallet",
          description: "Moves coins from the bank back to your wallet.",
          placeholder: "Amount to withdraw",
          submit: "Confirm withdrawal",
          submitting: "Withdrawing…",
          toastSuccess: "Withdrew {{amount}} coins from bank to wallet.",
        },
        validation: "Amount must be greater than 0.",
      },
      history: {
        title: "Transaction history",
        subtitle: "Total transactions: {{count}}. Page {{page}}/{{total}}.",
        loading: "Loading transaction history…",
        empty: "No transactions yet.",
        paginationLabel: "Page {{page}} / {{total}}",
        prev: "← Previous page",
        next: "Next page →",
      },
      summary: {
        depositTitle: "Deposit to bank",
        depositSubtitle: "From wallet to bank",
        withdrawTitle: "Withdraw to wallet",
        withdrawSubtitle: "From bank to wallet",
        transferOutTitle: "Sent to {{username}}",
        transferOutSubtitle: "You sent coins",
        transferInTitle: "Received from {{username}}",
        transferInSubtitle: "You received coins",
        genericTitle: "Transaction",
      },
      toast: {
        transferSuccess: "You sent {{amount}} coins to {{username}}.",
      },
    },
    notifications: {
      page: {
        headerAccent: "Notification center",
        title: "Stay informed in real time",
        subtitle:
          "Track wallet activity, PvP invites, and seasonal rewards with localized updates.",
        listTitle: "Latest notifications",
        markReadHint:
          "Select a notification to mark it as read and open the linked action.",
        empty: "You are all caught up for now.",
        loginPrompt: "Please sign in to view notifications.",
        lastUpdated: "Last updated {{time}}",
        refresh: "Refresh",
        refreshing: "Refreshing…",
        markAll: "Mark all as read",
      },
      filters: {
        all: "All notifications",
        deposit: "Deposits",
        withdraw: "Withdrawals",
        transfer_sent: "Transfers sent",
        transfer_received: "Transfers received",
        game_win: "Game win",
        game_loss: "Game loss",
      },
      list: {
        timestamp: "Received {{time}}",
        unreadBadge: "New",
      },
      pagination: {
        prev: "← Previous page",
        next: "Next page →",
        label: "Page {{page}} / {{total}}",
      },
      dropdown: {
        title: "Notifications",
        empty: "You are all caught up!",
        refresh: "Refresh",
        refreshing: "Refreshing…",
        viewAll: "View all",
        ariaButton: "Open notifications menu",
        ariaBadge: "{{count}} unread notifications",
        markAll: "Mark all as read",
      },
    },
    friends: {
      header: {
        accent: "Social hub",
        title: "Stay connected",
        subtitle: "Manage friend requests, see who is online, and chat in real time.",
      },
      addForm: {
        label: "Add a friend by username",
        placeholder: "Enter username…",
        button: "Send request",
        helper: "Use their exact username. Requests are delivered instantly.",
      },
      requests: {
        incoming: "Incoming requests",
        outgoing: "Pending requests",
        accept: "Accept",
        reject: "Reject",
        cancel: "Cancel",
        emptyIncoming: "No incoming requests right now.",
        emptyOutgoing: "You have not sent any requests yet.",
      },
      list: {
        heading: "Friends",
        searchPlaceholder: "Search friends…",
        empty: "Add a friend to start chatting.",
  emptySearch: "No friends match your search.",
        online: "Online",
        offline: "Offline",
        remove: "Remove",
      },
      chat: {
        heading: "Messages",
        placeholder: "Type a message…",
        send: "Send",
        empty: "No messages yet — say hi!",
        selectPrompt: "Select a friend to view your conversation.",
        loading: "Loading conversation…",
        loadError: "Could not load messages.",
        loadPrevious: "Load previous messages",
      },
      status: {
        pending: "Pending",
        accepted: "Friends",
      },
      toasts: {
        requestSent: "Friend request sent",
        requestAccepted: "Friend request accepted",
        requestCanceled: "Friend request cancelled",
        friendRemoved: "Friend removed",
        messageFailed: "Message could not be sent",
      },
      errors: {
        load: "Unable to load friends right now.",
      },
    },
    rewardsPage: {
      header: {
        accent: "Rewards hub",
        title: "Claim bonuses and grow",
        subtitle:
          "Collect timed drops, keep your daily streak alive, and monitor level-up milestones in one place.",
      },
      loading: "Loading rewards…",
      loginRequired: "Please sign in to view rewards.",
      tabs: {
        periodic: "Periodic rewards",
        checkin: "Daily check-in",
        level: "Level-up rewards",
      },
      alertFallback: "Using cached data. Some timers may be out of sync.",
      progress: {
        title: "Level progress",
        subtitle: "Earn EXP across games and activities to keep climbing.",
      },
      periodic: {
        title: "Timed bonuses",
        description:
          "Collect your hourly, daily, and weekly coin drops before the timer resets.",
        cards: {
          hourly: {
            label: "Hourly chest",
            description: "Every hour delivers {{amount}} coins.",
          },
          daily: {
            label: "Daily payout",
            description: "Claim {{amount}} coins once per day.",
          },
          weekly: {
            label: "Weekly stash",
            description: "Secure {{amount}} coins every 7 days.",
          },
        },
        ctaReady: "Collect now",
        ctaWait: "Ready in {{time}}",
        toast: "Collected +{{amount}} coins!",
      },
      checkin: {
        title: "Daily check-in",
        description: "Log in each day to earn EXP and protect your streak.",
        statusReady: "You can check in now to protect your streak.",
        statusWait: "Come back in {{time}} to check in again.",
        buttonReady: "Check in now",
        buttonWait: "Come back in {{time}}",
        toast: "Received +{{exp}} EXP!",
        levelUpToast: "Level {{level}} reached! Keep it up.",
        lastCheck: "Last check-in: {{date}}",
        calendar: {
          title: "Check-in calendar",
          subtitle: "Mark each day you check in to maintain your streak.",
          prev: "Previous month",
          next: "Next month",
          today: "Current month",
          empty: "No check-ins yet this month.",
          outsideNotice: "Your last check-in was on {{date}}.",
          legend: {
            checked: "Checked-in",
            today: "Today",
          },
        },
      },
      level: {
        title: "Level-up rewards",
        description:
          "Each bracket needs more EXP. Stay active to continue leveling.",
        nextLabel: "Next level in {{exp}} EXP",
        capLabel: "You have reached the maximum level.",
        table: {
          range: "Levels",
          exp: "EXP to level up",
        },
      },
      levelRewards: {
        loading: "Loading level rewards…",
        error: "Unable to load level rewards right now.",
        heading: "Level-up rewards",
        currentLevel: "Level {{level}}",
        levelLabel: "Level {{level}}",
        claimed: "Claimed",
        available: "Available",
        locked: "Locked",
        rewardCoins: "{{amount}} {{unit}}",
        rewardXp: "{{amount}} XP",
        claimButton: "Claim reward",
        claiming: "Claiming…",
        toastClaimSuccess: "Level {{level}} reward claimed!",
        toastClaimError: "Unable to claim this reward. Please try again.",
        empty: "No level rewards configured yet.",
      },
    },
    games: {
      common: {
        back: "Back to games",
      },
      page: {
        headerAccent: "Arcade hub",
        title: "Pick your next challenge",
        subtitle:
          "Filter by mode, compare minimum stakes, and dive into provably fair matches.",
        explorerHint:
          "Browse the collection below and preview details before you jump in.",
        loading: "Loading games…",
        viewSolo: "Solo lobby",
        viewBattle: "Battle lobby",
        emptyTitle: "No games match your filters right now.",
        emptyAction: "Reset filters",
        previewAria: "Preview {{name}}",
      },
      filters: {
        typeLabel: "Mode",
        sortLabel: "Sort",
        searchPlaceholder: "Search by name…",
        typeOptions: {
          all: "All modes",
          solo: "Solo",
          battle: "PvP battle",
        },
        sortOptions: {
          nameAsc: "Name A-Z",
          nameDesc: "Name Z-A",
          stakeAsc: "Min stake ↑",
          stakeDesc: "Min stake ↓",
        },
      },
      modal: {
        comingSoon: "Coming soon",
        minStake: "Minimum stake",
        mode: "Mode",
        selectMode: "Choose a mode",
        solo: "Solo",
        battle: "PvP battle",
        close: "Close",
        play: "Play now",
        notAvailable: "Not available yet",
      },
      entries: {
        coinflip: {
          name: "Coinflip",
          description:
            "Double-or-nothing coin toss with provably-fair reveals.",
        },
        dice: {
          name: "Dice",
          description:
            "Roll to target — simple odds, quick rounds, high adrenaline.",
        },
        blackjackdice: {
          name: "Blackjack Dice",
          description: "Reach 21 with dice — blackjack rules, dice thrills.",
        },
        dicepoker: {
          name: "Dice Poker",
          description:
            "Roll five dice to craft poker hands — straights, houses, and more.",
        },
        roulette: {
          name: "Roulette",
          description: "Classic roulette board — red/black, dozens, and more.",
        },
        higherlower: {
          name: "Higher / Lower",
          description: "Predict the next number — simple and satisfying.",
        },
        slots: {
          name: "Slots",
          description: "Spin to win with vibrant reels and juicy bonuses.",
        },
        luckyfive: {
          name: "Lucky Five",
          description:
            "Pick five numbers and a color — match for massive multipliers.",
        },
        mines: {
          name: "Mines",
          description:
            "Pick safe tiles on a 15x15 grid — avoid the hidden mines.",
        },
          friends: "Bạn bè",
        tower: {
          name: "Tower",
          description:
            "Climb higher with 50% odds each step — cash out anytime up to 50x.",
        },
      },
      solo: {
        headerAccent: "Solo arena",
        title: "Choose a solo challenge",
        subtitle:
          "Sharpen your skills in single-player modes with instant wagers and provably fair rolls.",
        helper: "Pick any game below to jump straight into its solo lobby.",
        emptyTitle: "No solo games available right now.",
        emptyAction: "Return to games",
      },
      battle: {
        headerAccent: "PvP arena",
        title: "Challenge another player",
        subtitle:
          "Host or join head-to-head matches and settle wagers in real time.",
        helper: "Select a battle-ready game to create or join a PvP room.",
        emptyTitle: "No battle games are available at the moment.",
        emptyAction: "Return to games",
      },
      battleRooms: {
        headerAccent: "PvP rooms",
        title: "{{name}} battle rooms",
        subtitle:
          "Create or join head-to-head matches and settle wagers in real time.",
        helper: "Refresh to discover new rooms or host your own battle.",
        refresh: "Refresh",
        joinPlaceholder: "Enter room ID...",
        joinButton: "Join",
        createButton: "Create room",
        status: {
          waiting: "Waiting",
          active: "In progress",
          finished: "Finished",
        },
        labels: {
          roomId: "Room ID",
          bet: "Bet",
          players: "Players",
          hostSide: "Host side",
          dice: "Dice",
        },
        joinStates: {
          waiting: "Join room",
          active: "In progress",
          full: "Full",
          rejoin: "Resume match",
        },
        emptyTitle: "No rooms available yet",
        emptyDescription:
          "Be the first to host a battle and invite challengers.",
        emptyAction: "Create room",
        modal: {
          title: "Create battle room",
          betLabel: "Bet amount",
          betPlaceholder: "Enter wager",
          sideLabel: "Choose your side",
          sideHeads: "Heads",
          sideTails: "Tails",
          maxPlayersLabel: "Max players",
          diceLabel: "Dice type",
          cancel: "Cancel",
          confirm: "Create room",
          creating: "Creating...",
        },
      },
    },
  },
  vi: {
    common: {
      wallet: "Ví",
      bank: "Ngân hàng",
      coins: "xu",
      copyUnsupported: "Không thể copy ID trên thiết bị này.",
      copySuccess: "Đã copy ID người dùng!",
      copyShortSuccess: "ID đã copy thành công!",
      copyFailure: "Copy thất bại, vui lòng thử lại.",
      loginRequiredHistory: "Vui lòng đăng nhập để xem lịch sử chơi.",
      loginRequiredWallet: "Vui lòng đăng nhập để xem Ví.",
      confirm: "Xác nhận",
      cancel: "Hủy",
      previous: "← Trang trước",
      next: "Trang tiếp →",
      pageLabel: "Trang {{page}} / {{total}}",
    },
    loading: {
      appShell: "Đang chuẩn bị trải nghiệm…",
      home: "Đang tải trang chủ…",
      rankings: "Đang tải bảng xếp hạng…",
      rewards: "Đang tải Rewards…",
      auth: "Đang xác thực phiên đăng nhập…",
      profile: "Đang tải trang cá nhân…",
      settings: "Đang tải trang cài đặt…",
      history: "Đang tải lịch sử…",
      walletHistory: "Đang tải lịch sử giao dịch…",
      notifications: "Đang tải thông báo…",
  general: "Đang tải…",
    },
    navbar: {
      walletButton: {
        label: "Ví",
        bank: "Ngân hàng",
        open: "Mở ví",
      },
      language: {
        label: "Ngôn ngữ",
        english: "Tiếng Anh",
        vietnamese: "Tiếng Việt",
      },
      links: {
        game: "Trò chơi",
        rewards: "Phần thưởng",
  rankings: "Xếp hạng",
        profile: "Hồ sơ",
        collections: "Bộ sưu tập",
        friends: "Bạn bè",
        history: "Lịch sử",
        settings: "Cài đặt",
      },
      cta: {
        login: "Đăng nhập",
        register: "Tạo tài khoản",
      },
      menu: {
        navigationHeading: "Danh mục",
        adminHealth: "Quản trị hệ thống",
        logout: "Đăng xuất",
        playerFallback: "Người chơi",
      },
      level: {
        label: "Cấp",
        maxShort: "Cấp tối đa",
        maxMessage: "Đã đạt cấp tối đa",
      },
    },
    home: {
      news: {
        accent: "Nổi bật trực tiếp",
        title: "Đừng bỏ lỡ diễn biến nóng",
        subtitle:
          "Theo dõi giải đấu, sự kiện chớp nhoáng và thưởng theo mùa khi còn hiệu lực.",
        viewAll: "Xem tất cả cập nhật",
        items: {
          presence: {
            badge: "Trạng thái mới",
            title: "Trạng thái tự xoá giúp nhóm luôn đồng bộ",
            description:
              "Online, rảnh, bận cùng tin nhắn tuỳ chọn đồng bộ giữa navbar, hồ sơ và Social hub, tự xoá khi hết giờ.",
            action: "Cập nhật trạng thái",
          },
          social: {
            badge: "Social hub",
            title: "Chat, mời trận và quản lý bạn bè ngay trong sảnh",
            description:
              "Trung tâm mới gom DM, trạng thái và lời mời PvP tức thì cho mọi bàn đấu.",
            action: "Vào Social hub",
          },
          collections: {
            badge: "Tiến độ",
            title: "Mốc thành tựu ghi dấu mọi pha bùng nổ",
            description:
              "Khung trưng bày và mốc điểm mới giúp bạn khoe chuỗi thắng, jackpot và huy hiệu hiếm.",
            action: "Xem bộ sưu tập",
          },
        },
      },
      ctas: {
        heading: "Lối tắt quan trọng",
        play: {
          title: "Chơi game",
          description: "Khám phá mọi chế độ solo và PvP.",
        },
        rewards: {
          title: "Nhận thưởng",
          description: "Theo dõi thưởng theo giờ, ngày và theo mùa.",
        },
        wallet: {
          title: "Quản lý ví",
          description: "Chuyển xu, xem lịch sử và bổ sung ngân hàng.",
        },
        invite: {
          title: "Mời bạn bè",
          description: "Vào Social hub để gửi lời mời PvP và trò chuyện tức thì.",
        },
      },
      rankings: {
        accent: "Ảnh chụp BXH",
        title: "Bảng xếp hạng thành tích",
        subtitle: "Cập nhật mỗi 15 phút dựa trên trận đã kết thúc.",
        viewAll: "Xem bảng đầy đủ",
        periods: {
          daily: "theo ngày",
          weekly: "theo tuần",
          monthly: "theo tháng",
        },
        showing: "Đang hiển thị bảng {{period}}",
  empty: "Hiện chưa có ai tham gia bảng xếp hạng.",
  loading: "Đang tải bảng xếp hạng…",
        error: "Không thể tải bảng xếp hạng. Vui lòng thử lại sau.",
        table: {
          rank: "Hạng",
          player: "Người chơi",
          games: "Số trận",
          streak: "Chuỗi",
          profit: "Lợi nhuận",
        },
        streakSuffix: "chuỗi thắng",
        summary: {
          players: "Người chơi trong bảng",
          profit: "Tổng lợi nhuận",
          bestStreak: "Chuỗi thắng cao nhất",
        },
      },
    },
    admin: {
      loading: "Đang tải bảng điều khiển…",
      accessDenied: {
        title: "Từ chối truy cập",
        description: "Bạn không có quyền truy cập trang này.",
      },
      error: {
        title: "Lỗi",
        description: "Không thể tải bảng điều khiển.",
        retry: "Thử lại",
      },
      header: {
        title: "Bảng điều khiển quản trị",
        subtitle: "Tổng quan hệ thống và các công cụ quản lý",
      },
      stats: {
        totalUsers: {
          label: "Tổng người dùng",
          subtitle: "{{count}} tài khoản mới hôm nay",
        },
        activeRooms: {
          label: "Phòng PvP đang hoạt động",
          subtitle: "Trận đấu trực tuyến",
        },
        totalBalance: {
          label: "Tổng số dư",
          subtitle: "Xu trong hệ thống",
        },
        transactions: {
          label: "Giao dịch (24h)",
          subtitle: "24 giờ gần nhất",
        },
      },
      management: {
        user: {
          title: "Quản lý người dùng",
          description: "Quản lý tài khoản, vai trò và quyền hạn.",
        },
        metrics: {
          title: "Chỉ số hệ thống",
          description: "Theo dõi sức khỏe máy chủ và hiệu năng.",
        },
        transactions: {
          title: "Giao dịch",
          description: "Xem và kiểm soát mọi giao dịch.",
        },
        games: {
          title: "Cấu hình trò chơi",
          description: "Thiết lập thông số và quy tắc trò chơi.",
        },
        reports: {
          title: "Báo cáo",
          description: "Tạo và xem báo cáo hệ thống.",
        },
      },
      recentUsers: {
        title: "Người dùng mới",
        empty: "Chưa có người dùng mới.",
        joined: "Tham gia {{date}}",
      },
      topBalances: {
        title: "Top số dư",
        empty: "Chưa có dữ liệu.",
        level: "Cấp {{level}}",
      },
    },
    footer: {
      brand: {
        tagline: "Sòng bài trực tuyến",
        description:
          "CASI4F mang đến các đấu trường PvP tuyển chọn, nhiệm vụ theo mùa và trò chơi solo provably fair để bạn bè cùng trải nghiệm.",
        contact: "Cần hỗ trợ? Gửi email tới {{email}}",
      },
      sections: {
        games: {
          title: "Trò chơi",
          links: {
            catalog: "Danh mục trò chơi",
            solo: "Chế độ solo",
            battle: "Chế độ PvP",
            rewards: "Trung tâm phần thưởng",
            rankings: "Xếp hạng",
          },
        },
        info: {
          title: "Tài khoản",
          links: {
            history: "Lịch sử trò chơi",
            notifications: "Thông báo",
            profile: "Hồ sơ",
            settings: "Cài đặt",
            wallet: "Ví & ngân hàng",
          },
        },
        support: {
          title: "Hỗ trợ",
          links: {
            terms: "Điều khoản dịch vụ",
            provablyFair: "Chứng minh công bằng",
            security: "Bảo mật & quyền riêng tư",
          },
        },
      },
      social: {
        heading: "Kết nối cùng CASI4F",
      },
      legal: {
        copyright: "© {{year}} CASI4F. Đã đăng ký bản quyền.",
        privacy: "Chính sách bảo mật",
        terms: "Điều khoản dịch vụ",
        provablyFair: "Provably fair",
      },
    },
    auth: {
      common: {
        usernameOrEmail: "Tên đăng nhập hoặc Email",
        username: "Tên người dùng",
        email: "Email",
        password: "Mật khẩu",
        noAccount: "Chưa có tài khoản?",
        haveAccount: "Đã có tài khoản?",
        registerLink: "Tạo tài khoản",
        loginLink: "Đăng nhập",
        countdown: "Chuyển hướng sau {{seconds}}s…",
      },
      login: {
        headerAccent: "Chào mừng trở lại",
        title: "Đăng nhập để tiếp tục",
        subtitle: "Quản lý ví, nhận thưởng và chơi game ngay.",
        button: "Đăng nhập",
        processing: "Đang đăng nhập…",
        countdownButton: "Chuyển hướng sau {{seconds}}s…",
        countdownToast: "Đăng nhập thành công. Chuyển hướng sau {{seconds}}s…",
        successToast: "Đăng nhập thành công.",
        error: "Đăng nhập thất bại, vui lòng thử lại.",
        heroTitle: "Trải nghiệm an toàn, rút thưởng tức thì",
        heroSubtitle: "Tham gia PvP, solo game và quản lý ví linh hoạt.",
        heroBullets: [
          "Theo dõi số dư ví và ngân hàng theo thời gian thực.",
          "Mời bạn bè vào phòng PvP chỉ với một cú click.",
          "Nhận thưởng hàng ngày, hàng giờ và theo mùa.",
        ],
      },
      register: {
  headerAccent: "Tham gia đấu trường",
  title: "Tạo tài khoản CASI4F",
        subtitle: "Bắt đầu cạnh tranh, nhận thưởng và lưu dấu trận thắng.",
        button: "Tạo tài khoản",
        processing: "Đang tạo tài khoản…",
        successToast: "Đăng ký thành công. Hãy đăng nhập để tiếp tục.",
        error: "Đăng ký thất bại, vui lòng thử lại.",
        heroTitle: "Xây dựng huyền thoại của bạn",
        heroSubtitle: "Theo dõi mọi cược, nhận thưởng và thách đấu cộng đồng.",
        heroBullets: [
          "Ví an toàn với chuyển tiền ngân hàng tức thì.",
          "Game công bằng minh bạch với lịch sử rõ ràng.",
          "Hồ sơ cá nhân và trung tâm thông báo riêng.",
        ],
      },
    },
    settings: {
      toast: {
        currentPasswordMissing: "Vui lòng nhập mật khẩu hiện tại.",
        profileUpdated: "Cập nhật thông tin cá nhân thành công!",
        passwordMismatch: "Mật khẩu mới không khớp.",
        passwordUpdated: "Đổi mật khẩu thành công!",
        avatarInvalidType: "Vui lòng chọn đúng định dạng hình ảnh.",
        avatarProcessed: "Ảnh đại diện đã sẵn sàng!",
        avatarProcessFailed: "Không thể xử lý ảnh này. Hãy thử ảnh khác.",
      },
      header: {
        accent: "Tổng quan tài khoản",
        greeting: "Xin chào, {{name}} 👋",
      },
      badges: {
        role: "Vai trò",
        copyButton: "ID: {{id}}",
      },
      balance: {
        wallet: "Ví chính",
        bank: "Ngân hàng",
      },
      profileCard: {
        title: "Thông tin cá nhân",
        username: "Tên người dùng",
        email: "Email",
        avatar: "Ảnh đại diện",
        avatarUpload: "Thêm ảnh",
        avatarHint:
          "Nên dùng PNG, JPG hoặc WEBP. Hệ thống sẽ cắt vuông và tối ưu dưới 512KB.",
        dateOfBirth: "Ngày sinh",
        currentPassword: "Mật khẩu hiện tại",
        currentPasswordPlaceholder: "Nhập mật khẩu để xác nhận",
        submit: "Lưu thay đổi",
        submitting: "Đang lưu…",
      },
      passwordCard: {
        title: "Đổi mật khẩu",
        oldPassword: "Mật khẩu cũ",
        newPassword: "Mật khẩu mới",
        confirmPassword: "Xác nhận mật khẩu mới",
        submit: "Lưu mật khẩu",
        submitting: "Đang đổi…",
      },
      logoutCard: {
        title: "An toàn đăng xuất",
        description:
          "Nếu bạn đang dùng máy công cộng, hãy đăng xuất sau khi hoàn tất để giữ an toàn cho tài khoản.",
        button: "Đăng xuất",
      },
    },
    profile: {
      loading: "Đang tải trang cá nhân…",
      heroAccent: "Hồ sơ người chơi",
      levelProgressValue: "{{current}} / {{total}} kinh nghiệm",
      levelMax: "Đã đạt cấp tối đa",
      accountInfo: "Thông tin tài khoản",
      emailFallback: "Chưa cập nhật",
      birthDate: "Ngày sinh",
      birthDateFallback: "Chưa cập nhật",
      status: {
        label: "Trạng thái",
        states: {
          online: "Trực tuyến",
          idle: "Đang rảnh",
          busy: "Đang bận",
          offline: "Ngoại tuyến",
        },
        expiresAt: "Tự xoá lúc {{time}}",
      },
      security: "Bảo mật",
      securityValue: "Nên đổi mật khẩu định kỳ 30 ngày.",
      quickActions: "Hành động nhanh",
      settings: "Cài đặt tài khoản",
      history: "Lịch sử chơi",
      safetyTips: "Tips giữ an toàn",
      tips: [
        "Không chia sẻ OTP, mật khẩu cho người khác.",
        "Kích hoạt thông báo để nhận tin quan trọng.",
        "Kiểm tra lịch sử giao dịch định kỳ.",
      ],
      bio: {
        heading: "Giới thiệu",
        empty: "Bạn chưa viết đoạn giới thiệu nào.",
      },
      socials: {
        heading: "Liên kết",
        empty: "Hãy thêm các kênh của bạn để bạn bè theo dõi dễ dàng hơn.",
        visit: "Mở",
        labels: {
          discord: "Discord",
          twitter: "Twitter / X",
          twitch: "Twitch",
          youtube: "YouTube",
        },
      },
      showcase: {
        heading: "Thành tựu ghim",
        empty: "Chưa có thành tựu nào được ghim.",
      },
      achievements: {
        heading: "Thành tựu",
        summary: "Hoàn thành {{completed}} / {{total}}",
        completed: "Đã hoàn thành",
        locked: "Chưa đạt",
        empty: "Bạn chưa mở khóa thành tựu nào.",
        earnedOn: "Hoàn thành ngày {{date}}",
      },
      collections: {
        heading: "Bộ sưu tập",
        tabs: {
          achievements: "Thành tựu",
          inventory: "Kho đồ",
        },
        achievementsSummary: "Đã mở {{completed}} / {{total}} thành tựu",
        achievementNoDescription: "Chưa có mô tả.",
        achievementCompleted: "Đã hoàn thành",
        achievementLocked: "Chưa mở khóa",
        achievementsEmpty: "Bạn chưa mở khóa thành tựu nào.",
        unlockedAt: "Mở khóa ngày {{date}}",
        badgeReward: "Nhận huy hiệu: {{badge}}",
        badgeTier: "Bậc: {{tier}}",
        badgeOwned: "Đã sở hữu",
        badgeOwnedSince: "Sở hữu từ {{date}}",
        badgeLocked: "Chưa sở hữu — hãy đạt điều kiện để mở.",
        inventoryEmpty: "Kho đồ của bạn hiện đang trống.",
        quickAction: "Mở bộ sưu tập",
      },
      stats: {
        heading: "Thống kê hồ sơ",
        achievements: "Thành tựu",
        badges: "Huy hiệu",
      },
      badges: {
        heading: "Huy hiệu",
        active: "Huy hiệu đang dùng",
        owned: "Đang sở hữu",
        empty: "Bạn chưa sở hữu huy hiệu nào.",
        none: "Không dùng huy hiệu",
      },
      customize: {
        heroAccent: "Tùy chỉnh hồ sơ",
        quickAction: "Tùy chỉnh hồ sơ",
        heading: "Tùy chỉnh hồ sơ",
        description: "Chỉnh sửa thông tin cá nhân, liên kết mạng xã hội và thành tựu ghim.",
        identitySection: "Nhận diện hồ sơ",
        socialSection: "Hiện diện mạng xã hội",
        optionalLabel: "Không bắt buộc",
        backToProfile: "Quay lại hồ sơ",
        cancelButton: "Hủy",
        bioLabel: "Giới thiệu",
        bioPlaceholder: "Chia sẻ đôi điều về bạn…",
        statusStateLabel: "Trạng thái",
        statusStateHint: "Chọn cách bạn xuất hiện với mọi người.",
        statusMessageLabel: "Thông điệp trạng thái",
        statusMessagePlaceholder: "Chia sẻ nhanh hôm nay bạn đang làm gì…",
        statusMessageHint: "Thông điệp sẽ tự xoá khi hết thời gian.",
        statusDurationLabel: "Tự xoá sau",
        statusDuration: {
          options: {
            30: "30 phút",
            60: "1 giờ",
            240: "4 giờ",
            1440: "24 giờ",
          },
        },
        statusDurationHintActive:
          "Thông điệp sẽ xoá sau {{duration}} nếu bạn không thay đổi.",
        statusDurationHintDisabled: "Nhập thông điệp để bật tự xoá.",
        visibilityLabel: "Chế độ hiển thị",
        visibility: {
          public: "Công khai",
          friends: "Bạn bè",
          private: "Riêng tư",
        },
        activeBadgeLabel: "Huy hiệu đang dùng",
        activeBadgeNone: "Không dùng",
        socialLinksLabel: "Liên kết/handle mạng xã hội",
        socialLinksHint: "Nhập URL hoặc @handle. Hỗ trợ Discord, Twitter, Twitch, YouTube.",
        showcaseLabel: "Ghim thành tựu",
        showcaseHint: "Chọn tối đa {{limit}} thành tựu.",
        showcaseSelected: "Đã chọn {{count}} / {{limit}}",
        showcaseEmpty: "Hãy mở khóa thành tựu để ghim.",
        saveButton: "Lưu thay đổi",
        saving: "Đang lưu…",
        toastSuccess: "Cập nhật hồ sơ thành công!",
        toastShowcaseLimit: "Bạn chỉ được ghim tối đa {{limit}} thành tựu.",
      },
      public: {
        heroLabel: "Hồ sơ nổi bật",
        visibility: "Chế độ hiển thị: {{mode}}",
        memberSince: "Thành viên từ {{date}}",
        manageOwn: "Quản lý hồ sơ của bạn",
        metaHeading: "Thông tin hồ sơ",
        joinedLabel: "Tham gia",
        notFound: "Không tìm thấy hồ sơ",
        invalidUsername: "Không thể xác định tên người dùng trong liên kết này.",
        private: "Hồ sơ này đang để riêng tư",
        privateDescription: "Chỉ chủ sở hữu hoặc người được cho phép mới xem được hồ sơ này.",
        unauthorized: "Cần đăng nhập",
        unauthorizedDescription: "Hãy đăng nhập lại để xem hồ sơ này.",
        errorTitle: "Không thể tải hồ sơ",
        errorDescription: "Đã xảy ra lỗi khi tải hồ sơ này.",
        networkError: "Không thể kết nối. Vui lòng kiểm tra mạng và thử lại.",
        retry: "Thử lại",
        back: "Quay lại sảnh",
      },
    },
    collections: {
      heading: "Trung tâm bộ sưu tập",
      subtitle: "Xem lại thành tựu và quản lý huy hiệu đang sở hữu tại một nơi.",
      loading: "Đang tải bộ sưu tập…",
      back: "Quay lại hồ sơ",
      stats: {
        achievements: "Đã mở {{completed}} / {{total}} thành tựu",
        badges: "Đang sở hữu {{count}} huy hiệu",
      },
      catalog: {
        achievements: {
          LEVEL_5: {
            name: "Tân binh cứng cáp",
            description: "Đạt cấp 5 và mở khóa những lợi ích đầu tiên.",
          },
          LEVEL_10: {
            name: "Chiến binh kỳ cựu",
            description: "Tiếp tục luyện tập để chạm tới cấp 10.",
          },
          LEVEL_20: {
            name: "Huyền thoại 4FUN",
            description: "Cán mốc cấp 20 và trở thành biểu tượng của sòng bạc.",
          },
          COINFLIP_ROOKIE: {
            name: "Coinflip Rookie",
            description: "Làm quen với Coinflip bằng cách chơi 200 ván.",
          },
          COINFLIP_VETERAN: {
            name: "Coinflip Veteran",
            description: "Chinh phục 500 ván Coinflip.",
          },
          COINFLIP_LEGEND: {
            name: "Coinflip Legend",
            description: "Chơi 1.000 ván Coinflip để nhận huy hiệu tối thượng.",
          },
          COINFLIP_CHAMPION: {
            name: "Coinflip Champion",
            description: "Giành chiến thắng 250 ván Coinflip.",
          },
          COINFLIP_CONQUEROR: {
            name: "Coinflip Conqueror",
            description: "Chiến thắng 750 ván Coinflip và chứng tỏ đẳng cấp đỉnh cao.",
          },
          CHECKIN_STARTER: {
            name: "Thói quen mới",
            description: "Nhận thưởng đăng nhập 7 ngày.",
          },
          CHECKIN_VETERAN: {
            name: "Nghiện check-in",
            description: "Kiên trì nhận thưởng đăng nhập 30 ngày.",
          },
          REWARD_HUNTER: {
            name: "Thợ săn quà",
            description: "Nhận thưởng hằng ngày 30 lần.",
          },
          REWARD_COLLECTOR: {
            name: "Nhà sưu tầm phần thưởng",
            description: "Thu thập thưởng hằng ngày 100 lần.",
          },
          SOCIAL_STARTER: {
            name: "Kết nối đầu tiên",
            description: "Kết bạn thành công với 5 người chơi.",
          },
          SOCIAL_BUTTERFLY: {
            name: "Mạng lưới 4FUN",
            description: "Kết bạn thành công với 25 người chơi.",
          },
        },
        badges: {
          THE_FLIPPER: {
            name: "The Flipper",
            description: "Hoàn thành mốc Coinflip cao nhất để chứng tỏ bạn là bậc thầy tung đồng xu.",
          },
          LUCKY_STREAK: {
            name: "Lucky Streak",
            description: "Giành chuỗi chiến thắng Coinflip dài nhất và giữ vững phong độ.",
          },
          LOYAL_VISITOR: {
            name: "Loyal Visitor",
            description: "Đăng nhập nhận thưởng hằng ngày đủ lâu để trở thành khách quen của CASI4F.",
          },
          TREASURE_HUNTER: {
            name: "Treasure Hunter",
            description: "Không bỏ lỡ bất kỳ phần thưởng hằng ngày nào và gom hết quà tặng.",
          },
          SOCIAL_STAR: {
            name: "Social Star",
            description: "Kết bạn khắp nơi trong sảnh 4FUN và xây dựng mạng lưới riêng.",
          },
        },
      },
    },
    history: {
      loginRequired: "Vui lòng đăng nhập để xem lịch sử chơi.",
      empty:
        "Bạn chưa có lịch sử chơi nào. Hãy thử một trò chơi ngay hôm nay! 🎮",
      header: {
        solo: {
          headerAccent: "Sảnh solo",
          title: "Chọn một thử thách solo",
          subtitle:
            "Luyện kỹ năng ở chế độ một người với cược nhanh và kết quả minh bạch.",
          helper: "Chọn bất kỳ trò chơi nào bên dưới để vào sảnh solo.",
          emptyTitle: "Hiện không có trò chơi solo nào.",
          emptyAction: "Quay lại game",
        },
        battle: {
          headerAccent: "Đấu trường PvP",
          title: "Thách đấu người chơi khác",
          subtitle:
            "Tạo hoặc tham gia trận đối kháng, giải quyết cược theo thời gian thực.",
          helper:
            "Chọn một trò chơi hỗ trợ PvP để tạo hoặc tham gia phòng đấu.",
          emptyTitle: "Hiện chưa có trò chơi PvP phù hợp.",
          emptyAction: "Quay lại game",
        },
        accent: "Thống kê tổng quan",
        title: "Lịch sử trò chơi",
        subtitle:
          "Hiển thị dữ liệu trang {{page}}/{{total}} — tổng {{count}} ván.",
      },
      error: {
        generic: "Không thể tải lịch sử. Vui lòng thử lại sau.",
        analytics: "Chưa thể tải thống kê. Vui lòng thử lại trong giây lát.",
      },
      stats: {
        wins: "Thắng (trang này)",
        bets: "Cược (trang này)",
        payout: "Payout (trang này)",
        winRate: "Tỷ lệ thắng",
        netProfit: "Lợi nhuận ròng",
        totalXp: "Kinh nghiệm nhận được",
      },
      pagination: {
        prev: "← Trang trước",
        label: "Trang {{page}} / {{total}}",
        next: "Trang tiếp theo →",
      },
      entry: {
        bet: "Cược {{amount}} {{unit}}",
        payout: "Payout: {{amount}} {{unit}}",
        stakeLabel: "Tiền cược",
        payoutLabel: "Nhận về",
        performance: "Hiệu suất",
        xpGain: "Kinh nghiệm",
        unknown: "Không rõ",
      },
      filters: {
        heading: "Bộ lọc",
        from: "Từ ngày",
        to: "Đến ngày",
        game: "Trò chơi",
        allGames: "Tất cả trò chơi",
        outcome: "Kết quả",
        outcomes: {
          all: "Tất cả",
          win: "Thắng",
          lose: "Thua",
          tie: "Hoà",
        },
        apply: "Áp dụng",
        applying: "Đang áp dụng…",
        reset: "Đặt lại",
      },
      analytics: {
        heading: "Thống kê thành tích",
        loading: "Đang tổng hợp dữ liệu trận đấu…",
        rounds: "Số ván: {{count}}",
        currentStreak: "Chuỗi hiện tại",
        streakWins: "trận thắng",
        streakLosses: "trận thua",
        noStreak: "Chưa có chuỗi",
        longestWin: "Chuỗi thắng tốt nhất",
        longestLose: "Chuỗi thua dài nhất",
        totalRounds: "Tổng số ván đã chơi",
        timelineEmpty: "Chưa có dữ liệu theo thời gian với bộ lọc hiện tại.",
        xp: "Kinh nghiệm: {{value}}",
        gamesEmpty: "Chưa có trò chơi nào để hiển thị.",
        gamesHeading: "Top trò chơi",
        betTotal: "Cược: {{amount}} {{unit}}",
        profitTotal: "Lợi nhuận: {{amount}}",
        xpTotal: "Kinh nghiệm: {{value}}",
      },
      outcome: {
        win: "Thắng",
        lose: "Thua",
        tie: "Hoà",
      },
    },
    wallet: {
      header: {
        accent: "Quản lý tài chính",
        title: "Ví & Ngân hàng",
        subtitle:
          "Theo dõi giao dịch của bạn và chuyển tiền linh hoạt giữa Ví - Ngân hàng.",
      },
      tabs: {
        transfer: "Chuyển khoản",
        history: "Lịch sử",
        bank: "Ngân hàng",
      },
      transfer: {
        title: "Chuyển tiền tới người chơi khác",
        description:
          "Nhập ID người nhận và số tiền muốn chuyển. Hệ thống sẽ xác nhận trước khi thực hiện.",
        receiverLabel: "ID người nhận",
        amountLabel: "Số tiền (xu)",
        submit: "Xác nhận chuyển",
        submitting: "Đang xử lý…",
        confirm: "Chuyển {{amount}} xu cho {{username}}?",
        validation: "ID và số tiền phải hợp lệ (>0).",
      },
      bank: {
        title: "Quản lý ngân hàng",
        description:
          "Dùng ngân hàng để giữ tiền an toàn trong những trận cược lớn.",
        deposit: {
          title: "Gửi tiền vào ngân hàng",
          description: "Số tiền sẽ chuyển từ Ví chính sang Ngân hàng.",
          placeholder: "Số tiền muốn gửi",
          submit: "Xác nhận gửi",
          submitting: "Đang gửi…",
          toastSuccess: "Đã chuyển {{amount}} xu từ Ví sang Ngân hàng.",
        },
        withdraw: {
          title: "Rút tiền về ví",
          description: "Số tiền sẽ chuyển từ Ngân hàng về Ví chính của bạn.",
          placeholder: "Số tiền muốn rút",
          submit: "Xác nhận rút",
          submitting: "Đang rút…",
          toastSuccess: "Đã rút {{amount}} xu từ Ngân hàng về Ví.",
        },
        validation: "Số tiền phải > 0.",
      },
      history: {
        title: "Lịch sử giao dịch",
        subtitle: "Tổng số giao dịch: {{count}}. Trang {{page}}/{{total}}.",
        loading: "Đang tải lịch sử giao dịch…",
        empty: "Hiện chưa có giao dịch nào.",
        paginationLabel: "Trang {{page}} / {{total}}",
        prev: "← Trang trước",
        next: "Trang tiếp →",
      },
      summary: {
        depositTitle: "Nạp vào ngân hàng",
        depositSubtitle: "Từ Ví sang Ngân hàng",
        withdrawTitle: "Rút về ví",
        withdrawSubtitle: "Từ Ngân hàng về Ví",
        transferOutTitle: "Chuyển tới {{username}}",
        transferOutSubtitle: "Bạn chuyển đi",
        transferInTitle: "Nhận từ {{username}}",
        transferInSubtitle: "Bạn nhận được",
        genericTitle: "Giao dịch",
      },
      toast: {
        transferSuccess: "Bạn đã chuyển {{amount}} xu cho {{username}}.",
      },
    },
    notifications: {
      page: {
        headerAccent: "Trung tâm thông báo",
        title: "Theo dõi tức thời",
        subtitle:
          "Quản lý biến động ví, lời mời PvP và phần thưởng theo thời gian thực.",
        listTitle: "Thông báo mới nhất",
        markReadHint:
          "Chọn thông báo để đánh dấu đã đọc và mở hành động liên quan.",
        empty: "Hiện bạn đã xem hết thông báo.",
        loginPrompt: "Vui lòng đăng nhập để xem thông báo.",
        lastUpdated: "Cập nhật lần cuối {{time}}",
        refresh: "Làm mới",
        refreshing: "Đang tải…",
        markAll: "Đánh dấu tất cả đã đọc",
      },
      filters: {
        all: "Tất cả",
        deposit: "Nạp tiền",
        withdraw: "Rút tiền",
        transfer_sent: "Chuyển đi",
        transfer_received: "Nhận về",
        game_win: "Thắng game",
        game_loss: "Thua game",
      },
      list: {
        timestamp: "Nhận lúc {{time}}",
        unreadBadge: "Mới",
      },
      pagination: {
        prev: "← Trang trước",
        next: "Trang tiếp →",
        label: "Trang {{page}} / {{total}}",
      },
      dropdown: {
        title: "Thông báo",
        empty: "Bạn đã xem hết thông báo!",
        refresh: "Làm mới",
        refreshing: "Đang tải…",
        viewAll: "Xem tất cả",
        ariaButton: "Mở menu thông báo",
        ariaBadge: "{{count}} thông báo chưa đọc",
        markAll: "Đánh dấu tất cả đã đọc",
      },
    },
    friends: {
      header: {
        accent: "Kết nối",
        title: "Giữ liên lạc với bạn bè",
        subtitle: "Quản lý lời mời, xem ai đang online và trò chuyện ngay lập tức.",
      },
      addForm: {
        label: "Thêm bạn bằng tên người dùng",
        placeholder: "Nhập tên người dùng…",
        button: "Gửi lời mời",
        helper: "Nhập chính xác username. Lời mời sẽ gửi ngay lập tức.",
      },
      requests: {
        incoming: "Lời mời đến",
        outgoing: "Đang chờ phản hồi",
        accept: "Chấp nhận",
        reject: "Từ chối",
        cancel: "Hủy",
        emptyIncoming: "Hiện chưa có lời mời nào.",
        emptyOutgoing: "Bạn chưa gửi lời mời kết bạn nào.",
      },
      list: {
        heading: "Danh sách bạn bè",
        searchPlaceholder: "Tìm kiếm bạn bè…",
        empty: "Hãy thêm bạn để bắt đầu trò chuyện.",
  emptySearch: "Không tìm thấy bạn bè phù hợp với tìm kiếm.",
        online: "Đang online",
        offline: "Offline",
        remove: "Xóa",
      },
      chat: {
        heading: "Tin nhắn",
        placeholder: "Nhập tin nhắn…",
        send: "Gửi",
        empty: "Chưa có tin nhắn nào — hãy bắt đầu trò chuyện!",
        selectPrompt: "Chọn một người bạn để xem cuộc trò chuyện.",
        loading: "Đang tải hội thoại…",
        loadError: "Không thể tải hội thoại.",
        loadPrevious: "Tải tin nhắn cũ",
      },
      status: {
        pending: "Đang chờ",
        accepted: "Bạn bè",
      },
      toasts: {
        requestSent: "Đã gửi lời mời kết bạn",
        requestAccepted: "Đã chấp nhận lời mời",
        requestCanceled: "Đã hủy lời mời kết bạn",
        friendRemoved: "Đã xóa bạn khỏi danh sách",
        messageFailed: "Không thể gửi tin nhắn",
      },
      errors: {
        load: "Không thể tải danh sách bạn bè.",
      },
    },
    rewardsPage: {
      header: {
        accent: "Trung tâm phần thưởng",
        title: "Nhận thưởng và tăng cấp",
        subtitle:
          "Nhận thưởng định kỳ, điểm danh mỗi ngày và theo dõi mốc tăng cấp chỉ trong một giao diện.",
      },
      loading: "Đang tải Rewards…",
      loginRequired: "Vui lòng đăng nhập để xem Rewards.",
      tabs: {
        periodic: "Thưởng định kỳ",
        checkin: "Điểm danh hàng ngày",
        level: "Thưởng tăng cấp",
      },
      alertFallback:
        "Đang dùng dữ liệu tạm thời, thời gian chờ có thể chưa chính xác.",
      progress: {
        title: "Tiến trình cấp độ",
        subtitle: "Nhận EXP từ mọi hoạt động để tiếp tục leo hạng.",
      },
      periodic: {
        title: "Thưởng theo thời gian",
        description:
          "Nhận thưởng theo giờ, ngày và tuần trước khi bộ đếm đặt lại.",
        cards: {
          hourly: {
            label: "Rương theo giờ",
            description: "Mở {{amount}} xu mỗi giờ.",
          },
          daily: {
            label: "Thưởng mỗi ngày",
            description: "Nhận {{amount}} xu mỗi ngày.",
          },
          weekly: {
            label: "Thưởng mỗi tuần",
            description: "Thu {{amount}} xu mỗi 7 ngày.",
          },
        },
        ctaReady: "Nhận ngay",
        ctaWait: "Sẵn sàng sau {{time}}",
        toast: "Bạn đã nhận +{{amount}} xu!",
      },
      checkin: {
        title: "Điểm danh mỗi ngày",
        description: "Đăng nhập hằng ngày để nhận EXP và giữ streak.",
        statusReady: "Bạn có thể điểm danh ngay để giữ streak.",
        statusWait: "Hãy quay lại sau {{time}} để điểm danh tiếp.",
        buttonReady: "Điểm danh ngay",
        buttonWait: "Quay lại sau {{time}}",
        toast: "Bạn đã nhận +{{exp}} EXP!",
        levelUpToast: "Chúc mừng! Bạn đã lên cấp {{level}}.",
        lastCheck: "Lần điểm danh gần nhất: {{date}}",
        calendar: {
          title: "Lịch điểm danh",
          subtitle: "Đánh dấu những ngày bạn đã điểm danh trong tháng.",
          prev: "Tháng trước",
          next: "Tháng sau",
          today: "Tháng hiện tại",
          empty: "Chưa có lượt điểm danh trong tháng này.",
          outsideNotice: "Lần điểm danh gần nhất vào ngày {{date}}.",
          legend: {
            checked: "Đã điểm danh",
            today: "Hôm nay",
          },
        },
      },
      level: {
        title: "Thưởng tăng cấp",
        description:
          "Mỗi nhóm cấp yêu cầu nhiều EXP hơn. Giữ nhịp để tiếp tục thăng tiến.",
        nextLabel: "Cần {{exp}} EXP để lên cấp tiếp theo.",
        capLabel: "Bạn đã đạt cấp tối đa.",
        table: {
          range: "Khoảng cấp",
          exp: "EXP cần thiết",
        },
      },
      levelRewards: {
        loading: "Đang tải thưởng cấp độ…",
        error: "Không thể tải danh sách thưởng cấp độ lúc này.",
        heading: "Thưởng tăng cấp",
        currentLevel: "Cấp {{level}}",
        levelLabel: "Cấp {{level}}",
        claimed: "Đã nhận",
        available: "Có thể nhận",
        locked: "Chưa mở khóa",
        rewardCoins: "{{amount}} {{unit}}",
        rewardXp: "{{amount}} EXP",
        claimButton: "Nhận thưởng",
        claiming: "Đang nhận…",
        toastClaimSuccess: "Bạn đã nhận thưởng cấp {{level}}!",
        toastClaimError: "Hiện không thể nhận thưởng. Vui lòng thử lại.",
        empty: "Chưa có thưởng cấp độ nào được thiết lập.",
      },
    },
    games: {
      common: {
        back: "Quay lại danh sách trò chơi",
      },
      page: {
        headerAccent: "Kho trò chơi",
        title: "Chọn thử thách tiếp theo",
        subtitle:
          "Lọc theo chế độ, so sánh mức cược tối thiểu và bắt đầu trận đấu công bằng.",
        explorerHint:
          "Duyệt danh mục bên dưới và xem trước chi tiết trước khi vào trận.",
        loading: "Đang tải danh sách trò chơi…",
        viewSolo: "Sảnh Solo",
        viewBattle: "Sảnh PvP",
        emptyTitle: "Không tìm thấy trò chơi phù hợp với bộ lọc.",
        emptyAction: "Đặt lại bộ lọc",
        previewAria: "Xem trước {{name}}",
      },
      filters: {
        typeLabel: "Chế độ",
        sortLabel: "Sắp xếp",
        searchPlaceholder: "Tìm theo tên…",
        typeOptions: {
          all: "Tất cả chế độ",
          solo: "Solo",
          battle: "PvP",
        },
        sortOptions: {
          nameAsc: "Tên A-Z",
          nameDesc: "Tên Z-A",
          stakeAsc: "Mức cược ↑",
          stakeDesc: "Mức cược ↓",
        },
      },
      modal: {
        comingSoon: "Sắp ra mắt",
        minStake: "Cược tối thiểu",
        mode: "Chế độ",
        selectMode: "Chọn chế độ",
        solo: "Solo",
        battle: "PvP",
        close: "Đóng",
        play: "Chơi ngay",
        notAvailable: "Chưa khả dụng",
      },
      entries: {
        coinflip: {
          name: "Coinflip",
          description:
            "Tung đồng xu ăn thua đủ với kết quả minh bạch, công bằng.",
        },
        dice: {
          name: "Dice",
          description:
            "Quăng xúc xắc đạt mục tiêu — luật đơn giản, tốc độ cao.",
        },
        blackjackdice: {
          name: "Blackjack Dice",
          description:
            "Chạm mốc 21 bằng xúc xắc — hòa quyện blackjack và dice.",
        },
        dicepoker: {
          name: "Dice Poker",
          description:
            "Quăng 5 viên để tạo tay poker — thùng, sảnh, full house và hơn thế.",
        },
        roulette: {
          name: "Roulette",
          description: "Bàn roulette cổ điển — đỏ/đen, tá, hàng chục đầy đủ.",
        },
        higherlower: {
          name: "Higher / Lower",
          description: "Dự đoán con số kế tiếp — dễ chơi, gây nghiện.",
        },
        slots: {
          name: "Slots",
          description: "Quay máy rực rỡ sắc màu, thưởng lớn hấp dẫn.",
        },
        luckyfive: {
          name: "Lucky Five",
          description:
            "Chọn 5 số và màu sắc — trúng khớp nhận nhân thưởng khủng.",
        },
        mines: {
          name: "Mines",
          description: "Chọn ô an toàn trên lưới 15x15 — tránh 40 quả mìn ẩn.",
        },
        tower: {
          name: "Tower",
          description:
            "Leo tháp với tỷ lệ 50% từng bước — rút thưởng bất cứ lúc nào tới 50x.",
        },
      },
      solo: {
        headerAccent: "Sảnh solo",
        title: "Chọn một thử thách solo",
        subtitle:
          "Luyện kỹ năng ở chế độ một người với cược nhanh và kết quả minh bạch.",
        helper: "Chọn bất kỳ trò chơi nào bên dưới để vào sảnh solo.",
        emptyTitle: "Hiện không có trò chơi solo nào.",
        emptyAction: "Quay lại game",
      },
      battle: {
        headerAccent: "Đấu trường PvP",
        title: "Thách đấu người chơi khác",
        subtitle:
          "Tạo hoặc tham gia trận đối kháng, giải quyết cược theo thời gian thực.",
        helper: "Chọn một trò chơi hỗ trợ PvP để tạo hoặc tham gia phòng đấu.",
        emptyTitle: "Hiện chưa có trò chơi PvP phù hợp.",
        emptyAction: "Quay lại game",
      },
      battleRooms: {
        headerAccent: "Phòng PvP",
        title: "Phòng đấu {{name}}",
        subtitle:
          "Tạo hoặc tham gia trận đối kháng và phân định thắng thua ngay lập tức.",
        helper: "Làm mới để xem phòng mới hoặc tự tạo phòng của bạn.",
        refresh: "Làm mới",
        joinPlaceholder: "Nhập mã phòng...",
        joinButton: "Tham gia",
        createButton: "Tạo phòng",
        status: {
          waiting: "Đang chờ",
          active: "Đang diễn ra",
          finished: "Đã kết thúc",
        },
        labels: {
          roomId: "Mã phòng",
          bet: "Cược",
          players: "Người chơi",
          hostSide: "Chủ phòng chọn",
          dice: "Loại xúc xắc",
        },
        joinStates: {
          waiting: "Vào phòng",
          active: "Đang chơi",
          full: "Đã đầy",
          rejoin: "Quay lại phòng",
        },
        emptyTitle: "Chưa có phòng nào",
        emptyDescription: "Hãy là người mở phòng đầu tiên và mời đối thủ.",
        emptyAction: "Tạo phòng",
        modal: {
          title: "Tạo phòng PvP",
          betLabel: "Mức cược",
          betPlaceholder: "Nhập số tiền cược",
          sideLabel: "Chọn mặt",
          sideHeads: "Sấp",
          sideTails: "Ngửa",
          maxPlayersLabel: "Số người tối đa",
          diceLabel: "Loại xúc xắc",
          cancel: "Huỷ",
          confirm: "Tạo phòng",
          creating: "Đang tạo...",
        },
      },
    },
  },
};

const LocaleContext = createContext({
  language: "en",
  locale: localeMap.en,
  setLanguage: () => {},
  t: (key) => key,
});

function resolveTranslation(language, key) {
  const segments = key.split(".");
  let value = translations[language];

  for (const segment of segments) {
    if (value && Object.prototype.hasOwnProperty.call(value, segment)) {
      value = value[segment];
    } else {
      value = undefined;
      break;
    }
  }

  if (value === undefined && language !== "en") {
    return resolveTranslation("en", key);
  }

  if (value === undefined) return key;

  return value;
}

export function LocaleProvider({ children }) {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("app:language");
      if (stored && translations[stored]) {
        setLanguage(stored);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const updateLanguage = useCallback((nextLang) => {
    if (!translations[nextLang]) return;

    setLanguage(nextLang);
    try {
      localStorage.setItem("app:language", nextLang);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key, variables) => {
      const template = resolveTranslation(language, key);

      if (typeof template === "string") {
        if (!variables) return template;
        return template.replace(/{{(\w+)}}/g, (match, varName) => {
          if (variables[varName] === undefined || variables[varName] === null) {
            return "";
          }
          return String(variables[varName]);
        });
      }

      return template;
    },
    [language],
  );

  const value = useMemo(
    () => ({
      language,
      locale: localeMap[language] || localeMap.en,
      setLanguage: updateLanguage,
      t,
    }),
    [language, updateLanguage, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
