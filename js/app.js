$(function () {
  function onlyDigits(s){return (s||'').toString().replace(/\D/g,'')}
  function formatCEP(d){return d.replace(/(\d{5})(\d{3})/,'$1-$2')}
  function toFixed2(v){const n=parseFloat(v||0);return isNaN(n)?'0.00':n.toFixed(2)}

  function maskCNPJ(v){
    v = onlyDigits(v).slice(0,14)
    v = v.replace(/^(\d{2})(\d)/,'$1.$2')
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3')
    v = v.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/,'$1.$2.$3/$4')
    v = v.replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/,'$1.$2.$3/$4-$5')
    return v
  }
  function maskPhone(v){
    v = onlyDigits(v).slice(0,11)
    if(v.length>10) return v.replace(/^(\d{2})(\d{5})(\d{0,4}).*/,'($1) $2-$3')
    if(v.length>6)  return v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/,'($1) $2-$3')
    if(v.length>2)  return v.replace(/^(\d{2})(\d+)/,'($1) $2')
    return v
  }

  $('#cnpj').on('input',function(){ this.value = maskCNPJ(this.value) })
  $('#telefone').on('input',function(){ this.value = maskPhone(this.value) })
  $('#numero').on('input',function(){ this.value = onlyDigits(this.value).slice(0,6) })
  $('#ie').on('input',function(){ this.value = onlyDigits(this.value).slice(0,14) })
  $('#im').on('input',function(){ this.value = onlyDigits(this.value).slice(0,14) })

  $('#cep').on('input',function(){ this.value = onlyDigits(this.value).slice(0,8) })
  $('#cep').on('blur',function(){
    const cep = onlyDigits(this.value)
    if(cep.length!==8) return
    $.getJSON('https://viacep.com.br/ws/'+cep+'/json/',function(d){
      if(d && !d.erro){
        $('#cep').val(formatCEP(cep))
        $('#logradouro').val(d.logradouro||'')
        $('#bairro').val(d.bairro||'')
        $('#municipio').val(d.localidade||'')
        $('#uf').val(d.uf||'')
        $('#complemento').val(d.complemento||'')
      }
    })
  })

  function sanitizeNum(v){
    v=(v||'').toString().replace(',','.').replace(/[^0-9.]/g,'')
    const p=v.indexOf('.'); if(p!==-1) v=v.slice(0,p+1)+v.slice(p+1).replace(/\./g,'')
    if(v.startsWith('.')) v='0'+v
    return v
  }
  function recalc($item){
    const q = parseFloat($item.find('.qtd').val()||'0')||0
    const v = parseFloat($item.find('.vu').val()||'0')||0
    $item.find('.vt').val((q*v).toFixed(2))
  }
  $(document).on('input','.product-item .qtd, .product-item .vu',function(){
    this.value = sanitizeNum(this.value)
    recalc($(this).closest('.product-item'))
  })
  $(document).on('blur','.product-item .qtd, .product-item .vu',function(){
    const n = Math.max(0, parseFloat(this.value||'0')||0)
    this.value = toFixed2(n)
    recalc($(this).closest('.product-item'))
  })
  $('.product-item').each(function(){ recalc($(this)) })

  function renumerar(){
    $('.product-item').each(function(i){
      $(this).find('.product-item__header').text('Produto - ' + (i+1))
    })
  }
  $('.product-add').on('click',function(){
    const $body = $(this).closest('.panel-block__body')
    const $ref = $body.find('.product-item').first()
    const $novo = $ref.clone(true, true)
    $novo.find('input').val('')
    $novo.find('select').prop('selectedIndex',0)
    $novo.find('.vt').val('0.00')
    $novo.insertBefore($(this))
    renumerar()
  })
  $(document).on('click','.product-item .btn-danger',function(){
    if($('.product-item').length<=1) return
    $(this).closest('.product-item').remove()
    renumerar()
  })

  const ATT_KEY='vflows_anexos'
  function getAnexos(){const r=sessionStorage.getItem(ATT_KEY);return r?JSON.parse(r):[]}
  function setAnexos(a){sessionStorage.setItem(ATT_KEY,JSON.stringify(a))}
  function rowHTML(a){
    return '<div class="attachment-row" data-id="'+a.id+'">'+
      '<div class="attachment-actions">'+
      '<button type="button" class="btn btn-danger btn-xs attachment-btn" data-act="del"><span class="glyphicon glyphicon-trash"></span></button>'+
      '<button type="button" class="btn btn-info btn-xs attachment-btn" data-act="view"><span class="glyphicon glyphicon-eye-open"></span></button>'+
      '</div>'+
      '<div class="attachment-name">'+a.nome+'</div>'+
      '</div>'
  }
  function renderAnexos(){
    const items=getAnexos()
    $('#attachmentsList').html(items.map(rowHTML).join(''))
  }
  function fileToDataUrl(file){
    return new Promise((res,rej)=>{
      const r=new FileReader()
      r.onerror=rej
      r.onload=()=>res({id:'a_'+Date.now()+'_'+Math.random().toString(16).slice(2),nome:file.name,mime:file.type||'application/octet-stream',tamanho:file.size,dataUrl:r.result})
      r.readAsDataURL(file)
    })
  }
  $('.attachments-add').on('click',function(){ $('#attachInput').click() })
  $('#attachInput').on('change',function(e){
    const files=Array.from(e.target.files||[])
    if(!files.length) return
    Promise.all(files.map(fileToDataUrl)).then(novos=>{
      const atual=getAnexos()
      setAnexos(atual.concat(novos))
      renderAnexos()
      $('#attachInput').val('')
    })
  })
  $(document).on('click','.attachment-btn',function(){
    const act=$(this).data('act')
    const id=$(this).closest('.attachment-row').data('id')
    const arr=getAnexos()
    const item=arr.find(x=>x.id===id)
    if(!item) return
    if(act==='view'){
      const a=document.createElement('a')
      a.href=item.dataUrl
      a.download=item.nome
      document.body.appendChild(a)
      a.click()
      a.remove()
    }
    if(act==='del'){
      setAnexos(arr.filter(x=>x.id!==id))
      renderAnexos()
    }
  })
  renderAnexos()

  function validarProdutos(){
    const $itens = $('.product-item')
    if($itens.length===0) return {ok:false,msg:'Inclua ao menos 1 produto.'}

    for(let i=0;i<$itens.length;i++){
      const $p = $($itens[i])
      const idx = i+1
      const $desc = $p.find('.desc')
      const $un   = $p.find('.un')
      const $qtd  = $p.find('.qtd')
      const $vu   = $p.find('.vu')

      if(!$desc.val() || !$desc.val().trim()){
        $desc.focus(); return {ok:false,msg:'Preencha a descrição do Produto - '+idx}
      }
      if(!$un.val()){
        $un.focus(); return {ok:false,msg:'Selecione a unidade no Produto - '+idx}
      }
      const qtd = parseFloat($qtd.val()||'0')
      if(!(qtd>0)){
        $qtd.focus(); return {ok:false,msg:'Quantidade deve ser maior que 0 no Produto - '+idx}
      }
      const vu = parseFloat($vu.val()||'0')
      if(!(vu>0)){
        $vu.focus(); return {ok:false,msg:'Valor unitário deve ser maior que 0 no Produto - '+idx}
      }
    }
    return {ok:true}
  }

  function coletarProdutos(){
    const out=[]
    $('.product-item').each(function(){
      const $p=$(this)
      out.push({
        descricao:($p.find('.desc').val()||'').trim(),
        unidade:($p.find('.un').val()||'').trim(),
        quantidade:parseFloat($p.find('.qtd').val()||0)||0,
        valorUnitario:parseFloat($p.find('.vu').val()||0)||0,
        valorTotal:parseFloat($p.find('.vt').val()||0)||0
      })
    })
    return out
  }

  function baixarJSON(obj,nome){
    const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json;charset=utf-8'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a')
    a.href=url
    a.download=nome
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    a.remove()
  }

  $('.save-form').on('click',function(){
    const temAnexo=getAnexos().length>0
    if(!temAnexo){alert('Inclua ao menos 1 anexo.');return}

    const vp = validarProdutos()
    if(!vp.ok){ alert(vp.msg); return }

    const formOK=document.getElementById('form-fornecedor').checkValidity()
    if(!formOK){ document.getElementById('form-fornecedor').reportValidity(); return }

    $('#modalLoading').modal('show')

    const payload={
      fornecedor:{
        razaoSocial:$('#razaoSocial').val().trim(),
        nomeFantasia:$('#nomeFantasia').val().trim(),
        cnpj:onlyDigits($('#cnpj').val().trim()),
        inscricaoEstadual:onlyDigits($('#ie').val().trim())||null,
        inscricaoMunicipal:onlyDigits($('#im').val().trim())||null,
        endereco:{
          cep:$('#cep').val().trim(),
          logradouro:$('#logradouro').val().trim(),
          numero:onlyDigits($('#numero').val().trim()),
          bairro:$('#bairro').val().trim(),
          municipio:$('#municipio').val().trim(),
          uf:$('#uf').val().trim(),
          complemento:$('#complemento').val().trim()||null
        },
        contato:{
          nome:$('#contato').val().trim(),
          telefone:onlyDigits($('#telefone').val().trim()),
          email:$('#email').val().trim()
        }
      },
      produtos:coletarProdutos(),
      anexos:getAnexos().map(a=>({nome:a.nome,mime:a.mime,tamanho:a.tamanho,base64:a.dataUrl}))
    }

    setTimeout(function(){
      console.log('JSON DE ENVIO:',payload)
      baixarJSON(payload,'fornecedor_'+Date.now()+'.json')
      $('#modalLoading').modal('hide')
      alert('Dados preparados com sucesso.')
    },700)
  })
})

