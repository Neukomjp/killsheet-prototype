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

        if (step === 1) { // 名前 (今回はAIを使わずに直接Editorから渡されるため実質呼ばれないが防御的に残す)
            schemaConfig = z.object({
                profile: z.object({
                    name: z.string().describe("氏名"),
                    title: z.string().describe("今回は空文字とする"),
                })
            });
            promptText = `以下のテキストから「氏名」を抽出してJSONで返してください。\n\n入力テキスト:\n${text}`;
        } else if (step === 2) { // 強み・自己PR (新Step 2)
            schemaConfig = z.object({
                profile: z.object({
                    summary: z.string().describe("職務要約とアピールポイント（300〜500字程度）。短すぎる場合はエンジニアとしての一般的な強みを推測して補完し、プロフェッショナルな魅力ある文章に仕上げてください。"),
                })
            });
            promptText = `以下の「強みやアピールポイント」のメモから、採用担当者の目を引くような充実した「職務要約（Professional Summary）」を作成しJSON形式で返してください。入力が短い場合でも、その内容から推測される強みやスタンスを膨らませて、300文字〜500文字程度のしっかりとした文章構成にしてください。\n\n入力テキスト:\n${text}`;
        } else if (step === 5) { // プロジェクトの概要
            schemaConfig = z.object({
                projects: z.array(z.object({
                    summary: z.string().describe("システムの目的、背景、規模感を示す概要説明（2〜3文程度）"),
                    period: z.string().describe("今回は空文字とする"),
                    role: z.string().describe("今回は空文字とする"),
                    tech: z.array(z.string()).describe("今回は空配列とする"),
                    achievements: z.array(z.string()).describe("今回は空配列とする")
                }))
            });
            promptText = `以下の入力メモから、対象となるプロジェクトの「どんな課題を解決するシステムか・どのようなシステムか（概要）」を抽出してください。入力が短い場合は一般的な背景を補完して、2〜3文程度の理解しやすい概要文にしてJSONで返してください。\n\n入力テキスト:\n${text}`;
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
                    summary: z.string().describe("担当した開発工程やフェーズ（要件定義、基本設計、実装、テスト、運用保守など）における具体的な関わり方や役割（2〜3文）"),
                    tech: z.array(z.string()).describe("今回は空配列とする"),
                    period: z.string().describe("今回は空文字とする"),
                    role: z.string().describe("今回は空文字とする"),
                    achievements: z.array(z.string()).describe("今回は空配列とする")
                }))
            });
            promptText = `以下の入力から、ユーザーがプロジェクトで「担当した工程（フェーズ）」を抽出し、単なる単語の羅列ではなく「どの工程からどの工程までをどのように担当したか」という具体的な概要文の形式にしてJSONで返してください。\n\n入力テキスト:\n${text}`;
        } else if (step === 9) { // プロジェクトの成果・実績
            schemaConfig = z.object({
                projects: z.array(z.object({
                    achievements: z.array(z.string()).describe("STAR法（状況・課題・行動・結果）を意識した具体的な成果や工夫点の箇条書き（3〜4個）"),
                    period: z.string().describe("今回は空文字とする"),
                    role: z.string().describe("今回は空文字とする"),
                    summary: z.string().describe("今回は空文字とする"),
                    tech: z.array(z.string()).describe("今回は空配列とする")
                }))
            });
            promptText = `以下の「一番苦労したこと・達成した成果」のメモから、職務経歴書のアピールポイントとなるような箇条書きのリスト（achievements）を生成しJSONで返してください。
ポイント：入力が不十分な場合でも、エンジニアとしての一般的な創意工夫や、STAR法（状況・課題解決のための行動・もたらした結果）の要素を推測で補完し、可能な限り定量的・具体的なプロフェッショナルな実績として3〜4個の箇条書きに仕上げてください。\n\n入力テキスト:\n${text}`;
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
