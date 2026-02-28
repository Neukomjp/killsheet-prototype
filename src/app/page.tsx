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
  certifications: string[]; // 追加：資格
  links: string[]; // 追加：ポートフォリオリンク
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

          // ----- プロジェクト情報（Step 4, 5, 6）のマージロジック -----
          if (result.projects && result.projects.length > 0) {
            const extractedItem = result.projects[0];

            if (step === 4) {
              // Step 4: 新しいプロジェクトを追加
              updatedProjects = [
                {
                  id: Date.now().toString() + Math.random().toString(36).substring(7),
                  period: extractedItem.period || "",
                  role: extractedItem.role || "",
                  summary: extractedItem.summary || "",
                  tech: [],
                  achievements: [],
                },
                ...updatedProjects
              ];
            } else if (step === 5 || step === 6) {
              // Step 5, 6: 直前に作られた配列の先頭のプロジェクトを更新
              if (updatedProjects.length > 0) {
                updatedProjects[0] = {
                  ...updatedProjects[0],
                  tech: step === 5 ? extractedItem.tech || [] : updatedProjects[0].tech,
                  summary: step === 5 && extractedItem.summary ? extractedItem.summary : updatedProjects[0].summary,
                  achievements: step === 6 ? extractedItem.achievements || [] : updatedProjects[0].achievements,
                };
              }
            }
          }

          return {
            profile: {
              name: result.profile?.name || prevData.profile.name,
              title: result.profile?.title || prevData.profile.title,
              summary: result.profile?.summary || prevData.profile.summary,
              score: Math.min(100, prevData.profile.score + 25),
              certifications: result.profile?.certifications || prevData.profile.certifications,
              links: result.profile?.links || prevData.profile.links,
            },
            skills: result.skills && result.skills.length > 0
              ? result.skills.map((s: { subject: string; score: number }) => ({ subject: s.subject, A: s.score, fullMark: 100 }))
              : prevData.skills,
            projects: updatedProjects,
          };
        });

        // 成功した喜びを演出する紙吹雪エフェクト (最終ステップ)
        if (step === 7) {
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

  return (
    <main className="flex h-screen bg-gray-100 overflow-hidden text-slate-800">
      {/* 左側：エディタ領域 */}
      <div className="w-1/3 min-w-[400px] h-full overflow-y-auto bg-white border-r border-gray-200 shadow-sm z-10 print:hidden">
        <Editor
          data={data}
          isExtracting={isExtracting}
          onExtract={handleExtract}
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
