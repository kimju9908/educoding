// 유효성 검사 나누기
// 1. ID 유효성 검사
// 특수 문자열 포함 여부 (포함 시 -> true)
export function isIdContainsSpecialCharacter(input: string): boolean {
  const specialCharRegex = /[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/;
  return specialCharRegex.test(input);
}
export function isIdContainsKorean(input: string): boolean {
  const koreanRegex = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;
  return koreanRegex.test(input);
}
export function idAvailable(input: string): boolean {
  const idRegex = /^[a-zA-Z0-9]{6,16}$/;
  return idRegex.test(input);
}
// ID input 문자열 길이 검사 (6보다 작을 시 -> true)
export function isIdTooShort(input: string): boolean {
  return input.length < 6;
}
// ID input 문자열 길이 검사 (16보다 클 시 -> true)
export function isIdTooLong(input: string): boolean {
  return input.length > 16;
}
// 2. PW 유효성 검사
// PW input 문자열 길이 검사 (8보다 작을 시 -> true)
export function isPwTooShort(input: string): boolean {
  return input.length < 8;
}
// PW input 문자열 길이 검사 (20보다 클 시 -> true)
export function isPwTooLong(input: string): boolean {
  return input.length > 20;
}
export function pwAvailable(input: string): boolean {
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,20}$/;
  return passwordRegex.test(input);
}
//  특수 문자열 포함 여부 (포함 시 -> true)
export function isPwContainsSpecialCharacter(input: string): boolean {
  const specialCharRegex = /[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣 ]/;
  return specialCharRegex.test(input);
}
//  숫자열 포함 여부 (포함 시 -> true)
export function isPwContainsNumber(input: string): boolean {
  const numberRegex = /\d/;
  return numberRegex.test(input);
}
//  문자열 포함 여부 (포함 시 -> true)
export function isPwContainsCharacter(input: string): boolean {
  const charRegex = /[a-zA-Z]/;
  return charRegex.test(input);
}
export function emailAvailable(input: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  return emailRegex.test(input);
}
// 6. 닉네임 유효성 검사
// Name input 문자열 길이 검사 (3보다 작을 시 -> true)
export function isNameTooShort(input: string): boolean {
  return input.length < 3;
}
// Name input 문자열 길이 검사 (3보다 작을 시 -> true)
export function isNameTooLong(input: string): boolean {
  return input.length > 16;
}
// 특수 문자열 포함 여부 (포함 시 -> true)
export function isNameContainsSpecialCharacter(input: string): boolean {
  const specialCharRegex = /[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣._-]/;
  return specialCharRegex.test(input);
}
export function nameAvailable(input: string): boolean {
  const nameRegex = /^[a-zA-Zㄱ-ㅎ가-힣0-9._-]{3,16}$/;
  return nameRegex.test(input);
}

// 공통 공란 여부 검사 (공란 시 -> true)
export function isBlank(input: string): boolean {
  return input.trim() === '';
}
