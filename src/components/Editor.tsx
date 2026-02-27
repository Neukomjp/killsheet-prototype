"use client";

import { useState } from "react";
import { ResumeData } from "../app/page";
import { Wand2, Printer, Trophy, BadgeCheck } from "lucide-react";

interface EditorProps {
    data: ResumeData;
    isExtracting: boolean;
    onExtract: (text: string) => void;
}

export default function Editor({ data, isExtracting, onExtract }: EditorProps) {
    const [inputText, setInputText] = useState("");

    return (
        <div className="flex flex-col h-full p-6 space-y-6">
            <div className="space-y-1 block">
                <h1 className="text-2xl font-bold text-gray-900">Skill Generator</h1>
                <p className="text-sm text-gray-500">入力を苦痛からワクワクへ変えるツール</p>
            </div>

            {/* スコア・バッジハイライト */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                        <Trophy size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-blue-600 font-medium font-semibold">現在の完成度スコア</p>
                        <p className="text-2xl font-bold text-blue-900">{data.profile.score} <span className="text-sm font-normal">/ 100</span></p>
                    </div>
                </div>
                <div className="flex space-x-1 text-blue-500">
                    <BadgeCheck size={24} title="基本入力完了" />
                    <BadgeCheck size={24} title="成果の定量化" className="opacity-40" />
                </div>
            </div>

            {/* AI抽出モック入力エリア */}
            <div className="flex flex-col flex-1 space-y-3">
                <label className="text-sm font-medium text-gray-700 block">
                    職務経歴を雑に貼り付けてください
                </label>
                <textarea
                    className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    placeholder="例：2023年〜◯◯株式会社に常駐し、Reactで管理画面を作りました。苦労した点は..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                <button
                    onClick={() => {
                        if (inputText.trim()) onExtract(inputText);
                    }}
                    disabled={isExtracting || !inputText.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isExtracting ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>構造化しています...</span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <Wand2 size={18} />
                            <span>AIで自動構造化して追加</span>
                        </div>
                    )}
                </button>
            </div>

            {/* 印刷・プレビューボタン */}
            <div className="pt-4 border-t border-gray-100">
                <button
                    onClick={() => window.print()}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl border border-gray-200 flex items-center justify-center space-x-2 transition-colors"
                >
                    <Printer size={18} />
                    <span>PDFで出力・印刷する</span>
                </button>
            </div>
        </div>
    );
}
