/**
 * db.js — Supabase data service for ArthhSaathi
 * All reads/writes go through this module.
 * Falls back gracefully so unauthenticated sample views still work.
 */
import { supabase } from './supabaseClient';

// ─── helpers ───────────────────────────────────────────────────────────────
async function getUid() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
}

// ─── GOALS ─────────────────────────────────────────────────────────────────
export async function fetchGoals() {
    const uid = await getUid();
    if (!uid) return [];
    const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: true });
    if (error) { console.error(error); return []; }
    // normalise snake_case → camelCase for app
    return data.map(g => ({
        id: g.id,
        name: g.name,
        target: Number(g.target),
        saved: Number(g.saved),
        targetDate: g.target_date,
        weeksRemaining: g.weeks_remaining,
        history: g.history ?? [],
        createdAt: g.created_at,
    }));
}

export async function createGoal({ name, target, saved = 0, targetDate, weeksRemaining }) {
    const uid = await getUid();
    if (!uid) throw new Error('Not authenticated');
    const { data, error } = await supabase
        .from('goals')
        .insert({
            user_id: uid,
            name,
            target,
            saved,
            target_date: targetDate,
            weeks_remaining: weeksRemaining,
            history: [],
        })
        .select()
        .single();
    if (error) throw error;
    return {
        id: data.id,
        name: data.name,
        target: Number(data.target),
        saved: Number(data.saved),
        targetDate: data.target_date,
        weeksRemaining: data.weeks_remaining,
        history: data.history ?? [],
        createdAt: data.created_at,
    };
}

export async function updateGoalSaved(id, saved) {
    const uid = await getUid();
    if (!uid) return;
    const { error } = await supabase
        .from('goals')
        .update({ saved })
        .eq('id', id)
        .eq('user_id', uid);
    if (error) console.error(error);
}

export async function deleteGoal(id) {
    const uid = await getUid();
    if (!uid) return;
    const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', uid);
    if (error) console.error(error);
}

// ─── DAILY ENTRIES ─────────────────────────────────────────────────────────
export async function fetchDailyEntries() {
    const uid = await getUid();
    if (!uid) return [];
    const { data, error } = await supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });
    if (error) { console.error(error); return []; }
    return data.map(e => ({
        id: e.id,
        date: e.entry_date,
        category: e.category,
        categoryLabel: e.category_label,
        categoryColor: e.category_color,
        amount: Number(e.amount),
        description: e.description ?? '',
        goalId: e.goal_id ?? null,
    }));
}

export async function createDailyEntry({ date, category, categoryLabel, categoryColor, amount, description, goalId }) {
    const uid = await getUid();
    if (!uid) throw new Error('Not authenticated');
    const { data, error } = await supabase
        .from('daily_entries')
        .insert({
            user_id: uid,
            entry_date: date,
            category,
            category_label: categoryLabel,
            category_color: categoryColor,
            amount,
            description: description ?? '',
            goal_id: goalId || null,
        })
        .select()
        .single();
    if (error) throw error;
    return {
        id: data.id,
        date: data.entry_date,
        category: data.category,
        categoryLabel: data.category_label,
        categoryColor: data.category_color,
        amount: Number(data.amount),
        description: data.description ?? '',
        goalId: data.goal_id ?? null,
    };
}

export async function deleteDailyEntry(id) {
    const uid = await getUid();
    if (!uid) return;
    const { error } = await supabase
        .from('daily_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', uid);
    if (error) console.error(error);
}

// ─── CUSTOM CATEGORIES ─────────────────────────────────────────────────────
export async function fetchCustomCategories() {
    const uid = await getUid();
    if (!uid) return [];
    const { data, error } = await supabase
        .from('custom_categories')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: true });
    if (error) { console.error(error); return []; }
    return data.map(c => ({ id: c.cat_id, label: c.label, color: c.color, custom: true }));
}

export async function addCustomCategory({ id, label, color }) {
    const uid = await getUid();
    if (!uid) return;
    const { error } = await supabase
        .from('custom_categories')
        .insert({ user_id: uid, cat_id: id, label, color });
    if (error) console.error(error);
}

