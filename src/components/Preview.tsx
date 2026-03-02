"use client";

import { ResumeData } from "../app/page";
import RadarChartComponent from "./RadarChart";
import { User, Briefcase, Award, GraduationCap, Link2, Star } from "lucide-react";

export default function Preview({ data }: { data: ResumeData }) {
    const isEmpty = !data.profile.name && data.projects.length === 0;
    const theme = data.theme || "modern";

    // Theme configurations
    const themeStyles = {
        modern: {
            container: "font-sans",
            name: "text-slate-900",
            title: "text-slate-600 font-medium",
            headerBorder: "border-slate-800",
            heading: "text-lg font-bold flex items-center space-x-2 text-slate-800 mb-3",
            icon: "text-slate-800",
            subBorder: "border-slate-200",
            projectDot: "bg-slate-800 w-3 h-3 rounded-full -left-[7px] top-1",
            techTag: "bg-blue-50 text-blue-700 border border-blue-100 rounded",
            badgeShape: "rounded-md",
            sectionBorder: "border-slate-200"
        },
        classic: {
            container: "font-serif",
            name: "text-black",
            title: "text-gray-800 font-bold tracking-widest uppercase text-lg",
            headerBorder: "border-black border-b-4",
            heading: "text-lg font-bold flex items-center space-x-2 text-black mb-3 border-b border-black pb-1 uppercase tracking-wider",
            icon: "text-black",
            subBorder: "border-gray-400 border-dashed",
            projectDot: "bg-black w-2.5 h-2.5 rounded-none -left-[5.5px] top-1.5",
            techTag: "bg-white text-black border border-black rounded-none",
            badgeShape: "rounded-none",
            sectionBorder: "border-black"
        },
        creative: {
            container: "font-sans tracking-wide",
            name: "bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 to-indigo-500",
            title: "text-fuchsia-500 font-bold",
            headerBorder: "border-fuchsia-200 border-b-2 border-dashed",
            heading: "text-lg font-bold flex items-center space-x-2 text-indigo-900 mb-3 bg-indigo-50 p-2 rounded-r-xl border-l-4 border-indigo-500",
            icon: "text-indigo-500",
            subBorder: "border-indigo-100",
            projectDot: "bg-fuchsia-500 w-3 h-3 rounded-full ring-4 ring-pink-50 -left-[7px] top-1",
            techTag: "bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full",
            badgeShape: "rounded-full",
            sectionBorder: "border-indigo-200"
        }
    };

    const s = themeStyles[theme];

    return (
        <div className={`w-full min-h-full p-12 flex flex-col space-y-8 text-gray-800 print-exact relative ${s.container}`}>
            {isEmpty ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 space-y-4">
                    <p className="text-xl font-bold tracking-widest">NO DATA</p>
                    <p className="text-sm">左側のエディタに職務経歴を入れて「抽出」してください</p>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className={`border-b-2 pb-5 ${s.headerBorder}`}>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h1 className={`text-4xl font-black mb-2 ${s.name}`}>{data.profile.name}</h1>
                                <p className={`text-xl ${s.title}`}>{data.profile.title}</p>
                            </div>
                            <div className="text-right text-sm text-slate-500">
                                <p>生成日: {new Date().toLocaleDateString('ja-JP')}</p>
                            </div>
                        </div>
                        {/* 拡充された基本情報一覧 */}
                        <div className={`grid grid-cols-2 gap-x-8 gap-y-2 mt-4 pt-4 border-t ${s.subBorder}`}>
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

                            <section className="break-inside-avoid">
                                <h2 className={s.heading}>
                                    <User size={20} className={s.icon} />
                                    <span>Summary</span>
                                </h2>
                                <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                                    {data.profile.summary}
                                </p>
                            </section>

                            {data.profile.pr && (
                                <section className="break-inside-avoid">
                                    <h2 className={s.heading}>
                                        <Star size={20} className={s.icon} />
                                        <span>Self PR</span>
                                    </h2>
                                    <div className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                                        {data.profile.pr}
                                    </div>
                                </section>
                            )}

                            <section className="break-inside-avoid">
                                <h2 className={s.heading}>
                                    <Award size={20} className={s.icon} />
                                    <span>Skill Balance</span>
                                </h2>
                                <div className="bg-slate-50 rounded-xl p-2 h-48 w-full flex items-center justify-center">
                                    <RadarChartComponent skills={data.skills} />
                                </div>
                                {/* スキル詳細タグ */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {data.skills.map(skillData => {
                                        let level = "初級";
                                        let color = "";

                                        if (theme === "classic") {
                                            if (skillData.A >= 75) { level = "上級"; color = "bg-black text-white font-bold border border-black"; }
                                            else if (skillData.A >= 50) { level = "中級"; color = "bg-gray-200 text-black border border-black font-bold"; }
                                            else { color = "bg-white text-black border border-black"; }
                                        } else if (theme === "creative") {
                                            if (skillData.A >= 75) { level = "上級"; color = "bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white font-bold shadow-sm border-none"; }
                                            else if (skillData.A >= 50) { level = "中級"; color = "bg-indigo-100 text-indigo-700 border border-indigo-200"; }
                                            else { color = "bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100"; }
                                        } else {
                                            if (skillData.A >= 75) { level = "上級"; color = "bg-blue-100 text-blue-700 font-bold border border-blue-200"; }
                                            else if (skillData.A >= 50) { level = "中級"; color = "bg-green-50 text-green-700 border border-green-200"; }
                                            else { color = "bg-gray-50 text-gray-600 border border-gray-200"; }
                                        }

                                        return (
                                            <span key={skillData.subject} className={`px-2 py-1 text-xs ${s.badgeShape} ${color} flex items-center space-x-1`}>
                                                <span>{skillData.subject}</span>
                                                <span className="opacity-70 text-[10px]">({level})</span>
                                            </span>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* 資格や付加情報 */}
                            {data.profile.certifications && data.profile.certifications.length > 0 && (
                                <section>
                                    <h2 className={s.heading}>
                                        <GraduationCap size={20} className={s.icon} />
                                        <span>Certifications</span>
                                    </h2>
                                    <ul className="list-disc ml-4 space-y-1 text-sm text-slate-600">
                                        {data.profile.certifications.map((cert, i) => (
                                            <li key={i}>{cert}</li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {/* リンク情報 */}
                            {data.profile.links && data.profile.links.length > 0 && (
                                <section>
                                    <h2 className={s.heading}>
                                        <Link2 size={20} className={s.icon} />
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
                                <h2 className={`text-xl font-bold flex items-center space-x-2 text-slate-800 mb-4 pb-2 border-b ${s.sectionBorder}`}>
                                    <Briefcase size={22} className={s.icon} />
                                    <span>Work Experience</span>
                                </h2>

                                <div className="space-y-8">
                                    {data.projects.map((project) => (
                                        <div key={project.id} className={`relative pl-4 border-l-2 ${s.subBorder} pb-2 break-inside-avoid`}>
                                            <div className={`absolute ${s.projectDot}`}></div>

                                            <div className="mb-1 text-sm text-slate-500 font-medium uppercase tracking-wider">
                                                {project.period}
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">
                                                {project.role}
                                            </h3>

                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {project.tech.map(t => (
                                                    <span key={t} className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${s.techTag}`}>
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>

                                            <p className="text-sm text-slate-700 mb-3 leading-relaxed whitespace-pre-wrap break-words">
                                                {project.summary}
                                            </p>

                                            <ul className="list-disc ml-5 space-y-1.5 text-sm text-slate-600">
                                                {project.achievements.map((item, i) => (
                                                    <li key={i} className="leading-relaxed pl-1">{item}</li>
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
