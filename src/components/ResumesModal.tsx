'use client'

import { useState, useEffect } from 'react'
import { X, Trash2, FileText, Loader2, Calendar } from 'lucide-react'
import { getMyResumes, getResumeById, deleteResume } from '../actions/resume'
import { ResumeData } from '../app/page'

type ResumeLight = {
    id: string
    title: string
    updated_at: string
}

type ResumesModalProps = {
    isOpen: boolean
    onClose: () => void
    onLoadResume: (id: string, title: string, data: ResumeData) => void
}

export default function ResumesModal({ isOpen, onClose, onLoadResume }: ResumesModalProps) {
    const [resumes, setResumes] = useState<ResumeLight[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            fetchResumes()
        }
    }, [isOpen])

    const fetchResumes = async () => {
        setIsLoading(true)
        setError(null)
        const result = await getMyResumes()

        if (result.success && result.data) {
            setResumes(result.data as ResumeLight[])
        } else {
            setError('履歴書の取得に失敗しました。')
        }
        setIsLoading(false)
    }

    const handleLoad = async (id: string) => {
        setIsLoading(true)
        const result = await getResumeById(id)
        setIsLoading(false)

        if (result.success && result.data) {
            onLoadResume(result.data.id, result.data.title, result.data.data)
            onClose()
        } else {
            alert(result.error || 'データの読み込みに失敗しました。')
        }
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        const confirmDelete = window.confirm('本当にこの履歴書を削除しますか？\n（この操作は取り消せません）')
        if (!confirmDelete) return

        setIsDeletingId(id)
        const result = await deleteResume(id)
        setIsDeletingId(null)

        if (result.success) {
            // 成功したら一覧表からフィルタリングして消す
            setResumes(prev => prev.filter(r => r.id !== id))
        } else {
            alert(result.error || '削除に失敗しました。')
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div
                className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">過去の履歴書データ</h2>
                        <p className="text-sm text-gray-500 mt-1">クラウドに保存した履歴書を読み込んだり削除できます</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    {isLoading && resumes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Loader2 className="animate-spin w-8 h-8 text-blue-500 mb-4" />
                            <p>データを読み込み中...</p>
                        </div>
                    ) : resumes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <FileText className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-gray-600 font-medium">保存された履歴書がありません</p>
                            <p className="text-sm mt-1">右上の「☁️ クラウド保存」ボタンから保存してください</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {resumes.map(resume => (
                                <div
                                    key={resume.id}
                                    onClick={() => handleLoad(resume.id)}
                                    className="group flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mt-0.5">
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                                {resume.title || '無題の経歴書'}
                                            </h3>
                                            <div className="flex items-center text-xs text-gray-500 mt-1 space-x-1.5">
                                                <Calendar size={12} />
                                                <span>{new Date(resume.updated_at).toLocaleString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} 最終更新</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center pl-4 border-l border-gray-100">
                                        <button
                                            onClick={(e) => handleDelete(resume.id, e)}
                                            disabled={isDeletingId === resume.id}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="この履歴書を削除"
                                        >
                                            {isDeletingId === resume.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Loading Overlay */}
                {isLoading && resumes.length > 0 && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px] rounded-2xl z-10">
                        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
                    </div>
                )}
            </div>
        </div>
    )
}
