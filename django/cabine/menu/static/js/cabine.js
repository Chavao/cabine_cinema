var fazendo_contagem_regressiva = false;
var contagem;
var radius = 40;
var intervalo_start = 3;
var fps = 25;
var intervalo_iterator = 1;
var origin = [ 50, 50 ];
var speed = 1;
var intervalo_iterator_max = fps * intervalo_start;

$(document).ready(function() {

	$('.accordion > h3').click(function() {
        var button = $(this).find('div');
        if (button.hasClass('ocultar')) {
            button.removeClass('ocultar').addClass('exibir').parents('h3').next().slideUp();
        } else {
            button.removeClass('exibir').addClass('ocultar').parents('h3').next().slideDown();
        }
    });
    
	$('.adicionar').click(function() {
		
		var clip_id = $(this).data('clipid');
		
		for (var i=1; i<3; i ++) {
		
			if ($('#proximo_'+i).data('clip') == 0) {
				
				coloca_filme_na_caixa('#proximo_'+i, clip_id);
				break;
			}
		
		}
		return false;
	});
	
	$('.em-breve').click(function() {
		var id = $(this).attr('id').replace('proximo_', '');
		
        if ($(this).data('clip') > 0)
            $('#remover_'+id).fadeIn();
		
		return false;
	});
	
	$('.remover a').click(function() {
		$(this).parents('.remover').hide();
		
		if ($(this).hasClass('sim')) {
			var posicao = $(this).parents('.remover').attr('id').replace('remover_', '');
			remover_da_fila(posicao);
		}
		
		
		return false;
	
	});
	
	$('#contador_pause').click(function() {
		clearTimeout(contagem);
		$(this).hide();
		$('#contador_play').show();
	});
	
	$('#contador_play').click(function() {
		contagem_regressiva();
		$(this).hide();
		$('#contador_pause').show();
	});
	
	$('#contador_skip').click(function() {
		fazendo_contagem_regressiva = false;
		clearTimeout(contagem);
		anda_fila_e_toca_video();
	});
	
	$('.openpopup').click(function() {
		
        var pop = $(this).attr('id').replace('-button', '');
        var is_opened = $('#popup-'+pop).is(':visible');
        
        $('.popup').hide();
        $('.openpopup').removeClass('ativo');
        
        if (is_opened)
            return;
        
		$(this).addClass('ativo');
		$('#popup-'+pop).fadeIn('fast');
	});
	
	$('.fechar').click(function() {
		$('.popup').fadeOut('fast', function() {
            $('.openpopup').removeClass('ativo');
        });
		
	});
	
	
	/** scroll **/
	
	$('#cenas').mousedown(function(){
		$('#selecao').hide();
	}).mouseup(function(){
		$('#selecao').fadeIn('fast');
	}).mouseleave(function(){
		$('#selecao').fadeIn('fast');
	});
	
	var fichas_interval;
	var cenas_interval;
	var timeout_delay = 10;
	
	var $sbar = $('#scroll-handler');
	var sbar = $sbar.parent().height() - $sbar.height();
	
	$(document.body).disableSelection();
	
	$('#cenas-content').data('selected-clip',0);
	
	$('#cenas-content img').click(function(){
		var h = 168;
		var i = $(this).data('clipid')-1;
		var top = (-i*h);
		
		clearInterval(fichas_interval);
		$('#cenas-content').stop().animate({top: top},'slow');
		$('#cenas-content').data('selected-clip',i);
	});
	
	$("#fichas").jScroll({
		hScroll: false,
		vScrollbar: false,
		useTransform: false,
		
		onScrollStart: function(){
			clearInterval(fichas_interval);
			clearInterval(cenas_interval);
			
			var height = $('#fichas-content').outerHeight() - $('#fichas').height();
			var _height = $('#cenas-content').outerHeight() - $('#cenas').height();
			
			fichas_interval = setInterval(function(){
				var scroll = parseInt(document.getElementById('fichas-content').style.top);
				var p = scroll/height;
				var t = _height*p
				
				$sbar.css('top',-sbar*p);
				document.getElementById('cenas-content').style.top = t+'px';
			}, timeout_delay);
		},
		onScrollEnd: function(){
			var h = 620;
			var scroll = parseInt($('#fichas-content').css('top'));
			var i = Math.round(scroll/h);
			var snap = i*h;
			$('#cenas-content').data('selected-clip',-i);
			if(snap != scroll){
				$('#fichas-content').animate({top:snap},'slow',function(){
					clearInterval(fichas_interval);
				});
			}else{
				clearInterval(fichas_interval);
			}
		}
	});
	
	
	$("#cenas").jScroll({
		hScroll: false,
		vScrollbar: false,
		useTransform: false,

		onScrollStart: function(){
			clearInterval(cenas_interval);
			clearInterval(fichas_interval);
			var height = $('#cenas-content').outerHeight() - $('#cenas').height();
			var _height = $('#fichas-content').outerHeight() - $('#fichas').height();
			
			cenas_interval = setInterval(function(){
				var scroll = parseInt(document.getElementById('cenas-content').style.top);
				var p = scroll/height;
				var t = _height*p
				$sbar.css('top',-sbar*p);
				document.getElementById('fichas-content').style.top = t+'px';
			}, timeout_delay);
		},
		onScrollEnd: function(){
			var h = 168;
			var scroll = parseInt($('#cenas-content').css('top'));
			var i = Math.round(scroll/h);
			$('#cenas-content').data('selected-clip',-i);
			$('#cenas-content').animate({top:(i*h)},'slow',function(){
				clearInterval(cenas_interval);
				
			});
		}
	});
	
	$('#scroll-up').click(function(){
		var i = $('#cenas-content').data('selected-clip') -1;
		i = i >= 0 ? i : 0;
		var h = 168;
		clearInterval(fichas_interval);
		$('#cenas-content').stop().animate({top:(-i*h)},'slow');
		$('#cenas-content').data('selected-clip',i);
	});
	
	$('#scroll-down').click(function(){
		var i = $('#cenas-content').data('selected-clip') +1;
		console.log(i);
		i = i >= 0 ? i : 0;
		var h = 168;
		clearInterval(fichas_interval);
		clearInterval(fichas_interval);
		$('#cenas-content').stop().animate({top:(-i*h)},'slow');
		$('#cenas-content').data('selected-clip',i);
	});
});
	


