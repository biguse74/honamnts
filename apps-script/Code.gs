/**
 * 『불의 고리』 예약판매 주문 백엔드 (Google Apps Script)
 *
 * 배포 전 스크립트 속성:
 * - ORDER_SPREADSHEET_ID: 주문 저장 스프레드시트 ID. 비워두면 bound spreadsheet 사용.
 * - ORDER_SHEET_NAME: 주문 시트명. 기본값 "Orders".
 * - ORDER_API_SECRET: HTTP doPost 보호용 선택값. Node /api/order 프록시의 APPS_SCRIPT_API_SECRET와 맞춘다.
 *
 * 개인정보 원칙:
 * - 주문 계약 필드 외 추가 수집 금지.
 * - payload 원문 Logger.log 금지.
 * - 시트 공유는 운영자 최소 인원만 Editor, 나머지는 접근 금지.
 */

var ORDER_COLUMNS = [
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
]

var REQUIRED_FIELDS = [
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

var ORDER_PREFIX = 'HB'
var COUNTER_PROP = 'HB_LAST_ORDER_NO'
var UNIT_PRICE = 30000
var DELIVERY_FEE = 3000
var FREE_DELIVERY_FROM_QTY = 3
var DEFAULT_SHEET_NAME = 'Orders'
var OPERATOR_VIEW_SHEET_NAME = '예약자명단'
var DASHBOARD_SHEET_NAME = '운영대시보드'
var BANK_CSV_SHEET_NAME = '입금CSV붙여넣기'
var RECONCILIATION_SHEET_NAME = '입금대사결과'
var DELIVERY_EXPORT_SHEET_NAME = '배송명단'
var DEFAULT_PAY_METHOD = '무통장'
var DEFAULT_PAY_STATUS = '대기'
var CONFIRMED_PAY_STATUS = '입금확인'
var CANCELED_PAY_STATUS = '취소'
var ORDER_TIME_ZONE = 'Asia/Seoul'
var PHONE_RE = /^010-\d{4}-\d{4}$/

/**
 * 스프레드시트 운영자 메뉴.
 * 실무자는 스크립트 편집기를 열지 않고 이 메뉴만 사용하면 된다.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('불의 고리 주문')
    .addItem('1. 운영 시트 초기 세팅', 'setupOrderWorkbook')
    .addItem('2. 주문 현황 새로고침', 'refreshOrderDashboard')
    .addItem('예약자 명단 새로고침', 'refreshOperatorOrderView')
    .addItem('선택 주문 입금확인', 'markSelectedOrderPaid')
    .addItem('선택 주문 취소', 'cancelSelectedOrder')
    .addSeparator()
    .addItem('3. 입금 CSV 대사 미리보기', 'previewBankCsvMatches')
    .addItem('4. 매칭분 입금확인 반영', 'applyBankCsvMatchesFromSheet')
    .addSeparator()
    .addItem('5. 배송 명단 생성', 'generateDeliveryExport')
    .addItem('6. 주문 시트 권한 보호', 'protectOrderSheet')
    .addToUi()
}

/**
 * 프런트 계약 함수.
 * google.script.run.submitOrder(payload) 또는 doPost(JSON)에서 동일하게 사용한다.
 */
function submitOrder(payload) {
  try {
    return submitOrder_(payload)
  } catch (err) {
    throw new Error(publicErrorMessage_(err))
  }
}

/**
 * Apps Script Web App HTTP 진입점.
 * 참고: Apps Script ContentService는 임의 HTTP status를 줄 수 없으므로 실패도 { message } JSON으로 반환한다.
 */
function doPost(e) {
  try {
    assertHttpSecret_(e)
    var body = e && e.postData && e.postData.contents ? e.postData.contents : '{}'
    var payload = JSON.parse(body)
    return json_(submitOrder_(payload))
  } catch (err) {
    return json_({ message: publicErrorMessage_(err) })
  }
}

function assertHttpSecret_(e) {
  var expected = PropertiesService.getScriptProperties().getProperty('ORDER_API_SECRET')
  if (!expected) return

  var actual = e && e.parameter ? e.parameter.secret : ''
  if (actual !== expected) throw new Error('주문 API 인증에 실패했습니다.')
}

/**
 * 운영자가 처음 한 번 실행하는 세팅.
 * 주문·입금 CSV·대사 결과·배송 명단·대시보드 시트를 만들고 헤더/서식을 잡는다.
 */
function setupOrderWorkbook() {
  var ss = getOrderSpreadsheet_()
  var orderSheet = getOrderSheet_()
  formatOrderSheet_(orderSheet)
  refreshOperatorOrderView_()
  setupBankCsvSheet_(ss)
  setupResultSheet_(ss, RECONCILIATION_SHEET_NAME, getReconciliationColumns_())
  setupResultSheet_(ss, DELIVERY_EXPORT_SHEET_NAME, getDeliveryColumns_())
  refreshOrderDashboard()
  SpreadsheetApp.getUi().alert('운영 시트 초기 세팅이 완료되었습니다.')
  return { ok: true }
}

/**
 * 현재 주문 현황을 운영대시보드에 요약한다.
 */
function refreshOrderDashboard() {
  var ss = getOrderSpreadsheet_()
  var sheet = getOrCreateSheet_(ss, DASHBOARD_SHEET_NAME)
  var orders = getOrders_()
  var summary = summarizeOrders_(orders)
  var now = new Date()

  sheet.clear()
  sheet.getRange(1, 1, 1, 2).setValues([['항목', '값']])
  sheet.getRange(2, 1, 8, 2).setValues([
    ['새로고침', now],
    ['전체 주문', summary.total],
    ['대기', summary.pending],
    ['입금확인', summary.confirmed],
    ['취소', summary.canceled],
    ['총 수량', summary.qty],
    ['입금확인 수량', summary.confirmedQty],
    ['입금확인 금액', summary.confirmedAmount],
  ])
  sheet.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#f3f4f6')
  sheet.getRange(2, 2).setNumberFormat('yyyy-mm-dd hh:mm:ss')
  sheet.getRange(9, 2).setNumberFormat('#,##0')
  sheet.autoResizeColumns(1, 2)
  refreshOperatorOrderView_(orders)

  return { ok: true, summary: summary }
}

/**
 * 실무자가 매일 보는 한국어 헤더 예약자 명단을 갱신한다.
 * 계약 원장인 Orders 시트는 영어 키/컬럼 순서를 유지하고, 이 시트는 읽기 편한 운영용 보기로 쓴다.
 */
function refreshOperatorOrderView() {
  var count = refreshOperatorOrderView_()
  SpreadsheetApp.getUi().alert('예약자 명단 새로고침 완료\n' + count + '건')
  return { ok: true, count: count }
}

/**
 * "입금CSV붙여넣기" 시트 내용을 읽어 대사 결과만 작성한다. 주문 상태는 바꾸지 않는다.
 */
function previewBankCsvMatches() {
  var csvText = readBankCsvInput_()
  var result = matchBankTransfers(csvText)
  writeReconciliationResult_(result)
  refreshOrderDashboard()
  SpreadsheetApp.getUi().alert(
    '입금 대사 미리보기 완료\n매칭: ' +
      result.matchedCount +
      '건\n확인 필요: ' +
      result.unmatchedCount +
      '건',
  )
  return result
}

/**
 * "입금CSV붙여넣기" 시트 내용을 읽어 매칭 성공 주문을 입금확인으로 변경한다.
 */
function applyBankCsvMatchesFromSheet() {
  var ui = SpreadsheetApp.getUi()
  var response = ui.alert(
    '입금확인 반영',
    '매칭된 주문의 payStatus를 "입금확인"으로 변경합니다. 진행할까요?',
    ui.ButtonSet.YES_NO,
  )
  if (response !== ui.Button.YES) return { ok: false, canceled: true }

  var csvText = readBankCsvInput_()
  var result = applyBankTransferMatches(csvText)
  writeReconciliationResult_(result)
  refreshOrderDashboard()
  ui.alert('입금확인 반영 완료\n반영: ' + result.matchedCount + '건\n확인 필요: ' + result.unmatchedCount + '건')
  return result
}

/**
 * 현재 선택한 행의 주문번호를 입금확인으로 변경한다.
 */
function markSelectedOrderPaid() {
  return updateSelectedOrderStatus_(CONFIRMED_PAY_STATUS)
}

/**
 * 현재 선택한 행의 주문번호를 취소로 변경한다.
 */
function cancelSelectedOrder() {
  return updateSelectedOrderStatus_(CANCELED_PAY_STATUS)
}

/**
 * 입금확인 주문만 배송용 명단으로 내보낸다.
 */
function generateDeliveryExport() {
  var ss = getOrderSpreadsheet_()
  var sheet = setupResultSheet_(ss, DELIVERY_EXPORT_SHEET_NAME, getDeliveryColumns_())
  var rows = getOrders_()
    .filter(function (order) {
      return order.payStatus === CONFIRMED_PAY_STATUS
    })
    .map(function (order) {
      return [
        order.orderNo,
        order.receiver || order.name,
        order.phone,
        order.zip,
        order.addr,
        order.addrDetail,
        order.qty,
        order.signed === true ? '서명본' : '',
        order.deliverNote,
        order.message,
      ]
    })

  replaceDataRows_(sheet, rows, getDeliveryColumns_().length)
  SpreadsheetApp.getUi().alert('배송 명단 생성 완료\n' + rows.length + '건')
  return { ok: true, count: rows.length }
}

function submitOrder_(payload) {
  var lock = LockService.getScriptLock()
  if (!lock.tryLock(10000)) throw new Error('주문이 몰리고 있습니다. 잠시 후 다시 시도해 주세요.')

  try {
    var sheet = getOrderSheet_()
    var clean = sanitizePayload_(payload || {})
    validatePayload_(clean)

    var orderNo = nextOrderNo_(sheet)
    var record = buildOrderRecord_(clean, orderNo)
    sheet.appendRow(rowFromRecord_(record))
    refreshOperatorOrderView_()

    return { ok: true, orderNo: orderNo }
  } catch (err) {
    safeLog_('submitOrder failed', err, payload)
    throw err
  } finally {
    lock.releaseLock()
  }
}

function sanitizePayload_(payload) {
  return {
    name: trim_(payload.name),
    phone: normalizePhone_(payload.phone),
    email: trim_(payload.email),
    member: trim_(payload.member),
    qty: Number(payload.qty),
    signed: payload.signed === true,
    receiver: trim_(payload.receiver),
    zip: trim_(payload.zip),
    addr: trim_(payload.addr),
    addrDetail: trim_(payload.addrDetail),
    deliverNote: trim_(payload.deliverNote),
    payer: trim_(payload.payer),
    receipt: trim_(payload.receipt),
    message: trim_(payload.message),
    agree: payload.agree === true,
    payMethod: trim_(payload.payMethod) || DEFAULT_PAY_METHOD,
  }
}

function validatePayload_(payload) {
  REQUIRED_FIELDS.forEach(function (key) {
    if (key === 'agree') {
      if (payload.agree !== true) throw new Error('개인정보 수집·이용 동의가 필요합니다.')
      return
    }
    if (key === 'qty') {
      if (!isValidQty_(payload.qty)) throw new Error('수량은 1권부터 10권까지 가능합니다.')
      return
    }
    if (!payload[key]) throw new Error('필수 항목을 확인해 주세요: ' + key)
  })

  if (!PHONE_RE.test(payload.phone)) throw new Error('연락처는 010-0000-0000 형식이어야 합니다.')
  if (payload.member !== '회원' && payload.member !== '비회원') throw new Error('회원 여부 값이 올바르지 않습니다.')
  if (
    payload.receipt !== '불필요' &&
    payload.receipt !== '현금영수증' &&
    payload.receipt !== '세금계산서'
  ) {
    throw new Error('증빙 값이 올바르지 않습니다.')
  }
  if (payload.payMethod !== DEFAULT_PAY_METHOD) {
    throw new Error('카드 결제는 2단계 PG 연동 후 가능합니다.')
  }
}

function buildOrderRecord_(payload, orderNo) {
  return {
    orderNo: orderNo,
    createdAt: nowInOrderTimeZoneIso_(),
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    member: payload.member,
    qty: payload.qty,
    signed: payload.signed,
    receiver: payload.receiver,
    zip: payload.zip,
    addr: payload.addr,
    addrDetail: payload.addrDetail,
    deliverNote: payload.deliverNote,
    payer: payload.payer,
    receipt: payload.receipt,
    message: payload.message,
    agree: payload.agree,
    amount: calculateAmount_(payload.qty),
    payMethod: DEFAULT_PAY_METHOD,
    payStatus: DEFAULT_PAY_STATUS,
  }
}

function nowInOrderTimeZoneIso_() {
  return Utilities.formatDate(new Date(), ORDER_TIME_ZONE, "yyyy-MM-dd'T'HH:mm:ss") + '+09:00'
}

function calculateAmount_(qty) {
  return UNIT_PRICE * qty + calculateShipping_(qty)
}

function calculateShipping_(qty) {
  return qty >= FREE_DELIVERY_FROM_QTY ? 0 : DELIVERY_FEE
}

function isValidQty_(qty) {
  return Number.isInteger(qty) && qty >= 1 && qty <= 10
}

function normalizePhone_(value) {
  var digits = String(value || '').replace(/\D/g, '')
  if (digits.length === 11 && digits.indexOf('010') === 0) {
    return digits.slice(0, 3) + '-' + digits.slice(3, 7) + '-' + digits.slice(7)
  }
  return trim_(value)
}

function nextOrderNo_(sheet) {
  var props = PropertiesService.getScriptProperties()
  var saved = Number(props.getProperty(COUNTER_PROP) || 0)
  var maxInSheet = getMaxOrderNumber_(sheet)
  var next = Math.max(saved, maxInSheet) + 1
  props.setProperty(COUNTER_PROP, String(next))
  return ORDER_PREFIX + '-' + leftPad_(next, 4)
}

function getMaxOrderNumber_(sheet) {
  var lastRow = sheet.getLastRow()
  if (lastRow < 2) return 0

  var values = sheet.getRange(2, 1, lastRow - 1, 1).getValues()
  return values.reduce(function (max, row) {
    var match = String(row[0] || '').match(/^HB-(\d+)$/)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)
}

function rowFromRecord_(record) {
  return ORDER_COLUMNS.map(function (key) {
    return record[key]
  })
}

function getOrderSheet_() {
  var props = PropertiesService.getScriptProperties()
  var sheetName = props.getProperty('ORDER_SHEET_NAME') || DEFAULT_SHEET_NAME
  var ss = getOrderSpreadsheet_()

  var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName)
  ensureOrderHeader_(sheet)
  return sheet
}

function getOrderSpreadsheet_() {
  var props = PropertiesService.getScriptProperties()
  var spreadsheetId = props.getProperty('ORDER_SPREADSHEET_ID')
  var ss = spreadsheetId ? SpreadsheetApp.openById(spreadsheetId) : SpreadsheetApp.getActiveSpreadsheet()
  if (!ss) throw new Error('주문 저장 스프레드시트가 설정되지 않았습니다.')
  return ss
}

function ensureOrderHeader_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(ORDER_COLUMNS)
    return
  }

  var header = sheet.getRange(1, 1, 1, ORDER_COLUMNS.length).getValues()[0]
  var mismatches = ORDER_COLUMNS.filter(function (key, index) {
    return header[index] !== key
  })
  if (mismatches.length > 0) {
    throw new Error('주문 시트 헤더가 계약 컬럼 순서와 다릅니다: ' + mismatches.join(', '))
  }
}

