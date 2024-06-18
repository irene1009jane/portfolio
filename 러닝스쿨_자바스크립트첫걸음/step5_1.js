// [ ] 숫자 배열 numbers를 인자로 받아 모든 요소의 합을 반환하는 sumArray 함수를 작성해주세요.
// sumArray 함수 작성
const sumArray = (numbers) => {
    let sum = 0;
    for (let i = 0; i < numbers.length; i++) {
        sum = sum + numbers[i]; 
    }
    return sum;
}

// 예시 사용
const numbers = [1, 2, 3, 4, 5];
const result = sumArray(numbers);
console.log(result); // 출력: 15