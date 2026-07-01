// 다음(카카오) 우편번호 서비스 로더 + 타입.
// zip(zonecode)·addr(roadAddress) 자동완성용. addrDetail 은 사용자가 수기 입력.

export interface DaumPostcodeData {
  zonecode: string // 우편번호 (5자리)
  roadAddress: string // 도로명 주소
  jibunAddress: string // 지번 주소
  address: string // 기본 주소
  buildingName: string
  apartment: 'Y' | 'N'
}

interface DaumPostcode {
  open: () => void
}

interface DaumPostcodeOptions {
  oncomplete: (data: DaumPostcodeData) => void
  onclose?: () => void
  width?: string | number
  height?: string | number
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: DaumPostcodeOptions) => DaumPostcode
    }
  }
}

const SCRIPT_SRC =
  'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'

let loader: Promise<void> | null = null

/** 다음 우편번호 스크립트를 (한 번만) 로드한다. */
export function loadDaumPostcode(): Promise<void> {
  if (typeof window !== 'undefined' && window.daum?.Postcode) {
    return Promise.resolve()
  }
  if (loader) return loader

  loader = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      loader = null
      reject(new Error('우편번호 서비스를 불러오지 못했습니다.'))
    }
    document.head.appendChild(script)
  })

  return loader
}

/** 우편번호 검색창을 열고, 선택 결과를 콜백으로 돌려준다. */
export async function openPostcodeSearch(
  onComplete: (data: DaumPostcodeData) => void,
): Promise<void> {
  await loadDaumPostcode()
  if (!window.daum?.Postcode) {
    throw new Error('우편번호 서비스를 사용할 수 없습니다.')
  }
  new window.daum.Postcode({ oncomplete: onComplete }).open()
}
