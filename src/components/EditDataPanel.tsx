"use client";

import React, { useState, useEffect } from "react";
import { ResumeData, SkillNode, Project } from "../app/page";
import { Save } from "lucide-react";

interface EditDataPanelProps {
    data: ResumeData;
    onUpdate: (newData: ResumeData) => void;
}

export default function EditDataPanel({ data, onUpdate }: EditDataPanelProps) {
    // ローカルステートとして編集中のデータを保持
    const [editData, setEditData] = useState<ResumeData>(data);

    // 親からデータが降ってくるたびにローカルステートを同期するかは要検討だが、
    // 基本的に手動編集モードに入った際のデータを初期値とする
    useEffect(() => {
        setEditData(data);
    }, [data]);

    const handleChangeProfile = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            profile: { ...prev.profile, [name]: value }
        }));
    };

    const handleUpdateSkill = (index: number, field: keyof SkillNode, value: string | number) => {
        const newSkills = [...editData.skills];
        newSkills[index] = { ...newSkills[index], [field]: value };
        setEditData({ ...editData, skills: newSkills });
    };

    const handleUpdateProject = (index: number, field: keyof Project, value: string) => {
        const newProjects = [...editData.projects];
        newProjects[index] = { ...newProjects[index], [field]: value };
        setEditData({ ...editData, projects: newProjects });
    };

    const handleSave = () => {
        onUpdate(editData);
        alert("手動編集の内容を反映しました。プレビュータブで確認してください。");
    };

    return (
        <div className="w-full max-w-4xl max-h-full overflow-y-auto bg-white border border-gray-200 shadow-sm rounded-xl p-6 m-4 flex flex-col space-y-8 relative">
            <div className="flex items-center justify-between border-b pb-4 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <span className="mr-2">✏️</span> 手動編集モード
                </h2>
                <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-sm"
                >
                    <Save size={18} />
                    <span>変更をプレビューに反映</span>
                </button>
            </div>

            <p className="text-sm text-gray-500">
                AIが生成した構造化データを手動で修正できます。テキストを書き換えた後、右上の「変更をプレビューに反映」ボタンを押すと実際のレイアウトに適用されます。
            </p>

            {/* Profile Section */}
            <section className="space-y-4">
                <h3 className="font-bold text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-200">基本情報・職務要約・自己PR</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">氏名</label>
                        <input
                            type="text"
                            name="name"
                            value={editData.profile.name}
                            onChange={handleChangeProfile}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">職種</label>
                        <input
                            type="text"
                            name="title"
                            value={editData.profile.title}
                            onChange={handleChangeProfile}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">職務要約 (Summary)</label>
                    <textarea
                        name="summary"
                        value={editData.profile.summary}
                        onChange={handleChangeProfile}
                        rows={5}
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">自己PR・得意領域 (PR)</label>
                    <textarea
                        name="pr"
                        value={editData.profile.pr}
                        onChange={handleChangeProfile}
                        rows={6}
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                    />
                </div>
            </section>

            {/* Skills Section */}
            <section className="space-y-4">
                <h3 className="font-bold text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-200">スキルとスコア</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {editData.skills.length === 0 && <p className="text-gray-400 text-sm">スキルデータがありません</p>}
                    {editData.skills.map((skill, idx) => (
                        <div key={idx} className="flex items-center space-x-2 border border-gray-200 p-2 rounded">
                            <input
                                type="text"
                                value={skill.subject}
                                onChange={(e) => handleUpdateSkill(idx, "subject", e.target.value)}
                                className="flex-1 p-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded text-sm outline-none"
                                placeholder="スキル名"
                            />
                            <input
                                type="number"
                                value={skill.A}
                                onChange={(e) => handleUpdateSkill(idx, "A", Number(e.target.value))}
                                min="0"
                                max="100"
                                className="w-16 p-1 border border-gray-300 rounded text-sm text-right outline-none focus:ring-2 focus:ring-blue-500"
                                title="スコア (0-100)"
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* Projects Section */}
            <section className="space-y-4">
                <h3 className="font-bold text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-200">職務経歴 (Projects)</h3>
                {editData.projects.length === 0 && <p className="text-gray-400 text-sm">プロジェクトデータがありません</p>}
                {editData.projects.map((project, idx) => (
                    <div key={project.id || idx} className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50/50">
                        <div className="flex space-x-3">
                            <div className="w-1/3 space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">期間</label>
                                <input
                                    type="text"
                                    value={project.period}
                                    onChange={(e) => handleUpdateProject(idx, "period", e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="2022/04 - 現在"
                                />
                            </div>
                            <div className="w-2/3 space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">役割・ポジション</label>
                                <input
                                    type="text"
                                    value={project.role}
                                    onChange={(e) => handleUpdateProject(idx, "role", e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="プロジェクトリーダー"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">プロジェクト概要・担当業務</label>
                            <textarea
                                value={project.summary}
                                onChange={(e) => handleUpdateProject(idx, "summary", e.target.value)}
                                rows={3}
                                className="w-full p-2 border border-gray-300 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500 resize-y"
                            />
                        </div>
                    </div>
                ))}
            </section>

            {/* Bottom Padding */}
            <div className="h-8"></div>
        </div>
    );
}
