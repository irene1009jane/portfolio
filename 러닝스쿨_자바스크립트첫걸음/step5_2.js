// [ ] 주어진 객체 배열에서 각 객체의 특정 속성 값을 추출하여 새로운 배열을 반환하는 함수를 작성하세요.

// extractProperty 함수 작성
const extractProperty = (people, property) => {
    
    let propertyArray = people.map((elm) => {
        return elm[property];
    })
        
    return propertyArray;// 배열 내장함수 map을 사용하세요.
}

// 예시 사용
const people = [
    { name: "철수", age: 25 },
    { name: "영희", age: 30 },
    { name: "민수", age: 28 },
    { name: "지현", age: 22 }
];

const names = extractProperty(people, "name");
console.log(names); // 출력: ["철수", "영희", "민수", "지현"]

const ages = extractProperty(people, "age");
console.log(ages); // 출력: [25, 30, 28, 22]