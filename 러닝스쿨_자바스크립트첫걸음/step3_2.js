//	1.	사용자 이름 name과 인사 메시지를 생성하는 콜백 함수 greetingFunction을 인자로 받는 generateMessage 함수를 작성하세요.
//	2.	generateMessage 함수는 콜백 함수를 사용하여 이름에 맞는 인사 메시지를 반환해야 합니다.

function generateMessage(name, morningGreeting) {
    return morningGreeting(name);
}

const morningGreeting = function(name) {
    return '좋은 아침입니다, 철수!';

};

const eveningGreeting = function(name) {
    return '좋은 저녁입니다, 영희!';
};

console.log(generateMessage("철수", morningGreeting)); // 출력: 좋은 아침입니다, 철수!
console.log(generateMessage("영희", eveningGreeting)); // 출력: 좋은 저녁입니다, 영희!




// function generateMessage(name, morningGreeting) {
//     switch (name) {
//         case '철수':
//             return morningGreeting(name);
//             break;
//         case '영희':
//             return eveningGreeting(name);
//             break;
//         default:
//             break;
//     }
// }