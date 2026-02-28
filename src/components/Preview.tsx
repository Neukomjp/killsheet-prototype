"use client";

import { ResumeData } from "../app/page";
import RadarChartComponent from "./RadarChart";
import { User, Briefcase, Award, GraduationCap, Link2, Star } from "lucide-react";

export default function Preview({ data }: { data: ResumeData }) {
    const isEmpty = !data.profile.name && data.projects.length === 0;

    return (
        <div className="w-full h-full p-12 flex flex-col space-y-8 text-gray-800 print-exact relative">
            {isEmpty ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 space-y-4">
                    <p className="text-xl font-bold tracking-widest">NO DATA</p>
                    <p className="text-sm">左側のエディタに職務経歴を入れて「抽出」してください</p>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="border-b-2 border-slate-800 pb-5">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 mb-2">{data.profile.name}</h1>
                                <p className="text-xl text-slate-600 font-medium">{data.profile.title}</p>
                            </div>
                            <div className="text-right text-sm text-slate-500">
                                <p>生成日: {new Date().toLocaleDateString('ja-JP')}</p>
                            </div>
                        </div>
                        {/* 拡充された基本情報一覧 */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 pt-4 border-t border-slate-200">
                            {data.profile.age && (
                                <div className="flex text-sm"><span className="w-28 font-bold text-slate-700">生年月日/年齢</span><span className="text-slate-600">{data.profile.age}</span></div>
                            )}
                            {data.profile.address && (
                                <div className="flex text-sm"><span className="w-28 font-bold text-slate-700">所在地</span><span className="text-slate-600">{data.profile.address}</span></div>
                            )}
                            {data.profile.education && (
                                <div className="flex text-sm"><span className="w-28 font-bold text-slate-700">最終学歴</span><span className="text-slate-600">{data.profile.education}</span></div>
                            )}
                            {data.profile.experienceYears && (
                                <div className="flex text-sm"><span className="w-28 font-bold text-slate-700">経験年数</span><span className="text-slate-600">{data.profile.experienceYears}</span></div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-8 pt-2">

                        {/* Left Column (Radar & Profile) */}
                        <div className="col-span-1 space-y-8">

                            <section>
                                <h2 className="text-lg font-bold flex items-center space-x-2 text-slate-800 mb-3">
                                    <User size={20} />
                                    <span>Summary</span>
                                </h2>
                                <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                                    {data.profile.summary}
                                </p>
                            </section>

                            {data.profile.pr && (
                                <section>
                                    <h2 className="text-lg font-bold flex items-center space-x-2 text-slate-800 mb-3">
                                        <Star size={20} />
                                        <span>Self PR</span>
                                    </h2>
                                    <div className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                                        {data.profile.pr}
                                    </div>
                                </section>
                            )}

                            <section>
                                <h2 className="text-lg font-bold flex items-center space-x-2 text-slate-800 mb-3">
                                    <Award size={20} />
                                    <span>Skill Balance</span>
                                </h2>
                                <div className="bg-slate-50 rounded-xl p-2 h-48 w-full flex items-center justify-center">
                                    <RadarChartComponent skills={data.skills} />
                                </div>
                                {/* スキル詳細タグ */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {data.skills.map(s => {
                                        let level = "初級";
                                        let color = "bg-slate-100 text-slate-600";
                                        if (s.A >= 75) { level = "上級"; color = "bg-blue-100 text-blue-700 font-bold border border-blue-200"; }
                                        else if (s.A >= 50) { level = "中級"; color = "bg-green-50 text-green-700 border border-green-200"; }
                                        else { color = "bg-gray-50 text-gray-600 border border-gray-200"; }

                                        return (
                                            <span key={s.subject} className={`px-2 py-1 text-xs rounded-md ${color} flex items-center space-x-1`}>
                                                <span>{s.subject}</span>
                                                <span className="opacity-70 text-[10px]">({level})</span>
                                            </span>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* 資格や付加情報 */}
                            {data.profile.certifications && data.profile.certifications.length > 0 && (
                                <section>
                                    <h2 className="text-lg font-bold flex items-center space-x-2 text-slate-800 mb-3">
                                        <GraduationCap size={20} />
                                        <span>Certifications</span>
                                    </h2>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                                        {data.profile.certifications.map((cert, i) => (
                                            <li key={i}>{cert}</li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {/* リンク情報 */}
                            {data.profile.links && data.profile.links.length > 0 && (
                                <section>
                                    <h2 className="text-lg font-bold flex items-center space-x-2 text-slate-800 mb-3">
                                        <Link2 size={20} />
                                        <span>Links</span>
                                    </h2>
                                    <ul className="space-y-2 text-sm text-blue-600 break-all">
                                        {data.profile.links.map((link, i) => (
                                            <li key={i}>
                                                <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    {link}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </div>

                        {/* Right Column (Projects) */}
                        <div className="col-span-2 space-y-6">
                            <section>
                                <h2 className="text-xl font-bold flex items-center space-x-2 text-slate-800 mb-4 pb-2 border-b border-slate-200">
                                    <Briefcase size={22} />
                                    <span>Work Experience</span>
                                </h2>

                                <div className="space-y-8">
                                    {data.projects.map((project) => (
                                        <div key={project.id} className="relative pl-4 border-l-2 border-slate-200 pb-2">
                                            <div className="absolute w-3 h-3 bg-slate-800 rounded-full -left-[7px] top-1"></div>

                                            <div className="mb-1 text-sm text-slate-500 font-medium uppercase tracking-wider">
                                                {project.period}
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">
                                                {project.role}
                                            </h3>

                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {project.tech.map(t => (
                                                    <span key={t} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] rounded font-bold uppercase tracking-wider">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>

                                            <p className="text-sm text-slate-700 mb-3 leading-relaxed">
                                                {project.summary}
                                            </p>

                                            <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                                                {project.achievements.map((item, i) => (
                                                    <li key={i} className="leading-snug">{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}