function monitorar_fila() {
	//console.log('monitorando');
	// faz um ajax e checa um arquivo de texto pra saber se tem algo tocando

    $.ajax({
        type: 'GET',
        url: '/status/',
        success: function(data){
            playing_status = data;
            if (playing_status == "idle"){
                playing = false;
            }else{
                playing = true;
            }


            console.log(playing,fazendo_contagem_regressiva );
            // se não tem nada tocando
            if (!playing && !fazendo_contagem_regressiva) {

                // se tiver algo na fila
                if ( $('#proximo_1').data('clip') != 0) {

                    // carrega contagem regressiva
                    $('#tocando').hide();
                    $('#intervalo').show();


                    // inicializa contagem regressiva
                    inicia_contagem_regressiva();


                } else {
                    // se não tiver nada na fila
                    //console.log('nada na fila');
                    // carrega interface vazia
                    carrega_caixas_vazias();
                }
            }


        },
    });


}

function carrega_caixas_vazias() {

	
	coloca_filme_na_caixa('#proximo_1', 0);
	coloca_filme_na_caixa('#proximo_2', 0);
	coloca_filme_na_caixa('#tocando', 0);

}

function anda_fila_e_toca_video() {

	// se tiver algo na fila
	if ( $('#proximo_1').data('clip') != 0) {
		
		$('.remover').hide();
		
		// movimenta os videos na fila
		coloca_filme_na_caixa('#tocando', $('#proximo_1').data('clip'));
		coloca_filme_na_caixa('#proximo_1', $('#proximo_2').data('clip'));
		coloca_filme_na_caixa('#proximo_2', 0);
		
		// dá o play no ajax

        $.ajax({
            type: 'GET',
            url: '/enqueue/'+$("#tocando").data('clip'),
        });
		// Não esquecer de no ajax fazer a contagem dos plays! 
		// Temos que fazer uma tabela de log com hora e play de todos os videos
		
		$('#intervalo').hide();
		$('#tocando').show();
	
	
	} else {
	// se não tiver nada na fila
	
		// carrega interface vazia
		carrega_caixas_vazias();
	}

}

