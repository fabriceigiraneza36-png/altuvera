import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Helmet } from "react-helmet-async";
import { useUserAuth } from "../../context/UserAuthContext";
import DashboardLayout from "../../components/auth/DashboardLayout";
import {
  HiUser,
  HiMail,
  HiPhone,
  HiCamera,
  HiCheck,
  HiPencil,
  HiOutlinePhotograph,
  HiRefresh,
  HiExclamationCircle,
  HiShieldCheck,
  HiStar,
  HiClock,
  HiFingerPrint,
  HiSearch,
} from "react-icons/hi";
import { FiSave, FiX, FiEdit3, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { PROFILE_AVATAR_CATEGORIES, PROFILE_AVATARS, PROFILE_AVATAR_COUNT } from "../../data/profileAvatars";

// ─── Constants ────────────────────────────────────────────────────────────────
const AUTOSAVE_DELAY = 900;
const SUCCESS_MESSAGE_DURATION = 5000;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

const SYNC_STATE = {
  IDLE: "idle",
  DIRTY: "dirty",
  SAVING: "saving",
  SAVED: "saved",
  ERROR: "error",
};

// ─── Inline Styles (scoped) ───────────────────────────────────────────────────
const css = `
  /* ── Reset & Base ── */
  .up-root * { box-sizing: border-box; }

  /* ── Layout wrapper ── */
  .up-root {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    animation: upFadeIn 0.5s ease-out;
  }

  /* ── Hero Banner ── */
  .up-hero {
    position: relative;
    background: linear-gradient(135deg, #064e3b 0%, #065f46 40%, #047857 100%);
    border-radius: 20px;
    padding: 2.5rem 2rem 2rem;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 2rem;
    flex-wrap: wrap;
  }
  .up-hero::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
  }
  .up-hero::after {
    content: '';
    position: absolute;
    bottom: -40px; left: 30%;
    width: 160px; height: 160px;
    border-radius: 50%;
    background: rgba(255,255,255,0.03);
  }

  /* ── Avatar section ── */
  .up-avatar-wrap {
    position: relative;
    flex-shrink: 0;
    z-index: 2;
  }
  .up-avatar {
    width: 110px; height: 110px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid rgba(255,255,255,0.25);
    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
    background: linear-gradient(135deg, #059669, #34d399);
    display: flex; align-items: center; justify-content: center;
    font-size: 2.5rem; font-weight: 800; color: #fff;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    user-select: none;
  }
  .up-avatar:hover { transform: scale(1.04); box-shadow: 0 12px 40px rgba(0,0,0,0.35); }
  .up-avatar-overlay {
    position: absolute; inset: 0; border-radius: 50%;
    background: rgba(0,0,0,0.45);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 1.6rem;
    pointer-events: none;
    z-index: 3;
  }
  .up-camera-btn {
    position: absolute; bottom: 4px; right: 4px;
    width: 34px; height: 34px; border-radius: 50%;
    background: #059669; border: 2px solid #fff;
    color: #fff; font-size: 1rem;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.25s ease;
    z-index: 4; box-shadow: 0 4px 12px rgba(5,150,105,0.5);
  }
  .up-camera-btn:hover { background: #047857; transform: scale(1.15); }
  .up-camera-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* ── Hero info ── */
  .up-hero-info { flex: 1; z-index: 2; min-width: 180px; }
  .up-hero-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem; font-weight: 800;
    color: #fff; margin: 0 0 4px;
    line-height: 1.2;
  }
  .up-hero-email {
    color: rgba(255,255,255,0.7); font-size: 0.9rem;
    margin: 0 0 12px;
    display: flex; align-items: center; gap: 6px;
  }
  .up-badges { display: flex; gap: 8px; flex-wrap: wrap; }
  .up-badge {
    padding: 4px 12px; border-radius: 20px;
    font-size: 0.72rem; font-weight: 700;
    letter-spacing: 0.5px; text-transform: uppercase;
    border: 1px solid rgba(255,255,255,0.2);
  }
  .up-badge-role { background: rgba(255,255,255,0.15); color: #fff; }
  .up-badge-verified { background: rgba(16,185,129,0.3); color: #6ee7b7; border-color: rgba(16,185,129,0.4); }
  .up-badge-year { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.65); }

  /* ── Hero actions ── */
  .up-hero-actions { z-index: 2; }
  .up-edit-hero-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 0.65rem 1.4rem; border-radius: 10px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    color: #fff; font-size: 0.9rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s ease;
    backdrop-filter: blur(8px);
  }
  .up-edit-hero-btn:hover { background: rgba(255,255,255,0.25); transform: translateY(-1px); }

  /* ── Notification ── */
  .up-notif {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; padding: 1rem 1.25rem; border-radius: 12px;
    font-size: 0.9rem; font-weight: 500;
    animation: upSlideIn 0.3s ease;
  }
  .up-notif.success {
    background: #ecfdf5; color: #065f46;
    border: 1px solid #a7f3d0;
  }
  .up-notif.error {
    background: #fef2f2; color: #991b1b;
    border: 1px solid #fecaca;
  }
  .up-notif-left { display: flex; align-items: center; gap: 10px; }
  .up-notif-dismiss {
    background: transparent; border: none; cursor: pointer;
    color: inherit; opacity: 0.5; padding: 4px; border-radius: 6px;
    display: flex; align-items: center; transition: opacity 0.2s;
  }
  .up-notif-dismiss:hover { opacity: 1; }

  /* ── Card ── */
  .up-card {
    background: #fff;
    border-radius: 18px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    overflow: hidden;
    transition: box-shadow 0.3s ease;
  }
  .up-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.08); }

  /* ── Card Header ── */
  .up-card-header {
    padding: 1.25rem 1.75rem;
    border-bottom: 1px solid #f1f5f9;
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px;
    background: #fafdfb;
  }
  .up-card-title-row { display: flex; align-items: center; gap: 10px; }
  .up-card-accent { width: 5px; height: 22px; background: #059669; border-radius: 3px; }
  .up-card-title { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin: 0; }
  .up-card-actions { display: flex; align-items: center; gap: 8px; }

  /* ── Sync status ── */
  .up-sync-bar {
    padding: 0.6rem 1.75rem;
    border-bottom: 1px solid #f8fafc;
    font-size: 0.78rem; color: #64748b;
    display: flex; justify-content: space-between; align-items: center;
    gap: 12px; flex-wrap: wrap;
    background: #f8fafc;
  }
  .up-sync-dot {
    display: inline-block;
    width: 7px; height: 7px; border-radius: 50%;
    margin-right: 6px; vertical-align: middle;
  }
  .up-sync-dot.saving  { background: #f59e0b; animation: upPulse 1s infinite; }
  .up-sync-dot.saved   { background: #10b981; }
  .up-sync-dot.dirty   { background: #f97316; }
  .up-sync-dot.error   { background: #ef4444; }
  .up-sync-dot.idle    { background: #94a3b8; }

  /* ── Form body ── */
  .up-form-body { padding: 1.75rem; }
  .up-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
  .up-field { display: flex; flex-direction: column; gap: 6px; }
  .up-field.full { grid-column: 1 / -1; }
  .up-field label {
    font-size: 0.78rem; font-weight: 700; color: #475569;
    text-transform: uppercase; letter-spacing: 0.6px;
    display: flex; align-items: center; gap: 6px;
  }
  .up-field label svg { color: #059669; font-size: 1rem; }
  .up-field p {
    margin: 0; color: #0f172a; font-size: 0.95rem; font-weight: 500;
    padding: 0.65rem 0; border-bottom: 1px solid #f1f5f9;
    min-height: 44px; display: flex; align-items: center;
  }
  .up-field p.readonly { color: #64748b; font-weight: 400; }
  .up-field input, .up-field textarea {
    padding: 0.72rem 1rem; border-radius: 10px;
    border: 1.5px solid #e2e8f0; font-size: 0.95rem; color: #0f172a;
    background: #fff; outline: none; width: 100%;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    font-family: inherit;
  }
  .up-field input:focus, .up-field textarea:focus {
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5,150,105,0.12);
  }
  .up-field textarea { resize: vertical; min-height: 100px; line-height: 1.6; }

  /* ── Auto-save toggle ── */
  .up-autosave-label {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.8rem; color: #64748b; cursor: pointer;
    padding: 4px 8px; border-radius: 6px; transition: background 0.15s;
  }
  .up-autosave-label:hover { background: #f1f5f9; }
  .up-autosave-label input { accent-color: #059669; }

  /* ── Buttons ── */
  .up-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 0.65rem 1.4rem; border-radius: 10px;
    font-size: 0.88rem; font-weight: 600; cursor: pointer;
    border: none; transition: all 0.2s ease;
    font-family: inherit;
  }
  .up-btn-primary {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    color: #fff; box-shadow: 0 4px 12px rgba(5,150,105,0.3);
  }
  .up-btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(5,150,105,0.4);
  }
  .up-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .up-btn-ghost {
    background: transparent; color: #475569;
    border: 1.5px solid #e2e8f0;
  }
  .up-btn-ghost:hover { background: #f8fafc; color: #0f172a; border-color: #cbd5e1; }
  .up-btn-sm { padding: 0.5rem 1rem; font-size: 0.82rem; }
  .up-btn-cancel { color: #ef4444; border-color: #fecaca; }
  .up-btn-cancel:hover { background: #fef2f2; color: #dc2626; border-color: #f87171; }

  /* ── Form footer ── */
  .up-form-footer {
    display: flex; justify-content: flex-end; align-items: center;
    gap: 10px; margin-top: 1.75rem; padding-top: 1.25rem;
    border-top: 1px solid #f1f5f9;
  }

  /* ── Stats grid ── */
  .up-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; }
  .up-stat-card {
    background: #fff; border-radius: 16px;
    border: 1px solid #e2e8f0;
    padding: 1.25rem 1.5rem;
    display: flex; align-items: center; gap: 1rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .up-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.09); }
  .up-stat-icon {
    width: 48px; height: 48px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 1.3rem;
  }
  .up-stat-body h3 { font-size: 0.78rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 2px; }
  .up-stat-body p { font-size: 1rem; font-weight: 700; color: #0f172a; margin: 0; }

  /* ── Security section ── */
  .up-security { display: flex; flex-direction: column; gap: 0; }
  .up-security-row {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; padding: 1rem 1.75rem; border-bottom: 1px solid #f1f5f9;
    transition: background 0.15s;
  }
  .up-security-row:last-child { border-bottom: none; }
  .up-security-row:hover { background: #fafdfb; }
  .up-security-left { display: flex; align-items: center; gap: 12px; }
  .up-security-icon {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; flex-shrink: 0;
    background: #f0fdf4; color: #059669;
  }
  .up-security-label { font-size: 0.9rem; font-weight: 600; color: #0f172a; margin: 0 0 2px; }
  .up-security-sub { font-size: 0.78rem; color: #94a3b8; margin: 0; }
  .up-security-badge {
    padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.4px;
  }
  .up-security-badge.ok  { background: #dcfce7; color: #166534; }
  .up-security-badge.na  { background: #f1f5f9; color: #64748b; }

  /* ── Keyframes ── */
  @keyframes upFadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes upSlideIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
  @keyframes upSpin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes upPulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  .up-spin { animation: upSpin 1s linear infinite; }

  /* ── Profile image and avatar library modal ── */
  .up-photo-backdrop {
    position: fixed !important; inset: 0 !important; z-index: 2147483000 !important;
    display: flex; align-items: center; justify-content: center;
    padding: max(12px, env(safe-area-inset-top)) 12px max(12px, env(safe-area-inset-bottom));
    background: rgba(12, 24, 18, .30);
    backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
    isolation: isolate; animation: upFadeIn .18s ease-out;
    overscroll-behavior: contain;
  }
  .up-photo-modal {
    width: min(100%, 820px);
    max-height: min(94dvh, 900px);
    display: flex; flex-direction: column;
    background: #fff; color: #10231d;
    border: 1px solid #e5eee9; border-radius: 24px;
    box-shadow: 0 26px 80px rgba(2, 20, 13, .26);
    overflow: hidden; animation: upPhotoModalIn .24s cubic-bezier(.2,.8,.2,1);
  }
  .up-photo-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    gap: 14px; padding: 22px 24px 18px; flex: 0 0 auto;
    border-bottom: 1px solid #edf2ef; background: #fff;
  }
  .up-photo-modal-heading { display: flex; align-items: center; gap: 13px; min-width: 0; }
  .up-photo-modal-mark {
    width: 48px; height: 48px; flex: 0 0 48px; border-radius: 15px;
    display: grid; place-items: center; background: #e7f6ef; color: #047857;
  }
  .up-photo-modal-heading h2 { margin: 0; color: #102d22; font-size: clamp(18px,3vw,22px); line-height: 1.2; font-weight: 800; }
  .up-photo-modal-heading p { margin: 5px 0 0; color: #718078; font-size: 13px; line-height: 1.45; }
  .up-photo-close {
    display: grid; place-items: center; width: 38px; height: 38px; flex: 0 0 38px;
    border: 0; border-radius: 12px; background: #f2f6f3; color: #42564c;
    cursor: pointer; font-size: 19px; transition: background .18s, transform .18s;
  }
  .up-photo-close:hover { background: #e6eee9; transform: rotate(4deg); }
  .up-photo-current {
    display: flex; align-items: center; gap: 12px;
    margin: 16px 22px 0; padding: 11px 13px;
    border: 1px solid #e6efe9; border-radius: 15px; background: #fbfdfb;
  }
  .up-photo-current img, .up-photo-current > span:first-child {
    width: 42px; height: 42px; flex: 0 0 42px; border-radius: 50%;
    display: grid; place-items: center; object-fit: cover;
    background: #d1fae5; color: #065f46; font-weight: 800;
  }
  .up-photo-current-copy { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
  .up-photo-current-copy strong { color: #183c2d; font-size: 13px; }
  .up-photo-current-copy span { color: #77877e; font-size: 11.5px; line-height: 1.4; }
  .up-photo-library-count {
    flex: 0 0 auto; padding: 6px 9px; border-radius: 999px;
    color: #047857; background: #e9f8f0; font-size: 11px; font-weight: 800;
  }

  .up-photo-actions {
    display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px; margin: 14px 22px 0;
  }
  .up-photo-action {
    min-height: 66px; min-width: 0; display: flex; align-items: center; gap: 11px;
    padding: 12px 14px; text-align: left; color: #315044;
    border: 1px solid #e1ebe5; border-radius: 15px; background: #fff;
    cursor: pointer; transition: border-color .18s, background .18s, transform .18s;
  }
  .up-photo-actions > * { min-width: 0; }
  .up-photo-action > svg { flex: 0 0 auto; color: #07835f; }
  .up-photo-action span { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .up-photo-action strong { color: #1a392d; font-size: 12.5px; font-weight: 800; }
  .up-photo-action small { color: #7a8981; font-size: 10.5px; line-height: 1.35; }
  .up-photo-attribution { flex-basis: 100%; color: #9aa59e; font-size: 9px; font-weight: 500; text-align: right; }

  .up-photo-action-active { border-color: #9cdbc0; background: #f1fbf5; }
  button.up-photo-action:hover:not(:disabled) { border-color: #71c79f; background: #f6fcf8; transform: translateY(-1px); }
  .up-photo-action:disabled { opacity: .45; cursor: not-allowed; }
  .up-photo-lock {
    display: flex; align-items: flex-start; gap: 10px;
    margin: 12px 22px 0; padding: 11px 13px; border-radius: 13px;
    background: #fff8eb; border: 1px solid #f2dfba; color: #91621c;
  }
  .up-photo-lock > svg { flex: 0 0 auto; margin-top: 2px; }
  .up-photo-lock span { display: flex; flex-direction: column; gap: 3px; }
  .up-photo-lock strong { color: #7a5014; font-size: 12px; }
  .up-photo-lock small { color: #956b30; font-size: 11px; line-height: 1.4; }
  .up-avatar-category-list {
    display: flex; align-items: center; gap: 7px; overflow-x: auto;
    padding: 16px 22px 10px; flex: 0 0 auto; scrollbar-width: thin;
  }
  .up-avatar-category-list button {
    flex: 0 0 auto; padding: 7px 11px; border: 1px solid #e1eae4;
    border-radius: 999px; background: #fff; color: #60746a;
    font-family: inherit; font-size: 11px; font-weight: 700; line-height: 1.2; white-space: nowrap; cursor: pointer;
    transition: background .18s, border-color .18s, color .18s;
  }
  .up-avatar-category-list button:hover { border-color: #a6ddbf; color: #047857; }
  .up-avatar-category-list button.active { border-color: #07845f; background: #07845f; color: #fff; }
  .up-avatar-search-row {
    display: flex; align-items: center; gap: 10px;
    padding: 2px 22px 10px; flex: 0 0 auto;
  }
  .up-avatar-search-field {
    display: flex; align-items: center; gap: 10px; flex: 1 1 auto;
    min-width: 0; height: 42px; padding: 0 12px;
    border: 1px solid #dfe9e3; border-radius: 12px;
    background: #f8fbf9; color: #718078;
    transition: border-color .18s, box-shadow .18s, background .18s;
  }
  .up-avatar-search-field:focus-within {
    border-color: #70c59b; background: #fff;
    box-shadow: 0 0 0 3px rgba(5,150,105,.09);
  }
  .up-avatar-search-field svg { flex: 0 0 auto; color: #07835f; }
  .up-avatar-search-field input {
    width: 100%; min-width: 0; border: 0; outline: 0;
    background: transparent; color: #183c2d; font: inherit; font-size: 12px;
  }
  .up-avatar-search-field input::placeholder { color: #97a59d; }
  .up-avatar-search-count {
    flex: 0 0 auto; color: #708178; font-size: 11px; font-weight: 700;
    white-space: nowrap;
  }
  .up-avatar-empty {
    grid-column: 1 / -1; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 7px;
    min-height: 190px; padding: 24px; color: #7b8c82; text-align: center;
  }
  .up-avatar-empty svg { color: #0b8a61; }
  .up-avatar-empty strong { color: #254638; font-size: 13px; }
  .up-avatar-empty span { font-size: 11px; }
  .up-avatar-grid {
    display: grid; grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 11px; padding: 4px 22px 14px; min-height: 220px;
    max-height: min(39vh, 350px); overflow-y: auto; overscroll-behavior: contain;
    scrollbar-width: thin; scrollbar-color: #a9d8bf #f2f7f4;
  }
  .up-avatar-option {
    position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px;
    min-width: 0; padding: 7px; border: 1px solid #e8efeb;
    border-radius: 14px; background: #fff; color: #52665b;
    cursor: pointer; transition: transform .18s, border-color .18s, box-shadow .18s;
  }
  .up-avatar-option img { display: block; width: 100%; aspect-ratio: 1; border-radius: 10px; object-fit: cover; background: #f1f6f3; }
  .up-avatar-option > span { width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; font-weight: 700; }
  .up-avatar-option:hover:not(:disabled) { transform: translateY(-2px); border-color: #8fd0ac; box-shadow: 0 5px 14px rgba(4,120,87,.10); }
  .up-avatar-option.selected { border: 2px solid #059669; padding: 6px; background: #f2fbf6; }
  .up-avatar-option i {
    position: absolute; top: 9px; right: 9px; width: 21px; height: 21px;
    display: grid; place-items: center; border-radius: 50%; background: #059669; color: #fff;
    font-style: normal; box-shadow: 0 2px 7px rgba(0,0,0,.15);
  }
  .up-avatar-option:disabled { opacity: .55; cursor: not-allowed; }
  .up-avatar-loading {
    grid-column: 1 / -1; display: flex; justify-content: center; align-items: center; gap: 9px;
    padding: 12px; color: #07835f; font-size: 12px; font-weight: 700;
  }

  .up-avatar-tools {
    display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
    margin: 14px 22px 0;
  }
  .up-avatar-tool {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    min-height: 36px; padding: 8px 12px;
    border: 1px solid #e1ebe5; border-radius: 11px;
    background: #fff; color: #52685c; font: inherit; font-size: 11px; font-weight: 750;
    cursor: pointer; transition: background .18s, border-color .18s, color .18s, transform .18s;
  }
  .up-avatar-tool:hover { border-color: #8ccfa9; color: #047857; transform: translateY(-1px); }
  .up-avatar-tool.active { border-color: #0b9367; background: #edf9f2; color: #08734f; }
  .up-avatar-current-toggle {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    width: 100%; border: 1px solid #e6efe9; border-radius: 15px;
    background: #fbfdfb; padding: 11px 13px;
  }
  .up-avatar-current-toggle .up-photo-current {
    flex: 1; min-width: 0; margin: 0; padding: 0; border: 0; background: transparent;
  }
  .up-photo-current-image {
    display: grid; place-items: center; width: 44px; height: 44px; flex: 0 0 44px;
    border: 0; border-radius: 50%; overflow: hidden; padding: 0;
    background: #d1fae5; color: #065f46; font-weight: 800; cursor: zoom-in;
  }
  .up-photo-current-image img { width: 100%; height: 100%; object-fit: cover; }
  .up-current-view-label { border: 0; background: transparent; color: #07835f; font-size: 11px; font-weight: 800; cursor: pointer; }
  .up-avatar-catalog-status {
    display: flex; align-items: center; gap: 8px;
    margin: 6px 22px 0; padding: 8px 10px; border-radius: 10px;
    color: #708178; background: #f7faf8; font-size: 10.5px; line-height: 1.4;
  }
  .up-avatar-catalog-status a { color: #087b58; font-weight: 750; text-decoration: underline; }
  .up-avatar-option.openmoji img { object-fit: contain; padding: 7px; background: #f8faf9; }

  .up-media-preview-backdrop {
    position: fixed !important; inset: 0 !important; z-index: 2147483200 !important;
    display: flex; align-items: center; justify-content: center;
    padding: max(14px, env(safe-area-inset-top)) 14px max(14px, env(safe-area-inset-bottom));
    background: rgba(20, 39, 29, .18);
    backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
    isolation: isolate; animation: upFadeIn .16s ease-out;
  }
  .up-media-preview-panel {
    width: min(100%, 620px); max-height: 94dvh; display: flex; flex-direction: column;
    gap: 15px; padding: 22px; overflow-y: auto;
    border: 1px solid #e4eee7; border-radius: 24px;
    background: #fff !important; color: #17392a;
    box-shadow: 0 24px 70px rgba(17, 52, 34, .18);
    animation: upPhotoModalIn .22s cubic-bezier(.2,.8,.2,1);
  }
  .up-media-preview-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; }
  .up-media-preview-heading-copy { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .up-media-preview-heading-copy strong { color: #163d2b; font-size: 17px; font-weight: 850; }
  .up-media-preview-heading-copy span { color: #819087; font-size: 11px; }
  .up-media-preview-stage {
    display: flex; align-items: center; justify-content: center;
    width: 100%; min-height: 210px; max-height: 51dvh; aspect-ratio: 4 / 3;
    padding: 12px; overflow: hidden;
    border: 1px solid #e5eee8; border-radius: 18px;
    background: linear-gradient(145deg, #f8fbf9, #eef5f0);
  }
  .up-media-preview-stage img {
    display: block; width: 100%; height: 100%; max-height: 48dvh;
    object-fit: contain; border-radius: 10px;
  }
  .up-media-preview-file {
    display: flex; align-items: center; gap: 11px; min-width: 0;
    padding: 11px 13px; border: 1px solid #e6eee8; border-radius: 13px; background: #fbfdfb;
  }
  .up-media-preview-file-icon {
    width: 38px; height: 38px; display: grid; place-items: center; flex: 0 0 38px;
    border-radius: 11px; background: #e8f7ef; color: #07845f;
  }
  .up-media-preview-file-copy { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
  .up-media-preview-file-copy strong { color: #274638; font-size: 11px; overflow-wrap: anywhere; }
  .up-media-preview-file-copy span { color: #8b9990; font-size: 10px; }
  .up-media-preview-actions { display: grid; grid-template-columns: 1fr 1.25fr; gap: 10px; width: 100%; }
  @media (max-width: 640px) {
    .up-media-preview-panel { padding: 16px; gap: 12px; border-radius: 20px; }
    .up-media-preview-stage { min-height: 190px; max-height: 48dvh; }
    .up-media-preview-stage img { max-height: 45dvh; }
    .up-media-preview-actions { grid-template-columns: 1fr 1.2fr; }
  }

  .up-avatar-preview-backdrop, .up-image-viewer-backdrop {
    position: fixed !important; inset: 0 !important; z-index: 2147483100 !important;
    display: flex; align-items: center; justify-content: center;
    padding: max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom));
    background: rgba(5, 15, 11, .92);
    backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
    isolation: isolate; animation: upFadeIn .16s ease-out;
  }
  .up-avatar-preview-panel {
    display: flex; flex-direction: column; align-items: center; gap: 18px;
    width: min(100%, 560px); max-height: 94dvh; padding: 24px;
    border: 1px solid rgba(255,255,255,.14); border-radius: 25px;
    background: #fff; color: #153629; box-shadow: 0 28px 90px rgba(0,0,0,.34);
    overflow-y: auto; animation: upPhotoModalIn .22s cubic-bezier(.2,.8,.2,1);
  }
  .up-avatar-preview-top {
    display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%;
  }
  .up-avatar-preview-top strong { font-size: 16px; color: #123829; }
  .up-avatar-preview-image {
    display: grid; place-items: center; width: min(64vw, 300px); height: min(64vw, 300px);
    min-width: 170px; min-height: 170px; border-radius: 28px; padding: 14px;
    background: radial-gradient(circle at 30% 20%, #f0fbf5, #e8f3ed 78%);
    border: 1px solid #e0eee5; box-shadow: 0 14px 45px rgba(7,70,44,.10);
  }
  .up-avatar-preview-image img { display: block; width: 100%; height: 100%; object-fit: contain; }
  .up-avatar-preview-name { display: flex; flex-direction: column; gap: 4px; align-items: center; text-align: center; }
  .up-avatar-preview-name strong { color: #153b2b; font-size: 17px; }
  .up-avatar-preview-name span { color: #829087; font-size: 11px; }
  .up-avatar-preview-actions { display: grid; grid-template-columns: 1fr 1.25fr; gap: 10px; width: 100%; }
  .up-avatar-preview-btn {
    min-height: 46px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 11px 16px; border-radius: 13px; border: 1px solid #dfe9e3;
    background: #fff; color: #53675c; font: inherit; font-size: 12px; font-weight: 800; cursor: pointer;
    transition: transform .18s, background .18s, box-shadow .18s;
  }
  .up-avatar-preview-btn:hover:not(:disabled) { transform: translateY(-1px); }
  .up-avatar-preview-btn.confirm { border-color: #07845f; background: linear-gradient(135deg,#0ba775,#087a57); color: #fff; box-shadow: 0 8px 20px rgba(7,132,95,.20); }
  .up-avatar-preview-btn:disabled { opacity: .55; cursor: not-allowed; }
  .up-image-viewer-panel {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 16px; width: min(100%, 1100px); height: 100%; position: relative;
  }
  .up-image-viewer-close {
    position: absolute; top: 0; right: 0; width: 46px; height: 46px;
    display: grid; place-items: center; border: 1px solid rgba(255,255,255,.25);
    border-radius: 50%; background: rgba(255,255,255,.12); color: #fff;
    font-size: 22px; cursor: pointer;
  }
  .up-image-viewer-image {
    max-width: min(88vw, 920px); max-height: 78dvh; width: auto; height: auto;
    object-fit: contain; border-radius: 18px; background: #fff;
    box-shadow: 0 20px 70px rgba(0,0,0,.34);
  }
  .up-image-viewer-caption { color: rgba(255,255,255,.86); font-size: 12px; font-weight: 650; text-align: center; }
  @media (max-width: 640px) {
    .up-avatar-tools { margin-left: 15px; margin-right: 15px; }
    .up-avatar-current-toggle { margin-left: 15px; margin-right: 15px; width: calc(100% - 30px); }
    .up-avatar-catalog-status { margin-left: 15px; margin-right: 15px; }
    .up-avatar-preview-panel { padding: 18px; border-radius: 21px; }
    .up-avatar-preview-actions { grid-template-columns: 1fr 1fr; }
    .up-image-viewer-image { max-width: 94vw; max-height: 76dvh; }
  }

  .up-photo-modal-footer {
    display: flex; justify-content: space-between; gap: 10px; flex: 0 0 auto;
    padding: 11px 22px; border-top: 1px solid #edf2ef; background: #fbfdfb;
    color: #849188; font-size: 10.5px; font-weight: 600;
  }
  @keyframes upPhotoModalIn { from { opacity: 0; transform: translateY(12px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @media (max-width: 640px) {
    .up-photo-modal { max-height: 94dvh; border-radius: 20px; }
    .up-photo-modal-header { padding: 17px 16px 14px; }
    .up-photo-current { margin-left: 15px; margin-right: 15px; }
    .up-photo-actions { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-left: 15px; margin-right: 15px; }
    .up-photo-action { min-height: 72px; gap: 7px; padding: 10px 9px; border-radius: 12px; }
    .up-photo-action > svg { width: 17px; height: 17px; }
    .up-photo-action strong { font-size: 11px; line-height: 1.25; }
    .up-photo-action small { font-size: 9px; line-height: 1.3; }
    .up-photo-attribution { text-align: left; }
    .up-avatar-category-list { padding-left: 15px; padding-right: 15px; }
    .up-avatar-search-row { padding-left: 15px; padding-right: 15px; }
    .up-avatar-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; padding-left: 15px; padding-right: 15px; max-height: 35vh; }
    .up-photo-modal-footer { padding: 10px 15px; }
  }
  @media (max-width: 390px) {
    .up-photo-modal-heading p { font-size: 11.5px; }
    .up-photo-current-copy span { font-size: 10px; }
    .up-photo-library-count { display: none; }
    .up-photo-actions { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }
    .up-photo-action { min-height: 74px; padding: 9px 7px; gap: 6px; }
    .up-photo-action strong { font-size: 10.5px; }
    .up-photo-action small { font-size: 8.5px; }
    .up-avatar-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); max-height: 32vh; }
  }
  @media (prefers-reduced-motion: reduce) {
    .up-photo-modal, .up-photo-backdrop { animation: none !important; }
    .up-photo-action, .up-avatar-option { transition: none !important; }
  }

  /* ── Responsive ── */
  @media (max-width: 700px) {
    .up-fields { grid-template-columns: 1fr; }
    .up-field.full { grid-column: 1; }
    .up-hero { flex-direction: column; align-items: flex-start; gap: 1.25rem; padding: 1.75rem 1.25rem; }
    .up-hero-name { font-size: 1.4rem; }
    .up-form-body { padding: 1.25rem; }
    .up-card-header { padding: 1rem 1.25rem; }
    .up-sync-bar { padding: 0.5rem 1.25rem; }
    .up-security-row { padding: 0.9rem 1.25rem; }
    .up-stats { grid-template-columns: 1fr 1fr; }
    .up-form-footer { flex-wrap: wrap; }
  }
  @media (max-width: 400px) {
    .up-stats { grid-template-columns: 1fr; }
    .up-avatar { width: 90px; height: 90px; font-size: 2rem; }
  }
`;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserProfile() {
  const { user, updateProfile, updateProfileAvatar, uploadAvatar } = useUserAuth();

  const [editing, setEditing]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [avatarCategory, setAvatarCategory] = useState("all");
  const [avatarSearch, setAvatarSearch] = useState("");
  const [showAvatarSearch, setShowAvatarSearch] = useState(false);
  const [showAvatarCategories, setShowAvatarCategories] = useState(false);
  const [showCurrentImagePreview, setShowCurrentImagePreview] = useState(true);
  const [openMojiAvatars, setOpenMojiAvatars] = useState([]);
  const [openMojiLoading, setOpenMojiLoading] = useState(false);
  const [openMojiError, setOpenMojiError] = useState("");
  const [visibleAvatarCount, setVisibleAvatarCount] = useState(50);
  const [avatarClock, setAvatarClock] = useState(Date.now());
  const [autoSave, setAutoSave] = useState(true);
  const [syncState, setSyncState] = useState(SYNC_STATE.IDLE);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [dirty, setDirty]       = useState(false);
  const [notification, setNotification] = useState({ type: "", message: "" });

  const fileInputRef        = useRef(null);
  const autosaveTimerRef    = useRef(null);
  const notificationTimerRef = useRef(null);
  const avatarGridRef = useRef(null);
  const openMojiRequestRef = useRef(false);

  const [form, setForm] = useState(() => ({
    fullName: user?.fullName || user?.name || "",
    phone:    user?.phone || "",
    bio:      user?.bio || "",
  }));

  // Sync form when user loads (e.g. after fetchUser resolves)
  useEffect(() => {
    if (user && !editing) {
      setForm({
        fullName: user?.fullName || user?.name || "",
        phone:    user?.phone || "",
        bio:      user?.bio || "",
      });
    }
  }, [user, editing]);

  const initials = React.useMemo(() => {
    const name = form.fullName || user?.email || "U";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [form.fullName, user?.email]);

  const showNotification = useCallback((type, message) => {
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    setNotification({ type, message });
    if (type === "success") {
      notificationTimerRef.current = setTimeout(
        () => setNotification({ type: "", message: "" }),
        SUCCESS_MESSAGE_DURATION,
      );
    }
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setDirty(true);
    setSyncState(SYNC_STATE.DIRTY);
    setNotification({ type: "", message: "" });
  }, []);

  const resetForm = useCallback(() => {
    setForm({
      fullName: user?.fullName || user?.name || "",
      phone:    user?.phone || "",
      bio:      user?.bio || "",
    });
    setDirty(false);
    setSyncState(SYNC_STATE.IDLE);
  }, [user]);

  const handleCancel = useCallback(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    setEditing(false);
    resetForm();
    setNotification({ type: "", message: "" });
  }, [resetForm]);

  const persistProfile = useCallback(async ({ silent = false } = {}) => {
    try {
      setLoading(true);
      setSyncState(SYNC_STATE.SAVING);
      await updateProfile(form);
      setDirty(false);
      setSyncState(SYNC_STATE.SAVED);
      setLastSavedAt(new Date());
      if (!silent) {
        showNotification("success", "Profile updated successfully!");
        setEditing(false);
      }
      return true;
    } catch (err) {
      setSyncState(SYNC_STATE.ERROR);
      showNotification("error", err.message || "Failed to update profile. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [form, updateProfile, showNotification]);

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    await persistProfile({ silent: false });
  }, [persistProfile]);

  const validateFile = useCallback((file) => {
    if (!file) return { valid: false, error: "No file selected." };
    const isSupportedMime = ACCEPTED_IMAGE_TYPES.includes(file.type);
    const hasSupportedExtension = /\.(jpe?g|png|webp|avif|gif)$/i.test(file.name || "");
    if (!(file.type.startsWith("image/") && isSupportedMime) && !hasSupportedExtension) {
      return { valid: false, error: "Please choose a supported image file: JPEG, PNG, WebP, AVIF or GIF." };
    }
    if (file.size > MAX_FILE_SIZE) return { valid: false, error: "File size must be less than 5 MB." };
    return { valid: true };
  }, []);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validation = validateFile(file);
    if (!validation.valid) {
      showNotification("error", validation.error);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const previewDataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!previewDataUrl.startsWith("data:image/")) {
        showNotification("error", "This image could not be previewed. Please choose another image.");
        return;
      }
      const image = new Image();
      image.onload = () => {
        setPendingImage({
          type: "upload",
          url: previewDataUrl,
          file,
          label: file.name || "Uploaded photograph",
          categoryLabel: "Device image",
          sizeLabel: file.size < 1024 * 1024
            ? `${Math.max(1, Math.round(file.size / 1024))} KB`
            : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          dimensions: `${image.naturalWidth} × ${image.naturalHeight}`,
        });
      };
      image.onerror = () => showNotification("error", "Altuvera couldn't read this image. Please choose a different photo.");
      image.src = previewDataUrl;
    };
    reader.onerror = () => showNotification("error", "Altuvera couldn't read that image. Please select it again.");
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [validateFile, showNotification]);

  const handleImageClick = useCallback(() => {
    if (uploading) return;
    setAvatarSearch("");
    setAvatarCategory("all");
    setShowAvatarSearch(false);
    setShowAvatarCategories(false);
    setVisibleAvatarCount(50);
    if (avatarGridRef.current) avatarGridRef.current.scrollTop = 0;
    setPhotoModalOpen(true);
  }, [uploading]);

  const discardPendingImage = useCallback(() => {
    if (pendingImage?.previewUrl) URL.revokeObjectURL(pendingImage.previewUrl);
    setPendingImage(null);
  }, [pendingImage]);

  const closePhotoModal = useCallback(() => {
    if (uploading) return;
    discardPendingImage();
    setPhotoModalOpen(false);
  }, [uploading, discardPendingImage]);

  const openCurrentImageViewer = useCallback(() => {
    if (user?.avatar) setImageViewerOpen(true);
    else handleImageClick();
  }, [user?.avatar, handleImageClick]);

  const avatarUpdatedAt = user?.avatarUpdatedAt || user?.avatar_updated_at || null;
  const avatarUnlockAt = avatarUpdatedAt
    ? new Date(avatarUpdatedAt).getTime() + 24 * 60 * 60 * 1000
    : 0;
  const avatarChangeLocked = Boolean(avatarUnlockAt && avatarClock < avatarUnlockAt);
  const avatarRemainingSeconds = avatarChangeLocked
    ? Math.ceil((avatarUnlockAt - avatarClock) / 1000)
    : 0;
  const avatarRemainingLabel = avatarChangeLocked
    ? `${Math.floor(avatarRemainingSeconds / 3600)}h ${Math.floor((avatarRemainingSeconds % 3600) / 60)}m`
    : "";

  const handleConfirmPendingImage = useCallback(async () => {
    if (!pendingImage || uploading || avatarChangeLocked) return;
    try {
      setUploading(true);
      if (pendingImage.type === "catalog") {
        await updateProfileAvatar({ avatar: pendingImage.url, source: "catalog" });
        showNotification("success", "Your selected Altuvera avatar is now your profile picture.");
      } else {
        await uploadAvatar(pendingImage.file);
        showNotification("success", "Your profile picture has been updated.");
      }
      if (pendingImage.previewUrl) URL.revokeObjectURL(pendingImage.previewUrl);
      setPendingImage(null);
      setPhotoModalOpen(false);
    } catch (error) {
      showNotification("error", error.message || "Could not update your profile picture.");
    } finally {
      setUploading(false);
    }
  }, [pendingImage, uploading, avatarChangeLocked, updateProfileAvatar, uploadAvatar, showNotification]);

  const avatarLibrary = React.useMemo(
    () => [...openMojiAvatars, ...PROFILE_AVATARS],
    [openMojiAvatars],
  );
  const filteredAvatars = React.useMemo(() => {
    const query = avatarSearch.trim().toLocaleLowerCase();
    return avatarLibrary.filter((avatar) => {
      const matchesCategory = avatarCategory === "all" || avatar.categoryId === avatarCategory;
      const searchable = `${avatar.label} ${avatar.categoryLabel} ${avatar.id} ${avatar.searchTags || ""}`
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [avatarLibrary, avatarCategory, avatarSearch]);
  const visibleAvatars = filteredAvatars.slice(0, visibleAvatarCount);

  const handleAvatarSearchChange = useCallback((event) => {
    setAvatarSearch(event.target.value);
    setVisibleAvatarCount(50);
    if (avatarGridRef.current) avatarGridRef.current.scrollTop = 0;
  }, []);

  const handleAvatarGridScroll = useCallback((event) => {
    const element = event.currentTarget;
    if (element.scrollHeight - element.scrollTop - element.clientHeight < 110) {
      setVisibleAvatarCount((count) => Math.min(count + 50, filteredAvatars.length));
    }
  }, [filteredAvatars.length]);

  const handleChooseAvatar = useCallback((avatar) => {
    if (uploading || avatarChangeLocked) return;
    setPendingImage({
      type: "catalog",
      url: avatar.url,
      label: avatar.label,
      categoryLabel: avatar.categoryLabel,
    });
  }, [uploading, avatarChangeLocked]);

  const selectAvatarCategory = useCallback((category) => {
    setAvatarCategory(category);
    setVisibleAvatarCount(50);
    if (avatarGridRef.current) avatarGridRef.current.scrollTop = 0;
  }, []);

  useEffect(() => {
    if (!photoModalOpen || openMojiAvatars.length || openMojiRequestRef.current) return undefined;
    const controller = new AbortController();
    openMojiRequestRef.current = true;
    setOpenMojiLoading(true);
    setOpenMojiError("");
    fetch("https://cdn.jsdelivr.net/npm/openmoji@17.0.0/data/openmoji.json", {
      signal: controller.signal,
      cache: "force-cache",
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Avatar catalogue request failed (${response.status}).`);
        return response.json();
      })
      .then((entries) => {
        const priority = ["animals-nature", "food-drink", "activities", "travel-places", "objects", "people-body"];
        const categoryNames = {
          "animals-nature": "Animals & nature",
          "food-drink": "Food & drink",
          "activities": "Sports & activities",
          "travel-places": "Travel & places",
          "objects": "Objects & technology",
          "people-body": "People & portraits",
          "smileys-emotion": "Faces & expressions",
          "symbols": "Symbols",
          "flags": "Flags",
          "extras-openmoji": "Extra illustrations",
        };
        const parsed = (Array.isArray(entries) ? entries : [])
          .filter((item) => item?.hexcode && item?.annotation)
          .map((item) => ({
            id: `openmoji-${item.hexcode}`,
            label: item.annotation,
            categoryId: item.group || "objects",
            categoryLabel: categoryNames[item.group] || "Illustrations",
            searchTags: [item.tags, item.openmoji_tags, item.subgroups, item.group].filter(Boolean).join(" "),
            url: `https://cdn.jsdelivr.net/npm/openmoji@17.0.0/color/svg/${item.hexcode}.svg`,
            artwork: "openmoji",
          }));
        parsed.sort((a, b) => {
          const ai = priority.indexOf(a.categoryId);
          const bi = priority.indexOf(b.categoryId);
          return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a.label.localeCompare(b.label);
        });
        setOpenMojiAvatars(parsed);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setOpenMojiError(error.message || "Could not load the full illustration catalogue.");
      })
      .finally(() => {
        openMojiRequestRef.current = false;
        setOpenMojiLoading(false);
      });
    return () => {
      controller.abort();
      openMojiRequestRef.current = false;
    };
  }, [photoModalOpen, openMojiAvatars.length]);

  useEffect(() => {
    if (!photoModalOpen && !pendingImage && !imageViewerOpen) return undefined;
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      if (imageViewerOpen) setImageViewerOpen(false);
      else if (pendingImage && !uploading) discardPendingImage();
      else if (photoModalOpen && !uploading) closePhotoModal();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [photoModalOpen, pendingImage, imageViewerOpen, uploading, discardPendingImage, closePhotoModal]);

  useEffect(() => {
    if (!avatarUnlockAt) return undefined;
    const timer = setInterval(() => setAvatarClock(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, [avatarUnlockAt]);

  // Auto-save
  useEffect(() => {
    if (!editing || !autoSave || !dirty) return;
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(
      () => persistProfile({ silent: true }),
      AUTOSAVE_DELAY,
    );
    return () => { if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current); };
  }, [editing, autoSave, dirty, form, persistProfile]);

  // Cleanup
  useEffect(() => () => {
    if (autosaveTimerRef.current)    clearTimeout(autosaveTimerRef.current);
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
  }, []);

  const syncLabel = {
    [SYNC_STATE.SAVING]: "Saving…",
    [SYNC_STATE.SAVED]:  "Saved",
    [SYNC_STATE.DIRTY]:  "Unsaved changes",
    [SYNC_STATE.IDLE]:   "Ready",
    [SYNC_STATE.ERROR]:  "Error saving",
  };

  const memberYear = new Date(user?.createdAt || Date.now()).getFullYear();
  const provider   = user?.authProvider || "email";

  return (
    <>
      <Helmet>
        <title>My Profile | Altuvera</title>
        <meta name="description" content="Manage your personal information and traveler preferences" />
      </Helmet>

      <DashboardLayout
        title="My Profile"
        subtitle="Manage your personal information and account settings."
      >
        <style>{css}</style>
        <div className="up-root">

          {/* ── Hero Banner ── */}
          <div className="up-hero">
            {/* Avatar */}
            <div className="up-avatar-wrap">
              {uploading && (
                <div className="up-avatar-overlay">
                  <HiRefresh className="up-spin" />
                </div>
              )}
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="up-avatar"
                  onClick={openCurrentImageViewer}
                  style={{ cursor: uploading ? "not-allowed" : "zoom-in" }}
                />
              ) : (
                <div
                  className="up-avatar"
                  onClick={handleImageClick}
                  role="button"
                  tabIndex={0}
                  aria-label="Change profile picture"
                  onKeyPress={(e) => { if (e.key === "Enter") handleImageClick(); }}
                >
                  {initials}
                </div>
              )}
              <button
                className="up-camera-btn"
                onClick={handleImageClick}
                disabled={uploading}
                type="button"
                title="Change profile photo"
                aria-label="Change profile photo"
              >
                {uploading ? <HiRefresh className="up-spin" /> : <HiCamera />}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                aria-label="Choose a profile image from your device"
                style={{ display: "none" }}
              />
            </div>

            {/* Info */}
            <div className="up-hero-info">
              <h1 className="up-hero-name">{user?.fullName || user?.name || "Safari Traveler"}</h1>
              <p className="up-hero-email">
                <HiMail style={{ opacity: 0.7 }} />
                {user?.email || "—"}
              </p>
              <div className="up-badges">
                {user?.role && (
                  <span className="up-badge up-badge-role">
                    {user.role}
                  </span>
                )}
                {user?.isVerified && (
                  <span className="up-badge up-badge-verified">
                    ✓ Verified
                  </span>
                )}
                <span className="up-badge up-badge-year">
                  Member {memberYear}
                </span>
              </div>
            </div>

            {/* Quick Edit */}
            {!editing && (
              <div className="up-hero-actions">
                <button
                  className="up-edit-hero-btn"
                  onClick={() => setEditing(true)}
                  type="button"
                >
                  <FiEdit3 size={15} /> Edit Profile
                </button>
              </div>
            )}
          </div>

          {/* ── Notification ── */}
          {notification.message && (
            <div className={`up-notif ${notification.type}`} role="alert">
              <div className="up-notif-left">
                {notification.type === "success"
                  ? <FiCheckCircle size={18} />
                  : <FiAlertCircle size={18} />}
                <span>{notification.message}</span>
              </div>
              <button
                className="up-notif-dismiss"
                onClick={() => setNotification({ type: "", message: "" })}
                aria-label="Dismiss"
              >
                <FiX size={16} />
              </button>
            </div>
          )}

          {/* ── Profile Card ── */}
          <div className="up-card">
            {/* Card Header */}
            <div className="up-card-header">
              <div className="up-card-title-row">
                <div className="up-card-accent" />
                <h2 className="up-card-title">Personal Information</h2>
              </div>
              <div className="up-card-actions">
                {editing ? (
                  <>
                    <label className="up-autosave-label">
                      <input
                        type="checkbox"
                        checked={autoSave}
                        onChange={(e) => setAutoSave(e.target.checked)}
                      />
                      Auto-save
                    </label>
                    <button
                      className="up-btn up-btn-sm up-btn-ghost up-btn-cancel"
                      onClick={handleCancel}
                      type="button"
                    >
                      <FiX size={14} /> Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="up-btn up-btn-sm up-btn-ghost"
                    onClick={() => setEditing(true)}
                    type="button"
                  >
                    <HiPencil size={14} /> Edit
                  </button>
                )}
              </div>
            </div>

            {/* Sync bar */}
            {editing && (
              <div className="up-sync-bar">
                <span>
                  <span className={`up-sync-dot ${syncState}`} />
                  {syncLabel[syncState]}
                </span>
                <span>
                  {lastSavedAt
                    ? `Last saved ${lastSavedAt.toLocaleTimeString()}`
                    : "Not yet saved"}
                </span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="up-form-body">
                <div className="up-fields">
                  {/* Full Name */}
                  <Field
                    icon={<HiUser />}
                    label="Full Name"
                    editing={editing}
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    autoFocus
                  />

                  {/* Email */}
                  <Field
                    icon={<HiMail />}
                    label="Email Address"
                    value={user?.email || "—"}
                    readonly
                  />

                  {/* Phone */}
                  <Field
                    icon={<HiPhone />}
                    label="Phone Number"
                    editing={editing}
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+254 700 123 456"
                  />

                  {/* Auth Provider */}
                  <Field
                    icon={<HiFingerPrint />}
                    label="Sign-in Method"
                    value={provider.charAt(0).toUpperCase() + provider.slice(1)}
                    readonly
                  />

                  {/* Bio */}
                  <div className="up-field full">
                    <label>
                      <HiOutlinePhotograph /> Bio / About You
                    </label>
                    {editing ? (
                      <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        placeholder="Share your travel experiences, interests, or anything about yourself…"
                        rows={4}
                      />
                    ) : (
                      <p style={{ lineHeight: 1.65, color: form.bio ? "#0f172a" : "#94a3b8" }}>
                        {form.bio || "No bio added yet. Click Edit to add one."}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer buttons */}
                {editing && (
                  <div className="up-form-footer">
                    <button
                      type="button"
                      className="up-btn up-btn-ghost up-btn-cancel"
                      onClick={handleCancel}
                    >
                      <FiX size={15} /> Discard
                    </button>
                    <button
                      type="submit"
                      className="up-btn up-btn-primary"
                      disabled={loading || !dirty}
                    >
                      {loading
                        ? <><HiRefresh className="up-spin" /> Saving…</>
                        : <><FiSave /> Save Changes</>}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* ── Security & Account Info ── */}
          <div className="up-card">
            <div className="up-card-header">
              <div className="up-card-title-row">
                <div className="up-card-accent" />
                <h2 className="up-card-title">Security & Account</h2>
              </div>
            </div>
            <div className="up-security">
              <SecurityRow
                icon={<HiShieldCheck />}
                label="Email Verification"
                sub="Your identity has been confirmed"
                status={user?.isVerified ? "ok" : "na"}
                statusLabel={user?.isVerified ? "Verified" : "Unverified"}
              />
              <SecurityRow
                icon={<HiClock />}
                label="Last Login"
                sub={user?.lastLogin
                  ? new Date(user.lastLogin).toLocaleString()
                  : "Session active"}
                status="ok"
                statusLabel="Active"
              />
            </div>
          </div>

          {/* ── Stats Grid ── */}
          <div className="up-stats">
            <StatCard
              icon={<HiCheck size={22} />}
              iconBg="#dcfce7"
              iconColor="#059669"
              label="Account Status"
              value="Verified Account"
            />
            <StatCard
              icon={<HiShieldCheck size={22} />}
              iconBg="#eff6ff"
              iconColor="#2563eb"
              label="Sign-in Provider"
              value={provider.charAt(0).toUpperCase() + provider.slice(1)}
            />
            <StatCard
              icon={<HiClock size={22} />}
              iconBg="#f5f3ff"
              iconColor="#7c3aed"
              label="Member Since"
              value={memberYear.toString()}
            />
          </div>

        </div>
      {photoModalOpen && createPortal((
        <div
          className="up-photo-backdrop"
          role="presentation"
          tabIndex={-1}
          onClick={(event) => {
            if (event.target === event.currentTarget) closePhotoModal();
          }}
        >
          <section
            className="up-photo-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="up-photo-modal-title"
          >
            <header className="up-photo-modal-header">
              <div className="up-photo-modal-heading">
                <span className="up-photo-modal-mark"><HiCamera size={23} /></span>
                <div>
                  <h2 id="up-photo-modal-title">Choose your profile image</h2>
                  <p>Browse {openMojiAvatars.length ? (openMojiAvatars.length + PROFILE_AVATAR_COUNT).toLocaleString() : PROFILE_AVATAR_COUNT} illustrations or choose a photo from your device.</p>
                </div>
              </div>
              <button
                type="button"
                className="up-photo-close"
                onClick={closePhotoModal}
                disabled={uploading}
                aria-label="Close profile image selector"
              >
                <FiX />
              </button>
            </header>

            <div className="up-avatar-tools" aria-label="Avatar picker display controls">
              <button type="button" className={`up-avatar-tool${showAvatarSearch ? " active" : ""}`} onClick={() => setShowAvatarSearch((value) => !value)} aria-expanded={showAvatarSearch}>
                <HiSearch size={15} /> Search
              </button>
              <button type="button" className={`up-avatar-tool${showAvatarCategories ? " active" : ""}`} onClick={() => setShowAvatarCategories((value) => !value)} aria-expanded={showAvatarCategories}>
                <HiStar size={15} /> Categories
              </button>
              <button type="button" className={`up-avatar-tool${showCurrentImagePreview ? " active" : ""}`} onClick={() => setShowCurrentImagePreview((value) => !value)} aria-expanded={showCurrentImagePreview}>
                <HiOutlinePhotograph size={15} /> Current image
              </button>
            </div>

            {showCurrentImagePreview && (
              <div className="up-avatar-current-toggle">
                <div className="up-photo-current">
                  <button type="button" className="up-photo-current-image" onClick={openCurrentImageViewer} aria-label="View current profile image in fullscreen">
                    {user?.avatar ? <img src={user.avatar} alt="" /> : initials}
                  </button>
                  <div className="up-photo-current-copy">
                    <strong>Current profile image</strong>
                    <span>Tap the circle to view it full-screen. Your new choice replaces this image.</span>
                  </div>
                </div>
                {user?.avatar && <button type="button" className="up-current-view-label" onClick={openCurrentImageViewer}>View</button>}
              </div>
            )}

            <div className="up-photo-actions">
              <div className="up-photo-action up-photo-action-active">
                <HiStar size={18} />
                <span><strong>Avatar library</strong><small>Browse all categories</small></span>
              </div>
              <button
                type="button"
                className="up-photo-action"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || avatarChangeLocked}
              >
                <HiOutlinePhotograph size={19} />
                <span><strong>Upload from device</strong><small>JPEG, PNG, WebP, AVIF or GIF · up to 5 MB</small></span>
              </button>
            </div>

            {avatarChangeLocked && (
              <div className="up-photo-lock" role="status">
                <HiClock size={18} />
                <span>
                  <strong>Profile image change is temporarily locked</strong>
                  <small>You can choose another image in {avatarRemainingLabel}. This 24-hour limit protects your account.</small>
                </span>
              </div>
            )}

            {showAvatarCategories && <div className="up-avatar-category-list" aria-label="Avatar categories">
              <button
                type="button"
                className={avatarCategory === "all" ? "active" : ""}
                onClick={() => selectAvatarCategory("all")}
              >
                All avatars
              </button>
              {[
                { id: "animals-nature", label: "Animals & nature" },
                { id: "food-drink", label: "Food & drink" },
                { id: "activities", label: "Sports & activities" },
                { id: "travel-places", label: "Travel & places" },
                { id: "objects", label: "Objects & technology" },
                { id: "people-body", label: "People & portraits" },
                { id: "smileys-emotion", label: "Faces & expressions" },
                { id: "symbols", label: "Symbols" },
                ...PROFILE_AVATAR_CATEGORIES,
              ].map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={avatarCategory === category.id ? "active" : ""}
                  onClick={() => selectAvatarCategory(category.id)}
                >
                  {category.label}
                </button>
              ))}
            </div>}

            {showAvatarSearch && <div className="up-avatar-search-row">
              <label className="up-avatar-search-field">
                <HiSearch size={17} />
                <input
                  type="search"
                  value={avatarSearch}
                  onChange={handleAvatarSearchChange}
                  placeholder="Search lion, dog, computer, wind, snake, giraffe, basketball…"
                  aria-label="Search profile avatars"
                  maxLength={48}
                  autoComplete="off"
                />
              </label>
              <span className="up-avatar-search-count">{filteredAvatars.length} found</span>
            </div>}

            <div
              className="up-avatar-grid"
              ref={avatarGridRef}
              onScroll={handleAvatarGridScroll}
              aria-label="Available profile avatars"
              aria-live="polite"
            >
              {openMojiLoading && openMojiAvatars.length === 0 ? (
                <div className="up-avatar-loading">
                  <HiRefresh className="up-spin" /> Loading the illustration library…
                </div>
              ) : visibleAvatars.length === 0 ? (
                <div className="up-avatar-empty">
                  <HiSearch size={24} />
                  <strong>No matching avatars</strong>
                  <span>Try another name or choose a different category.</span>
                </div>
              ) : visibleAvatars.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  className={`up-avatar-option${avatar.artwork === "openmoji" ? " openmoji" : ""}${user?.avatar === avatar.url ? " selected" : ""}`}
                  onClick={() => handleChooseAvatar(avatar)}
                  disabled={uploading || avatarChangeLocked}
                  aria-pressed={user?.avatar === avatar.url}
                  title={avatar.label}
                >
                  <img
                    src={avatar.url}
                    alt={avatar.label}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                  <span>{avatar.label}</span>
                  {user?.avatar === avatar.url && <i><HiCheck size={13} /></i>}
                </button>
              ))}
              {uploading && (
                <div className="up-avatar-loading">
                  <HiRefresh className="up-spin" />
                  <span>Saving your selection…</span>
                </div>
              )}
            </div>

            <footer className="up-photo-modal-footer">
              <span>Showing {visibleAvatars.length} of {filteredAvatars.length.toLocaleString()} illustrations</span>
              <span>{visibleAvatars.length < filteredAvatars.length ? "Scroll to load 50 more" : "You’ve reached the end"}</span>
              <small className="up-photo-attribution">Includes OpenMoji artwork · CC BY-SA 4.0</small>
            </footer>
          </section>
        </div>
      ), document.body)}

      {pendingImage && createPortal((
        <div
          className={pendingImage.type === "upload" ? "up-media-preview-backdrop" : "up-avatar-preview-backdrop"}
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget && !uploading) discardPendingImage();
          }}
        >
          <section
            className={pendingImage.type === "upload" ? "up-media-preview-panel" : "up-avatar-preview-panel"}
            role="dialog"
            aria-modal="true"
            aria-labelledby="up-avatar-preview-title"
          >
            {pendingImage.type === "upload" ? (
              <>
                <div className="up-media-preview-heading">
                  <div className="up-media-preview-heading-copy">
                    <strong id="up-avatar-preview-title">Preview your photo</strong>
                    <span>Check your image before adding it to your profile.</span>
                  </div>
                  <button type="button" className="up-photo-close" onClick={discardPendingImage} disabled={uploading} aria-label="Discard image preview"><FiX /></button>
                </div>
                <div className="up-media-preview-stage">
                  <img src={pendingImage.url} alt={pendingImage.label} />
                </div>
                <div className="up-media-preview-file">
                  <span className="up-media-preview-file-icon"><HiOutlinePhotograph size={19} /></span>
                  <span className="up-media-preview-file-copy">
                    <strong>{pendingImage.label}</strong>
                    <span>{pendingImage.sizeLabel} · {pendingImage.dimensions} · Device image</span>
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="up-avatar-preview-top">
                  <strong id="up-avatar-preview-title">Review your new profile image</strong>
                  <button type="button" className="up-photo-close" onClick={discardPendingImage} disabled={uploading} aria-label="Discard image preview"><FiX /></button>
                </div>
                <div className="up-avatar-preview-image">
                  <img src={pendingImage.url} alt={pendingImage.label} />
                </div>
                <div className="up-avatar-preview-name">
                  <strong>{pendingImage.label}</strong>
                  <span>{pendingImage.categoryLabel} · This will replace your current profile image.</span>
                </div>
              </>
            )}
            {avatarChangeLocked && (
              <div className="up-photo-lock" role="status">
                <HiClock size={18} />
                <span><strong>Profile image change is locked</strong><small>You can confirm another image in {avatarRemainingLabel}.</small></span>
              </div>
            )}
            <div className={pendingImage.type === "upload" ? "up-media-preview-actions" : "up-avatar-preview-actions"}>
              <button type="button" className="up-avatar-preview-btn" onClick={discardPendingImage} disabled={uploading}>Discard</button>
              <button type="button" className="up-avatar-preview-btn confirm" onClick={handleConfirmPendingImage} disabled={uploading || avatarChangeLocked}>
                {uploading ? <><HiRefresh className="up-spin" /> Saving…</> : <><HiCheck /> Confirm selection</>}
              </button>
            </div>
          </section>
        </div>
      ), document.body)}

      {imageViewerOpen && user?.avatar && createPortal((
        <div className="up-image-viewer-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setImageViewerOpen(false); }}>
          <section className="up-image-viewer-panel" role="dialog" aria-modal="true" aria-label="Full-screen profile image">
            <button type="button" className="up-image-viewer-close" onClick={() => setImageViewerOpen(false)} aria-label="Close full-screen profile image"><FiX /></button>
            <img className="up-image-viewer-image" src={user.avatar} alt={`${user.fullName || user.name || "User"} profile image enlarged`} />
            <span className="up-image-viewer-caption">Profile image · Tap outside or close to return</span>
          </section>
        </div>
      ), document.body)}
      </DashboardLayout>
    </>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ icon, label, editing, name, type = "text", value, onChange, placeholder, autoFocus, readonly }) {
  return (
    <div className="up-field">
      <label>
        {icon} {label}
      </label>
      {readonly || !editing ? (
        <p className={readonly ? "readonly" : ""}>
          {value || "—"}
        </p>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
        />
      )}
    </div>
  );
}

// ─── SecurityRow ──────────────────────────────────────────────────────────────
function SecurityRow({ icon, label, sub, status, statusLabel }) {
  return (
    <div className="up-security-row">
      <div className="up-security-left">
        <div className="up-security-icon">{icon}</div>
        <div>
          <p className="up-security-label">{label}</p>
          <p className="up-security-sub">{sub}</p>
        </div>
      </div>
      <span className={`up-security-badge ${status}`}>{statusLabel}</span>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconColor, label, value }) {
  return (
    <div className="up-stat-card">
      <div className="up-stat-icon" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="up-stat-body">
        <h3>{label}</h3>
        <p>{value}</p>
      </div>
    </div>
  );
}