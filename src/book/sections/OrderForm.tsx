import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  ORDER_CONTRACT,
  MEMBERS,
  RECEIPTS,
  getInitialOrderPayload,
  sanitizeOrderPayload,
  validateOrderPayload,
  calculateShipping,
  calculateAmount,
  normalizePhone,
  formatMoney,
} from '../../data/orderContract'
import type { OrderPayload, OrderFieldErrors, Member, Receipt } from '../../data/orderContract'
import { submitOrder, OrderSubmissionError } from '../../lib/submitOrder'
import type { SubmitOrderResult } from '../../lib/submitOrder'
import { openPostcodeSearch } from '../lib/daumPostcode'
import SectionHeading from '../../components/ui/SectionHeading'
import Reveal from '../../components/ui/Reveal'

const inputBase =
  'w-full rounded-lg border bg-navy-800 px-4 py-3 text-ink placeholder-mist/40 outline-none transition-colors'
const inputOk = 'border-mist/15 focus:border-gold'
const inputErr = 'border-red-400/70 focus:border-red-400'

function fieldClass(hasError: boolean) {
  return `${inputBase} ${hasError ? inputErr : inputOk}`
}

/** 라벨 + 필수 표시 + 오류 메시지 래퍼 */
function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id?: string
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-center gap-1 text-sm font-medium text-mist">
        {label}
        {required && <span className="text-gold">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-mist/45">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}

export default function OrderForm() {
  const [payload, setPayload] = useState<OrderPayload>(getInitialOrderPayload())
  const [errors, setErrors] = useState<OrderFieldErrors>({})
  const [differentReceiver, setDifferentReceiver] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitOrderResult | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [postcodeError, setPostcodeError] = useState<string | null>(null)
  const [manualAddr, setManualAddr] = useState(false)

  function set<K extends keyof OrderPayload>(key: K, value: OrderPayload[K]) {
    setPayload((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const shipping = calculateShipping(payload.qty)
  const amount = calculateAmount(payload.qty)

  function changeQty(delta: number) {
    const next = Math.min(10, Math.max(1, payload.qty + delta))
    set('qty', next)
  }

  async function onSearchPostcode() {
    setPostcodeError(null)
    try {
      await openPostcodeSearch((data) => {
        setPayload((prev) => ({ ...prev, zip: data.zonecode, addr: data.roadAddress }))
        setErrors((prev) => ({ ...prev, zip: undefined, addr: undefined }))
        window.setTimeout(() => document.getElementById('addrDetail')?.focus(), 50)
      })
    } catch (err) {
      // 스크립트 로드 실패 등 — 수기 입력으로 전환
      setManualAddr(true)
      setPostcodeError(
        err instanceof Error
          ? `${err.message} 우편번호·주소를 직접 입력해 주세요.`
          : '우편번호 서비스를 사용할 수 없어 직접 입력으로 전환했습니다.',
      )
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitError(null)

    const clean = sanitizeOrderPayload(payload)
    const { ok, errors: nextErrors } = validateOrderPayload(clean)
    setPayload(clean)
    if (!ok) {
      setErrors(nextErrors)
      const firstKey = Object.keys(nextErrors)[0]
      if (firstKey) {
        const el = document.getElementById(firstKey)
        el?.focus()
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setErrors({})
    setSubmitting(true)
    try {
      const res = await submitOrder(clean)
      setResult(res)
      window.scrollTo({ top: document.getElementById('order')?.offsetTop ?? 0, behavior: 'smooth' })
    } catch (err) {
      setSubmitError(
        err instanceof OrderSubmissionError || err instanceof Error
          ? err.message
          : '주문 접수에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="order" className="relative w-full scroll-mt-8 bg-navy-800 py-24 sm:py-32">
      <div className="container-content relative z-10">
        <SectionHeading
          eyebrow={ORDER_CONTRACT.product.eyebrow}
          title={ORDER_CONTRACT.copy.formTitle}
          className="max-w-2xl"
        />
        <Reveal>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-mist/70">
            {ORDER_CONTRACT.copy.formLead}
          </p>
        </Reveal>

        {result ? (
          <SuccessCard payload={payload} orderNo={result.orderNo} />
        ) : (
          <form onSubmit={onSubmit} noValidate className="mx-auto mt-10 max-w-2xl space-y-10">
            {/* ── 주문자 정보 ─────────────────────────────── */}
            <fieldset className="space-y-5 rounded-2xl border border-mist/10 bg-navy p-6 sm:p-8">
              <legend className="px-2 text-sm font-semibold tracking-[0.08em] text-gold">
                주문자 정보
              </legend>

              <Field id="name" label="주문자" required error={errors.name}>
                <input
                  id="name"
                  className={fieldClass(!!errors.name)}
                  value={payload.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="성함"
                />
              </Field>

              <Field
                id="phone"
                label="연락처"
                required
                error={errors.phone}
                hint="010-0000-0000 형식"
              >
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  className={fieldClass(!!errors.phone)}
                  value={payload.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  onBlur={(e) => set('phone', normalizePhone(e.target.value))}
                  placeholder="010-1234-5678"
                />
              </Field>

              <Field id="email" label="이메일" error={errors.email} hint="선택 · 주문 안내 수신용">
                <input
                  id="email"
                  type="email"
                  className={fieldClass(!!errors.email)}
                  value={payload.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="you@example.com"
                />
              </Field>

              <Field label="회원 여부" required error={errors.member}>
                <div className="flex gap-3">
                  {MEMBERS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => set('member', m as Member)}
                      className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                        payload.member === m
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-mist/15 bg-navy-800 text-mist/70 hover:border-mist/30'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </Field>
            </fieldset>

            {/* ── 주문 상품 ───────────────────────────────── */}
            <fieldset className="space-y-5 rounded-2xl border border-mist/10 bg-navy p-6 sm:p-8">
              <legend className="px-2 text-sm font-semibold tracking-[0.08em] text-gold">
                주문 상품
              </legend>

              <Field label="수량" required error={errors.qty} hint="1권 ~ 10권">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => changeQty(-1)}
                    className="h-11 w-11 rounded-lg border border-mist/15 bg-navy-800 text-xl font-bold text-mist transition-colors hover:border-gold hover:text-gold disabled:opacity-40"
                    disabled={payload.qty <= 1}
                    aria-label="수량 줄이기"
                  >
                    −
                  </button>
                  <span
                    id="qty"
                    tabIndex={-1}
                    className="w-16 text-center text-lg font-bold text-ink"
                  >
                    {payload.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => changeQty(1)}
                    className="h-11 w-11 rounded-lg border border-mist/15 bg-navy-800 text-xl font-bold text-mist transition-colors hover:border-gold hover:text-gold disabled:opacity-40"
                    disabled={payload.qty >= 10}
                    aria-label="수량 늘리기"
                  >
                    +
                  </button>
                </div>
              </Field>

              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-mist/15 bg-navy-800 p-4">
                <input
                  type="checkbox"
                  checked={payload.signed}
                  onChange={(e) => set('signed', e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-gold"
                />
                <span className="text-sm text-mist">
                  <span className="font-semibold text-ink">서명본 신청</span>
                  <span className="mt-0.5 block text-mist/60">
                    저자 서명이 담긴 책으로 받아보길 원합니다.
                  </span>
                </span>
              </label>
            </fieldset>

            {/* ── 배송지 ──────────────────────────────────── */}
            <fieldset className="space-y-5 rounded-2xl border border-mist/10 bg-navy p-6 sm:p-8">
              <legend className="px-2 text-sm font-semibold tracking-[0.08em] text-gold">
                배송지
              </legend>

              {/* 주소 정확 입력 안내 */}
              <div className="flex gap-2 rounded-lg border border-gold/30 bg-gold/5 px-4 py-3 text-sm leading-relaxed text-mist/85">
                <span className="text-gold">!</span>
                <span>
                  받으실 <span className="font-semibold text-ink">주소를 정확히</span> 입력해 주세요.
                  주소 오류나 장기 부재로 반송되면 재발송 택배비{' '}
                  <span className="font-semibold text-ink">5,000원</span>이 추가됩니다.
                </span>
              </div>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={differentReceiver}
                  onChange={(e) => {
                    setDifferentReceiver(e.target.checked)
                    if (!e.target.checked) set('receiver', '')
                  }}
                  className="h-5 w-5 accent-gold"
                />
                <span className="text-sm text-mist">받는 분이 주문자와 다릅니다</span>
              </label>

              {differentReceiver && (
                <Field id="receiver" label="받는 분" error={errors.receiver}>
                  <input
                    id="receiver"
                    className={fieldClass(!!errors.receiver)}
                    value={payload.receiver}
                    onChange={(e) => set('receiver', e.target.value)}
                    placeholder="받는 분 성함"
                  />
                </Field>
              )}

              <Field id="zip" label="우편번호" required error={errors.zip}>
                <div className="flex gap-2">
                  <input
                    id="zip"
                    className={`${fieldClass(!!errors.zip)} flex-1`}
                    value={payload.zip}
                    readOnly={!manualAddr}
                    onChange={(e) => manualAddr && set('zip', e.target.value)}
                    placeholder="우편번호"
                  />
                  <button
                    type="button"
                    onClick={onSearchPostcode}
                    className="shrink-0 whitespace-nowrap rounded-lg border border-gold/50 bg-gold/10 px-5 py-3 text-sm font-semibold text-gold transition-colors hover:bg-gold/20"
                  >
                    우편번호 검색
                  </button>
                </div>
              </Field>

              <Field id="addr" label="도로명 주소" required error={errors.addr}>
                <input
                  id="addr"
                  className={fieldClass(!!errors.addr)}
                  value={payload.addr}
                  readOnly={!manualAddr}
                  onChange={(e) => manualAddr && set('addr', e.target.value)}
                  placeholder="주소 검색 시 자동 입력"
                />
              </Field>

              <Field id="addrDetail" label="상세주소" required error={errors.addrDetail}>
                <input
                  id="addrDetail"
                  className={fieldClass(!!errors.addrDetail)}
                  value={payload.addrDetail}
                  onChange={(e) => set('addrDetail', e.target.value)}
                  placeholder="동·호수 등 상세주소"
                />
              </Field>

              {postcodeError && <p className="text-xs text-red-400">{postcodeError}</p>}

              <Field id="deliverNote" label="배송 요청사항" error={errors.deliverNote}>
                <input
                  id="deliverNote"
                  className={fieldClass(false)}
                  value={payload.deliverNote}
                  onChange={(e) => set('deliverNote', e.target.value)}
                  placeholder="선택 · 예) 부재 시 경비실에 맡겨주세요"
                />
              </Field>
            </fieldset>

            {/* ── 결제 정보 ───────────────────────────────── */}
            <fieldset className="space-y-5 rounded-2xl border border-mist/10 bg-navy p-6 sm:p-8">
              <legend className="px-2 text-sm font-semibold tracking-[0.08em] text-gold">
                결제 정보
              </legend>

              <Field label="결제 방법" required error={errors.payMethod}>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="flex-1 rounded-lg border border-gold bg-gold/10 px-4 py-3 text-sm font-medium text-gold"
                    aria-pressed="true"
                  >
                    무통장 입금
                  </button>
                  <button
                    type="button"
                    disabled
                    className="flex-1 cursor-not-allowed rounded-lg border border-mist/10 bg-navy-800 px-4 py-3 text-sm font-medium text-mist/35"
                  >
                    카드 (준비 중)
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-mist/45">{ORDER_CONTRACT.copy.pendingPg}</p>
              </Field>

              <Field
                id="payer"
                label="입금자명"
                required
                error={errors.payer}
                hint="입금하실 분의 성함"
              >
                <input
                  id="payer"
                  className={fieldClass(!!errors.payer)}
                  value={payload.payer}
                  onChange={(e) => set('payer', e.target.value)}
                  placeholder="입금자명"
                />
              </Field>

              <Field id="receipt" label="증빙" required error={errors.receipt}>
                <select
                  id="receipt"
                  className={`${fieldClass(!!errors.receipt)} appearance-none`}
                  value={payload.receipt}
                  onChange={(e) => set('receipt', e.target.value as Receipt)}
                >
                  {RECEIPTS.map((r) => (
                    <option key={r} value={r} className="bg-navy-800">
                      {r}
                    </option>
                  ))}
                </select>
              </Field>

              <Field id="message" label="남기실 말씀" error={errors.message}>
                <textarea
                  id="message"
                  rows={3}
                  className={`${fieldClass(false)} resize-none`}
                  value={payload.message}
                  onChange={(e) => set('message', e.target.value)}
                  placeholder="선택 · 저자·편집팀에 전할 말씀"
                />
              </Field>
            </fieldset>

            {/* ── 금액 요약 ───────────────────────────────── */}
            <div className="rounded-2xl border border-gold/30 bg-gold/5 p-6 sm:p-8">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between text-mist/75">
                  <dt>
                    도서 {formatMoney(ORDER_CONTRACT.product.unitPrice)} × {payload.qty}권
                  </dt>
                  <dd>{formatMoney(ORDER_CONTRACT.product.unitPrice * payload.qty)}</dd>
                </div>
                <div className="flex justify-between text-mist/75">
                  <dt>택배비</dt>
                  <dd>{formatMoney(shipping)}</dd>
                </div>
                <div className="mt-3 flex justify-between border-t border-gold/20 pt-3 text-lg font-bold text-ink">
                  <dt>합계</dt>
                  <dd className="text-gold">{formatMoney(amount)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs leading-relaxed text-mist/45">
                도서 대금과 택배비를 합한 금액입니다.
              </p>
            </div>

            {/* ── 개인정보 동의 ───────────────────────────── */}
            <div>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-mist/15 bg-navy p-4">
                <input
                  id="agree"
                  type="checkbox"
                  checked={payload.agree}
                  onChange={(e) => set('agree', e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-gold"
                />
                <span className="text-sm leading-relaxed text-mist">
                  <span className="font-semibold text-gold">[필수]</span>{' '}
                  {ORDER_CONTRACT.copy.privacyAgreement}
                </span>
              </label>
              {errors.agree && <p className="mt-1 text-xs text-red-400">{errors.agree}</p>}
            </div>

            {submitError && (
              <div className="rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-gold px-8 py-4 text-lg font-bold text-navy shadow-signal transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? '접수 중…' : `예약 접수하기 · ${formatMoney(amount)}`}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

/** 계좌 정보 한 줄 + 복사 */
function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* 클립보드 미지원 — 무시 */
    }
  }
  return (
    <div className="flex items-center justify-between gap-3 border-b border-mist/10 py-3 last:border-0">
      <span className="text-sm text-mist/60">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-ink">{value}</span>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-md border border-mist/20 px-2 py-0.5 text-xs text-mist/70 transition-colors hover:border-gold hover:text-gold"
        >
          {copied ? '복사됨' : '복사'}
        </button>
      </div>
    </div>
  )
}

/** 접수 완료 카드 — orderNo + 입금 안내 */
function SuccessCard({ payload, orderNo }: { payload: OrderPayload; orderNo: string }) {
  const amount = calculateAmount(payload.qty)
  const bank = ORDER_CONTRACT.bank
  const depositName = `${payload.payer || '입금자명'} ${orderNo}`

  return (
    <Reveal>
      <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-gold/40 bg-navy p-6 sm:p-8">
        <p className="text-sm font-semibold tracking-[0.08em] text-gold">예약 접수 완료</p>
        <h3 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
          주문번호 <span className="text-gold">{orderNo}</span>
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-mist/75">
          예약이 접수되었습니다. 아래 계좌로 입금하실 때{' '}
          <span className="font-semibold text-ink">{ORDER_CONTRACT.copy.depositInstruction}</span>
          해 주세요.
        </p>

        {/* 입금 안내 박스 */}
        <div className="mt-6 rounded-xl bg-navy-800 p-5">
          {bank.needsConfirmation ? (
            <div className="rounded-lg border border-gold/30 bg-gold/5 px-4 py-3 text-sm leading-relaxed text-mist">
              입금 계좌는 확정되는 대로 안내드립니다. 위 <b className="text-gold">주문번호</b>를
              보관해 주세요.
            </div>
          ) : (
            <>
              <CopyRow label="은행" value={bank.bank} />
              <CopyRow label="계좌번호" value={bank.number} />
              <CopyRow label="예금주" value={bank.holder} />
            </>
          )}
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-blue/30 bg-blue/10 px-4 py-3">
            <span className="text-sm text-mist/70">입금자명 기재</span>
            <span className="font-bold text-ink">{depositName}</span>
          </div>
        </div>

        {/* 주문 요약 */}
        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between text-mist/75">
            <dt>수량</dt>
            <dd className="text-ink">{payload.qty}권{payload.signed ? ' · 서명본' : ''}</dd>
          </div>
          <div className="flex justify-between border-t border-mist/10 pt-2 text-base font-bold">
            <dt className="text-mist">입금 금액</dt>
            <dd className="text-gold">{formatMoney(amount)}</dd>
          </div>
        </dl>

        <p className="mt-6 text-xs leading-relaxed text-mist/45">
          발간 일정과 배송은 입력하신 연락처로 안내드립니다. 문의 010-4330-5430
        </p>
      </div>
    </Reveal>
  )
}
