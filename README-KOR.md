# Ollama 채팅 인터페이스

Ollama 언어 모델과 상호작용할 수 있는 현대적인 웹 기반 채팅 인터페이스입니다. 이 애플리케이션은 다양한 Ollama 모델과 대화할 수 있는 사용자 친화적인 인터페이스를 제공하며, 모델 선택, 온도 제어, 컨텍스트 길이 조정 및 시스템 프롬프트를 지원합니다.

## 주요 기능

- 🤖 다양한 Ollama 모델 지원
- 🌡️ 조절 가능한 temperature와 컨텍스트 길이
- 💬 프리셋 관리가 가능한 커스터마이즈 시스템 프롬프트
- 🌓 다크/라이트 테마 전환
- 📜 채팅 기록 관리
- 🔄 실시간 스트리밍 응답
- 📱 다양한 화면 크기에 대응하는 반응형 디자인

## 사전 요구사항

- [Ollama](https://ollama.ai/)가 로컬에 설치되어 실행 중이어야 함
- 최신 웹 브라우저 (Chrome, Firefox, Safari, Edge)
- 최소 하나의 Ollama 모델이 설치되어 있어야 함

## 설정 및 실행

1. 저장소 클론:
```bash
git clone https://github.com/yourusername/ollama-chat-interface.git
cd ollama-chat-interface
```

2. Ollama가 실행 중인지 확인:
```bash
ollama run llama2  # 또는 다른 모델
```

3. 중요: CORS 제한으로 인해 Chrome을 특정 플래그와 함께 실행해야 합니다:

**Windows:**
```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --disable-gpu --user-data-dir=%LOCALAPPDATA%\Google\chromeTemp
```

**macOS:**
```bash
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security
```

**Linux:**
```bash
google-chrome --disable-web-security --disable-gpu --user-data-dir=/tmp/chromeTemp
```

4. 위에서 언급한 플래그와 함께 브라우저에서 `index.html` 파일을 엽니다.

⚠️ **보안 참고사항**: 위에서 언급한 플래그들은 Chrome의 특정 보안 기능을 비활성화합니다. 이 설정은 로컬 개발 용도로만 사용됩니다. 일반적인 인터넷 브라우징 시에는 절대 이 플래그들을 사용하지 마세요.

## 프로젝트 구조

```
├── css/
│   └── styles.css          # 메인 스타일시트
├── js/
│   ├── agent.js           # Ollama API 상호작용 로직
│   ├── chat.js           # 채팅 인터페이스 관리
│   └── utils.js          # 유틸리티 함수
├── index.html            # 메인 애플리케이션 페이지
└── README.md            # 프로젝트 문서
```

## 사용법

1. 드롭다운에서 원하는 Ollama 모델 선택
2. temperature(0-2)와 컨텍스트 길이를 필요에 따라 조정
3. 선택적으로 시스템 프롬프트를 설정하거나 프리셋에서 선택
4. 메시지를 입력하고 Enter를 누르거나 전송 버튼 클릭
5. 마크다운 형식의 AI 응답을 실시간으로 확인

### 설정 패널

- **모델 선택**: 설치된 Ollama 모델 중에서 선택
- **Temperature**: 응답의 무작위성 제어 (0 = 결정적, 2 = 더 무작위적)
- **컨텍스트 길이**: 컨텍스트 창 조정 (512-8192 토큰)
- **시스템 프롬프트**: AI에 대한 사용자 지정 지침 설정
- **테마 전환**: 다크와 라이트 테마 간 전환

### 채팅 기능

- 실시간 메시지 스트리밍
- 응답에서 마크다운 지원
- 채팅 기록 관리
- 대화 초기화 옵션
- 모달 알림이 포함된 오류 처리

## 개발

### 주요 구성 요소

- **OllamaAgent**: Ollama API와의 통신 처리
- **ChatInterface**: UI 및 사용자 상호작용 관리
- **Utils**: 다양한 작업을 위한 헬퍼 함수 제공

### 오류 처리

애플리케이션에는 포괄적인 오류 처리가 포함되어 있습니다:
- Ollama 서버와의 연결 오류
- 모델 로딩 실패
- 메시지 전송 오류
- 저장소 관련 오류

### 저장소

애플리케이션은 다음을 위해 localStorage를 사용합니다:
- 테마 선호도
- 채팅 기록
- 프리셋 시스템 프롬프트
- 사용자 환경 설정

## 기여하기

1. 저장소를 포크하세요
2. 기능 브랜치를 생성하세요: `git checkout -b feature/멋진기능`
3. 변경사항을 커밋하세요: `git commit -m '멋진 기능 추가'`
4. 브랜치에 푸시하세요: `git push origin feature/멋진기능`
5. Pull Request를 열어주세요

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다 - 자세한 내용은 LICENSE 파일을 참조하세요.

## 감사의 말

- 언어 모델 백엔드를 제공하는 [Ollama](https://ollama.ai/)
- 마크다운 파싱을 위한 [Marked](https://marked.js.org/)