/**
 * 관리자용: orderNo의 payStatus를 갱신한다.
 */
function updatePayStatus(orderNo, payStatus) {
  if (payStatus !== DEFAULT_PAY_STATUS && payStatus !== CONFIRMED_PAY_STATUS && payStatus !== CANCELED_PAY_STATUS) {
    throw new Error('payStatus 값이 올바르지 않습니다.')
  }

  var lock = LockService.getScriptLock()
  if (!lock.tryLock(10000)) throw new Error('상태 갱신 중입니다. 잠시 후 다시 시도해 주세요.')

  try {
    var sheet = getOrderSheet_()
    var index = getOrderIndex_(sheet)
    var item = index.byOrderNo[trim_(orderNo)]
    if (!item) throw new Error('주문번호를 찾을 수 없습니다.')

    sheet.getRange(item.rowNumber, index.columns.payStatus + 1).setValue(payStatus)
    refreshOperatorOrderView_()
    return { ok: true, orderNo: orderNo, payStatus: payStatus }
  } finally {
    lock.releaseLock()
  }
}

/**
 * 은행 거래내역 CSV를 주문 시트와 대조한다. 시트는 수정하지 않는다.
 * CSV는 orderNo/주문번호, payer/입금자명, amount/금액, memo/적요류 헤더를 폭넓게 인식한다.
 */
