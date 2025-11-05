// client/src/app/settings/page.js
"use client";

import RequireAuth from "@/components/RequireAuth";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import useApi from "../../hooks/useApi";
import { useUser } from "../../context/UserContext";
import Loading from "../../components/Loading";
import { toast } from "react-hot-toast";
import { useLocale } from "../../context/LocaleContext";
import {
  Calendar,
  Copy,
  Loader2,
  Lock,
  LogOut,
  Mail,
  ShieldCheck,
  User as UserIcon,
  Image as ImageIcon,
} from "lucide-react";

const MAX_AVATAR_BYTES = 512 * 1024;
const MAX_AVATAR_DIMENSION = 512;

function SettingsPage() {
  const { user, fetchUser, logout } = useUser();
  const { patch, post } = useApi();
  const { t } = useLocale();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    setUsername(user.username);
    setEmail(user.email);
    setAvatar(user.avatar || "");
    setDateOfBirth(user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "");
  }, [user]);

  const translate = useCallback(
    (key, fallback, options) => {
      const result = t(key, options);
      if (result && result !== key) {
        return result;
      }
      return fallback;
    },
    [t],
  );

  const rawAvatarLabel = translate("settings.profileCard.avatar", "Avatar");
  const avatarLabel =
    typeof rawAvatarLabel === "string" && rawAvatarLabel.toLowerCase().includes("url")
      ? "Avatar"
      : rawAvatarLabel;
  const avatarButtonLabel = translate("settings.profileCard.avatarUpload", "Add image");
  const avatarHint = translate(
    "settings.profileCard.avatarHint",
    "PNG, JPG or WEBP recommended. We crop to a square and optimise up to 512KB.",
  );

  const triggerAvatarPicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const processAvatarFile = useCallback(async (file) => {
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = await new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = objectUrl;
      });

      const side = Math.min(image.width, image.height);
      if (!side) {
        throw new Error("Unable to read image dimensions");
      }

      const canvasSize = Math.min(MAX_AVATAR_DIMENSION, side);
      const startX = (image.width - side) / 2;
      const startY = (image.height - side) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = canvasSize;
      canvas.height = canvasSize;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas rendering is unavailable");
      }

      ctx.drawImage(image, startX, startY, side, side, 0, 0, canvasSize, canvasSize);

      const exportAsBlob = (type, quality) =>
        new Promise((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to prepare avatar"));
                return;
              }
              resolve(blob);
            },
            type,
            quality,
          );
        });

      const tryBlobWithQuality = async (type, qualities) => {
        for (const quality of qualities) {
          const blob = await exportAsBlob(type, quality);
          if (blob.size <= MAX_AVATAR_BYTES || quality === qualities[qualities.length - 1]) {
            return blob;
          }
        }
        return null;
      };

      const originalType = file.type.toLowerCase();
      const qualitySteps = [0.92, 0.82, 0.72, 0.62, 0.52];

      const candidates = [];
      if (originalType === "image/png") {
        candidates.push(async () => exportAsBlob("image/png"));
        candidates.push(async () => tryBlobWithQuality("image/jpeg", qualitySteps));
      } else if (originalType === "image/webp") {
        candidates.push(async () => tryBlobWithQuality("image/webp", qualitySteps));
        candidates.push(async () => tryBlobWithQuality("image/jpeg", qualitySteps));
      } else {
        candidates.push(async () => tryBlobWithQuality("image/jpeg", qualitySteps));
        candidates.push(async () => exportAsBlob("image/png"));
      }

      for (const getBlob of candidates) {
        const blob = await getBlob();
        if (blob && blob.size <= MAX_AVATAR_BYTES) {
          return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (typeof reader.result === "string") {
                resolve(reader.result);
              } else {
                reject(new Error("Failed to generate preview"));
              }
            };
            reader.onerror = () => reject(new Error("Failed to read processed image"));
            reader.readAsDataURL(blob);
          });
        }
      }

      throw new Error("Unable to optimise avatar under 512KB");
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }, []);

  const handleAvatarFileChange = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error(
          translate("settings.toast.avatarInvalidType", "Unsupported image type"),
        );
        event.target.value = "";
        return;
      }

      try {
        const processed = await processAvatarFile(file);
        setAvatar(processed);
        toast.success(
          translate(
            "settings.toast.avatarProcessed",
            "Avatar cropped and preview updated",
          ),
        );
      } catch (error) {
        toast.error(
          error instanceof Error && error.message
            ? error.message
            : translate("settings.toast.avatarProcessFailed", "Could not update avatar"),
        );
      } finally {
        event.target.value = "";
      }
    },
    [processAvatarFile, translate],
  );

  const inputClassName = useMemo(
    () =>
      "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/40 focus:outline-none transition",
    [],
  );

  const cardClassName = useMemo(
    () =>
      "rounded-2xl bg-slate-900/70 border border-white/5 p-6 shadow-xl backdrop-blur-sm space-y-5",
    [],
  );

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error(
        translate("settings.toast.currentPasswordMissing", "Current password required"),
      );
      return;
    }

    setSavingProfile(true);
    try {
      await patch("/user/me", {
        username,
        email,
        avatar,
        dateOfBirth,
        currentPassword,
      });
      await fetchUser();
      toast.success(
        translate("settings.toast.profileUpdated", "Profile updated successfully"),
      );
      setCurrentPassword("");
    } catch (err) {
      toast.error(
        err.message || translate("common.unexpectedError", "Something went wrong"),
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error(
        translate("settings.toast.passwordMismatch", "Passwords do not match"),
      );
      return;
    }

    setChangingPassword(true);
    try {
      await post("/user/me/password", { oldPassword, newPassword });
      toast.success(
        translate("settings.toast.passwordUpdated", "Password updated successfully"),
      );
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      toast.error(
        err.message || translate("common.unexpectedError", "Something went wrong"),
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCopyId = () => {
    if (!user?.id || typeof navigator === "undefined" || !navigator.clipboard) {
      toast.error(translate("common.copyUnsupported", "Copy is not supported here"));
      return;
    }

    navigator.clipboard
      .writeText(user.id)
      .then(() => toast.success(translate("common.copySuccess", "Copied")))
      .catch(() => toast.error(translate("common.copyFailure", "Failed to copy")));
  };

  if (!user) return <Loading text={t("loading.settings")} />;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_transparent_55%)]" />
        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur">
              <Image
                src={avatar || user.avatar || "/default-avatar.png"}
                alt="Avatar"
                fill
                sizes="96px"
                className="object-cover"
                priority
                unoptimized
              />
              <span className="absolute inset-0 rounded-2xl border border-white/10" />
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blue-300">
                {t("settings.header.accent")}
              </p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                {t("settings.header.greeting", { name: user.username })}
              </h1>
              <div className="mt-3 flex flex-wrap gap-3 text-xs sm:text-sm">
                <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                  <ShieldCheck className="h-4 w-4 text-blue-200" />
                  <span className="font-medium capitalize">
                    {t("settings.badges.role")}: {user.role || "user"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-white transition hover:bg-white/20"
                >
                  <Copy className="h-4 w-4" />
                  <span>
                    {t("settings.badges.copyButton", { id: user.id })}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <form
          onSubmit={handleProfileSubmit}
          className={`lg:col-span-2 ${cardClassName}`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
            <UserIcon className="h-5 w-5 text-blue-300" />
            <span>{t("settings.profileCard.title")}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/60">
                <UserIcon className="h-4 w-4 text-blue-300" />
                {t("settings.profileCard.username")}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClassName}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/60">
                <Mail className="h-4 w-4 text-blue-300" />
                {t("settings.profileCard.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/60">
                <ImageIcon className="h-4 w-4 text-blue-300" />
                {avatarLabel}
              </label>
              <button
                type="button"
                onClick={triggerAvatarPicker}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-blue-400/60 hover:bg-white/20 whitespace-nowrap"
                title={avatarHint}
                aria-label={avatarButtonLabel}
              >
                <ImageIcon className="h-4 w-4" />
                <span>{avatarButtonLabel}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileChange}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/60">
                <Calendar className="h-4 w-4 text-blue-300" />
                {t("settings.profileCard.dateOfBirth")}
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className={inputClassName}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/60">
              <Lock className="h-4 w-4 text-blue-300" />
              {t("settings.profileCard.currentPassword")}
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClassName}
              placeholder={t("settings.profileCard.currentPasswordPlaceholder")}
              required
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {savingProfile ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("settings.profileCard.submitting")}</span>
              </>
            ) : (
              <span>{t("settings.profileCard.submit")}</span>
            )}
          </button>
        </form>

        <form onSubmit={handlePasswordSubmit} className={cardClassName}>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
            <Lock className="h-5 w-5 text-blue-300" />
            <span>{t("settings.passwordCard.title")}</span>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/60">
              <Lock className="h-4 w-4 text-blue-300" />
              {t("settings.passwordCard.oldPassword")}
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className={inputClassName}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/60">
              <Lock className="h-4 w-4 text-blue-300" />
              {t("settings.passwordCard.newPassword")}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputClassName}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/60">
              <Lock className="h-4 w-4 text-blue-300" />
              {t("settings.passwordCard.confirmPassword")}
            </label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className={inputClassName}
              required
            />
          </div>
          <button
            type="submit"
            disabled={changingPassword}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:from-purple-400 hover:to-pink-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {changingPassword ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("settings.passwordCard.submitting")}</span>
              </>
            ) : (
              <span>{t("settings.passwordCard.submit")}</span>
            )}
          </button>
        </form>
      </div>

      <section className={cardClassName}>
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-200">
          <LogOut className="h-5 w-5 text-red-400" />
          <span>{t("settings.logoutCard.title")}</span>
        </div>
        <p className="text-sm text-white/60">
          {t("settings.logoutCard.description")}
        </p>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
        >
          <LogOut className="h-4 w-4" />
          <span>{t("settings.logoutCard.button")}</span>
        </button>
      </section>
    </div>
  );
}

export default RequireAuth(SettingsPage);
