// client/src/app/admin/games/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import useApi from "@/hooks/useApi";
import LoadingState from "@/components/LoadingState";
import {
  ArrowLeft,
  Gamepad2,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Settings,
} from "lucide-react";

const GAMES = [
  {
    id: "coinflip",
    name: "Coinflip",
    multiplier: 2.0,
    minBet: 1,
    maxBet: 10000,
    enabled: true,
  },
  {
    id: "dice",
    name: "Dice",
    multiplier: 1.98,
    minBet: 1,
    maxBet: 10000,
    enabled: true,
  },
  {
    id: "blackjackdice",
    name: "Blackjack Dice",
    multiplier: 1.5,
    minBet: 1,
    maxBet: 5000,
    enabled: true,
  },
  {
    id: "dicepoker",
    name: "Dice Poker",
    multiplier: 2.0,
    minBet: 1,
    maxBet: 5000,
    enabled: true,
  },
  {
    id: "higherlower",
    name: "Higher/Lower",
    multiplier: 1.5,
    minBet: 1,
    maxBet: 10000,
    enabled: true,
  },
  {
    id: "luckyfive",
    name: "Lucky Five",
    multiplier: 5.0,
    minBet: 1,
    maxBet: 5000,
    enabled: true,
  },
  {
    id: "slots",
    name: "Slots",
    multiplier: 10.0,
    minBet: 1,
    maxBet: 1000,
    enabled: true,
  },
  {
    id: "mines",
    name: "Mines",
    multiplier: 24.0,
    minBet: 1,
    maxBet: 1000,
    enabled: true,
  },
  {
    id: "tower",
    name: "Tower",
    multiplier: 100.0,
    minBet: 1,
    maxBet: 1000,
    enabled: true,
  },
  {
    id: "roulette",
    name: "Roulette",
    multiplier: 36.0,
    minBet: 1,
    maxBet: 5000,
    enabled: true,
  },
];

export default function GameConfigurationPage() {
  const router = useRouter();
  const { user } = useUser();
  const { get, post } = useApi();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gameConfigs, setGameConfigs] = useState(GAMES);
  const [hasChanges, setHasChanges] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/");
      return;
    }

    if (user) {
      loadConfigs();
    }
  }, [user, router]);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await get("/admin/games/config");
      if (data.configs && data.configs.length > 0) {
        setGameConfigs(data.configs);
      }
      setLoading(false);
    } catch (err) {
      console.error("Failed to load game configs:", err);
      setLoading(false);
    }
  };

  const handleChange = (gameId, field, value) => {
    setGameConfigs((prev) =>
      prev.map((game) =>
        game.id === gameId ? { ...game, [field]: value } : game
      )
    );
    setHasChanges(true);
    setMessage({ type: "", text: "" });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await post("/admin/games/config", { configs: gameConfigs });
      setHasChanges(false);
      setMessage({ type: "success", text: "Game configurations saved successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      console.error("Failed to save configs:", err);
      setMessage({ type: "error", text: err.message || "Failed to save configurations" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!confirm("Reset all game configurations to default values?")) return;
    setGameConfigs(GAMES);
    setHasChanges(true);
    setMessage({ type: "", text: "" });
  };

  if (!user || user.role !== "admin") return null;

  if (loading) {
    return <LoadingState message="Loading game configuration..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin")}
            className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">Game Configuration</h1>
              <p className="mt-2 text-gray-400">
                Configure game settings, multipliers, and betting limits
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white hover:bg-white/10 disabled:opacity-50"
              >
                <RotateCcw className="h-5 w-5" />
                Reset to Default
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-3 font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-xl border p-4 ${
              message.type === "success"
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : "border-red-500/30 bg-red-500/10 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <p className="font-semibold">{message.text}</p>
          </div>
        )}

        {/* Games Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {gameConfigs.map((game) => (
            <div
              key={game.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gamepad2 className="h-6 w-6 text-purple-400" />
                  <h3 className="text-xl font-bold text-white">{game.name}</h3>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={game.enabled}
                    onChange={(e) =>
                      handleChange(game.id, "enabled", e.target.checked)
                    }
                    className="h-5 w-5 rounded"
                  />
                  <span className="text-sm text-white/80">Enabled</span>
                </label>
              </div>

              <div className="space-y-4">
                {/* Max Multiplier */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">
                    Max Multiplier
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="1000"
                    value={game.multiplier}
                    onChange={(e) =>
                      handleChange(game.id, "multiplier", Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Min Bet */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">
                    Minimum Bet
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={game.minBet}
                    onChange={(e) =>
                      handleChange(game.id, "minBet", Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Max Bet */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-white/80">
                    Maximum Bet
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={game.maxBet}
                    onChange={(e) =>
                      handleChange(game.id, "maxBet", Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Status Badge */}
                <div className="pt-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      game.enabled
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {game.enabled ? "Active" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="mt-8 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6">
          <div className="flex items-start gap-3">
            <Settings className="h-6 w-6 text-blue-400" />
            <div>
              <h4 className="font-semibold text-blue-400">Configuration Notes</h4>
              <ul className="mt-2 space-y-1 text-sm text-blue-300/80">
                <li>• Changes will take effect immediately after saving</li>
                <li>• Disabled games will not be accessible to players</li>
                <li>• Multiplier affects maximum possible winnings</li>
                <li>• Bet limits help control risk and bankroll management</li>
                <li>• Use "Reset to Default" to restore recommended settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