function matchBankTransfers(csvText) {
  return reconcileBankTransfers_(csvText, false)
}

/**
 * 은행 거래내역 CSV를 주문 시트와 대조하고, 매칭된 주문 payStatus를 "입금확인"으로 갱신한다.
 */
function applyBankTransferMatches(csvText) {
  return reconcileBankTransfers_(csvText, true)
}

function reconcileBankTransfers_(csvText, shouldApply) {
  var lock = LockService.getScriptLock()
  if (shouldApply && !lock.tryLock(10000)) throw new Error('입금 대사 작업 중입니다. 잠시 후 다시 시도해 주세요.')

  try {
    var transfers = parseTransferCsv_(csvText)
    var sheet = getOrderSheet_()
    var index = getOrderIndex_(sheet)
    var matches = []
    var unmatched = []

    transfers.forEach(function (transfer, idx) {
      var result = matchTransfer_(transfer, index)
      if (result.match) {
        matches.push(result.match)
        if (shouldApply) {
          sheet.getRange(result.match.rowNumber, index.columns.payStatus + 1).setValue(CONFIRMED_PAY_STATUS)
        }
      } else {
        unmatched.push({
          line: idx + 2,
          reason: result.reason,
          orderNo: transfer.orderNo || '',
          payer: transfer.payer || '',
          amount: transfer.amount || 0,
        })
      }
    })

    if (shouldApply) refreshOperatorOrderView_()

    return {
      ok: true,
      applied: shouldApply,
      matchedCount: matches.length,
      unmatchedCount: unmatched.length,
      matches: matches,
      unmatched: unmatched,
    }
  } finally {
    if (shouldApply) lock.releaseLock()
  }
}

