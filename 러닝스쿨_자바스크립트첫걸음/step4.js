const students = [
    { name: "철수", score: 85 },
    { name: "영희", score: 92 },
    { name: "민수", score: 76 },
    { name: "지현", score: 89 }
];

// 문제 1: 특정 점수 이상인 학생 찾기
const findTopStudents = (students, minScore) => {
    const topStudents = [];
    if(students[0].score >= minScore) {topStudents.push({'neme' : students[0]["name"], 'score' : students[0]["score"]});}
    if(students[1].score >= minScore) {topStudents.push({'neme' : students[1]["name"], 'score' : students[1]["score"]});} 
    if(students[2].score >= minScore) {topStudents.push({'neme' : students[2]["name"], 'score' : students[2]["score"]});} 
    if(students[3].score >= minScore) {topStudents.push({'neme' : students[3]["name"], 'score' : students[3]["score"]});}
    return topStudents;
}

// 문제 2: 학생 성적 등급 부여하기
// 90이상 : A, 80이상 : B, 70이상 : C, 70미만 : F
const assignGrades = (students) => {
    const gradedStudents = [];
    let gradeText;
    function gradeABCF(grade){
        if(grade >= 90) {
            gradeText = 'A';
        } else if(grade >= 80) {
            gradeText = 'B';
        } else if(grade >= 70) {
            gradeText = 'C';
        } else if(grade < 70) {
            gradeText = 'F';
        }
        return gradeText;
    }    
    gradedStudents.push({'neme' : students[0]["name"], 'grade' : gradeABCF(students[0].score)});
    gradedStudents.push({'neme' : students[1]["name"], 'grade' : gradeABCF(students[1].score)});
    gradedStudents.push({'neme' : students[2]["name"], 'grade' : gradeABCF(students[2].score)});
    gradedStudents.push({'neme' : students[3]["name"], 'grade' : gradeABCF(students[3].score)});
    return gradedStudents;
}

// 예시 사용

// 문제 1: 특정 점수 이상인 학생 찾기
const topStudents = findTopStudents(students, 80);
console.log(topStudents);
// 출력: [{ name: "철수", score: 85 }, { name: "영희", score: 92 }, { name: "지현", score: 89 }]

// 문제 2: 학생 성적 등급 부여하기
const gradedStudents = assignGrades(students);
console.log(gradedStudents);
// 출력: [{ name: "철수", grade: 'B' }, { name: "영희", grade: 'A' }, { name: "민수", grade: 'C' }, { name: "지현", grade: 'B' }]