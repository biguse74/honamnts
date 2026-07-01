const UNIT_PRICE = 30000
const DELIVERY_FEE = 3000
const FREE_DELIVERY_FROM_QTY = 3
const DEFAULT_PAY_METHOD = '무통장'
const PHONE_RE = /^010-\d{4}-\d{4}$/
const MAX_BODY_BYTES = 64 * 1024

const REQUIRED_FIELDS = [
  'name',
  'phone',
  'member',
  'qty',
  'zip',
  'addr',
  'addrDetail',
  'payer',
  'receipt',
  'agree',
]

const FORBIDDEN_CLIENT_FIELDS = ['orderNo', 'createdAt', 'amount', 'payStatus']

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url)

      if (request.method === 'OPTIONS') return noContent()
      if (request.method !== 'POST' || url.pathname !== '/api/order') {
        return json({ message: 'Not found' }, 404)
      }
      if (!env.APPS_SCRIPT_WEB_APP_URL) {
        return json({ message: '주문 서버 설정이 완료되지 않았습니다.' }, 503)
      }

      const payload = await readJsonBody(request)
      const cleanPayload = sanitizeOrderPayload(payload)
      validateOrderPayload(cleanPayload, payload)

      const result = await submitToAppsScript(cleanPayload, env)
      if (!isSubmitOrderResult(result)) {
        throw publicError('주문 접수 응답 형식이 올바르지 않습니다.', 502)
      }

      return json(result, 200)
    } catch (err) {
      console.error(JSON.stringify({ message: 'order worker failed', error: publicMessage(err) }))
      return json({ message: publicMessage(err) }, err.statusCode || 400)
    }
  },
}

function calculateShipping(qty) {
  return qty >= FREE_DELIVERY_FROM_QTY ? 0 : DELIVERY_FEE
}

function calculateAmount(qty) {
  return UNIT_PRICE * qty + calculateShipping(qty)
}

function sanitizeOrderPayload(payload) {
  return {
    name: trim(payload?.name),
    phone: normalizePhone(payload?.phone),
    email: trim(payload?.email),
    member: trim(payload?.member),
    qty: Number(payload?.qty),
    signed: payload?.signed === true,
    receiver: trim(payload?.receiver),
    zip: trim(payload?.zip),
    addr: trim(payload?.addr),
    addrDetail: trim(payload?.addrDetail),
    deliverNote: trim(payload?.deliverNote),
    payer: trim(payload?.payer),
    receipt: trim(payload?.receipt),
    message: trim(payload?.message),
    agree: payload?.agree === true,
    payMethod: trim(payload?.payMethod) || DEFAULT_PAY_METHOD,
  }
}

function validateOrderPayload(cleanPayload, originalPayload) {
  FORBIDDEN_CLIENT_FIELDS.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(originalPayload || {}, key)) {
      throw publicError(`${key}는 서버에서 생성/계산합니다.`)
    }
  })

  REQUIRED_FIELDS.forEach((key) => {
    if (key === 'agree') {
      if (cleanPayload.agree !== true) throw publicError('개인정보 수집·이용 동의가 필요합니다.')
      return
    }
    if (key === 'qty') {
      if (!Number.isInteger(cleanPayload.qty) || cleanPayload.qty < 1 || cleanPayload.qty > 10) {
        throw publicError('수량은 1권부터 10권까지 가능합니다.')
      }
      return
    }
    if (!cleanPayload[key]) throw publicError('필수 항목을 확인해 주세요.')
  })

  if (!PHONE_RE.test(cleanPayload.phone)) throw publicError('연락처는 010-0000-0000 형식이어야 합니다.')
  if (cleanPayload.member !== '회원' && cleanPayload.member !== '비회원') {
    throw publicError('회원 여부 값이 올바르지 않습니다.')
  }
  if (
    cleanPayload.receipt !== '불필요' &&
    cleanPayload.receipt !== '현금영수증' &&
    cleanPayload.receipt !== '세금계산서'
  ) {
    throw publicError('증빙 값이 올바르지 않습니다.')
  }
  if (cleanPayload.payMethod !== DEFAULT_PAY_METHOD) {
    throw publicError('카드 결제는 2단계 PG 연동 후 가능합니다.')
  }

  calculateAmount(cleanPayload.qty)
}

async function submitToAppsScript(payload, env) {
  const url = new URL(env.APPS_SCRIPT_WEB_APP_URL)
  if (env.APPS_SCRIPT_API_SECRET) url.searchParams.set('secret', env.APPS_SCRIPT_API_SECRET)

  let response
  try {
    response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw publicError('주문 저장 서버에 연결하지 못했습니다.', 502)
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) throw publicError(messageFrom(data) || '주문 저장에 실패했습니다.', 502)
  if (messageFrom(data)) throw publicError(messageFrom(data))
  return data
}

async function readJsonBody(request) {
  const contentType = request.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw publicError('Content-Type은 application/json이어야 합니다.')
  }

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_BODY_BYTES) throw publicError('요청 본문이 너무 큽니다.', 413)

  try {
    return await request.json()
  } catch {
    throw publicError('JSON 형식이 올바르지 않습니다.')
  }
}

function isSubmitOrderResult(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    value.ok === true &&
    typeof value.orderNo === 'string' &&
    /^HB-\d{4,}$/.test(value.orderNo)
  )
}

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('010')) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  return trim(value)
}

function trim(value) {
  return String(value == null ? '' : value).trim()
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

function noContent() {
  return new Response(null, {
    status: 204,
    headers: { 'Cache-Control': 'no-store' },
  })
}

function publicError(message, statusCode = 400) {
  const err = new Error(message)
  err.statusCode = statusCode
  return err
}

function publicMessage(err) {
  return err?.message || '요청 처리 중 오류가 발생했습니다.'
}

function messageFrom(value) {
  if (typeof value === 'object' && value !== null && typeof value.message === 'string') return value.message
  return ''
}
