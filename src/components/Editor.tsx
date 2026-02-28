"use client";

import { useState } from "react";
import { ResumeData } from "../app/page";
import { Wand2, Printer, Trophy, BadgeCheck } from "lucide-react";

interface EditorProps {
    data: ResumeData;
    isExtracting: boolean;
    onExtract: (text: string, step: number) => void;
    // Step 1でのダイレクト更新用コールバックを追加
    onDirectUpdate?: (profileData: Partial<ResumeData['profile']>) => void;
}

export default function Editor({ data, isExtracting, onExtract, onDirectUpdate }: EditorProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [inputs, setInputs] = useState<Record<number, string>>({});

    // Step 1 専用の各フィールドのローカル状態
    const [step1Data, setStep1Data] = useState({
        name: data.profile.name || "",
        age: data.profile.age || "",
        title: data.profile.title || "",
        experienceYears: data.profile.experienceYears || "",
        address: data.profile.address || "",
        education: data.profile.education || "",
    });

    const totalSteps = 11;

    const placeholders: Record<number, string> = {
        1: "例：山田太郎",
        2: "例：バックエンドエンジニア、テックリードなど",
        3: "例：アーキテクチャ設計から実装まで一人称で完結できるのが強みです。後輩の育成やコードレビュー文化の推進にも貢献してきました。",
        4: "例：Java(5年), Spring Boot(3年), AWS(EC2, RDS)(2年)",
        5: "例：大手ECサイトの決済基盤システムのリプレイス",
        6: "例：2023年4月〜現在。5名チームのサブリーダーとして参画しました。",
        7: "例：言語はGo、DBはPostgreSQL、インフラはAWS ECSを使用しました。",
        8: "例：要件定義から基本設計、一部実装とテストまで一貫して担当しました。",
        9: "例：既存のレガシーコードの解読に苦労しましたが、テストを拡充しながらリファクタリングを完遂し、処理時間を30%削減しました。",
        11: "例：AWS認定ソリューションアーキテクト アソシエイトを持っています。GitHub: https://github.com/..."
    };

    const titles: Record<number, string> = {
        1: "Step 1: お名前を教えてください。",
        2: "Step 2: 現在のメインの職種は何ですか？",
        3: "Step 3: エンジニアとしての「一番の強み・アピールポイント」を教えてください。",
        4: "Step 4: 得意なスキル・技術は何ですか？（最大5つ）",
        5: "Step 5: 一番アピールしたいプロジェクトは、何のシステムでしたか？（概要）",
        6: "Step 6: そのプロジェクトの「期間」と「あなたの役割」を教えてください。",
        7: "Step 7: そのプロジェクトで使用した「言語・フレームワーク・インフラ」は何でしたか？",
        8: "Step 8: あなたが「担当した工程」はどこでしたか？",
        9: "Step 9: そのプロジェクトで「一番苦労したこと・達成した成果」を教えてください。",
        10: "Step 10: ほかに書きたいプロジェクトはありますか？",
        11: "Step 11: 保有しているIT資格や、ポートフォリオ（GitHub等）のURLがあれば教えてください。"
    };

    const handleNext = () => {
        if (currentStep === 1) {
            // Step 1 はAPI抽出を通さず、ローカルの入力内容をそのまま反映して次へ
            if (onDirectUpdate) {
                onDirectUpdate({
                    name: step1Data.name,
                    age: step1Data.age,
                    title: step1Data.title,
                    experienceYears: step1Data.experienceYears,
                    address: step1Data.address,
                    education: step1Data.education,
                });
            }
            setCurrentStep(c => c + 1);
            return;
        }

        const text = inputs[currentStep] || "";
        if (text.trim() && currentStep !== 10) {
            onExtract(text, currentStep);
        }
        if (currentStep < totalSteps) setCurrentStep(c => c + 1);
    };

    const handlePrev = () => {
        if (currentStep > 1) setCurrentStep(c => c - 1);
    };

    const handleLoop = (yes: boolean) => {
        if (yes) {
            // Step 5に戻り、プロジェクト系の入力をリセット
            setInputs(prev => {
                const newInputs = { ...prev };
                [5, 6, 7, 8, 9].forEach(step => delete newInputs[step]);
                return newInputs;
            });
            setCurrentStep(5);
        } else {
            // 次のステップへ
            setCurrentStep(11);
        }
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
                    {titles[currentStep]}
                </label>

                {currentStep === 1 ? (
                    // Step 1: 基本情報の複数フォームUI
                    <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2 pb-4">
                        <div className="flex space-x-4">
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-semibold text-gray-500">氏名</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="例：山田 太郎"
                                    value={step1Data.name}
                                    onChange={(e) => setStep1Data(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-semibold text-gray-500">年齢・生年月日</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="例：28歳 (1995/04/01)"
                                    value={step1Data.age}
                                    onChange={(e) => setStep1Data(prev => ({ ...prev, age: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-semibold text-gray-500">現在の職種</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="例：バックエンドエンジニア"
                                    value={step1Data.title}
                                    onChange={(e) => setStep1Data(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <label className="text-xs font-semibold text-gray-500">エンジニア経験年数</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="例：5年"
                                    value={step1Data.experienceYears}
                                    onChange={(e) => setStep1Data(prev => ({ ...prev, experienceYears: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500">住所（市区町村まで可）</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="例：東京都渋谷区"
                                value={step1Data.address}
                                onChange={(e) => setStep1Data(prev => ({ ...prev, address: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500">最終学歴</label>
                            <input
                                type="text"
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="例：〇〇大学情報学部 卒業"
                                value={step1Data.education}
                                onChange={(e) => setStep1Data(prev => ({ ...prev, education: e.target.value }))}
                            />
                        </div>

                        <div className="flex space-x-3 pt-4 mt-auto">
                            <button
                                onClick={handlePrev}
                                disabled={currentStep === 1 || isExtracting}
                                className="w-1/3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                戻る
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={!step1Data.name.trim() && !step1Data.title.trim()}
                                className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center space-x-2">
                                    <span>次へ進む</span>
                                </div>
                            </button>
                        </div>
                    </div>
                ) : currentStep === 10 ? (
                    // Step 10: 複数プロジェクト分岐用UI
                    <div className="flex-1 flex flex-col justify-center items-center space-y-4 bg-gray-50 border border-gray-200 rounded-xl p-6">
                        <p className="text-gray-600 font-medium">これまでの入力が1件のプロジェクトとして追加されています。</p>
                        <div className="flex space-x-4 w-full justify-center">
                            <button
                                onClick={() => handleLoop(true)}
                                className="px-6 py-4 bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 rounded-xl font-bold shadow-sm transition-all"
                            >
                                はい（もう1件追加する）
                            </button>
                            <button
                                onClick={() => handleLoop(false)}
                                className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all"
                            >
                                いいえ（次のステップへ）
                            </button>
                        </div>
                    </div>
                ) : (
                    // 通常のテキストエリア入力UI
                    <>
                        <textarea
                            className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none leading-relaxed"
                            placeholder={placeholders[currentStep]}
                            value={inputs[currentStep] || ""}
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
                                disabled={isExtracting || !(inputs[currentStep] || "").trim()}
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
                    </>
                )}
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
