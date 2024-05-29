/**
 * Ebook Mobile Webview 메소드 모음
 * @author JSM (2021.11)
 * @version 0.1
 * @see /ebook/js/audiosprite.js
 * @see 참고사항
 * #주요정책
 * - 태블릿과 같은 데이터를 가져와 활용함
 * - 적응형 720 ,360 기준으로 작업(320 준수)
 * - 화면 구분은 크게 두가지 hv(단어 / 1~2단계) ,hs(문장 / 3~8단계)
 * #변수명 규칙
 * - 자료형 숫자값은 대문자,(_)언더바
 * - 클래스 선택자는 앞에 ($)달러,단어별 카멜
 * - 태그와 태그속성은 단어별 카멜, 뒤에 속성(ex : Attr, Text, Html)
 * - ✔사운드관련 주석은 기존을 최대한 유지
 * #주석
 * - #0번~ css UX
 * - #A는 사운드 self
 * - #B는 사운드 auto
 * - #C는 사운드 공통
 * - #D는 self와 auto의 공통기능
 * *순서
 * - 환경세팅 -> 내지 사운드 및 원문구현 -> 화면구성UI/UX 인터렉션
 **/


// 환경세팅에 필요한 공통변수
var read_to_me_status = false,
	read_it_myself_status = false,
	ebook_browser,
	timeoutId1,
	timeoutId2,
	reading_start_time,
	reading_end_time;

var page_read_check = [];

$(function() {
	$(window.document).on("selectstart", function(event) { return false; });
});


// eBook mobile close button
function eBook_close() {
	event_stopFalse();

	// userAgent
	var varUA = navigator.userAgent.toLowerCase();
	if (varUA.match('android') != null) {
		// Android
		try {
			window.Ebook.eBook_mobile_close();
		} catch (exception) {
			console.log(exception);
		}
	} else if (varUA.indexOf("iphone") > -1 || varUA.indexOf("ipad") > -1 || varUA.indexOf("ipod") > -1) {
		// iOS
		try {
			webkit.messageHandlers.callbackHandler.postMessage('ebook_close');
		} catch (exception) {
			console.log(exception);
		}
	} else {
		// Etc
		try {
			window.Ebook.eBook_mobile_close();
		} catch (exception) {
			console.log(exception);
		}
	}
}


// (의문) 사용하는건가?
function turn_arrow(direction) {
	if (direction == 'prev') {
		init_rtm_sound_load();
		event_stopFalse();
	} else {
		init_rtm_sound_load();
		event_stopFalse();
	}
}


// (의문) 사용하는건가? // Android Issue Fix
function init_rtm_sound_load() {
	try {
		playing_sound.play_readtome(0, 0);
	} catch (exception) {
		ebook_status = "init";
		$("#text_status").val(ebook_status);
	}
}


// #D번 hv(1~2단계) 공통기능 :: #자막 id값 부여 (#A-1-1번, #B-1번)
function create_sentence_highlight_id() {
	var hid = randomString();
	$("#highlight_status").html('');
	$("#highlight_status").append("<div id='" + hid + "'></div>")
	highlight_id = hid;
}


function randomString() {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var string_length = 15;
	var randomstring = '';
	for (var i = 0; i < string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomstring += chars.substring(rnum, rnum + 1);
	}
	return randomstring;
}

// duration control hv(1~2단계)
function wait(timeout) {
	var deferred = $.Deferred();
	timeoutId1 = setTimeout(deferred.resolve, timeout);
	return deferred.promise();
}

// duration control hs(3~8단계)
function wait2(timeout) {
	var deferred = $.Deferred();
	timeoutId2 = setTimeout(deferred.resolve, timeout);
	return deferred.promise();
}

function clear_timeout() {
	clearTimeout(timeoutId2);
}

function getNextIdx(idx, length) {
	return (idx + 1);
}


(function() {
	// 외부 라이브러리와 충돌을 막고자 모듈화.
	// 브라우저 및 버전을 구하기 위한 변수들.
	'use strict';
	var agent = navigator.userAgent.toLowerCase(),
		name = navigator.appName,
		browser;

	// MS 계열 브라우저를 구분하기 위함.
	if (name === 'Microsoft Internet Explorer' || agent.indexOf('trident') > -1 || agent.indexOf('edge/') > -1) {
		browser = 'ie';
		if (name === 'Microsoft Internet Explorer') { // IE old version (IE 10 or Lower)
			agent = /msie ([0-9]{1,}[\.0-9]{0,})/.exec(agent);
			browser += parseInt(agent[1]);
		} else { // IE 11+
			if (agent.indexOf('trident') > -1) { // IE 11
				browser += 11;
			} else if (agent.indexOf('edge/') > -1) { // Edge
				browser = 'edge';
			}
		}
	} else if (agent.indexOf('safari') > -1) { // Chrome or Safari
		if (agent.indexOf('opr') > -1) { // Opera
			browser = 'opera';
		} else if (agent.indexOf('chrome') > -1) { // Chrome
			browser = 'chrome';
		} else { // Safari
			browser = 'safari';
		}
	} else if (agent.indexOf('firefox') > -1) { // Firefox
		browser = 'firefox';
	}
	// IE: ie7~ie11, Edge: edge, Chrome: chrome, Firefox: firefox, Safari: safari, Opera: opera
	// document.getElementsByTagName('html')[0].className = browser;
	ebook_browser = browser;
}());



// 내지 사운드 및 원문구현에 필요한 공통변수
var script_sources = [],
	highlight_loop,
	highlight_loop2,
	audio_loop,
	sentence_play_time_out,
	audio_element_script,
	script_pno_set,
	playing_audio_id,
	highlight_id,
	audioScriptId,
	audioScriptURL,
	audioScriptHtml,
	aid,
	currentFile,
	sprite,
	playing_sound,
	eBookType,
	eBookClass,
	objType,
	POSITION_NUM,
	SCRIPT_LAST_NUM;
var playing_sentence = -1; // 1번 해결점 :: 꼭 있어야 하는 값


