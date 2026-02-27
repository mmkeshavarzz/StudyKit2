/**
 * ============================================
 *  StudyKit — Supabase Core Connection
 * ============================================
 *  Central hub for all database operations.
 *  Every page that talks to the backend,
 *  goes through this file first.
 * ============================================
 *  Version: 1.0.0
 *  Last Modified: 1404/12/08
 * ============================================
 */

/* ── Supabase Project Credentials ── */
const SUPABASE_URL = 'https://nkxteuknthhwjvvztmhz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reHRldWtudGhod2p2dnp0bWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxOTAyODAsImV4cCI6MjA4Nzc2NjI4MH0.o2sVCB-nTE95WU1Nwpa1pVZS17Y2Hwf-W6MzmNq7TCw';

/* 
 * NOTE: The anon key above is a PUBLISHABLE key.
 * It's safe to use in frontend code.
 * RLS policies on Supabase protect the data.
 */

/* ── Initialize Client ── */
const { createClient } = supabase;
const _db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ── Auth Helper Functions ── */

/**
 * Get the currently logged-in user
 * Returns user object or null
 */
async function getCurrentUser() {
    try {
        const { data: { user }, error } = await _db.auth.getUser();
        if (error) throw error;
        return user;
    } catch (e) {
        console.warn('⚠️ Auth check failed:', e.message);
        return null;
    }
}

/**
 * Redirect to login if user is NOT authenticated
 * Used on protected pages (dashboard, settings, etc.)
 */
async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = '/auth/login.html';
        return null;
    }
    return user;
}

/**
 * Redirect to dashboard if user IS authenticated
 * Used on login/register pages
 */
async function redirectIfLoggedIn() {
    const user = await getCurrentUser();
    if (user) {
        window.location.href = '/dashboard/dashboard.html';
    }
    return user;
}

/**
 * Sign out and redirect to homepage
 */
async function signOut() {
    try {
        await _db.auth.signOut();
        window.location.href = '/index.html';
    } catch (e) {
        console.error('❌ Sign out failed:', e.message);
    }
}

/* ── Expose globally ── */
window.StudyKit = {
    db: _db,
    getCurrentUser,
    requireAuth,
    redirectIfLoggedIn,
    signOut
};

console.log('%c🚀 StudyKit Backend Connected!', 'color: #7c5cfc; font-size: 14px; font-weight: bold;');
