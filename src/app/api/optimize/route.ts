import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function POST(req: Request) {
    try {
        const { currentProfile, targetJobDescription } = await req.json();

        if (!currentProfile || !targetJobDescription) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // GPT-4o-mini を用いて職務要約と自己PRをターゲット企業向けに最適化
        const schemaConfig = z.object({
            optimizedSummary: z.string().describe("求人要件に合わせて再構成された、強力で魅力的な職務要約（300〜500字程度）。自身の持つ経験の中から、求人要件に合致するキーワードや実績を特に強調して記述すること。"),
            optimizedPr: z.string().describe("求人要件に合致する「ビジネス貢献」や「マネジメント・技術的リーダーシップ」の経験を抽出し、STAR法に基づく箇条書き等でまとめた自己PR。適さない経験は省略し、アピールになる実績を強調すること。")
        });

        const promptText = `
あなたはプロフェッショナルなITエンジニア専門のキャリアアドバイザーです。
以下の【現在の経歴データ（職務要約と自己PR）】を、【応募先の求人・案件要件】に最も刺さるようにリライト・最適化してください。

最適化の条件：
1. 嘘や、経験していないこと（架空の実績）は絶対に書かないこと。
2. 現在の経歴データの中に、求人要件とマッチする要素（技術スタック、マネジメント経験、課題解決の経験など）があれば、それを前面に押し出し、具体的に強調すること。
3. 求人要件とあまり関係のない経験は、簡略化するか削除して文字数を調整すること。
4. 全体として、採用担当者が「まさにうちが求めている人材だ」と感じるような、自信に満ちたプロフェッショナルなトーンで記述すること。

【応募先の求人・案件要件】
${targetJobDescription}

【現在の経歴データ】
--- 職務要約 ---
${currentProfile.summary}

--- 自己PR ---
${currentProfile.pr || "（特になし）"}
`;

        const { object } = await generateObject({
            model: openai('gpt-4o-mini'),
            schema: schemaConfig,
            prompt: promptText,
        });

        return Response.json(object);

    } catch (error) {
        console.error("Optimization API Error:", error);
        return Response.json({ error: 'Failed to optimize profile.' }, { status: 500 });
    }
}
