"use client";

import { useState } from "react";
import confetti from "canvas-confetti";
import Editor from "../components/Editor";
import Preview from "../components/Preview";

// Profile, Skills, Projects のデータ構造
export type SkillNode = { subject: string; A: number; fullMark: number };
export type Project = { id: string; period: string; role: string; tech: string[]; summary: string; achievements: string[] };
export type Profile = { name: string; title: string; summary: string; score: number };

export type ResumeData = {
  profile: Profile;
  skills: SkillNode[];
  projects: Project[];
};

const initialData: ResumeData = {
  profile: {
    name: "山田 太郎",
    title: "フロントエンド / フルスタックエンジニア",
    summary: "React, Next.js を用いたモダンなWebフロントエンド開発を中心に5年の経験があります。BtoB SaaSのダッシュボード構築や、パフォーマンス改善を得意としています。",
    score: 85, // 完成度スコア
  },
  skills: [
    { subject: "Frontend", A: 90, fullMark: 100 },
    { subject: "Backend", A: 70, fullMark: 100 },
    { subject: "Infra/Cloud", A: 60, fullMark: 100 },
    { subject: "CI/CD", A: 80, fullMark: 100 },
    { subject: "Team Lead", A: 75, fullMark: 100 },
  ],
  projects: [
    {
      id: "1",
      period: "2022.04 - 現在",
      role: "テックリード / フロントエンド開発",
      tech: ["React", "Next.js", "TypeScript", "Tailwind CSS"],
      summary: "スタートアップ向けの人事管理SaaS新規開発プロジェクト。",
      achievements: [
        "初期設計からメイン開発を担当し、半年でMVPリリースを達成。",
        "Lighthouseのパフォーマンススコアを平均90点以上に保つアーキテクチャ設計。",
        "Storybookを活用したUIコンポーネント管理により、デザイナーとの連携コストを30%削減。"
      ]
    },
    {
      id: "2",
      period: "2020.01 - 2022.03",
      role: "バックエンドエンジニア",
      tech: ["Node.js", "Express", "PostgreSQL", "AWS"],
      summary: "ECサイトの裏側を支える在庫管理システムのAPI開発。",
      achievements: [
        "決済システムの非同期処理リファクタリングにより、ピーク時のサーバーダウンをゼロに改善。",
        "GitHub Actionsを用いたCI/CDパイプラインの構築。"
      ]
    }
  ]
};

export default function Home() {
  const [data, setData] = useState<ResumeData>(initialData);
  const [isExtracting, setIsExtracting] = useState(false);

  // 生成AI APIを呼び出してテキストを構造化する処理
  const handleExtract = async (text: string) => {
    setIsExtracting(true);

    try {
      // API Route へリクエスト送信
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const result = await response.json();

      if (result.projects && result.projects.length > 0) {
        // 生成されたプロジェクトにランダムなIDを付与
        const extractedProjects = result.projects.map((p: Omit<Project, "id">) => ({
          ...p,
          id: Date.now().toString() + Math.random().toString(36).substring(7)
        }));

        setData(prevData => ({
          ...prevData,
          profile: {
            ...prevData.profile,
            score: Math.min(100, prevData.profile.score + 5),
          },
          projects: [...extractedProjects, ...prevData.projects],
          skills: prevData.skills.map(skill => {
            if (skill.subject === "Backend" || skill.subject === "Frontend") {
              return { ...skill, A: Math.min(100, skill.A + 5) };
            }
            return { ...skill, A: Math.min(100, skill.A + Math.floor(Math.random() * 3)) };
          })
        }));

        // 成功した喜びを演出する紙吹雪エフェクト
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#3b82f6", "#60a5fa", "#93c5fd", "#f59e0b", "#10b981"]
        });
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
