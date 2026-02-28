"use client";

import { useState } from "react";
import { ResumeData } from "../app/page";
import { Wand2, Printer, Trophy, BadgeCheck, UploadCloud, Download, Upload } from "lucide-react";

interface EditorProps {
    data: ResumeData;
    isExtracting: boolean;
    onExtract: (text: string, step: number) => void;
    // Step 1でのダイレクト更新用コールバックを追加
    onDirectUpdate?: (profileData: Partial<ResumeData['profile']>) => void;
    // Step 4（スキル年数入力完了時）のダイレクト更新コールバックを追加
    onDirectSkillsUpdate?: (skillsData: { subject: string; score: number }[]) => void;
    // PDF等からの全文インポート反映用コールバックを追加
    onImportAll?: (importedData: ResumeData) => void;
    // Step 14（最適化）結果反映用コールバックを追加
    onOptimizeProfile?: (optimizedData: { summary: string; pr: string }) => void;
    // URLパース（Step 13）結果反映用コールバックを追加
    onParseUrl?: (parsedData: { skills: string[]; prText: string; originUrl: string }) => void;
}

export default function Editor({ data, isExtracting, onExtract, onDirectUpdate, onDirectSkillsUpdate, onImportAll, onOptimizeProfile, onParseUrl }: EditorProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [inputs, setInputs] = useState<Record<number, string>>({});
    const [isImporting, setIsImporting] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isParsingUrl, setIsParsingUrl] = useState(false);
    const [urlInput, setUrlInput] = useState("");

    // Step 1 専用の各フィールドのローカル状態
    const [step1Data, setStep1Data] = useState({
        name: data.profile.name || "",
        age: data.profile.age || "",
        title: data.profile.title || "",
        experienceYears: data.profile.experienceYears || "",
        address: data.profile.address || "",
        education: data.profile.education || "",
    });

    // Step 3, 4用のスキル選択・年数ステート
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [skillYears, setSkillYears] = useState<Record<string, number>>({});

    // プリセットのスキル選択肢リスト（カテゴリ別に大幅拡充）
    const skillCategories = {
        "Frontend": [
            "HTML / CSS", "JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Nuxt.js",
            "Svelte", "Angular", "Tailwind CSS", "Sass / SCSS", "WebGL / Three.js"
        ],
        "Backend": [
            "Node.js", "Python", "Java", "Go", "Ruby", "PHP", "C#", "C / C++", "Rust",
            "Spring Boot", "Ruby on Rails", "Laravel", "Django", "FastAPI", "NestJS", "Express"
        ],
        "Database & Storage": [
            "MySQL", "PostgreSQL", "Oracle DB", "SQL Server", "MongoDB", "DynamoDB",
            "Redis", "Memcached", "Elasticsearch", "Firebase", "Supabase"
        ],
        "Infrastructure & Cloud": [
            "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Linux", "Nginx / Apache",
            "Terraform", "Ansible", "CI/CD (GitHub Actions等)", "Vercel / Heroku"
        ],
        "Tools & Others": [
            "Git / GitHub", "GraphQL", "REST API設計", "Microservices",
            "アジャイル / Scrum", "要件定義 / 基本設計", "チームマネジメント / テックリード"
        ]
    };

    const totalSteps = 14;

    const placeholders: Record<number, string> = {
        2: "例：アーキテクチャ設計から実装まで一人称で完結できるのが強みです。後輩の育成やコードレビュー文化の推進にも貢献してきました。",
        5: "例：大手ECサイトの決済基盤システムのリプレイス",
        6: "例：2023年4月〜現在。5名チームのサブリーダーとして参画しました。",
        7: "例：言語はGo、DBはPostgreSQL、インフラはAWS ECSを使用しました。",
        8: "例：要件定義から基本設計、一部実装とテストまで一貫して担当しました。",
        9: "例：既存のレガシーコードの解読に苦労しましたが、テストを拡充しながらリファクタリングを完遂し、処理時間を30%削減しました。",
        10: "例：3名のバックエンドチームでプレイングマネージャーを務めました。若手のコードレビューや目標設定、1on1などを実施していました。",
        11: "例：リリース頻度を上げるため、GitHub Actionsを用いたCI/CDパイプラインを構築し、デプロイ工数を週4時間削減しました。",
        13: "例：AWS認定ソリューションアーキテクト アソシエイトを持っています。GitHub: https://github.com/...",
        14: "例：\n【必須スキル】\n- React, Next.jsを用いたフロントエンド開発経験（3年以上）\n- TypeScriptによる堅牢な型定義の経験\n\n【歓迎スキル】\n- バックエンドAPIの設計・開発経験\n- チームのリードやコードレビューの経験"
    };

    const titles: Record<number, string> = {
        1: "Step 1: 基本情報を教えてください。",
        2: "Step 2: エンジニアとしての「一番の強み・アピールポイント」を教えてください。",
        3: "Step 3: 経験のあるスキル・技術を選択してください（複数可）",
        4: "Step 4: 選択したスキルの「経験年数」を入力してください。",
        5: "Step 5: 一番アピールしたいプロジェクトは、何のシステムでしたか？（概要）",
        6: "Step 6: そのプロジェクトの「期間」と「あなたの役割」を教えてください。",
        7: "Step 7: そのプロジェクトで使用した「言語・フレームワーク・インフラ」は何でしたか？",
        8: "Step 8: あなたが「担当した工程」はどこでしたか？",
        9: "Step 9: そのプロジェクトで「一番苦労したこと・達成した成果」を教えてください。",
        10: "Step 10: チームマネジメントや、後輩育成・技術リードの経験があれば教えてください。（メンバー数、スクラムマスター経験など）",
        11: "Step 11: 技術以外で、プロセス改善や売上向上等、ビジネス・チーム全体に与えたインパクトがあれば教えてください。",
        12: "Step 12: ほかに書きたいプロジェクトはありますか？",
        13: "Step 13: 保有しているIT資格や、ポートフォリオ（GitHub等）のURLがあれば教えてください。",
        14: "Step 14 (Optional): 応募したい求人票や案件の要件を入力してください。AIがレジュメを応募先向けに最適化します。"
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

        // Step 3 (スキル選択) はAIを通さずに次へ
        if (currentStep === 3) {
            setCurrentStep(c => c + 1);
            return;
        }

        // Step 4 (スキル年数) はAIを通さずにローカル処理で反映
        if (currentStep === 4) {
            if (onDirectSkillsUpdate) {
                // 選ばれたスキルの年数からスコアを簡易算出して更新（例: 1年=30点, 2年=50点, 3年=70点, 5年=100点）
                const skillsData = selectedSkills.map(skill => {
                    const years = skillYears[skill] || 0;
                    let score = 20; // 基礎点
                    if (years >= 5) score = 100;
                    else if (years >= 3) score = 75;
                    else if (years >= 2) score = 55;
                    else if (years >= 1) score = 35;

                    return { subject: skill, score: Math.min(score, 100) };
                }).slice(0, 5); // チャートの見栄え上、最大5つ程度に絞るかそのまま渡す

                onDirectSkillsUpdate(skillsData);
            }
            setCurrentStep(c => c + 1);
            return;
        }

        if (text.trim() && currentStep !== 12 && currentStep !== 14) {
            onExtract(text, currentStep);
        }

        // Step 14 (応募先最適化) の処理
        if (currentStep === 14) {
            if (!text.trim()) {
                // 何も入力せずに完了を押した場合はそのまま終了ステップへ
                setCurrentStep(c => c + 1);
                return;
            }

            const optimizeProfile = async () => {
                setIsOptimizing(true);
                try {
                    const res = await fetch("/api/optimize", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            currentProfile: data.profile,
                            targetJobDescription: text
                        }),
                    });

                    if (!res.ok) throw new Error("Optimization failed");

                    const result = await res.json();
                    if (onOptimizeProfile) {
                        onOptimizeProfile({
                            summary: result.optimizedSummary,
                            pr: result.optimizedPr
                        });
                    }
                } catch (error) {
                    console.error("Optimize Error:", error);
                    alert("最適化処理に失敗しました。");
                } finally {
                    setIsOptimizing(false);
                }
            };
            optimizeProfile();
            // Stepを進めずに処理完了を待つ（または完了アクションとして状態変化）
            return;
        }

        if (currentStep < totalSteps) setCurrentStep(c => c + 1);
    };

    const handlePrev = () => {
        if (currentStep > 1) setCurrentStep(c => c - 1);
    };

    const handleLoop = (yes: boolean) => {
        if (yes) {
            // Step 5に戻り、プロジェクト系の入力をリセット
            // マネジメント等（Step 10,11）は保持させたい場合は消さない
            setInputs(prev => {
                const newInputs = { ...prev };
                [5, 6, 7, 8, 9].forEach(step => delete newInputs[step]);
                return newInputs;
            });
            setCurrentStep(5);
        } else {
            // 次のステップ（資格）へ
            setCurrentStep(13);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        if (file.type !== "application/pdf") {
            alert("PDFファイルを選択してください。"); // とりあえずPDFのみ許容
            return;
        }

        setIsImporting(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/import", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Import failed");

            const importedData: ResumeData = await res.json();

            if (onImportAll) {
                onImportAll(importedData);
            }

            // インポート成功時は、ウィザードを完了状態（あるいは最終ステップ）まで一気に進める
            setCurrentStep(13);

        } catch (error) {
            console.error(error);
            alert("ファイルのインポート・解析に失敗しました。");
        } finally {
            setIsImporting(false);
            // reset file input
            if (e.target) e.target.value = "";
        }
    };

    const handleParseUrl = async () => {
        if (!urlInput.trim()) return;
        setIsParsingUrl(true);
        try {
            const res = await fetch("/api/parse-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: urlInput })
            });
            if (!res.ok) throw new Error("URL parse failed");

            const result = await res.json();
            if (onParseUrl) {
                onParseUrl(result);
            }

            // 成功したら入力欄を空にして、資格・リンク枠（inputs[13]）の末尾にURLを追記しておく
            setInputs(prev => ({
                ...prev,
                13: prev[13] ? `${prev[13]}\n${urlInput}` : urlInput
            }));
            setUrlInput("");

        } catch (error) {
            console.error("Parse URL Error:", error);
            alert("URLの読み込み・解析に失敗しました。");
        } finally {
            setIsParsingUrl(false);
        }
    };

    const handleExportJson = () => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `skillsheet_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string) as ResumeData;
                if (onImportAll) {
                    onImportAll(json);
                    alert("データの復元に成功しました。");
                }
            } catch (error) {
                console.error("JSON parse error:", error);
                alert("ファイルの読み込みに失敗しました。正しいJSONファイルを選択してください。");
            }
        };
        reader.readAsText(file);

        // inputをリセット
        e.target.value = "";
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

                        {/* PDFインポートエリア */}
                        <div className="border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2 hover:bg-blue-50 transition-colors relative">
                            {isImporting ? (
                                <div className="flex flex-col items-center space-y-2 py-2">
                                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-xs font-bold text-blue-700">経歴書をAIが自動解析中...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="p-2 bg-white rounded-full text-blue-500 shadow-sm">
                                        <UploadCloud size={20} />
                                    </div>
                                    <p className="text-xs font-bold text-blue-800">
                                        お手持ちの職務経歴書(PDF)を<br />アップロードして自動入力
                                    </p>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        title="PDFファイルを選択"
                                    />
                                </>
                            )}
                        </div>

                        <div className="flex items-center">
                            <div className="flex-1 border-t border-gray-200"></div>
                            <span className="px-3 text-xs text-gray-400 font-medium">または 手動で入力</span>
                            <div className="flex-1 border-t border-gray-200"></div>
                        </div>

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
                ) : currentStep === 3 ? (
                    // Step 3: スキルチェックボックス一覧UI（カテゴリ別）
                    <div className="flex-1 flex flex-col space-y-6 overflow-y-auto pr-2 pb-4">
                        {Object.entries(skillCategories).map(([category, skills]) => (
                            <div key={category} className="space-y-3">
                                <h3 className="text-sm font-bold text-blue-800 border-b border-blue-100 pb-1 flex items-center">
                                    <span className="w-1.5 h-4 bg-blue-500 rounded-full mr-2"></span>
                                    {category}
                                </h3>
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                                    {skills.map(skill => (
                                        <label key={skill} className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 shadow-sm">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                checked={selectedSkills.includes(skill)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedSkills([...selectedSkills, skill]);
                                                    else setSelectedSkills(selectedSkills.filter(s => s !== skill));
                                                }}
                                            />
                                            <span className="text-xs font-medium text-gray-700 leading-tight">{skill}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div className="flex space-x-3 pt-4 mt-auto">
                            <button
                                onClick={handlePrev}
                                className="w-1/3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl border border-gray-200 transition-colors"
                            >
                                戻る
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={selectedSkills.length === 0}
                                className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span>次へ（年数を入力する）</span>
                            </button>
                        </div>
                    </div>
                ) : currentStep === 4 ? (
                    // Step 4: 選択したスキルの年数入力UI
                    <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-2 pb-4">
                        <p className="text-sm text-gray-500 mb-2">Step 3で選んだ技術・スキルの経験年数を半角数字で入力してください。</p>
                        <div className="flex flex-col space-y-3">
                            {selectedSkills.map(skill => (
                                <div key={skill} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">{skill}</span>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            className="w-20 bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            placeholder="0"
                                            value={skillYears[skill] || ""}
                                            onChange={(e) => setSkillYears(prev => ({ ...prev, [skill]: parseFloat(e.target.value) || 0 }))}
                                        />
                                        <span className="text-sm text-gray-500">年</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex space-x-3 pt-4 mt-auto">
                            <button
                                onClick={handlePrev}
                                className="w-1/3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl border border-gray-200 transition-colors"
                            >
                                戻る
                            </button>
                            <button
                                onClick={handleNext}
                                className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center transition-colors"
                            >
                                <span>次へ進む (即時反映) </span>
                            </button>
                        </div>
                    </div>
                ) : currentStep === 12 ? (
                    // Step 12: 複数プロジェクト分岐用UI
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
                ) : currentStep === 13 ? (
                    // Step 13: 資格・リンク + 外部URLパースUI
                    <div className="flex-1 flex flex-col space-y-4">
                        <div className="space-y-2 bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-2">
                            <label className="text-xs font-bold text-blue-800 flex items-center">
                                <Wand2 size={14} className="mr-1" />
                                外部URLから実績を自動読み込み
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="url"
                                    placeholder="GitHub, Qiita, Zenn などのURL"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    className="flex-1 bg-white border border-blue-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <button
                                    onClick={handleParseUrl}
                                    disabled={!urlInput.trim() || isParsingUrl}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 min-w-[100px]"
                                >
                                    {isParsingUrl ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        "読み込む"
                                    )}
                                </button>
                            </div>
                            <p className="text-[10px] text-blue-600/70">
                                ※URL先のページ内容からAIがスキルや実績を解析し、あなたの経歴情報に自動で合流・追記します。
                            </p>
                        </div>

                        <p className="text-sm font-bold text-gray-700">その他の資格やリンク（手動入力）</p>
                        <textarea
                            className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none leading-relaxed"
                            placeholder={placeholders[13]}
                            value={inputs[13] || ""}
                            onChange={(e) => setInputs(prev => ({ ...prev, 13: e.target.value }))}
                        />

                        <div className="flex space-x-3 pt-2">
                            <button
                                onClick={handlePrev}
                                disabled={isExtracting || isParsingUrl}
                                className="w-1/3 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                戻る
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={isExtracting || isParsingUrl || !(inputs[13] || "").trim()}
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
                                        <span>次へ進む (AI自動反映)</span>
                                    </div>
                                )}
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
                                disabled={isExtracting || isOptimizing || (currentStep !== 14 && !(inputs[currentStep] || "").trim())}
                                className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isExtracting || isOptimizing ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>{isOptimizing ? "最適化しています..." : "構造化しています..."}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <Wand2 size={18} />
                                        <span>{currentStep === totalSteps ? (inputs[14]?.trim() ? "AIで最適化して完了" : "このまま完了する") : "次へ進む (AI自動反映)"}</span>
                                    </div>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* アクションボタン群 */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
                <button
                    onClick={() => window.print()}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl border border-gray-200 flex items-center justify-center space-x-2 transition-colors"
                >
                    <Printer size={18} />
                    <span>PDFで出力・印刷する</span>
                </button>
                <div className="flex space-x-3">
                    <button
                        onClick={handleExportJson}
                        className="flex-1 bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium py-2 px-4 rounded-lg border border-gray-200 flex items-center justify-center space-x-2 transition-colors"
                        title="現在のデータをJSONファイルとしてPCに保存します"
                    >
                        <Download size={16} />
                        <span>JSON保存</span>
                    </button>
                    <div className="flex-1 relative">
                        <input
                            type="file"
                            accept=".json,application/json"
                            onChange={handleImportJson}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            title="保存したJSONファイルを読み込んで復元します"
                        />
                        <button
                            className="w-full bg-white hover:bg-gray-50 text-gray-600 text-sm font-medium py-2 px-4 rounded-lg border border-gray-200 flex items-center justify-center space-x-2 transition-colors pointer-events-none"
                        >
                            <Upload size={16} />
                            <span>JSON読込</span>
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
}
