"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import Editor from "../components/Editor";
import Preview from "../components/Preview";

// Profile, Skills, Projects のデータ構造
export type SkillNode = { subject: string; A: number; fullMark: number };
export type Project = { id: string; period: string; role: string; tech: string[]; summary: string; achievements: string[] };
export type Profile = {
  name: string;
  title: string;
  summary: string;
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
};

const initialData: ResumeData = {
  profile: {
    name: "",
    title: "",
    summary: "",
    score: 0,
    certifications: [],
    links: [],
    age: "",
    address: "",
    education: "",
    experienceYears: "",
  },
  skills: [],
  projects: []
};

export default function Home() {
  const [data, setData] = useState<ResumeData>(initialData);
  const [isExtracting, setIsExtracting] = useState(false);

  // 生成AI APIを呼び出してテキストを構造化する処理
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
          if (step === 10 && result.profile?.achievements) {
            // マネジメント系の実績を要約テキストに追記（プレビュー側で表示させるための一時措置）
            const mgmtText = result.profile.achievements.map((a: string) => `・${a}`).join('\n');
            updatedSummary = updatedSummary ? `${updatedSummary}\n\n【マネジメント・リーダー経験】\n${mgmtText}` : `【マネジメント・リーダー経験】\n${mgmtText}`;
          } else if (step === 11 && result.profile?.achievements) {
            // ビジネス貢献系の実績を要約テキストに追記
            const bizText = result.profile.achievements.map((a: string) => `・${a}`).join('\n');
            updatedSummary = updatedSummary ? `${updatedSummary}\n\n【ビジネス・チームへの貢献】\n${bizText}` : `【ビジネス・チームへの貢献】\n${bizText}`;
          } else if (result.profile?.summary && step !== 10 && step !== 11) {
            // 通常の職務要約（Step 2など）の場合
            updatedSummary = result.profile.summary;
          }

          return {
            profile: {
              name: result.profile?.name || prevData.profile.name,
              title: result.profile?.title || prevData.profile.title,
              summary: updatedSummary,
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

  return (
    <main className="flex h-screen bg-gray-100 overflow-hidden text-slate-800">
      {/* 左側：エディタ領域 */}
      <div className="w-1/3 min-w-[400px] h-full overflow-y-auto bg-white border-r border-gray-200 shadow-sm z-10 print:hidden">
        <Editor
          data={data}
          isExtracting={isExtracting}
          onExtract={handleExtract}
          onDirectUpdate={handleDirectUpdate}
          onDirectSkillsUpdate={handleDirectSkillsUpdate}
        />
      </div>

      {/* 右側：プレビュー領域 */}
      <div className="flex-1 h-full overflow-y-auto bg-gray-100 p-8 flex justify-center print:p-0 print:bg-white">
        <div id="preview-area" className="w-[210mm] min-h-[297mm] bg-white shadow-xl max-w-full print:shadow-none print:w-[210mm] print:h-[297mm]">
          <Preview data={data} />
        </div>
      </div>
    </main>
  );
}
