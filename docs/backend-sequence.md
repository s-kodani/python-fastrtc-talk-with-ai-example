# バックエンド シーケンス図

本ドキュメントは [requirements.md](requirements.md) の要件に基づくバックエンドの処理シーケンスを定義する。

---

## 1. WebRTC接続確立シーケンス

フロントエンドが接続開始ボタンを押下した際の、WebRTC接続確立までの流れ。

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant FastAPI as FastAPI
    participant FastRTC as FastRTC Stream

    User->>Browser: 接続開始クリック
    Browser->>Browser: getUserMedia でマイク取得
    Browser->>Browser: RTCPeerConnection 作成
    Browser->>Browser: createOffer
    Browser->>FastAPI: POST /webrtc/offer (SDP offer)
    FastAPI->>FastRTC: offer 処理
    FastRTC->>FastRTC: 接続確立
    FastRTC-->>FastAPI: SDP answer
    FastAPI-->>Browser: SDP answer 返却
    Browser->>Browser: setRemoteDescription
    Browser->>Browser: WebRTC接続完了
    Browser-->>User: 接続済表示
```

---

## 2. 音声対話シーケンス（1ターン）

ユーザーが発話し、AIが音声で応答するまでの1ターンの処理フロー。要件 4. データフローに準拠。

```mermaid
sequenceDiagram
    participant User as ユーザー
    participant Browser as ブラウザ
    participant FastRTC as FastRTC Stream
    participant ReplyOnPause as ReplyOnPause
    participant STT as STT(moonshine)
    participant OpenAI as OpenAI API
    participant PocketTTS as Pocket-TTS

    User->>Browser: マイクで発話
    Browser->>FastRTC: 音声ストリーム送信
    FastRTC->>ReplyOnPause: 音声フレーム受信

    Note over ReplyOnPause: VADで発話終了を検知

    ReplyOnPause->>ReplyOnPause: 発話終了検知
    ReplyOnPause->>STT: 音声データ (sample_rate, np.ndarray)
    STT->>STT: 音声→テキスト変換（英語）
    STT-->>ReplyOnPause: 認識テキスト

    ReplyOnPause->>OpenAI: Chat Completions API（認識テキスト）
    OpenAI-->>ReplyOnPause: 応答テキスト

    ReplyOnPause->>PocketTTS: 応答テキスト
    PocketTTS->>PocketTTS: テキスト→音声生成（英語）
    PocketTTS-->>ReplyOnPause: 音声 (sample_rate, np.ndarray)

    loop 音声チャンクをストリーミング
        ReplyOnPause->>FastRTC: yield (sample_rate, audio_chunk)
        FastRTC->>Browser: WebRTC経由で音声送信
        Browser->>User: スピーカーで再生
    end
```

---

## 3. シーケンスの補足

### 3.1 発話終了検知（VAD）

- FastRTCの `ReplyOnPause` が内蔵するVAD（Voice Activity Detection）により、ユーザーの発話終了を自動検知する
- 検知後、それまでの音声データをまとめてSTTに渡す

### 3.2 割り込み（Interruption）

- デフォルトで `can_interrupt=True` のため、AI応答再生中にユーザーが話し始めると、応答が中断され新規ターンが開始される
- 要件上は明示されていないが、FastRTCの標準挙動として利用可能

### 3.3 エラーハンドリング

| フェーズ | 想定エラー | 対応方針 |
|---------|------------|----------|
| WebRTC接続 | 接続失敗 | フロントにエラー返却、再接続可能にする |
| STT | 認識失敗・空文字 | エラーメッセージまたは無音を返す |
| OpenAI API | APIエラー・レート制限 | エラーメッセージをTTSで読み上げ、または再接続案内 |
| Pocket-TTS | 生成失敗 | フォールバックメッセージまたは再試行 |

---

## 4. 要件との対応

| 要件（requirements.md） | 本シーケンスでの対応 |
|-------------------------|----------------------|
| 4. データフロー 1〜6 | シーケンス図 2 に反映 |
| 5.1 ReplyOnPause | 発話終了検知〜応答生成の中心として配置 |
| 5.1 STT (moonshine) | 音声→テキスト変換として配置 |
| 5.1 OpenAI API | Chat Completions として配置 |
| 5.1 Pocket-TTS | テキスト→音声変換として配置 |
| 5.1 音声形式 (sample_rate, np.ndarray) | STT入力・Pocket-TTS出力で使用 |
