// =========================================================================
// 🌸 HFA福祉架け橋OS 『まごころ相談ナビ』 Edge Worker エンジン（Ver 1.2.1）
// 開発者: ちゃろ ＆ AIバディ
// =========================================================================

import fukushi_db from './fukushi_db.json';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 🛡️ 第2の盾：絶対防衛線（デグレ防止セーフガード）
    if (url.pathname !== "/life" && !url.pathname.startsWith("/life/")) {
      console.log(`🛡️ [防衛線作動] 既存ページへのアクセスを検知したためスルーします: ${url.pathname}`);
      return fetch(request);
    }

    // Workersがアドセンスコードとコンテンツが含まれたHTMLを直接生成して返します（サーバー上にファイル不要）
    return new Response(generateHTML(fukushi_db), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Robots-Tag": "noindex, nofollow"
      }
    });
  }
};

function generateHTML(db) {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>まごころ相談ナビ - 生活再建支援・無料相談窓口検索</title>
    
    <style>
        :root {
            --bg-main: #0f172a;
            --bg-card: #1e293b;
            --bg-input: #111827;
            --text-main: #f1f5f9;
            --text-sub: #94a3b8;
            --primary: #f472b6;
            --primary-hover: #ec4899;
            --green: #10b981;
            --red: #ef4444;
            --border: #334155;
        }
        body {
            background-color: var(--bg-main);
            color: var(--text-main);
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            line-height: 1.6;
        }
        .wrapper {
            width: 100%;
            max-width: 650px;
            padding: 20px;
            box-sizing: border-box;
        }
        .hfa-intro-card {
            background: linear-gradient(135deg, #1e293b 0%, #111827 100%);
            border: 1px solid var(--primary);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
            box-shadow: 0 4px 20px rgba(244, 114, 182, 0.15);
        }
        .hfa-title {
            font-size: 1.3rem;
            color: var(--primary);
            margin-top: 0;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .hfa-text {
            font-size: 0.9rem;
            color: var(--text-sub);
            margin: 0 0 12px 0;
        }
        .hfa-tagline {
            font-weight: bold;
            color: var(--text-main);
            border-left: 3px solid var(--primary);
            padding-left: 10px;
            margin: 15px 0;
        }
        .search-box {
            background-color: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .search-title {
            font-size: 1.1rem;
            margin-top: 0;
            margin-bottom: 12px;
            font-weight: bold;
        }
        .input-group {
            display: flex;
            gap: 10px;
        }
        input[type="text"] {
            flex: 1;
            background-color: var(--bg-input);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 12px 16px;
            color: var(--text-main);
            font-size: 1rem;
            outline: none;
            transition: border-color 0.2s;
        }
        input[type="text"]:focus {
            border-color: var(--primary);
        }
        .search-btn {
            background-color: var(--primary);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0 20px;
            font-size: 1rem;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.2s;
        }
        .search-btn:hover {
            background-color: var(--primary-hover);
        }
        .zip-candidates {
            margin-top: 15px;
            padding: 12px;
            background-color: var(--bg-input);
            border-radius: 8px;
            border: 1px solid var(--border);
            display: none;
        }
        .zip-candidates-title {
            font-size: 0.85rem;
            color: var(--text-sub);
            margin-bottom: 8px;
        }
        .candidate-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .candidate-btn {
            background-color: var(--bg-card);
            border: 1px solid var(--primary);
            color: var(--text-main);
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        .candidate-btn:hover {
            background-color: var(--primary);
            color: white;
        }
        .results-header {
            font-size: 0.95rem;
            color: var(--text-sub);
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
        }
        .facility-card {
            background-color: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .facility-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }
        .facility-name {
            font-size: 1.15rem;
            font-weight: bold;
            color: var(--text-main);
            margin: 0;
        }
        .status-badge {
            font-size: 0.75rem;
            padding: 4px 8px;
            border-radius: 9999px;
            font-weight: bold;
            white-space: nowrap;
        }
        .status-open {
            background-color: rgba(16, 185, 129, 0.2);
            color: var(--green);
            border: 1px solid var(--green);
        }
        .status-closed {
            background-color: rgba(239, 68, 68, 0.2);
            color: var(--red);
            border: 1px solid var(--red);
        }
        .facility-info {
            font-size: 0.9rem;
            color: var(--text-sub);
            margin-bottom: 15px;
        }
        .info-row {
            display: flex;
            margin-bottom: 6px;
        }
        .info-label {
            width: 75px;
            flex-shrink: 0;
            color: var(--text-sub);
        }
        .info-value {
            color: var(--text-main);
        }
        .makaroko-box {
            background-color: var(--bg-input);
            border-left: 4px solid var(--primary);
            padding: 12px 15px;
            border-radius: 0 8px 8px 0;
            margin-bottom: 15px;
        }
        .makaroko-title {
            font-size: 0.8rem;
            color: var(--primary);
            font-weight: bold;
            margin-bottom: 4px;
        }
        .makaroko-script {
            font-size: 0.9rem;
            color: var(--text-main);
            font-style: italic;
        }
        .action-links {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .action-btn {
            flex: 1;
            min-width: 110px;
            text-align: center;
            padding: 10px;
            border-radius: 8px;
            font-size: 0.85rem;
            text-decoration: none;
            font-weight: bold;
            transition: opacity 0.2s;
        }
        .action-btn:hover {
            opacity: 0.85;
        }
        .btn-tel { background-color: var(--green); color: white; }
        .btn-url { background-color: #3b82f6; color: white; }
        .btn-mail { background-color: #8b5cf6; color: white; }
        .btn-form { background-color: #f59e0b; color: white; }
        .national-section {
            margin-top: 40px;
            border-top: 2px dashed var(--border);
            padding-top: 30px;
        }
        .national-title {
            font-size: 1.2rem;
            color: var(--primary);
            font-weight: bold;
            margin-bottom: 15px;
            text-align: center;
        }
        .adsense-container {
            width: 100%;
            text-align: center;
            margin: 30px 0;
            min-height: 250px;
            background: rgba(30, 41, 59, 0.5);
            border-radius: 12px;
            border: 1px dashed var(--border);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .ads-label {
            font-size: 10px;
            color: var(--text-sub);
            margin-bottom: 5px;
            letter-spacing: 1px;
        }
        .mago-footer {
            margin-top: 50px;
            border-top: 1px solid var(--border);
            padding-top: 25px;
            padding-bottom: 40px;
            font-size: 0.8rem;
            color: var(--text-sub);
            text-align: justify;
        }
        .footer-highlight {
            color: var(--primary);
            font-weight: bold;
        }
        .emergency-box {
            background-color: rgba(239, 68, 68, 0.1);
            border: 1px solid var(--red);
            border-radius: 8px;
            padding: 15px;
            margin-top: 15px;
            color: var(--text-main);
        }
    </style>
</head>
<body>
    <div class="wrapper">

        <!-- 🌸 タイトル -->
        <h1 style="color: var(--primary); margin-bottom: 5px; font-size: 1.8rem; text-align: center;">まごころ相談ナビ</h1>
        <p style="color: var(--text-sub); text-align: center; margin-top: 0; margin-bottom: 25px; font-size: 0.95rem;">
            〜 崖っぷちに立つあなたを、地域の温かい専門家へ繋ぐ架け橋 〜
        </p>

        <!-- 👑 AdSense 広告ユニット 1 (上部) -->
        <div class="adsense-container">
            <div class="ads-label">スポンサーリンク</div>
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2908004621823900" crossorigin="anonymous"></script>
            <ins class="adsbygoogle"
                 style="display:inline-block;width:300px;height:250px"
                 data-ad-client="ca-pub-2908004621823900"
                 data-ad-slot="3799886389"></ins>
            <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
        </div>

        <!-- 👑 HFAの理念・解説テキスト（Thin Content対策） -->
        <div class="hfa-intro-card">
            <h2 class="hfa-title">🌸 私たちの「まごころ」の理念（happy for all）</h2>
            <p class="hfa-text">
                生活が苦しい、家族の暴力（DV）から逃げたい、借金が返せない、介護に限界を感じている……。人は誰しも、人生の途中で崖っぷちに立たされることがあります。しかし、そんな時に「どこに相談すればいいのか分からない」「相談すること自体が恥ずかしい」「たらい回しにされるのではないか」と悩んでしまい、誰にも繋がれずに孤立してしまう悲劇が後を絶ちません。
            </p>
            <p class="hfa-text">
                当ナビゲーションシステムは、そうした絶望の淵にいる方々が、<strong>「完全無料（一円も払わず）」「中立的な立場」</strong>で、その地域に存在する「生活再建の専門家（ソーシャルワーカーや支援センターの愛ある人）」に数秒で直結することを目的に作られた、個人運営の検索支援ツールです。
            </p>
           
        </div>

        <!-- 👑 検索入力フォーム -->
        <div class="search-box">
            <h3 class="search-title">🔍 相談窓口をさがす</h3>
            <p style="font-size: 0.8rem; color: var(--text-sub); margin-top: -5px; margin-bottom: 15px;">
                郵便番号（上3桁：例 577）または、自治体名・地域名（例：品川区、東大阪）を入力してください。
            </p>
            <div class="input-group">
                <input type="text" id="searchInput" placeholder="例：577 または 品川区" oninput="handleSearchInput()">
                <button class="search-btn" onclick="executeSearch()">検索</button>
            </div>

            <!-- 👑 郵便番号3桁検知時の「ハイブリッド候補地選択」ボタン展開エリア -->
            <div class="zip-candidates" id="zipCandidates">
                <div class="zip-candidates-title" id="zipCandidatesTitle"></div>
                <div class="candidate-buttons" id="candidateButtons"></div>
            </div>
        </div>

        <!-- 👑 検索結果エリア -->
        <div id="resultsArea">
            <div class="results-header">
                <span id="resultsCount">検索結果：0 件</span>
                <span style="font-size: 0.8rem;">※データは自動同期されています。</span>
            </div>
            <div id="facilityList">
                <p style="text-align: center; color: var(--text-sub); padding: 30px 0;">
                    郵便番号や地域名を入力して検索してください。
                </p>
            </div>
        </div>

        <!-- 👑 最後の砦：全国共通窓口常設エリア -->
        <div class="national-section">
            <h2 class="national-title">🛡️ 緊急時の相談（24時間365日・最後の砦）</h2>
            <p style="font-size: 0.8rem; color: var(--text-sub); text-align: center; margin-bottom: 20px; margin-top: -10px;">
                地域窓口が閉まっている夜間・土日祝日や、どこに電話すべきか迷う場合は、以下の全国共通窓口へご相談ください。
            </p>
            <div id="nationalList"></div>
        </div>

        <!-- 👑 AdSense 広告ユニット 2 (下部) -->
        <div class="adsense-container" style="margin-top: 40px;">
            <div class="ads-label">スポンサーリンク</div>
            <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2908004621823900" crossorigin="anonymous"></script>
            <ins class="adsbygoogle"
                 style="display:inline-block;width:300px;height:250px"
                 data-ad-client="ca-pub-2908004621823900"
                 data-ad-slot="3799886389"></ins>
            <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
        </div>

        <!-- 👑 運営者と利用者を守る【絶対免責フッター】 -->
        <footer class="mago-footer">
            <p><strong>🌸 ご利用にあたっての免責事項</strong></p>
            <p>
                本システムは、happy for all（HFA）の理念に基づき、本当に支援を必要とされている方と、生活再建を支える専門家を迅速かつ安全に繋ぐために作成された、個人運営の非営利検索支援ツールです。
            </p>
            <p>
                掲載している自治体・支援機関の情報は、国やデジタル庁、各省庁が公開するオープンデータをプログラムにより自動取得した上で掲載しておりますが、情報の最新性、正確性、即時性を100%保証するものではありません。実際に通話や面談を行われる際は、該当機関の公式サイト等の最新情報を必ずご自身で再度ご確認ください。
            </p>
            <p>
                本システムを利用したこと、または利用できなかったことによって発生した、利用者様および第三者のいかなる損害、不利益、法的トラブル等についても、システム運営者は一切の法的責任および損害賠償責任を負いかねます。
            </p>

            <div class="emergency-box">
                🚨 <span class="footer-highlight">命に関わる、一刻を争う緊急事態の場合</span>は、迷わず今すぐ「<span class="footer-highlight">119</span>」（消防・救急）または「<span class="footer-highlight">110</span>」（警察）へお電話をおかけください。
                <br><br>
                📞 救急車を呼ぶべきか判断に迷ったときは、医師や専門家に無料相談できる全国共通の救急安心センター事業「<span class="footer-highlight">#7119</span>」へご相談ください。
            </div>
            
            <p style="text-align: center; color: var(--text-sub); margin-top: 25px; font-size: 0.75rem;">
                © 2026 happy for all (HFA) Project.
            </p>
        </footer>

    </div>

    <script>
        const FUKUSHI_DB = ${JSON.stringify(db)};

        window.onload = function() {
            renderNationalServices();
            executeSearch(); 
        };

        function renderNationalServices() {
            const container = document.getElementById("nationalList");
            container.innerHTML = "";
            const services = FUKUSHI_DB.national_services || [];

            services.forEach(srv => {
                const card = document.createElement("div");
                card.className = "facility-card";
                card.style.borderLeft = "4px solid var(--primary)";
                
                let scriptText = "「お力になっていただけますでしょうか？今の悩みを聞いてください」";
                if (srv.name.includes("よりそい")) {
                    scriptText = "「生活や心に悩みがあり、お電話しました。話を聞いていただけますか？」";
                } else if (srv.name.includes("DV")) {
                    scriptText = "「パートナーの暴力から身を守るために相談したく、お電話しました。相談員さんにお繋ぎください」";
                } else if (srv.name.includes("法テラス")) {
                    scriptText = "「借金や法的なトラブルを抱えており、無料の相談をさせていただきたいです」";
                }

                card.innerHTML = \`
                    <div class="facility-header">
                        <p class="facility-name">\${srv.name}</p>
                        <span class="status-badge status-open">🟢 24時間受付中</span>
                    </div>
                    <p style="font-size:0.85rem; color:var(--text-sub); margin: 5px 0 12px 0;">\${srv.description}</p>
                    <div class="facility-info">
                        <div class="info-row"><span class="info-label">受付時間:</span><span class="info-value">\${srv.hours}</span></div>
                    </div>
                    <div class="makaroko-box">
                        <div class="makaroko-title">📞 お電話がつながったら、そのままこれを読み上げてください</div>
                        <div class="makaroko-script">"\${scriptText}"</div>
                    </div>
                    <div class="action-links">
                        <a href="tel:\${srv.tel.replace(/-/g, '')}" class="action-btn btn-tel">📞 電話する</a>
                        <a href="\${srv.official_url}" target="_blank" class="action-btn btn-url">🌐 公式サイト</a>
                    </div>
                \`;
                container.appendChild(card);
            });
        }

        function evaluateStatus(hoursStr) {
            try {
                const now = new Date();
                const jstOffset = 9 * 60; 
                const localOffset = now.getTimezoneOffset();
                const jstTime = new Date(now.getTime() + (jstOffset + localOffset) * 60000);
                
                const day = jstTime.getDay(); 
                const hour = jstTime.getHours();
                const min = jstTime.getMinutes();
                const currentMinutes = hour * 60 + min;

                if (day === 0 || day === 6) {
                    return { status: "closed", text: "🔴 受付時間外（次の受付: 月曜 8:30〜）" };
                }

                const match = hoursStr.match(/(\\d{2}):(\\d{2})-(\\d{2}):(\\d{2})/);
                if (match) {
                    const startMin = parseInt(match[1]) * 60 + parseInt(match[2]);
                    const endMin = parseInt(match[3]) * 60 + parseInt(match[4]);
                    
                    if (currentMinutes >= startMin && currentMinutes < endMin) {
                        const closeTime = \`\${match[3]}:\${match[4]}\`;
                        return { status: "open", text: \`🟢 現在受付中（\${closeTime}まで）\` };
                    }
                }
                return { status: "closed", text: "🔴 受付時間外（次の受付: 明日 8:30〜）" };
            } catch (e) {
                return { status: "open", text: "🟢 現在受付中" };
            }
        }

        /**
         * 👑 郵便番号 ＆ あいまい一致「ハイブリッド検索」入力監視（全国100%完全自動カバー）
         */
        async function handleSearchInput() {
            const query = document.getElementById("searchInput").value.trim().replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
            const zipCandidates = document.getElementById("zipCandidates");
            const zipCandidatesTitle = document.getElementById("zipCandidatesTitle");
            const btnContainer = document.getElementById("candidateButtons");

            // 👑 3桁の数字を検知したら、世界標準の無料静的郵便番号ライブラリ（yubinbango-data）から非同期フェッチ！
            if (query.match(/^\\d{3}$/)) {
                try {
                    // 日本のすべての郵便番号をカバーする信頼性の高いオープンAPIから3桁データを非同期取得
                    const response = await fetch(\`https://yubinbango.github.io/yubinbango-data/data/\${query}.js\`);
                    if (response.ok) {
                        const text = await response.text();
                        // jsonp的なコールバック「$yubin(...)」から安全にJSONデータを抽出
                        const jsonStr = text.substring(text.indexOf("(") + 1, text.lastIndexOf(")"));
                        const data = JSON.parse(jsonStr);

                        // 重複しない市区町村名を抽出
                        const cities = new Set();
                        for (const key in data) {
                            const addressArray = data[key]; // [都道府県ID, 市区町村名, 町域名]
                            const prefecture = getPrefectureName(addressArray[0]);
                            const city = addressArray[1];
                            if (prefecture && city) {
                                cities.add(\`\${prefecture}\${city}\`);
                            }
                        }

                        const uniqueCities = Array.from(cities);
                        if (uniqueCities.length > 0) {
                            zipCandidatesTitle.innerHTML = \`🎯 郵便番号 <strong>\${query}</strong> の地域を検出。どちらにお住まいですか？\`;
                            btnContainer.innerHTML = "";
                            
                            uniqueCities.forEach(city => {
                                const btn = document.createElement("button");
                                btn.className = "candidate-btn";
                                btn.textContent = city;
                                btn.onclick = () => {
                                    document.getElementById("searchInput").value = city;
                                    zipCandidates.style.display = "none";
                                    executeSearch();
                                };
                                btnContainer.appendChild(btn);
                            });
                            zipCandidates.style.display = "block";
                            return;
                        }
                    }
                } catch (e) {
                    console.warn("郵便番号データの取得に失敗しました。フォールバックとして部分一致検索を行います:", e);
                }
            }
            zipCandidates.style.display = "none";
        }

        // yubinbango-data の都道府県IDから都道府県名を割り出す超軽量関数
        function getPrefectureName(id) {
            const prefs = [
                "", "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県", "茨城県", "栃木県",
                "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県", "新潟県", "富山県", "石川県", "福井県", "山梨県",
                "長野県", "岐阜県", "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県",
                "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県",
                "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
            ];
            return prefs[id] || "";
        }

        function executeSearch() {
            const query = document.getElementById("searchInput").value.trim().toLowerCase();
            const listContainer = document.getElementById("facilityList");
            listContainer.innerHTML = "";

            const facilities = FUKUSHI_DB.facilities || [];
            
            const filtered = facilities.filter(fac => {
                if (!query) return true;
                return (
                    fac.prefecture.toLowerCase().includes(query) ||
                    fac.city.toLowerCase().includes(query) ||
                    fac.name.toLowerCase().includes(query) ||
                    fac.address.toLowerCase().includes(query) ||
                    fac.tags.some(t => t.toLowerCase().includes(query))
                );
            });

            document.getElementById("resultsCount").textContent = \`検索結果：\${filtered.length} 件\`;

            if (filtered.length === 0) {
                listContainer.innerHTML = \`
                    <p style="text-align: center; color: var(--text-sub); padding: 40px 0;">
                        「\${query}」に該当する相談窓口が見つかりませんでした。<br>
                        別の地名やひらがな（例：しながわ、東大阪）でお試しいただくか、最下部の全国共通窓口へご相談ください。
                    </p>
                \`;
                return;
            }

            filtered.forEach(fac => {
                const card = document.createElement("div");
                card.className = "facility-card";

                const timeStatus = evaluateStatus(fac.hours);
                const statusClass = timeStatus.status === "open" ? "status-open" : "status-closed";

                let scriptText = "「生活が苦しくて相談したいです。ソーシャルワーカーさん（自立相談支援窓口）に繋いでいただけますか？」";
                if (fac.tags.includes("DV避難") || fac.tags.includes("DV")) {
                    scriptText = "「家族の暴力から今すぐに避難したくてお電話しました。担当の相談員さんにお繋ぎいただけますか？」";
                } else if (fac.tags.includes("介護") || fac.tags.includes("高齢者")) {
                    scriptText = "「介護が限界に達してしまっており、助けていただきたくてお電話しました。地域包括支援センターの担当さんにお繋ぎください」";
                } else if (fac.tags.includes("借金") || fac.tags.includes("貸付")) {
                    scriptText = "「生活保護や福祉資金の貸付について、相談員の方に詳しいお話をお聞きしたく、お電話しました」";
                }

                let linksHTML = \`<a href="tel:\${fac.tel.replace(/-/g, '')}" class="action-btn btn-tel">📞 電話する</a>\`;
                if (fac.official_url) {
                    linksHTML += \`<a href="\${fac.official_url}" target="_blank" class="action-btn btn-url">🌐 公式サイト</a>\`;
                }
                if (fac.mail) {
                    linksHTML += \`<a href="mailto:\${fac.mail}" class="action-btn btn-mail">✉️ メール</a>\`;
                }
                if (fac.form_url) {
                    linksHTML += \`<a href="\${fac.form_url}" target="_blank" class="action-btn btn-form">📝 フォーム</a>\`;
                }

                card.innerHTML = \`
                    <div class="facility-header">
                        <p class="facility-name">\${fac.name}</p>
                        <span class="status-badge \${statusClass}">\${timeStatus.text}</span>
                    </div>
                    <p style="font-size:0.8rem; color:var(--primary); margin: -5px 0 10px 0;">
                        📍 \${fac.prefecture} \${fac.city} / \${fac.tags.map(t => "#" + t).join(" ")}
                    </p>
                    <div class="facility-info">
                        <div class="info-row"><span class="info-label">所在地:</span><span class="info-value">\${fac.address}</span></div>
                        <div class="info-row"><span class="info-label">開所時間:</span><span class="info-value">\${fac.hours}</span></div>
                        <div class="info-row"><span class="info-label">情報確認日:</span><span class="info-value" style="color:var(--primary);">📅 \${fac.last_verified}</span></div>
                    </div>
                    <div class="makaroko-box">
                        <div class="makaroko-title">📞 お電話がつながったら、そのままこれを読み上げてください</div>
                        <div class="makaroko-script">"\${scriptText}"</div>
                    </div>
                    <div class="action-links">
                        \${linksHTML}
                    </div>
                \`;
                listContainer.appendChild(card);
            });
        }
    </script>
</body>
</html>`;
}
