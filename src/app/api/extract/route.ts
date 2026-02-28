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
                profile: z.object({
                    name: z.string().describe("氏名"),
                    title: z.string().describe("職種や肩書き (例: サーバーサイドエンジニア)"),
                    summary: z.string().describe("2〜3文の職務要約"),
                }),
                skills: z.array(z.object({
                    subject: z.string().describe("スキルのカテゴリや分野 (例: Frontend, Backend, Infra/Cloud, Team Lead)"),
                    score: z.number().describe("1から100の間の自己評価スコア")
                })).describe("5つ程度の主要スキル分野のレーダーチャート用データ"),
                projects: z.array(z.object({
                    period: z.string().describe("プロジェクトの期間 (例: 2023.04 - 現在)"),
                    role: z.string().describe("担当した役割 (例: フロントエンドエンジニア)"),
                    tech: z.array(z.string()).describe("使用した技術・言語・ツールのリスト"),
                    summary: z.string().describe("プロジェクトの概要を1〜2文で"),
                    achievements: z.array(z.string()).describe("達成したこと・工夫したこと・成果（定量的な数字があればベター）")
                }))
            }),
            prompt: `以下の「職務経歴のメモ（雑なテキスト）」から、氏名、職務要約、主要スキル、およびプロジェクトごとの履歴情報を抽出してJSON形式で返してください。
職務経歴に書かれている内容を元に、全体サマリーやスキルセットを判定し、また経験を各プロジェクトに分割して期間、役割、技術、概要、成果に分類してください。
成果は可能な限り「〜を改善した」「〜で貢献した」など、アピールポイントとなるアクションとして箇条書きリスト化してください。

情報が不足している項目がある場合でも、テキストの文脈から適切に補完・推測して項目を埋めてください。氏名がない場合は「氏名未入力」としてください。

入力テキスト:
${text}`
        });

        return Response.json(object);
    } catch (error) {
        console.error("AI Extraction Error:", error);
        return Response.json({ error: 'Failed to extract data. Please check your API key.' }, { status: 500 });
    }
}
