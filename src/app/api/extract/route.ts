import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// POSTリクエストを受け取り、テキストからプロジェクト情報を構造化して返すエンドポイント
export async function POST(req: Request) {
    try {
        const { text, step } = await req.json();

        if (!text) {
            return Response.json({ error: 'Text is required' }, { status: 400 });
        }

        let schemaConfig;
        let promptText;

        if (step === 1) { // 名前
            schemaConfig = z.object({
                profile: z.object({
                    name: z.string().describe("氏名"),
                    title: z.string().describe("今回は空文字とする"),
                })
            });
            promptText = `以下のテキストから「氏名」を抽出してJSONで返してください。\n\n入力テキスト:\n${text}`;
        } else if (step === 2) { // 職種
            schemaConfig = z.object({
                profile: z.object({
                    title: z.string().describe("職種や肩書き (例: バックエンドエンジニア)"),
                    name: z.string().describe("今回は空文字とする"),
                })
            });
            promptText = `以下のテキストから、現在のメインである「職種や肩書き」を抽出してJSONで返してください。\n\n入力テキスト:\n${text}`;
        } else if (step === 3) { // 強み・自己PR
            schemaConfig = z.object({
                profile: z.object({
                    summary: z.string().describe("2〜3文の職務要約や強み"),
                })
            });
            promptText = `以下の「強みやアピールポイント」から、エンジニアとしての魅力的な職務要約を2〜3文で作成しJSON形式で返してください。\n\n入力テキスト:\n${text}`;
        } else if (step === 4) { // スキル
            schemaConfig = z.object({
                skills: z.array(z.object({
                    subject: z.string().describe("スキルのカテゴリや分野 (例: Frontend, Backend, Infra/Cloudなど)"),
                    score: z.number().describe("1から100の間の自己評価スコア")
                })).describe("最大5つ程度の主要スキル分野"),
            });
            promptText = `以下の「得意なスキル・技術」から、主要なスキル分野を最大5つ抽出し、経験に応じた自己評価スコア(1〜100)をつけてJSONで返してください。\n\n入力テキスト:\n${text}`;
        } else if (step === 5) { // プロジェクトの概要
            schemaConfig = z.object({
                projects: z.array(z.object({
                    summary: z.string().describe("プロジェクトの概要を1〜2文で"),
                    period: z.string().describe("今回は空文字とする"),
                    role: z.string().describe("今回は空文字とする"),
                    tech: z.array(z.string()).describe("今回は空配列とする"),
                    achievements: z.array(z.string()).describe("今回は空配列とする")
                }))
            });
            promptText = `以下の入力から、対象となるプロジェクトの「どんなシステムだったか（概要）」を抽出してJSONで返してください。\n\n入力テキスト:\n${text}`;
        } else if (step === 6) { // プロジェクトの期間と役割
            schemaConfig = z.object({
                projects: z.array(z.object({
                    period: z.string().describe("プロジェクトの期間 (例: 2023.04 - 現在)"),
                    role: z.string().describe("担当した役割やチーム規模 (例: 5名体制のテックリード)"),
                    summary: z.string().describe("今回は空文字とする"),
                    tech: z.array(z.string()).describe("今回は空配列とする"),
                    achievements: z.array(z.string()).describe("今回は空配列とする")
                }))
            });
            promptText = `以下の入力から、プロジェクトの「期間」と「役割・ポジション・チーム規模」を抽出してJSONで返してください。\n\n入力テキスト:\n${text}`;
        } else if (step === 7) { // プロジェクトの技術スタック
            schemaConfig = z.object({
                projects: z.array(z.object({
                    tech: z.array(z.string()).describe("使用した技術・言語・ツールのリスト"),
                    period: z.string().describe("今回は空文字とする"),
                    role: z.string().describe("今回は空文字とする"),
                    summary: z.string().describe("今回は空文字とする"),
                    achievements: z.array(z.string()).describe("今回は空配列とする")
                }))
            });
            promptText = `以下の入力から、プロジェクトで使用した技術スタック（言語、DB、インフラ、ツール等）をリスト化してJSONで返してください。\n\n入力テキスト:\n${text}`;
        } else if (step === 8) { // プロジェクトの担当工程
            schemaConfig = z.object({
                projects: z.array(z.object({
                    summary: z.string().describe("担当した開発工程やフェーズ（要件定義〜など）"),
                    tech: z.array(z.string()).describe("今回は空配列とする"),
                    period: z.string().describe("今回は空文字とする"),
                    role: z.string().describe("今回は空文字とする"),
                    achievements: z.array(z.string()).describe("今回は空配列とする")
                }))
            });
            promptText = `以下の入力から、ユーザーがプロジェクトで「担当した工程（フェーズ）」を抽出し、概要文の形式にしてJSONで返してください。\n\n入力テキスト:\n${text}`;
        } else if (step === 9) { // プロジェクトの成果・実績
            schemaConfig = z.object({
                projects: z.array(z.object({
                    achievements: z.array(z.string()).describe("達成したこと・工夫したこと・成果（定量的な数字があればベター。箇条書きリスト）"),
                    period: z.string().describe("今回は空文字とする"),
                    role: z.string().describe("今回は空文字とする"),
                    summary: z.string().describe("今回は空文字とする"),
                    tech: z.array(z.string()).describe("今回は空配列とする")
                }))
            });
            promptText = `以下の「一番苦労したこと・達成した成果」のメモから、アピールポイントとなるような箇条書きのアクションリスト（achievements）に変換しJSONで返してください。\n\n入力テキスト:\n${text}`;
        } else if (step === 11) { // 資格・リンク
            schemaConfig = z.object({
                profile: z.object({
                    certifications: z.array(z.string()).describe("保有資格のリスト"),
                    links: z.array(z.string()).describe("GitHubやQiitaなどのURLリスト"),
                })
            });
            promptText = `以下のメモから、保有しているIT資格と、ポートフォリオなどのURLリンクを抽出してJSON配列で返してください。\n\n入力テキスト:\n${text}`;
        } else {
            return Response.json({ error: 'Invalid step' }, { status: 400 });
        }

        // Vercel AI SDK を使用した Structured Outputs 生成
        const { object } = await generateObject({
            model: openai('gpt-4o-mini'), // GPT-4o-miniを指定（速度・コスト重視）
            schema: schemaConfig,
            prompt: promptText
        });

        return Response.json(object);
    } catch (error) {
        console.error("AI Extraction Error:", error);
        return Response.json({ error: 'Failed to extract data. Please check your API key.' }, { status: 500 });
    }
}
