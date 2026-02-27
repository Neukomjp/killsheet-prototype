"use client";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { SkillNode } from "../app/page";

export default function RadarChartComponent({ skills }: { skills: SkillNode[] }) {
    // If there's no window object (SSR), we can return a placeholder or we can just let ResponsiveContainer handle it.

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skills}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Skills"
                        dataKey="A"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.4}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
