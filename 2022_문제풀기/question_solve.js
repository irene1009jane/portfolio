/**
 * 리틀팍스 CLASS :: 읽기 CLASS :: 독해력 키우기 :: 문제풀기
 * @author JSM (2022.04)
 * @version 0.1
 * @참고사항
 * #변수명 규칙 
 * - 기본 카멜 (ex) varSample)
 * - 배열은 arr붙이고 카멜 (ex) arrPage, arrSection, arrValue)
 * - 태그 및 선택자 앞에 달러($),카멜 (ex) $paperBoxClass, $paperBoxId, $paperBoxLi) 
 * - 마크업 뒤에 HTML 대문자로 붙이기 (ex) paperHTML)
 * - 자료형 숫자 대문자, 단어사이 언더바(_) (ex) PAPER_L아ENTH, PAPER_NUMBER, PAPER_INDEX)
 * - 자료형 문자 앞에 언더바(_) or 카멜로 Text,Data,Value 넣기 (ex) _paperText, _paperData, _paperValue)
 **/

 if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
}

var arrTest =  new Array();                  // 배열 어떻게.. 캡슐화에서 선언하지?
var arrChoiceHTML = new Array();             // 배열 어떻게.. 캡슐화에서 선언하지?
var ARR_TYPEC_TEXT = new Array();            // 배열 어떻게.. 캡슐화에서 선언하지?
var ARR_TYPEC_DATA_NUM = new Array();        // 배열 어떻게.. 캡슐화에서 선언하지?
var ARR_TYPEC_USER_NUM = new Array();        // 배열 어떻게.. 캡슐화에서 선언하지?
var regex = /[^0-9]/g;
var solveDataLoad = function(){
    $.ajax({
        url:  '/static/class/js/solve_answer.json', //경우의수 7개만있는 요약하기 여려개일때
        // url:  '/static/class/js/solve_answer2.json', //경우의수 7*2개 있고 사용자 점수체크
        type : 'GET',
        dataType: 'json'
    })
    .done(function (result){ 
        // console.log(result);
        questionSolve.init(result);
    })
    .fail(function(error){
        console.error(error);
    });
};


/**
 * 문제풀기 questionSolve
 * init                     // 데이터 로드
 * introStart               // 표지
 * questionTypeA            // 문제 TypeA
 * questionTypeB            // 문제 TypeB
 * questionTypeC            // 문제 TypeC
 * questionTypeCReset       // 문제 TypeC 선택 삭제
 * questionTypeCRemove      // 문제 TypeC 선택 초기화
 * pageMove                 // 문제지 이동 구현
 * navClick                 // 문제지 네비게이션 구현
 * gradeScoreClick          // 채점하기 버튼 클릭시 결과화면
 * gradeResultView          // 채점결과보기 버튼 클릭시 문제풀기의 채점표시 화면
 */
