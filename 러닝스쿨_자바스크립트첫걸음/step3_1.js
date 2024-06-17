// 퀴즈 문제
// 1. 두 숫자 a, b와 콜백 함수 operation을 인자로 받는 calculate 함수를 작성하세요.
// 2. calculate 함수는 콜백 함수를 사용하여 a와 b에 대한 연산 결과를 반환해야 합니다.


function calculate(a, b, operation) {
    return operation = add(3, 5);
}

const add = function(x, y) {
    return x + y;
};

const result = calculate(5, 3, add);
console.log(result); // 출력: 8