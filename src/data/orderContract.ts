export const ORDER_SCHEMA_KEYS = [
  'orderNo',
  'createdAt',
  'name',
  'phone',
  'email',
  'member',
  'qty',
  'signed',
  'receiver',
  'zip',
  'addr',
  'addrDetail',
  'deliverNote',
  'payer',
  'receipt',
  'message',
  'agree',
  'amount',
  'payMethod',
  'payStatus',
] as const

export const MEMBERS = ['회원', '비회원'] as const
export const RECEIPTS = ['불필요', '현금영수증', '세금계산서'] as const
export const PAY_METHODS = ['무통장', '카드'] as const
export const PAY_STATUSES = ['대기', '입금확인', '취소'] as const

export type Member = (typeof MEMBERS)[number]
export type Receipt = (typeof RECEIPTS)[number]
export type PayMethod = (typeof PAY_METHODS)[number]
export type PayStatus = (typeof PAY_STATUSES)[number]

export interface OrderRecord {
  orderNo: string
  createdAt: string
  name: string
  phone: string
  email: string
  member: Member
  qty: number
  signed: boolean
  receiver: string
  zip: string
  addr: string
  addrDetail: string
  deliverNote: string
  payer: string
  receipt: Receipt
  message: string
  agree: boolean
  amount: number
  payMethod: PayMethod
  payStatus: PayStatus
}

export type OrderPayload = Omit<OrderRecord, 'orderNo' | 'createdAt' | 'amount' | 'payStatus'> & {
  orderNo?: never
  createdAt?: never
  amount?: never
  payStatus?: never
}

export type OrderFieldErrors = Partial<Record<keyof OrderPayload, string>>

export const ORDER_CONTRACT = {
  product: {
    title: '불의 고리',
    eyebrow: '판매 중',
    subtitle: '지금 주문하시면 초판을 보내드립니다.',
    unitPrice: 29000,
    heroImage: '/assets/ring-of-fire-book.png',
  },
  delivery: {
    fee: 5000,
    freeFromQty: 999,
    policyLabel: '택배비 5,000원',
  },
  bank: {
    bank: '우리은행',
    number: '1005-704-736089',
    holder: '주식회사 시민언론뉴탐사',
    needsConfirmation: false,
  },
  defaults: {
    member: '비회원' as Member,
    receipt: '불필요' as Receipt,
    payMethod: '무통장' as PayMethod,
    payStatus: '대기' as PayStatus,
  },
  orderNo: {
    prefix: 'HB',
    sample: 'HB-0001',
  },
  copy: {
    formTitle: '주문서',
    formLead: '필수 정보와 배송지를 입력하면 주문번호가 발급됩니다.',
    depositInstruction: '입금자명 뒤 orderNo 기재',
    pendingPg: '카드 결제는 2단계 PG 연동 후 활성화됩니다.',
    serverBoundary: 'submitOrder(payload) -> { ok:true, orderNo }',
    privacyAgreement: '주문 접수와 배송 안내를 위해 입력한 개인정보를 수집·이용하는 데 동의합니다.',
  },
} as const

const PHONE_PATTERN = /^010-\d{4}-\d{4}$/
const KST_OFFSET_MINUTES = 9 * 60

export function formatMoney(value: number) {
  return `${value.toLocaleString('ko-KR')}원`
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('010')) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  return value.trim()
}

export function calculateShipping(qty: number) {
  return qty >= ORDER_CONTRACT.delivery.freeFromQty ? 0 : ORDER_CONTRACT.delivery.fee
}

export function calculateAmount(qty: number) {
  return ORDER_CONTRACT.product.unitPrice * qty + calculateShipping(qty)
}

export function getKoreanIsoTimestamp(date = new Date()) {
  const kst = new Date(date.getTime() + KST_OFFSET_MINUTES * 60 * 1000)
  return `${kst.toISOString().slice(0, 19)}+09:00`
}

export function getInitialOrderPayload(): OrderPayload {
  return {
    name: '',
    phone: '',
    email: '',
    member: ORDER_CONTRACT.defaults.member,
    qty: 1,
    signed: false,
    receiver: '',
    zip: '',
    addr: '',
    addrDetail: '',
    deliverNote: '',
    payer: '',
    receipt: ORDER_CONTRACT.defaults.receipt,
    message: '',
    agree: false,
    payMethod: ORDER_CONTRACT.defaults.payMethod,
  }
}

export function sanitizeOrderPayload(payload: OrderPayload): OrderPayload {
  return {
    ...payload,
    name: payload.name.trim(),
    phone: normalizePhone(payload.phone),
    email: payload.email.trim(),
    receiver: payload.receiver.trim(),
    zip: payload.zip.trim(),
    addr: payload.addr.trim(),
    addrDetail: payload.addrDetail.trim(),
    deliverNote: payload.deliverNote.trim(),
    payer: payload.payer.trim(),
    message: payload.message.trim(),
    qty: Number(payload.qty),
    signed: payload.signed === true,
    agree: payload.agree === true,
  }
}

export function validateOrderPayload(payload: Partial<OrderPayload>) {
  const errors: OrderFieldErrors = {}
  const qty = Number(payload.qty)
  const phone = normalizePhone(String(payload.phone ?? ''))

  if (!String(payload.name ?? '').trim()) errors.name = '주문자명을 입력해 주세요.'
  if (!PHONE_PATTERN.test(phone)) errors.phone = '010-0000-0000 형식으로 입력해 주세요.'
  if (payload.member !== '회원' && payload.member !== '비회원') {
    errors.member = '회원 여부를 선택해 주세요.'
  }
  if (!Number.isInteger(qty) || qty < 1 || qty > 10) {
    errors.qty = '수량은 1권부터 10권까지 가능합니다.'
  }
  if (!String(payload.zip ?? '').trim()) errors.zip = '우편번호를 검색해 주세요.'
  if (!String(payload.addr ?? '').trim()) errors.addr = '도로명 주소를 입력해 주세요.'
  if (!String(payload.addrDetail ?? '').trim()) errors.addrDetail = '상세주소를 입력해 주세요.'
  if (!String(payload.payer ?? '').trim()) errors.payer = '입금자명을 입력해 주세요.'
  if (
    payload.receipt !== '불필요' &&
    payload.receipt !== '현금영수증' &&
    payload.receipt !== '세금계산서'
  ) {
    errors.receipt = '증빙 방식을 선택해 주세요.'
  }
  if (payload.agree !== true) errors.agree = '개인정보 수집·이용에 동의해 주세요.'
  if (payload.payMethod !== '무통장' && payload.payMethod !== '카드') {
    errors.payMethod = '결제 방식을 선택해 주세요.'
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
  }
}

export function createOrderRecord(
  payload: OrderPayload,
  orderNo: string,
  createdAt = getKoreanIsoTimestamp(),
): OrderRecord {
  const cleanPayload = sanitizeOrderPayload(payload)
  const validation = validateOrderPayload(cleanPayload)
  if (!validation.ok) {
    throw new Error(Object.values(validation.errors)[0] ?? '주문 정보를 확인해 주세요.')
  }

  return {
    orderNo,
    createdAt,
    ...cleanPayload,
    amount: calculateAmount(cleanPayload.qty),
    payStatus: ORDER_CONTRACT.defaults.payStatus,
  }
}
