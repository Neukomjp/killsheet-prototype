"use client";

import { useState } from "react";
import { ResumeData, InterviewQnA } from "../app/page";
import { MessageSquare, Lightbulb, PlayCircle, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

interface InterviewPanelProps {
    data: ResumeData;
    onUpdateInterviewData: (qnAs: InterviewQnA[]) => void;
}

export default function InterviewPanel({ data, onUpdateInterviewData }: InterviewPanelProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const hasData = (data.profile.name || data.profile.summary || data.skills.length > 0 || data.projects.length > 0);
    const hasExistingQnAs = data.interviewQnAs && data.interviewQnAs.length > 0;

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch("/api/interview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentProfile: data.profile,
                    skills: data.skills,
                    projects: data.projects
                })
            });

            if (!res.ok) throw new Error("API request failed");

            const result = await res.json();

            if (result.qnAs && result.qnAs.length > 0) {
                onUpdateInterviewData(result.qnAs);

                // 成功時の紙吹雪（インディゴ・パープル系）
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ["#6366f1", "#8b5cf6", "#a855f7", "#ec4899"]
                });
            }
        } catch (error) {
            console.error("Interview Generation Error:", error);
            alert("質問の生成に失敗しました。");
        } finally {
            setIsGenerating(false);
        }
    };

    if (!hasData) {
        return (
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 min-h-[500px] flex flex-col justify-center items-center text-center">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <MessageSquare size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">データがありません</h3>
                <p className="text-gray-500 max-w-sm">
                    まずは左側のエディタから職務経歴書を作成してください。<br />
                    AIがあなたの経歴を読み込み、面接対策をアシストします。
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 min-h-[500px]">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                        <span className="bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-3 shadow-sm">🎤</span>
                        AI面接対策アシスト
                    </h2>
                    <p className="text-gray-600">
                        完成した経歴データから、実際の面接で聞かれやすい「想定質問」と「回答のアドバイス」をAIが分析します。
                    </p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>AIが分析中...</span>
                        </>
                    ) : (
                        <>
                            <PlayCircle size={20} />
                            <span>{hasExistingQnAs ? "別の質問を再生成" : "質問をAI生成する"}</span>
                        </>
                    )}
                </button>
            </div>

            {hasExistingQnAs ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    {data.interviewQnAs!.map((qna, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-indigo-50/50 border-b border-indigo-100 p-5 flex items-start space-x-4">
                                <div className="bg-indigo-600 text-white font-bold rounded-lg w-8 h-8 flex items-center justify-center shrink-0 mt-0.5">
                                    Q{idx + 1}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg leading-relaxed">{qna.question}</h4>
                                </div>
                            </div>
                            <div className="p-5 flex items-start space-x-4 bg-white">
                                <div className="text-amber-500 shrink-0 mt-0.5">
                                    <Lightbulb size={24} />
                                </div>
                                <div className="space-y-2">
                                    <h5 className="font-bold text-sm text-amber-600 uppercase tracking-wider">Advice</h5>
                                    <p className="text-gray-700 leading-relaxed text-sm">
                                        {qna.aiFeedback}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-indigo-50 border border-indigo-100 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=interview" alt="AI Bot" className="w-24 h-24 opacity-80 mix-blend-multiply" />
                    <h3 className="text-lg font-bold text-indigo-800">面接の準備はできていますか？</h3>
                    <p className="text-indigo-600 max-w-md text-sm">
                        右上のボタンをクリックすると、AIが「あなたのスキルシート」を面接官の視点で読み込み、的確な質問とアドバイスを返してくれます。
                    </p>
                </div>
            )}
        </div>
    );
}