var questionSolve = {
    solveData: {},              // json데이터
    solveInfo: null,            // solveData 정보 담는곳
    questionInfo: null,         // solveData 문제 담는곳
    QUESTION_LENTH: '',         // solveData 문제 갯수
    questionHTML: '',           // solveData 문제 html
    typeClassName: '',          // 문제 유형 :: 객관식:MULTI(typeA),TF(TF:typeB), 요약하기(SUMMERY:typeC)
    _gradeResultText: '',       // 목표 점수에 따른 네이밍 (perfect,pass,fail)
    TARGET_SCORE: '',           // 사용자가 설정한 목표 점수
    USER_SCORE: '',             // 사용자가 문제풀기 한 점수
    PAPER_LENGTH: '',           // 문제 총갯수
    $paperShow: '',             // 사용자가 현재 풀고있는 문제
    $paperShowId: '',           // 사용자가 현재 풀고있는 문제 html id
    PAPER_NUMBER: '',           // 사용자가 현재 풀고있는 문제 html id의 숫자
    MOVE_NUMBER: '',            // 사용자가 현재 풀고있는 문제 html id의 숫자에 계산된 값
    $typeId: '',                // 사용자가 선택한 답의 문제 id
    TYPE_LI_LENGTH: '',         // 사용자가 선택한 답을 포함함 보기목록 갯수
    LI_CHOICE_LENGTH: '',       // 사용자가 선택한 답들의 문제 갯수
    $typeNavName:'',            // 사용자가 선택한 문제의 네비게이션 이름
    _choiceAnwserValue: '',     // 사용자가 선택한 문제 답번호
    _exampleText: '',           // (문제유형 TYPE3) Reset에 사용 / 현재 풀고있는 문제 초기화시 뿌리는 선택지 마크어
    TYPEC_INDEX: '',            // (문제유형 TYPE3) Reset에 사용 / 현재 풀고있는 문제의 id값의 숫자
    $typeCList: '',             // (문제유형 TYPE3) 사용자가 선택한 답을 포함함 보기목록
    // arrTest: [],                 // (문제유형 TYPE3) 테스트용 임시
    // arrChoiceHTML: [],           // (문제유형 TYPE3) 사용자가 선택한 답의 html 담는 곳
    // ARR_TYPEC_TEXT: [],          // (문제유형 TYPE3) 사용자가 선택한 순서대로 버튼의 숫자 담는 곳
    // ARR_TYPEC_DATA_NUM: [],      // (문제유형 TYPE3) json데이터 순서 숫자 담는 곳
    // ARR_TYPEC_USER_NUM: [],      // (문제유형 TYPE3) 사용자가 선택한 순서 숫자 담는 곳
    TYPEC_MAX_NUMBER: '',       // (문제유형 TYPE3) 사용자가 선택한 답중 제일 큰 숫자 담는 곳
    $typeCMaxLi: '',            // (문제유형 TYPE3) 사용자가 선택한 답중 제일 큰 숫자를 담은 li
    TYPEC_CHOICE_NUM: '',       // (문제유형 TYPE3) 사용자가 선택한 답 저장
    _gradeText: '',             // 정답표시 기준 (정딥 correct, 오답 error)
        
    sectionIntro: document.getElementById('sectionIntro'),             // 표지 영역
    sectionPapers: document.getElementById('sectionPapers'),           // 문제 영역
    sectionResult: document.getElementById('sectionResult'),           // 결과 영역
    solveCanvas: document.getElementById('solveCanvas'),               // 문제 뿌려지는 곳

    init : function(result){
        this.solveData = result;
        this.QUESTION_LENTH = this.solveData.questionInfo.length;
        this.solveInfo = this.solveData.solveInfo;
        // console.log(this.solveData);
        
        // Question
        this.questionHTML = '';            
        for (var i = 0; i < this.QUESTION_LENTH; i++) {
            this.questionInfo = this.solveData.questionInfo[i];
                        
            // 문제 유형 MULTI, TF, SUMMERY
            if(this.questionInfo.type == 'SUMMERY') {
                this.typeClassName = 'typeC-summary_answer';
            } else if(this.questionInfo.type == 'TF') {
                this.typeClassName = 'typeB-tf_answer';
            } else {
                this.typeClassName = 'typeA-multiple_choice';
            }

            this.questionHTML +=   '<div id="question'+(i+1)+'" class="paper '+ this.typeClassName +'">';
            // 지시문 부분
            this.questionHTML +=       '<div class="question-box">'; // 채점시 틀리면 error, 맞추면 correct 클래스 추가됨
            this.questionHTML +=           '<div class="directive">';
            this.questionHTML +=               '<p>' + this.questionInfo.title + '</p>'; 
            this.questionHTML +=           '</div>';
            // 제시문 부분
            if(this.questionInfo.presentationType == 'WORD') {
                this.questionHTML +=           '<div class="presentation-box">';
                this.questionHTML +=               '<div class="cont '+ this.questionInfo.language +'">'; // en영문 , ko국문
                this.questionHTML +=                   '<p>' + this.questionInfo.presentation + '</p>';
                this.questionHTML +=               '</div>';
                this.questionHTML +=           '</div>';
            } else if(this.questionInfo.presentationType == 'IMG') {
                this.questionHTML +=           '<div class="presentation-box">';
                this.questionHTML +=               '<div class="cont">';
                this.questionHTML +=                   '<img src="' + this.questionInfo.imgageUrl + '" alt="">';
                this.questionHTML +=               '</div>';
                this.questionHTML +=           '</div>';
            } else if(this.questionInfo.presentationType == 'BLANK') {
                this.questionHTML +=           '<div class="presentation-box hint-text">';
                this.questionHTML +=               '<div class="cont '+ this.questionInfo.language +'">'; // en영문 , ko국문
                this.questionHTML +=                   '<p>' + this.questionInfo.presentation + '</p>';
                this.questionHTML +=               '</div>';
                this.questionHTML +=           '</div>';
            } else if (this.questionInfo.presentationType == 'BOTH') {
                this.questionHTML +=           '<div class="presentation-box hint-img">';
                this.questionHTML +=           '   <div class="cont '+ this.questionInfo.language +'">'; // en영문 , ko국문
                this.questionHTML +=                   '<p>' + this.questionInfo.presentation + '</p>';
                this.questionHTML +=               '</div>';
                this.questionHTML +=               '<div class="img"><img src="' + this.questionInfo.imgageUrl + '" alt=""></div>';
                this.questionHTML +=           '</div>';
            }
            this.questionHTML +=       '</div>';
            // 선택지 부분
            if(this.questionInfo.type == 'MULTI') {
                this.questionHTML +=       '<ol class="example-list">'; 
                for (var q = 0; q < this.questionInfo.exampleList.length; q++) {
                    this.questionHTML +=       '<li><button type="button" onclick="javascript:questionSolve.questionTypeA(this)">';
                    this.questionHTML +=           '<span class="sign">' + this.questionInfo.exampleList[q].num + '</span>';
                    this.questionHTML +=           '<span class="text">' + this.questionInfo.exampleList[q].title + '</span>';
                    this.questionHTML +=       '</button></li>';
                }
                this.questionHTML +=       '</ol>';
            } else if(this.questionInfo.type == 'TF'){
                this.questionHTML +=       '<div class="btn-example">'; 
                this.questionHTML +=           '<button type="button" onclick="javascript:questionSolve.questionTypeB(this)">True</button>';
                this.questionHTML +=           '<button type="button" onclick="javascript:questionSolve.questionTypeB(this)">False</button>';
                this.questionHTML +=       '</div>';
            } else if(this.questionInfo.type == 'SUMMERY'){
                this.questionHTML +=       '<div class="summary-list">'; // completion 완료클래스 붙음
                this.questionHTML +=           '<ol>'; // 선택시 choice ,채점시 error, correct 클래스 추가됨
                for (var q = 0; q < this.questionInfo.exampleList.length; q++) {
                    this.questionHTML +=       '<li data-number="'+ this.questionInfo.exampleList[q].num.replace(regex, '') +'">';
                    this.questionHTML +=           '<p>';
                    this.questionHTML +=               '<span class="num">' + this.questionInfo.exampleList[q].num + '</span> ';
                    this.questionHTML +=               '<span class="text">' + this.questionInfo.exampleList[q].title + '</span>';
                    this.questionHTML +=           '</p>';
                    this.questionHTML +=           '<button type="button" onclick="javascript:questionSolve.questionTypeC(this)"><span class="hidden">미정</span></button>';
                    this.questionHTML +=       '</li>';
                }
                this.questionHTML +=           '</ol>';
                this.questionHTML +=       '</div>';

                this.questionHTML +=       '<div class="btn-control">'
                this.questionHTML +=           '<button type="button" class="btn-reset" onclick="javascript:questionSolve.questionTypeCReset(this);"><span class="hidden">Reset</span></button>'
                this.questionHTML +=           '<button type="button" class="btn-remove" onclick="javascript:questionSolve.questionTypeCRemove(this);"><span class="hidden">Remove</span></button>'
                this.questionHTML +=       '</div>'
            }
            this.questionHTML +=   '</div>';
        }

        // Nav
        this.navHtml = '';
        this.navHtml += '<ol>';
        for (var i = 1; i <= this.QUESTION_LENTH; i++) {
            this.navHtml += '    <li><button type="button" name="question'+i+'" onclick="javascript:questionSolve.navClick('+i+')">'+i+'</button></li>';
        };
        this.navHtml += '</ol>';

        $('#sectionIntro .series-name').html(this.solveInfo.seriesName);
        $('#sectionIntro .part-title').html(this.solveInfo.partTitle);
        $('#sectionIntro .target-score').html(this.solveInfo.targetScore);
        $('#solveCanvas').html(this.questionHTML);
        $('#navList').html(this.navHtml);
                
        return false;
    },
    introStart : function(el){
        this.sectionPapers.style.display = 'block';
        this.sectionIntro.style.display = 'none';

        $('.timer').show();
        $('#question1').addClass('show');
        $('.area-nav li button[name="question1"]').parent().addClass('active');
                
        // console.log(this.solveData);
            
        return false;
    },
    questionTypeA : function(el) {
        this.$typeId = $(el).closest('.paper').attr('id');
        this.$typeNavName = $('.area-nav li button[name='+ this.$typeId +']');

        $(el).parent().addClass('choice').siblings().removeClass('choice');
        this.$typeNavName.parent().addClass('solve');

        return false;
    },
    questionTypeB : function(el){
        this.$typeId = $(el).closest('.paper').attr('id');
        this.$typeNavName = $('.area-nav li button[name='+ this.$typeId +']');
        
        $(el).addClass('choice').siblings().removeClass('choice');
        this.$typeNavName.parent().addClass('solve');

        // console.log('this.$typeId : '+ this.$typeId);
        // console.log('$typeB_navName : '+ $typeB_navName);

        return false;
    },
    questionTypeC : function(el){
        arrChoiceHTML = new Array();
        ARR_TYPEC_DATA_NUM = '';
        ARR_TYPEC_USER_NUM = new Array();

        this.$typeId = $(el).closest('.paper').attr('id');
        this.$typeCList = $('#'+this.$typeId+' .summary-list');
        this.TYPE_LI_LENGTH = parseInt(this.$typeCList.find('li').length);
        this.LI_CHOICE_LENGTH = parseInt(this.$typeCList.find('li.choice').length);
        this.$typeNavName = $('.area-nav li button[name='+ this.$typeId +']');

        if( this.LI_CHOICE_LENGTH == this.TYPE_LI_LENGTH ){
            this.LI_CHOICE_LENGTH = this.LI_CHOICE_LENGTH-1;
        }

        // console.log('this.TYPE_LI_LENGTH : ' + this.TYPE_LI_LENGTH);
        // console.log('this.LI_CHOICE_LENGTH : ' + this.LI_CHOICE_LENGTH);

        if(!($(el).parent().hasClass('choice'))){
            if(this.LI_CHOICE_LENGTH < this.TYPE_LI_LENGTH) {
                $(el).parent().addClass('choice');
                $(el).parent().attr('data-user',this.LI_CHOICE_LENGTH+1);
                $(el).html('').append(this.LI_CHOICE_LENGTH+1);
            }
            
            if(this.LI_CHOICE_LENGTH+1 == this.TYPE_LI_LENGTH) {
                this.$typeNavName.parent().addClass('solve');
                this.$typeCList.addClass('completion');
                this.$typeCList.find('li').each(function(){
                    arrChoiceHTML.push($(this).find('p').html());
                    ARR_TYPEC_USER_NUM.push($(this).attr('data-user'));
                });
                
                // console.log('초기 arrChoiceHTML : ' + arrChoiceHTML);
                // console.log('초기 ARR_TYPEC_USER_NUM : ' + ARR_TYPEC_USER_NUM);

                this.$typeCList.find('li p').html('');
                this.$typeCList.find('li button').html('');

                //ARR_TYPEC_USER_NUM(data-user)가 순서대로 arrChoiceHTML가 뿌려진다
                for (var i = 0; i < arrChoiceHTML.length; i++){
                    var q = ARR_TYPEC_USER_NUM[i];
                    // console.log('i : '+ i +', q :' + q);
                    // console.log('arrChoiceHTML[i] : ' + arrChoiceHTML[i]);
                    // console.log('arrChoiceHTML[q-1] : ' + arrChoiceHTML[q-1]);
                    
                    this.$typeCList.find('li').eq(q-1).find('p').append(arrChoiceHTML[i]);
                    this.$typeCList.find('li').eq(i).attr('data-user', (i+1));
                    this.$typeCList.find('li button').eq(i).append(i+1);

                    ARR_TYPEC_DATA_NUM = this.$typeCList.find('li').eq(i).find('p .num').text().replace(regex, '');
                    this.$typeCList.find('li').eq(i).attr('data-number', ARR_TYPEC_DATA_NUM);
                }
            }
        }
        return false;
    },
    questionTypeCReset : function(btnReset){ 
        this.$typeId = $(btnReset).closest('.paper').attr('id');
        this.$typeCList = $('#'+this.$typeId+' .summary-list');
        this.TYPEC_INDEX = this.$typeId.replace(regex, '');
        this.$typeCList.find('li button').html('<span class="hidden">미정</span>');
        this.$typeNavName = $('.area-nav li button[name='+ this.$typeId +']');
        
        // 선택상태 해제
        if (this.$typeCList.find('li').hasClass('choice')){
            this.$typeCList.find('li').removeClass('choice');
        }
        
        this.$typeCList.find('li').removeAttr('data-number');
        this.$typeCList.find('li').removeAttr('data-user');
        
        // 전체선택 해제
        if(this.$typeCList.hasClass('completion')){
            this.$typeCList.removeClass('completion');
            this.$typeNavName.parent().removeClass('solve');
        }  
        
        this.questionInfo = this.solveData.questionInfo[this.TYPEC_INDEX-1];
        this.$typeCList.find('li p').html('');
        
        for (var i = 0; i < this.questionInfo.exampleList.length; i++) {
            this._exampleText = this.questionInfo.exampleList[i];
            this.$typeCList.find('li').eq(i).attr('data-number', this._exampleText.num.replace(regex, ''))
            this.$typeCList.find('li p').eq(i).append('<span class="num">' + this._exampleText.num + '</span> <span class="text">' + this._exampleText.title + '</span>');
        };
        arrChoiceHTML = new Array();
                 
        // console.log('this.$typeId :' + this.$typeId);
        // console.log('this.$typeCList :' + this.$typeCList);
        // console.log('this.TYPEC_INDEX :' + this.TYPEC_INDEX);
        return false;
    },
    questionTypeCRemove : function(btnRemove){
        this.TYPEC_MAX_NUMBER = '';
        ARR_TYPEC_DATA_NUM = new Array();
        ARR_TYPEC_USER_NUM = new Array();

        this.$typeId = $(btnRemove).closest('.paper').attr('id');
        this.$typeCList = $('#'+this.$typeId+' .summary-list');
        this.TYPEC_INDEX = this.$typeId.replace(regex, '');
        this.TYPE_LI_LENGTH = this.$typeCList.find('li').length;
        this.$typeNavName = $('.area-nav li button[name='+ this.$typeId +']');
        this.questionInfo = this.solveData.questionInfo[this.TYPEC_INDEX-1];

        if(this.TYPE_LI_LENGTH > 0) {
            this.$typeCList.find('li').each(function(e){
                ARR_TYPEC_USER_NUM.push($(this).attr('data-user'));
                ARR_TYPEC_DATA_NUM.push($(this).attr('data-number'));
            });

            ARR_TYPEC_USER_NUM = ARR_TYPEC_USER_NUM.filter(Boolean);
            ARR_TYPEC_DATA_NUM = ARR_TYPEC_DATA_NUM.filter(Boolean);

            console.log('ARR_TYPEC_USER_NUM : ' + ARR_TYPEC_USER_NUM);
            console.log('ARR_TYPEC_DATA_NUM : ' + ARR_TYPEC_DATA_NUM);

            // 전체선택 해제
            //ARR_TYPEC_DATA_NUM(data-member)에 담긴 텍스트가 json 순서대로 뿌려진다
            if(this.$typeCList.hasClass('completion')){
                this.$typeNavName.parent().removeClass('solve');
                this.$typeCList.removeClass('completion');
                
                for (var i = 0; i < this.TYPE_LI_LENGTH; i++){
                    var q = ARR_TYPEC_DATA_NUM[i];
                    // console.log('i : '+ i +', q :' + q);
                    this._exampleText = this.questionInfo.exampleList[i];                    
                    this.$typeCList.find('li').eq(i).attr('data-number', i+1)
                    this.$typeCList.find('li').eq(i).attr('data-user',ARR_TYPEC_DATA_NUM[i]);
                    this.$typeCList.find('li').eq(i).find('button').text(ARR_TYPEC_DATA_NUM[i]);
                    this.$typeCList.find('li').eq(i).find('p').html('<span class="num">' + this._exampleText.num + '</span> <span class="text">' + this._exampleText.title + '</span>');
                }
            } 

            // console.log('ARR_TYPEC_DATA_NUM :' + ARR_TYPEC_DATA_NUM);

            // 제일큰 숫자 찾아 해당 번호 삭제하고 미정넣기
            this.TYPEC_MAX_NUMBER = Math.max.apply(null, ARR_TYPEC_USER_NUM);
            console.log('this.TYPEC_MAX_NUMBER : ' + this.TYPEC_MAX_NUMBER);

            this.$typeCMaxLi = this.$typeCList.find('li.choice[data-user="'+this.TYPEC_MAX_NUMBER+'"');
            this.$typeCMaxLi.attr('data-user', '');
            this.$typeCMaxLi.find('button').html('<span class="hidden">미정</span>')
            this.$typeCMaxLi.removeClass('choice');
            
            // console.log('this.$typeId : ' + this.$typeId);
            // console.log('this.$typeCList : ' + this.$typeCList);
            // console.log('this.TYPE_LI_LENGTH :' + this.TYPE_LI_LENGTH);
        }
        return false;
    },
    pageMove : function(direction){
        this.PAPER_LENGTH = $('.area-question .paper').length,
        this.$paperShow = $('.area-question .paper.show'),
        this.$paperShowId = this.$paperShow.attr('id'),
        this.PAPER_NUMBER = parseInt(this.$paperShowId.replace(regex, '')); //parseInt(this.$paperShowId.substr(this.$paperShowId.length - 1)),
        
        if (direction == 'prev') {
            this.MOVE_NUMBER = this.PAPER_NUMBER - 1;
            if(this.MOVE_NUMBER <= this.PAPER_LENGTH){
                if(this.MOVE_NUMBER == '1'){ $('.btn-area .btn-prev').hide(); }    
                if(this.MOVE_NUMBER <= this.PAPER_LENGTH) { $('.btn-area .btn-next').show(); }
            }
        } else {
            this.MOVE_NUMBER = this.PAPER_NUMBER + 1;             
            if(this.MOVE_NUMBER <= this.PAPER_LENGTH){
                if(this.MOVE_NUMBER == '2'){ $('.btn-area .btn-prev').show(); }
                if(this.MOVE_NUMBER == this.PAPER_LENGTH) { $('.btn-area .btn-next').hide(); }
            }
        }
        
        // console.log('direction : ' + direction);
        // console.log('this.PAPER_LENGTH : ' + this.PAPER_LENGTH);
        // console.log('this.$paperShowId : ' + this.$paperShowId);
        // console.log('this.PAPER_NUMBER : ' + this.PAPER_NUMBER);

        $('.area-nav li:eq('+(this.MOVE_NUMBER-1)+')').addClass('active').siblings().removeClass('active');
        $('#' + this.$paperShowId).removeClass('show');
        $('#question' + this.MOVE_NUMBER).addClass('show');

        return false;
    },
    navClick : function(navNumber) {
        this.PAPER_LENGTH = $('.area-question .paper').length,
        this.$paperShow = $('.area-question .paper.show'),
        this.$paperShowId = this.$paperShow.attr('id');

        if(navNumber == 1){
            $('.btdn-area .btn-next').show();
            $('.btn-area .btn-prev').hide();
        }

        if(navNumber == this.PAPER_LENGTH){
            $('.btn-area .btn-next').hide();
            $('.btn-area .btn-prev').show();
        }

        $('.area-nav li:eq('+(navNumber-1)+')').addClass('active').siblings().removeClass('active');
        $('#' + this.$paperShowId).removeClass('show');
        $('#question' + navNumber).addClass('show');

        return false;
    },
    gradeScoreClick : function(e) {
        this.sectionPapers.style.display = 'none';
        this.sectionResult.style.display = 'block';

        $('.paper').removeClass('show');
        $('.area-nav li').removeClass('active');

        // console.log(this.solveData);

        this.solveInfo = this.solveData.solveInfo;
        this.TARGET_SCORE = this.solveInfo.targetScore;
        this.USER_SCORE = this.solveInfo.userScore;
        this.QUESTION_LENTH = this.solveData.questionInfo.length;
                
        for (var i = 0; i < this.QUESTION_LENTH; i++) {
            arrTest = new Array();
            ARR_TYPEC_DATA_NUM = new Array();
            ARR_TYPEC_USER_NUM = new Array();
            this.$typeId = $('#question' + (i+1));
            this.$typeClass = this.$typeId.attr('class');
            this.questionInfo = this.solveData.questionInfo[i];

            // 문제 유형 :: 객관식:MULTI(typeA),TF(TF:typeB), 요약하기(SUMMERY:typeC)
            if(this.$typeClass.indexOf('typeC') !== -1) {
                this._choiceAnwserValue = [];
                this.$typeCList = this.$typeId.find('.summary-list');
                this.TYPE_LI_LENGTH = this.$typeCList.find('li').length;
                this.$typeCList.find('li p').html('');
                this.$typeCList.find('li button').html('');

                this.$typeCList.removeClass('completion');
                for (var q = 0; q < this.TYPE_LI_LENGTH; q++){
                    console.log('i : '+ i +', q :' + q);
                    this._exampleText = this.questionInfo.exampleList[q];

                    console.log('this._exampleText : ' + this._exampleText.id);
                    // console.log(this.$typeCList.find('li').eq(q).attr('data-number'));
                    ARR_TYPEC_DATA_NUM.push(this.$typeCList.find('li').eq(q).attr('data-number'));
                    ARR_TYPEC_USER_NUM.push(this.$typeCList.find('li').eq(q).attr('data-user'));

                    this.$typeCList.find('li').eq(q).attr('data-user',ARR_TYPEC_DATA_NUM[q]);
                    this.$typeCList.find('li').eq(q).attr('data-number',this._exampleText.num.replace(regex, ''));
                    this.$typeCList.find('li').eq(q).find('p').html('<span class="num">' + this._exampleText.num + '</span> <span class="text">' + this._exampleText.title + '</span>');
                    this.$typeCList.find('li').eq(q).find('button').text(ARR_TYPEC_DATA_NUM[q]);
                }
                
                this._choiceAnwserValue = ARR_TYPEC_DATA_NUM;
                console.log('this.$typeId : #question' + (i+1) + ', this.TYPE_LI_LENGTH : ' + this.TYPE_LI_LENGTH );
                console.log('ARR_TYPEC_DATA_NUM :' + ARR_TYPEC_DATA_NUM + ', ARR_TYPEC_USER_NUM :' + ARR_TYPEC_USER_NUM);
            } else if(this.$typeClass.indexOf('typeB') !== -1) {
                this._choiceAnwserValue = this.$typeId.find('.btn-example .choice').text();
            } else {
                this._choiceAnwserValue = this.$typeId.find('.example-list li.choice button .sign').text();
            }

            this.solveData.questionInfo[i].userAnswer = this._choiceAnwserValue;
            // console.log("this._choiceAnwserValue : " + this._choiceAnwserValue);
            // console.log(i + " : "+ this.solveData.questionInfo[i].userAnswer); 
            
            //임시임시임시 ::: 점수 체크하기위해 만듦
            if(this.$typeClass.indexOf('typeC') !== -1) {
                var arrTypeCResultTest = new Array();
                arrTypeCResultTest = ['T','F','T','F','T','F','F'];
                this.solveData.questionInfo[i].grade = arrTypeCResultTest;
            } else {
                if(this._choiceAnwserValue == '') {this._choiceAnwserValue = 'a';}
                if(this._choiceAnwserValue == 'a') {this.solveData.questionInfo[i].grade = 'T';} else {this.solveData.questionInfo[i].grade = 'F';}
            }            
        }
        
        //임시임시임시 ::: 점수 체크하기위해 만듦
        if(this.USER_SCORE == '') {this.USER_SCORE = '70'};

        if(this.USER_SCORE == '100'){
            this._gradeResultText = 'perfect';
        } else if(this.USER_SCORE >= this.TARGET_SCORE) {
            this._gradeResultText = 'pass';
        } else {
            this._gradeResultText = 'fail';
        }

        $('#myScore').text(this.USER_SCORE);
        $('#targetScore').text(this.TARGET_SCORE);
        $('.grade-' + this._gradeResultText).show();

        // console.log('this.USER_SCORE : ' + this.USER_SCORE);        
        return false;
    },  
    gradeResultView : function(e) {
        this.sectionPapers.style.display = 'block';
        this.sectionResult.style.display = 'none';
        this.solveInfo = this.solveData.solveInfo;
        this.QUESTION_LENTH = this.solveData.questionInfo.length;

        // console.log(this.solveData.questionInfo);
        for (var i = 0; i < this.QUESTION_LENTH; i++) {
            this.questionInfo = this.solveData.questionInfo[i];
            // console.log(this.questionInfo.userAnswer);
            
            if(!(this.questionInfo.type == 'SUMMERY')){
                if(this.questionInfo.grade == 'T') {
                    this._gradeText = 'correct';
                } else {
                    this._gradeText = 'error';
                }
            }

            if(this.questionInfo.type == 'SUMMERY') {
                // console.log('#question' + (i+1));
                for (var q = 0; q < this.questionInfo.grade.length; q++) {
                    // console.log('this.questionInfo.grade[q] : ' + this.questionInfo.grade[q]);
                    if(this.questionInfo.grade[q] == 'T') {
                        this._gradeText = 'correct';
                    } else {
                        this._gradeText = 'error';
                    }
                    $('#question' + (i+1)).find('li').eq(q).addClass(this._gradeText);
                }                
            }

            $('#question'+(i+1)+' .question-box').addClass(this._gradeText);
            $('.area-nav li').eq(i).addClass(this._gradeText);            
        }
            
        $('#question1').addClass('show');
        $('.area-nav li button[name="question1"]').parent().addClass('active');
        $('.btn-example button, .btn-control button, .example-list button, .summary-list button').removeAttr('onclick');
        $('.btn-area .btn-prev').hide();
        $('.btn-area .btn-next').show();
        $('.btn-grade').remove();

        return false;
    }      
};