// #C번-공통 사운드, 스크립트 시간 정보
// get Sound Resources Module :: audiosprite.js
(function Get_sound_resouces(window) {
	var sound_source = [];
	var page_sound_source = [];
	var get_sound_resouces = {

		rim_sound_resource: function(sound_obj) {
			var sentence_object = $(sound_obj).find(".sentence"),
				page_end_time,
				page_start_time,
				term;

			// (테스트용) 나중에 삭제해야됨
			eBookType = $('#ebookWrap').attr('type'),
				eBookClass = $('#ebookWrap').attr('class');

			$(sentence_object).each(function(index) {
				var sentence = $(this);

				// hv(1~2단계일때)
				if (eBookType === 'hv') {
					page_end_time = parseInt(sentence.children('span').last().attr('end'));
					page_start_time = parseInt(sentence.children('span').first().attr('start'));
				}
				// hs(3~9단계일때)
				if (eBookType === 'hs') {
					page_end_time = parseInt(sentence.attr('end-time'));
					page_start_time = parseInt(sentence.attr('start-time'));
				}
				term = page_end_time - page_start_time,
					sound_source[index] = {
						start: page_start_time,
						length: parseInt(term)
					};
			});
			return sound_source;
		},

		rtm_sound_resource: function(page_object) {
			var pages = $(page_object).find(".script");

			$(pages).each(function(index) {
				var page = $(this);

				// hv(1~2단계일때)
				if (eBookType === 'hv') {
					page_end_time = parseInt(page.children('span.sentence').last().children('span.voca').last().attr('end'));
					page_start_time = parseInt(page.children('span.sentence').first().children('span.voca').first().attr('start'));
				}
				// hs(3~9단계일때)
				if (eBookType === 'hs') {
					page_end_time = parseInt(page.children('.sentence').last().attr('end-time'));
					page_start_time = parseInt(page.children('.sentence').first().attr('start-time'));
				}
				term = page_end_time - page_start_time,
					page_sound_source[index] = {
						start: page_start_time,
						// last vocab end time of page
						length: page_end_time
					}
			});
			return page_sound_source;
		}
	}
	window.get_sound_resouces = get_sound_resouces;
})(window);


// #C번-공통 #사운드 이벤트 중지
function event_stop() {
	// rim
	if ((parseInt(playing_sentence) - 1) > -1) {
		playing_sound.stop_sentence((parseInt(playing_sentence) - 1));
	}

	// rtm
	playing_sound.stop_sentence(rtm_start_index);

	$('.inside .script span').removeClass('highlight_read_to_me');
	$('.inside .script span').removeClass('highlight');

	playing_audio_id = "";
	if (typeof highlight_id != "undefined") {
		highlight_id = "";
	}
}

// event_stopAuto
function event_stopAuto() {
	event_stop();
	read_to_me_status = true;
	read_it_myself_status = false;
}

// event_stopSelf
function event_stopSelf() {
	event_stop();
	read_to_me_status = false;
	read_it_myself_status = true;

}

// event_stopFalse
function event_stopFalse() {
	event_stop();
	read_to_me_status = false;
	read_it_myself_status = false;
}


// #A-1-3번 hs(3~8단계) #self
function pno_run_highlight_read_it_myself(pno, start, end) {
	var duration = end - start,
		obj = $(".script").find('.sentence[pno=' + pno + '] > span');

	$(obj).addClass('highlight');

	highlight_loop = wait2(duration).done(function() {
		$(obj).removeClass('highlight');
	});
}


// #B-1-2번 hv(1~2단계) #self
function voca_run_highlight_read_it_myself(voca_no, start, end) {
	var duration = end - start,
		obj = $(".sentence").find('.voca[voca_id=' + voca_no + ']');

	$(obj).addClass('highlight');

	wait(duration).done(function() {
		$(obj).removeClass('highlight');
	});
}


// #B-1-1번 hs(3~8단계) #auto
function pno_run_highlight_read_to_me(pno, start, end) {
	var duration = end - start,
		obj = $(".script").find('.sentence[pno=' + pno + '] > span');

	$(obj).addClass('highlight_read_to_me');

	highlight_loop = wait2(duration).done(function() {
		$(obj).removeClass('highlight_read_to_me');
	});

	playing_sentence = parseInt(playing_sentence);
}


// #D번 hv(1~2단계) 공통기능 :: #단어 강조 (#A-1-2번, #B-1-1번)
function voca_children_node_highlight(obj, lid) {
	voca_sources = [],
		voca_voca_no_set = [];

	var s_seconds, e_seconds, idx, nextIdx;

	$(obj).children('span').each(function(index) {
		s_seconds = $(this).attr('start');
		e_seconds = $(this).attr('end');

		voca_sources.push({
			voca_no: $(this).attr('voca_id'),
			start: parseInt(s_seconds),
			end: parseInt(e_seconds)
		});
		voca_voca_no_set.push($(this).attr('voca_id'));
	});

	if (temp_voca_voca_no_set[0] === voca_voca_no_set[0]) {
		temp_voca_voca_no_set = [];
	} else {
		temp_voca_voca_no_set = voca_voca_no_set;
	}

	idx = 0;
	nextIdx = getNextIdx(idx, voca_sources.length);

	voca_loop(idx, highlight_id, lid);
}


// #A-1-1번 hv(1~2단계) #auto
function voca_run_highlight_read_to_me(voca_no, start, end) {
	var duration = end - start,
		obj = $(".sentence").find('.voca[voca_id=' + voca_no + ']');

	$(obj).addClass('highlight_read_to_me');

	wait(duration).done(function() {
		$(obj).removeClass('highlight_read_to_me');
	});
}


// #B-1번 #auto :: 문장 강조 시간 계산
var just_end_time = 0;
var empty_time = 0;
function play_loop(idx, id, lid) {
	if (idx < script_sources.length && read_to_me_status) {
		var pno = script_sources[idx].pno,
			start = script_sources[idx].start,
			end = script_sources[idx].end,
			duration = end - start;

		playing_sentence = pno;
		if (just_end_time > 0) {
			empty_time = parseInt(start) - just_end_time + empty_time;
		}
//하이라이트 초기화
		if (read_to_me_status) {
			wait(empty_time).done(function() {

				if (!read_it_myself_status) {
					POSITION_NUM = parseInt($('#ebookWrap').attr('page_position'));

					// hv(1~2단계일때)
					if (eBookType === 'hv') {
						SCRIPT_LAST_NUM = $('#page'+ POSITION_NUM + ' .script .sentence').last().attr('sentence_no');
						voca_children_node_highlight($(".sentence[sentence_no=" + pno + "]"), lid);
					}
					// hs(3~9단계일때)
					if (eBookType === 'hs') {
						SCRIPT_LAST_NUM = lid;
						pno_run_highlight_read_to_me(pno, start, end);

						// 마지막 문장시 오른쪽 버튼 활성화
						if (playing_sentence-1 === parseInt(SCRIPT_LAST_NUM)) {
							$('.btn-inside-control .page-move.next').addClass('on');
						}
					}
				}
			});
			just_end_time = end;

			highlight_loop2 = wait(duration).done(function() {
				//idx가 현재 script_source에 포함되는지 판단 후 재귀호출
				if ($.inArray(pno, script_pno_set) !== -1 && $("#" + highlight_id).attr("id") === id) {
					play_loop(getNextIdx(idx, script_sources.length), id, lid);
				}
			});
		} else {
			return false;
		}
	}
}

