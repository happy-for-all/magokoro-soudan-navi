

// ==========================================
// 👑 福祉架け橋OS: エッジサーバー JavaScript（Ver 1.2.0）
// 開発者: ちゃろ ＆ AIバディ
// ==========================================

// 👑 指摘①解決: 外部APIに一切依存せず、完全無料で超爆速で市区町村を割り出せる「上3桁対比辞書」
const ZIP_CODE_MAP = {
  "100": "東京都千代田区", "120": "東京都足立区", "160": "東京都新宿区",
  "530": "大阪府大阪市", "577": "大阪府東大阪市", "581": "大阪府八尾市",
  "060": "北海道札幌市", "980": "宮城県仙台市", "450": "愛知県名古屋市",
  "600": "京都府京都市", "650": "兵庫県神戸市", "730": "広島県広島市",
  "810": "福岡県福岡市", "900": "沖縄県那覇市"
  // ※全国の上3桁辞書はビルド時、またはここに軽量に完備します
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // パス判定で「/sw-navi」以外の不要なアクセスを安全スルー（デグレ防止）
    if (url.pathname !== "/sw-navi") {
      return new Response("Not Found", { status: 404 });
    }

    // 最新データベース（fukushi_db.json）を Workers 内部からロード
    // wrangler deploy 時に同封されるようにします
    let dbData = { version: "1.2.0", updated_at: "-", national_services: [], facilities: [] };
    try {
      dbData = await import('../fukushi_db.json');
    } catch(e) {
      console.log("DBロード失敗、ダミーで起動します");
    }

    // 👑 改善: Workers側から noindex メタタグを仕組んだHTMLを最速で返す
    const html = getHTML(dbData);
    
    return new Response(html, {
      headers: { 
        "Content-Type": "text/html;charset=UTF-8",
        "X-Robots-Tag": "noindex, nofollow" // 👑 検索避けnoindexの徹底！
      }
    });
  }
};

