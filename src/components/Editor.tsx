"use client";

import { useState } from "react";
import { ResumeData } from "../app/page";
import { Wand2, Printer, Trophy, BadgeCheck } from "lucide-react";

interface EditorProps {
    data: ResumeData;
    isExtracting: boolean;
    onExtract: (text: string, step: number) => void;
}

export default function Editor({ data, isExtracting, onExtract }: EditorProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [inputs, setInputs] = useState({ 1: "", 2: "", 3: "", 4: "", 5: "", 6: "", 7: "" });

    const totalSteps = 7;

    const placeholders = {
        1: "例：山田太郎です。サーバーサイドエンジニアとして働いています。",
        2: "例：要件定義から実装まで、一人称で完結できるのが強みです。また、後輩の育成やコードレビュー文化の推進にも貢献してきました。",
        3: "例：業務ではJavaとSpring Bootを3年、AWS(EC2, RDS)でのインフラ構築を経験しました。個人開発でReactも少し触っています。",
        4: "例：2022年から1年間、大手ECサイトの決済システムのリプレイスを行いました。5名チームのテックリードでした。",
        5: "例：要件定義からリリースまで一貫して担当しました。技術はGo、PostgreSQL、Docker、AWS ECSを使用しました。",
        6: "例：既存のレガシーコードの解読に苦労しましたが、テストを拡充しながらリファクタリングを完遂し、処理時間を30%削減しました。",
        7: "例：AWS認定ソリューションアーキテクト アソシエイトを持っています。GitHub: https://github.com/..."
    };

    const titles = {
        1: "Step 1: お名前と現在のメインの職種を教えてください。",
        2: "Step 2: ご自身の「強み」や「得意なこと」は何ですか？",
        3: "Step 3: これまで経験した主な言語やツール、インフラ技術を教えてください。",
        4: "Step 4: 一番アピールしたいプロジェクトの概要（期間、チーム規模、担当役割）を教えてください。",
        5: "Step 5: そのプロジェクトで使用した「技術・環境」と「担当した工程」を教えてください。",
        6: "Step 6: そのプロジェクトで「一番苦労した点」や「達成した成果・実績」を教えてください。",
        7: "Step 7: 保有資格や、GitHub/QiitaなどのポートフォリオURLがあれば教えてください。"
    };

    const handleNext = () => {
        const text = inputs[currentStep as keyof typeof inputs];
        if (text.trim()) {
            onExtract(text, currentStep);
        }
        if (currentStep < totalSteps) setCurrentStep(c => c + 1);
    };

    const handlePrev = () => {
        if (currentStep > 1) setCurrentStep(c => c - 1);
    };

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
                    <div title="基本入力完了"><BadgeCheck size={24} /></div>
                    <div title="成果の定量化" className="opacity-40"><BadgeCheck size={24} /></div>
                </div>
            </div>

            {/* ウィザード進捗バー */}
            <div className="flex space-x-1 pb-2">
                {Array.from({ length: totalSteps }, (_, i) => i + 1).map(step => (
                    <div
                        key={step}
                        className={`h-2 flex-1 rounded-full transition-colors ${currentStep >= step ? 'bg-blue-600' : 'bg-gray-200'}`}
                    />
                ))}
            </div>

            {/* AI抽出ウィザード入力エリア */}
            <div className="flex flex-col flex-1 space-y-3">
                <label className="text-sm font-bold text-gray-800 block">
                    {titles[currentStep as keyof typeof titles]}
                </label>
                <textarea
                    className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none leading-relaxed"
                    placeholder={placeholders[currentStep as keyof typeof placeholders]}
                    value={inputs[currentStep as keyof typeof inputs]}
                    onChange={(e) => setInputs(prev => ({ ...prev, [currentStep]: e.target.value }))}
                />

                <div className="flex space-x-3 pt-2">
                    <button
                        onClick={handlePrev}
                        disabled={currentStep === 1 || isExtracting}
                        className="w-1/3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        戻る
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={isExtracting || !inputs[currentStep as keyof typeof inputs].trim()}
                        className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExtracting ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>構造化しています...</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Wand2 size={18} />
                                <span>{currentStep === totalSteps ? "完了（反映する）" : "次へ進む (AI自動反映)"}</span>
                            </div>
                        )}
                    </button>
                </div>
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
        </div >
    );
}