function parseTransferCsv_(csvText) {
  var rows = parseCsv_(csvText)
  if (rows.length < 2) return []

  var headers = rows[0].map(function (header) {
    return normalizeHeader_(header)
  })

  return rows.slice(1).filter(function (row) {
    return row.some(function (cell) {
      return trim_(cell)
    })
  }).map(function (row) {
    var raw = {}
    headers.forEach(function (header, index) {
      raw[header] = row[index] || ''
    })

    var memo = pick_(raw, ['memo', '내용', '적요', '거래내용', '거래기록사항', '기재내용', '받는분통장표시'])
    var payer = pick_(raw, ['payer', '입금자', '입금자명', '보낸분', '송금인', '의뢰인'])
    var blob = [pick_(raw, ['orderNo', 'orderno', '주문번호']), memo, payer].join(' ')
    var orderNoMatch = blob.match(/HB-\d{4,}/i)

    return {
      orderNo: orderNoMatch ? orderNoMatch[0].toUpperCase() : '',
      payer: trim_(payer),
      amount: parseAmount_(pick_(raw, ['amount', '입금액', '금액', '거래금액', '입금'])),
      memo: trim_(memo),
      paidAt: trim_(pick_(raw, ['paidAt', 'paidat', '거래일시', '거래일자', '일시', '날짜'])),
    }
  })
}

