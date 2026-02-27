"use client";

import { useState } from "react";
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

  // モックの抽出機能処理
  const handleExtract = (text: string) => {
    setIsExtracting(true);
    // AIの抽出をシミュレーションするためのタイマー
    setTimeout(() => {
      // ランダムで点数を変えたり、テキストを適当に反映させるモック
      setData({
        ...data,
        profile: {
          ...data.profile,
          score: Math.min(100, data.profile.score + 5),
        },
        // 本来は抽出したテキストから構造化データを作るが、今回はUIの体験確認なのでモックデータ追加
        projects: [
          {
            id: Date.now().toString(),
            period: "新規抽出",
            role: "抽出された役割",
            tech: ["New Tech", "AI"],
            summary: "AIのモックAPIから即座に抽出されたプロジェクト履歴です。",
            achievements: ["定性的な入力を定量的な成果に自動変換しました。"]
          },
          ...data.projects
        ]
      });
      setIsExtracting(false);
    }, 1500);
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