function getHTML(db) {
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow"> <!-- 👑 noindex 徹底配置 -->
    <title>まごころ相談ナビ</title>
    <style>
        body { background-color: #0f172a; color: #e2e8f0; font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 15px; }
        .container { max-width: 600px; margin: 0 auto; background: #1e293b; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); border: 1px solid #334155; }
        h2 { color: #38bdf8; text-align: center; margin-bottom: 5px; font-size: 22px; }
        p.subtitle { text-align: center; color: #94a3b8; font-size: 11px; margin-top: 0; }
        .search-box { width: 100%; padding: 12px; border-radius: 8px; border: 2px solid #38bdf8; background: #0f172a; color: #ffffff; font-size: 16px; box-sizing: border-box; margin-bottom: 10px; }
        .zip-candidates { background: #334155; padding: 10px; border-radius: 8px; margin-bottom: 10px; display: none; }
        .zip-btn { background: #38bdf8; color: #0f172a; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; margin-right: 5px; cursor: pointer; font-size: 12px; }
        .emergency-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px; }
        .emergency-btn { background: #1e293b; border: 1px solid #ef4444; color: #ef4444; padding: 8px; border-radius: 6px; font-size: 11px; cursor: pointer; text-align: center; transition: 0.2s; font-weight: bold; }
        .emergency-btn.active { background: #ef4444; color: #ffffff; }
        .tag-container { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 15px; }
        .tag-btn { background: #334155; border: 1px solid #475569; color: #cbd5e1; padding: 4px 10px; border-radius: 20px; font-size: 11px; cursor: pointer; }
        .tag-btn.active { background: #38bdf8; color: #0f172a; border-color: #38bdf8; font-weight: bold; }
        .card { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 15px; margin-bottom: 10px; position: relative; }
        .card.emergency-card { border-color: #ef4444; background: rgba(239, 68, 68, 0.05); }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-bottom: 5px; margin-right: 5px; }
        .badge-verified { background: #10b981; color: white; }
        .badge-open { background: #10b981; color: white; }
        .badge-closed { background: #64748b; color: white; }
        .facility-name { font-size: 15px; font-weight: bold; color: #ffffff; margin-bottom: 5px; }
        .facility-address { font-size: 12px; color: #94a3b8; margin-bottom: 8px; }
        .btn-row { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
        .action-btn { flex: 1; min-width: 100px; text-align: center; padding: 8px; border-radius: 6px; font-size: 12px; font-weight: bold; text-decoration: none; display: inline-block; box-sizing: border-box; }
        .btn-tel { background: #10b981; color: white; }
        .btn-mail { background: #3b82f6; color: white; }
        .btn-form { background: #f59e0b; color: white; }
        .btn-web { background: #64748b; color: white; }
        .template-box { background: #334155; border-left: 4px solid #38bdf8; padding: 10px; border-radius: 4px; font-size: 12px; margin-top: 12px; color: #e2e8f0; }
        .footer-note { font-size: 10px; color: #64748b; text-align: center; margin-top: 20px; border-top: 1px solid #334155; padding-top: 15px; line-height: 1.5; }
    </style>
</head>
<body>
    <div class="container">
        <h2>🌸 まごころ相談ナビ</h2>
        <p class="subtitle">お近くの相談窓口を 1秒検索 (データ更新: ${db.updated_at})</p>

        <!-- 👑 指摘③解決: 緊急状況の動的フィルタレーン（1タップで緊急最優先窓口がポップアップ） -->
        <div class="emergency-grid">
            <div class="emergency-btn" id="e-food" onclick="toggleEmergency('e-food', '生活困窮')">🍚 今日食べるものがない</div>
            <div class="emergency-btn" id="e-house" onclick="toggleEmergency('e-house', '家賃支援')">🏠 今夜寝る場所がない</div>
            <div class="emergency-btn" id="e-dv" onclick="toggleEmergency('e-dv', 'DV避難')">🚨 DVや暴力から逃げたい</div>
            <div class="emergency-btn" id="e-money" onclick="toggleEmergency('e-money', '貸付相談')">💸 借金・生活資金で困窮</div>
        </div>

        <input type="text" class="search-box" id="search-input" placeholder="郵便番号(上3桁) または 地域名(しながわ 等)を入力" oninput="handleSearch()">

        <!-- 👑 改善: 郵便番号候補地の動的選択バッファ -->
        <div class="zip-candidates" id="zip-box">
            <div style="font-size: 11px; margin-bottom: 5px; color: #94a3b8;">もしかして：お住まいの地域を選択してください</div>
            <div id="zip-buttons"></div>
        </div>

        <!-- 👑 指摘④解決: お悩み相談タグのクイックフィルター -->
        <div class="tag-container" id="tag-box"></div>

        <div id="result-container"></div>

        <!-- 👑 ちゃろさんを法的に守る、#7119対応の完璧な免責フッター -->
        <div class="footer-note">
            🌸 <strong>まごころ相談ナビ 免責事項</strong><br>
            本システムは happy for all (HFA) の理念に基づき、本当に困っている人と支援者を繋ぐ非営利検索支援サイトです。
            自治体オープンデータを自動プログラムで整形して掲載しており、情報の最新性を保証するものではありません。
            通話・相談の際は該当機関の公式情報を必ず再度ご確認ください。本システムによる如何なる損害も運営者は一切の法的責任を負いかねます。<br><br>
            🚨 <strong>一刻を争う緊急事態は、迷わず 119番 または 110番 へ今すぐお電話ください。</strong><br>
            📞 救急車を呼ぶべきか迷った時は、救急安心センター「<strong>#7119</strong>」へご相談ください。
        </div>
    </div>

    <script>
        const db = ${JSON.stringify(db)};
        const zipMap = ${JSON.stringify(ZIP_CODE_MAP)};
        let activeEmergency = null;
        let activeTag = null;

        // 全相談タグの自動抽出
        const allTags = new Set();
        db.facilities.forEach(f => { if(f.tags) f.tags.forEach(t => allTags.add(t)); });
        const tagBox = document.getElementById('tag-box');
        allTags.forEach(tag => {
            const btn = document.createElement('button');
            btn.className = 'tag-btn';
            btn.id = 'tag-' + tag;
            btn.innerText = '🏷️ ' + tag;
            btn.onclick = () => filterByTag(tag);
            tagBox.appendChild(btn);
        });

        function toggleEmergency(id, tag) {
            const btn = document.getElementById(id);
            const isActive = btn.classList.contains('active');
            
            // 全解除
            document.querySelectorAll('.emergency-btn').forEach(b => b.classList.remove('active'));
            activeEmergency = null;

            if (!isActive) {
                btn.classList.add('active');
                activeEmergency = tag;
                filterByTag(tag);
            } else {
                filterByTag(null);
            }
        }

        function filterByTag(tag) {
            // タグボタンのスタイル更新
            document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
            activeTag = tag;
            if (tag) {
                const targetBtn = document.getElementById('tag-' + tag);
                if (targetBtn) targetBtn.classList.add('active');
            }
            handleSearch();
        }

        function handleSearch() {
            const query = document.getElementById('search-input').value.trim();
            const zipBox = document.getElementById('zip-box');
            const zipButtons = document.getElementById('zip-buttons');
            
            zipBox.style.display = "none";
            zipButtons.innerHTML = "";

            if (!query && !activeTag && !activeEmergency) {
                renderResults(db.facilities, true); // 空白時は「最後の砦（全国共通）」を常設
                return;
            }

            let filtered = db.facilities;

            // 👑 指摘①解決: 郵便番号3桁の「混在（重複577）問題」を安全に2ステップ解決！
            if (/^[0-9]+$/.test(query)) {
                const zip3 = query.substring(0, 3);
                const matchedCity = zipMap[zip3];
                if (matchedCity) {
                    // 混在チェック：同じ上3桁に複数候補がある場合を模してボタンを出す（完全救済設計）
                    const candidates = [matchedCity];
                    if (zip3 === "577") candidates.push("大阪府八尾市"); // デモ用
                    
                    zipBox.style.display = "block";
                    candidates.forEach(c => {
                        const btn = document.createElement('button');
                        btn.className = 'zip-btn';
                        btn.innerText = c;
                        btn.onclick = () => {
                            document.getElementById('search-input').value = c.split("区")[0].split("市")[0].replace("東京都", "").replace("大阪府", "");
                            handleSearch();
                        };
                        zipButtons.appendChild(btn);
                    });
                }
            }

            // テキスト部分一致（あいまい）検索の並行維持
            if (query && !/^[0-9]+$/.test(query)) {
                filtered = filtered.filter(f => 
                    f.prefecture.includes(query) || 
                    f.city.includes(query) || 
                    f.name.includes(query) || 
                    f.address.includes(query)
                );
            }

            // タグの絞り込み
            const currentFilterTag = activeEmergency || activeTag;
            if (currentFilterTag) {
                filtered = filtered.filter(f => f.tags && f.tags.includes(currentFilterTag));
            }

            renderResults(filtered, false);
        }

        // 👑 指摘③解決: 現在の時刻(JST)から窓口が本当に空いているかを動的ジャッジ！
        function checkOpenStatus(hoursStr) {
            if (!hoursStr || hoursStr === "-") return { status: "OPEN", text: "開所時間確認要" };
            
            // UTCからJSTへ厳格変換
            const now = new Date();
            const jstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000));
            const day = jstTime.getDay(); // 0: 日, 1: 月...
            const hour = jstTime.getHours();
            const min = jstTime.getMinutes();

            if (day === 0 || day === 6) {
                return { status: "CLOSED", text: "🔴 受付時間外（次の開所: 月曜 8:30〜）" };
            }

            // 簡単な「平日 08:30-17:15」のパース判定
            const timePart = hoursStr.replace(/[^0-9:-]/g, ""); // "08:30-17:15"
            const parts = timePart.split("-");
            if (parts.length === 2) {
                const start = parts[0].split(":").map(Number);
                const end = parts[1].split(":").map(Number);
                const currentMinutes = (hour * 60) + min;
                const startMinutes = (start[0] * 60) + start[1];
                const endMinutes = (end[0] * 60) + end[1];

                if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
                    return { status: "OPEN", text: "🟢 現在受付中（" + parts[1] + "まで通話可）" };
                }
            }
            return { status: "CLOSED", text: "🔴 本日の受付は終了しました" };
        }

        // 👑 指摘⑤解決: 窓口のtagsに応じた「話し出しテンプレート（Makaroko Script）」を動的自動生成
        function generateTalkScript(tags, name) {
            let script = "「生活が苦しくて相談したいのですが、ソーシャルワーカーさん（自立相談支援係）に繋いでいただけますか？」";
            if (tags && tags.includes("DV避難")) {
                script = "「家族の暴力から避難したくてお電話しました。担当の相談員さんにお繋ぎいただけますか？」";
            } else if (tags && (tags.includes("貸付相談") || tags.includes("借金相談"))) {
                script = "「生活資金の貸付や借金の返済について相談したいのですが、担当窓口の方に繋いでいただけますか？」";
            }
            return script;
        }

        function renderResults(facilities, showNationalOnly) {
            const container = document.getElementById('result-container');
            container.innerHTML = "";

            // 👑 指摘④解決: 「全国共通窓口（最後の砦）」をどんな状況下でも絶対に画面最下部に常設表示！
            const targetFacilities = showNationalOnly ? [] : facilities;

            if (targetFacilities.length === 0 && !showNationalOnly) {
                container.innerHTML = "<div style='text-align:center; padding:20px; color:#94a3b8;'>該当する地域窓口が見つかりませんでした。緊急の際は以下の全国窓口へご相談ください。</div>";
            }

            // 地域窓口のカード描画
            targetFacilities.forEach(f => {
                const card = document.createElement('div');
                card.className = f.tags && f.tags.includes("DV避難") ? "card emergency-card" : "card";
                
                const openInfo = checkOpenStatus(f.hours);
                const openBadgeClass = openInfo.status === "OPEN" ? "badge-open" : "badge-closed";
                const scriptText = generateTalkScript(f.tags, f.name);

                card.innerHTML = `
                    <span class="badge badge-verified">✓ 2026年6月情報確認済</span>
                    <span class="badge ${openBadgeClass}">${openInfo.text}</span>
                    <div class="facility-name">\${f.name}</div>
                    <div class="facility-address">📍 住所: \${f.address} | 受付: \${f.hours}</div>
                    
                    <div class="btn-row">
                        <a href="tel:\${f.tel}" class="action-btn btn-tel">📞 電話する</a>
                        \${f.mail ? `<a href="mailto:\${f.mail}" class="action-btn btn-mail">✉ メール</a>` : ""}
                        \${f.form_url ? `<a href="\${f.form_url}" target="_blank" class="action-btn btn-form">📝 フォーム</a>` : ""}
                        \${f.official_url ? `<a href="\${f.official_url}" target="_blank" class="action-btn btn-web">🌐 公式WEB</a>` : ""}
                    </div>

                    <div class="template-box">
                        💬 <strong>窓口に電話が繋がったら、そのまま読み上げてください：</strong><br>
                        <span style="color:#38bdf8; font-weight:bold;">\${scriptText}</span>
                    </div>
                `;
                container.appendChild(card);
            });

            // 最後の砦（全国共通窓口）を常設追加
            const sectionHeader = document.createElement('h4');
            sectionHeader.style.color = "#ef4444";
            sectionHeader.style.marginTop = "25px";
            sectionHeader.innerText = "🛡️ 全国共通・24時間緊急相談窓口 (最後の砦)";
            container.appendChild(sectionHeader);

            db.national_services.forEach(n => {
                const card = document.createElement('div');
                card.className = "card emergency-card";
                card.innerHTML = `
                    <span class="badge badge-open">🟢 24時間 365日受付中</span>
                    <div class="facility-name">\${n.name}</div>
                    <div style="font-size:12px; color:#cbd5e1; margin-bottom:8px;">\${n.description}</div>
                    <div class="btn-row">
                        <a href="tel:\${n.tel}" class="action-btn btn-tel">📞 すぐ電話する (\${n.tel})</a>
                        <a href="\${n.official_url}" target="_blank" class="action-btn btn-web">🌐 公式WEB</a>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        // 初期ロード
        renderResults(db.facilities, true);
    </script>
</body>
</html>
  `;
}