function matchTransfer_(transfer, index) {
  if (!transfer.orderNo) return { reason: 'CSV에서 주문번호(HB-0001 형식)를 찾지 못했습니다.' }

  var item = index.byOrderNo[transfer.orderNo]
  if (!item) return { reason: '주문 시트에서 주문번호를 찾지 못했습니다.' }

  var order = item.record
  if (order.payStatus === CONFIRMED_PAY_STATUS) return { reason: '이미 입금확인 상태입니다.' }
  if (Number(order.amount) !== Number(transfer.amount)) return { reason: '입금액이 주문 금액과 다릅니다.' }
  if (!containsNormalized_(transfer.payer + ' ' + transfer.memo, order.payer)) {
    return { reason: '입금자명과 주문 payer가 일치하지 않습니다.' }
  }

  return {
    match: {
      orderNo: order.orderNo,
      rowNumber: item.rowNumber,
      payer: order.payer,
      amount: Number(order.amount),
      previousPayStatus: order.payStatus,
      nextPayStatus: CONFIRMED_PAY_STATUS,
      paidAt: transfer.paidAt,
    },
  }
}

function getOrderIndex_(sheet) {
  ensureOrderHeader_(sheet)

  var data = sheet.getDataRange().getValues()
  var header = data[0]
  var columns = {}
  ORDER_COLUMNS.forEach(function (key) {
    columns[key] = header.indexOf(key)
  })

  var byOrderNo = {}
  data.slice(1).forEach(function (row, idx) {
    var record = {}
    ORDER_COLUMNS.forEach(function (key) {
      record[key] = row[columns[key]]
    })
    if (record.orderNo) byOrderNo[String(record.orderNo).toUpperCase()] = { rowNumber: idx + 2, record: record }
  })

  return { columns: columns, byOrderNo: byOrderNo }
}

function getOrders_() {
  var sheet = getOrderSheet_()
  var index = getOrderIndex_(sheet)
  return Object.keys(index.byOrderNo)
    .map(function (orderNo) {
      return index.byOrderNo[orderNo].record
    })
    .sort(function (a, b) {
      return String(a.orderNo).localeCompare(String(b.orderNo))
    })
}

