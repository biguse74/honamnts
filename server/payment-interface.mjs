/**
 * Phase 2 payment boundary for PortOne/TossPayments-style PG integration.
 *
 * This module intentionally avoids vendor SDK calls. A provider adapter must verify the
 * approval callback server-side before payStatus is updated.
 */

export const PAYMENT_STATUSES = Object.freeze({
  pending: '대기',
  paid: '입금확인',
  canceled: '취소',
})

export const PAYMENT_METHODS = Object.freeze({
  bankTransfer: '무통장',
  card: '카드',
})

/**
 * @typedef {Object} PaymentOrder
 * @property {string} orderNo
 * @property {number} amount
 * @property {"무통장"|"카드"} payMethod
 * @property {string} name
 * @property {string} phone
 * @property {string} [email]
 */

/**
 * @typedef {Object} PaymentProviderAdapter
 * @property {(order: PaymentOrder) => Promise<{ ok:true, paymentId:string, redirectUrl?:string }>} requestPayment
 * @property {(callbackPayload: unknown) => Promise<{ ok:true, orderNo:string, amount:number, paymentId:string }>} verifyApproval
 */

/**
 * @typedef {Object} OrderStore
 * @property {(orderNo: string) => Promise<PaymentOrder & { payStatus:string }>} findByOrderNo
 * @property {(orderNo: string, payStatus: string, meta?: Record<string, unknown>) => Promise<void>} updatePayStatus
 */

/**
 * Starts a card payment. Phase 1 must keep using "무통장"; this accepts only card orders.
 *
 * @param {PaymentOrder} order
 * @param {PaymentProviderAdapter} provider
 */
export async function pay(order, provider) {
  const request = sanitizePaymentOrder(order)
  if (request.payMethod !== PAYMENT_METHODS.card) {
    throw publicPaymentError('카드 결제 요청만 PG로 보낼 수 있습니다.')
  }
  if (!provider || typeof provider.requestPayment !== 'function') {
    throw publicPaymentError('PG 어댑터가 설정되지 않았습니다.')
  }

  return provider.requestPayment(request)
}

/**
 * Handles the provider approval callback.
 * The order is marked paid only after provider verification and amount reconciliation.
 *
 * @param {unknown} callbackPayload
 * @param {PaymentProviderAdapter} provider
 * @param {OrderStore} orderStore
 */
export async function handlePaymentApproval(callbackPayload, provider, orderStore) {
  if (!provider || typeof provider.verifyApproval !== 'function') {
    throw publicPaymentError('PG 승인 검증 어댑터가 설정되지 않았습니다.')
  }
  if (!orderStore || typeof orderStore.findByOrderNo !== 'function') {
    throw publicPaymentError('주문 저장소가 설정되지 않았습니다.')
  }

  const approval = await provider.verifyApproval(callbackPayload)
  const order = await orderStore.findByOrderNo(approval.orderNo)

  if (!order) throw publicPaymentError('주문번호를 찾을 수 없습니다.')
  if (Number(order.amount) !== Number(approval.amount)) {
    throw publicPaymentError('승인 금액이 주문 금액과 다릅니다.')
  }
  if (order.payStatus === PAYMENT_STATUSES.canceled) {
    throw publicPaymentError('취소된 주문은 입금확인으로 변경할 수 없습니다.')
  }

  await orderStore.updatePayStatus(order.orderNo, PAYMENT_STATUSES.paid, {
    paymentId: approval.paymentId,
    providerVerifiedAt: new Date().toISOString(),
  })

  return { ok: true, orderNo: order.orderNo, payStatus: PAYMENT_STATUSES.paid }
}

function sanitizePaymentOrder(order) {
  const request = {
    orderNo: String(order?.orderNo || '').trim(),
    amount: Number(order?.amount),
    payMethod: String(order?.payMethod || '').trim(),
    name: String(order?.name || '').trim(),
    phone: String(order?.phone || '').trim(),
    email: String(order?.email || '').trim(),
  }

  if (!/^HB-\d{4,}$/.test(request.orderNo)) throw publicPaymentError('주문번호 형식이 올바르지 않습니다.')
  if (!Number.isInteger(request.amount) || request.amount <= 0) {
    throw publicPaymentError('결제 금액이 올바르지 않습니다.')
  }
  if (!request.name || !request.phone) throw publicPaymentError('결제자 정보가 부족합니다.')

  return request
}

function publicPaymentError(message) {
  const err = new Error(message)
  err.expose = true
  return err
}
