'use server'

import { createClient } from '@/utils/supabase/server'
import { ResumeData } from '@/app/page'

/**
 * 現在の経歴書（ResumeData）をクラウド（Supabase）に保存（Upsert）します。
 */
export async function saveResume(resumeId: string | null, title: string, data: ResumeData) {
    const supabase = createClient()

    // ログインユーザー情報の取得
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { success: false, error: 'ログインが必要です。' }
    }

    try {
        const payload = {
            ...(resumeId ? { id: resumeId } : {}), // 既存データの場合はIDを指定して更新
            user_id: user.id,
            title,
            data: data,
            updated_at: new Date().toISOString(),
        }

        const { data: savedData, error } = await supabase
            .from('resumes')
            .upsert(payload)
            .select()
            .single()

        if (error) throw error

        return {
            success: true,
            id: savedData.id,
            message: '経歴書をクラウドに保存しました。'
        }
    } catch (error) {
        console.error('Error saving resume:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        return { success: false, error: `保存に失敗しました: ${errorMessage}` }
    }
}

/**
 * ログインユーザーが過去に保存した経歴書の一覧を取得します。
 */
export async function getMyResumes() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, data: [] }
    }

    try {
        const { data, error } = await supabase
            .from('resumes')
            .select('id, title, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })

        if (error) throw error

        return { success: true, data }
    } catch (error) {
        console.error('Error fetching resumes:', error)
        return { success: false, data: [] }
    }
}

/**
 * 指定したIDの経歴書データを取得します。
 */
export async function getResumeById(id: string) {
    const supabase = createClient()

    try {
        const { data, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error

        return { success: true, data }
    } catch (error) {
        console.error('Error fetching resume details:', error)
        return { success: false, error: '経歴書の取得に失敗しました。' }
    }
}

/**
 * 指定したIDの経歴書データを削除します。
 */
export async function deleteResume(id: string) {
    const supabase = createClient()

    try {
        const { error } = await supabase
            .from('resumes')
            .delete()
            .eq('id', id)

        if (error) throw error

        return { success: true }
    } catch (error) {
        console.error('Error deleting resume:', error)
        return { success: false, error: '削除に失敗しました。' }
    }
}
