import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { X } from 'lucide-react'
import Image from 'next/image'

type AuthModalProps = {
    isOpen: boolean
    onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState('')
    const supabase = createClient()

    if (!isOpen) return null

    const handleMagicLinkLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage('')

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) throw error
            setMessage('ログインリンクを記載したメールを送信しました！メールボックスをご確認ください。')
        } catch (error) {
            if (error instanceof Error) {
                setMessage(`ログインに失敗しました: ${error.message}`)
            } else {
                setMessage('ログインに失敗しました')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleOAuthLogin = async (provider: 'google' | 'github') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (error) throw error
        } catch (error) {
            if (error instanceof Error) {
                setMessage(`${provider}でのログインに失敗しました: ${error.message}`)
            } else {
                setMessage(`${provider}でのログインに失敗しました`)
            }
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full relative overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">ログイン / 会員登録</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <p className="text-sm text-gray-600 text-center">
                        経歴書のデータを安全にクラウドへ保存し、<br />複数のバージョンを管理できるようになります。
                    </p>

                    <form onSubmit={handleMagicLinkLogin} className="space-y-3">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                メールアドレス
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !email}
                            className="w-full py-2.5 px-4 bg-gray-800 hover:bg-black text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                'マジックリンクでログイン/登録'
                            )}
                        </button>
                    </form>

                    {message && (
                        <div className={`p-3 rounded-lg text-sm ${message.includes('失敗') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                            {message}
                        </div>
                    )}

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-xs text-gray-400 uppercase tracking-wider">または</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => handleOAuthLogin('google')}
                            className="w-full relative flex items-center justify-center py-2.5 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Image src="https://www.google.com/favicon.ico" alt="Google" width={16} height={16} className="absolute left-4" unoptimized />
                            Googleで続ける
                        </button>
                        <button
                            onClick={() => handleOAuthLogin('github')}
                            className="w-full relative flex items-center justify-center py-2.5 px-4 bg-[#24292e] hover:bg-[#1b1f23] text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            <Image src="https://github.com/favicon.ico" alt="GitHub" width={16} height={16} className="absolute left-4 invert" unoptimized />
                            GitHubで続ける
                        </button>
                    </div>

                    <p className="text-xs text-gray-400 text-center mt-6">
                        ※アカウント作成によりプライバシーポリシーと<br />利用規約に同意したものとみなされます
                    </p>
                </div>
            </div>
        </div>
    )
}
