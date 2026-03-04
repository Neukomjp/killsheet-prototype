"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "../components/AuthModal";
import Editor from "../components/Editor";
import Preview from "../components/Preview";
import InterviewPanel from "../components/InterviewPanel";
import EditDataPanel from "../components/EditDataPanel";

export type InterviewQnA = {
  id: string;
  question: string;
  answer: string;
  aiFeedback?: string;
};

// Profile, Skills, Projects のデータ構造
export type SkillNode = { subject: string; A: number; fullMark: number; years?: number };
export type Project = { id: string; period: string; role: string; tech: string[]; summary: string; achievements: string[] };
export type Profile = {
  name: string;
  title: string;
  summary: string;
  pr: string; // 自己PR（マネジメント・ビジネス貢献等）
  score: number;
  certifications: string[]; // 資格
  links: string[]; // ポートフォリオリンク
  age: string; // 星座/年齢/生年月日
  address: string; // 住所
  education: string; // 最終学歴
  experienceYears: string; // 職務経験年数
};

export type ResumeData = {
  profile: Profile;
  skills: SkillNode[];
  projects: Project[];
  interviewQnAs: InterviewQnA[];
  theme?: "modern" | "classic" | "creative";
};

const initialData: ResumeData = {
  profile: {
    name: "",
    title: "",
    summary: "",
    pr: "",
    score: 0,
    certifications: [],
    links: [],
    age: "",
    address: "",
    education: "",
    experienceYears: "",
  },
  skills: [],
  projects: [],
  interviewQnAs: [],
  theme: "modern",
};

