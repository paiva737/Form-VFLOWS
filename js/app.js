$(function () {
  function onlyDigits(s){return s.replace(/\D/g,'')}
  function formatCEP(d){return d.replace(/(\d{5})(\d{3})/,'$1-$2')}

  $('#cep').on('input',function(){
    this.value = onlyDigits(this.value).slice(0,8)
  })

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

  function recalc($item){
    const q = parseFloat($item.find('.qtd').val()||'0')
    const v = parseFloat($item.find('.vu').val()||'0')
    $item.find('.vt').val((q*v).toFixed(2))
  }

  $(document).on('input','.product-item .qtd, .product-item .vu',function(){
    recalc($(this).closest('.product-item'))
  })

  $('.product-item').each(function(){ recalc($(this)) })

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

  function coletarProdutos(){
    const out=[]
    $('.product-item').each(function(){
      const $p=$(this)
      out.push({
        descricao:($p.find('.desc').val()||'').trim(),
        unidade:($p.find('.un').val()||'').trim(),
        quantidade:Number($p.find('.qtd').val()||0),
        valorUnitario:Number($p.find('.vu').val()||0),
        valorTotal:Number($p.find('.vt').val()||0)
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
    const produtos=coletarProdutos()
    const temProduto=produtos.length>0
    const formOK=document.getElementById('form-fornecedor').checkValidity()
    if(!formOK||!temProduto||!temAnexo){alert('Preencha os obrigatórios, inclua ao menos 1 produto e 1 anexo.');return}
    $('#modalLoading').modal('show')
    const payload={
      fornecedor:{
        razaoSocial:$('#razaoSocial').val().trim(),
        nomeFantasia:$('#nomeFantasia').val().trim(),
        cnpj:$('#cnpj').val().trim(),
        inscricaoEstadual:$('#ie').val().trim()||null,
        inscricaoMunicipal:$('#im').val().trim()||null,
        endereco:{
          cep:$('#cep').val().trim(),
          logradouro:$('#logradouro').val().trim(),
          numero:$('#numero').val().trim(),
          bairro:$('#bairro').val().trim(),
          municipio:$('#municipio').val().trim(),
          uf:$('#uf').val().trim(),
          complemento:$('#complemento').val().trim()||null
        },
        contato:{
          nome:$('#contato').val().trim(),
          telefone:$('#telefone').val().trim(),
          email:$('#email').val().trim()
        }
      },
      produtos:produtos,
      anexos:getAnexos().map(a=>({nome:a.nome,mime:a.mime,tamanho:a.tamanho,base64:a.dataUrl}))
    }
    setTimeout(function(){
      console.log('JSON DE ENVIO:',payload)
      baixarJSON(payload,'fornecedor_'+Date.now()+'.json')
      $('#modalLoading').modal('hide')
      alert('Dados preparados com sucesso.')
    },800)
  })
})