// #D번 hv(1~2단계) 공통기능 :: #단어 강조 시간 계산(#A-1-2-1번, #B-1-1-1번)
function voca_loop(idx, id, lid) {
	if (idx < voca_sources.length) {
		var voca_no = voca_sources[idx].voca_no,
			start = voca_sources[idx].start,
			end = voca_sources[idx].end,
			duration = end - start;

		if (read_to_me_status || read_it_myself_status) {
			// 단어끼리 사이의 공백시간 처리
			if (voca_sources[idx + 1]) {
				if (voca_sources[idx + 1].start - end > 1) {
					duration = duration + voca_sources[idx + 1].start - end;
				}
			}

			// 마지막 문장의 단어에 포커스가 들어왔을시 오른쪽 버튼 활성화
			if (eBookType === 'hv' && voca_no === lid) {
				$('.btn-inside-control .page-move.next').addClass('on');
			}

			if (read_to_me_status) {
				voca_run_highlight_read_to_me(voca_no, start, end);
			} else {
				voca_run_highlight_read_it_myself(voca_no, start, end);
			}

			wait(duration).done(function() {
				// idx가 현재 voca_sources 포함되는지 판단 후 재귀호출
				if ($.inArray(voca_no, voca_voca_no_set) !== -1 && $("#" + highlight_id).attr("id") === id) {
					voca_loop(getNextIdx(idx, voca_sources.length), id, lid);
				} else {
					temp_voca_voca_no_set = [];
					return false;
				}
			});
		} else {
			return false;
		}
	}
}



// #B번 #auto :: Read to Me
var rtm_start_index = 0;
function read_to_me(handler, page, view, move) {
	var page_script,
		s_seconds,
		e_seconds,
		idx,
		nextIdx,
		last_id,
		target,
		target_script;

	eBookType = $('#ebookWrap').attr('type'),
		eBookClass = $('#ebookWrap').attr('class'),
		objType = eBookType === 'hv' ? 'sentence_no' : 'pno';

	if (page === undefined) {
		page = 0,
			view = page,
			move = false;
	}


	if (!handler) {
		event_stopAuto();
		read_to_me(read_to_me_status, page, view, true);
		return;
	}


	page_script = $('#page' + view).find(".script > .sentence");
	if (move === true) {
		playing_sentence = parseInt($('#page' + view).find(".script > .sentence").first().attr(objType));
	}

	SCRIPT_LAST_NUM = parseInt($('#page' + view).find(".script > .sentence").last().attr(objType));
	if(playing_sentence === SCRIPT_LAST_NUM + 1){
		event_stopAuto();
	}

	// statment hv(1~2단계일때)
	if (eBookType === 'hv') {
		if (playing_sentence !== -1) {
			target = parseInt(playing_sentence);
			target_script = $('#page' + view).find('.script > .sentence[sentence_no="' + playing_sentence + '"]');
			s_seconds = (parseInt($(target_script).find('span').first().attr('start')) / 1000);
		} else {
			s_seconds = (parseInt($(page_script).find('span').first().attr('start')) / 1000);
			playing_sentence = parseInt($('#page' + view).find(".sentence").first().attr("sentence_no"));
		}

		rtm_start_index = playing_sentence;
		playing_sound.play_readtome(playing_sentence, page_sound_source[view - 1].length);
	}

	// statment hs(3~9단계일때)
	if (eBookType === 'hs') {
		var sound_index = 0;
		if (playing_sentence !== -1) {
			target = parseInt(playing_sentence);
			target_script = $('#page' + view).find(".script > .sentence[pno='" + target + "']");
			s_seconds = (parseInt($(target_script).first().attr('start-time')) / 1000);
			sound_index = parseInt(playing_sentence) - 1;
		} else {
			s_seconds = (parseInt($(page_script).first().attr('start-time')) / 1000);
			sound_index = parseInt($('#page' + view).find(".sentence").first().attr("pno")) - 1;
			playing_sentence = sound_index;
		}
		rtm_start_index = playing_sentence;
		playing_sound.play_readtome(parseInt(sound_index), page_sound_source[view - 1].length);

	}


	// init
	script_sources = [];
	script_pno_set = [];
	// hv(1~2단계일때)
	if (eBookType === 'hv') {
		$(page_script).each(function(index) {
			var sentence = $(this).find('.voca');

			if (playing_sentence !== -1 && parseInt(playing_sentence) > parseInt($(this).attr('sentence_no'))) {
				return;
			}

			s_seconds = parseInt($(sentence).first().attr('start'));
			e_seconds = parseInt($(sentence).last().attr('end'));

			script_sources.push({
				pno: $(this).attr('sentence_no'),
				start: parseInt(s_seconds),
				end: parseInt(e_seconds)
			});
			script_pno_set.push($(this).attr('sentence_no'));
		});
		last_id = $(page_script).find(".voca").last().attr("voca_id");
	}
	// hs(3~9단계일때)
	if (eBookType === 'hs') {
		$(page_script).each(function(index) {
			if (playing_sentence !== -1 && parseInt(playing_sentence) > parseInt($(this).attr('pno'))) {
				return;
			}

			s_seconds = $(this).attr('start-time');
			e_seconds = $(this).attr('end-time');
			script_sources.push({
				pno: $(this).attr('pno'),
				start: parseInt(s_seconds),
				end: parseInt(e_seconds)
			});
			script_pno_set.push($(this).attr('pno'));
		});
		last_id = $(page_script).last().attr('pno');
	}

	idx = 0;
	empty_time = 0;
	just_end_time = 0;
	nextIdx = getNextIdx(idx, script_sources.length);
	create_sentence_highlight_id();
	play_loop(idx, highlight_id, last_id);
}



// #A-1번 #self :: 한 문장기준으로 읽어줌
var voca_sources = [],
	voca_vdoca_no_set = [],
	temp_voca_voca_no_set = [];
function sentence_play_mobile(obj) {
	var smillis = $(obj).attr('start-time'),
		emillis = $(obj).attr('end-time');
	POSITION_NUM = parseInt($('#ebookWrap').attr('page_position'));
	objType = eBookType === 'hv' ? 'sentence_no' : 'pno';
	SCRIPT_LAST_NUM = $('#page'+ POSITION_NUM + ' .script .sentence').last().attr(objType);

	event_stopSelf();
	$('.btn-inside-control .page-sound.auto').hide();
	$('.btn-inside-control .page-sound.self').show();

	playing_sentence = parseInt($(obj).attr(objType));
	if(playing_sentence > SCRIPT_LAST_NUM) {
		playing_sentence = playing_sentence - 1;
	}
	// hv(1~2단계일때)
	if (eBookType === 'hv') {
		create_sentence_highlight_id();
		voca_children_node_highlight(obj);
	}
	// hs(3~9단계일때)
	if (eBookType === 'hs') {
		clear_timeout();
		pno_run_highlight_read_it_myself($(obj).attr(objType), smillis, emillis);
	}
}


// #A번 #self :: 단어(문장) 클릭시
function sentence_play(obj) {
	eBookType = $('#ebookWrap').attr('type'),
	eBookClass = $('#ebookWrap').attr('class');

	sentence_play_mobile(obj);

	objType = eBookType === 'hv' ? obj.getAttribute('sentence_no') : parseInt(obj.getAttribute('pno')) - 1;
	playing_sound.play_position(objType);
}


