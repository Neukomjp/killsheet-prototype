import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url || typeof url !== 'string') {
            return Response.json({ error: 'Valid URL is required' }, { status: 400 });
        }

        // 1. URLからHTMLを取得
        const fetchRes = await fetch(url, {
            headers: {
                // 簡単なスクレイピング対策回避のためUser-Agentを付与
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!fetchRes.ok) {
            throw new Error(`Failed to fetch URL: ${fetchRes.statusText}`);
        }

        const html = await fetchRes.text();

        // 2. cheerioを用いて本文テキストを抽出
        const $ = cheerio.load(html);

        // head, script, style, nav, footer 等の不要な要素を削除
        $('script, style, noscript, header, footer, nav, iframe, svg, path, symbol').remove();

        // body内のテキストを取得し、過剰な空白や改行を圧縮
        const rawText = $('body').text().replace(/\s+/g, ' ').trim();

        // AIのトークン制限や処理負荷軽減のため、先頭から一定文字数（例: 10000文字）にカット
        const truncatedText = rawText.slice(0, 10000);

        // 3. AIによるテキスト解析・データ抽出
        const schemaConfig = z.object({
            skills: z.array(z.string()).describe("このURLのページ（GitHubプロフィールや技術記事など）から読み取れる、この人物が持つ技術スキルや得意領域のリスト（例: React, TypeScript, OSS貢献, AWS など）"),
            prText: z.string().describe("このページの内容から読み取れる「エンジニアとしての実績、技術力、発信力」などをアピールする150字程度の自己PR文。"),
        });

        const promptText = `
あなたはプロのITエンジニア専門キャリアアドバイザーです。
以下のテキストは、あるエンジニアのWebページ（GitHubプロフィール、Qiita/Zennの記事、個人のポートフォリオサイトなど）から抽出した生のテキストデータです。
このテキストを分析し、対象のエンジニアが持っていると思われる「スキルセット」と、このページから読み取れる実績に基づく「自己PR文」を抽出・生成してください。

【抽出元のテキストデータ】
---
${truncatedText}
---

指示：
- 対象者が持っていることが確実と思われる技術スタックや経験領域を skills に配列で抽出してください。（最大10個程度）
- このページからわかる実績（OSSへの貢献、技術記事の執筆、特定技術への深い理解など）を元に、職務経歴書に追記できるようなアピール文（prText）を作ってください。
- もしテキストの内容からスキルや実績が一切読み取れない場合は、適宜空またはその旨を返してください。
`;

        const { object } = await generateObject({
            model: openai('gpt-4o-mini'),
            schema: schemaConfig,
            prompt: promptText,
        });

        return Response.json({
            originUrl: url,
            ...object
        });

    } catch (error) {
        console.error("URL Parse Error:", error);
        return Response.json({ error: 'Failed to parse URL or extract information.' }, { status: 500 });
    }
}