function refreshOperatorOrderView_(orders) {
  var ss = getOrderSpreadsheet_()
  var columns = getOperatorViewColumns_()
  var headers = columns.map(function (column) {
    return column.label
  })
  var sheet = setupOperatorViewSheet_(ss, headers)
  var rows = (orders || getOrders_()).map(function (order) {
    return columns.map(function (column) {
      return order[column.key]
    })
  })

  replaceDataRows_(sheet, rows, headers.length)
  return rows.length
}

function setupOperatorViewSheet_(ss, headers) {
  var sheet = getOrCreateSheet_(ss, OPERATOR_VIEW_SHEET_NAME)
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
  sheet.setFrozenRows(1)
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#ecfeff')
  sheet.autoResizeColumns(1, headers.length)
  return sheet
}

function getOperatorViewColumns_() {
  return [
    { key: 'orderNo', label: '주문번호' },
    { key: 'createdAt', label: '주문시각' },
    { key: 'name', label: '주문자' },
    { key: 'phone', label: '연락처' },
    { key: 'email', label: '이메일' },
    { key: 'member', label: '회원여부' },
    { key: 'qty', label: '수량' },
    { key: 'signed', label: '서명본' },
    { key: 'receiver', label: '받는분' },
    { key: 'zip', label: '우편번호' },
    { key: 'addr', label: '도로명주소' },
    { key: 'addrDetail', label: '상세주소' },
    { key: 'deliverNote', label: '배송메모' },
    { key: 'payer', label: '입금자명' },
    { key: 'receipt', label: '증빙' },
    { key: 'message', label: '남기는말' },
    { key: 'agree', label: '개인정보동의' },
    { key: 'amount', label: '결제금액' },
    { key: 'payMethod', label: '결제수단' },
    { key: 'payStatus', label: '입금상태' },
  ]
}

function summarizeOrders_(orders) {
  return orders.reduce(
    function (summary, order) {
      var qty = Number(order.qty) || 0
      var amount = Number(order.amount) || 0
      summary.total += 1
      summary.qty += qty

      if (order.payStatus === CONFIRMED_PAY_STATUS) {
        summary.confirmed += 1
        summary.confirmedQty += qty
        summary.confirmedAmount += amount
      } else if (order.payStatus === CANCELED_PAY_STATUS) {
        summary.canceled += 1
      } else {
        summary.pending += 1
      }

      return summary
    },
    {
      total: 0,
      pending: 0,
      confirmed: 0,
      canceled: 0,
      qty: 0,
      confirmedQty: 0,
      confirmedAmount: 0,
    },
  )
}

function setupBankCsvSheet_(ss) {
  var sheet = getOrCreateSheet_(ss, BANK_CSV_SHEET_NAME)
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 5).setValues([['주문번호/적요', '입금자명', '입금액', '거래일시', '메모']])
    sheet.getRange(2, 1).setValue('은행 CSV를 A1부터 표 형태로 붙여넣거나, A2 한 셀에 CSV 원문 전체를 붙여넣으세요.')
  }
  sheet.setFrozenRows(1)
  sheet.getRange(1, 1, 1, Math.max(5, sheet.getLastColumn())).setFontWeight('bold').setBackground('#fff7ed')
  sheet.autoResizeColumns(1, Math.max(5, sheet.getLastColumn()))
  return sheet
}

function setupResultSheet_(ss, sheetName, columns) {
  var sheet = getOrCreateSheet_(ss, sheetName)
  sheet.clear()
  sheet.getRange(1, 1, 1, columns.length).setValues([columns])
  sheet.setFrozenRows(1)
  sheet.getRange(1, 1, 1, columns.length).setFontWeight('bold').setBackground('#f3f4f6')
  return sheet
}

function formatOrderSheet_(sheet) {
  sheet.setFrozenRows(1)
  sheet.getRange(1, 1, 1, ORDER_COLUMNS.length).setFontWeight('bold').setBackground('#eef2ff')

  var statusColumn = ORDER_COLUMNS.indexOf('payStatus') + 1
  var methodColumn = ORDER_COLUMNS.indexOf('payMethod') + 1
  var receiptColumn = ORDER_COLUMNS.indexOf('receipt') + 1
  var memberColumn = ORDER_COLUMNS.indexOf('member') + 1

  setValidation_(sheet, statusColumn, [DEFAULT_PAY_STATUS, CONFIRMED_PAY_STATUS, CANCELED_PAY_STATUS])
  setValidation_(sheet, methodColumn, [DEFAULT_PAY_METHOD, '카드'])
  setValidation_(sheet, receiptColumn, ['불필요', '현금영수증', '세금계산서'])
  setValidation_(sheet, memberColumn, ['회원', '비회원'])
  sheet.autoResizeColumns(1, ORDER_COLUMNS.length)
}