function inicia_contagem_regressiva() {
	
	fazendo_contagem_regressiva = true;
	$('#contador_pause').show();
	$('#contador_play').hide();
	
	//reseta o contador
    intervalo_iterator = 0;
	$('#contador').html(intervalo_start);
    
	drawCircle(0);
	// seta o timeout
	contagem = setTimeout('contagem_regressiva()', 1000/(fps*speed));
	
}

function contagem_regressiva() {

	
    intervalo_iterator = (intervalo_iterator + 1) % intervalo_iterator_max;
    
    drawCircle(intervalo_iterator);
    
    var c = parseInt($('#contador').html());
    
    if (intervalo_iterator % fps == 0) {
        
	    c --;
        $('#contador').html(c);
    }
    
    
	
	// se for zero
	if (c == 0) {
		fazendo_contagem_regressiva = false;
		anda_fila_e_toca_video();
		clearTimeout(contagem);
	} else {
		contagem = setTimeout('contagem_regressiva()', 1000/(speed*fps));
	}

}

function drawCircle(secs) {
    
    var start = position(-Math.PI/2)
    var angle = 2 * Math.PI * secs / intervalo_iterator_max - Math.PI/2
    var end = position(angle)

    var orig = origin.join(' ')
    var rad = radius + ' ' + radius
    start = start.join(' ')
    end = end.join(' ')

    var flag = secs < intervalo_iterator_max/2 ? 0 : 1

    $('#clock').attr('d', 'M ' + orig + ' L ' + start + ' A ' + rad + ' 0 ' + flag + ' 1 ' + end + ' Z')
}

function position(angle) {
    return [ origin[0] + Math.cos(angle) * radius,
	     origin[1] + Math.sin(angle) * radius
	   ]
}

// pasando 0 como clip_id vc vai deixar a caixa vazia
function coloca_filme_na_caixa(caixa, clip_id) {
	
	$(caixa).data('clip', clip_id );
	
	if (clip_id > 0) {
	
		var imgsrc = '/static/thumbs/'+clip_id+'-medio.jpg';
		
		// se nao existir imagem, cria
		if ( $(caixa + ' > img').length == 0)
			$(caixa + ' > h2').after('<img />');
		
		$(caixa + ' > img').attr('src', imgsrc);
		
		if ( $(caixa + ' > p').length == 1)
			$(caixa + ' > p').remove(); //Selecione uma cena ao lado
		
		$(caixa).removeClass('vazio').addClass('ocupado');
		
	} else {
		if ( $(caixa + ' > img').length == 1)
			$(caixa + ' > img').remove();
		
		if ( $(caixa + ' > p').length == 0)	
			$(caixa + ' > h2').after('<p>Selecione uma cena ao lado</p>');
		
		$(caixa).removeClass('ocupado').addClass('vazio');

        $('.adicionar').removeClass('adicionar-inativo');
	}
    
    if (caixa == '#proximo_2' && clip_id > 0) {
        $('.adicionar').addClass('adicionar-inativo');
    }
	
}



function remover_da_fila(posicao) {

	coloca_filme_na_caixa('#proximo_'+posicao, 0);
	
	if (posicao == 1) {
		coloca_filme_na_caixa('#proximo_1', $('#proximo_2').data('clip'));
		coloca_filme_na_caixa('#proximo_2', 0);
	}
	
}


window.setInterval('monitorar_fila()', 1000);
