// 문자열을 base64로 인코딩/디코딩 해주는 함수.
export const encodeBase64 = (orgStr) => {

    return btoa(orgStr);
}
  
export const decodeBase64 = (base64Str) => {

  return atob(base64Str);
}

export const makeCommaSeparatedString = (stringArray) => {

  let result = "";
  for(let i=0;i<stringArray.length;i++) {
    result += stringArray[i] + (i+1 < stringArray.length ? ",":"");
  }

  return result;
}