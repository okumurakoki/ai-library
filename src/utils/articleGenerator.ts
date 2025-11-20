import Anthropic from '@anthropic-ai/sdk';
import { TavilyClient } from 'tavily';
import type { Article } from '../types';

// Tavily API クライアント
const tavilyApiKey = import.meta.env.VITE_TAVILY_API_KEY;
const tavilyClient = tavilyApiKey ? new TavilyClient({ apiKey: tavilyApiKey }) : null;

// Anthropic API クライアント
const anthropicApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
const anthropicClient = anthropicApiKey
  ? new Anthropic({ apiKey: anthropicApiKey, dangerouslyAllowBrowser: true })
  : null;

/**
 * Tavilyを使用してWeb検索を実行
 */
async function searchWeb(query: string, maxResults: number = 10): Promise<any[]> {
  if (!tavilyClient) {
    console.warn('Tavily API key not configured, skipping web search');
    return [];
  }

  try {
    const response = await tavilyClient.search(query, {
      max_results: maxResults,
      search_depth: 'advanced',
      include_answer: true,
      include_raw_content: false,
    });

    return response.results || [];
  } catch (error) {
    console.error('Tavily search error:', error);
    return [];
  }
}

/**
 * Claude AIを使用して記事を生成
 */
async function generateWithClaude(prompt: string): Promise<string> {
  if (!anthropicClient) {
    console.warn('Anthropic API key not configured, using fallback');
    return 'API未設定のため記事を生成できませんでした。環境変数 VITE_ANTHROPIC_API_KEY を設定してください。';
  }

  try {
    const message = await anthropicClient.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textContent = message.content.find((block) => block.type === 'text');
    return textContent ? (textContent as any).text : '';
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('記事の生成中にエラーが発生しました');
  }
}

/**
 * AI記事を生成する（Tavily検索 + Claude AI）
 */
export async function generateArticle(
  category: 'news' | 'tips',
  topic: string,
  keywords: string[]
): Promise<Article> {
  // ステップ1: Tavilyでトピックに関連する情報を検索
  console.log(`Searching web for: ${topic}`);
  const searchResults = await searchWeb(`${topic} ${keywords.join(' ')} AI 最新`, 10);

  // 検索結果をテキストにまとめる
  const researchSummary = searchResults
    .map((result, index) => {
      return `
【情報源${index + 1}】
タイトル: ${result.title}
URL: ${result.url}
内容: ${result.content}
`;
    })
    .join('\n\n');

  // ステップ2: Claudeに記事執筆を依頼
  const articlePrompt = category === 'news'
    ? buildNewsPrompt(topic, keywords, researchSummary)
    : buildTipsPrompt(topic, keywords, researchSummary);

  console.log('Generating article with Claude...');
  const content = await generateWithClaude(articlePrompt);

  // タイトルを抽出（最初の#見出しから）
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : `${topic}の実践ガイド`;

  // 本文からタイトル行を削除
  const contentWithoutTitle = content.replace(/^#\s+.+\n\n/m, '');

  const article: Article = {
    id: `article-${Date.now()}`,
    title,
    content: contentWithoutTitle,
    excerpt: contentWithoutTitle.substring(0, 200) + '...',
    category,
    author: 'AI Library編集部',
    publishedAt: new Date().toISOString(),
    isPublished: false,
  };

  return article;
}

/**
 * AIニュース記事用のプロンプトを構築
 */
function buildNewsPrompt(topic: string, keywords: string[], researchSummary: string): string {
  return `あなたはAI技術の専門ライターです。以下の調査情報をもとに、最新のAIニュース記事を執筆してください。

【記事のテーマ】
${topic}

【重要キーワード】
${keywords.join(', ')}

【調査結果】
${researchSummary}

【執筆ガイドライン】
1. **最新かつ正確な情報**: 調査結果から最新の情報を抽出し、正確に記述してください
2. **構成**: 以下の構成で執筆してください
   - 導入（何が起きているのか、なぜ重要か）
   - 主な新機能・変更点（具体的に）
   - ビジネスへの影響（実用的な視点）
   - 実践的な活用例（すぐ使える情報）
   - 今後の展望
3. **読みやすさ**:
   - 見出しを適切に使用（##, ###）
   - 箇条書きやリストを活用
   - 専門用語には簡単な説明を付ける
4. **文体**: プロフェッショナルだが親しみやすいトーン
5. **長さ**: 1500〜2500文字程度
6. **情報源**: 調査結果の情報を適切に反映させてください

マークダウン形式で記事を執筆してください。タイトルは # で始めてください。`;
}

/**
 * 使い方記事用のプロンプトを構築
 */
function buildTipsPrompt(topic: string, keywords: string[], researchSummary: string): string {
  return `あなたはAI活用の専門家です。以下の調査情報をもとに、実践的な使い方記事を執筆してください。

【記事のテーマ】
${topic}

【重要キーワード】
${keywords.join(', ')}

【調査結果】
${researchSummary}

【執筆ガイドライン】
1. **実践的な内容**: すぐに試せる具体的な手順やテクニックを含める
2. **構成**: 以下の構成で執筆してください
   - 導入（この記事で学べること）
   - 基本的な考え方・原則
   - ステップバイステップの実践手順
   - 具体的な活用例・テンプレート
   - よくある質問とトラブルシューティング
   - まとめと次のステップ
3. **読みやすさ**:
   - 見出しを適切に使用（##, ###）
   - コードブロックや箇条書きを活用
   - 具体例を豊富に含める
4. **対象読者**: 初心者から中級者まで理解できる内容
5. **長さ**: 2000〜3000文字程度
6. **実用性**: 調査結果から実際に使えるテクニックを抽出してください

マークダウン形式で記事を執筆してください。タイトルは # で始めてください。`;
}

/**
 * 複数の記事を一括生成
 */
export async function generateMultipleArticles(
  category: 'news' | 'tips',
  count: number
): Promise<Article[]> {
  const topics = category === 'news'
    ? [
        'ChatGPT/Claude最新アップデート',
        'AI規制の最新動向',
        '新しいAIツールのリリース',
      ]
    : [
        'プロンプトエンジニアリング実践',
        'AI業務効率化テクニック',
        'AIツール比較ガイド',
      ];

  const articles: Article[] = [];

  for (let i = 0; i < Math.min(count, topics.length); i++) {
    const topic = topics[i];
    const keywords = category === 'news'
      ? ['最新', '機能', '影響']
      : ['実践', '効率化', 'テクニック'];

    const article = await generateArticle(category, topic, keywords);
    articles.push(article);

    // API制限を考慮して少し待機
    if (i < count - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return articles;
}
