import type { OrderPayload } from '../data/orderContract'

export interface SubmitOrderResult {
  ok: true
  orderNo: string
}

type GoogleScriptRunner = {
  withSuccessHandler: (handler: (result: SubmitOrderResult) => void) => GoogleScriptRunner
  withFailureHandler: (handler: (error: unknown) => void) => GoogleScriptRunner
  submitOrder: (payload: OrderPayload) => void
}

declare global {
  interface Window {
    google?: {
      script?: {
        run?: GoogleScriptRunner
      }
    }
  }
}

export class OrderSubmissionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OrderSubmissionError'
  }
}

export async function submitOrder(payload: OrderPayload): Promise<SubmitOrderResult> {
  const appsScriptRunner = window.google?.script?.run
  if (appsScriptRunner?.submitOrder) {
    return submitViaAppsScript(appsScriptRunner, payload)
  }

  return submitViaHttp(payload)
}

function submitViaAppsScript(
  runner: GoogleScriptRunner,
  payload: OrderPayload,
): Promise<SubmitOrderResult> {
  return new Promise((resolve, reject) => {
    runner
      .withSuccessHandler((result) => {
        if (isSubmitOrderResult(result)) {
          resolve(result)
          return
        }
        reject(new OrderSubmissionError('주문 접수 응답 형식이 올바르지 않습니다.'))
      })
      .withFailureHandler((error) => reject(toSubmissionError(error)))
      .submitOrder(payload)
  })
}

async function submitViaHttp(payload: OrderPayload): Promise<SubmitOrderResult> {
  let response: Response

  try {
    response = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new OrderSubmissionError('주문 서버에 연결하지 못했습니다.')
  }

  const data = await readJson(response)

  if (!response.ok) {
    throw new OrderSubmissionError(messageFrom(data) ?? '주문 접수에 실패했습니다.')
  }

  const errorMessage = messageFrom(data)
  if (errorMessage) {
    throw new OrderSubmissionError(errorMessage)
  }

  if (!isSubmitOrderResult(data)) {
    throw new OrderSubmissionError('주문 접수 응답 형식이 올바르지 않습니다.')
  }

  return data
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function isSubmitOrderResult(value: unknown): value is SubmitOrderResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as SubmitOrderResult).ok === true &&
    typeof (value as SubmitOrderResult).orderNo === 'string'
  )
}

function toSubmissionError(error: unknown) {
  return new OrderSubmissionError(messageFrom(error) ?? '주문 접수에 실패했습니다.')
}

function messageFrom(value: unknown) {
  if (typeof value === 'object' && value !== null && 'message' in value) {
    const message = (value as { message?: unknown }).message
    return typeof message === 'string' && message.trim() ? message : null
  }
  if (value instanceof Error && value.message) return value.message
  return null
}
