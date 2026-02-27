import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// POSTリクエストを受け取り、テキストからプロジェクト情報を構造化して返すエンドポイント
export async function POST(req: Request) {
    try {
        const { text } = await req.json();

        if (!text) {
            return Response.json({ error: 'Text is required' }, { status: 400 });
        }

        // Vercel AI SDK を使用した Structured Outputs 生成
        const { object } = await generateObject({
            model: openai('gpt-4o-mini'), // GPT-4o-miniを指定（速度・コスト重視）
            schema: z.object({
                projects: z.array(z.object({
                    period: z.string().describe("プロジェクトの期間 (例: 2023.04 - 現在)"),
                    role: z.string().describe("担当した役割 (例: フロントエンドエンジニア)"),
                    tech: z.array(z.string()).describe("使用した技術・言語・ツールのリスト"),
                    summary: z.string().describe("プロジェクトの概要を1〜2文で"),
                    achievements: z.array(z.string()).describe("達成したこと・工夫したこと・成果（定量的な数字があればベター）")
                }))
            }),
            prompt: `以下の「職務経歴のメモ（雑なテキスト）」から、プロジェクトごとの履歴情報を抽出してJSON配列形式で返してください。
職務経歴に書かれている内容を元に、期間、役割、技術、概要、成果に分類してください。
成果は可能な限り「〜を改善した」「〜で貢献した」など、アピールポイントとなるアクションとして箇条書きリスト化してください。

情報が不足している項目がある場合でも、テキストの文脈から適切に補完・推測して項目を埋めてください。

入力テキスト:
${text}`
        });

        return Response.json(object);
    } catch (error) {
        console.error("AI Extraction Error:", error);
        return Response.json({ error: 'Failed to extract data. Please check your API key.' }, { status: 500 });
    }
}
