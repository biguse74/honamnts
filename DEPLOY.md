# 배포 가이드 — honam.newtamsa.org

호남뉴탐사 랜딩을 **honam.newtamsa.org** 서브도메인으로 올리는 방법.
newtamsa.org 가 이미 자체 nginx 서버(Ubuntu)로 돌고 있으므로, **같은 서버에 서브도메인을 추가**하는 방식이 가장 깔끔합니다.

배포할 파일: `npm run build` 결과인 **`dist/` 폴더 전체** (index.html + assets/).
또는 단일 파일 버전 `honam.html` 을 `index.html` 로 올려도 됩니다.

---

## 방법 A — 자체 nginx 서버에 직접 (추천, newtamsa.org와 동일 인프라)

### 1) DNS 레코드 추가
도메인 DNS 관리에서 서브도메인 레코드를 추가합니다.
- **A 레코드**: `honam` → newtamsa.org 서버의 IP (newtamsa.org와 같은 IP)
- (또는 **CNAME**: `honam` → `newtamsa.org`)

전파에 수 분~수십 분 소요. 확인: `ping honam.newtamsa.org` 또는 `dig honam.newtamsa.org`

### 2) 빌드 파일 업로드
로컬에서 `npm run build` 후, `dist/` 안의 내용을 서버 웹 루트로 복사합니다.
```bash
# 서버에 디렉터리 생성
ssh user@서버 'sudo mkdir -p /var/www/honam'

# dist 내용 업로드 (로컬에서 실행)
rsync -avz --delete dist/ user@서버:/tmp/honam/
ssh user@서버 'sudo rsync -a --delete /tmp/honam/ /var/www/honam/ && sudo chown -R www-data:www-data /var/www/honam'
```
(scp 로 올려도 됩니다: `scp -r dist/* user@서버:/var/www/honam/`)

### 3) nginx 서버 블록 등록
이 저장소의 [`deploy/honam.newtamsa.org.conf`](deploy/honam.newtamsa.org.conf) 를 서버에 올립니다.
```bash
sudo cp honam.newtamsa.org.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/honam.newtamsa.org.conf /etc/nginx/sites-enabled/
sudo nginx -t          # 문법 검사
sudo systemctl reload nginx
```

### 4) SSL 인증서 (HTTPS)
```bash
sudo certbot --nginx -d honam.newtamsa.org
```
certbot 이 443 블록과 인증서를 자동으로 추가/갱신합니다.

### 5) 확인
브라우저에서 https://honam.newtamsa.org 접속 → 정상 표시되면 끝.
newtamsa.org 홈페이지에서 이 주소로 링크를 걸면 됩니다.

### 재배포 (수정 후)
로컬에서 `npm run build` → 2)의 업로드만 다시 실행하면 됩니다. (index.html 은 no-cache라 즉시 반영)

---

## 방법 B — 관리형 호스팅 + 커스텀 도메인 (서버 작업 없이)

서버 SSH 작업이 부담되면 Netlify/Vercel 에 올리고 도메인만 연결:
1. `dist/` 를 Netlify(app.netlify.com/drop) 또는 Vercel 에 배포 → 임시 URL 생성
2. 대시보드에서 커스텀 도메인 `honam.newtamsa.org` 추가
3. 안내되는 **CNAME 레코드**(예: `honam` → `xxxx.netlify.app` 또는 `cname.vercel-dns.com`)를 DNS에 등록
4. SSL은 자동 발급

> 장점: 서버 설정 불필요, 자동 SSL/CDN. 단점: 외부 서비스 의존, newtamsa.org와 인프라 분리.

---

## 참고
- 카카오 채널 버튼/신청 폼은 **링크 방식**이라 도메인 등록 등 추가 설정이 필요 없습니다. 서브도메인에서 그대로 동작합니다.
- 배경 이미지는 현재 **picsum 프리뷰**입니다. 실제 사진은 `src/data/content.ts` 의 `backgrounds.*.src` 를 `cdn.newtamsa.org/...` 로 채우고 다시 빌드하세요. (`src/assets/manifest.md` 참고)
- 실제 납품 시 picsum 미사용을 원하면 `PREVIEW_BG_IMAGES = false`.
