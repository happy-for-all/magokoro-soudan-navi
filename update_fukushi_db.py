import os
import requests
import pandas as pd
import json
import sys  # 👑 エラーを正しくActionsに伝えるために追加
from datetime import datetime, timezone, timedelta

# ==========================================
// 👑 福祉架け橋OS: データベース更新エンジン（Ver 1.2.2 堅牢版）
// 開発者: ちゃろ ＆ AIバディ
# ==========================================

CONFIG_FILE = "config.json"
MASTER_CSV = "fukushi_master.csv"
OUTPUT_JSON = "fukushi_db.json"
JST = timezone(timedelta(hours=9))

def load_config():
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def fetch_data_with_fallback(urls):
    """👑 改善: 行政のURLが変更（リンク切れ）になっても、予備URLを上から自動巡回する多重フォールバック"""
    for idx, url in enumerate(urls):
        try:
            print(f"📡 [データ取得試行] ソースURL ({idx+1}/{len(urls)}): {url}")
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                print(f"🎉 データの取得に成功しました！ URL: {url}")
                with open("temp_fukushi.csv", "wb") as f:
                    f.write(response.content)
                return "temp_fukushi.csv"
        except Exception as e:
            print(f"[警告] ソースURL ({url}) の取得に失敗しました。原因: {e}")
            
    if os.path.exists(MASTER_CSV):
        print(f"🛡️ [最終防衛フォールバック] ネット上のURLがすべて全滅したため、安全のために『{MASTER_CSV}（ローカル固定マスター）』からデータベースを構築します。")
        return MASTER_CSV
        
    return None

def main():
    print("==========================================")
    print("🌸 福祉架け橋OS 『まごころ相談ナビ』 DBビルド")
    print("==========================================")
    
    config = load_config()
    urls = config["system_config"]["fukushi_source_urls"]
    
    csv_file = fetch_data_with_fallback(urls)
    
    if csv_file is None:
        print("❌ [致命的エラー] すべてのデータソースおよび固定マスターCSVの読み込みに失敗しました。現在のデータを保護するため、書き出しを安全にスキップして早期終了します。")
        sys.exit(1) # 👑 処理が空振りした場合はActions側を正しくエラーで止めます

    try:
        # 👑 改善: ExcelのShift_JISやBOM付きUTF-8など、どんな文字コードで保存されたCSVでも自動で判別して読み込む超堅牢設計
        df = None
        encodings = ["utf-8-sig", "shift_jis", "cp932", "utf-8"]
        for enc in encodings:
            try:
                print(f"📖 CSVをエンコーディング '{enc}' で読み込みを試みています...")
                df = pd.read_csv(csv_file, encoding=enc)
                print(f"🟢 '{enc}' での読み込みに成功しました！")
                break
            except Exception as e:
                print(f"⚠️ '{enc}' での読み込みはスキップされました（原因: {e}）")
                continue

        if df is None:
            raise ValueError("すべての主要エンコーディングでCSVを読み込むことができませんでした。ファイルの文字コードを確認してください。")
        
        required_cols = {
            "都道府県名": "prefecture",
            "市区町村名": "city",
            "施設名称": "name",
            "住所": "address",
            "電話番号": "tel",
            "開所時間": "hours",
            "メールアドレス": "mail",
            "相談フォームURL": "form_url",
            "公式サイトURL": "official_url",
            "対象相談タグ": "tags"
        }
        
        df_cleaned = pd.DataFrame()
        for jp_col, en_col in required_cols.items():
            if jp_col in df.columns:
                df_cleaned[en_col] = df[jp_col]
            else:
                if en_col == "hours":
                    df_cleaned[en_col] = "平日 08:30-17:15"
                elif en_col == "tags":
                    df_cleaned[en_col] = "生活困窮, 家賃支援"
                else:
                    df_cleaned[en_col] = "-"
                    
        df_cleaned = df_cleaned.fillna("-")
        
        facilities = []
        now_date = datetime.now(JST).strftime('%Y-%m-%d')
        
        for _, row in df_cleaned.iterrows():
            tags_list = [t.strip() for t in str(row["tags"]).split(",") if t.strip()]
            if not tags_list:
                tags_list = ["生活困窮"]
                
            facilities.append({
                "prefecture": str(row["prefecture"]),
                "city": str(row["city"]),
                "name": str(row["name"]),
                "address": str(row["address"]),
                "tel": str(row["tel"]),
                "mail": str(row["mail"]) if str(row["mail"]) != "-" else "",
                "form_url": str(row["form_url"]) if str(row["form_url"]) != "-" else "",
                "official_url": str(row["official_url"]) if str(row["official_url"]) != "-" else "",
                "hours": str(row["hours"]),
                "last_verified": now_date,
                "tags": tags_list
            })
            
        output_data = {
            "version": "1.2.0",
            "updated_at": datetime.now(JST).strftime('%Y-%m-%d %H:%M:%S'),
            "national_services": config["national_services"],
            "facilities": facilities
        }
        
        with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
            
        print(f"🎉 [ビルド大成功] 全 {len(facilities)} 件の窓口データを格納した最新の '{OUTPUT_JSON}' が完成しました！")
        
    except Exception as e:
        print(f"❌ [ビルド失敗] データ処理中にエラーが発生しました: {e}")
        sys.exit(1) # 👑 失敗した時はActionsをここでエラー停止させ、ログを吐き出させます
    finally:
        if os.path.exists("temp_fukushi.csv"):
            os.remove("temp_fukushi.csv")

if __name__ == "__main__":
    main()
