import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import PDFParser from 'pdf2json';

// Vercel Serverless Functions のタイムアウトを延長（デフォルトから最大60秒に変更）
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return Response.json({ error: 'File is required' }, { status: 400 });
        }

        // 1. PDFファイルのパース（テキスト抽出）
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const rawText = await new Promise<string>((resolve, reject) => {
            const pdfParser = new PDFParser(null, true);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            pdfParser.on("pdfParser_dataError", (errData: any) => reject(new Error(errData.parserError)));
            pdfParser.on("pdfParser_dataReady", () => {
                resolve(pdfParser.getRawTextContent());
            });
            pdfParser.parseBuffer(buffer);
        });

        if (!rawText || rawText.trim() === '') {
            return Response.json({ error: 'Could not extract text from PDF' }, { status: 400 });
        }

        // 2. GPT-4o-mini を用いた全文一括構造化
        const schemaConfig = z.object({
            profile: z.object({
                name: z.string().describe("氏名"),
                title: z.string().describe("現在のメイン職種（例: フロントエンドエンジニア）"),
                age: z.string().describe("生年月日と、本日の日付に基づき正確に再計算した現在の年齢の両方を含めてください（例: '1990年1月1日 (36歳)'）"),
                address: z.string().describe("住所や居住地（不明な場合は空文字）"),
                education: z.string().describe("最終学歴（不明な場合は空文字）"),
                experienceYears: z.string().describe("エンジニアとしての経験年数（不明な場合は空文字）"),
                summary: z.string().describe("職務要約とアピールポイント（300〜500字程度）。短すぎる場合はエンジニアとしての一般的な強みを推測して補完し、プロフェッショナルな魅力ある文章に仕上げてください。"),
                pr: z.string().describe("マネジメント経験やビジネス・チームへの貢献、特筆すべき自己PRなどがあれば箇条書き等の文章でまとめる（該当情報がなければ空文字）"),
                certifications: z.array(z.string()).describe("保有資格のリスト"),
                links: z.array(z.string()).describe("GitHubやQiitaなどのURLリスト"),
            }),
            skills: z.array(z.object({
                subject: z.string().describe("技術・スキル名（言語、FW、ツールなど）"),
                A: z.number().describe("経験年数や記載順に基づく習熟度スコア。上級=100, 中級=75, 初級=50程度で評価。最低50, 最高100。"),
                fullMark: z.number().describe("常に100とする")
            })).describe("主要なスキルを最大10個程度までリスト化"),
            projects: z.array(z.object({
                id: z.string().describe("ランダムな一意の文字列（例: proj_1, proj_2等）"),
                period: z.string().describe("プロジェクトの期間 (例: 2023.04 - 現在)"),
                role: z.string().describe("担当した役割やチーム規模 (例: 5名体制のテックリード)"),
                summary: z.string().describe("プロジェクトの概要と担当フェーズ（2〜3文）"),
                tech: z.array(z.string()).describe("使用した技術・言語・ツールのリスト"),
                achievements: z.array(z.string()).describe("担当業務の詳細内容、実績、工夫した点などをできるだけ具体的に、テキストから漏れなく箇条書きリストとしてすべて抽出してください。")
            })).describe("時系列順（新しいものが上）に並べたプロジェクト履歴配列。最大10件程度まで抽出してください。")
        });

        const today = new Date();
        const dateString = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

        const promptText = `提供された職務経歴書（PDF）の抽出テキストから、エンジニアの経歴情報を全て解析し、指定したJSONスキーマ（profile, skills, projects）に構造化して返却してください。情報が不足している項目は空文字や空配列にして構いません。
本日は ${dateString} です。PDFに記載された年齢が古い場合があるため、生年月日が分かる場合は必ず本日時点での正しい年齢を計算して出力してください。
特に職務経歴（プロジェクト）の詳細内容は要約しすぎず、できるだけ元のテキストの情報を充実させた状態でリスト化してください。\n\n【抽出テキスト】\n${rawText}`;

        const { object } = await generateObject({
            model: openai('gpt-4o-mini'),
            schema: schemaConfig,
            prompt: promptText
            // テキスト量が多い可能性があるため timeout や maxRetries を指定することも検討（今回はデフォ）
        });

        // 完成度スコアの簡易算出 (Profile項目が埋まっているほど高い)
        let score = 20;
        if (object.profile.summary) score += 20;
        if (object.projects && object.projects.length > 0) score += 30;
        if (object.skills && object.skills.length > 0) score += 30;

        // Zodの型にないscoreを安全に追加するため、新しいオブジェクトを組む
        const responseData = {
            ...object,
            profile: {
                ...object.profile,
                score
            }
        };

        return Response.json(responseData);

    } catch (error) {
        console.error("PDF Import API Error:", error);
        return Response.json({
            error: 'Failed to process the PDF file.',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
