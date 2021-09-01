const phoneNumberToLetter = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"]

function phoneNumberToLetters(phoneNumber) {
  if(typeof phoneNumber != 'string') {
    console.warn('phone number is not a string')
    return []
  }

  if(phoneNumber.length == 1) {
    return phoneNumberToLetter[parseInt(phoneNumber)]
  }

  let words = []
  for (let word of phoneNumberToLetters(phoneNumber.slice(1))) {
    for (let letter of phoneNumberToLetter[parseInt(phoneNumber[0])]) {
      words.push(`${letter}${word}`)
    }
  }

  return words
}

function isWord(dictionary) {
  return (word) => dictionary.has(word)
}

export default (dictionary) => (phoneNumber) => {
  return phoneNumberToLetters(phoneNumber).filter(isWord(dictionary))
}