export async function removeCustomCategory(catId) {
    const uid = await getUid();
    if (!uid) return;
    const { error } = await supabase
        .from('custom_categories')
        .delete()
        .eq('user_id', uid)
        .eq('cat_id', catId);
    if (error) console.error(error);
}

// ─── HIDDEN BASE CATEGORIES ────────────────────────────────────────────────
export async function fetchHiddenCategories() {
    const uid = await getUid();
    if (!uid) return [];
    const { data, error } = await supabase
        .from('hidden_categories')
        .select('cat_id')
        .eq('user_id', uid);
    if (error) { console.error(error); return []; }
    return data.map(r => r.cat_id);
}

export async function hideBaseCategory(catId) {
    const uid = await getUid();
    if (!uid) return;
    const { error } = await supabase
        .from('hidden_categories')
        .insert({ user_id: uid, cat_id: catId });
    if (error) console.error(error);
}

export async function unhideBaseCategory(catId) {
    const uid = await getUid();
    if (!uid) return;
    const { error } = await supabase
        .from('hidden_categories')
        .delete()
        .eq('user_id', uid)
        .eq('cat_id', catId);
    if (error) console.error(error);
}

// ─── MONTHLY REPORT ────────────────────────────────────────────────────────
export async function fetchLatestReport() {
    const uid = await getUid();
    if (!uid) return null;
    const { data, error } = await supabase
        .from('monthly_reports')
        .select('*')
        .eq('user_id', uid)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    if (error) { console.error(error); return null; }
    if (!data) return null;
    return {
        income: Number(data.income),
        expenses: data.expenses,
        totalExpenses: Number(data.total_expenses),
        generatedAt: data.generated_at,
    };
}

export async function saveMonthlyReport({ income, expenses, totalExpenses }) {
    const uid = await getUid();
    if (!uid) return;
    const { error } = await supabase
        .from('monthly_reports')
        .insert({
            user_id: uid,
            income,
            expenses,
            total_expenses: totalExpenses,
        });
    if (error) console.error(error);
}

// ─── COACH MESSAGES ────────────────────────────────────────────────────────
export async function fetchCoachMessages() {
    const uid = await getUid();
    if (!uid) return [];
    const { data, error } = await supabase
        .from('coach_messages')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: true });
    if (error) { console.error(error); return []; }
    return data.map(m => ({
        role: m.role,
        content: m.content,
        tags: m.tags ?? [],
        suggestedGoals: m.suggested_goals ?? [],
        isReportMsg: m.is_report_msg ?? false,
        isAnalysis: m.is_analysis ?? false,
    }));
}

export async function appendCoachMessage({ role, content, tags = [], suggestedGoals = [], isReportMsg = false, isAnalysis = false }) {
    const uid = await getUid();
    if (!uid) return;
    const { error } = await supabase.from('coach_messages').insert({
        user_id: uid,
        role,
        content,
        tags,
        suggested_goals: suggestedGoals,
        is_report_msg: isReportMsg,
        is_analysis: isAnalysis,
    });
    if (error) console.error(error);
}

export async function clearCoachMessages() {
    const uid = await getUid();
    if (!uid) return;
    const { error } = await supabase.from('coach_messages').delete().eq('user_id', uid);
    if (error) console.error(error);
}

// ─── USER ACCOUNT ──────────────────────────────────────────────────────────
export async function deleteUserAccount() {
    const uid = await getUid();
    if (!uid) return;

    // RLS will ensure we only delete this user's data
    await Promise.all([
        supabase.from('goals').delete().eq('user_id', uid),
        supabase.from('daily_entries').delete().eq('user_id', uid),
        supabase.from('custom_categories').delete().eq('user_id', uid),
        supabase.from('hidden_categories').delete().eq('user_id', uid),
        supabase.from('monthly_reports').delete().eq('user_id', uid),
        supabase.from('coach_messages').delete().eq('user_id', uid)
    ]);

    await supabase.auth.signOut();
}
