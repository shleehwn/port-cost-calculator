# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Port Cost Calculator

### 선박 예상항비 계산기 (React 기반 사이드 프로젝트)

## 1. Project Overview (프로젝트 소개)

본 프로젝트는 **React 기반 웹 애플리케이션 개발 학습과 선박 예상항비(PDA, Proforma Disbursement Account) 산정 기능의 프로토타입 구현**을 목적으로 개발한 개인 사이드 프로젝트입니다.

현재는 **인천항(Incheon Port)**을 기준으로 선박 입출항에 따른 예상항비를 계산하도록 구현하였으며, PC 및 모바일 환경에서 사용할 수 있도록 반응형 UI를 적용하였습니다.

기존 선박 예상항비 산정 업무에서는 항만시설 사용료, 도선료, 예선료 등을 계산하기 위해 항만 운영기관, 도선사회, 예선업체의 요율표를 개별적으로 확인하거나 관련 사이트를 방문해야 하는 번거로움이 있었습니다.

이러한 업무 경험을 바탕으로 **여러 항목의 예상 비용을 하나의 웹 애플리케이션에서 산출하고, 계산 결과와 세부 산정 내역을 확인할 수 있도록** 구현하였습니다.

## 2. Main Features (주요 기능)

- **Port Dues (선박입출항료)**: 선박 총톤수(GT) 및 입출항 횟수를 기준으로 산출
- **Vessel Security Fee (선박보안료)**: 외항선의 총톤수 및 입출항 횟수에 따른 요금 산출
- **Berth Dues (접안료)**: 접안시간 및 선박 구분에 따른 기본료·초과료 계산
- **Pilotage (도선료)**: 도선구간 및 선박 제원에 따른 예상 도선료 계산
- **Pilot Boat Fee (도선선료)**: 도선선 이용에 따른 비용 산출
- **Tugboat (예선료)**: 예선 사용 기준 및 작업시간에 따른 예상 비용 계산
- **Anchorage Dues (정박료)**: 정박시간에 따른 기본료·초과료 계산 및 벙커링 면제 조건 적용
- **PDA Summary**: 항목별 예상 비용 및 총 예상항비 제공

## 3. Supported Ports (지원 항만)

현재는 **인천항 요율을 우선 적용**하였으며, 기타 국내 항만은 향후 확장 대상으로 검토하고 있습니다.

| 항만                    | 지원 상태   |
| ----------------------- | ----------- |
| Incheon Port (인천항)   | 지원        |
| Other Ports (기타 항만) | Coming Soon |

인천항의 항만시설 사용료, 도선료, 도선선료 및 예선료 관련 요율 자료를 참고하여 예상 비용을 산출하도록 구현하였습니다.

현재 도선구간은 팔미도 기준 구간을 중심으로 지원하며, 장안서 및 기타 도선구간은 향후 확장을 검토하고 있습니다.

**※ 본 프로젝트는 학습 및 기능 검증을 위한 프로토타입으로, 계산 결과는 참고용 예상 금액입니다. 실제 청구 금액은 적용 시점의 요율, 감면 조건 및 현장 운영 상황 등에 따라 달라질 수 있습니다.**

## 4. Tech Stack (기술 스택)

| 구분            | 기술              |
| --------------- | ----------------- |
| Frontend        | React, JavaScript |
| Build Tool      | Vite              |
| Styling         | Tailwind CSS      |
| Testing         | 수동log테스트     |
| Version Control | Git, GitHub       |

## 5. Future Enhancements (향후 개선 계획)

- 국내 주요 항만별 요율 적용 및 지원 항만 확대
- 화물입출항료(Cargo Dues) 계산 기능 추가
- 장안서 및 기타 Pilotage Route(도선구간) 지원 확대
- 선박 정보 및 운항 관련 외부 API 연동 검토
- 예상항비 산출 결과의 PDF 출력 및 다운로드 기능 검토

## 6. Getting Started (로컬 실행 방법)

```bash
git clone <repository-url>
cd port-cost-calculator
npm install
npm run dev
```

개발 서버 실행 후 터미널에 표시되는 로컬 주소로 접속하여 사용할 수 있습니다.

## 7. Build

```bash
# 프로덕션 빌드
npm run build


```

## Screenshots (화면 미리보기)

### 1. PDA Summary

![PDA Summary](public/screenshots/PDA_summary.png)

### 2. Pilotage Calculation

![Pilotage](public/screenshots/pilotage.png)

### 3. tugboat Dues

![Anchorage](public/screenshots/tugboat.png)

### 4. Vessel Info

![Anchorage](public/screenshots/vessel_info.png)