export default function Home() {
  const [data, setData] = useState<ResumeData>(initialData);
  const [isExtracting, setIsExtracting] = useState(false); // 編集モードや面接対策の切り替え用ステート
  const [activeTab, setActiveTab] = useState<"preview" | "edit" | "interview">("preview");

  // スマホ(モバイル)時のビュー切り替え用ステート
  const [mobileView, setMobileView] = useState<"editor" | "preview">("editor");

  // 認証関連
  const { user, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // OpenAI等を用いたAI抽出機能（モック動作から実際の処理へ）
  const handleExtract = async (text: string, step: number) => {
    setIsExtracting(true);

    try {
      // API Route へリクエスト送信
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, step })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const result = await response.json();

      if (result.projects || result.profile || result.skills) {
        setData(prevData => {
          let updatedProjects = [...prevData.projects];

          // ----- プロジェクト情報（Step 5〜9）のマージロジック -----
          if (result.projects && result.projects.length > 0) {
            const extractedItem = result.projects[0];

            if (step === 5) {
              // Step 5: 新しいプロジェクトを追加（概要のみ）
              updatedProjects = [
                {
                  id: Date.now().toString() + Math.random().toString(36).substring(7),
                  period: "",
                  role: "",
                  summary: extractedItem.summary || "",
                  tech: [],
                  achievements: [],
                },
                ...updatedProjects
              ];
            } else if (step >= 6 && step <= 9) {
              // Step 6〜9: 直前に作られた配列の先頭のプロジェクトを更新
              if (updatedProjects.length > 0) {
                updatedProjects[0] = {
                  ...updatedProjects[0],
                  period: step === 6 && extractedItem.period ? extractedItem.period : updatedProjects[0].period,
                  role: step === 6 && extractedItem.role ? extractedItem.role : updatedProjects[0].role,
                  tech: step === 7 ? extractedItem.tech || [] : updatedProjects[0].tech,
                  summary: step === 8 && extractedItem.summary ? `${updatedProjects[0].summary} \n[担当工程] ${extractedItem.summary}` : updatedProjects[0].summary,
                  achievements: step === 9 ? extractedItem.achievements || [] : updatedProjects[0].achievements,
                };
              }
            }
          }

          // ----- プロフィール情報（Step 10, 11等）のマージロジック -----
          let updatedSummary = prevData.profile.summary;
          let updatedPr = prevData.profile.pr;

          if (step === 10 && result.profile?.achievements) {
            // マネジメント系の実績を自己PRテキストに追記
            const mgmtText = result.profile.achievements.map((a: string) => `・${a}`).join('\n');
            updatedPr = updatedPr ? `${updatedPr}\n\n【マネジメント・リーダー経験】\n${mgmtText}` : `【マネジメント・リーダー経験】\n${mgmtText}`;
          } else if (step === 11 && result.profile?.achievements) {
            // ビジネス貢献系の実績を自己PRテキストに追記
            const bizText = result.profile.achievements.map((a: string) => `・${a}`).join('\n');
            updatedPr = updatedPr ? `${updatedPr}\n\n【ビジネス・チームへの貢献】\n${bizText}` : `【ビジネス・チームへの貢献】\n${bizText}`;
          } else if (result.profile?.summary && step !== 10 && step !== 11) {
            // 通常の職務要約（Step 2など）の場合
            updatedSummary = result.profile.summary;
          }

          return {
            profile: {
              name: result.profile?.name || prevData.profile.name,
              title: result.profile?.title || prevData.profile.title,
              summary: updatedSummary,
              pr: updatedPr,
              score: Math.min(100, prevData.profile.score + 25),
              certifications: result.profile?.certifications || prevData.profile.certifications,
              links: result.profile?.links || prevData.profile.links,
              age: result.profile?.age || prevData.profile.age,
              address: result.profile?.address || prevData.profile.address,
              education: result.profile?.education || prevData.profile.education,
              experienceYears: result.profile?.experienceYears || prevData.profile.experienceYears,
            },
            // SkillsはStep4完了時(または既存データ)からのみ更新されるため、ここでは上書きしない
            skills: prevData.skills,
            projects: updatedProjects,
            interviewQnAs: prevData.interviewQnAs,
            theme: prevData.theme,
          };
        });

        // 成功した喜びを演出する紙吹雪エフェクト (最終ステップ)
        if (step === 13) {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#3b82f6", "#60a5fa", "#93c5fd", "#f59e0b", "#10b981"]
          });
        }
      }
    } catch (error) {
      console.error("抽出エラー:", error);
      alert("テキストの抽出に失敗しました。\n・.env.local ファイルに OPENAI_API_KEY が設定されているか\n・ターミナルでサーバーを再起動したか\nを確認してください。");
    } finally {
      setIsExtracting(false);
    }
  };

  // Step 1 用のダイレクト更新処理（APIを経由しない即時反映）
  const handleDirectUpdate = (profileData: Partial<Profile>) => {
    setData(prevData => ({
      ...prevData,
      profile: {
        ...prevData.profile,
        ...profileData
      }
    }));
  };

  // Step 4 用のダイレクト更新処理（スキルの即時反映）
  const handleDirectSkillsUpdate = (skillsData: { subject: string; score: number }[]) => {
    setData(prevData => ({
      ...prevData,
      skills: skillsData.map(s => ({
        subject: s.subject,
        A: s.score,
        fullMark: 100
      }))
    }));
  };

  // PDFファイル一括インポート用処理（APIからのJSON構造をそのままステートへ流し込む）
  const handleImportAll = (importedData: ResumeData) => {
    setData(importedData);

    // インポート成功の喜びを演出する紙吹雪エフェクト
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#3b82f6", "#60a5fa", "#93c5fd", "#f59e0b", "#10b981", "#8b5cf6"]
    });
  };

  const handleThemeChange = (theme: "modern" | "classic" | "creative") => {
    setData(prev => ({ ...prev, theme }));
  };

  // Step 14 用の最適化テキスト更新処理
  const handleOptimizeProfile = (optimizedData: { summary: string; pr: string }) => {
    setData(prevData => ({
      ...prevData,
      profile: {
        ...prevData.profile,
        summary: optimizedData.summary,
        pr: optimizedData.pr
      }
    }));

    // ターゲット最適化成功の喜びを演出する紙吹雪エフェクト
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ef4444", "#f97316", "#eab308"] // 情熱的な暖色系
    });
  };

  // URLパース（Step 13）結果の反映処理（既存データへのマージ）
  const handleParseUrl = (parsedData: { skills: string[]; prText: string; originUrl: string }) => {
    setData(prevData => {
      // 既存のスキル名の配列を取得
      const existingSkillNames = prevData.skills.map(s => s.subject.toLowerCase());

      // AIが抽出した新しいスキルを追加（重複排除）
      const newSkills = parsedData.skills
        .filter(skill => !existingSkillNames.includes(skill.toLowerCase()))
        .map(skill => ({
          subject: skill,
          A: 60, // 外部判定起因のスキルはとりあえず60点とする
          fullMark: 100
        }));

      // 自己PR文への追記
      const currentPr = prevData.profile.pr || "";
      let newPr = currentPr;
      if (parsedData.prText) {
        newPr = currentPr
          ? `${currentPr}\n\n【外部実績 (${new URL(parsedData.originUrl).hostname})】\n${parsedData.prText}`
          : `【外部実績 (${new URL(parsedData.originUrl).hostname})】\n${parsedData.prText}`;
      }

      return {
        ...prevData,
        profile: {
          ...prevData.profile,
          pr: newPr
        },
        // 新規スキルを末尾に追加（重複を防止＋全件表示）
        skills: [...prevData.skills, ...newSkills],
      };
    });

    // 抽出成功の紙吹雪エフェクト（緑・青系）
    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#10b981", "#3b82f6", "#0ea5e9"]
    });
  };

  // 面接対策（InterviewQnA）の更新処理
  const handleUpdateInterviewData = (qnAs: InterviewQnA[]) => {
    setData(prevData => ({
      ...prevData,
      interviewQnAs: qnAs
    }));
  };

  return (
    <main className="flex flex-col md:flex-row h-screen print:h-auto bg-gray-100 overflow-hidden print:overflow-visible text-slate-800 print:block">
      {/* 左側：エディタ領域 */}
      <div className={`w-full md:w-1/3 min-w-0 md:min-w-[400px] h-full overflow-y-auto bg-white md:border-r border-gray-200 shadow-sm z-10 print:hidden ${mobileView === 'preview' ? 'hidden md:block' : 'block'}`}>
        <Editor
          data={data}
          isExtracting={isExtracting}
          onExtract={handleExtract}
          onDirectUpdate={handleDirectUpdate}
          onDirectSkillsUpdate={handleDirectSkillsUpdate}
          onImportAll={handleImportAll}
          onOptimizeProfile={handleOptimizeProfile}
          onParseUrl={handleParseUrl}
          onThemeChange={handleThemeChange}
        />
      </div>

      {/* 右側：プレビュー領域 */}
      <div className={`flex-1 w-full h-full print:h-auto flex-col overflow-hidden print:overflow-visible bg-gray-100 print:bg-white print:block pb-14 md:pb-0 ${mobileView === 'editor' ? 'hidden md:flex' : 'flex'}`}>

        {/* タブナビゲーション */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-8 pt-4 flex space-x-4 md:space-x-6 shrink-0 print:hidden shadow-sm z-10 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab("preview")}
            className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "preview" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            📄 経歴書プレビュー
          </button>
          <button
            onClick={() => setActiveTab("edit")}
            className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "edit" ? "border-green-600 text-green-700" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            ✏️ 手動編集
          </button>
          <button
            onClick={() => setActiveTab("interview")}
            className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "interview" ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            🎤 AI面接対策
          </button>

          {/* ヘッダー右側：ログイン領域 */}
          <div className="ml-auto flex items-center pb-3 pr-2 shrink-0">
            {user ? (
              <div className="flex items-center space-x-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                <span className="text-xs font-medium text-gray-700 truncate max-w-[120px]">
                  {user.email || 'ログイン済み'}
                </span>
                <div className="h-4 w-px bg-gray-300"></div>
                <button
                  onClick={signOut}
                  className="text-xs text-red-600 hover:text-red-700 font-bold transition-colors"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-1.5 px-4 rounded-full transition-colors flex items-center shadow-sm"
              >
                ログイン / 保存
              </button>
            )}
          </div>
        </div>

        {/* プレビュービューア部分 */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden print:overflow-visible p-4 md:p-8 flex justify-center items-start print:p-0 print:block">
          {activeTab === "preview" ? (
            <div className="mobile-preview-scaler mx-auto origin-top transition-transform">
              <div id="preview-area" className="w-[210mm] min-h-[297mm] bg-white shadow-xl print:shadow-none print:w-full print:min-h-0 print:h-auto">
                <Preview data={data} />
              </div>
            </div>
          ) : activeTab === "edit" ? (
            <div className="w-full max-w-4xl pt-4">
              <EditDataPanel
                data={data}
                onUpdate={(newData) => setData(newData)}
              />
            </div>
          ) : (
            <div className="w-full max-w-4xl pt-4">
              <InterviewPanel
                data={data}
                onUpdateInterviewData={handleUpdateInterviewData}
              />
            </div>
          )}
        </div>
      </div>

      {/* モバイル専用：ボトムナビゲーション */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
        <button
          onClick={() => setMobileView("editor")}
          className={`flex-1 py-3 text-sm font-bold flex justify-center items-center transition-colors ${mobileView === "editor" ? "text-blue-600 border-t-2 border-blue-600 bg-blue-50" : "text-gray-500 hover:bg-gray-50"}`}
        >
          ✍️ 入力・編集
        </button>
        <button
          onClick={() => setMobileView("preview")}
          className={`flex-1 py-3 text-sm font-bold flex justify-center items-center transition-colors ${mobileView === "preview" ? "text-blue-600 border-t-2 border-blue-600 bg-blue-50" : "text-gray-500 hover:bg-gray-50"}`}
        >
          📄 プレビュー
        </button>
      </div>

      {/* 認証モーダル */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </main>
  );
}
