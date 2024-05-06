//////////////////////////////////////////////////////////////////////////
// The LearnCNC Game lesson browser.
// 
// This source code is licensed under the LGPL.
// 
// Please keep this header intact when redistributing 
// original/modified code.
//
// Author: Nikita Donets
// LearnCNC.org
//////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////
// Constants and Global Variables
/////////////////////////////////////////////////////////////

var curLesson = -1;
var curPage = -1;
var numPagesInLesson = -1;
var isInGame = ( window.Client != undefined ) ? true : false;

/////////////////////////////////////////////////////////////
// Functions
/////////////////////////////////////////////////////////////

$(function()
{
	var closeIcon = $("#close_icon");
	if( !isInGame )
	{
		closeIcon.remove();
	}
	else
	{
		closeIcon.click( onCloseIconClick );
	}
	
	var lesson = jQuery.url.param( "lesson" );
	curLesson = new Number(( lesson != undefined ) ? lesson : 0);
	
	var page = jQuery.url.param( "page" );
	curPage = new Number(( page != undefined ) ? page : 1);
	
	numPagesInLesson = LESSON_LENGTHS[curLesson];
	
	initLessonList();
	
	var lessonUrl = "lessons/lesson" + curLesson + "_page" + curPage + ".html";
	includePage( lessonUrl, "lesson_content", ijsParser );
	
	pastePageBarInto( "#top_page_bar" );
	pastePageBarInto( "#bot_page_bar" );
});

function initLessonList()
{
	for( var lesson = 0; lesson < NUM_LESSONS; ++lesson )
	{
		var lessonLink = $( "#lesson" + lesson + "_link" );
		
		if( true )
		{
			lessonLink.addClass( "completed" );
		}
		
		if( lesson == curLesson )
		{
			lessonLink.addClass( "current" );	
		}
	}
}
	
function pastePageBarInto( divId )
{
	var content = '<span>Lesson ' + curLesson + ', Page ' + curPage + ' of ' + numPagesInLesson + '</span>';
	
	if( curPage == 1 && curLesson > 0 )
	{
		var prevLessonLen = LESSON_LENGTHS[curLesson-1];
		content += '<a class="prev_lesson" title="" href="index.html?lesson=' + (curLesson-1) + '&page=' + prevLessonLen + '">&laquo; Previous Lesson</a>';
	}
	
	if( curPage > 1 )
	{
		content += '<a class="prev_page" title="" href="index.html?lesson=' + curLesson + '&page=' + (curPage - 1) + '">&laquo; Previous Page</a>';
	}
	
	if( curPage < numPagesInLesson )
	{
		content += '<a class="next_page" title="" href="index.html?lesson=' + curLesson + '&page=' + (curPage + 1) + '">Next Page &raquo;</a>';
	}
	
	if( curPage == numPagesInLesson && curLesson < (NUM_LESSONS-1) )
	{
		content += '<a class="next_page" title="" href="index.html?lesson=' + (curLesson+1) + '&page=' + 1 + '">Next Lesson &raquo;</a>';
	}
	
	$(divId).html( content );
}

function onCloseIconClick()
{
	window.location.reload();
	Client.closeBrowserWindow();
}

function ijsParser( content )
{
	content = content.replace( /<\?ijs ?insertVideo\( ?["'](.*?)["'], ?["'](.*?)["'] ?\);? ?\?>/g, insertVideo );
	content = content.replace( /<\?ijs ?insertImage\( ?["'](.*?)["'], ?["'](.*?)["'] ?\);? ?\?>/g, insertImage );
	return content;
}

function insertVideo( matchedStr, videoFile, caption )
{
	var lastDotIdx = videoFile.lastIndexOf( "." );
	var videoName = videoFile.substring( 0, lastDotIdx );
	var vidDivId = videoName + "_vid";
	var playerId = vidDivId + "_player";
	
	var content = "";
	
	content += '<div class="media_box_wrap">';
	content += '<div class="video_box">';
	content += '<div class="video_content" id="' + vidDivId + '">';
	content += '<embed name="' + playerId + '" id="' + playerId + '" height="436" width="560" flashvars="file=../../lessons/movies/' + videoFile + '" wmode="opaque" allowscriptaccess="always" allowfullscreen="false" quality="high" bgcolor="#ffffff" src="external_libs/swf_player/player.swf" type="application/x-shockwave-flash"/>';
	
    content += '</div>';
         
    content += '<div class="caption">';
	content += caption;
	content += '</div>';
	content += '</div>';
	content += '</div>';
	
	return content;
}

function onZoomInVideo( videoFile, playerDiv )
{
	// This does not work offline due to security policy of Flash content!!
	//document.getElementById( playerDiv ).sendEvent( "PLAY", "false" );
	
	Shadowbox.open(
	{
		player: 'swf',
		content: 'external_libs/swf_player/player.swf',
		options: 
		{
			flashParams: { height: 440, width: 500, wmode: 'opaque', allowscriptaccess: 'always', allowfullscreen: 'false', quality: 'high', bgcolor: '#ffffff'},
			flashVars: {file: '../../lessons/movies/' + videoFile},
		},
		height: 440,
		width: 560
	});
}

function insertImage( matchedStr, imageFile, caption )
{
	var content = "";
	
	content += '<div class="media_box_wrap">';
	content += '<div class="image_box">';
	content += '<img src="lessons/images/' + imageFile + '" />';
	content += '<div class="caption">';
	content += caption;
    content += '</div>';            
	content += '</div>';
	content += '</div>';
	
	return content;
}

function includePage(url, id, ijsParserFunc)
{
	var req = false;
	// For Safari, Firefox, and other non-MS browsers
	if (window.XMLHttpRequest) 
	{
		try 
		{
			req = new XMLHttpRequest();
		} 
		catch (e) 
		{
			req = false;
		}
	}
	else if (window.ActiveXObject) 
	{
		// For Internet Explorer on Windows
		try 
		{
			req = new ActiveXObject("Msxml2.XMLHTTP");
		} 
		catch (e) 
		{
			try 
			{
				req = new ActiveXObject("Microsoft.XMLHTTP");
			} 
			catch (e) 
			{
				req = false;
			}
		}
	}
	if (req) 
	{
		// send out the response
		req.open('GET', url, false);
		req.send(null);
		
		// parse the inline JS language
		var pageContent = ijsParserFunc ? ijsParserFunc(req.responseText) : req.responseText;
		
		// if the optional 'id' element is present, insert returned text into it, otherwise write to the page wherever it was called
		document.getElementById(id) ? document.getElementById(id).innerHTML = pageContent : document.write(pageContent);
	}
	else 
	{
		document.write('This browser does not support XMLHTTPRequest objects which are required for this page to work');
	}
}