function setValidation_(sheet, column, values) {
  var rule = SpreadsheetApp.newDataValidation().requireValueInList(values, true).setAllowInvalid(false).build()
  sheet.getRange(2, column, Math.max(1, sheet.getMaxRows() - 1), 1).setDataValidation(rule)
}

function readBankCsvInput_() {
  var ss = getOrderSpreadsheet_()
  var sheet = ss.getSheetByName(BANK_CSV_SHEET_NAME)
  if (!sheet) throw new Error('입금CSV붙여넣기 시트를 먼저 만들어 주세요.')

  var rawCell = trim_(sheet.getRange(2, 1).getValue())
  if (rawCell.indexOf('은행 CSV를') === 0 && sheet.getLastRow() <= 2) {
    throw new Error('입금CSV붙여넣기 시트에 은행 CSV를 먼저 붙여넣어 주세요.')
  }
  if (rawCell.indexOf('\n') >= 0 || rawCell.indexOf(',') >= 0) return rawCell

  var lastRow = sheet.getLastRow()
  var lastColumn = sheet.getLastColumn()
  if (lastRow < 2 || lastColumn < 1) throw new Error('입금 CSV 내용이 비어 있습니다.')

  var values = sheet.getRange(1, 1, lastRow, lastColumn).getValues()
  return values
    .filter(function (row) {
      return row.some(function (cell) {
        return trim_(cell)
      })
    })
    .map(function (row) {
      return row.map(csvCell_).join(',')
    })
    .join('\n')
}

function writeReconciliationResult_(result) {
  var ss = getOrderSpreadsheet_()
  var columns = getReconciliationColumns_()
  var sheet = setupResultSheet_(ss, RECONCILIATION_SHEET_NAME, columns)
  var rows = []

  result.matches.forEach(function (match) {
    rows.push([
      '매칭',
      match.orderNo,
      match.payer,
      match.amount,
      match.previousPayStatus,
      match.nextPayStatus,
      match.paidAt || '',
      '',
    ])
  })

  result.unmatched.forEach(function (item) {
    rows.push([
      '확인필요',
      item.orderNo,
      item.payer,
      item.amount,
      '',
      '',
      '',
      'CSV ' + item.line + '행: ' + item.reason,
    ])
  })

  replaceDataRows_(sheet, rows, columns.length)
}

function replaceDataRows_(sheet, rows, columnCount) {
  if (sheet.getMaxRows() > 1) {
    sheet.getRange(2, 1, sheet.getMaxRows() - 1, columnCount).clearContent()
  }
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, columnCount).setValues(rows)
  }
  sheet.autoResizeColumns(1, columnCount)
}

function getReconciliationColumns_() {
  return ['상태', '주문번호', '입금자명', '금액', '기존 payStatus', '변경 payStatus', '거래일시', '확인 메모']
}

function getDeliveryColumns_() {
  return ['주문번호', '받는분', '연락처', '우편번호', '도로명주소', '상세주소', '수량', '서명본', '배송메모', '남기는말']
}

function getOrCreateSheet_(ss, sheetName) {
  return ss.getSheetByName(sheetName) || ss.insertSheet(sheetName)
}

function updateSelectedOrderStatus_(payStatus) {
  var ui = SpreadsheetApp.getUi()
  var orderNo = getSelectedOrderNo_()
  if (!orderNo) {
    ui.alert('주문번호를 찾지 못했습니다. Orders 또는 입금대사결과 시트에서 주문 행을 선택해 주세요.')
    return { ok: false, message: 'selected order not found' }
  }

  var response = ui.alert(
    '주문 상태 변경',
    orderNo + ' 주문을 "' + payStatus + '" 상태로 변경할까요?',
    ui.ButtonSet.YES_NO,
  )
  if (response !== ui.Button.YES) return { ok: false, canceled: true }

  var result = updatePayStatus(orderNo, payStatus)
  refreshOrderDashboard()
  ui.alert(orderNo + ' 상태를 "' + payStatus + '"로 변경했습니다.')
  return result
}

