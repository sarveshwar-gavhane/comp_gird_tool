define([], function() {

    function Comp_Grid_Tool() {
        this.xml = null;
        quizoneArray = new Array();
        this.container = null;
    }

    Comp_Grid_Tool.prototype = new Util();
    Comp_Grid_Tool.prototype.constructor = Comp_Grid_Tool;

    Comp_Grid_Tool.prototype.init = function(xmlName) {
        var ref = this;
        ref.container = this.getPageContainer();

        $(ref.container).find(".mcqBackBtn").click(function() {
            $(ref.container).html('').hide();
            $('.fixed_block').show();
            $('#shellContainer_content_box').removeClass('changingPadding');
        });

        $.ajax({
            type: "GET",
            url: "data/" + xmlName + ".xml",
            dataType: "xml",
            success: function(xml) {
                ref.xml = $(xml);
                ref.createMainHtml();
                ref.createMainClicks();
                ref.quiz1clickevent();
                ref.addResources();
                $(ref.container).find('#solutionPg_0').hide();
            }
        });
    }


    Comp_Grid_Tool.prototype.addResources = function() {
        if ($(this.xml).find('transcript').length > 0) {
            var transcriptText = $(this.xml).find('transcript').text();
            $(this.container).find('#contentTab_2').html(transcriptText)
        }
        if ($(this.xml).find('resources').length > 0) {
            var resourcesText = $(this.xml).find('resources').text();
            $(this.container).find('#contentTab_1').html(resourcesText)
        }
    }

    Comp_Grid_Tool.prototype.createMainHtml = function() {
        var obj = $(this.xml).find('window').find('competencyContent');
        var instruction = $(this.xml).find('mainWindow').find('instruction').text();
        var contexBoxLen = obj.find('contentBox').length;
        var str = '';
        this.temp = 0;
        this.count = 0;
        $(this.container).find('.main_window').find('#main_instructiontext').html(instruction);
        for (var i = 0; i < contexBoxLen; i++) {
            var contexLen = obj.find('contentBox').eq(i).find('content').length;

            str += "<div class=content_box id=conbox_" + i + "><table width=100% border=1 cellspacing=0 cellpadding=0>";
            for (var j = 0; j < contexLen; j++) {

                if (j == 0) {
                    str += "<tr><td width=52px>&nbsp;</td><td><h3><b>Competências</b></h3></td><td width=100px><h3><b> sim / não </b></h3></td></tr>"
                }

                str += "<tr id=wonequiz_" + this.temp + " class='wonequiz'>"
                this.count += 1;
                str += "<td width='52px' class='center-text'><h3>" + this.count + "</h3></td><td valign=top><div class=content></div></td>"
                str += "<td width=100px><div id=wonerBtn_" + this.temp + " class=rightBtn><img src=images/right_1.png></div><div id=wonewBtn_" + this.temp + " class=wrongBtn><img src=images/wrong_1.png></div></td>"
                this.temp += 1;
                str += "</tr>"
            }

            str += "</table>"
            var footer = obj.find('contentBox').eq(i).find('footer').text();
            str += footer;
            str += "</div>"
        }

        $(this.container).find('#windowcontent').find('.main_box').append(str);
    }

    Comp_Grid_Tool.prototype.createMainClicks = function() {
        var src = $(this.xml).find('window').find('stageSrc').text();
        var id = $(this.xml).find('window').find('stageId').text();
        $(this.container).find('.click').eq(id).css('cursor','pointer');
        $(this.container).find('#comp-grid-window').hide();
        $(this.container).find('.click').on('click', this.loadScreen.bind(this));
        $(this.container).find('.clickBox').find('.main_img img').attr('src', src);
    }

    Comp_Grid_Tool.prototype.loadScreen = function(event) {
        var screenId = $(event.currentTarget).attr('id').split('_')[1];
        var id = $(this.xml).find('window').find('stageId').text();
        if (screenId == id) {
            $(this.container).find('.main_window').hide();
            $(this.container).find('#comp-grid-window').show();
            this.createCompGridWindow(this.xml);
        }
    }

    Comp_Grid_Tool.prototype.createCompGridWindow = function(xml) {
        var $windowContent = $(this.container).find('#windowcontent');
        var windowInstruction = $(this.xml).find('window').find('windowInstruction').text();
        $(this.container).find('#comp-grid-window').find('#windowInstruction').html(windowInstruction);

        $(this.xml).find('window').find('competencyContent').find('content').each(function(index, element) {
            $('#comp-grid-window').find('#wonequiz_' + index).find('.content').html($(this).text())
        });

        for (var i = 0; i < $(this.xml).find('window').find('competencyContent').find('content').length; i++) {
            quizoneArray[i] = '-1';
        }

        $(this.container).find('#resultBox_0').html('');
        $(this.container).find('#resultPg_0').hide();
        $windowContent.show();

        $(this.container).find('.content_box').not('#conbox_0').hide();
        var len = $(this.container).find('.content_box').length;
        var heading = $(this.xml).find('window').find('resultContent').find('resultHeading').text();
        $windowContent.find('.pagination').html("1 of " + len);
        $windowContent.find('.heading_box').append(heading);

        var ref = this;
        this.enableNextContextBox(ref);
        this.enablePreviousContextBox(ref);
    }

    Comp_Grid_Tool.prototype.enablePreviousContextBox = function(ref) {
        $(ref.container).find('.backbtnClass').on('click', function(eve) {
            var id = $(eve.currentTarget).closest('.content_box').attr('id');
            var currentId = parseInt(id.split('_')[1]);
            var len = $('.content_box').length;
            $(ref.container).find('#comp-grid-window').find('.pagination').html(currentId + ' of ' + len);
            $(ref.container).find('#conbox_' + (currentId - 1)).show();
            $(ref.container).find('#conbox_' + currentId).hide();
        })
    }

    Comp_Grid_Tool.prototype.enableNextContextBox = function(ref) {
        $(ref.container).find('.nextbtnClass').on('click', function(eve) {
            var selectedLen = 0;
            var id = $(eve.currentTarget).closest('.content_box').attr('id');
            var currentId = parseInt(id.split('_')[1]);
            var len = $(ref.container).find('.content_box').length;

            $(ref.container).find('#' + id).find('.wonequiz').each(function(index, element) {
                if ($(this).find('.rightBtn').hasClass('selected') || $(this).find('.wrongBtn').hasClass('selected')) {
                    selectedLen++;
                }
            });

            var itemlength = $(ref.container).find('#' + id).find('.wonequiz').length
            if (selectedLen == itemlength) {
                $(ref.container).find('#comp-grid-window').find('.pagination').html((currentId + 2) + ' of ' + len)
                $(ref.container).find('#conbox_' + (currentId + 1)).show();
                $(ref.container).find('#conbox_' + currentId).hide();
            } else {
                ref.throwErrorMsg("errorContinueMessage");
            }
        })
    }

    Comp_Grid_Tool.prototype.quiz1clickevent = function() {
        var $item = $(this.container).find('#comp-grid-window');
        var $submit = $(this.container).find('.submitBtn');
        $item.find('.rightBtn').on('click', this.captureRightAnswer.bind(this));
        $item.find('.wrongBtn').on('click', this.captureWrongAnswer.bind(this));
        $submit.css('cursor', 'pointer').on('click', this.showAnswer.bind(this));
    }

    Comp_Grid_Tool.prototype.captureRightAnswer = function(event) {
        var $item = $(event.currentTarget);
        var clickedID = $item.attr('id').split('_')[1];
        $item.addClass('selected');
        $item.siblings('div').removeClass('selected');
        quizoneArray[clickedID] = true;
        $item.find('img').attr('src', 'images/right_3.png');
        $item.siblings('div').find('img').attr('src', 'images/wrong_3.png');
    }

    Comp_Grid_Tool.prototype.captureWrongAnswer = function(event) {
        var $item = $(event.currentTarget);
        var clickedID = $item.attr('id').split('_')[1];
        $item.addClass('selected');
        $item.siblings('div').removeClass('selected');
        quizoneArray[clickedID] = false;
        $item.find('img').attr('src', 'images/wrong_2.png');
        $item.siblings('div').find('img').attr('src', 'images/right_2.png');
    }

    Comp_Grid_Tool.prototype.showAnswer = function() {
        var counts = {};
        for (var i = 0; i < quizoneArray.length; i++) {
            var num = quizoneArray[i];
            counts[num] = counts[num] ? counts[num] + 1 : 1;
        }
        countwronganswer = counts[false];
        if ($.inArray('-1', quizoneArray) !== -1) {
            this.throwErrorMsg("errorMessage");
        } else if (countwronganswer > 3) {
            this.throwErrorMsg("errorWrongMessage");
        } else {
            this.submitAnswer();
        }
    }

    Comp_Grid_Tool.prototype.throwErrorMsg = function(err) {
        var errorText = $(this.xml).find('window').find(err).text();
        $(this.container).find('#errorBox_0').show();
        $(this.container).find('#errorBox_0').find('.errorMsg').html(errorText);

        var ref = this;
        $(this.container).find('.ok_btn').on('click', function() {
            $(ref.container).find('#errorBox_0').hide();
        });
    }

    Comp_Grid_Tool.prototype.submitAnswer = function() {
        var $resultItem = $(this.container).find('#resultPg_0');
        $(this.container).find('#windowcontent').hide();
        $resultItem.show();
        $resultItem.find('#resultinstruction').html($(this.xml).find('window').find('resultContent').find('resultInstruction').text());
        $resultItem.find('.heading_box').html($(this.xml).find('window').find('resultContent').find('resultHeading').text());

        $resultItem.find('#subheading').html($(this.xml).find('window').find('resultContent').find('resultSubHeading').text());

        if ($.inArray(false, quizoneArray) == -1) {
            $resultItem.find('#resultinstruction').html('<p class="desktop-ui">Dado que o Consultor não tem competências a serem melhoradas, seleccione na imagem do funil de vendas uma fase diferente do ciclo de vendas.</p> <p class="mobile-ui">Dado que o Consultor não tem competências a serem melhoradas, seleccione na imagem do funil de vendas uma fase diferente do ciclo de vendas.</p>')
            $resultItem.find('#subheading').html('Para esta fase do ciclo de vendas, o Consultor que está a analisar apresenta as competências necessárias.');
            window.shell.updateVisitedPages(globalCurTopic, globalCurPage);
            return;
        }
        for (var i = 0; i < quizoneArray.length; i++) {
            if (quizoneArray[i] == false) {
                this.createResultPage(i);
            }
        }

        var ref = this;
        $(this.container).find('#comp-grid-window').find('.waResultsolutionButton').on('click', function(event) {
            ref.solutionBox(event);
        });
    }

    Comp_Grid_Tool.prototype.createResultPage = function(iValue) {
        $('<div class="waResult" id="wonewaResult_' + iValue + '"></div>').appendTo('#resultBox_0');
        $('<div class="waResultIcon"></div>').appendTo("#wonewaResult_" + iValue).html('<img src="skin/wrong_2.png">');
        $('<div class="waResultText" id="waResultText_' + iValue + '"></div>').appendTo("#wonewaResult_" + iValue).html($(this.xml).find('window').find('competencyContent').find('content').eq(iValue).text());
        $('<div class="waResultsolutionButton" id="waResultbtn_' + iValue + '"></div>').appendTo("#wonewaResult_" + iValue).text('Soluções');
    }

    Comp_Grid_Tool.prototype.solutionBox = function(evt) {
        var $item = $(event.currentTarget);
        var solutionId = $item.attr('id').split('_')[1];
        $(this.container).find('#solutionPg_0').html('');
        $item.addClass('solutionCompleted');
        $(this.container).find('#resultPg_0').hide();
        $(this.container).find('#solutionPg_0').show();

        $('<div class="windowonesolutioninstructionClass" id="windowonesolutioninstruction"></div>').appendTo('#solutionPg_0').html($(this.xml).find('window').find('solutionInstruction').text());
        $('<div class="main_box" id="main_boxsolution"></div>').appendTo('#solutionPg_0');
        $('<div class="heading_box" id="heading_box"></div>').appendTo('#main_boxsolution').html($(this.xml).find('window').find('solutionContent').find('solutionBoxHeading').text());
        $('<div class="subHeadingText" id="subheading"></div>').appendTo('#main_boxsolution').html($(this.xml).find('window').find('solutionContent').find('solutionSubHeading').text());
        $('<div class="rsultBoxClass" id="solutionBox_0"></div>').appendTo('#main_boxsolution');
        $('<div class="waSolutionText" id="waResultbtn_' + solutionId + '"></div>').appendTo('#solutionBox_0').html($(this.xml).find('window').find('solutionContent').find('solution').eq(solutionId).text());
        $('<div class="footerClass" id="wonefooter"></div>').appendTo('#solutionBox_0').html('');
        $('<div class="backbtnClass" id="woneback_btn"></div>').appendTo('#wonefooter').html('Voltar');

        $('.backbtnClass').on('click', this.wonegobackscreen.bind(this));
        this.checkCompletion();
    }

    Comp_Grid_Tool.prototype.checkCompletion = function() {
        var solutionsLength = $(this.container).find('.waResult').length;
        var completedLength = $(this.container).find('.solutionCompleted').length;
        if (solutionsLength === completedLength)
            window.shell.updateVisitedPages(globalCurTopic, globalCurPage);
    }

    Comp_Grid_Tool.prototype.wonegobackscreen = function() {
        $(this.container).find('#resultPg_0').show();
        $(this.container).find('#solutionPg_0').hide();
    }

    return Comp_Grid_Tool;
});
