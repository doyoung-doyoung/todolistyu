import { randomInt } from 'crypto'

// 헷갈리는 문자(0/O, 1/l/I) 제거. 학생들이 손으로 옮겨 적어도 헷갈리지 않게.
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'

// crypto.randomInt는 예측 불가능한 난수 (Math.random 아님 → 추측 불가)
export function generateStudentPassword(length = 8): string {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += CHARS[randomInt(0, CHARS.length)]
  }
  return out
}
