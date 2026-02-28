# テスト観点表

## config.py

| Case ID | Input / Precondition | Perspective | Expected Result | Notes |
|---------|----------------------|-------------|-----------------|-------|
| TC-N-01 | OPENAI_API_KEY が設定されている | Equivalence – normal | get_openai_api_key() がキーを返す | - |
| TC-A-01 | OPENAI_API_KEY が未設定 | Boundary – NULL/空 | ValueError が発生 | - |
| TC-A-02 | OPENAI_API_KEY が空文字 | Boundary – 空 | ValueError が発生 | - |
| TC-N-02 | PORT が未設定 | Equivalence – default | get_port() が 8000 を返す | - |
| TC-N-03 | PORT=3000 が設定 | Equivalence – normal | get_port() が 3000 を返す | - |

## services/llm.py (chat_completion)

| Case ID | Input / Precondition | Perspective | Expected Result | Notes |
|---------|----------------------|-------------|-----------------|-------|
| TC-N-01 | 有効な user_message、API 成功 | Equivalence – normal | 応答テキストを返す | モック使用 |
| TC-A-01 | API がエラーを返す | 異常系 | openai.APIError が伝播 | モック使用 |
| TC-B-01 | user_message が空文字 | Boundary – 空 | API は呼ばれ、応答は空の可能性 | - |

## services/stt.py (transcribe)

| Case ID | Input / Precondition | Perspective | Expected Result | Notes |
|---------|----------------------|-------------|-----------------|-------|
| TC-N-01 | 有効な audio tuple | Equivalence – normal | テキストを返す | モック使用 |
| TC-A-01 | STT が例外を投げる | 異常系 | 空文字を返す | - |
| TC-A-02 | STT が None を返す | Boundary – NULL | 空文字を返す | - |

## services/tts.py (generate_audio_chunks)

| Case ID | Input / Precondition | Perspective | Expected Result | Notes |
|---------|----------------------|-------------|-----------------|-------|
| TC-N-01 | 有効な text | Equivalence – normal | (sample_rate, np.ndarray) のリストを返す | モック使用 |
| TC-A-01 | TTS が例外を投げる | 異常系 | 例外が伝播 | モック使用 |
| TC-B-01 | text が空文字 | Boundary – 空 | 空または短い音声を返す可能性 | - |