function getSelectedOrderNo_() {
  var ss = getOrderSpreadsheet_()
  var sheet = ss.getActiveSheet()
  var range = sheet.getActiveRange()
  if (!range) return ''

  var rowNumber = range.getRow()
  if (rowNumber <= 1) return ''

  var header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  var orderNoIndex = header.indexOf('orderNo')
  if (orderNoIndex < 0) orderNoIndex = header.indexOf('주문번호')
  if (orderNoIndex < 0) orderNoIndex = 0

  var value = trim_(sheet.getRange(rowNumber, orderNoIndex + 1).getValue())
  var match = value.match(/HB-\d{4,}/i)
  return match ? match[0].toUpperCase() : ''
}

/**
 * 2단계 PG 자리. 실제 포트원/토스페이먼츠 어댑터는 승인 콜백 검증 후 updatePayStatus를 호출해야 한다.
 */
function pay(order) {
  throw new Error('카드 결제는 2단계 PG 연동 후 가능합니다.')
}

function handlePaymentApproval(approval) {
  throw new Error('PG 승인 콜백 검증 로직이 아직 설정되지 않았습니다.')
}

/**
 * 관리자용: 시트 보호를 적용한다. 실행 전 운영자 계정으로 로그인했는지 확인한다.
 */
function protectOrderSheet() {
  var sheet = getOrderSheet_()
  var protection = sheet.protect().setDescription('불의 고리 주문 시트 접근 제한')
  var currentUser = Session.getEffectiveUser()
  var currentEmail = currentUser.getEmail()
  protection.setWarningOnly(false)
  protection.getEditors().forEach(function (editor) {
    if (editor.getEmail() !== currentEmail) protection.removeEditor(editor)
  })
  protection.addEditor(currentUser)
  return { ok: true, sheetName: sheet.getName() }
}

function parseCsv_(text) {
  var rows = []
  var row = []
  var cell = ''
  var inQuotes = false
  var source = String(text || '')

  for (var i = 0; i < source.length; i += 1) {
    var ch = source[i]
    var next = source[i + 1]

    if (ch === '"' && inQuotes && next === '"') {
      cell += '"'
      i += 1
    } else if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      row.push(cell)
      cell = ''
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i += 1
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += ch
    }
  }

  row.push(cell)
  rows.push(row)
  return rows
}

function csvCell_(value) {
  var text = String(value == null ? '' : value)
  if (/[",\r\n]/.test(text)) return '"' + text.replace(/"/g, '""') + '"'
  return text
}

function pick_(object, keys) {
  for (var i = 0; i < keys.length; i += 1) {
    var key = normalizeHeader_(keys[i])
    if (object[key]) return object[key]
  }
  return ''
}

function normalizeHeader_(value) {
  return String(value || '').replace(/\s+/g, '').toLowerCase()
}

function parseAmount_(value) {
  return Number(String(value || '').replace(/[^\d-]/g, '')) || 0
}

function containsNormalized_(haystack, needle) {
  var normalizedHaystack = normalizeText_(haystack)
  var normalizedNeedle = normalizeText_(needle)
  return normalizedNeedle ? normalizedHaystack.indexOf(normalizedNeedle) >= 0 : false
}

function normalizeText_(value) {
  return String(value || '').replace(/\s+/g, '').toLowerCase()
}

function trim_(value) {
  return String(value == null ? '' : value).trim()
}

function leftPad_(value, size) {
  var text = String(value)
  while (text.length < size) text = '0' + text
  return text
}

function json_(object) {
  return ContentService.createTextOutput(JSON.stringify(object)).setMimeType(ContentService.MimeType.JSON)
}

function publicErrorMessage_(err) {
  if (err && err.message) return err.message
  return '요청 처리 중 오류가 발생했습니다.'
}

function safeLog_(message, err, payload) {
  var masked = maskPayload_(payload || {})
  Logger.log(
    JSON.stringify({
      message: message,
      error: publicErrorMessage_(err),
      payload: masked,
    }),
  )
}

function maskPayload_(payload) {
  return {
    name: maskName_(payload.name),
    phone: maskPhone_(payload.phone),
    email: maskEmail_(payload.email),
    payer: maskName_(payload.payer),
    qty: payload.qty,
    payMethod: payload.payMethod,
  }
}

function maskName_(value) {
  var text = trim_(value)
  if (!text) return ''
  if (text.length <= 1) return '*'
  return text[0] + '*'.repeat(Math.max(1, text.length - 1))
}

function maskPhone_(value) {
  var text = normalizePhone_(value)
  return text.replace(/(010)-\d{4}-(\d{4})/, '$1-****-$2')
}

function maskEmail_(value) {
  var text = trim_(value)
  var at = text.indexOf('@')
  if (at <= 1) return text ? '***' : ''
  return text[0] + '***' + text.slice(at)
}
