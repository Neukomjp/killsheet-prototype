import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";

const InterviewPrompt = `
あなたはプロのITエンジニア専門キャリアアドバイザー・面接官です。
ユーザーから提供された「職務経歴書データ（スキル、プロジェクト経験、自己PRなど）」を熟読し、実際の【技術面接・最終面接】で面接官が聞いてきそうな「想定質問」と、それに対する「回答のポイント（アドバイス）」を抽出してください。

以下の観点から、バランスよく3〜5つの質問を生成してください。
1. 深掘り質問：アピールしているプロジェクトの「困難だった点」や「技術選定の理由」など、実務能力を測るもの。
2. 弱点・懸念点への質問：経験年数が浅いスキルや、書類上見えにくいマネジメント経験など、面接官が懸念しそうなポイントを突くもの。
3. キャリア志向・スタンスの質問：「今後のキャリアプラン」や「チームでの働き方」など、人物面・志向性を測るもの。

【要件】
- 質問（question）は、面接官の口調で具体的に作成すること。
- 回答アドバイス（advice）は、「どういったエピソードを交えて話すと評価が上がるか」「どの強みをアピールすべきか」を指南すること。
`;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { currentProfile, skills, projects } = body;

        const { object } = await generateObject({
            model: openai("gpt-4o"),
            schema: z.object({
                qnAs: z.array(
                    z.object({
                        question: z.string().describe("面接官からの想定質問（具体的に）"),
                        advice: z.string().describe("回答のポイント・アドバイス（どのように答えると評価が上がるか）")
                    })
                ).describe("3〜5件の想定質問と回答アドバイスのリスト")
            }),
            prompt: `${InterviewPrompt}\n\n【提供された経歴データ】\nプロフィール: ${JSON.stringify(currentProfile)}\nスキル: ${JSON.stringify(skills)}\nプロジェクト: ${JSON.stringify(projects)}`,
        });

        return NextResponse.json(object);
    } catch (error) {
        console.error("Interview API Error:", error);
        return NextResponse.json({ error: "Failed to generate interview questions" }, { status: 500 });
    }
}