// #2-3번 #내지 사운드 파일의 정보를 받아서 실행해줌
var ebookSoundInfo = function(audioScriptId) {
	ebookWrap.sound(audioScriptId);
};

function leadingZeros(n, digits) {
	var zero = '';
	n = n.toString();

	if (n.length < digits) {
		for (var i = 0; i < digits - n.length; i++)
			zero += '0';
	}
	return zero + n;
}

function studyLog_save(eBookData){
	var regiDate = reading_start_time.replace(/-/g,'/');
	var regiTime = Date.parse(regiDate);
	var today = new Date();
	var reading_time = today.getTime() - regiTime;

	page_read_check = [];
	reading_start_time = reading_end_time;

	if (parseInt(eBookData['standard_reading_time'])*1000*0.8 < reading_time) {
		$.ajax({
			type: 'post',
			url: '/api/v1/contents/'+eBookData['content']['id']+'/ebook/history',
			data: {
				'reading_time': reading_time
			},
			dataType: 'json',
			success: function(json, textStatus, jqXHR) {
				if (!json.result) {
					//결과없음
				} else {
					//학습기록 완료
				}
			}
		});
	}
}



/**
 * @ebookWrap 함수목록
 * eCoacingMark,
 * sound,
 * init,
 */
var ebookWrap = {
	eCoacingMark: function() {
		// #코칭 마크 - 계정당 최초 한번만 뜸
		var coachingLanguage,
			hiddenText = '',
			language = $('html>head>meta[name=api_locale]').attr('content');

		if (language === undefined){
			language = 'ko_KR';
		}

		if(language === 'ko_KR') {
			$('#ebookWrap').addClass('KR');

			coachingLanguage = '더 이상 보지 않기';
			hiddenText += '	<p class="text-content">';
			hiddenText += '		<span>Read to Me 모드 현재 읽어주고 있는 문장이 하이라이트로 표시됩니다.</span>';
			hiddenText += '		<span>문장을 클릭하면 해당 문장의 음성을 들을 수 있습니다. 문장 클릭 시 Read to Me 모드는 중지됩니다.</span>';
			hiddenText += '	</p>';
			hiddenText += '	<p class="text-bar">';
			hiddenText += '		<span>이전 페이지로 이동합니다.</span>';
			hiddenText += '		<span>다음 페이지로 이동합니다.</span>';
			hiddenText += '		<span>Read to Me(읽어주기) 또는 Read it Myself(직접읽기)모드로 전환됩니다.</span>';
			hiddenText += '		<span>텍스트 크기를 조절할 수 있습니다.</span>';
			hiddenText += '	</p>';
		} else if (language === 'en_US') {
			$('#ebookWrap').addClass('EN');

			coachingLanguage = 'Do not show again.';
			hiddenText += '	<p class="text-content">';
			hiddenText += '		<span>Read to Me Mode Words or sentences are highlighted as the story is read.</span>';
			hiddenText += '		<span>Click any sentence to hear that sentence read aloud. Clicking a sentence will stop Read to Me mode.</span>';
			hiddenText += '	</p>';
			hiddenText += '	<p class="text-bar">';
			hiddenText += '		<span>Go to the previous page.</span>';
			hiddenText += '		<span>Go to the next page.</span>';
			hiddenText += '		<span>Switch between Read to Me mode and Read It Myself mode.</span>';
			hiddenText += '		<span>Adjust text size here.</span>';
			hiddenText += '	</p>';
		} else if (language === 'ja_JP') {
			$('#ebookWrap').addClass('JP');

			coachingLanguage = 'つぎからみない';
			hiddenText += '	<p class="text-content">';
			hiddenText += '		<span>Read to Meモードで よんでくれるこえにあわせて、ぶんやたんごをきいろであらわします。</span>';
			hiddenText += '		<span>ぶんをクリックするとよんでくれます。 Read It Myselfモードになります。</span>';
			hiddenText += '	</p>';
			hiddenText += '	<p class="text-bar">';
			hiddenText += '		<span>まえのページへもどる</span>';
			hiddenText += '		<span>つぎのページにすすむ</span>';
			hiddenText += '		<span>Read to Me（よんでもらう）Read It Myself（じぶんでよむ） をきりかえる</span>';
			hiddenText += '		<span>もじの大きさをへんこうします。</span>';
			hiddenText += '	</p>';
		} else if (language === 'zh_CN') {
			$('#ebookWrap').addClass('CN');

			coachingLanguage = '不再显示';
			hiddenText += '	<p class="text-content">';
			hiddenText += '		<span>Read to Me模式下，当前所读单词加有特效</span>';
			hiddenText += '		<span>点击任意语句，可以听到相应音效 注，若 Read to Me模式中断，可以点击右上方喇叭按键，重新开启。</span>';
			hiddenText += '	</p>';
			hiddenText += '	<p class="text-bar">';
			hiddenText += '		<span>点击返回 上一页</span>';
			hiddenText += '		<span>点击翻到 下一页</span>';
			hiddenText += '		<span>点击转换为Read to Me（听读）或 Read It Myself（自读）模式</span>';
			hiddenText += '		<span>此处可调整 字体大小。</span>';
			hiddenText += '	</p>';
		} else if (language === 'zh_TW') {
			$('#ebookWrap').addClass('TW');

			coachingLanguage = '不再顯示';
			hiddenText += '	<p class="text-content">';
			hiddenText += '		<span>Read to Me模式下，當前所讀單字加有特效</span>';
			hiddenText += '		<span>點擊任意語句，可以聽到相應音效注，如 Read to Me模式中斷，可以點擊右上方喇叭按鍵，重新開啟。</span>';
			hiddenText += '	</p>';
			hiddenText += '	<p class="text-bar">';
			hiddenText += '		<span>點擊返回 上一頁</span>';
			hiddenText += '		<span>點擊翻到 下一頁</span>';
			hiddenText += '		<span>點擊轉換為Read to Me（聽讀）或 Read It Myself（自讀）模式</span>';
			hiddenText += '		<span>此處可調整字體大小。</span>';
			hiddenText += '	</p>';
		} else if (language === 'zh_HK') {
			$('#ebookWrap').addClass('HK');

			coachingLanguage = '不再顯示';
			hiddenText += '	<p class="text-content">';
			hiddenText += '		<span>Read to Me模式下，當前所讀單字加有特效</span>';
			hiddenText += '		<span>點擊任意語句，可以聽到相應音效注，如 Read to Me模式中斷，可以點擊右上方喇叭按鍵，重新開啟。</span>';
			hiddenText += '	</p>';
			hiddenText += '	<p class="text-bar">';
			hiddenText += '		<span>點擊返回 上一頁</span>';
			hiddenText += '		<span>點擊翻到 下一頁</span>';
			hiddenText += '		<span>點擊轉換為Read to Me（聽讀）或 Read It Myself（自讀）模式</span>';
			hiddenText += '		<span>此處可調整字體大小。</span>';
			hiddenText += '	</p>';
		}


		$('.coaching_marks .btn-close_box .text').text(coachingLanguage);
		$('.coaching_marks .content').append(hiddenText);

		$('.coaching_marks .btn-coaching_close').on('click', function() {
			$('.coaching_marks').hide();

			// 다시보지않기 체크시 ebook_coach_mark_status 쿠키 값을 N으로 설정
			if ($("#btnCoachingClose").prop("checked")) {
				$.cookie("ebook_coach_mark_status", "N", { expires: 100});
			}

			// 네이티브에 전달한 title mp3 재생 요청
			// if ($('html>head>meta[name=os_name]').attr('content') === 'iOS') {
			// 	webkit.messageHandlers.onInterfacePlaySound.postMessage($('#titleAudioResource').val());
			// } else {
			// 	littlefoxJavaInterface.onInterfacePlaySound($('#titleAudioResource').val());
			// }
		});

		$(".coaching_checkbox").on("click", function(){
			if($(this).find('input').is(":checked")){
				$(this).find('input').prop("checked", true);
				$(this).addClass('checked');
			} else {
				$(this).find('input').prop("checked", false);
				$(this).removeClass('checked');
			}
		});
	},
	sound: function(audioScriptId) {
		// #2-3-1번 #내지 사운드파일 정보를 함수에 저장
		sound_source = get_sound_resouces.rim_sound_resource($("#ebookWrap .inside .list"));
		page_sound_source = get_sound_resouces.rtm_sound_resource($("#ebookWrap .inside .list"));

		var index = 0;

		sprite = new AudioSprite(audioScriptId, sound_source);
		playing_sound = new Sound(sprite, index);
	},
	init: function(eBookData, EBOOK_WINDOW_WIDTH, EBOOK_WINDOW_HEIGHT) {
		// #모듈영역에서 사용할 변수 작성(순서대로)
		var eBackControl,
			eBackSet,
			eInsideControl,
			eInsideScript,
			eInsideStyle,
			eInsideSet,
			eFrontTitleEnd,
			eFrontControl,
			eFrontSet,
			ebookDataLoad;

		var FONT_BASIC,
			FONT_LOCK;

		// 3-1번 #뒷표지 다시보기 클릭
		eBackControl = function() {
			// console.log('#3-1번 #뒷표지 다시보기 클릭);

			$('.cover-back .content-again').on('click', function() {
				event_stopFalse();

				if (eBookType === 'hv') {
					playing_sentence = 0;
				} else {
					playing_sentence = 1;
				}

				$('#ebookWrap').attr('page_position', '1');
				$('.cover-front').css('left', -EBOOK_WINDOW_WIDTH);
				$('.cover-back').css('left', EBOOK_WINDOW_WIDTH);
				$('.inside').css('left', 0);
				$('.inside .list').animate({ 'margin-left': 0 }, 150);
				$('.inside .list .script').animate({ scrollTop: 0 });
				$('.btn-inside-control .page-move.next, .btn-inside-control .page-zoom').show();

				if ($('.btn-inside-control .page-sound.auto').is(':visible') === true) {
					setTimeout(function() {
						event_stopAuto();
						read_to_me(read_to_me_status, 1, 1, true);
					}, 400);
				}
			});
		};

		// 3번 #뒷표지 사이즈 계산
		eBackSet = function(eBookData) {
			// console.log('#3번 #뒷표지 사이즈 계산');

			// 3_1번 #마크업 생성
			var $coverBack = $('.cover-back .inner'),
				INSIDE_BTN_HEIGHT = $('#ebookWrap .btn-inside-control').outerHeight(),
				backAgainImage = eBookData.content.thumbnail_url,
				backAgainName = eBookData.content.sub_name,
				backNextImage,
				backNextName;

			$coverBack.find('.content-again .series-img img').attr({
				'src': backAgainImage,
				'alt': backAgainName
			});

			if (!eBookData.next_content) {
				console.log('***** 다음컨텐츠 없음');
				$coverBack.find('.content-next').remove();
			} else {
				backNextImage = eBookData.next_content.thumbnail_url,
					backNextName = eBookData.next_content.sub_name;

				$coverBack.find('.content-next .series-img img').attr({
					'src': backNextImage,
					'alt': backNextName
				});
			}


			// 3_2번 #화면 크기 계산
			var BACK_HEIGHT,
				BACK_INNER_HEIGHT,
				BACK_ETC_HEIGHT,
				BACK_COPY_HEIGHT = $('.cover-back .copyright').innerHeight(),
				BACK_PADDING = BACK_COPY_HEIGHT + INSIDE_BTN_HEIGHT,
				BACK_WIDTH_RATIO = 7,
				BACK_HEIGHT_RATIO = 2.4,
				BACK_IMG_HEIGHT = parseInt((EBOOK_WINDOW_WIDTH / BACK_WIDTH_RATIO) * BACK_HEIGHT_RATIO);

			$('.cover-back .content-again .series-img img').bind('load', function() {
				BACK_IMG_HEIGHT = $(this).height(),
				BACK_INNER_HEIGHT = $('.cover-back .inner').height(),
				BACK_ETC_HEIGHT = EBOOK_WINDOW_HEIGHT - BACK_PADDING;

				if (BACK_INNER_HEIGHT > BACK_ETC_HEIGHT) {
					BACK_IMG_HEIGHT = EBOOK_WINDOW_WIDTH * 0.25;
					$('.cover-back .series-img img').css('height', BACK_IMG_HEIGHT);

					BACK_INNER_HEIGHT = $('.cover-back .inner').height();
				}

				BACK_HEIGHT = (EBOOK_WINDOW_HEIGHT - (BACK_INNER_HEIGHT + BACK_PADDING)) / 2;

				$('.cover-back .inner').css({
					'margin-top': BACK_HEIGHT,
					'margin-bottom': BACK_HEIGHT,
				});
			});

			$('.cover-back .copyright').css({
				'bottom': INSIDE_BTN_HEIGHT
			});
			$('.cover-back .series-img img').css({
				'height': BACK_IMG_HEIGHT
			});

			// 표지에서 내지로 넘어갈때 이동UI Effect
			$('.cover-back').css('left', EBOOK_WINDOW_WIDTH);
			$('.inside').css('left', EBOOK_WINDOW_WIDTH);

			eBackControl();
		};


		// 2-1-2번 #내지 페이지 이동 구현 - 페이지 이동시 스크립트 스크롤 내용 맨위로
		eInsideControl = function(INSIDE_PAGE_LENGTH, INSIDE_SLIDE_LEFT) {
			// console.log('#2-1-2번 #내지 ƒ페이지 이동 구현');

			var PAGING_NUM,
				$moveName,
				$ebookList;

			// .page-move
			$('.btn-inside-control .page-move').on("click", function() {
				$moveName = $(this).attr('class'),
				$ebookList = $('.inside .list');
				POSITION_NUM = parseInt($('#ebookWrap').attr('page_position'));

				$('.btn-inside-control .page-move.next').removeClass('on');

				// previous
				if ($moveName.indexOf('prev') !== -1) {
					if (POSITION_NUM === INSIDE_PAGE_LENGTH + 1) {
						PAGING_NUM = POSITION_NUM - 1;

						$ebookList.animate({ 'margin-left': INSIDE_SLIDE_LEFT }, 200);
						$('.inside').css('left', 0);
						$('.cover-back').css('left', EBOOK_WINDOW_WIDTH);
						$('.btn-inside-control .page-move.next, .btn-inside-control .page-zoom').show();
					}

					if (1 < POSITION_NUM <= INSIDE_PAGE_LENGTH) {
						PAGING_NUM = POSITION_NUM - 1;

						if (INSIDE_SLIDE_LEFT === 0) {
							INSIDE_SLIDE_LEFT = -EBOOK_WINDOW_WIDTH;
						} else {
							INSIDE_SLIDE_LEFT = INSIDE_SLIDE_LEFT + EBOOK_WINDOW_WIDTH;
						}

						$ebookList.animate({ 'margin-left': INSIDE_SLIDE_LEFT }, 200);
					}

					if (POSITION_NUM <= 1) {
						PAGING_NUM = POSITION_NUM - 1;
						if (eBookType === 'hv') {
							playing_sentence = 0;
						} else {
							playing_sentence = 1;
						}

						$('.btn-inside-control .page-sound.auto').hide();
						$('.btn-inside-control .page-sound.self').show();

						$ebookList.animate({ 'margin-left': 0 }, 200);
						$('.cover-front').css('left', 0);
						$('.inside').css('left', EBOOK_WINDOW_WIDTH);
					}
				}

				// next
				if ($moveName.indexOf('next') !== -1) {
					event_stopFalse();

					if (POSITION_NUM < INSIDE_PAGE_LENGTH) {
						PAGING_NUM = POSITION_NUM + 1;

						if (POSITION_NUM === 1) {
							INSIDE_SLIDE_LEFT = -EBOOK_WINDOW_WIDTH;
						} else {
							INSIDE_SLIDE_LEFT = INSIDE_SLIDE_LEFT - EBOOK_WINDOW_WIDTH;
						}

						$ebookList.animate({ 'margin-left': INSIDE_SLIDE_LEFT }, 200);
					} else {
						$('.btn-inside-control .page-sound.auto').hide();
						$('.btn-inside-control .page-sound.self').show();

						PAGING_NUM = POSITION_NUM + 1;
						INSIDE_SLIDE_LEFT = INSIDE_SLIDE_LEFT - EBOOK_WINDOW_WIDTH;

						$ebookList.animate({ 'margin-left': INSIDE_SLIDE_LEFT }, 200);
						$('.cover-back').css('left', 0);
						$('.btn-inside-control .page-move.next, .btn-inside-control .page-zoom').hide();
					}
				}

				if (page_read_check.indexOf(PAGING_NUM) === -1) {
					page_read_check.push(PAGING_NUM);
				}

				if (page_read_check.length >= INSIDE_PAGE_LENGTH) {
					var nowDate = new Date();

					reading_end_time =
						leadingZeros(nowDate.getFullYear(), 4) + '-' +
						leadingZeros(nowDate.getMonth() + 1, 2) + '-' +
						leadingZeros(nowDate.getDate(), 2) + ' ' +

						leadingZeros(nowDate.getHours(), 2) + ':' +
						leadingZeros(nowDate.getMinutes(), 2) + ':' +
						leadingZeros(nowDate.getSeconds(), 2);

					studyLog_save(eBookData);
				}

				$('.inside #page' + PAGING_NUM + ' .script').animate({ scrollTop: 0 });
				$('#ebookWrap').attr('page_position', PAGING_NUM);

				event_stopFalse();

				if ($('.btn-inside-control .page-sound.auto').is(':visible') == true) {
					read_to_me_status = true;
					read_it_myself_status = false;
					read_to_me(read_to_me_status, PAGING_NUM, PAGING_NUM, true);
				} else {
					objType = eBookType === 'hv' ? 'sentence_no' : 'pno';
					playing_sentence = parseInt($('#page' + PAGING_NUM + ' .script > .sentence').first().attr(objType));
				}

				return false;
			});

			// .page-sound
			$('.btn-inside-control .page-sound').on("click", function() {
				$moveName = $(this).attr('class'),
				$ebookList = $('.inside .list');

				POSITION_NUM = parseInt($('#ebookWrap').attr('page_position'));

				$('.btn-inside-control .page-move.next').removeClass('on');

				if ($moveName.indexOf('sound') !== -1) {
					clear_timeout();

					if ($(this).hasClass('auto')) {
						event_stopFalse();

						$('.btn-inside-control .page-sound').hide();
						$('.btn-inside-control .self').show();
					} else {
						$('.btn-inside-control .page-sound').hide();
						$('.btn-inside-control .auto').show();

						event_stopFalse();

						if (POSITION_NUM !== $('.inside .list .page').length + 1) {
							read_to_me_status = true;
							read_it_myself_status = false;

							read_to_me(read_to_me_status, POSITION_NUM, POSITION_NUM);
						}
					}
				}

				return false;
			});

			// .page-zoom
			$('.btn-inside-control .page-zoom').on("click", function() {
				var $TextName = $(this).attr('class'),
					resize = new Array('.script *');

				resize = resize.join(',');

				var FONT_SIZE_ORIGINAL = $(resize).css('font-size'),
					FONT_SIZE_NUMBER = parseFloat(FONT_SIZE_ORIGINAL, 10),
					FONT_SIZE_NEW;

				if ($TextName.indexOf('in') !== -1) {
					FONT_SIZE_NEW = FONT_SIZE_NUMBER * 1.2;
					if ($('#ebookWrap').attr('level') <= 3) {
						FONT_LOCK = FONT_BASIC * 2;
					} else {
						FONT_LOCK = FONT_BASIC * 2.5;
					}

					if ( FONT_SIZE_NEW <  FONT_LOCK ) {
						$(resize).css('font-size', FONT_SIZE_NEW);
					}
				}

				if ($TextName.indexOf('out') !== -1) {
					FONT_SIZE_NEW = FONT_SIZE_NUMBER * 0.8;

					if ( FONT_SIZE_NEW >= 9 ) {
						$(resize).css('font-size', FONT_SIZE_NEW);
					}
				}

				return false;
			});

		};

		// 2-2-1번 #내지 스크립트 폰트 사이즈 계산
		eInsideScript = function(SCRIPT_HEIGHT) {
			var FONT_SIZE_NEW,
				FONT_SIZE = parseInt($('.script *').css('font-size')),
				SCRIPT_HEIGHT_ARRAY = $('.inside .page').map(function() {
					return $(this).find('.script').height();
				}).get(),
				SCRIPT_MAX_HEIGHT = Math.max.apply(Math, SCRIPT_HEIGHT_ARRAY);

			if (SCRIPT_MAX_HEIGHT >= SCRIPT_HEIGHT) {
				FONT_SIZE = parseInt($('.script *').css('font-size'));
				FONT_SIZE_NEW = FONT_SIZE * 0.9;

				$('.inside .page .script *').css('font-size', FONT_SIZE_NEW);
				SCRIPT_HEIGHT_ARRAY = $('.inside .page').map(function() {
					return $(this).find('.script').height();
				}).get();

				SCRIPT_MAX_HEIGHT = Math.max.apply(Math, SCRIPT_HEIGHT_ARRAY);
			}

			$('.inside .page .script').addClass('scroll');
			$('.inside .page .scroll').css('height', SCRIPT_HEIGHT);

			$(".script").each(function(){
				var speaker = '';
				var replace_speaker = '';

				$(this).find(".sentence").each(function(){
					var speaker_value = $(this).html().split("<span")[0];

					if (speaker === speaker_value && speaker_value.indexOf(":")>0 ) {
						console.log(speaker_value);

						replace_speaker = "<label style='visibility:hidden;'>"+speaker_value+"</label>";
						$(this).html($(this).html().replace(speaker_value, replace_speaker));
					}
					speaker = speaker_value;
				})
			});

			FONT_BASIC = parseInt($('.script *').css('font-size'));
		};

		// 2-1번 #내지 이미지 계산 - 화면의 넓이에 따라 이미지 계산이 되어야 한다.
		eInsideStyle = function(INSIDE_IMG_WIDTH, INSIDE_IMG_HEIGHT, onlyImg) {
			var INSIDE_PAGE_LENGTH = $('.inside .page').length,
				INSIDE_SLIDE_LEFT = parseInt($('.inside .list').css('margin-left')),
				INSIDE_BTN_HEIGHT = $('#ebookWrap .btn-inside-control').outerHeight(),
				INSIDE_HEIGHT = EBOOK_WINDOW_HEIGHT - INSIDE_BTN_HEIGHT;

			// - 내지
			$('.inside').css('height', INSIDE_HEIGHT);
			$('.inside .list').css('width', EBOOK_WINDOW_WIDTH * INSIDE_PAGE_LENGTH);
			$('.inside .page').css('width', EBOOK_WINDOW_WIDTH);
			$('.inside .page:first-child .img img').bind('load', function() {
				var SCRIPT_HEIGHT,
					INSIDE_RATIO = EBOOK_WINDOW_HEIGHT * 0.35,
					INSIDE_IMG_RATIO = EBOOK_WINDOW_WIDTH / INSIDE_IMG_WIDTH,
					INSIDE_IMG_HEIGHT2 = INSIDE_IMG_HEIGHT * INSIDE_IMG_RATIO;

				$('.inside .page .img img').css('height', INSIDE_IMG_HEIGHT2);

				// 이미지 기준비율에 맞춰 세로값에 맞는 가로값이 나오고
				// 디바이스 높이의 35%이상을 차지하면 이미지 사이즈를 줄이기
				if (INSIDE_IMG_HEIGHT2 > INSIDE_RATIO) {
					INSIDE_IMG_HEIGHT2 = INSIDE_IMG_HEIGHT2 * 0.78;

					$('.inside .page .img img').css('height', INSIDE_IMG_HEIGHT2);
				}

				// 스크립트 없을 경우
				if(onlyImg === true) {
					$('.inside .page.only-img .img').css('height', '100%');
					$('.inside .page.only-img .img img').css('height', '100%');
				}

				SCRIPT_HEIGHT = EBOOK_WINDOW_HEIGHT - (INSIDE_IMG_HEIGHT2 + INSIDE_BTN_HEIGHT);
				eInsideScript(SCRIPT_HEIGHT);
			});

			eInsideControl(INSIDE_PAGE_LENGTH, INSIDE_SLIDE_LEFT);
		};


		// 2번 #내지 사이즈 계산
		eInsideSet = function(eBookData) {
			// console.log('#2번 #내지 사이즈 계산');

			// 2_1번 #마크업 생성
			var onlyImg = false,
				insidePageHtml,
				eInsidePages = eBookData.pages;

				eInsidePages.forEach(function insidePageLoad(item) {
					insidePageHtml = '';
					insidePageHtml += '<div id="page' + item.number + '" class="page">';
					insidePageHtml += '	<div class="img"><img src="' + item.image_url + '"></div>';
					insidePageHtml += '	<div class="script">';
					insidePageHtml += item.text;
					insidePageHtml += '	</div>';
					insidePageHtml += '	<div class="paging">' + item.number + '</div>';
					insidePageHtml += '</div>';

					$('.list').append(insidePageHtml);

					// 스크립트 없을 경우
					if (item.text === null ) {
						$('#page' + item.number +' .script').remove();
						$('#page' + item.number).addClass('only-img');

						onlyImg = true;
					}
				});

			// 2_2번 #이미지 비율 계산 : 단계별 이미지사이즈 비율 기준 1~3단계 20:11, 4~8단계 10:7
			var INSIDE_IMG_WIDTH,
				INSIDE_IMG_HEIGHT,
				eBookLevel = eBookData.content.level;

			if (eBookLevel <= 3) {
				INSIDE_IMG_WIDTH = 1200,
				INSIDE_IMG_HEIGHT = 660;
			} else {
				INSIDE_IMG_WIDTH = 1000,
				INSIDE_IMG_HEIGHT = 700;
			}

			if (eBookLevel <= 2) {
				eBookType = 'hv';
			} else {
				eBookType = 'hs';
			}

			$('#ebookWrap').addClass('level' + eBookLevel);
			$('#ebookWrap').attr('level',  eBookLevel);
			$('#ebookWrap').attr('type', eBookType);

			var insideScriptSound = eBookData.movie_sound_url;
			currentFile = '';

			audioScriptId = insideScriptSound;
			if (audioScriptId !== currentFile) {
				currentFile = audioScriptId;
			}

			eInsideStyle(INSIDE_IMG_WIDTH, INSIDE_IMG_HEIGHT, onlyImg);
			ebookSoundInfo(audioScriptId);
		};

		// 1-1-1번 #앞표지에서 내지로 넘어갈때 이동UI Effect
		eFrontTitleEnd = function(soundClickText) {
			event_stopFalse();

			if (eBookType === 'hv') {
				playing_sentence = 0;
			} else {
				playing_sentence = 1;
			}

			$('#ebookWrap').attr('page_position', '1');
			$('.cover-front').css('left', '-=' + EBOOK_WINDOW_WIDTH);
			$('.inside').css('left', 0);
			$('.inside .list .script').animate({ scrollTop: 0 });

			if (soundClickText === 'auto') {
				setTimeout(function() {
					event_stopAuto();
					read_to_me(read_to_me_status, 1, 1, true);
				}, 400);
			}
		};

		// 1-1번 #앞표지 사운드 구현
		eFrontControl = function(audioTitlteId) {
			$('.btn-front-control button').on("click", function() {
				// 네이티브 전달한 title mp3 재생 중지 요청
				// if ($('html>head>meta[name=os_name]').attr('content') === 'iOS') {
				// 	webkit.messageHandlers.onInterfaceStopSound.postMessage('');
				// } else {
				// 	littlefoxJavaInterface.onInterfaceStopSound();
				// }

				var $soundClick = $(this).attr('class'),
					soundClickText;

				if ($soundClick.indexOf('auto') > -1) {
					soundClickText = 'auto';
				} else {
					soundClickText = 'self';
				}

				eFrontTitleEnd(soundClickText);

				var nowDate = new Date();
				reading_start_time =
					leadingZeros(nowDate.getFullYear(), 4) + '-' +
					leadingZeros(nowDate.getMonth() + 1, 2) + '-' +
					leadingZeros(nowDate.getDate(), 2) + ' ' +

					leadingZeros(nowDate.getHours(), 2) + ':' +
					leadingZeros(nowDate.getMinutes(), 2) + ':' +
					leadingZeros(nowDate.getSeconds(), 2);

				$('.btn-inside-control .page-sound').hide();
				$('.btn-inside-control .page-sound.' + soundClickText).show();

				if (page_read_check.indexOf(1) === -1) {
					page_read_check.push(1);
				}
			});
		};

		// 1번 #앞표지 사이즈 계산
		eFrontSet = function(eBookData) {
			var $coverFront = $('.cover-front .inner'),
				frontSeriesYN = eBookData.series,
				frontTitleImage = eBookData.title_image_url,
				frontTitleNumber = eBookData.content_sequence,
				frontTitle = eBookData.content.name,
				frontTitleSound = eBookData.title_sound_url,
				frontSubImage = eBookData.cover_image_url,
				frontSubTitle = eBookData.sub_title,
				frontTemplateUse = eBookData.mobile_template_use_yn,
				frontTemplateColor,
				FRONT_IMG_WIDHT,
				FRONT_IMG_HEIGHT,
				FRONT_PADDING;

			// 1_2번 #화면 크기 계산
			var FRONT_BTN_HEIGHT = $('.cover-front .btn-front-control').height(),
				FRONT_HEIGHT = EBOOK_WINDOW_HEIGHT - FRONT_BTN_HEIGHT;

			if (frontTemplateUse === 'Y') {
				frontTemplateColor = eBookData.template_color;

				$('.cover-front').addClass('type-width');

				if (frontTemplateColor === 'blue') {
					$('.cover-front').addClass('templateA');
				}

				if (frontTemplateColor === 'green') {
					$('.cover-front').addClass('templateB');
				}

				if (frontTemplateColor === 'yellow') {
					$('.cover-front').addClass('templateC');
				}
			} else {
				$('.cover-front').addClass('type-height');
			}

			$('.cover-front .inner').css('height', FRONT_HEIGHT);

			$coverFront.find('.series-img img').attr('src', frontSubImage);

			if (frontSubTitle !== undefined) {
				// 제목에 HTML태그 제거
				var frontSubTitleNew = frontSubTitle.replace(/(<([^>]+)>)/ig,' ');
			}

			// 서브제목 넘버 없을경우
			if(!frontTitleNumber) {
				$coverFront.find('.sub-title span').text(frontSubTitleNew);
			} else {
				$coverFront.find('.sub-title span').text(frontTitleNumber+'. '+frontSubTitleNew);
			}

			$('.cover-front .inner .series-img img').bind('load', function() {
				FRONT_IMG_WIDHT = $(this).width();
				FRONT_IMG_HEIGHT = $(this).height();
				FRONT_PADDING = (FRONT_HEIGHT - FRONT_IMG_HEIGHT) / 2;

				$('.cover-front .inner .series-img').css({ 'width' : EBOOK_WINDOW_WIDTH });
				if($('.cover-front').hasClass('type-height')){
					$('.cover-front .inner .series-img').css({ 'margin-top' : FRONT_PADDING });
				}
			});

			// 1_3번 #타이틀 사운드
			aid = randomString(),
			audioTitleHtml = "<audio id='myaudioTitle_" + aid + "' muted src='" + $("#titleAudioResource").val() + "' type='audio/mp3;'/>";

			// 시리즈 단편 구분
			if (frontSeriesYN !== undefined) {
				$coverFront.find('.series-title img').attr({
					'src': frontTitleImage,
					'alt': frontTitle
				});
			} else {
				$coverFront.find('.title').addClass('short');
				$coverFront.find('.series-title img').remove();
				$coverFront.find('.series-title').text(frontTitle);
				$coverFront.find('.sub-title').remove();
			}

			$('#titleAudioResource').val(frontTitleSound);
			$('#titleAudioPlay').html(audioTitleHtml);

			var audioTitlteId = document.getElementById('myaudioTitle_' + aid),
				audioTitleURL = document.getElementById('titleAudioResource');

			audioTitlteId.src = audioTitleURL.value;
			eFrontControl(audioTitlteId);
		};

		// 0번 #데이터로드
		ebookDataLoad = function(eBookData) {
			// console.log('#0번 #데이터로드');
			// console.log(eBookData);

			// - 초기화
			$('.inside .list').html('');
			$('#ebookWrap').attr('data-id', eBookData.id);
			$('#ebookWrap').attr('page_position', '0');
			$('#ebookWrap, .cover-front, .cover-back').css('height', EBOOK_WINDOW_HEIGHT);


			// - 표지에서 내지로 넘어갈때 이동UI Effect
			$('.cover-back').css('left', EBOOK_WINDOW_WIDTH);
			$('.inside').css('left', EBOOK_WINDOW_WIDTH);

			eFrontSet(eBookData);
			eInsideSet(eBookData);
			eBackSet(eBookData);
		};

		ebookDataLoad(eBookData);

		// ebook_coach_mark_status 쿠키 값이 Y일 경우 코칭마크 노출, N일 경우 노출하지 않음
		if ($.cookie('ebook_coach_mark_status') === undefined || $.cookie('ebook_coach_mark_status') === 'Y') {
			$('.coaching_marks').show();

			ebookWrap.eCoacingMark();
		} else {
			// 네이티브에 전달한 title mp3 재생 요청
			// if ($('html>head>meta[name=os_name]').attr('content') === 'iOS') {
			// 	webkit.messageHandlers.onInterfacePlaySound.postMessage(eBookData['title_sound_url']);
			// } else {
			// 	littlefoxJavaInterface.onInterfacePlaySound(eBookData['title_sound_url']);
			// }
		}
	}
}